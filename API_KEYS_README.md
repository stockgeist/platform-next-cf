# API Keys Feature

This document describes the API key system implementation for the NLP platform.

## Overview

The API key system allows users to create and manage API keys for programmatic access to the platform's services. Users can create, view, and deactivate API keys, and use them to authenticate API requests and deduct credits from their account.

## Features

### API Key Management
- **Create API Keys**: Users can create new API keys with custom names
- **View API Keys**: List all API keys with their status, creation date, and last used date
- **Deactivate API Keys**: Users can deactivate API keys (soft delete)
- **Copy API Key Prefix**: Copy the first 8 characters of the API key for identification
- **Usage Statistics**: View statistics about API key usage

### API Authentication
- **Secure Storage**: API keys are hashed using SHA-256 before storage
- **Bearer Token Authentication**: API keys are used as Bearer tokens in Authorization headers
- **Automatic Usage Tracking**: Last used timestamp is updated on each API call
- **Expiration Support**: API keys can have optional expiration dates

### Credit Deduction
- **API Endpoint**: `/api/credits/deduct` for deducting credits via API
- **Rate Limiting**: API calls are rate limited to prevent abuse
- **Error Handling**: Proper error responses for insufficient credits, invalid keys, etc.

## Database Schema

### `api_key` Table
```sql
CREATE TABLE api_key (
  id TEXT PRIMARY KEY NOT NULL,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  name TEXT(255) NOT NULL,
  keyHash TEXT(255) NOT NULL,
  prefix TEXT(8) NOT NULL,
  isActive INTEGER DEFAULT 1 NOT NULL,
  lastUsedAt INTEGER,
  expiresAt INTEGER,
  permissions TEXT(1000),
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  updateCounter INTEGER DEFAULT 0
);
```

## API Usage

### Creating an API Key
1. Navigate to `/dashboard/api-keys`
2. Click "Create API Key"
3. Enter a name for the API key
4. Copy the generated API key (shown only once)

### Using an API Key
```bash
curl -X POST https://your-domain.com/api/credits/deduct \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10,
    "description": "NLP API call",
    "service": "text-generation"
  }'
```

### API Response
```json
{
  "success": true,
  "remainingCredits": 90,
  "transactionId": "api_1234567890"
}
```

### Error Responses
- **401 Unauthorized**: Invalid or missing API key
- **402 Payment Required**: Insufficient credits
- **400 Bad Request**: Invalid request body
- **429 Too Many Requests**: Rate limit exceeded

## Security Features

1. **Key Hashing**: API keys are hashed using SHA-256 before storage
2. **Prefix Display**: Only the first 8 characters are shown in the UI
3. **One-time Display**: Full API key is shown only once after creation
4. **Rate Limiting**: API calls are rate limited to prevent abuse
5. **Soft Delete**: API keys are deactivated rather than deleted
6. **Expiration Support**: Optional expiration dates for API keys

## Rate Limiting

- **API Credit Deduction**: 100 requests per minute per API key
- **API Key Management**: 15 requests per 5 minutes per user

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── credits/
│   │       └── deduct/
│   │           └── route.ts
│   └── (dashboard)/
│       └── dashboard/
│           └── api-keys/
│               ├── page.tsx
│               ├── _components/
│               │   ├── api-keys-list.tsx
│               │   ├── api-key-item.tsx
│               │   ├── create-api-key-button.tsx
│               │   └── api-key-usage-stats.tsx
│               └── _actions/
│                   └── api-key-actions.ts
├── db/
│   └── schema.ts (updated with apiKeyTable)
├── utils/
│   ├── api-key.ts
│   └── api-auth.ts
└── components/
    └── app-sidebar.tsx (updated with API Keys navigation)
```

## Migration

To apply the database changes:

```bash
# Generate migration
npm run db:generate add_api_keys_table

# Apply migration (development)
npm run db:migrate:dev

# Apply migration (production)
wrangler d1 migrations apply YOUR_DB_NAME --remote
```

## Future Enhancements

1. **Permission System**: Granular permissions for different API operations
2. **Key Rotation**: Automatic key rotation and renewal
3. **Usage Analytics**: Detailed usage analytics and reporting
4. **Webhook Support**: Webhook notifications for API key events
5. **Team API Keys**: API keys shared across team members
6. **Audit Logging**: Comprehensive audit trail for API key operations