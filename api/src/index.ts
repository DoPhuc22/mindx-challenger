import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import * as appInsights from "applicationinsights";

// Load environment variables
dotenv.config();

// Initialize Azure Application Insights
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  appInsights
    .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(true)
    .start();
  console.log("✅ Azure Application Insights initialized");
}

const app = express();
const PORT = process.env.PORT || 3000;

// OpenID Configuration
const OIDC_CONFIG = {
  issuer: "https://id-dev.mindx.edu.vn",
  authorizationEndpoint: "https://id-dev.mindx.edu.vn/auth",
  tokenEndpoint: "https://id-dev.mindx.edu.vn/token",
  userInfoEndpoint: "https://id-dev.mindx.edu.vn/me",
  endSessionEndpoint: "https://id-dev.mindx.edu.vn/session/end",
  jwksUri: "https://id-dev.mindx.edu.vn/jwks",
  clientId: process.env.OIDC_CLIENT_ID || "mindx-onboarding",
  clientSecret: process.env.OIDC_CLIENT_SECRET || "",
  redirectUri:
    process.env.OIDC_REDIRECT_URI || "http://localhost:3000/auth/callback",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  scopes: "openid profile email",
};

// JWKS client for token verification
const jwks = jwksClient({
  jwksUri: OIDC_CONFIG.jwksUri,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000, // 10 minutes
});

// Get signing key from JWKS
const getKey = (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) => {
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
};

// Verify JWT token (for JWT tokens)
const verifyJwtToken = (token: string): Promise<jwt.JwtPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        issuer: OIDC_CONFIG.issuer,
        audience: OIDC_CONFIG.clientId,
      },
      (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded as jwt.JwtPayload);
      }
    );
  });
};

// Verify token by calling userinfo endpoint (for opaque tokens)
const verifyTokenViaUserInfo = async (
  token: string
): Promise<Record<string, unknown>> => {
  const response = await fetch(OIDC_CONFIG.userInfoEndpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`UserInfo request failed: ${response.status}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
};

// Auth middleware - supports both JWT and opaque tokens
interface AuthRequest extends Request {
  user?: jwt.JwtPayload | Record<string, unknown>;
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    // First try to verify as JWT
    const decoded = await verifyJwtToken(token);
    req.user = decoded;
    next();
  } catch (jwtError) {
    // If JWT verification fails, try userinfo endpoint (opaque token)
    try {
      const userInfo = await verifyTokenViaUserInfo(token);
      req.user = userInfo;
      next();
    } catch (userInfoError) {
      console.error("Token verification failed:", jwtError, userInfoError);
      res.status(401).json({ error: "Invalid token" });
    }
  }
};

// Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: [
      OIDC_CONFIG.frontendUrl,
      "http://localhost:5173",
      "http://localhost:3000",
      "https://phucdh.mindx.com.vn",
    ],
    credentials: true,
  })
);
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (required for Azure Web App)
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

// Hello World endpoint
app.get("/api/hello", (req: Request, res: Response) => {
  const name = req.query.name || "World";
  res.json({
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
    service: "MindX Week 1 API",
  });
});

// API info endpoint
app.get("/api/info", (_req: Request, res: Response) => {
  res.json({
    service: "MindX Week 1 API",
    version: "1.0.0",
    description: "Simple Express API deployed to Azure",
    endpoints: {
      health: "/health",
      hello: "/api/hello?name=YourName",
      info: "/api/info",
      authConfig: "/auth/config",
      authCallback: "/auth/callback",
      userProfile: "/api/profile (protected)",
    },
  });
});

// ============ AUTH ENDPOINTS ============

// Get OIDC configuration for frontend
app.get("/auth/config", (_req: Request, res: Response) => {
  res.json({
    authorizationEndpoint: OIDC_CONFIG.authorizationEndpoint,
    tokenEndpoint: OIDC_CONFIG.tokenEndpoint,
    userInfoEndpoint: OIDC_CONFIG.userInfoEndpoint,
    endSessionEndpoint: OIDC_CONFIG.endSessionEndpoint,
    clientId: OIDC_CONFIG.clientId,
    redirectUri: OIDC_CONFIG.redirectUri,
    scopes: OIDC_CONFIG.scopes,
    frontendUrl: OIDC_CONFIG.frontendUrl,
  });
});

// OAuth callback - exchange code for tokens
app.get("/auth/callback", async (req: Request, res: Response) => {
  const { code, state } = req.query;

  if (!code) {
    // Track failed auth attempt
    if (appInsights.defaultClient) {
      appInsights.defaultClient.trackEvent({
        name: "AuthCallback_NoCode",
        properties: { state: state as string },
      });
    }
    return res.redirect(`${OIDC_CONFIG.frontendUrl}?error=no_code`);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(OIDC_CONFIG.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code as string,
        redirect_uri: OIDC_CONFIG.redirectUri,
        client_id: OIDC_CONFIG.clientId,
        client_secret: OIDC_CONFIG.clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      return res.redirect(
        `${OIDC_CONFIG.frontendUrl}?error=token_exchange_failed`
      );
    }

    const tokens = (await tokenResponse.json()) as {
      access_token: string;
      id_token?: string;
      token_type?: string;
      expires_in?: number;
    };

    // Redirect to frontend with tokens
    const params = new URLSearchParams({
      access_token: tokens.access_token,
      id_token: tokens.id_token || "",
      token_type: tokens.token_type || "Bearer",
      expires_in: String(tokens.expires_in || 3600),
      ...(state && { state: state as string }),
    });

    // Track successful login
    if (appInsights.defaultClient) {
      appInsights.defaultClient.trackEvent({
        name: "UserLogin_Success",
        properties: { hasIdToken: !!tokens.id_token },
      });
    }

    res.redirect(`${OIDC_CONFIG.frontendUrl}/callback?${params.toString()}`);
  } catch (error) {
    console.error("Auth callback error:", error);
    // Track auth error
    if (appInsights.defaultClient) {
      appInsights.defaultClient.trackException({
        exception: error as Error,
        properties: { endpoint: "auth/callback" },
      });
    }
    res.redirect(`${OIDC_CONFIG.frontendUrl}?error=callback_failed`);
  }
});

// Get user profile from token
app.get("/api/profile", authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({
    user: req.user,
    message: "Protected route accessed successfully",
  });
});

// Proxy userinfo endpoint (for frontend to get user details)
app.get(
  "/auth/userinfo",
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;

    try {
      const userInfoResponse = await fetch(OIDC_CONFIG.userInfoEndpoint, {
        headers: {
          Authorization: authHeader || "",
        },
      });

      if (!userInfoResponse.ok) {
        res
          .status(userInfoResponse.status)
          .json({ error: "Failed to fetch user info" });
        return;
      }

      const userInfo = await userInfoResponse.json();
      res.json(userInfo);
    } catch (error) {
      console.error("UserInfo error:", error);
      res.status(500).json({ error: "Failed to fetch user info" });
    }
  }
);

// Root endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "MindX Week 1 API is running",
    documentation: "/api/info",
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: ["/", "/health", "/api/hello", "/api/info"],
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);

  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log("=================================");
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API info: http://localhost:${PORT}/api/info`);
  console.log("=================================");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  process.exit(0);
});
