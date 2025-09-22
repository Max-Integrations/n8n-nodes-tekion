"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleInventoryGetManyDescription = void 0;
const showOnlyForVehicleInventoryGetMany = {
    action: ['getMany'],
    resource: ['vehicleInventory'],
};
exports.vehicleInventoryGetManyDescription = [
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
                                name: 'Status',
                                value: 'status',
                            },
                            {
                                name: 'Modified Start Date',
                                value: 'modifiedStartTime',
                            },
                            {
                                name: 'Stock Type',
                                value: 'stockType',
                            },
                        ],
                        default: 'status',
                        description: 'The field to filter on',
                    },
                    {
                        displayName: 'Status',
                        name: 'status',
                        type: 'options',
                        displayOptions: {
                            show: {
                                field: ['status'],
                            },
                        },
                        options: [
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
                        default: 'SOLD',
                        description: 'The status of the vehicles to filter on',
                    },
                    {
                        displayName: 'Modified Start Date',
                        name: 'modifiedStartTime',
                        type: 'dateTime',
                        displayOptions: {
                            show: {
                                field: ['modifiedStartTime'],
                            },
                        },
                        default: '',
                        description: 'The start date of the vehicles to filter on',
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
//# sourceMappingURL=getMany.js.map