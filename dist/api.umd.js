(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.openapiRoutes = {}));
}(this, (function (exports) {
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
     * @param {mixed} meta
     */
    constructor(OpenAPISpecification, Backend, callback, root, meta) {
      this.logger = null;
      this.specification = OpenAPISpecification;
      this.callback = callback;
      this.controllers = {};
      this.meta = meta || {};
      this.api = new Backend({
        apiRoot: root || '/',
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
      var _this$controllers;

      this.operationIds.forEach(operationId => {
        this.api.register(operationId, this.callback({
          controller: this.controllers[operationId],
          specification: this.specification,
          logger: this.logger,
          meta: this.meta
        }));
      });

      if ((_this$controllers = this.controllers) != null && _this$controllers.notFound) {
        this.api.register('notFound', this.callback({
          controller: this.controllers.notFound,
          specification: this.specification,
          logger: this.logger,
          meta: this.meta
        }));
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

    requestValidation() {
      this.api.register('validationFail', (context, request, response) => response.status(400).json({
        status: 400,
        timestamp: new Date(),
        message: context.validation.errors
      }));
    }

    responseValidation() {
      this.api.register('postResponseHandler', (context, request, response) => {
        const validResponse = context.api.validateResponse(context.response, context.operation);

        if (validResponse.errors) {
          return response.status(502).json({
            status: 502,
            timestamp: new Date(),
            message: validResponse.errors
          });
        }

        const validHeaders = context.api.validateResponseHeaders(response.headers, context.operation, {
          statusCode: response.statusCode,
          setMatchType: 'exact'
        });

        if (validHeaders.errors) {
          return response.status(502).json({
            status: 502,
            timestamp: new Date(),
            message: validHeaders.errors
          });
        }

        return response.status(200).json(context.response);
      });
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
       * @param {mixed} meta
       * @param {boolean} requestValidation
       * @param {boolean} responseValidation
       *
       * @return {ApiRoutes}
       */


    static create({
      specification,
      secret,
      Backend,
      logger,
      callback,
      controllers,
      root,
      meta,
      requestValidation = false,
      responseValidation = false
    } = {}) {
      const apiRoutes = new ApiRoutes(specification, Backend, callback, root, meta);
      apiRoutes.setControllers(controllers);

      if (logger) {
        apiRoutes.setLogger(logger);
      }

      if (secret) {
        apiRoutes.authentication(secret);
      }

      if (requestValidation) {
        apiRoutes.requestValidation();
      }

      if (responseValidation) {
        apiRoutes.responseValidation();
      }

      apiRoutes.register();
      return apiRoutes;
    }

  }

  exports.ApiRoutes = ApiRoutes;

})));
//# sourceMappingURL=api.umd.js.map
