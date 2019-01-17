import {
  Package
} from 'datapackage';

import _ from 'lodash/core';
import fs from 'fs';
import axios from 'axios';

import {
  Table,
  errors
} from 'tableschema';

import {
  DataValidationError
} from './errors';

const {
  TableSchemaError
} = errors;

/**
 * Data package wrapper class.
 *
 * @author Chris Spiliotopoulos
 */
export class DataPackage {

  /**
   * Constructor
   * @param {[type]} datapackage [description]
   */
  constructor(datapackage) {
    this.package = datapackage;
  }

  /**
   * Loads t
   * @return {[type]} [description]
   */
  static async load(url) {

    // try to load the data package
    const datapackage = await Package.load(url);

    // return a wrapped data package instance
    return new DataPackage(datapackage);
  }

  /**
   * Returns the list of resource names.
   *
   * @return {[type]} [description]
   */
  get resourceNames() {
    return this.package.resourceNames;
  }

  /**
   * Returns a list of high-level resource
   * definitions.
   *
   * @return {[type]} [description]
   */
  get resources() {

    return _.map(this.package.resources, (o) => ({
      name: o.name,
      source: o.source,
      description: o.descriptor.description
    }));
  }

  /**
   * Returns a resource definition.
   *
   * @return {[type]} [description]
   */
  getResourceDefinition(name, schema = false) {

    // get the resource definition by name
    const resource = this.package.getResource(name);

    if (!resource) {
      throw new Error('Resource not found');
    }

    const res = {
      name: resource.name,
      local: resource.local,
      remote: resource.remote,
      multipart: resource.multipart,
      tabular: resource.tabular,
      source: resource.source
    };

    if (schema) {
      res.schema = resource.schema.descriptor;
    }

    return res;
  }

  /**
   * Validates the contents of the data package.
   *
   * @return {Promise} [description]
   */
  async validatePackage({
    relations
  }={}) {

    if (!this.package) {
      throw new Error('Undefined package instance - use the static load() method to load a package definition first');
    }

    // get the list of declared resources
    const {
      resources
    } = this.package;

    const results = [];

    // iterate through all declared resources
    for (const resource of resources) {

      // validate each individual resource
      const result = await this.validatePackageResource(resource, {
        relations
      });

      // set the resource name on the result set
      result.resource = resource.name;

      // add it to the results collection
      results.push(result);
    }

    // return the validation results
    return results;
  }

  /**
   * Validates a resource declared in the data
   * package.
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  async validatePackageResource(resource, {
    relations = false
  } = {}) {

    const result = {
      valid: true,
      errors: []
    };

    try {

      if (typeof resource === 'undefined') {
        throw new DataValidationError('A valid package resource is required');
      }

      // check whether the resource exists physically
      if (!await _checkIfResourceExists(resource)) {
        throw new DataValidationError(`Resource '${resource.source}' is not available`);
      }

      /*
       * iterate the data set
       */
      const iterator = await resource.iter({
        relations,
        forceCast: true
      });

      let done, value;

      do {

        try {

          // get the next line
          const res = await iterator.next();
          ({
            done,
            value
          } = res);

          /*
           * in 'forceCast' mode, bad lines will be
           * replaced with an error instance
           */
          if (value instanceof TableSchemaError) {

            // resolve the errors
            const errors = _resolveErrors(resource, value);
            result.errors = result.errors.concat(errors);

            /*
             * if the error refers to bad column header schema,
             * stop the iteration as this will be the same for all
             * rows
             */
            if (value.message === 'The column header names do not match the field names in the schema') {
              done = true;
            }

          }
        } catch (e) {

          // resolve the errors
          const errors = _resolveErrors(resource, e);
          result.errors = result.errors.concat(errors);
        }

      } while (!done);

      if (result.errors.length === 0) {
        delete result.errors;
      }

    } catch (e) {

      // resolve the errors
      const errors = _resolveErrors(resource, e);
      result.errors = result.errors.concat(errors);
    }

    // if there are errors, mark the
    // result as invalid
    if (result.errors) {
      result.valid = false;
    } else {
      delete result.errors;
    }

    return result;
  }

  /**
   * Validates an input data source against
   * a resource specific schema.
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  async validateResource(source, resourceName, {
    headersRow
  } = {}) {

    if (typeof source === 'undefined') {
      throw new DataValidationError('A valid data source is required');
    }

    if (typeof resourceName === 'undefined') {
      throw new DataValidationError('A valid Open Referral resource name should be provided');
    }

    // get the selected resource definition
    const resource = this.package.getResource(resourceName);

    // create a new table instance
    // using the selected resource
    // schema and data source
    const table = await Table.load(source, {
      schema: resource.schema,
      headers: headersRow
    });

    /*
     * iterate the data set
     */
    const iterator = await table.iter({
      forceCast: true
    });

    let done, value;

    const result = {
      valid: true,
      errors: []
    };

    do {

      try {

        // get the next line
        const res = await iterator.next();
        ({
          done,
          value
        } = res);

        /*
         * in 'forceCast' mode, bad lines will be
         * replaced with an error instance
         */
        if (value instanceof TableSchemaError) {
          // resolve the errors
          const errors = _resolveErrors(resource, value);
          result.errors = result.errors.concat(errors);
        }
      } catch (e) {

        // resolve the errors
        const errors = _resolveErrors(resource, e);
        result.errors = result.errors.concat(errors);
      }

    } while (!done);

    // if there are errors, mark the
    // result as invalid
    if (result.errors.length > 0) {
      result.valid = false;
    } else {
      delete result.errors;
    }

    return result;

  }

}

/*
 * Private Methods
 */

/**
 * Checks whether a resource physically
 * exists.
 *
 * @param  {[type]} resource [description]
 * @return {[type]}          [description]
 */
const _checkIfResourceExists = async (resource) => {

  try {

    // Remote source
    if (resource.remote) {
      const response = await axios.head(resource.source);
      return (response.status === 200);
    }

    // Local source
    return fs.existsSync(resource.source);

  } catch (e) {
    return false;
  }
};


/**
 * Resolves an error.
 *
 * @param  {[type]} resource [description]
 * @param  {[type]} e    [description]
 * @return {[type]}          [description]
 */
const _resolveErrors = (resource, e) => {

  const errors = [];

  try {

    // get the error details and add it to
    // the result list
    if (e instanceof TableSchemaError) {

      if (e.errors.length > 0) {

        for (const err of e.errors) {

          const {
            columnNumber,
            rowNumber,
            message
          } = err;

          const error = {
            col: columnNumber,
            row: rowNumber,
            description: message
          };

          errors.push(error);
        }
      } else {

        const error = {
          col: e.columnNumber,
          row: e.rowNumber,
          description: e.message
        };

        errors.push(error);
      }
    } else if (e instanceof DataValidationError) {
      const error = {
        description: e.message
      };

      errors.push(error);
    }

    // enrich errors with details
    for (const error of errors) {
      _addErrorDetails(resource, error);
    }

  } catch (e) {
    console.error(`Failed to resolve errors [${e.message}]`);
  }

  return errors;

};

/**
 * Enriches a validation error with
 * extra details.
 *
 * @param {[type]} error [description]
 */
const _addErrorDetails = (resource, error) => {

  // headers do not match schema fields
  if (error.description === 'The column header names do not match the field names in the schema') {

    // get the field names
    const fields = _.map(resource.schema.fields, 'name');
    error.details = ['According the the schema, the data table should have the following fields in this exact order',
      ` [${fields}].`,
      ' All table field columns should be present and with the same name as defined in the schema',
      ' even if they are defined as optional (see https://frictionlessdata.io/specs/table-schema/#descriptor).'
    ].join('');

  }


};
