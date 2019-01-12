/*
 * Main application.
 *
 * @author Chris Spiliotopoulos
 */
const path = require('path');
const nconf = require('nconf');
const Hapi = require('hapi');
const _ = require('lodash');
const winston = require('winston');
const recursive = require('recursive-readdir');
const hapiSwaggered = require('hapi-swaggered');
const Vision = require('vision');
const Inert = require('inert');

/*
 * Load configuration environment
 */
nconf.argv().env();

// set defaults
nconf.overrides({
  'HOST': 'localhost',
  'PORT': 1330
});


let log = null;

const Application = (function Bootstrap() {

  // the server instance
  let _server = null;


  /**
   * Sets up the logging framework.
   *
   * @return {[type]} [description]
   */
  const _setupLogging = () => {

    log = winston.createLogger({
      level: 'info',
      format: winston.format.simple()
    });

    log.add(new winston.transports.Console({
      format: winston.format.simple()
    }));
  };


  /**
   * Sets up the server instance.
   *
   * @return {Promise} [description]
   */
  const _setupServer = async () => {

    log.info('Setting up server');

    /*
     * Hapi server instance
     */

    if (_.isUndefined(nconf.get('HOST'))) {
      nconf.set('HOST', 'localhost');
    }

    if (_.isUndefined(nconf.get('PORT'))) {
      nconf.set('PORT', 1330);
    }

    _server = new Hapi.Server({
      host: nconf.get('HOST'),
      port: nconf.get('PORT')
    });

    log.info(`Server launched [${nconf.get('HOST')}:${nconf.get('PORT')}]`)

    // setup routing
    await _setupRouting(_server);

    // setup the Swagger plugin
    await _setupSwaggerPlugin(_server);

    // start the server
    await _server.start();

  };

  /**
   * Sets up Hapi Swagger plugin
   * @return {Promise} [description]
   */
  const _setupSwaggerPlugin = async (server) => {

    /*
     * Swagger plugin options
     */
    let host = `${nconf.get('HOST')}:${nconf.get('PORT')}`;
    let basePath;

    if (nconf.get('swagger') && (!_.isEmpty(nconf.get('swagger:host')))) {
      host = (nconf.get('swagger:host') !== '' ? nconf.get('swagger:host') : undefined);
    }

    if (nconf.get('swagger') && (!_.isEmpty(nconf.get('swagger:basePath')))) {
      basePath = (nconf.get('swagger:basePath') !== '' ? nconf.get('swagger:basePath') : undefined);
    }

    await server.register([
      Inert,
      Vision,
      {
        plugin: require('hapi-swaggered'),
        options: {
          host,
          basePath,
          schemes: ['http', 'https'],
          cors: false,
          info: {
            title: 'OpenReferral - Validator',
            description: 'OpenReferral - Validator',
            version: '1',
            contact: {
              name: 'Chris Spiliotopoulos (@spilio)',
              url: 'https://github.com/spilio'
            }
          }
        }
      }
    ]);

  };

  /**
   * Sets up server routing.
   * @param  {[type]} server [description]
   * @return {[type]}        [description]
   */
  const _setupRouting = (server) => new Promise(((resolve, reject) => {

    try {

      /*
       * load controller routes
       */
      log.info('Registering controller routes');
      const normalizedPath = path.resolve(__dirname, './rest');

      // load all controller modules recursively
      recursive(normalizedPath, (err, files) => {
        files.forEach((file) => {
          require(file)(server);
        });

        // done
        resolve();
      });

    } catch (e) {
      reject(e);
    }


  }));


  /**
   * Starts the application
   * @return {[type]} [description]
   */
  const _start = async () => {

    // setup logging
    _setupLogging();

    // setup the server instance
    await _setupServer();

  };


  return {

    /*
     * Public
     */
    start: _start

  };

}());


/**
 * Start the application
 */
Application.start();
log.info('Application started');
