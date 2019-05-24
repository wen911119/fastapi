> ### 快速开始
1. 全局安装 @ruiyun/fastapi-cli
```
yarn global add @ruiyun/fastapi-cli
```

2. 用cli创建一个新项目
```
// fastapi create [项目名称]
fastapi create fastapi-demo
```

3. 进入项目目录
```
cd fastapi-demo
```

4. 安装依赖
```
yarn
```

5. 启动开发
```
yarn derv
```
之后可以在
```
http://{本机IP}:3000/documentation/static/index.html
```
看到api的swagger文档



> ### 项目目录结构

```
fastapi-project
  │
  ├──── src
  │      ├── api(api相关)
  │      │     └──dog.js(dog相关api)
  │      │
  │      ├── services(services) 
  │      │     └──UserInfoService.js(用户信息相关服务)
  │      │
  │      ├── config(配置)
  │      │     ├──index.default.js(默认配置)
  │      │     ├──index.develop.js(测试环境配置)
  │      │     ├──index.production.js(生产环境配置)
  │      │     └──index.local.js(本地环境配置)
  │      │
  │      ├── schemas(模型校验)
  │      │     └──dog.schema.js(和api下dog.js一一对应)
  │      │
  │      ├── dbs(数据库模型)
  │      │     └──zeus(数据库名)
  │      │         └──union_bind_relation.model.js（表名.model.js）
  │      ├── plugins(插件)
  │      └── index.js (入口)
  │
  ├──── Dockerfile(docker镜像构建脚本)
  │
  └──── package.json
```

> ### 配置
配置都在config目录下，会根据环境变量NODE_ENV(develop/production/local)合并出一个最终的config。合并规则见[Lodash.defaultsDeep](https://lodash.com/docs/4.17.11#defaultsDeep)。例如默认配置如下：

```javascript
// index.default.js
module.exports = {
  databases: {
    zeus: {
      username: 'dev1',
      password: 'dev99999',
      dialect: 'mysql',
      host: 'rm-xxxxxxxxxxxxxx.mysql.rds.aliyuncs.com',
      port: 3306,
      define: {
        underscored: true,
        timestamps: false
      }
    }
  },
  wechatCommonService: "http://wechat-common-service:3000"
}

```
生产环境配置如下：
```javascript
// index.production.js
// 只需要写修改部分
module.exports = {
  databases: {
    zeus: {
      username: 'pro1',
      password: 'pro99999',
      host: 'rm-yyyyyyyyyyyyy.mysql.rds.aliyuncs.com',
    }
  }
}
```

在生产环境最终合并出来的配置如下：
```javascript
module.exports = {
  databases: {
    zeus: {
      username: 'pro1',
      password: 'pro99999',
      dialect: 'mysql',
      host: 'rm-yyyyyyyyyyyyy.mysql.rds.aliyuncs.com',
      port: 3306,
      define: {
        underscored: true,
        timestamps: false
      }
    }
  },
  wechatCommonService: "http://wechat-common-service:3000"
}

```

合并完的配置可以在以下地方方便的获取到：

1. src/api/dog.js 内 this.config
2. src/services/UserInfoService.js 内 this.config
3. src/index.js 里注册插件时

```javascript
App.register(require("xxx-plugin"), parent => {
  console.log(parent.config)
});
```

> ### API写法

todo

> ### Service写法

todo

> ### 路由

todo

> ### Plugins写法

todo
