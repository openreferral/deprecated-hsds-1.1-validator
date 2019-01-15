/**
 * Validators endpoint.
 *
 * @author Chris Spiliotopoulos
 */

const Joi = require('joi');
const Boom = require('boom');

const {
  Resource
} = require('../schemas/resources.js');

module.exports = function(server, datapackage) {

  /**
   * GET /resources
   *
   * Returns health status.
   */
  server.route({
    path: '/resources',
    method: 'GET',
    config: {
      tags: ['api'],
      description: 'Get the list of valid Open Referral logical resources',
      notes: 'Returns the list of declared resources as defined within the official Open Referral data package descriptor.',
      plugins: {
        'hapi-swaggered': {
          operationId: 'getResources'
        }
      },
      response: {
        schema: Joi.array().items(Resource).meta({
          className: 'Resources',
          description: 'A collection of Open Referral resource definitions'
        })
      },
      handler() {

        if (!datapackage) {
          throw new Error('Data package instance not found');
        }

        const {resources} = datapackage;
        return resources;
      }
    }
  });

  /**
   * GET /resources
   *
   * Returns health status.
   */
  server.route({
    path: '/resources/{name}',
    method: 'GET',
    config: {
      tags: ['api'],
      description: 'Get the definition of a resource by name',
      notes: 'Returns the full definition of a resource as defined within the Open Referral data package descriptor.',
      plugins: {
        'hapi-swaggered': {
          operationId: 'getResourceByName'
        }
      },
      validate: {
        params: {
          name: Joi.string().required()
            .description('The name of the resource')
        }
      },
      response: {
        // schema: Resource
      },
      handler(request) {

        const {
          params
        } = request;

        const {
          name
        } = params;

        // get the selected resource
        // with full meta data
        try {
          const resource = datapackage.getResourceDefinition(name, true);
          return resource;
        } catch (e) {
          return Boom.notFound(e);
        }

      }
    }
  });


};
