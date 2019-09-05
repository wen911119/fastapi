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
yarn dev
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

以src/api/dog.js为例
```javascript
const { API, Router } = require("@ruiyun/fastapi") // 注0
const { Post } = Router // 注1

const {
  addDogSchema
} = require("../schemas/dog.schema.js") // 注2

class Dog extends API { // 注3

  @Post("/add", addDogSchema) // 注4
  async add (request, reply) {
    const { name, age, color } = request.body // 注5
    const { success, data, errMsg } = await this.service.DogService.add({name, age, color}) // 注6
    if (success) {
      reply.send(data) // // 注7
    } else {
      reply.status(400).send({
        error: 10001,
        message: errMsg
      }) // 注8
    }
    
  }
}

module.exports = Dog

```
api的写法类似于其它框架里的controller。
撇开千变万化的业务逻辑，这里总是包含几个要素：

##### 1. 所有的api都要继承API这个类[注3]

继承了API类你就可以通过this.config获取到配置,this.db获取到数据库实例，this.grpc获取到grpc的client，this.xx获取到任意你通过插件自定义的属性。

##### 2. 要给这个api指定路由[注0][注1][注4]
通过装饰器的方式给api附上一条路由，如果一条路由不够，那就再叠加一个装饰器。

##### 3. 要给这个api指定schema用来校验[注2][注4]
schema不仅可以校验输入输出，减少非法输入造成的报错，还能根据schema自动生成swagger文档，最重要的，它可以提高性能！一举三得，何乐不为。

##### 4. 从请求中获取参数[注5]
常规操作，可以参考

##### 5. 无担忧的调用其它服务[注6]
为什么说无担忧的调用，因为service不会报错，它总是稳定的返回{ success, data, errMsg }三个返回值。具体见下面servcie章节。

##### 6. 将结果返回给用户
如果一切正常，就直接将结果返回，不要“拖泥带水”[注7]。
如果有异常，根据用户端错误(4xx)/服务端错误(5xx)区别返回固定格式的错误。[注8]

> ### Service写法

以src/services/DogService.js为例
```javascript
const { Service } = require("@ruiyun/fastapi")

class DogService extends Service {
  async add({ name, age, color }) {
    const id = Math.round(Math.random() * 10000000)
    if (id % 3 === 2) {
      // 模拟业务抛错
      throw new Error("dogId已经存在")
    } else if (id % 3 === 1) {
      // 模拟意料之外的报错
      // Cannot read property 'b' of undefined
      console.log(a.b)
    }
    return {
      name,
      age,
      color,
      id
    }
  }
}

module.exports = DogService

```
service 是可复用逻辑的集合。除了业务逻辑外，有几点需要注意：
1. 所有service都要继承Service类。这样才可以通过this.config获取到配置，同前面api
2. 遇到业务问题不能正常返回时，直接throw new Error抛出错误，中断流程。不用担心抛错导致uncaughtException,原因见5。
3. service里不用刻意try-catch，意外报错不会导致崩溃,原因见5。
4. 如果一切正常，就直接将结果返回，不要“拖泥带水”。
5. servcie和调用者之间其实有一层代理，最终给调用者的返回总是固定形式{ success, data, errMsg }。service一切正常，则success为true，data为service的返回值。service有任意报错，则success为false，errMsg为错误信息。

> ### 路由

1. 路由是使用装饰器的方式附加在api上的(见前面api章节)。
2. 路由和api是多对一的关系。
3. 目前只支持Get和Post方法。具体用法形如@Method(path,[schema])。
4. schema虽然不是必须的,但是强烈建议写上。
5. 最终的path会形如[host:port/api文件名/api方法名]。比如示例的src/api/dog.js中有个add方法，最终的路径就是10.100.1.165:3000/dog/add。如果还是不清楚，可以看下启动后自带的swagger文档。

> ### Schema
schema可以校验输入输出、生成文档、提高性能。它的格式是基于[json-schema](https://json-schema.org)。常用的简单校验我建议看看例子就行了，碰到复杂的校验再去看看他的[官网](https://note.youdao.com/)。

> ### Plugins

插件是扩展框架的重要手段。fastapi框架本身也是在fastify基础上通过plugin扩展而来。

#### fastapi内部已经内置了一些常用插件：

##### 1. grpc
这个插件只有在配置文件中存在grpc配置时才会开启，具体配置方法见[https://github.com/wen911119/fastify-grpc-client](https://github.com/wen911119/fastify-grpc-client)。

##### 2. sequelize
这个插件只有在配置文件中存在数据库配置时才会开启。具体配置方法见[https://github.com/wen911119/fastify-sequelize](https://github.com/wen911119/fastify-sequelize)。

##### 3. eureka
这个插件只有在配置文件中存在eureka配置时才会开启。具体配置方法见[https://github.com/wen911119/fastify-eureka](https://github.com/wen911119/fastify-eureka)。

##### 4.swagger
这个插件只有在配置文件中存在swagger配置，并且非production时才会开启。具体配置方法见[https://github.com/fastify/fastify-swagger](https://github.com/fastify/fastify-swagger)。

#### 自己写插件
可以参考[How to write a good plugin](https://www.fastify.io/docs/latest/Write-Plugin/)。

插件写完需要在src/index.js内注册：
```javascript
const { App } = require('@ruiyun/fastapi')
App.register(require('./plugins/fastify-wechat-access-token'), parent => {
  return {
    apps: parent.config.apps
  }
})
App.register(require('./plugins/health'), {
  path: '/health'
})
App.start()
```