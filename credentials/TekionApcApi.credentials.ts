import type {
	Icon,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestHelper,
	IHttpRequestOptions,
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
			required: true,
		},
		{
			displayName: 'Session Token Expiration',
			name: 'sessionTokenExpiresAt',
			type: 'hidden',
			default: '',
			required: true,
		},
	];

	async preAuthentication(this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject) {
		let shouldFetchNewToken = false;
		if (!credentials.sessionToken) shouldFetchNewToken = true;
		if (!credentials.sessionTokenExpiresAt) shouldFetchNewToken = true;
		if (new Date(credentials.sessionTokenExpiresAt as string) <= new Date())
			shouldFetchNewToken = true;
		if (!shouldFetchNewToken) return credentials;
		const baseURL =
			credentials.accountType === 'sandbox'
				? 'https://api-sandbox.tekioncloud.com/openapi'
				: 'https://api.tekioncloud.com/openapi';
		const requestOptions = {
			method: 'POST',
			url: `${baseURL}/public/tokens`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: {
				app_id: credentials.appId,
				secret_key: credentials.appSecret,
			},
		} as const;
		const response = (await this.helpers.httpRequest(requestOptions)) as {
			data: {
				token_type: string;
				access_token: string;
				expire_in: number;
				expire_on: number;
				issued_at: number;
			};
			status: 'success';
		};
		const sessionTokenExpiresAt = new Date(response.data.expire_on * 1000).toISOString();
		return {
			sessionToken: response.data.access_token,
			sessionTokenExpiresAt: sessionTokenExpiresAt,
		};
	}

	authenticate: (
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	) => Promise<IHttpRequestOptions> = async (
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	) => {
		return {
			...requestOptions,
			headers: {
				...requestOptions.headers,
				Authorization: `Bearer ${credentials.sessionToken as string}`,
				app_id: credentials.appId as string,
			},
		};
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
