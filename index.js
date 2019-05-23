const IS_NOT_PRODUCTION = process.env.NODE_ENV !== "production";
const TARGET_PROJECT_PATH = process.cwd();
const path = require("path");

exports.Service = require("./libs/service");
exports.API = require("./libs/api");
exports.Router = require("./libs/router");

const App = require("fastify")({
  logger: IS_NOT_PRODUCTION
});
// 加载配置
App.register(require("@ruiyun/fastify-config-loader"), {
  path: path.resolve(TARGET_PROJECT_PATH, "./src/config")
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
    path: path.resolve(TARGET_PROJECT_PATH, "./src/dbs")
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
  path: path.resolve(TARGET_PROJECT_PATH, "./src/api")
});

// 注册service
App.register(require("@ruiyun/fastify-service-loader"), {
  path: path.resolve(TARGET_PROJECT_PATH, "./src/services")
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
