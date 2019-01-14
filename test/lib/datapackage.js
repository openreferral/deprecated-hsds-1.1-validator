const chai = require('chai');
const sinon = require('sinon');
const SinonChai = require('sinon-chai');
const should = chai.should();
chai.use(SinonChai);

const {
  DataPackage
} = require('../../src/lib/datapackage');

const sandbox = sinon.createSandbox();

context('Datapackage class', () => {

  let dp;

  before(async () => {
    dp = await DataPackage.load(`${__dirname}/package/datapackage.json`);
  });


  afterEach(() => {
    // completely restore all fakes created through the sandbox
    sandbox.restore();
  });

  context('load()', () => {

    it('should load the data package instance at the givel URL', async () => {
      dp.datapackage.should.not.be.null;
    });

  });

  context('get resourceNames()', () => {

    it('should return list of resource names', async () => {
      dp.resourceNames.should.be.an('array');
      dp.resourceNames.length.should.be.gt(0);
    });

  });

  context('get resources()', () => {

    it('should return a list of high-level resource definitions', async () => {
      const {resources} = dp;
      resources.should.be.an('array');
      resources.length.should.be.gt(0);
    });

  });

  context('getResourceDefinition()', () => {

    it('should throw an error if the resource does not exist', async () => {
      const fn = function() {
        return dp.getResourceDefinition('fdfdsdsfsdfd');
      };
      fn.should.throw(Error);
    });

    it('should return the resource definition', async () => {
      const resource = dp.getResourceDefinition('organization');
      should.exist(resource);
      resource.should.have.property('name');
      resource.should.have.property('local');
      resource.should.have.property('remote');
      resource.should.have.property('multipart');
      resource.should.have.property('tabular');
      resource.should.have.property('source');
      resource.should.not.have.property('schema');
    });

    it('should return the resource definition with schema', async () => {
      const resource = dp.getResourceDefinition('organization', true);
      should.exist(resource);
      resource.should.have.property('schema');
    });
  });


});
