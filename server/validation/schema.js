/**
 * Lightweight, zero-dependency declarative schema validation helper.
 */

export class SchemaField {
  constructor(type) {
    this.type = type;
    this.isRequired = false;
    this.rules = [];
  }

  required(msg) {
    this.isRequired = true;
    this.requiredMsg = msg || 'This field is required';
    return this;
  }

  min(lengthOrVal, msg) {
    this.rules.push((val) => {
      if (val === undefined || val === null || val === '') return null;
      if (typeof val === 'string' || Array.isArray(val)) {
        return val.length < lengthOrVal
          ? msg || `Must be at least ${lengthOrVal} characters/items long`
          : null;
      }
      if (typeof val === 'number') {
        return val < lengthOrVal ? msg || `Must be at least ${lengthOrVal}` : null;
      }
      return null;
    });
    return this;
  }

  max(lengthOrVal, msg) {
    this.rules.push((val) => {
      if (val === undefined || val === null || val === '') return null;
      if (typeof val === 'string' || Array.isArray(val)) {
        return val.length > lengthOrVal
          ? msg || `Must not exceed ${lengthOrVal} characters/items`
          : null;
      }
      if (typeof val === 'number') {
        return val > lengthOrVal ? msg || `Must not exceed ${lengthOrVal}` : null;
      }
      return null;
    });
    return this;
  }

  email(msg) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.rules.push((val) => {
      if (!val) return null;
      return !emailRegex.test(String(val).trim())
        ? msg || 'Please provide a valid email address'
        : null;
    });
    return this;
  }

  enum(allowedValues, msg) {
    this.rules.push((val) => {
      if (val === undefined || val === null || val === '') return null;
      return !allowedValues.includes(val)
        ? msg || `Value must be one of: ${allowedValues.join(', ')}`
        : null;
    });
    return this;
  }

  validate(value, fieldName = 'field') {
    const errors = [];

    if (value === undefined || value === null || value === '') {
      if (this.isRequired) {
        errors.push(`${fieldName}: ${this.requiredMsg}`);
      }
      return errors;
    }

    if (this.type === 'string' && typeof value !== 'string') {
      errors.push(`${fieldName} must be a string`);
      return errors;
    }
    if (this.type === 'number' && typeof value !== 'number' && isNaN(Number(value))) {
      errors.push(`${fieldName} must be a number`);
      return errors;
    }
    if (this.type === 'array' && !Array.isArray(value)) {
      errors.push(`${fieldName} must be an array`);
      return errors;
    }
    if (this.type === 'boolean' && typeof value !== 'boolean') {
      errors.push(`${fieldName} must be a boolean`);
      return errors;
    }

    for (const rule of this.rules) {
      const err = rule(value);
      if (err) {
        errors.push(`${fieldName}: ${err}`);
      }
    }

    return errors;
  }
}

export const string = () => new SchemaField('string');
export const number = () => new SchemaField('number');
export const boolean = () => new SchemaField('boolean');
export const array = () => new SchemaField('array');
export const any = () => new SchemaField('any');

export const object = (shape) => {
  return {
    validate: (data = {}) => {
      const errors = [];
      if (!data || typeof data !== 'object') {
        return ['Request body must be a valid object'];
      }
      for (const [key, fieldValidator] of Object.entries(shape)) {
        if (fieldValidator && typeof fieldValidator.validate === 'function') {
          const fieldErrors = fieldValidator.validate(data[key], key);
          errors.push(...fieldErrors);
        }
      }
      return errors;
    },
  };
};
