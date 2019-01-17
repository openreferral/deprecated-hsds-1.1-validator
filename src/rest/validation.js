/**
 * Validation endpoint.
 *
 * @author Chris Spiliotopoulos
 */

const _ = require('lodash');
const Boom = require('boom');
const Joi = require('joi');

const {
  ValidationResult
} = require('../schemas/validation');

const {
  DataPackage
} = require('../lib/datapackage');

module.exports = function(server, datapackage) {

  /**
   * Validates a CSV resource data file.
   */
  server.route({
    path: '/validate/csv',
    method: 'POST',
    config: {
      tags: ['api'],
      description: 'Validate a CSV data file using a specific Open Referral resource schema',
      notes: [
        'The operation validates an uploaded CSV data stream using the ',
        'definition of a specified resource as found in the standard Open Referral data package',
        'specification.  Clients should send a form payload containg a "type" field with the name ',
        'of the Open Referral logical resource and a "file" that contains the CSV data stream.'
      ].join(''),
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

          if (!result.valid) {
            return h.response(result).code(400);
          }

          return h.response(result).code(200);
        } catch (e) {
          return Boom.badRequest(e.message);
        }

      }
    }
  });


  /**
   * Validates a data package.
   */
  server.route({
    path: '/validate/datapackage',
    method: 'GET',
    config: {
      tags: ['api'],
      description: 'Validate a data package using the Open Referral specification.',
      notes: [
        'The operation expects the URI of a valid "datapackage.json" file that conforms to the Open Referral schema. ',
        'The validator will check all enlisted resources in turn and will return a collection of validation results ',
        'that correspond to each one of the resources.  The file can be either local or remote.'
      ].join(''),
      plugins: {
        'hapi-swaggered': {
          operationId: 'validateDatapackage'
        }
      },
      validate: {
        query: {
          uri: Joi.string().required()
            .description('Data package descriptor file URL')
        }
      },
      response: {
        schema: Joi.array().items(ValidationResult).description('A collection of validation results')
      },
      async handler(request, h) {

        // get the uploaded resource type
        const {
          query
        } = request;

        const {
          uri
        } = query;

        try {

          // load the data package
          const dp = await DataPackage.load(uri);

          // validate the full package
          const results = await dp.validatePackage();

          // check if there is at least 1 failed validation
          const matches = _.find(results, {
            valid: false
          });

          // add the results to the response
          const res = h.response(results);

          // if there is a failed validation, return 400
          if (matches) {
            res.code(400);
          }

          return res;
        } catch (e) {
          return Boom.badRequest(e.message);
        }

      }
    }
  });

};
