// Load dependency to help validate environment variables
const envalid = require('envalid')

// Load environment variables from .env file, if it exists
require('dotenv').config()

// Define a custom validator that requires the value to begin with the specified prefix
const nonEmptyStringStartsWith = function (x) {
  return envalid.makeValidator((v) => {
    if (v === '') {
      throw new Error('Value must not be empty')
    }
    if (!v.startsWith(x)) {
      throw new Error(`Must start with ${x}`)
    }
    return v
  })()
}

// Define a custom validator that requires the value to be a non-empty string
const nonEmptyString = envalid.makeValidator((v) => {
  if (v === '') {
    throw new Error('Value must not be empty')
  }
  return v
})

// Define validation schema for environment variables
// For information about each variable, see the comments in .env.example
const EnvVars = envalid.cleanEnv(process.env, {
  SLACK_BOT_TOKEN: nonEmptyStringStartsWith('xoxb-'),
  SLACK_APP_TOKEN: nonEmptyStringStartsWith('xapp-'),

  AIRTABLE_API_KEY: nonEmptyStringStartsWith('key'),
  AIRTABLE_BASE_ID: nonEmptyStringStartsWith('app'),
  AIRTABLE_TABLE_ID: nonEmptyStringStartsWith('tbl'),
  AIRTABLE_PRIMARY_FIELD_NAME: nonEmptyString(),

  LOG_LEVEL: envalid.str({ default: 'info', choices: ['debug', 'info', 'warn', 'error'] })
})

// If we got this far, environment variables have been validated
console.log('✅ Environment variables validated & loaded')

module.exports = {
  EnvVars
}
