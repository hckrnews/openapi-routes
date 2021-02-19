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
   * @param {string} root
   */
  constructor(OpenAPISpecification, Backend, callback, root) {
    this.logger = null;
    this.specification = OpenAPISpecification;
    this.callback = callback;
    this.controllers = {};
    this.api = new Backend({
      // Use the first server url as api root.
      // @todo CDB2BGAZ-3755: Support multiple servers
      apiRoot: root || OpenAPISpecification.servers[0].url,
      definition: OpenAPISpecification
    });
  }

  get operations() {
    return ['get', 'put', 'patch', 'post', 'delete'];
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
     * @todo: allow multipleoperation methods per path (e.g. get and post)
     *
     * @return {array}
     */


  get operationIds() {
    return Object.values(this.specification.paths).map(path => {
      return Object.entries(path).map(([operation, data]) => this.operations.includes(operation) ? data.operationId : null);
    }).flat();
  }
  /**
     * Register all operations to a controller.
     */


  register() {
    this.operationIds.forEach(operationId => {
      this.api.register(operationId, this.callback(this.controllers[operationId], this.specification, this.logger));
    });

    if (this.controllers?.notFound) {
      this.api.register('notFound', this.callback(this.controllers.notFound, this.specification, this.logger));
    }

    this.api.init();
  }

  authentication(secret) {
    this.api.register('unauthorizedHandler', async (context, request, response) => response.status(401).json({
      status: 401,
      timestamp: new Date(),
      message: 'Unauthorized'
    }));
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
     * @param {string} root
     *
     * @return {OpenAPIBackend}
     */


  static create({
    specification,
    secret,
    Backend,
    logger,
    callback,
    controllers,
    root
  }) {
    const apiRoutes = new ApiRoutes(specification, Backend, callback, root);
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

exports.ApiRoutes = ApiRoutes;
//# sourceMappingURL=api.js.map
