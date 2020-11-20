export default class Backend {
    constructor() {
        this.routes = [];
        this.security = [];
    }

    register(operationId, handler) {
        this.routes.push({
            operationId,
            handler,
        });
    }

    registerSecurityHandler(name, handler) {
        this.security.push({
            name,
            handler,
        });
    }

    init() {}
}
