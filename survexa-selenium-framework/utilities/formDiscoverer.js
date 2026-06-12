const fs = require('fs');
const path = require('path');
const config = require('../config/selenium.config');
const logger = require('./logger');

class FormDiscoverer {
  
  /**
   * Statically parses validators.js to extract form validation rules
   */
  static discoverValidationRules() {
    try {
      const validatorsPath = config.reactValidatorsPath;
      if (!fs.existsSync(validatorsPath)) {
        logger.warn(`Validators configuration file not found at ${validatorsPath}. Using default schema.`);
        return this.getDefaultRules();
      }

      const content = fs.readFileSync(validatorsPath, 'utf8');
      const rules = {
        login: {},
        signup: {}
      };

      // 1. Parse Login validators
      // Extract validateLogin function body
      const loginBodyMatch = content.match(/function\s+validateLogin\s*\(\{[\s\S]*?\}\)\s*\{([\s\S]*?)return\s+/);
      if (loginBodyMatch) {
        const body = loginBodyMatch[1];
        this.parseValidationLines(body, rules.login);
      }

      // 2. Parse Signup validators
      // Extract validateSignup function body
      const signupBodyMatch = content.match(/function\s+validateSignup\s*\(\{[\s\S]*?\}\)\s*\{([\s\S]*?)return\s+/);
      if (signupBodyMatch) {
        const body = signupBodyMatch[1];
        this.parseValidationLines(body, rules.signup);
      }

      logger.info(`FormDiscoverer: Successfully parsed validation rules for: ${Object.keys(rules).join(', ')}`);
      
      // Merge with default rules if parsing was incomplete
      if (Object.keys(rules.login).length === 0) rules.login = this.getDefaultRules().login;
      if (Object.keys(rules.signup).length === 0) rules.signup = this.getDefaultRules().signup;

      return rules;

    } catch (error) {
      logger.error(`Failed to parse React validators: ${error.message}. Returning default schema.`);
      return this.getDefaultRules();
    }
  }

  /**
   * Helper to parse individual validation lines using regex
   */
  static parseValidationLines(body, formRules) {
    const lines = body.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) continue;

      // Match patterns like: if (!isValidEmail(email)) errors.email = 'Enter a valid email address'
      // Or: if (!isRequired(password)) errors.password = 'Password is required'
      // Or: if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match'

      if (trimmed.includes('errors.')) {
        const fieldMatch = trimmed.match(/errors\.(\w+)\s*=\s*'([^']*)'/);
        if (fieldMatch) {
          const fieldName = fieldMatch[1];
          const errorMsg = fieldMatch[2];

          if (!formRules[fieldName]) {
            formRules[fieldName] = { rules: [] };
          }

          if (trimmed.includes('isRequired') || trimmed.includes('!form.') || trimmed.includes('!identifier')) {
            formRules[fieldName].rules.push({
              type: 'required',
              errorMsg
            });
          } else if (trimmed.includes('isValidEmail')) {
            formRules[fieldName].rules.push({
              type: 'email',
              errorMsg,
              testValue: 'invalid-email-format'
            });
          } else if (trimmed.includes('isStrongPassword') || trimmed.includes('length <')) {
            formRules[fieldName].rules.push({
              type: 'minLength',
              length: 8,
              errorMsg,
              testValue: '123'
            });
          } else if (trimmed.includes('!==')) {
            formRules[fieldName].rules.push({
              type: 'matches',
              targetField: 'password',
              errorMsg,
              testValue: 'mismatchedPassword'
            });
          }
        }
      }
    }
  }

  static getDefaultRules() {
    return {
      login: {
        identifier: {
          rules: [
            { type: 'required', errorMsg: 'Email is required' },
            { type: 'email', errorMsg: 'Enter a valid email address', testValue: 'invalid-email-format' }
          ]
        },
        password: {
          rules: [
            { type: 'required', errorMsg: 'Password is required' }
          ]
        }
      },
      signup: {
        name: {
          rules: [
            { type: 'required', errorMsg: 'Full name is required' }
          ]
        },
        email: {
          rules: [
            { type: 'required', errorMsg: 'Email is required' },
            { type: 'email', errorMsg: 'Enter a valid email', testValue: 'invalid-email-format' }
          ]
        },
        phone: {
          rules: [
            { type: 'required', errorMsg: 'Mobile number is required' },
            { type: 'phone', errorMsg: 'Enter a valid mobile number', testValue: '12345' }
          ]
        },
        password: {
          rules: [
            { type: 'required', errorMsg: 'Password is required' },
            { type: 'minLength', length: 8, errorMsg: 'Min. 8 characters', testValue: 'short' }
          ]
        },
        confirmPassword: {
          rules: [
            { type: 'matches', targetField: 'password', errorMsg: 'Passwords do not match', testValue: 'mismatch' }
          ]
        }
      }
    };
  }
}

module.exports = FormDiscoverer;
