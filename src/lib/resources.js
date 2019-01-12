import _ from 'lodash';

const SCHEMA_DATAPACKAGE = require('./datapackage.json');


/**
 * Class used for validating
 * Open Referral resources.
 *
 * @type Validator
 */
export class Resources {


  /**
   * Returns the schema
   * for that maps to
   * the selected resource type
   * @return {[type]} [description]
   */
  static get types() {

    const resources = _.map(SCHEMA_DATAPACKAGE.resources, (o) => o.name);
    return resources;
  }

  /**
   * Returns all resource definitions
   * from the spec.
   * @param  {[type]} type [description]
   * @return {[type]}      [description]
   */
  static getDefinitions(schema = false) {

    // clone the definition
    let resources = _.cloneDeep(SCHEMA_DATAPACKAGE.resources);

    if (!schema) {
      resources = _.forEach(resources, (o) => delete o.schema);
    }

    return resources;
  }

  /**
   * Returns the definion
   * according to schema
   * of the requested resource
   * type.
   * @param  {[type]} type [description]
   * @return {[type]}      [description]
   */
  static getDefinition(type, schema = false) {

    // get the registered resource types
    const {
      types
    } = Resources;

    if ((!type) || (types.indexOf(type.toLowerCase()) === -1)) {
      throw new Error(`Invalid resource type ${type}`);
    }

    // get the resources section
    const resources = _.cloneDeep(SCHEMA_DATAPACKAGE.resources);

    // locate the requested resource type
    const resource = _.find(resources, (o) => o.name === type.toLowerCase());

    if (!resource) {
      throw new Error(`Definition for resource ${type} was not found in spec`);
    }

    // capitalize the title
    resource.title = _.capitalize(resource.name.split('_').join(' '));

    if (!schema) {
      delete resource.schema;
    } else {
      // enrich the keys info
      const {
        schema
      } = resource;

      const pk = schema.primaryKey[0];

      const match = _.find(schema.fields, {
        name: pk
      });
      if (match) {
        match.keys = {
          primary: true
        };
      }

      const fks = schema.foreignKeys;
      if (fks) {
        _.each(fks, (fk) => {
          const field = fk.fields[0];
          const match = _.find(schema.fields, {
            name: field
          });
          if (match) {
            match.keys = match.keys || {};
            match.keys.foreign = match.keys.foreign || [];
            match.keys.foreign.push({
              resource: fk.reference.resource,
              field: fk.reference.fields[0]
            });
          }
        });
      }
    }

    return resource;
  }

}
