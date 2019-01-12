import {
  Table,
  errors
} from 'tableschema';

import {
  Resources
} from './resources';

import {
  UnsupportedValidatorError,
  DataValidationError,
  ValidatorError
} from './errors';

const {TableSchemaError} = errors;


/**
 * Class used for validating
 * Open Referral resources.
 *
 * @type Validator
 */
export class Validator {


  /**
   * Constructor
   * @param  {[type]} descriptor [description]
   * @param  {[type]} basePath   [description]
   * @param  {[type]} strict     [description]
   * @param  {[type]} profile    [description]
   * @return {[type]}            [description]
   */
  constructor(resourceType) {

    // check if resource type is valid
    if (Resources.types.indexOf(resourceType) === -1) {
      throw new UnsupportedValidatorError('One of the valid resource types should provided');
    }

    this._type = resourceType;

    const resource = Resources.getDefinition(resourceType, true);

    // load the schema file that maps
    // to the requested resource type
    this._schema = resource.schema;
  }

  /**
   * Returns the schema
   * for that maps to
   * the selected resource type
   * @return {[type]} [description]
   */
  get schema() {
    return this._schema;
  }

  get type() {
    return this._type;
  }

  /**
   * Validates an input data source against
   * the resource specific schema.
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  async validate(source, {
    headersRow
  }={}) {

    try {

      if (typeof source === 'undefined') {
        throw new ValidatorError('A valid data source is required');
      }

      if (typeof this.schema === 'undefined') {
        throw new ValidatorError('No schema found for validating this type of resource');
      }

      // if headers row is included,
      // start reading stream from
      // the 2nd row
      let from = 1;
      if (headersRow > 0) {
        from = 2;
      }

      const errors = [];
      await scanTable({
        source,
        schema: this._schema,
        headersRow,
        from,
        errors
      });

      // if there are errors,
      // throw an exception
      if (errors.length > 0) {
        throw new ValidatorError('Validation errors detected', errors);
      }

    } catch (e) {
      throw e;
    }
  }

}

/**
 * Scans the table and gathers
 * errors in a recursive manner.
 * @param  {[type]} source          [description]
 * @param  {[type]} schema          [description]
 * @param  {Number} [from=1]        [description]
 * @param  {Array}  [errors=[]}={}] [description]
 * @return {[type]}                 [description]
 */
async function scanTable({
  source,
  schema,
  headersRow,
  from = 1,
  errors = []
} = {}) {
  // create a new table instance
  // using the selected resource
  // schema and data source
  const table = await Table.load(source, {
    schema,
    headers: headersRow
  });

  // read the table
  const iterator = await table.iter({
    forceCast: false
  });

  let done;
  let idx = 0;

  do {

    try {
    const res = await iterator.next();
    idx += 1;
    done = res.done;

    const {value} = res;

  } catch (e){
    console.error(e.message);
    console.error(e.errors)
    done = true;
    throw new TableSchemaError(e.message)
  }

  } while(! done);


}
