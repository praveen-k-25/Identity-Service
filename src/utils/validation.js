const joi = require("joi");

const validateRegistration = (data) => {
  const schema = joi.object({
    username: joi.string().min(6).max(20).required(),
    nickname: joi.string().required(),
    email: joi.string().required(),
    password: joi.string().valid(joi.ref("confirmPassword")).min(6).required(),
    confirmPassword: joi.string().min(6).required(),
  });
  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = joi.object({
    email: joi.string().required(),
    password: joi.string().min(6).required(),
  });
  return schema.validate(data);
};

module.exports = {validateRegistration, validateLogin};
