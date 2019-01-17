const Joi = require('joi');


const ValidationError = Joi.object().keys({
  col: Joi.number()
    .description('The column number of the bad entry'),
  row: Joi.number()
    .description('The row number of the bad entry'),
  description: Joi.string()
    .description('A description about the problem'),
  details: Joi.string()
    .description('Extra details for guiding the client on how to resolve the issue')
}).meta({
  className: 'ValidationError',
  description: 'Describes an error that occured during a data resource validation'
});

const ValidationResult = Joi.object().keys({
  resource: Joi.string()
    .description('The resource name'),
  valid: Joi.boolean().required().description('Status flag indicating whether the resource is valid or not'),
  errors: Joi.array().items(ValidationError).description('A collection of validation errors')
}).meta({
  className: 'ValidationResult',
  description: 'Resource validation result'
});


module.exports = {
  ValidationError,
  ValidationResult
};
