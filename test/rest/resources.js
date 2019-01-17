const chai = require('chai');
chai.should();

const Hapi = require('hapi');
const DataPackage = require('../../src/lib/datapackage');

context('/resources', () => {

  let server;


  before(async () => {

    server = new Hapi.Server();
    const datapackage = await DataPackage.load(`${__dirname}/../../src/datapackage.json`);
    require('../../src/rest/resources')(server, datapackage);
  });

  context('GET /resources', () => {

    it('should return the list of registered data package resources', async () => {

      const response = await server.inject({
        method: 'GET',
        url: '/resources'
      });

      response.statusCode.should.equal(200);
      response.result.should.be.an('array');
      response.result.should.have.length(22);
    });

  });

  context('GET /resources/{name}', () => {

    it('should return the resource definition by name', async () => {

      const response = await server.inject({
        method: 'GET',
        url: '/resources/contact'
      });

      response.statusCode.should.equal(200);
      response.result.should.be.an('object');
      response.result.should.have.property('name');
      response.result.should.have.property('source');
      response.result.should.have.property('schema');
    });

    it('should return 404 if resource is not supported', async () => {

      const response = await server.inject({
        method: 'GET',
        url: '/resources/bad'
      });

      response.statusCode.should.equal(404);
    });

  });


});
