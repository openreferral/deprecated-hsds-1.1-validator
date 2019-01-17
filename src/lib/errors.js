/**
 * Custom error classes.
 *
 * @author Chris Spilio
 */


/**
 * UnsupportedValidatorError
 */
function UnsupportedValidatorError(message) {
  this.name = 'UnsupportedValidatorError';
  this.message = message || 'Default Message';
  this.stack = (new Error()).stack;
}
UnsupportedValidatorError.prototype = Object.create(Error.prototype);
UnsupportedValidatorError.prototype.constructor = UnsupportedValidatorError;


/**
 * DataValidationError
 */
function DataValidationError(message, {
  row,
  col
} = {}) {
  this.name = 'DataValidationError';
  this.message = message;
  this.row = row;
  this.col = col;
}
DataValidationError.prototype = Object.create(Error.prototype);
DataValidationError.prototype.constructor = DataValidationError;
DataValidationError.prototype.toString = function() {
  return `Row: ${this.row}, Col: ${this.col} ${this.message}`;
};

/**
 * ValidatorError
 */
function ValidatorError(message, errors) {
  this.name = 'ValidatorError';
  this.message = message || 'ValidatorError';
  this.errors = errors;
  // this.stack = (new Error()).stack;
}
ValidatorError.prototype = Object.create(Error.prototype);
ValidatorError.prototype.constructor = ValidatorError;


/*
 * Exports
 */
module.exports = {
  UnsupportedValidatorError,
  DataValidationError,
  ValidatorError
};
