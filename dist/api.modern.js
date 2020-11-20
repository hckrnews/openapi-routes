/**
 * Auto register API routes from the OpenAPI specification.
 */
class ApiRoutes {
  /**
   * Set the specification.
   *
   * @param {object} OpenAPISpecification
   * @param {class} Backend
   * @param {function} callback
   */
  constructor(OpenAPISpecification, Backend, callback) {
    this.logger = null;
    this.specification = OpenAPISpecification;
    this.callback = callback;
    this.controllers = {};
    this.api = new Backend({
      // Use the first server url as api root.
      // @todo CDB2BGAZ-3755: Support multiple servers
      apiRoot: OpenAPISpecification.servers[0].url,
      definition: OpenAPISpecification
    });
  }
  /**
   * Set the logger.
   *
   * @param {class} logger
   */


  setLogger(logger) {
    this.logger = logger;
  }
  /**
   * Set the controllers.
   *
   * @param {object} controllers
   */


  setControllers(controllers) {
    if (controllers === null || controllers.constructor.name !== 'Object') {
      throw new Error('No valid controllers found');
    }

    this.controllers = controllers;
  }
  /**
   * Get all operation ID's from the specification.
   *
   * @return {array}
   */


  get operationIds() {
    return Object.values(this.specification.paths).map(path => path.get.operationId);
  }
  /**
   * Register all operations to a controller.
   */


  register() {
    var _this$controllers;

    this.operationIds.forEach(operationId => {
      this.api.register(operationId, this.callback(this.controllers[operationId], this.specification, this.logger));
    });

    if ((_this$controllers = this.controllers) == null ? void 0 : _this$controllers.notFound) {
      this.api.register('notFound', this.callback(this.controllers.notFound, this.specification, this.logger));
    }

    this.api.init();
  }

  authentication(secret) {
    this.api.register('unauthorizedHandler', async function (context, request, response) {
      return response.status(401).json({
        status: 401,
        timestamp: new Date(),
        message: 'Unauthorized'
      });
    });
    this.api.registerSecurityHandler('apiKey', context => context.request.headers['x-api-key'] === secret);
  }
  /**
   * Create the API routes from a specification.
   *
   * @param {object} specification
   * @param {string} secret
   * @param {class} Backend
   * @param {class} logger
   * @param {function} callback
   * @param {object} controllers
   *
   * @return {OpenAPIBackend}
   */


  static create({
    specification,
    secret,
    Backend,
    logger,
    callback,
    controllers
  }) {
    const apiRoutes = new ApiRoutes(specification, Backend, callback);
    apiRoutes.setControllers(controllers);

    if (logger) {
      apiRoutes.setLogger(logger);
    }

    if (secret) {
      apiRoutes.authentication(secret);
    }

    apiRoutes.register();
    return apiRoutes.api;
  }

}

export { ApiRoutes };
//# sourceMappingURL=api.modern.js.map
