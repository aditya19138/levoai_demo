const fs = require('fs');
const path = require('path');

class StorageService {
    constructor() {
        this.basePath = process.env.STORAGE_PATH || './storage/schemas';
        this.ensureBaseDirectory();
    }

    ensureBaseDirectory() {
        if (!fs.existsSync(this.basePath)) {
            fs.mkdirSync(this.basePath, { recursive: true });
        }
    }

    buildPath(applicationName, serviceName = null, version, format) {
        let dirPath;

        if (serviceName) {
            dirPath = path.join(
                this.basePath,
                'applications',
                applicationName,
                'services',
                serviceName
            );
        } else {
            dirPath = path.join(
                this.basePath,
                'applications',
                applicationName,
                'application-level'
            );
        }

        const fileName = `v${version}.${format}`;
        return {
            fullPath: path.join(dirPath, fileName),
            relativePath: path.relative(this.basePath, path.join(dirPath, fileName))
        };
    }

    saveSchema(content, applicationName, serviceName, version, format) {
        const { fullPath, relativePath } = this.buildPath(
            applicationName,
            serviceName,
            version,
            format
        );

        // Create directory if it doesn't exist
        const dirPath = path.dirname(fullPath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Write the file
        fs.writeFileSync(fullPath, content, 'utf8');

        return relativePath;
    }

    readSchema(relativePath) {
        const fullPath = path.join(this.basePath, relativePath);

        if (!fs.existsSync(fullPath)) {
            throw new Error('Schema file not found');
        }

        return fs.readFileSync(fullPath, 'utf8');
    }

    deleteSchema(relativePath) {
        const fullPath = path.join(this.basePath, relativePath);

        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }
}

module.exports = new StorageService();