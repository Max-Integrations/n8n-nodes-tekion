"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TekionApc = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const tokenService_1 = require("./shared/tokenService");
const vehicle_inventory_1 = require("./resources/vehicle-inventory");
const now = new Date();
const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
thirtyDaysAgo.setHours(0, 0, 0, 0);
now.setHours(23, 59, 59, 999);
class TekionApc {
    constructor() {
        this.description = {
            displayName: 'Tekion APC',
            name: 'tekionApc',
            icon: { light: 'file:../../icons/tekion.svg', dark: 'file:../../icons/tekion.svg' },
            group: ['input'],
            version: 1,
            subtitle: '={{$parameter["resource"] + ": " + $parameter["action"]}}',
            description: 'Communicate with the Tekion 2.0 API',
            defaults: {
                name: 'tekionApc',
            },
            usableAsTool: true,
            inputs: ['main'],
            outputs: ['main'],
            requestDefaults: {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            },
            properties: [
                {
                    displayName: 'Dealer ID',
                    name: 'dealerId',
                    type: 'string',
                    hint: 'techmotors_4_0',
                    default: '',
                },
                {
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Deal',
                            value: 'deals',
                        },
                        {
                            name: 'Vehicle Inventory',
                            value: 'vehicleInventory',
                        },
                    ],
                    default: 'vehicleInventory',
                },
                ...vehicle_inventory_1.vehicleInventoryDescription,
            ],
            credentials: [
                {
                    name: 'tekionApcApi',
                    required: true,
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        for (let i = 0; i < items.length; i++) {
            try {
                const resource = this.getNodeParameter('resource', i);
                const action = this.getNodeParameter('action', i);
                const credentials = await this.getCredentials('tekionApc');
                const dealerId = this.getNodeParameter('dealerId', i);
                if (!(credentials === null || credentials === void 0 ? void 0 : credentials.appId) || !(credentials === null || credentials === void 0 ? void 0 : credentials.appSecret)) {
                    throw new n8n_workflow_1.ApplicationError('App ID and App Secret are required');
                }
                const tokenService = new tokenService_1.TokenService(this, credentials.accountType);
                let bearerToken = await tokenService.getBearerToken(credentials.appId, credentials.appSecret);
                let baseUrl;
                switch (credentials.accountType) {
                    case 'sandbox':
                        baseUrl = 'https://api-sandbox.tekioncloud.com/openapi';
                        break;
                    case 'production':
                        baseUrl = 'https://api.tekioncloud.com/openapi';
                        break;
                    default:
                        throw new n8n_workflow_1.ApplicationError('Invalid environment');
                }
                const requestOptions = {
                    baseURL: baseUrl,
                    headers: {
                        Authorization: `Bearer ${bearerToken}`,
                        Accept: '*/*',
                        'Content-Type': 'application/json',
                        app_id: credentials.appId,
                        dealer_id: dealerId,
                    },
                };
                let responseData;
                try {
                    responseData = await handleRequest(this, requestOptions, resource, action);
                }
                catch (error) {
                    if (error instanceof n8n_workflow_1.ApplicationError) {
                        throw error;
                    }
                    tokenService.clearCache(bearerToken);
                    bearerToken = await tokenService.getBearerToken(credentials.appId, credentials.appSecret);
                    requestOptions.headers.Authorization = `Bearer ${bearerToken}`;
                    responseData = await handleRequest(this, requestOptions, resource, action);
                }
                returnData.push({
                    json: responseData,
                    pairedItem: { item: i },
                });
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: { error: error.message },
                        pairedItem: { item: i },
                    });
                }
                else {
                    throw error;
                }
            }
        }
        return [returnData];
    }
}
exports.TekionApc = TekionApc;
async function handleRequest(instance, requestOptions, resource, action) {
    switch (resource) {
        case 'vehicleInventory':
            return await handleVehicleInventory(instance, requestOptions, action);
        case 'deals':
            return await handleDeals(instance, requestOptions, action);
        default:
            throw new n8n_workflow_1.ApplicationError('Invalid resource');
    }
}
async function handleVehicleInventory(instance, requestOptions, action) {
    var _a, _b;
    let url;
    switch (action) {
        case 'getMany':
            url = '/v4.0.0/vehicle-inventory';
            break;
        default:
            throw new n8n_workflow_1.ApplicationError('Invalid action');
    }
    const filtersRaw = instance.getNodeParameter('filters', 0);
    const filters = (_b = (_a = filtersRaw.filter) === null || _a === void 0 ? void 0 : _a.reduce((acc, filter) => {
        const fieldName = filter.field;
        const value = filter[fieldName];
        acc[fieldName] = value;
        return acc;
    }, {})) !== null && _b !== void 0 ? _b : {};
    if (filters) {
        if (filters.modifiedStartTime) {
            url += `?modifiedStartTime=${new Date(filters.modifiedStartTime).getTime() / 1000}`;
        }
        if (filters.status) {
            url += `&status=${filters.status}`;
        }
    }
    let returnData = [];
    switch (action) {
        case 'getMany':
            returnData = await instance.helpers.httpRequest({
                ...requestOptions,
                url: url,
                method: 'GET',
            });
    }
    return {
        ...returnData,
        data: returnData.data.filter((item) => {
            let isValid = true;
            if (filters.stockType) {
                isValid = item.stockType === filters.stockType;
            }
            return isValid;
        }),
    };
}
async function handleDeals(instance, requestOptions, action) {
    switch (action) {
        case 'getMany':
            return await instance.helpers.httpRequest({
                ...requestOptions,
                url: '/v4.0.0/deals',
                method: 'GET',
            });
        default:
            throw new n8n_workflow_1.ApplicationError('Invalid action');
    }
}
//# sourceMappingURL=TekionApc.node.js.map