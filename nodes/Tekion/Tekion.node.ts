import {
	NodeConnectionType,
	type INodeType,
	type INodeTypeDescription,
	type IExecuteFunctions,
	type INodeExecutionData,
	IDataObject,
} from 'n8n-workflow';
import { TokenService } from './shared/tokenService';
import { vehicleInventoryDescription } from './resources/vehicle-inventory';

const now = new Date();
const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
thirtyDaysAgo.setHours(0, 0, 0, 0);
now.setHours(23, 59, 59, 999);

export class Tekion implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Tekion',
		name: 'tekion',
		icon: { light: 'file:../../icons/tekion.svg', dark: 'file:../../icons/tekion.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Communicate with the Tekion 2.0 API',
		defaults: {
			name: 'Tekion',
		},
		usableAsTool: true,
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		requestDefaults: {
			baseURL:
				'={{$parameter["environment"] === "sandbox" ? "https://api-sandbox.tekioncloud.com/openapi" : "https://api.tekioncloud.com/openapi"}}',
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
				displayName: 'Environment',
				name: 'environment',
				type: 'options',
				options: [
					{
						name: 'Production',
						value: 'production',
					},
					{
						name: 'Sandbox',
						value: 'sandbox',
					},
				],
				default: 'production',
				description: 'Choose between production and sandbox environment',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Deals',
						value: 'deals',
					},
					{
						name: 'Vehicle Inventory',
						value: 'vehicleInventory',
					},
				],
				default: 'vehicleInventory',
			},
			...vehicleInventoryDescription,
		],
		credentials: [
			{
				name: 'tekion',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		for (let i = 0; i < items.length; i++) {
			try {
				const environment = this.getNodeParameter('environment', i) as string;
				const resource = this.getNodeParameter('resource', i) as string;
				const action = this.getNodeParameter('action', i) as string;
				const credentials = await this.getCredentials('tekion');
				const dealerId = this.getNodeParameter('dealerId', i) as string;

				// Get credentials
				if (!credentials?.appId || !credentials?.appSecret) {
					throw new Error('App ID and App Secret are required');
				}

				// Initialize token service
				const tokenService = new TokenService(this, environment);
				let bearerToken = await tokenService.getBearerToken(
					credentials.appId as string,
					credentials.appSecret as string,
				);

				let baseUrl: string;
				switch (environment) {
					case 'sandbox':
						baseUrl = 'https://api-sandbox.tekioncloud.com/openapi';
						break;
					case 'production':
						baseUrl = 'https://api.tekioncloud.com/openapi';
						break;
					default:
						throw new Error('Invalid environment');
				}

				// Set up request options with bearer token
				const requestOptions = {
					baseURL: baseUrl,
					headers: {
						Authorization: `Bearer ${bearerToken}`,
						Accept: '*/*',
						'Content-Type': 'application/json',
						app_id: credentials.appId as string,
						dealer_id: dealerId,
					},
				};

				// Execute the appropriate operation based on resource
				let responseData: any;

				try {
					responseData = await handleRequest(this, requestOptions, resource, action);
				} catch (error) {
					tokenService.clearCache(bearerToken);
					bearerToken = await tokenService.getBearerToken(
						credentials.appId as string,
						credentials.appSecret as string,
					);
					requestOptions.headers.Authorization = `Bearer ${bearerToken}`;
					responseData = await handleRequest(this, requestOptions, resource, action);
				}

				returnData.push({
					json: responseData,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: { item: i },
					});
				} else {
					throw error;
				}
			}
		}

		return [returnData];
	}
}
async function handleRequest(
	instance: IExecuteFunctions,
	requestOptions: any,
	resource: string,
	action: string,
) {
	switch (resource) {
		case 'vehicleInventory':
			return await handleVehicleInventory(instance, requestOptions, action);
		case 'deals':
			return await handleDeals(instance, requestOptions, action);
		default:
			throw new Error('Invalid resource');
	}
}

async function handleVehicleInventory(
	instance: IExecuteFunctions,
	requestOptions: any,
	action: string,
) {
	let url: string;
	switch (action) {
		case 'getMany':
			url = '/v4.0.0/vehicle-inventory';
			break;
		default:
			throw new Error('Invalid action');
	}

	const filtersRaw = instance.getNodeParameter('filters', 0) as IDataObject;
	const filters =
		(filtersRaw.filter as IDataObject[])?.reduce((acc: IDataObject, filter: IDataObject) => {
			const fieldName = filter.field as string;
			const value = filter[fieldName as string];
			acc[fieldName] = value as string;
			return acc;
		}, {}) ?? {};

	if (filters) {
		if (filters.modifiedStartTime) {
			url += `?modifiedStartTime=${new Date(filters.modifiedStartTime as string).getTime() / 1000}`;
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
		data: returnData.data.filter((item: IDataObject) => {
			let isValid = true;
			if (filters.stockType) {
				isValid = item.stockType === filters.stockType;
			}
			return isValid;
		}),
	};
}

async function handleDeals(instance: IExecuteFunctions, requestOptions: any, action: string) {
	switch (action) {
		case 'getMany':
			return await instance.helpers.httpRequest({
				...requestOptions,
				url: '/v4.0.0/deals',
				method: 'GET',
			});
		default:
			throw new Error('Invalid action');
	}
}
