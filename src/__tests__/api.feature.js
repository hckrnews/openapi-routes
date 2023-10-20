import { expect, describe, it } from '@jest/globals'
import { ApiRoutes } from '../api.js'
import OpenAPISpecification from '../__fixtures__/api-doc.json' assert { type: 'json' }
import Backend from '../__mocks__/backend.js'
import callback from '../__mocks__/callback.js'
import controllers from '../__mocks__/controller.js'

const resMock = {
    newStatus: null,
    response: null,
    type: () => true,
    status: (newStatus) => ({
        json: (data) => {
            resMock.newStatus = newStatus
            resMock.response = data
        },
        send: (data) => {
            resMock.newStatus = newStatus
            resMock.response = data
        }
    })
}

describe('API route without security', () => {
    const { api: actual, operationIds } = ApiRoutes.create({
        specification: OpenAPISpecification,
        Backend,
        controllers,
        callback,
        requestValidation: true,
        responseValidation: true
    })
    it('Test if the return value is a instance of the backend', () => {
        expect(actual instanceof Backend).toBeTruthy()
    })

    it('Test if the operation id\'s are generated', () => {
        expect(operationIds).toEqual([
            'getStatus',
            'getTest',
            'postTest2',
            'postTest'
        ])
    })

    it('Test if the API route add all routes', () => {
        expect(actual.routes.map((route) => route.operationId)).toEqual([
            'validationFail',
            'postResponseHandler',
            'getStatus',
            'getTest',
            'postTest2',
            'postTest',
            'notFound'
        ])
    })

    it('Test if the API security is empty', () => {
        expect(actual.security.map((route) => route.name)).toEqual([])
    })

    it('Test the not found handler', async () => {
        const notFoundController = actual.route('notFound')
        const context = {}
        const req = {}

        await notFoundController(context, req, resMock)
        expect(resMock.response).toEqual(true)
    })

    it('Test the status handler', async () => {
        const statusController = actual.route('getStatus')
        const context = {}
        const req = {}

        await statusController(context, req, resMock)
        expect(resMock.response.message).toEqual('controller is not a function')
        expect(resMock.response.status).toEqual(500)
    })

    it('Test the test handler', async () => {
        const testController = actual.route('getTest')
        const context = {}
        const req = {}

        await testController(context, req, resMock)
        expect(resMock.response.message).toEqual('controller is not a function')
        expect(resMock.response.status).toEqual(500)
    })

    it('Test the validation fail handler', async () => {
        const statusController = actual.route('validationFail')
        const context = {
            validation: {
                errors: 42
            }
        }
        const req = {}

        await statusController(context, req, resMock)
        expect(resMock.response.message).toEqual(42)
        expect(resMock.response.status).toEqual(400)
    })

    it('Test the post response handler', async () => {
        const statusController = actual.route('postResponseHandler')
        const context = {
            api: {
                validateResponse: () => ({}),
                validateResponseHeaders: () => ({})
            },
            operation: 123,
            response: 42
        }
        const req = {}

        await statusController(context, req, resMock)
        expect(resMock.response).toEqual(42)
        expect(resMock.newStatus).toEqual(200)
    })

    it('Test the post response handler with reponse errors', async () => {
        const statusController = actual.route('postResponseHandler')
        const context = {
            api: {
                validateResponse: () => ({ errors: 142 }),
                validateResponseHeaders: () => ({})
            },
            operation: 123,
            response: 42
        }
        const req = {}

        await statusController(context, req, resMock)
        expect(resMock.response.message).toEqual(142)
        expect(resMock.response.status).toEqual(502)
        expect(resMock.newStatus).toEqual(502)
    })

    it('Test the post response handler with request errors', async () => {
        const statusController = actual.route('postResponseHandler')
        const context = {
            api: {
                validateResponse: () => ({}),
                validateResponseHeaders: () => ({ errors: 242 })
            },
            operation: 123,
            response: 42
        }
        const req = {}

        await statusController(context, req, resMock)
        expect(resMock.response.message).toEqual(242)
        expect(resMock.response.status).toEqual(502)
        expect(resMock.newStatus).toEqual(502)
    })
})

describe('API route with security', () => {
    const { api: actual, logger } = ApiRoutes.create({
        specification: OpenAPISpecification,
        secret: 'secret',
        Backend,
        controllers,
        callback,
        root: '/test',
        logger: () => 43,
        errorLogger: {
            error: () => { }
        }
    })
    it('Test if the return value is a instance of the backend with security', () => {
        expect(actual instanceof Backend).toBeTruthy()
    })

    it('Test if the API route add all routes, test 2', () => {
        expect(actual.routes.map((route) => route.operationId)).toEqual([
            'unauthorizedHandler',
            'getStatus',
            'getTest',
            'postTest2',
            'postTest',
            'notFound'
        ])
    })

    it('Test if the API security is set', () => {
        expect(actual.security.map((route) => route.name)).toEqual(['apiKey'])
    })

    it('Test if the API root is set', () => {
        expect(actual.apiRoot).toBe('/test')
    })

    it('Test if the API root is set', () => {
        expect(actual.apiRoot).toBe('/test')
    })

    it('Test if the logger is set', () => {
        expect(logger()).toBe(43)
    })

    it('It should throw an error if there are no controllers set', () => {
        expect(() => {
            ApiRoutes.create({
                specification: OpenAPISpecification,
                secret: 'secret',
                Backend,
                controllers: null,
                callback,
                root: '/test',
                logger: () => 44
            })
        }).toThrowError('No valid controllers found')
    })

    it('Test the unauthorized handler', async () => {
        const statusController = actual.route('unauthorizedHandler')
        const context = {}
        const req = {}

        await statusController(context, req, resMock)
        expect(resMock.response.message).toEqual('Unauthorized')
        expect(resMock.response.status).toEqual(401)
        expect(resMock.newStatus).toEqual(401)
    })

    it('Test the api key check', () => {
        const securityHandler = actual.securityHandler('apiKey')
        const context = {
            request: {
                headers: {
                    'x-api-key': 'secret'
                }
            }
        }
        const result = securityHandler(context)
        expect(result).toBeTruthy()
    })
})

describe('API without not found controller', () => {
    const controllersWithoutNotFound = {
        test() {
            return true
        }
    }
    const { api: actual } = ApiRoutes.create({
        specification: OpenAPISpecification,
        Backend,
        controllers: controllersWithoutNotFound,
        callback,
        requestValidation: true,
        responseValidation: true
    })

    it('Test if the API route add all routes, test 3', () => {
        expect(actual.routes.map((route) => route.operationId)).toEqual([
            'validationFail',
            'postResponseHandler',
            'getStatus',
            'getTest',
            'postTest2',
            'postTest'
        ])
    })
})
