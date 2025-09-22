"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleInventoryDescription = void 0;
const getMany_1 = require("./getMany");
const showOnlyForVehicleInventory = {
    resource: ['vehicleInventory'],
};
exports.vehicleInventoryDescription = [
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
    ...getMany_1.vehicleInventoryGetManyDescription,
];
//# sourceMappingURL=index.js.map