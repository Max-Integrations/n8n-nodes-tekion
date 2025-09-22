import { IExecuteFunctions } from 'n8n-workflow';
export declare class TokenService {
    private executeFunctions;
    private environment;
    constructor(executeFunctions: IExecuteFunctions, environment: string);
    private getCacheKey;
    private isTokenValid;
    private generateBearerToken;
    getBearerToken(appId: string, appSecret: string): Promise<string>;
    clearCache(accessToken?: string): void;
}
