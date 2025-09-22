import { IExecuteFunctions } from 'n8n-workflow';

interface TokenCache {
	token: string;
	expiresAt: number;
}

// In-memory cache for bearer tokens
const tokenCache = new Map<string, TokenCache>();

export class TokenService {
	private executeFunctions: IExecuteFunctions;
	private environment: string;

	constructor(executeFunctions: IExecuteFunctions, environment: string) {
		this.executeFunctions = executeFunctions;
		this.environment = environment;
	}

	private getCacheKey(identifier: string): string {
		return `${this.environment}:${identifier}`;
	}

	private isTokenValid(cachedToken: TokenCache): boolean {
		return Date.now() < cachedToken.expiresAt;
	}

	private async generateBearerToken(appId: string, appSecret: string): Promise<string> {
		const baseURL =
			this.environment === 'sandbox'
				? 'https://api-sandbox.tekioncloud.com/openapi'
				: 'https://api.tekioncloud.com/openapi';

		try {
			const response = (await this.executeFunctions.helpers.httpRequest({
				method: 'POST',
				url: `${baseURL}/public/tokens`,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: {
					app_id: appId,
					secret_key: appSecret,
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

			if (!response.data.access_token) {
				throw new Error('No token received from Tekion API');
			}

			return response.data.access_token;
		} catch (error) {
			throw new Error(`Failed to generate bearer token: ${error.message}`);
		}
	}

	async getBearerToken(appId: string, appSecret: string): Promise<string> {
		const cacheKey = this.getCacheKey(appId);
		const cached = tokenCache.get(cacheKey);

		// Check if we have a valid cached token
		if (cached && this.isTokenValid(cached)) {
			return cached.token;
		}

		// Generate new token
		const bearerToken = await this.generateBearerToken(appId, appSecret);

		// Cache the token with 23-hour expiration (1 hour buffer from 24-hour validity)
		const expiresAt = Date.now() + 60 * 1000;
		tokenCache.set(cacheKey, {
			token: bearerToken,
			expiresAt: expiresAt,
		});

		return bearerToken;
	}

	// Method to clear cache (useful for testing or manual refresh)
	clearCache(accessToken?: string): void {
		if (accessToken) {
			const cacheKey = this.getCacheKey(accessToken);
			tokenCache.delete(cacheKey);
		} else {
			tokenCache.clear();
		}
	}
}
