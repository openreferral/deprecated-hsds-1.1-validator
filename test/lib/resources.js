const chai = require('chai');
const sinon = require('sinon');
const SinonChai = require('sinon-chai');
const should = chai.should();
chai.use(SinonChai);

const Resources = require('../../src/lib/resources');

const sandbox = sinon.createSandbox();

context('Resource', () => {

  afterEach(() => {
    // completely restore all fakes created through the sandbox
    sandbox.restore();
  });


  context('datapackage basic', () => {

    it('test 1', async () => {


    });


  });


});
