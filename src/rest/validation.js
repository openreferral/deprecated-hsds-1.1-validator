/**
 * Validation endpoint.
 *
 * @author Chris Spiliotopoulos
 */

const _ = require('lodash');
const Joi = require('joi');
const Boom = require('boom');
const {
  Validator
} = require('../lib/validator');


module.exports = function(server) {

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
      description: 'Validates a CSV data file using a specific Open Referral resource schema',
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

      async handler(request, h) {

        // get the uploaded resource type
        const type = request.payload.type;

        // get the file stream
        const stream = request.payload.file;

        try {
          await new Validator(type).validate(stream);

          return h.response('Resource is valid').code(200);
        } catch (e) {
          return Boom.badRequest(e);
        }

      }
    }
  });


};
