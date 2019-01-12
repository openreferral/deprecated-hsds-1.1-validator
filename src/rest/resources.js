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

const {
  Resource
} = require('../schemas/resources.js');

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
          const resource = Resources.getDefinition(name, true);

          _.unset(resource, 'path');
          _.unset(resource, 'format');
          _.unset(resource, 'mediatype');
          
          return resource;
        } catch (e) {
          return Boom.notFound(e);
        }

      }
    }
  });


};
