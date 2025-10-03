require('./setup');
const schemaService = require('../src/services/schemaService');
const SchemaVersion= require('../src/models/schemaVersion');
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
  description: A test API in YAML format
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

  describe('Test 1: Import Schema - Application Level (JSON)', () => {
    it('should successfully import a valid JSON OpenAPI spec at application level', async () => {
      const result = await schemaService.importSchema(
        'TestApp',
        null, // No service name (application-level)
        validJsonSpec,
        'json'
      );
      // console.log('Import result:', result);

      // Assertions
      expect(result).toBeDefined();
      expect(result.application).toBe('TestApp');
      expect(result.service).toBeNull();
      expect(result.version).toBe(1); // First version
      expect(result.format).toBe('json');
      expect(result.created_at).toBeDefined();
    });

    it('should increment version when uploading a different schema to the same application', async () => {
      // First import
      const res= await schemaService.importSchema(
        'VersionTestApp',
        null,
        validJsonSpec,
        'json'
      );

      console.log('First import result:', res);
      console.log('First import version:', SchemaVersion.getNextVersion(3,null));

      // Modify the spec slightly to create a different schema
      const modifiedSpec = JSON.stringify({
        ...JSON.parse(validJsonSpec),
        info: {
          title: 'Modified Test API',
          version: '2.0.0'
        }
      });

      // Second import with modified spec
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

//     it('should detect duplicate schema and not create new version', async () => {
//       // First import
//       await schemaService.importSchema(
//         'DuplicateTestApp',
//         null,
//         validJsonSpec,
//         'json'
//       );

//       // Try to import the exact same schema again
//       const result = await schemaService.importSchema(
//         'DuplicateTestApp',
//         null,
//         validJsonSpec,
//         'json'
//       );

//       // Assertions
//       expect(result.duplicate).toBe(true);
//       expect(result.version).toBe(1); // Should return the existing version
//       expect(result.message).toBe('Identical schema already exists');
//     });
//   });

//   describe('Test 2: Import Schema - Service Level (YAML)', () => {
//     it('should successfully import a valid YAML OpenAPI spec at service level', async () => {
//       const result = await schemaService.importSchema(
//         'crAPI',
//         'identity-service', // Service name provided
//         validYamlSpec,
//         'yaml'
//       );

//       // Assertions
//       expect(result).toBeDefined();
//       expect(result.duplicate).toBe(false);
//       expect(result.application).toBe('crAPI');
//       expect(result.service).toBe('identity-service');
//       expect(result.version).toBe(1); // First version for this service
//       expect(result.format).toBe('yaml');
//       expect(result.created_at).toBeDefined();
//     });

//     it('should maintain separate version sequences for different services', async () => {
//       // Import to first service
//       const result1 = await schemaService.importSchema(
//         'MultiServiceApp',
//         'service-one',
//         validYamlSpec,
//         'yaml'
//       );

//       // Import to second service in the same application
//       const result2 = await schemaService.importSchema(
//         'MultiServiceApp',
//         'service-two',
//         validYamlSpec,
//         'yaml'
//       );

//       // Both should have version 1 since they're different services
//       expect(result1.version).toBe(1);
//       expect(result2.version).toBe(1);
//       expect(result1.service).toBe('service-one');
//       expect(result2.service).toBe('service-two');
//     });

//     it('should reject invalid OpenAPI spec', async () => {
//       const invalidSpec = JSON.stringify({
//         // Missing required 'openapi' field
//         info: {
//           title: 'Invalid API',
//           version: '1.0.0'
//         }
//         // Missing 'paths' field
//       });

//       await expect(
//         schemaService.importSchema(
//           'InvalidApp',
//           null,
//           invalidSpec,
//           'json'
//         )
//       ).rejects.toThrow('Invalid OpenAPI specification');
//     });
//   });

//   describe('Test 3: Retrieve Latest Schema', () => {
//     it('should retrieve the latest schema version', async () => {
//       const appName = 'RetrieveTestApp';

//       // Import first version
//       await schemaService.importSchema(
//         appName,
//         null,
//         validJsonSpec,
//         'json'
//       );

//       // Import second version with modified spec
//       const modifiedSpec = JSON.stringify({
//         ...JSON.parse(validJsonSpec),
//         info: {
//           title: 'Updated Test API',
//           version: '2.0.0',
//           description: 'Updated description'
//         }
//       }, null, 2);

//       await schemaService.importSchema(
//         appName,
//         null,
//         modifiedSpec,
//         'json'
//       );

//       // Retrieve latest
//       const result = schemaService.getLatestSchema(appName);

//       // Assertions
//       expect(result).toBeDefined();
//       expect(result.version).toBe(2); // Should get version 2
//       expect(result.application).toBe(appName);
//       expect(result.spec).toContain('Updated Test API');
//       expect(result.format).toBe('json');
//     });

//     it('should throw error when retrieving from non-existent application', () => {
//       expect(() => {
//         schemaService.getLatestSchema('NonExistentApp');
//       }).toThrow("Application 'NonExistentApp' not found");
//     });
  });
});