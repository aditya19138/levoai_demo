const SwaggerParser = require('swagger-parser');
const yaml = require('js-yaml');

class ValidationService {
    static async validateOpenAPISpec(content, format) {
        try {
            let spec;
            // console.log('content:', content);
            // Parse the content based on format
            if (format === 'yaml') {
                spec = yaml.load(content);
            } else if (format === 'json') {
                spec = JSON.parse(content);
            } else {
                return {
                    valid: false,
                    errors: [{ message: 'Invalid format. Must be json or yaml' }]
                };
            }

            // Validate using swagger-parser
            await SwaggerParser.validate(spec);

            return {
                valid: true,
                spec: spec
            };
        } catch (error) {
            return {
                valid: false,
                errors: [
                    {
                        message: error.message,
                        details: error.details || null
                    }
                ]
            };
        }
    }
}

module.exports = ValidationService;