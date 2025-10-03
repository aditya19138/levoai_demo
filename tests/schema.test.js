require('./setup');
const schemaService = require('../src/services/schemaService');
const SchemaVersion = require('../src/models/schemaVersion');
describe('Schema Service Unit Tests', () => {

  // Sample valid OpenAPI spec in JSON format
  const validJsonSpec = JSON.stringify({
    openapi: '3.0.0',
    info: {
      title: 'Test API',
      version: '1.0.0',
      description: 'A test API for unit testing'
    },
    paths: {
      '/users': {
        get: {
          summary: 'Get all users',
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  // Sample valid OpenAPI spec in YAML format
  const validYamlSpec = `openapi: 3.0.0
info:
  title: Test API YAML
  version: 1.0.0
paths:
  /products:
    get:
      summary: Get all products
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: integer
                    name:
                      type: string`;

  describe('Test Name: Import Schema - Application Level (JSON)', () => {
    it('shouldbe a valid openapi spec', async () => {
      const result = await schemaService.importSchema(
        'TestApp',
        null, // No service name (application-level)
        validJsonSpec,
        'json'
      );
      // console.log('Import result:', result);

      expect(result).toBeDefined();
      expect(result.application).toBe('TestApp');
      expect(result.service).toBeNull();
      expect(result.version).toBe(1); // First version
      expect(result.format).toBe('json');
      expect(result.created_at).toBeDefined();
    });

    it('should increment version when uploading a different schema to the same application', async () => {
      // First import
      const res = await schemaService.importSchema(
        'VersionTestApp',
        null,
        validJsonSpec,
        'json'
      );

      console.log('First import result:', res);
      console.log('First import version:', SchemaVersion.getNextVersion(3, null));


      const modifiedSpec = JSON.stringify({
        ...JSON.parse(validJsonSpec),
        info: {
          title: 'Modified Test API',
          version: '2.0.0'
        }
      });

      const result = await schemaService.importSchema(
        'VersionTestApp',
        null,
        modifiedSpec,
        'json'
      );

      console.log('Second import result:', result);

      // Assertions
      expect(result.version).toBe(2); // Version should increment
      expect(result.application).toBe('VersionTestApp');
    });
  });
});