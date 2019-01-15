/**
 * Validation endpoint.
 *
 * @author Chris Spiliotopoulos
 */

const Boom = require('boom');

const {
  ValidationResult
} = require('../schemas/validation');

module.exports = function(server, datapackage) {

  /**
   * GET /resources
   *
   * Returns health status.
   */
  server.route({
    path: '/validate/csv',
    method: 'POST',
    config: {
      tags: ['api'],
      description: 'Validate a CSV data file using a specific Open Referral resource schema',
      plugins: {
        'hapi-swaggered': {
          operationId: 'validateCsvResource'
        }
      },
      payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data'
      },
      response: {
        schema: ValidationResult
      },
      async handler(request, h) {

        // get the uploaded resource type
        const {
          payload
        } = request;

        const {
          type,
          file: stream
        } = payload;

        try {

          if (typeof type === 'undefined') {
            throw new Error('Form should contain the field "type" with a valid resource name');
          }

          if (typeof stream === 'undefined') {
            throw new Error('Form should contain the field "file" with a valid resource data stream');
          }

          // validate the input stream using
          // the provided resource type definition
          const result = await datapackage.validateResource(stream, type);

          if (result.errors.length > 0) {
            return h.response(result).code(400);
          }

          return h.response(result).code(200);
        } catch (e) {
          return Boom.badRequest(e.message);
        }

      }
    }
  });


};
