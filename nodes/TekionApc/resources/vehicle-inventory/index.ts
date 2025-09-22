import type { INodeProperties } from 'n8n-workflow';
import { vehicleInventoryGetManyDescription } from './getMany';

const showOnlyForVehicleInventory = {
	resource: ['vehicleInventory'],
};

export const vehicleInventoryDescription: INodeProperties[] = [
	{
		displayName: 'Action',
		name: 'action',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForVehicleInventory,
		},
		options: [
			{
				name: 'Get Vehicles From Inventory',
				value: 'getMany',
				action: 'Get vehicles from inventory',
				description: 'Get many vehicles from inventory',
				routing: {
					request: {
						method: 'GET',
						url: '=/v4.0.0/vehicle-inventory',
					},
				},
			},
		],
		default: 'getMany',
	},
	...vehicleInventoryGetManyDescription,
];
