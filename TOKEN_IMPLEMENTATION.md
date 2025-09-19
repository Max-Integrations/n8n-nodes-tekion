# Tekion Bearer Token Implementation

## Overview

This implementation provides automatic bearer token generation and caching for the Tekion API. The bearer tokens are valid for 24 hours and are automatically refreshed when needed.

## How It Works

### 1. Token Service (`shared/tokenService.ts`)

The `TokenService` class handles:

- **Token Generation**: Makes API calls to `/auth/token` endpoint with the access token
- **Token Caching**: Stores tokens in memory with expiration tracking
- **Automatic Refresh**: Generates new tokens when cached ones expire
- **Environment Support**: Works with both sandbox and production environments

### 2. Credentials (`credentials/GithubIssuesApi.credentials.ts`)

Updated to:

- Store the Tekion access token
- Provide proper authentication headers
- Include test functionality

### 3. Main Node (`GithubIssues.node.ts`)

The main node:

- Uses the `TokenService` to get valid bearer tokens
- Automatically handles token refresh
- Supports both sandbox and production environments
- Implements proper error handling

## Usage

### Setting Up Credentials

1. Create a new credential of type "Tekion API"
2. Enter your Tekion access token
3. The system will automatically generate and manage bearer tokens

### Environment Selection

- **Production**: Uses `https://api.tekioncloud.com/openapi`
- **Sandbox**: Uses `https://api-sandbox.tekioncloud.com/openapi`

### Token Lifecycle

1. **First Request**: Generates a new bearer token using the access token
2. **Subsequent Requests**: Uses cached token if still valid
3. **Token Expiry**: Automatically generates a new token when the current one expires
4. **Cache Management**: Tokens are cached for 23 hours (1-hour buffer from 24-hour validity)

## API Endpoints

The implementation expects the following Tekion API structure:

```
POST /auth/token
{
  "accessToken": "your-access-token"
}

Response:
{
  "token": "generated-bearer-token"
}
```

## Error Handling

- **Invalid Access Token**: Throws error if access token is missing or invalid
- **API Errors**: Properly handles and reports API errors
- **Token Generation Failures**: Provides clear error messages for token generation issues

## Security Considerations

- Access tokens are stored securely in n8n credentials
- Bearer tokens are cached in memory only (not persisted)
- Tokens automatically expire and are refreshed
- No sensitive data is logged

## Testing

The credential test will attempt to generate a bearer token using the provided access token, ensuring the credentials are valid before use.
