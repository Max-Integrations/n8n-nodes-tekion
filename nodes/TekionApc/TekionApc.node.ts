import {
	type NodeConnectionType,
	type INodeType,
	type INodeTypeDescription,
	type IExecuteFunctions,
	type INodeExecutionData,
	IDataObject,
	ApplicationError,
} from 'n8n-workflow';
import { TokenService } from './shared/tokenService';
import { vehicleInventoryDescription } from './resources/vehicle-inventory';

const now = new Date();
const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
thirtyDaysAgo.setHours(0, 0, 0, 0);
now.setHours(23, 59, 59, 999);

export class TekionApc implements INodeType {
	description: INodeTypeDescription = {
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
		inputs: ['main' as NodeConnectionType],
		outputs: ['main' as NodeConnectionType],
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
			...vehicleInventoryDescription,
		],
		credentials: [
			{
				name: 'tekionApcApi',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const action = this.getNodeParameter('action', i) as string;
				const credentials = await this.getCredentials('tekionApc');
				const dealerId = this.getNodeParameter('dealerId', i) as string;

				// Get credentials
				if (!credentials?.appId || !credentials?.appSecret) {
					throw new ApplicationError('App ID and App Secret are required');
				}

				// Initialize token service
				const tokenService = new TokenService(this, credentials.accountType as string);
				let bearerToken = await tokenService.getBearerToken(
					credentials.appId as string,
					credentials.appSecret as string,
				);

				let baseUrl: string;
				switch (credentials.accountType) {
					case 'sandbox':
						baseUrl = 'https://api-sandbox.tekioncloud.com/openapi';
						break;
					case 'production':
						baseUrl = 'https://api.tekioncloud.com/openapi';
						break;
					default:
						throw new ApplicationError('Invalid environment');
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
				let responseData;

				try {
					responseData = await handleRequest(this, requestOptions, resource, action);
				} catch (error: unknown) {
					if (error instanceof ApplicationError) {
						throw error;
					}
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
	requestOptions: IDataObject,
	resource: string,
	action: string,
) {
	switch (resource) {
		case 'vehicleInventory':
			return await handleVehicleInventory(instance, requestOptions, action);
		case 'deals':
			return await handleDeals(instance, requestOptions, action);
		default:
			throw new ApplicationError('Invalid resource');
	}
}

async function handleVehicleInventory(
	instance: IExecuteFunctions,
	requestOptions: IDataObject,
	action: string,
) {
	let url: string;
	switch (action) {
		case 'getMany':
			url = '/v4.0.0/vehicle-inventory';
			break;
		default:
			throw new ApplicationError('Invalid action');
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

async function handleDeals(
	instance: IExecuteFunctions,
	requestOptions: IDataObject,
	action: string,
) {
	switch (action) {
		case 'getMany':
			return await instance.helpers.httpRequest({
				...requestOptions,
				url: '/v4.0.0/deals',
				method: 'GET',
			});
		default:
			throw new ApplicationError('Invalid action');
	}
}
