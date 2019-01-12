const Joi = require('joi');


/**
 * [StoryInput description]
 * @type {[type]}
 */
const Resource = Joi.object().keys({
  name: Joi.string()
    .description('The name of the resource'),
  title: Joi.string()
    .description('The resource title'),
  description: Joi.string()
    .description('A description of the resource'),
  schema: Joi.any()
}).meta({
  className: 'Resource',
  description: 'Describes an Open Referral logical resource'
});


module.exports.Resource = Resource;
