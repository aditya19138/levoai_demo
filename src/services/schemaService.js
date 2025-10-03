const db = require('../models/database');
const Application = require('../models/application');
const Service = require('../models/service');
const SchemaVersion = require('../models/schemaVersion');
const ValidationService = require('./validationService');
const storageService = require('./storageService');
// const { generateChecksum } = require('../utils/checksumHelper');

class SchemaService {
    async importSchema(applicationName, serviceName, specContent, format) {
        // Validate the OpenAPI spec
        const validation = await ValidationService.validateOpenAPISpec(
            specContent,
            format
        );

        if (!validation.valid) {
            throw new Error(
                `Invalid OpenAPI specification: ${validation.errors
                    .map(e => e.message)
                    .join(', ')}`
            );
        }

        // Generate checksum
        // const checksum = generateChecksum(specContent);

        // Use transaction for atomic operations
        return db.transaction(() => {
            // Find or create application
            const app = Application.findOrCreate(applicationName);

            // Find or create service (if provided)
            let service = null;
            let serviceId = null;
            if (serviceName) {
                service = Service.findOrCreate(serviceName, app.id);
                serviceId = service.id;
            }

            // Check if this exact schema already exists
            // const existingSchema = SchemaVersion.findByChecksum(
            //     app.id,
            //     serviceId,
            //     checksum
            // );

            // if (existingSchema) {
            //     return {
            //         duplicate: true,
            //         version: existingSchema.version,
            //         message: 'Identical schema already exists',
            //         data: existingSchema
            //     };
            // }

            // Get next version number
            const nextVersion = SchemaVersion.getNextVersion(app.id, serviceId);

            // Save file to storage
            const relativePath = storageService.saveSchema(
                specContent,
                applicationName,
                serviceName,
                nextVersion,
                format
            );

            // Mark previous versions as not latest
            SchemaVersion.markPreviousAsNotLatest(app.id, serviceId);


            // Create new schema version record
            const newVersion = SchemaVersion.create({
                application_id: app.id,
                service_id: serviceId,
                version: nextVersion,
                file_path: relativePath,
                file_format: format,
                is_latest: true
            });

            return {
                application: applicationName,
                service: serviceName,
                version: newVersion.version,
                format: newVersion.file_format,
                created_at: newVersion.created_at
            };
        })();
    }

    getLatestSchema(applicationName, serviceName = null) {
        const app = Application.findByName(applicationName);
        if (!app) {
            throw new Error(`Application '${applicationName}' not found`);
        }

        let serviceId = null;
        if (serviceName) {
            const service = Service.findByNameAndApp(serviceName, app.id);
            if (!service) {
                throw new Error(
                    `Service '${serviceName}' not found in application '${applicationName}'`
                );
            }
            serviceId = service.id;
        }

        const schemaVersion = SchemaVersion.getLatest(app.id, serviceId);
        if (!schemaVersion) {
            throw new Error('No schema versions found');
        }

        const content = storageService.readSchema(schemaVersion.file_path);

        return {
            application: applicationName,
            service: serviceName,
            version: schemaVersion.version,
            format: schemaVersion.file_format,
            spec: content,
            created_at: schemaVersion.created_at
        };
    }

    getSchemaByVersion(applicationName, serviceName = null, version) {
        const app = Application.findByName(applicationName);
        if (!app) {
            throw new Error(`Application '${applicationName}' not found`);
        }

        let serviceId = null;
        if (serviceName) {
            const service = Service.findByNameAndApp(serviceName, app.id);
            if (!service) {
                throw new Error(
                    `Service '${serviceName}' not found in application '${applicationName}'`
                );
            }
            serviceId = service.id;
        }

        const schemaVersion = SchemaVersion.getByVersion(app.id, serviceId, version);
        if (!schemaVersion) {
            throw new Error(`Version ${version} not found`);
        }

        const content = storageService.readSchema(schemaVersion.file_path);

        return {
            application: applicationName,
            service: serviceName,
            version: schemaVersion.version,
            format: schemaVersion.file_format,
            spec: content,
            created_at: schemaVersion.created_at
        };
    }

    listVersions(applicationName, serviceName = null) {
        const app = Application.findByName(applicationName);
        if (!app) {
            throw new Error(`Application '${applicationName}' not found`);
        }

        let serviceId = null;
        if (serviceName) {
            const service = Service.findByNameAndApp(serviceName, app.id);
            if (!service) {
                throw new Error(
                    `Service '${serviceName}' not found in application '${applicationName}'`
                );
            }
            serviceId = service.id;
        }

        const versions = SchemaVersion.getAllVersions(app.id, serviceId);

        return {
            application: applicationName,
            service: serviceName,
            versions: versions.map(v => ({
                version: v.version,
                format: v.file_format,
                is_latest: Boolean(v.is_latest),
                created_at: v.created_at
            }))
        };
    }
}

module.exports = new SchemaService();