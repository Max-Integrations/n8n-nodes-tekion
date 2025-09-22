import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestHelper,
	INodeProperties,
} from 'n8n-workflow';

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
		{
			displayName: 'Session Token',
			name: 'sessionToken',
			type: 'hidden',
			typeOptions: {
				expirable: true,
			},
			default: '',
			required: false,
		},
	];

	async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject) {
		const baseURL =
			credentials.accountType === 'sandbox'
				? 'https://api-sandbox.tekioncloud.com/openapi'
				: 'https://api.tekioncloud.com/openapi';
		const response = (await this.helpers.httpRequest({
			method: 'POST',
			url: `${baseURL}/public/tokens`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: {
				app_id: credentials.appId,
				secret_key: credentials.appSecret,
			},
		})) as {
			data: {
				token_type: string;
				access_token: string;
				expire_in: number;
				expire_on: number;
				issued_at: number;
			};
			status: 'success';
		};
		return { sessionToken: response.data.access_token };
	}

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: `Bearer {{ $credentials.sessionToken }}`,
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			method: 'POST',
			url: '={{ $credentials.accountType === "sandbox" ? "https://api-sandbox.tekioncloud.com/openapi/public/tokens" : "https://api.tekioncloud.com/openapi/public/tokens" }}',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: {
				app_id: '={{ $credentials.appId }}',
				secret_key: '={{ $credentials.appSecret }}',
			},
		},
	};
}
