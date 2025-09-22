import type { INodeProperties } from 'n8n-workflow';

const showOnlyForVehicleInventoryGetMany = {
	action: ['getMany'],
	resource: ['vehicleInventory'],
};

export const vehicleInventoryGetManyDescription: INodeProperties[] = [
	{
		displayName: 'Modified After',
		name: 'modifiedStartTime',
		type: 'dateTime',
		displayOptions: {
			show: showOnlyForVehicleInventoryGetMany,
		},
		default: '',
		description: 'The date after which the vehicles were modified',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		displayOptions: {
			show: showOnlyForVehicleInventoryGetMany,
		},
		options: [
			{ name: 'All', value: 'ALL' },
			{ name: 'Cancelled', value: 'CANCELLED' },
			{ name: 'Draft', value: 'DRAFT' },
			{ name: 'Float', value: 'FLOAT' },
			{ name: 'In Transit', value: 'IN_TRANSIT' },
			{ name: 'Invoiced', value: 'INVOICED' },
			{ name: 'On Hold', value: 'ON_HOLD' },
			{ name: 'On Order', value: 'ON_ORDER' },
			{ name: 'Sold', value: 'SOLD' },
			{ name: 'Stocked In', value: 'STOCKED_IN' },
			{ name: 'Tentative', value: 'TENTATIVE' },
			{ name: 'Transferred Out', value: 'TRANSFERRED_OUT' },
		],
		default: 'ALL',
		description: 'The status of the vehicles to filter on',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add Filter',
		},
		displayOptions: {
			show: showOnlyForVehicleInventoryGetMany,
		},
		default: {},
		options: [
			{
				displayName: 'Filter',
				name: 'filter',
				values: [
					{
						displayName: 'Field',
						name: 'field',
						type: 'options',
						options: [
							{
								name: 'Stock Type',
								value: 'stockType',
							},
						],
						default: 'stockType',
						description: 'The field to filter on',
					},
					{
						displayName: 'Stock Type',
						name: 'stockType',
						type: 'options',
						displayOptions: {
							show: {
								field: ['stockType'],
							},
						},
						options: [
							{ name: 'Demo', value: 'DEMO' },
							{ name: 'New', value: 'NEW' },
							{ name: 'Special', value: 'SPECIAL' },
							{ name: 'Used', value: 'USED' },
						],
						default: 'USED',
						description: 'The stock type of the vehicles to filter on',
					},
				],
			},
		],
	},
];
