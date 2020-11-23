import { ApiRoutes } from '../api';
import OpenAPISpecification from '../__fixtures__/api-doc.json';
import Backend from '../__mocks__/backend';
import callback from '../__mocks__/callback';
import controllers from '../__mocks__/controller';

describe('API route without security', () => {
    const actual = ApiRoutes.create({
        specification: OpenAPISpecification,
        Backend,
        controllers,
        callback,
    });
    it('Test if the return value is a instance of the backend', () => {
        expect(actual instanceof Backend).toBeTruthy();
    });

    it('Test if the API route add all routes', () => {
        expect(actual.routes.map((route) => route.operationId)).toEqual([
            'getStatus',
            'getTest',
            'postTest',
            'notFound',
        ]);
    });

    it('Test if the API security is empty', () => {
        expect(actual.security.map((route) => route.name)).toEqual([]);
    });
});

describe('API route with security', () => {
    const actual = ApiRoutes.create({
        specification: OpenAPISpecification,
        secret: 'secret',
        Backend,
        controllers,
        callback,
    });
    it('Test if the return value is a instance of the backend', () => {
        expect(actual instanceof Backend).toBeTruthy();
    });

    it('Test if the API route add all routes', () => {
        expect(actual.routes.map((route) => route.operationId)).toEqual([
            'unauthorizedHandler',
            'getStatus',
            'getTest',
            'postTest',
            'notFound',
        ]);
    });

    it('Test if the API security is set', () => {
        expect(actual.security.map((route) => route.name)).toEqual(['apiKey']);
    });
});
