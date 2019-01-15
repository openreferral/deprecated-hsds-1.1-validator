const chai = require('chai');
const sinon = require('sinon');
chai.should();

const Hapi = require('hapi');
const FormData = require('form-data');
const fs = require('fs');
const streamToPromise = require('stream-to-promise');


const {
  DataPackage
} = require('../../src/lib/datapackage');

const sandbox = sinon.createSandbox();

context('/resources', () => {

  let server;

  before(async () => {

    server = new Hapi.Server();
    const datapackage = await DataPackage.load(`${__dirname}/../../src/datapackage.json`);
    require('../../src/rest/validation')(server, datapackage);
  });

  afterEach(() => {
    // completely restore all fakes created through the sandbox
    sandbox.restore();
  });


  context('GET /validate/csv', () => {

    it('should return 400 if resource type is not provided', async () => {

      // generate the form data
      const form = new FormData();
      form.append('somefield', 'nada');
      const payload = await streamToPromise(form);

      const response = await server.inject({
        method: 'POST',
        url: '/validate/csv',
        headers: form.getHeaders(),
        payload
      });

      response.statusCode.should.equal(400);
      response.result.should.be.an('object');
      response.result.message.should.eq('Form should contain the field "type" with a valid resource name');
    });

    it('should return 400 if data stream is not provided', async () => {

      // generate the form data
      const form = new FormData();
      form.append('type', 'contact');
      const payload = await streamToPromise(form);

      const response = await server.inject({
        method: 'POST',
        url: '/validate/csv',
        headers: form.getHeaders(),
        payload
      });

      response.statusCode.should.equal(400);
      response.result.should.be.an('object');
      response.result.message.should.eq('Form should contain the field "file" with a valid resource data stream');
    });

    it('should validate CSV resource data streams', async () => {

      // generate the form data
      const form = new FormData();
      form.append('type', 'contact');

      // add the file stream to the form
      const fileStream = fs.createReadStream(`${__dirname}/contact.csv`);
      form.append('file', fileStream);

      // convert the form to payload
      const payload = await streamToPromise(form);

      const response = await server.inject({
        method: 'POST',
        url: '/validate/csv',
        headers: form.getHeaders(),
        payload
      });

      response.statusCode.should.equal(200);
      response.result.should.be.an('object');
      response.result.should.have.property('valid');
      response.result.valid.should.be.true;
    });

  });


});
