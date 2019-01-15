/**
 * Health endpoint.
 *
 * @author Chris Spiliotopoulos
 */


/*
 * API routes
 */
module.exports = function(server) {

  /**
   * GET /health
   *
   * Returns health status.
   */
  server.route({
    path: '/health',
    method: 'GET',
    config: {
      tags: ['api'],
      description: 'Get health status',
      notes: 'Returns status 200 OK - useful for health checks inside a cluster (e.g. kubernetes)',
      plugins: {
        'hapi-swaggered': {
          operationId: 'getHealth',
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
        return 'ok';
      }
    }
  });

};
