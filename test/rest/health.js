const chai = require('chai');
const sinon = require('sinon');
const SinonChai = require('sinon-chai');
chai.should();
chai.use(SinonChai);

const Hapi = require('hapi');

const sandbox = sinon.createSandbox();

context('/health', () => {

  let server;

  before(() => {

    server = new Hapi.Server();
    require('../../src/rest/health')(server);
  });

  afterEach(() => {
    // completely restore all fakes created through the sandbox
    sandbox.restore();
  });

  it('should return OK', async () => {

    // make API call to self to test functionality end-to-end
    const response = await server.inject({
      method: 'GET',
      url: '/health'
    });

    response.statusCode.should.equal(200);
  });


});
