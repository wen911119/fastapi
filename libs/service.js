class Service {
  constructor (fastify) {
    this.app = fastify
    Object.defineProperty(this, 'db', {
      get: function () {
        return fastify.db
      }
    })
    Object.defineProperty(this, 'config', {
      get: function () {
        return fastify.config
      }
    })
    Object.defineProperty(this, 'service', {
      get: function () {
        return fastify.service
      }
    })
    Object.defineProperty(this, 'grpc', {
      get: function () {
        return fastify.grpc
      }
    })
  }
}

module.exports = Service
