"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const tokenCache = new Map();
class TokenService {
    constructor(executeFunctions, environment) {
        this.executeFunctions = executeFunctions;
        this.environment = environment;
    }
    getCacheKey(identifier) {
        return `${this.environment}:${identifier}`;
    }
    isTokenValid(cachedToken) {
        return Date.now() < cachedToken.expiresAt;
    }
    async generateBearerToken(appId, appSecret) {
        const baseURL = this.environment === 'sandbox'
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
            }));
            if (!response.data.access_token) {
                throw new Error('No token received from Tekion API');
            }
            return response.data.access_token;
        }
        catch (error) {
            throw new Error(`Failed to generate bearer token: ${error.message}`);
        }
    }
    async getBearerToken(appId, appSecret) {
        const cacheKey = this.getCacheKey(appId);
        const cached = tokenCache.get(cacheKey);
        if (cached && this.isTokenValid(cached)) {
            return cached.token;
        }
        const bearerToken = await this.generateBearerToken(appId, appSecret);
        const expiresAt = Date.now() + 60 * 1000;
        tokenCache.set(cacheKey, {
            token: bearerToken,
            expiresAt: expiresAt,
        });
        return bearerToken;
    }
    clearCache(accessToken) {
        if (accessToken) {
            const cacheKey = this.getCacheKey(accessToken);
            tokenCache.delete(cacheKey);
        }
        else {
            tokenCache.clear();
        }
    }
}
exports.TokenService = TokenService;
//# sourceMappingURL=tokenService.js.map