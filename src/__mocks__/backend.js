export default class Backend {
  constructor ({ apiRoot, definition, customizeAjv }) {
    this.apiRoot = apiRoot
    this.definition = definition
    this.routes = []
    this.security = []
    this.customizeAjv = customizeAjv
  }

  register (operationId, handler) {
    this.routes.push({
      operationId,
      handler
    })
  }

  route (operationId) {
    return this.routes.find(route => route.operationId === operationId).handler
  }

  registerSecurityHandler (name, handler) {
    this.security.push({
      name,
      handler
    })
  }

  securityHandler (name) {
    return this.security.find(item => item.name === name).handler
  }

  init () {
    return true
  }
}
