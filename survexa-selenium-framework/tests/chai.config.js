const chai = require('chai');

// Enterprise Chai Configuration
chai.config.truncateThreshold = 0; // Prevent truncation of assertion diff outputs
chai.config.includeStack = true;    // Ensure stack trace details are attached to failures

module.exports = chai;
