# Menuet

Menuet is a web application development framework.

## Project Structure Example

The following is a default project structure.

```text
/
 ├─ config
 │   ├─ development.json
 │   └─ production.json
 ├─ utils
 │   └─ ...
 ├─ interceptors
 │   └─ ...
 ├─ controllers
 │   └─ ...
 ├─ services
 │   └─ ...
 ├─ models
 │   └─ ...
 ├─ resolvers
 │   ├─ default.js
 │   └─ error.js
 ├─ views
 │   └─ ...
 ├─ routes
 │   └─ ...
 ├─ schemas
 │   └─ ...
 ├─ public
 │   ├─ css
 │   ├─ js
 │   │   ├─ lib
 │   │   │   └─ ...
 │   │   └─ ...
 │   └─ ...
 ├─ static
 │   └─ ...
 ├─ node_modules
 │   ├─ .bin
 │   │   └─ ...
 │   └─ ...
 ├─ .editorconfig
 ├─ .eslintrc
 ├─ .eslintignore
 ├─ .gitignore
 ├─ package.json
 └─ app.json
```

## Full Configuration Example

The following JSON file describes a default configuration.

```json
{
  "defaults": {
    "language": "en"
  },
  "http": {
    "port": 3000,
    "jsonParser": {
      "limit": "2mb"
    },
    "urlencodedParser": {
      "limit": "2mb",
      "extended": true
    },
    "cookieParser": "secret",
    "allowCrossDomainAccess": true,
    "router": {
      "caseSensitive": true,
      "mergeParams": true,
      "strict": true
    },
    "base": "/"
  },
  "paths": {
    "public": "public",
    "static": "static",
    "views": "views",
    "strings": "public/assets/strings",
    "schemas": "schemas",
    "utils": "utils",
    "models": "models",
    "services": "services",
    "interceptors": "interceptors",
    "controllers": "controllers",
    "defaultResolver": "resolvers/default.js",
    "errorResolver": "resolvers/error.js",
    "routes": "routes"
  },

  "mongo": {
    "host": "127.0.0.1",
    "port": 27017,
    "db": "********",
    "username": "********",
    "password": "********"
  },
  "redis": {
    "host": "127.0.0.1",
    "port": 6379,
    "password": "********"
  },
  "smtp": {
    "host": "smtp.example.com",
    "port": 25,
    "secure": false,
    "auth": {
      "user": "********@example.com",
      "pass": "********"
    }
  }
}
```

There's no need setting `defaults`, `http` and `paths` in your own configuration file if there's no changes.

A configuration file should be placed in `/config` path, and will be loaded if its name matched `NODE_ENV` environment variable.

Configuration data can be injected into **utilities**, **models**, **services**, **interceptors**, **controllers** and **resolvers** by name `$config`.

## Utility Example

/utils/crypto.js:

```js
'use strict';

const crypto = require('crypto');

/**
 * Crypto utility.
 * @returns {{
 *   sha256: function
 * }}
 */
module.exports = function() {

  return {

    /**
     * Get SHA-256 digest of a string.
     * @param {string} string
     * @returns {string}
     */
    sha256: string => {
      return crypto.createHash('sha256').update(string).digest('hex');
    }

  };

};
```

The above script will be loaded by utility loader automatically, and named as `CryptoUtil`.

Utilities can be injected into **models**, **services**, **interceptors**, **controllers** and **resolvers**.

## Model Example

/models/user.js:

```js
'use strict'

/**
 * User schema.
 * @param {function} Schema
 * @param {object} Schema.statics
 * @param {function} ObjectId
 * @param {object} CryptoUtil
 * @returns {Schema}
 */
module.exports = function(Schema, ObjectId, CryptoUtil) {

  // user's schema
  let userSchema = new Schema(
    {
      name: String,
      username: String,
      password: String
    },
    { collection: 'users' }
  );

  // encrypt password before save
  userSchema.pre('save', function(next) {
    this._id = new ObjectId();
    this.set('password', CryptoUtil.sha256(this._id + this.password));
  });

  return userSchema;
};
```

Parameters will be injected automatically by loaders during startup.

The following components are available for model definitions:

- `Schema`: [mongoose schema](http://mongoosejs.com/docs/guide.html) constructor
- `ObjectId`: [mongodb Object ID](https://mongodb.github.io/node-mongodb-native/api-bson-generated/objectid.html) constructor
- `$redis`: Redis client wrapper
- `$config`: configuration data
- `$string`: internationalization utility
- `$utils`: utilities shipped by the framework
- utilities defined by scripts under path `/utils` (e.g.: `CryptoUtil`)

The return value is an instance of `Schema`, and the framework will use it to register a [mongoose model](http://mongoosejs.com/docs/models.html).

In the above example, the model will be named as `UserModel`.

Models can be injected into **services**.

## Service Example

/services/user.js

```js
'use strict';

/**
 * User service.
 * @param {function} UserModel
 * @returns {{
 *   create: function,
 *   isUsernameAvailable: function
 * }}
 */
module.exports = function(UserModel) {

  return {

    /**
     * Create user.
     * @param {object} user
     * @returns {Promise}
     */
    create: function(user) {
      return (new UserModel(user)).save();
    },

    /**
     * Check if username is available for signing up.
     * @param {string} username
     * @returns {Promise}
     */
    isUsernameAvailable: async function(username) {
      return await UserModel.count({ username: username }) === 0;
    }

  };

};
```

The following components are available for service definitions:

- `$config`: configuration data
- `$string`: internationalization utility
- `$utils`: utilities shipped by the framework
- utilities defined by scripts under path `/utils` (e.g.: `CryptoUtil`)
- models defined by scripts under path `/models` (e.g.: `UserModel`)

In the above example, the service will be named as `UserService`.

Services can be injected into **interceptors**, **controllers** and **resolvers**.

## Interceptor Example

*TODO: write description here.*

## Controller Example

*TODO: write description here.*

## Resolver Example

### Default Resolver

*TODO: write description here.*

### Error Resolver

*TODO: write description here.*

## Route Definition Example

*TODO: write description here.*

## Internationalization

*TODO: write description here.*
