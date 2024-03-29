const IS_NOT_PRODUCTION = process.env.NODE_ENV !== "production";
const FORM_BODY = process.env.FORM_BODY;
const BODY_LIMIT = process.env.BODY_LIMIT || '1048576';

const path = require("path");

exports.Service = require("./libs/service");
exports.API = require("./libs/api");
exports.Router = require("./libs/router");

const App = require("fastify")({
  logger: IS_NOT_PRODUCTION,
  bodyLimit: Number(BODY_LIMIT),
});
if (FORM_BODY) {
  App.register(require('fastify-formbody'));
};
// 加载配置
App.register(require("@ruiyun/fastify-config-loader"), {
  path: path.resolve(require.main.filename, "../config")
});

// eureka
App.register(require("@ruiyun/fastify-eureka"), parent => {
  return Object.assign({}, parent.config.eureka, {
    register: !!process.env.NODE_ENV // 本地环境只拉取不注册
  });
});

// grpc
App.register(require("@ruiyun/fastify-grpc-client"), parent => {
  return parent.config.grpc;
});

// db
App.register(require("@ruiyun/fastify-sequelize"), parent => {
  return {
    databases: parent.config.databases,
    path: path.resolve(require.main.filename, "../dbs")
  };
});

// 非生产环境启动swagger
if (IS_NOT_PRODUCTION) {
  App.register(require("fastify-swagger"), parent => {
    return parent.config.swagger;
  });
}

// 注册api
App.register(require("@ruiyun/fastify-api-loader"), {
  path: path.resolve(require.main.filename, "../api")
});

// 注册service
App.register(require("@ruiyun/fastify-service-loader"), {
  path: path.resolve(require.main.filename, "../services")
});

App.start = port => {
  App.listen(port || 3000, "0.0.0.0", function(err, address) {
    if (err) {
      App.log.error(err);
      process.exit(1);
    }
    App.log.info(`server listening on ${address}`);
  });
  App.ready(err => {
    if (err) throw err;
    err || (App.swagger && App.swagger());
  });
};

exports.App = App;
