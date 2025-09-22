import type { Icon, ICredentialType, INodeProperties } from 'n8n-workflow';

export class TekionApcApi implements ICredentialType {
	name = 'tekionApcApi';

	displayName = 'Tekion APC API';

	icon: Icon = { light: 'file:../icons/tekion.svg', dark: 'file:../icons/tekion.svg' };

	documentationUrl = 'https://docs.tekioncloud.com';

	properties: INodeProperties[] = [
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
