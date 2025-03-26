import Joi from 'joi';

// User signup validation schema
export const validateSignup = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 3 characters',
      'string.max': 'Name must be less than 50 characters',
    }),
    email: Joi.string().email().allow('').messages({
      'string.email': 'Invalid email address',
    }),
    phone: Joi.string()
      .pattern(/^\d{10}$/)
      .allow('')
      .messages({
        'string.pattern.base': 'Phone number must be 10 digits',
      }),
    password: Joi.string().min(6).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters',
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
      'string.empty': 'Confirm Password is required',
      'any.only': 'Passwords do not match',
    }),
    isOAuth: Joi.boolean(),
  }).custom((value, helpers) => {
    if (!value.email && !value.phone) {
      return helpers.error('any.custom', 'Either email or phone is required');
    }
    return value;
  }).messages({
    'any.custom': 'Either email or phone is required',
  });

  return schema.validate(data, { abortEarly: false });
};
