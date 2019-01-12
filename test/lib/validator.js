const fs = require('fs');
const path = require('path');
const chai = require('chai');
const sinon = require('sinon');
const SinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const should = chai.should();
chai.use(SinonChai);
chai.use(chaiAsPromised);
const {errors} = require('tableschema');
const {TableSchemaError} = errors;


const {
  Validator
} = require('../../src/lib/validator');


const {
  UnsupportedValidatorError,
  DataValidationError
} = require('../../src/lib/errors');

const sandbox = sinon.createSandbox();

context('Validator', () => {

  afterEach(() => {
    // completely restore all fakes created through the sandbox
    sandbox.restore();
  });


  context('constructor()', () => {

    it('should through an error if resource type is unsupported', () => {
      const fn = function() {
        return new Validator();
      };
      fn.should.throw(UnsupportedValidatorError);
    });

    it('should load the corresponding resource schema', () => {
      const v = new Validator('organization');
      should.exist(v.schema);
    });
  });

  context('validate()', () => {

    it('should throw an error if data source is empty / undefined', () => {

      const p = new Validator('organization').validate();
      return p.should.be.rejected;
    });

    it('should read data from an array of values', () => {
      const data = [
        [
          '1',
          'c89eb05c-62dd-4b64-b494-0cc347b6ea7f',
          'Program name',
          'Alternate name'
        ]
      ];

      // validate the source against the schema
      const p = new Validator('program').validate(data);
      return p.should.be.fulfilled;
    });

    it('should read data from a local CSV', () => {
      const file = path.resolve(__dirname, 'program.csv');

      // check if the file exists
      fs.statSync(file);

      const stream = fs.createReadStream(file);

      // validate the source against the schema
      const p = new Validator('program').validate(stream);
      return p.should.be.fulfilled;
    });

    it('should throw an error if a row has less fields', async () => {
      const data = [
        ['a','b','c'],
        [
          '1',
          'c89eb05c-62dd-4b64-b494-0cc347b6ea7f',
          'Program name'
        ]
      ];

      // validate the source against the schema
      const p = new Validator('program').validate(data);
      return p.should.be.rejectedWith(TableSchemaError);

    });

    it('should throw an error if a row has more fields', () => {
      const data = [
        ['a','b','c','d','e'],
        [
          '1',
          'c89eb05c-62dd-4b64-b494-0cc347b6ea7f',
          'Program name',
          'Alternate name',
          'an extra field'
        ]
      ];

      // validate the source against the schema
      const p = new Validator('program').validate(data);
      return p.should.be.rejectedWith(TableSchemaError);
    });


    it('should throw an error if a bad enum value is provided', () => {
      const data = [
        ['a','b','c','d'],
        ['1', '1', 'cd', 'details go here'],
        ['1', '1', 'bad_enum', 'details go here']
      ];

      // validate the source against the schema
      const p = new Validator('accessibility_for_disabilities').validate(data);
      return p.should.be.rejectedWith(TableSchemaError);
    });

    it('should throw an error if wrong type of value is provided', () => {
      const data = [
        ['a','b','c','d','e', 'f'],
        [123,
          'org A',
          'alter org A', 'A descr',
          'org@example.com', 'http://www.example.com',
          'tax status', '1',
          '1990-01-01', 'private'
        ]
      ];

      // validate the source against the schema
      const p = new Validator('organization').validate(data);
      return p.should.be.rejectedWith(TableSchemaError);
    });

    it('should throw an error if a bad formatted \'email\' value is provided', () => {
      const data = [
        ['a','b','c','d','e', 'f', 'g','h','i','j'],
        ['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
          'org A',
          'alter org A', 'A descr',
          '@example.com', 'http://www.example.com',
          'tax status', '1',
          '1990-01-01', 'private'
        ]
      ];

      // validate the source against the schema
      const p = new Validator('organization').validate(data);
      return p.should.be.rejectedWith(TableSchemaError);
    });


    it('should throw an error if a bad formatted \'uri\' value is provided', () => {
      const data = [
        ['a','b','c','d','e', 'f', 'g','h','i','j'],
        ['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
          'org A',
          'alter org A', 'A descr',
          'someone@example.com', 'http:example.com',
          'tax status', '1',
          '1990-01-01', 'private'
        ]
      ];

      // validate the source against the schema
      const p = new Validator('organization').validate(data);
      return p.should.be.rejectedWith(TableSchemaError);
    });

  });

});
