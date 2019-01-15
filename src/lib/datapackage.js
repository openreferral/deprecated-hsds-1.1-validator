import {
  Package
} from 'datapackage';

import _ from 'lodash/core';

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
    this.datapackage = datapackage;
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
    return this.datapackage.resourceNames;
  }

  /**
   * Returns a list of high-level resource
   * definitions.
   *
   * @return {[type]} [description]
   */
  get resources() {

    return _.map(this.datapackage.resources, (o) => ({
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
    const resource = this.datapackage.getResource(name);

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
   * Validates an input data source against
   * a resource specific schema.
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  async validateResource(source, resourceName, {
    headersRow
  } = {}) {

    try {

      if (typeof source === 'undefined') {
        throw new DataValidationError('A valid data source is required');
      }

      if (typeof resourceName === 'undefined') {
        throw new DataValidationError('A valid Open Referral resource name should be provided');
      }

      // get the selected resource definition
      const resource = this.datapackage.getResource(resourceName);

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

            result.valid = false;

            // get the error details and add it to
            // the result list
            const error = (value.errors.length > 0 ? value.errors[0] : value);
            const {
              columnNumber,
              rowNumber,
              message
            } = error;
            result.errors.push({
              col: columnNumber,
              row: rowNumber,
              description: message
            });
          }
        } catch (e) {

          const error = e.errors[0];
          const {
            columnNumber,
            rowNumber,
            message
          } = error;
          throw new DataValidationError({
            row: rowNumber,
            col: columnNumber,
            description: message
          });
        }

      } while (!done);

      return result;

    } catch (e) {
      throw e;
    }
  }

}
