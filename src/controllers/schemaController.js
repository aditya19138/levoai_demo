const schemaService = require('../services/schemaService');

class SchemaController {
    async importSchema(req, res) {
        try {
            const { application, service, spec, format } = req.body;

            // Validate required fields
            if (!application) {
                return res.status(400).json({
                    success: false,
                    error: 'Application name is required'
                });
            }

            if (!spec) {
                return res.status(400).json({
                    success: false,
                    error: 'Spec content is required'
                });
            }

            if (!format || format !== 'json' && format !== 'yaml') {
                return res.status(400).json({
                    success: false,
                    error: 'Format must be either "json" or "yaml"'
                });
            }

            // Decode base64 if needed
            let specContent = JSON.stringify(spec);
            // if (req.body.encoding === 'base64') {
            //     specContent = Buffer.from(spec, 'base64').toString('utf8');
            // }

            const result = await schemaService.importSchema(
                application,
                service || null,
                specContent,
                format
            );

            res.status(201).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Import error:', error);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    async getLatestSchema(req, res) {
        try {
            const { application, service } = req.query;

            if (!application) {
                return res.status(400).json({
                    success: false,
                    error: 'Application query parameter is required'
                });
            }

            const result = schemaService.getLatestSchema(
                application,
                service || null
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Get latest error:', error);
            const statusCode = error.message.includes('not found') ? 404 : 400;
            res.status(statusCode).json({
                success: false,
                error: error.message
            });
        }
    }

    async getSchemaByVersion(req, res) {
        try {
            const { version } = req.params;
            const { application, service } = req.query;

            if (!application) {
                return res.status(400).json({
                    success: false,
                    error: 'Application query parameter is required'
                });
            }

            const versionNum = parseInt(version, 10);
            if (isNaN(versionNum)) {
                return res.status(400).json({
                    success: false,
                    error: 'Version must be a valid number'
                });
            }

            const result = schemaService.getSchemaByVersion(
                application,
                service || null,
                versionNum
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Get version error:', error);
            const statusCode = error.message.includes('not found') ? 404 : 400;
            res.status(statusCode).json({
                success: false,
                error: error.message
            });
        }
    }

    async listVersions(req, res) {
        try {
            const { application, service } = req.query;

            if (!application) {
                return res.status(400).json({
                    success: false,
                    error: 'Application query parameter is required'
                });
            }

            const result = schemaService.listVersions(
                application,
                service || null
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('List versions error:', error);
            const statusCode = error.message.includes('not found') ? 404 : 400;
            res.status(statusCode).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new SchemaController();