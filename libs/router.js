// decorator的用法已经发生大变了，babel官方示例都是错的，都跑不通了
// 正确的见这里
// https://github.com/tc39/proposal-decorators/blob/master/METAPROGRAMMING.md
const gen = method => (path, schema) => {
  return function (elementDescriptor) {
    const name = elementDescriptor.key
    let routes = elementDescriptor.descriptor.value.routes || []
    routes.push({
      url: path || `/${name}`,
      method,
      schema
    })
    elementDescriptor.descriptor.value.routes = routes
    return elementDescriptor
  }
}

module.exports = {
  Get: gen('GET'),
  Post: gen('POST')
}
