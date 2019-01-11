import {
  Table
} from 'tableschema';
import {
  TableSchemaError
} from 'tableschema/lib/errors';
import {
  PassThrough
} from 'stream';
import csv from 'csv';
import zipObject from 'lodash/zipObject';
import isEqual from 'lodash/isEqual';
import S2A from 'stream-to-async-iterator';
import {
  Schema
} from 'tableschema/lib/schema';

/**
 * Class used for validating
 * Open Referral resources.
 *
 * @type Validator
 */
export class TableExt extends Table {

  static async load(source, {
    schema,
    strict = false,
    headers = 1,
    ...parserOptions
  } = {}) {

    // Load schema
    if (schema && !(schema instanceof Schema)) {
      schema = await Schema.load(schema, {
        strict
      });
    }

    return new TableExt(source, {
      schema,
      strict,
      headers,
      ...parserOptions
    });
  }

  async iter({
    keyed,
    extended,
    cast = true,
    relations = false,
    stream = false
  } = {}) {
    let source = this._source;

    // Prepare unique checks
    let uniqueFieldsCache = {};
    if (cast) {
      if (this.schema) {
        uniqueFieldsCache = this.createUniqueFieldsCache(this.schema);
      }
    }

    // Multiplicate node stream
    if (source.readable) {
      const duplicateStream = this._source.pipe(new PassThrough());
      this._source = duplicateStream.pipe(new PassThrough());
      source = duplicateStream.pipe(new PassThrough());
    }

    // Get row stream
    const rowStream = await this.createRowStream(source, this._parserOptions);

    // Get table row stream
    let rowNumber = 0;
    let tableRowStream = rowStream.pipe(csv.transform(row => {
      rowNumber += 1;

      // Get headers
      if (rowNumber === this._headersRow) {
        this._headers = row;
        return;
      }

      // Check headers
      if (cast) {
        if (this.schema && this.headers) {
          if (!isEqual(this.headers, this.schema.fieldNames)) {
            const error = new TableSchemaError('The column header names do not match the field names in the schema');
            error.rowNumber = rowNumber;
            throw error;
          }
        }
      }

      // Cast row
      if (cast) {
        if (this.schema) {
          try {
            row = this.schema.castRow(row);
          } catch (error) {
            error.rowNumber = rowNumber;
            error.errors.forEach(error => {
              error.rowNumber = rowNumber;
            });
            throw error;
          }
        }
      }

      // Check unique
      if (cast) {
        for (const [indexes, cache] of Object.entries(uniqueFieldsCache)) {
          const splitIndexes = indexes.split(',').map(index => parseInt(index, 10));
          const values = row.filter((value, index) => splitIndexes.includes(index));
          if (!values.every(value => value === null)) {
            if (cache.data.has(values.toString())) {
              const error = new TableSchemaError(`Row ${rowNumber} has an unique constraint ` +
                `violation in column "${cache.name}"`);
              error.rowNumber = rowNumber;
              throw error;
            }
            cache.data.add(values.toString());
          }
        }
      }

      // Resolve relations
      if (relations) {
        if (this.schema) {
          for (const foreignKey of this.schema.foreignKeys) {
            row = this.resolveRelations(row, this.headers, relations, foreignKey);
            if (row === null) {
              const error = new TableSchemaError(`Foreign key "${foreignKey.fields}" violation in row ${rowNumber}`);
              error.rowNumber = rowNumber;
              throw error;
            }
          }
        }
      }

      // Form row
      if (keyed) {
        row = zipObject(this.headers, row);
      } else if (extended) {
        row = [rowNumber, this.headers, row];
      }

      return row;
    }));

    // Form stream
    if (!stream) {
      tableRowStream = new S2A(tableRowStream);
    }

    return tableRowStream;
  }


}


module.exports = TableExt;
