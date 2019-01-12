/**
 * Validators endpoint.
 *
 * @author Chris Spiliotopoulos
 */

const _ = require('lodash');
const Joi = require('joi');
const Boom = require('boom');
const {
  Resources
} = require('../lib/resources');

module.exports = function(server) {


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
      description: 'Returns the list of valid resources',
      plugins: {
        'hapi-swaggered': {
          operationId: 'getResources',
          responses: {
            200: {
              description: 'Success'
            },
            500: {
              description: 'Internal Server Error'
            }
          }
        }
      },
      handler() {

        let resources = Resources.getDefinitions();

        resources = _.map(resources, (o) => ({
          name: o.name,
          title: _.capitalize(o.name.split('_').join(' ')),
          description: o.description
        }));

        resources = _.sortBy(resources, 'name');

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
      description: 'Returns the definition of a resource by name',
      plugins: {
        'hapi-swaggered': {
          operationId: 'getResourceByName',
          responses: {
            200: {
              description: 'Success'
            },
            500: {
              description: 'Internal Server Error'
            }
          }
        }
      },
      validate: {
        params: {
          name: Joi.string().required()
            .description('The name of the resource')
        }
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
          const resource = Resources.getDefinition(name, true);
          return resource;
        } catch (e) {
          return Boom.notFound(e);
        }

      }
    }
  });


};
