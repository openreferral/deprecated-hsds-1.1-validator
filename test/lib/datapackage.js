const chai = require('chai');
const sinon = require('sinon');
const SinonChai = require('sinon-chai');
const should = chai.should();
chai.use(SinonChai);
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const {
  DataPackage
} = require('../../src/lib/datapackage');

const sandbox = sinon.createSandbox();

context('Datapackage class', () => {

  let dp;

  before(async () => {
    dp = await DataPackage.load(`${__dirname}/../../src/datapackage.json`);
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


  context('validateResource()', () => {

    it('should throw an error if data source is empty / undefined', () => {
      const p = dp.validateResource();
      return p.should.be.rejected;
    });

    it('should throw an error if a resource name is not provided', () => {
      const source = [];
      const p = dp.validateResource(source);
      return p.should.be.rejected;
    });

    it('should validate data from an array of values', () => {
      const data = [
        [
          '1',
          'c89eb05c-62dd-4b64-b494-0cc347b6ea7f',
          'Program name',
          'Alternate name'
        ]
      ];

      // validate the source against the schema
      const p = dp.validateResource(data, 'program');
      return p.should.be.fulfilled;
    });

    it('should throw an error if a row has less fields', async () => {
      const data = [
        ['a', 'b', 'c'],
        [
          '1',
          'c89eb05c-62dd-4b64-b494-0cc347b6ea7f',
          'Program name'
        ]
      ];

      // validate the source against the schema
      const res = await dp.validateResource(data, 'program');
      res.errors.should.have.length(1);
      res.errors[0].row.should.eq(2);
      res.errors[0].description.should.eq('The column header names do not match the field names in the schema');
    });

    it('should throw an error if a row has more fields', async () => {
      const data = [
        ['a', 'b', 'c', 'd', 'e'],
        [
          '1',
          'c89eb05c-62dd-4b64-b494-0cc347b6ea7f',
          'Program name',
          'Alternate name',
          'an extra field'
        ]
      ];

      // validate the source against the schema
      const res = await dp.validateResource(data, 'program');
      res.errors.should.have.length(1);
      res.errors[0].row.should.eq(2);
      res.errors[0].description.should.eq('The column header names do not match the field names in the schema');
    });

    it('should throw an error if a bad enum value is provided', async () => {
      const data = [
        ['id', 'location_id', 'accessibility', 'details'],
        ['1', '1', 'bad_enum', 'details go here']
      ];

      // validate the source against the schema
      const res = await dp.validateResource(data, 'accessibility_for_disabilities');
      res.errors.should.have.length(1);
      res.errors[0].row.should.eq(2);
      res.errors[0].col.should.eq(3);
    });

    it('should throw an error if wrong type of value is provided', async () => {
      const data = [
        ['id', 'name', 'alternate_name', 'description', 'email', 'url', 'tax_status', 'tax_id', 'year_incorporated', 'legal_status'],
        ['1',
          'org A',
          'alter org A', 'A descr',
          'someone@example.com', 'http://www.examplecom',
          'tax status', '1',
          '1990', 'private'
        ]
      ];

      // validate the source against the schema
      const res = await dp.validateResource(data, 'organization');
      res.errors.should.have.length(1);
      res.errors[0].row.should.eq(2);
      res.errors[0].col.should.eq(1);
    });

    it('should throw an error if a bad formatted \'email\' value is provided', async () => {
      const data = [
        ['id', 'name', 'alternate_name', 'description', 'email', 'url', 'tax_status', 'tax_id', 'year_incorporated', 'legal_status'],
        ['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
          'org A',
          'alter org A', 'A descr',
          'someoneexample.com', 'http://www.examplecom',
          'tax status', '1',
          '1990', 'private'
        ]
      ];

      // validate the source against the schema
      const res = await dp.validateResource(data, 'organization');
      res.errors.should.have.length(1);
      res.errors[0].row.should.eq(2);
      res.errors[0].col.should.eq(5);
    });

  });

});
