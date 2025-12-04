# 🔐 Authentication Flow

## Overview

This application uses **OpenID Connect (OIDC)** with MindX Identity Provider for authentication.

| Component          | Value                         |
| ------------------ | ----------------------------- |
| Identity Provider  | `https://id-dev.mindx.edu.vn` |
| Client ID          | `mindx-onboarding`            |
| Authorization Flow | Authorization Code Flow       |
| Token Type         | Opaque Token                  |

## Authentication Flow Diagram

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  User    │      │ Frontend │      │ Backend  │      │  MindX   │
│ Browser  │      │  React   │      │  API     │      │   ID     │
└────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘
     │                 │                 │                 │
     │ 1. Click Login  │                 │                 │
     │────────────────>│                 │                 │
     │                 │                 │                 │
     │ 2. Redirect to  │                 │                 │
     │    MindX ID     │                 │                 │
     │<────────────────│                 │                 │
     │                 │                 │                 │
     │ 3. User authenticates             │                 │
     │─────────────────────────────────────────────────────>
     │                 │                 │                 │
     │ 4. Redirect back with code        │                 │
     │<─────────────────────────────────────────────────────
     │                 │                 │                 │
     │ 5. Send code    │                 │                 │
     │────────────────>│                 │                 │
     │                 │                 │                 │
     │                 │ 6. Exchange code│                 │
     │                 │ for tokens      │                 │
     │                 │────────────────>│ ───────────────>│
     │                 │                 │                 │
     │                 │ 7. Return tokens│<────────────────│
     │                 │<────────────────│                 │
     │                 │                 │                 │
     │ 8. Store tokens │                 │                 │
     │<────────────────│                 │                 │
     │                 │                 │                 │
     │ 9. Fetch user info               │                 │
     │────────────────>│────────────────>│                 │
     │                 │                 │ validate via    │
     │                 │                 │ userinfo ──────>│
     │                 │<────────────────│<────────────────│
     │<────────────────│                 │                 │
```

## Token Validation

Since MindX ID returns **opaque tokens** (not JWTs), the backend validates tokens by calling the userinfo endpoint:

```typescript
async function verifyTokenViaUserInfo(accessToken: string) {
  const response = await fetch(`${OIDC_ISSUER_URL}/connect/userinfo`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Invalid token");
  }

  return await response.json();
}
```

## API Endpoints

### Public Endpoints

| Method | Path             | Description                     |
| ------ | ---------------- | ------------------------------- |
| GET    | `/health`        | Health check                    |
| GET    | `/api/info`      | API information                 |
| GET    | `/api/hello`     | Hello endpoint                  |
| GET    | `/auth/config`   | OIDC configuration for frontend |
| GET    | `/auth/callback` | OIDC callback handler           |

### Protected Endpoints (Require Authentication)

| Method | Path             | Description              |
| ------ | ---------------- | ------------------------ |
| GET    | `/api/profile`   | Get user profile         |
| GET    | `/auth/userinfo` | Get user info from token |

## Frontend Auth Context

The frontend uses React Context to manage authentication state:

```typescript
// AuthContext provides:
interface AuthContextType {
  user: UserInfo | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}
```

## Login Flow

1. User clicks "Login with MindX"
2. Frontend generates `state` and `nonce` for CSRF protection
3. User is redirected to MindX ID authorization endpoint
4. User authenticates and grants consent
5. MindX ID redirects back with authorization code
6. Backend exchanges code for tokens
7. Frontend stores access token in localStorage
8. Frontend fetches user info and displays dashboard

## Logout Flow

1. User clicks "Logout"
2. Frontend clears tokens from localStorage
3. User is redirected to home page

> Note: Full OIDC logout (end_session_endpoint) is not implemented due to redirect URI restrictions on the IdP.

## Security Considerations

- **State Parameter**: Prevents CSRF attacks
- **HTTPS Only**: All traffic encrypted
- **Token Storage**: Access token stored in localStorage (consider httpOnly cookies for production)
- **Short Token Lifetime**: Tokens expire after configured time
- **Server-side Validation**: All protected routes validate token via userinfo endpoint
