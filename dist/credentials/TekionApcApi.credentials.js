"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TekionApcApi = void 0;
class TekionApcApi {
    constructor() {
        this.name = 'tekionApcApi';
        this.displayName = 'Tekion APC API';
        this.icon = { light: 'file:../icons/tekion.svg', dark: 'file:../icons/tekion.svg' };
        this.documentationUrl = 'https://docs.tekioncloud.com';
        this.properties = [
            {
                displayName: 'App ID',
                name: 'appId',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                description: 'Your Tekion app ID',
                required: true,
            },
            {
                displayName: 'App Secret',
                name: 'appSecret',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                description: 'Your Tekion app secret',
                required: true,
            },
            {
                displayName: 'Account Type',
                name: 'accountType',
                type: 'options',
                options: [
                    { name: 'Production', value: 'production' },
                    { name: 'Sandbox', value: 'sandbox' },
                ],
                default: 'production',
                description: 'Your Tekion account type',
                required: true,
            },
        ];
    }
}
exports.TekionApcApi = TekionApcApi;
//# sourceMappingURL=TekionApcApi.credentials.js.map