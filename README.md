# Menuet Web 应用开发框架

Menuet Web 应用开发框架旨在提高 Web 应用开发效率，规范项目开发流程。

Menuet 基于 [proding.net](https://proding.net/spec/backend) 的设计规范实现。

Menuet Web 应用开发框架具有以下特点：

- 自动实现业务分层：将个业务分层的模块的定义文件置于相应的路径下即可；
- 模块间调用通过注入的方式实现：如果模块A的业务逻辑依赖于模块B，那么只需将模块B的名称作为模块A定义函数的参数（即依赖注入），模块A即可调用模块B；
- 规范了模块之间的调用关系：例如只可向服务层的模块注入工具模块和数据模型，服务模块不可依赖其他服务；
- 使用 JSON Schema 对请求数据及响应数据进行校验；
- 可根据路由定义及 JSON Schema 定义自动生成 API 文档。

运行 Menuet Web 应用开发框架需要 Node.js v7.0.0 或以上版本。

## 配置依赖模块

使用 Menuet Web 应用开发框架前需要在工程的 `package.json` 文件的 `dependencies` 字段中添加 `menuet` 模块的依赖。

```json
{
  "dependencies": {
    "menuet": "*"
  }
}
```

安装依赖包后即可使用 `menuet` 初始化工程。

```shell
$ npm install
```

## 初始化工程

在 `package.json` 中添加以下脚本：

```json
{
  "scripts": {
    "init": "menuet-init"
  }
}
```

执行该脚本，Menuet Web 应用开发框架将使用示例工程代码初始化当前工程，本说明文档将以该示例工程展开说明。

```shell
> npm run init
```

> 注意：初始化后，工程目录下的文件将会被示例工程代码替换，包括 `package.json` 文件。开始正式开发前，请将示例工程的 `package.json` 中的 `init` 脚本配置删除。

## 默认工程结构

```text
/
  ├─ config
  │    ├─ development.json
  │    ├─ production.json
  │    └─ api-docs.json
  ├─ public
  │    └─ **
  ├─ static
  │    └─ **.json
  ├─ views
  │    └─ *.ejs
  ├─ schemas
  │    ├─ **.json
  │    ├─ keywords.js
  │    └─ formats.js
  ├─ utils
  │    └─ *.js
  ├─ models
  │    └─ *.js
  ├─ services
  │    └─ *.js
  ├─ interceptors
  │    └─ *.js
  ├─ controllers
  │    └─ *.js
  ├─ resolvers
  │    ├─ default.js
  │    └─ error.js
  ├─ routes
  │    └─ *.json
  ├─ package.json
  └─ init.js
```

|文件|说明|
|:---|:---|
|`/config/development.json`|开发环境配置文件|
|`/config/production.json`|产品环境配置文件|
|`/config/api-docs.json`|文档生成工具配置文件|
|`/public/**`|静态资源文件|
|`/static/**`|静态化文件|
|`/view/*.ejs`|视图模板文件|
|`/schemas/keywords.js`|自定义 JSON Schema 关键字定义文件，输出一个关键字与关键字定义的 Map，关键字定义请参考[AJV: Defining custom keywords](https://epoberezkin.github.io/ajv/custom.html#reporting-errors-in-custom-keywords)|
|`/schemas/formats.js`|自定义 JSON Schema 格式定义文件，输出一个格式名与格式正则表达式的 Map|
|`/schemas/**.json`|JSON Schema 定义文件|
|`/utils/*.js`|工具模块定义文件，模块定义及调用方法详见下文|
|`/models/*.js`|数据模型定义文件，数据模型定义及调用方法详见下文|
|`/services/*.js`|服务模块定义文件，服务定义及调用方法详见下文|
|`/interceptors/*.js`|拦截器定义文件，拦截器定义及调用方法详见下文|
|`/controllers/*.js`|控制器定义文件，控制器定义及调用方法详见下文|
|`/resolvers/default.js`|默认请求结果解析器定义文件|
|`/resolvers/error.js`|错误结果解析器定义文件|
|`/routes/*.js`|路由定义文件|
|`/package.json`|包定义文件|
|`/init.js`|工程初始化逻辑定义文件|

> 工程结构可通过设置配置文件的 `paths` 字段更改，详见下文。

## 工程配置文件

请将工程配置文件置于工程的 `/config` 路径下，文件名为运行环境名称，如 `development.json`、`production.json`。

默认配置内容：

```json
{
  "defaults": {
    "language": "en",
    "domain": "127.0.0.1:3000"
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
    "routes": "routes",
    "init": "init.js"
  }
}
```

|字段|说明|可选值/备注|
|:---|:---|:---|
|`defaults.language`|默认语言|`en`、`zh-cn` 等|
|`defaults.domain`|域名|&nbsp;|
|`http.port`|HTTP 服务端口|&nbsp;|
|`http.jsonParser`|JSON 解析中间件配置参数|[参考链接：bodyParser.json([options])](https://github.com/expressjs/body-parser#bodyparserjsonoptions)|
|`http.urlencodedParser`|URL encoded 解析中间件配置参数|[参考链接：bodyParser.urlencoded([options])](https://github.com/expressjs/body-parser#bodyparserurlencodedoptions)|
|`http.cookieParser`|Cookie 解析中间件 secret 参数|&nbsp;|
|`http.allowCrossDomainAccess`|是否允许浏览器跨域访问|&nbsp;|
|`http.router`|Express 路由器配置参数|[参考链接：express.Router([options])](http://expressjs.com/en/4x/api.html#express.router)|
|`http.base`|API 接口的跟路径|&nbsp;|
|`paths.public`|静态资源保存文件夹路径|&nbsp;|
|`paths.static`|API 响应结果静态化文件保存文件夹路径|&nbsp;|
|`paths.views`|EJS 模板保存文件夹路径|&nbsp;|
|`paths.strings`|多语言字典文件保存文件夹路径|不同语言的字典文件名根据语言名称命名，如 `en.json`、`zh-cn.json` 等|
|`paths.schemas`|请求/响应数据 JSON Schema 文件保存路径，遵循 `JSON Schema Draft-06` 标准|[参考连接：JSON schema](http://json-schema.org/)|
|`paths.utils`|工具模块保存文件夹路径|&nbsp;|
|`paths.models`|MongoDB 数据模型保存文件夹路径|&nbsp;|
|`paths.services`|服务模块保存文件夹路径|&nbsp;|
|`paths.interceptors`|拦截器定义文件保存文件夹路径|&nbsp;|
|`paths.controllers`|控制器定义文件保存文件夹路径|&nbsp;|
|`paths.defaultResolver`|正常结果解析器文件路径|&nbsp;|
|`paths.errorResolver`|错误结果解析器文件路径|&nbsp;|
|`paths.routes`|路由定义文件保存文件夹路径|&nbsp;|
|`paths.init`|工程初始化文件路径|&nbsp;|

使用单实例 MongoDB 时添加以下配置内容：

```json
{
  "mongo": {
    "host": "HOST",
    "port": "PORT",
    "db": "DATABASE_NAME",
    "username": "USERNAME",
    "password": "PASSWORD"
  }
}
```

|字段|说明|可选值/备注|
|:---|:---|:---|
|`mongo.host`|数据库服务器 IP 地址|配置产品环境时应使用内网 IP 地址|
|`mongo.port`|mongod 进程端口，默认：27017|&nbsp;|
|`mongo.db`|数据库名称|&nbsp;|
|`mongo.username`|用户名|&nbsp;|
|`mongo.password`|密码|&nbsp;|

使用 MongoDB 复制集时添加以下配置内容：

```json
{
  "mongo": {
    "hosts": [
      {
        "host": "HOST_1",
        "port": "PORT_1"
      },
      {
        "host": "HOST_n",
        "port": "PORT_n"
      }
    ],
    "replicaSet": "REPLICA_SET_NAME",
    "db": "DATABASE_NAME",
    "username": "USERNAME",
    "password": "PASSWORD"
  }
}
```

|字段|说明|可选值/备注|
|:---|:---|:---|
|`mongo.hosts.host`|数据库服务器 IP 地址|配置产品环境时应使用内网 IP 地址|
|`mongo.hosts.port`|mongod 进程端口，默认：27017|&nbsp;|
|`mongo.replicaSet`|复制集名称|&nbsp;|
|`mongo.db`|数据库名称|&nbsp;|
|`mongo.username`|用户名|&nbsp;|
|`mongo.password`|密码|&nbsp;|

使用 Redis 时添加以下配置内容：

```json
{
  "redis": {
    "host": "HOST",
    "port": "PORT",
    "password": "PASSWORD"
  }
}
```

|字段|说明|可选值/备注|
|:---|:---|:---|
|`redis.host`|数据库服务器 IP 地址|配置产品环境时应使用内网 IP 地址|
|`redis.port`|redis-server 进程端口，默认：6379|&nbsp;|
|`redis.password`|密码|&nbsp;|

可以扩展配置文件的内容以供具体业务使用。

## 模块的业务分层及调用约束

根据业务分层，模块被分为以下几类：

|模块|作用|可调用（注入）的模块|
|:---|:---|:---|
|工具（Utilities）|用于实现与业务无关的功能，如图像压缩处理、数据加密等|工程配置信息、其他工具模块|
|数据模型（Models）|定义实体的数据结构，实现对实体的操作逻辑|工程配置信息、工具模块|
|服务（Services）|实现特定的业务逻辑|工程配置信息、工具模块、数据模型|
|拦截器（Interceptors）|接收到客户端请求并完成路由后执行的处理，如权限检查、上传文件解析等|工程配置信息、工具模块、服务模块|
|控制器（Controllers）|调用不同的服务完成特定的业务处理|工程配置信息、工具模块、服务模块|
|解析器（Resolvers）|对控制器的执行结果进行解析、再组装，并返回给客户端，如 HTTP 状态码设置，错误消息封装等|工程配置信息、工具模块、服务模块|

> 工程配置信息通过 `$config` 参数名注入。

## 定义工具（Utilities）

工具定义模块输出一个函数（工厂模式），该函数返回一个对象作为工具的实例。

工具模块的全局名称将为文件名驼峰化加 `Util` 的形式（例如下面例子中 `/utils/crypto.js` 生成的模块将被命名为 `CryptoUtil`）。

> 若要自定义模块名称，可以在定义函数上添加 `moduleName` 符号属性，其值即为模块名称（例如下面例子中 `/utils/errors.js` 生成的模块将被命名为 `Errors`）。

可以通过工具模块的名称向数据模型、服务、拦截器、控制器、解析器的定义函数注入工具模块。

```javascript
// /utils/crypto.js
'use strict';

const crypto = require('crypto');

/**
 * 取得指定字符串指定摘要算法的摘要。
 *
 * @param {string} algorithm 摘要算法，如 md5、sha256、sha384、sha512 等
 * @param {string} string 输入字符串
 * @param {boolean} [base64=false] 是否以 base64 格式编码，默认以十六进制形式（hex）编码
 * @param {string} [charset=binary] 字符集，如 ascii、utf8、binary 等
 * @returns {string} 字符串摘要
 */
const digest = (algorithm, string, base64 = false, charset = 'binary') => {

  if (typeof base64 === 'string') {
    charset = base64;
    base64 = false;
  }

  string = (new Buffer(string)).toString(charset);

  return crypto
    .createHash(algorithm)
    .update(string)
    .digest(base64 === true ? 'base64' : 'hex');
};

/**
 * 数据加密工具生成器。
 *
 * @returns {object}
 */
module.exports = () => {

  return {

    /**
     * 生成字符串的 MD5 摘要。
     *
     * @param {string} string 输入字符串
     * @param {boolean} [base64=false] 是否以 base64 格式编码，默认以十六进制形式（hex）编码
     * @param {string} [charset=binary] 字符集，如 ascii、utf8、binary 等
     * @returns {string} 字符串摘要
     */
    md5: (string, base64, charset) => {
      return digest('md5', string, base64, charset);
    },

    /**
     * 生成字符串的 SHA-384 摘要。
     *
     * @param {string} string 输入字符串
     * @param {boolean} [base64=false] 是否以 base64 格式编码，默认以十六进制形式（hex）编码
     * @param {string} [charset=binary] 字符集，如 ascii、utf8、binary 等
     * @returns {string} 字符串摘要
     */
    sha384: (string, base64, charset) => {
      return digest('sha384', string, base64, charset);
    }

  };

};
```

```javascript
// /utils/errors.js
'use strict';

/**
 * 返回错误类。
 *
 * @returns {object}
 */
module.exports = () => {

  /**
   * 登录认证失败错误。
   * @extends {Error}
   */
  class AuthenticationError extends Error {
    constructor(message) {
      super(message);
      this.name = 'AuthenticationError';
      this.statusCode = 401;
    }
  }

  /**
   * 未登录错误。
   * @extends {Error}
   */
  class UnauthorizedError extends Error {
    constructor(message) {
      super(message);
      this.name = 'UnauthorizedError';
      this.statusCode = 401;
    }
  }

  return {
    AuthenticationError,
    UnauthorizedError
  };

};

module.exports[Symbol.for('moduleName')] = 'Errors';
```

## 定义数据模型（Models）

数据模型定义模块输出一个函数（工厂模式），该函数返回一个 [Mongoose 的 Schema](http://mongoosejs.com/docs/guide.html) 实例，框架将使用该 Schema 实例注册一个 [Mongoose 数据模型](http://mongoosejs.com/docs/models.html)。

数据模型的全局名称将为文件名驼峰化加 `Model` 的形式（例如下面例子中的数据模型将被命名为 `UserModel`）。

可以通过数据模型的名称向服务、拦截器、控制器、解析器的定义函数注入数据模型。

```javascript
// /models/user.js
'use strict';

const bcrypt = require('bcrypt');

/**
 * 返回用户实体 Mongoose 数据模式。
 *
 * @returns {mongoose.Schema}
 */
module.exports = (Schema, CryptoUtil) => {

  let userSchema = new Schema(
    {
      // 姓名
      name: String,
      // 头像路径
      avatar: String,
      // 用户账号类型（admin：管理员；user：普通用户）
      type: {
        dataType: String,
        enum: [ 'admin', 'user' ],
        default: 'user'
      },
      // 登录用户名
      username: String,
      // 登录密码
      password: String,
      // 账号创建时间
      createAt: {
        dataType: Date,
        default: Date.now
      }
    },
    {
      collection: 'users',
      typeKey: 'dataType'
    }
  );

  // 定义唯一索引
  userSchema.index({ username: 1 }, { unique: true });

  /**
   * 对登录密码加密。
   *
   * @param {string} password 登录密码
   * @returns {string} 使用 bcrypt 算法加密后的密码
   */
  const encryptPassword = password => {
    return bcrypt.hashSync(CryptoUtil.sha384(password, true), 12);
  };

  // 保存用户登录账号信息前先对登录密码加密
  userSchema.pre('save', function(next) {
    this.set('password', encryptPassword(this.password));
    next();
  });

  /**
   * 校验登录密码。
   *
   * UserModel 的静态方法。
   * @param {string} password 登录密码
   * @param {string} hash 加密后的密码
   * @returns {boolean} 校验是否成功
   */
  userSchema.statics.verifyPassword = (password, hash) => {
    return bcrypt.compareSync(CryptoUtil.sha384(password, true), hash);
  };

  return userSchema;
};

```

## 定义服务（Services）

服务定义模块输出一个函数（工厂模式），该函数返回一个对象作为服务的实例。

数据模型的全局名称将为文件名驼峰化加 `Service` 的形式（例如下面例子中的服务将被命名为 `UserService`）。

可以通过服务的名称向拦截器、控制器、解析器的定义函数注入数据模型。

```javascript
// /services/user.js
'use strict';

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-json-web-token-secret';

/**
 * 生成 JSON Web Token。
 *
 * @param {object} payload
 * @returns {Promise.<string>}
 */
const signJWT = payload => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, JWT_SECRET, (e, token) => {
      e ? reject(e) : resolve(token);
    });
  });
};

/**
 * 验证 JSON Web Token。
 *
 * @param {string} token
 * @returns {Promise.<object>}
 */
const verifyJWT = token => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (e, payload) => {
      e ? reject(e) : resolve(payload);
    });
  });
};

/**
 * 返回用户账号服务实例。
 *
 * @param {function} UserModel 用户账号数据模型
 * @returns {object}
 */
module.exports = (UserModel) => {

  return {

    /**
     * 创建用户账号。
     *
     * @param {object} userInfo 用户信息
     * @param {string} userInfo.name 姓名
     * @param {string} userInfo.type 用户账号类型
     * @param {string} userInfo.username 登录用户名
     * @param {string} userInfo.password 登录密码
     * @returns {Promise.<object>} 返回用户账号信息
     */
    async create(userInfo) {
      return (await (new UserModel(userInfo)).save()).toObject();
    },

    /**
     * 用户登录认证。
     *
     * @param {string} username 登录用户名
     * @param {string} password 登录密码
     * @returns {Promise.<object>} 返回用户账号信息
     */
    async authenticate(username, password) {

      let userDoc = await UserModel
        .findOne({ username: username })
        .lean();

      if (!userDoc || !UserModel.verifyPassword(password, userDoc.password)) {
        throw new Error.AuthenticationError('用户名或密码不正确');
      }

      userDoc.accessToken = await signJWT({
        _id: userDoc._id,
        type: userDoc.type
      });

      return userDoc;
    },

    /**
     * 取得用户账号信息。
     *
     * @returns {Promise.<object>} 返回用户账号信息
     */
    async getProfile(userId) {
      return await UserModel.findOne({ _id: userId }).lean();
    },

    /**
     * 验证访问令牌。
     *
     * @param {string} accessToken
     * @returns {Promise.<object>}
     */
    async verifyAccessToken(accessToken) {
      return await verifyJWT(accessToken);
    },

    /**
     * 更新用户账号信息。
     *
     * @param {string} userId 用户账号 ID
     * @param {object} userData 用户数据
     * @param {string} [userData.avatar] 用户头像
     * @returns {Promise.<void>}
     */
    async update(userId, userData) {

      await UserModel.update(
        { _id: userId },
        { $set: userData },
        { runValidators: true }
      );

    }

  };

};
```

## 定义控制器（Controllers）

控制器定义模块输出一个对象，该对象的所有方法将作为请求处理器。

请求处理器的第一个参数为上下文（Context）对象，其他参数为注入参数（工具、服务）。

上下文对象的数据结构：

|字段|类型|说明|
|:---|:---|:---|
|`params`|对象|路径参数|
|`query`|对象|查询参数|
|`body`|对象|请求数据|
|`Symbol.for('request')`|对象|HTTP 请求实例|
|`Symbol.for('response')`|对象|HTTP 响应实例|

在路由定义中，通过控制器定义文件名加控制器方法名指定路由的处理器（例如下面的 `signUp` 和 `signIn` 方法可分别通过 `user.signUp` 和 `user.signIn` 指定）。

```javascript
// /controllers/user.js
'use strict';

/**
 * 用户注册。
 *
 * @param {Context} context 上下文实例
 * @param {object} UserService 用户账号服务
 * @returns {Promise.<object>}
 */
exports.signUp = async function(context, UserService) {
  return await UserService.create(context.body);
};

/**
 * 用户登录。
 *
 * @param {Context} context 上下文实例
 * @param {object} UserService 用户账号服务
 * @returns {Promise.<object>}
 */
exports.signIn = async function(context, UserService) {
  return await UserService.authenticate(
    context.body.username,
    context.body.password
  );
};

/**
 * 取得用户账号详细信息。
 *
 * @param {Context} context 上下文实例
 * @param {object} UserService 用户账号服务
 * @returns {Promise.<object>}
 */
exports.getProfile = async function(context, UserService) {
  return await UserService.getProfile(context.params.userId);
};

/**
 * 设置用户头像。
 *
 * @param {Context} context 上下文实例
 * @param {object} UserService 用户账号服务
 * @returns {Promise.<object>}
 */
exports.setAvatar = async function(context, UserService) {
  return await UserService.update(
    context.user._id,
    { avatar: context.body.avatar }
  );
};
```

## 定义路由（Routes）

以下为用户业务 API 路由定义的示例（`/routes/user.json`）。

```json
{
  "index": 1,
  "title": "用户业务",
  "routes": [
    {
      "name": "用户注册",
      "method": "post",
      "path": "/users",
      "body": "user/sign-up-form",
      "handler": "user.signUp",
      "response": "user/user"
    },
    {
      "name": "用户登录",
      "method": "post",
      "path": "/authorizations",
      "body": "user/sign-in-form",
      "handler": "user.signIn",
      "response": "user/user"
    },
    {
      "name": "取得用户资料",
      "method": "get",
      "path": "/users/:userId/profile",
      "params": "user/get-params",
      "handler": "user.getProfile",
      "response": "user/user"
    }
  ]
}
```

|字段|数据类型|是否必须|说明|
|:---|:---:|:---:|:---|
|`index`|整数||指定该业务在 API 文档中索引的顺序，未指定该字段时将不会生成相应业务的文档|
|`title`|字符串||业务名称|
|`routes`|对象数组|是|路由定义列表|
|`routes.name`|字符串|是|接口名称|
|`routes.description`|字符串||接口说明|
|`routes.method`|字符串|是|接受的请求方法，可选值：`get`、`post`、`put`、`patch`、`delete`、`options`、`head`|
|`routes.path`|字符串|是|请求路径，参照 [Path examples](http://expressjs.com/en/4x/api.html#path-examples)|
|`routes.params`|字符串||路径参数数据模式定义文件路径|
|`routes.query`|字符串||查询参数数据模式定义文件路径|
|`routes.body`|字符串||请求数据模式定义文件路径|
|`routes.interceptors`|字符串数组或对象数组||请求拦截器名称或拦截器选项，参考下文的“定义拦截器”部分|
|`routes.interceptors.name`|字符串||请求拦截器名称|
|`routes.interceptors.options`|字符串||请求拦截器执行选项|
|`routes.handler`|字符串|是|请求处理器名称，参考上文的“定义控制器”部分|
|`routes.response`|字符串||响应数据模式定义文件路径|

## 定义请求数据及响应数据的数据模式（JSON Schema）

客户端请求数据（路径参数、查询参数、Body 数据）及服务器返回结果需要通过数据模式校验，若未指定数据模式则相应的数据将被替换为空对象。

本 Web 应用开发框架使用 Node.js 的 NPM 模块 [AJV](https://epoberezkin.github.io/ajv/) 对请求数据及响应数据进行校验，AJV 遵循 [JSON Schema](http://json-schema.org/specification.html) 标准。

默认配置下，请将 JSON Schema 定义文件置于工程的 `/schemas` 路径下，路由定义中将通过文件路径引用 JSON Schema 定义（例如 `/schemas/user/user.json` 将通过 `user/user` 引用）。

上述“用户注册”接口的请求数据的数据模式定义示例（`/schemas/user/sign-up-form.json`）：

```json
{
  "$id": "http://example.com/user/sign-up-form",
  "type": "object",
  "required": [
    "username",
    "password"
  ],
  "properties": {
    "name": {
      "description": "姓名",
      "type": "string",
      "format": "name"
    },
    "username": {
      "description": "登录用户名",
      "type": "string",
      "minLength": 3,
      "maxLength": 20,
      "format": "username"
    },
    "password": {
      "description": "登录密码",
      "type": "string",
      "minLength": 8,
      "maxLength": 64
    }
  }
}
```

> 根据以上数据模式定义：
- 必须设置登录用户名及登录密码；
- 姓名为字符串，格式必须符合在 `/schemas/formats.js` 中定义的 `name` 的格式；
- 登录用户名为字符串，格式必须符合在 `/schemas/formats.js` 中定义的 `username` 的格式，且长度必须大于等于 3 且小于等于 20；
- 登录密码为字符串，长度必须大于等于 8 且小于等于 64。

> 如果请求数据不符合数据模式定义，请求将中止，并将返回数据校验错误给客户端；

> 否则，如果客户端提交了其他字段，这些字段将从请求数据中删除。

## 定义拦截器（Interceptors）

可以通过在路由定义中添加拦截器设置实现在执行业务处理前执行如访问令牌校验、权限检查、上传文件接收等处理。

下面以设置用户头像为例。

首先定义两个拦截器，分别用于校验访问令牌和接收上传的头像文件数据：

> 拦截器的前两个参数 `req` 和 `options` 是固定传入的参数，其他参数通过名称注入工程配置数据、已定义的工具或服务。

> 将从访问令牌解析得到的用户信息以符号 `x-user-info` 设置到请求数据中后，框架将会从请求数据中取得用户信息并可在控制器中通过 `context.user` 取得用户信息。

```javascript
// /interceptors/verify-access-token.js
'use strict';

const USER_INFO = Symbol.for('x-user-info');

/**
 * 检查访问令牌是否有效。
 * 访问令牌通过 Authorization 请求头传递，格式为“Bearer 访问令牌”。
 *
 * @see https://jwt.io/introduction/
 * @param {IncomingMessage} req HTTP 请求
 * @param {object} options 拦截器配置参数
 * @param {object} Errors 错误类定义命名空间
 * @param {object} UserService 用户服务
 * @returns {object} 访问令牌中的用户信息
 */
module.exports = async (req, options, Errors, UserService) => {

  let accessToken = ((req.get('authorization') || '').match(/^Bearer (.+)$/) || [])[1];

  if (!accessToken) {
    throw new Errors.UnauthorizedError('尚未登录');
  }

  req[USER_INFO] = await UserService.verifyAccessToken(accessToken);
};
```

> 上传文件接收拦截器使用 [`multer`](https://github.com/expressjs/multer) 模块解析 HTTP 请求中的文件数据。

```javascript
// /interceptors/upload-image.js
'use strict';

const promisify = require('util').promisify;
const multer = require('multer');
const path = require('path');
const moment = require('moment');

/**
 * 接收上传的文件。
 *
 * @param {IncomingMessage} req HTTP 请求实例
 * @param {object} options 拦截器执行选项
 * @param {string} options.fieldName 文件字段名
 * @param {number} options.maxSize 接受的最大文件大小
 * @param {string} options.mimeType 接受的文件媒体类型的正则表达式
 */
module.exports = async (req, options) => {

  const uploadFile = promisify(multer({
    storage: multer.diskStorage({
      destination: (req, file, callback) => {
        callback(null, path.join(process.env.PWD, 'public/files'));
      },
      filename: (req, file, callback) => {
        callback(null, moment().format('YYYYMMDDHHmmss') + path.extname(file.originalname));
      }
    }),
    limits: {
      fieldSize: options.maxSize,
      files: 1
    },
    fileFilter: (req, file, callback) => {

      if (!(new RegExp(options.mimeType, 'i')).test(file.mimetype)) {
        return callback(new Error('文件类型不正确'));
      }

      callback(null, true);
    },
    preservePath: true
  }).single(options.fieldName));

  await uploadFile(req, req.res);

  if (!req.file) {
    req.body[options.fieldName] = null;
    return;
  }

  req.body[options.fieldName] = path.join(
    '/',
    path.relative(
      path.join(process.env.PWD, 'public'),
      req.file.path
    )
  );

};
```

定义请求数据的数据模式（`/schemas/user/set-avatar-form.json`）：

```json
{
  "$id": "http://example.com/user/set-avatar-form",
  "type": "object",
  "required": [
    "avatar"
  ],
  "properties": {
    "avatar": {
      "description": "头像文件路径",
      "type": "string"
    }
  }
}
```

路由配置：

> 通过以下配置，客户端调用 `/user/avatar` 接口时必须将有效的用户令牌设置到 `Authorization` 请求头中。

```json
{
  "index": 1,
  "title": "用户业务",
  "routes": [
    {
      "name": "设置登录用户头像",
      "method": "put",
      "path": "/user/avatar",
      "interceptors": [
        "verify-access-token",
        {
          "name": "upload-image",
          "options": {
            "fieldName": "avatar",
            "maxSize": 2097152,
            "mimeType": "^image\\/(jpeg|png|gif)$"
          }
        }
      ],
      "body": "user/set-avatar-form",
      "handler": "user.setAvatar"
    }
  ]
}
```

## 定义解析器（Resolvers）

通过定义解析器可以对请求处理器返回的结果进行解析，如 HTTP 状态码设置、错误信息记录、错误处理等。

下面以错误处理为例：

```javascript
// /resolvers/error.js
'use strict';

/**
 * 错误解析器。
 *
 * @param {ServerResponse} res HTTP 响应
 * @param {Error} error 错误信息
 * @param {string} error.statusCode HTTP 状态码
 * @returns {Promise.<object>}
 */
module.exports = async (res, error) => {

  res.statusCode = error.statusCode || 400;

  delete error.statusCode;

  // 当为 JSON schema 校验错误时，格式化返回的错误数据
  if (error.name === 'RequestDataValidationError'
      || error.name === 'ResponseDataValidationError') {

    error.paths = (error.errors || []).map(pathError => {

      let params = pathError.params || {};

      return {
        path: (pathError.dataPath || '').slice(1) || params.missingProperty,
        type: pathError.keyword,
        expected: params.type || params.format || params.pattern,
        limit: params.limit,
        property: params.property
      };

    });

    error.message = '数据校验错误';

    delete error.ajv;
    delete error.validation;
    delete error.errors;

  // 当为 Mongoose 数据模型校验错误时，格式化返回的错误数据
  } else if (error.name === 'ValidationError') {

    error.paths = Object.keys(error.errors).map(pathName => {

      let pathError = error.errors[pathName];

      return {
        path: pathError.path,
        type: pathError.kind
      };

    });

    error.message = '数据校验错误';

    delete error['_message'];
    delete error.errors;
  }

  return { error };
};
```

## 应用初始化

在应用启动时如果需要对应用进行初始化（如创建必要路径、创建管理员用户账号等），可以在配置文件的 `paths.init` 字段指定的文件中实现初始化逻辑。

下面的示例实现了应用启动前创建管理员用户账号的逻辑：

```javascript
// /init.js
'use strict';

/**
 * 初始化应用。
 *
 * @param {object} UserService 用户服务
 */
module.exports = async (UserService) => {

  // 创建管理员用户账号
  try {

    await UserService.create({
      name: '管理员',
      type: 'admin',
      username: 'admin',
      password: 'admin'
    });

  } catch (e) {

    if (!(e.name === 'MongoError' && e.code === 11000)) {
      throw e;
    }

  }

};
```

## 启动应用

在工程的 `package.json` 的 `scripts` 字段中添加以下脚本：

```json
{
  "scripts": {
    "start-debug": "NODE_ENV=development menuet",
    "start": "NODE_ENV=production menuet"
  }
}
```

以下示例为使用 PM2 在生产环境启动的脚本设置：

```json
{
  "scripts": {
    "start": "pm2 start ./app.json --env production"
  }
}
```

使用 PM2 时需要配置 `/app.json` 文件（参考链接：[PM2 Application Declararion](http://pm2.keymetrics.io/docs/usage/application-declaration/#attributes-available)）：

```json
{
  "name": "example",
  "script": "menuet",
  "exec_mode": "cluster",
  "instances": 4,
  "watch": false,
  "wait_ready": true,
  "listen_timeout": 5000,
  "max_restarts": 5,
  "kill_timeout": 5000,
  "env": {
    "NODE_ENV": "development"
  },
  "env_production": {
    "NODE_ENV": "production"
  },
  "merge_logs": true,
  "log_date_format": "YY-MM-DD HH:mm:ss",
  "error_file": "../log/example-error.log",
  "out_file": "../log/example-output.log",
  "pid_file": "../log/example.pid"
}
```

以开发模式启动：

```shell
> npm run start-debug
```

以生产模式启动：

```shell
> npm run start
```

## 生成 API 文档

通过在 `package.json` 文件中添加脚本执行 `menuet-docs` 命令，可以根据路由定义生成 API 文档。

`menuet-docs` 命令接受以下参数：

- `--lang`：文档语言，如 `en`、`zh-cn`
- `--config`：文档配置文件路径，如 `config/api-docs.json`
- `--output`：文档输出路径，如 `public/docs`

脚本设置示例（`/package.json`）：

```json
{
  "scripts": {
    "docs": "menuet-docs --lang zh-cn --config config/api-docs.json --output public/docs"
  }
}
```

配置文件内容如下（`/config/api-docs.json`）：

```json
{
  "title": "示例工程 API 文档",
  "stylesheets": [ "../css/docs.css" ],
  "copyright": "&copy; 2017-present LiveBridge Information Technology Co., Ltd."
}
```

执行脚本，生成 API 文档：

```shell
> npm run docs
```

<p style="margin-top: 2em; text-align: center; color: #9F9F9F;">&copy; 2017-present LiveBridge Information Technology Co., Ltd.</p>
