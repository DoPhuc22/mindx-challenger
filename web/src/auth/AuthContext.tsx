import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { trackLogin, trackLogout, setUserId, trackError } from "../utils/analytics";

// Types
interface User {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  accessToken: string | null;
}

interface AuthConfig {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  endSessionEndpoint: string;
  clientId: string;
  redirectUri: string;
  scopes: string;
  frontendUrl: string;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Generate random state for CSRF protection
const generateState = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
};

// API base URL
const API_URL = import.meta.env.VITE_API_URL || "";

// Auth Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authConfig, setAuthConfig] = useState<AuthConfig | null>(null);

  // Fetch auth config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/config`);
        if (response.ok) {
          const config = await response.json();
          setAuthConfig(config);
        }
      } catch (error) {
        console.error("Failed to fetch auth config:", error);
      }
    };
    fetchConfig();
  }, []);

  // Check for tokens in URL (callback) or localStorage
  useEffect(() => {
    const handleAuth = async () => {
      // Check URL for callback tokens
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("access_token");

      if (token) {
        // Store token and clear URL
        localStorage.setItem("access_token", token);
        const idToken = urlParams.get("id_token");
        if (idToken) {
          localStorage.setItem("id_token", idToken);
        }
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        setAccessToken(token);
        await fetchUserInfo(token);
      } else {
        // Check localStorage for existing token
        const storedToken = localStorage.getItem("access_token");
        if (storedToken) {
          setAccessToken(storedToken);
          await fetchUserInfo(storedToken);
        }
      }

      setIsLoading(false);
    };

    handleAuth();
  }, []);

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/userinfo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userInfo = await response.json();
        setUser(userInfo);
        // Track successful login and set user ID for GA
        trackLogin("MindX_OpenID");
        if (userInfo.sub) {
          setUserId(userInfo.sub);
        }
      } else {
        // Token invalid, clear storage
        localStorage.removeItem("access_token");
        localStorage.removeItem("id_token");
        setAccessToken(null);
        setUser(null);
        trackError("auth", "Token validation failed");
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      localStorage.removeItem("access_token");
      localStorage.removeItem("id_token");
      setAccessToken(null);
      setUser(null);
      trackError("auth", "Failed to fetch user info");
    }
  };

  const login = () => {
    if (!authConfig) {
      console.error("Auth config not loaded");
      return;
    }

    const state = generateState();
    localStorage.setItem("oauth_state", state);

    const params = new URLSearchParams({
      client_id: authConfig.clientId,
      redirect_uri: authConfig.redirectUri,
      response_type: "code",
      scope: authConfig.scopes,
      state: state,
    });

    window.location.href = `${
      authConfig.authorizationEndpoint
    }?${params.toString()}`;
  };

  const logout = () => {
    // Track logout event
    trackLogout();
    
    // Clear local storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("oauth_state");
    setUser(null);
    setAccessToken(null);

    // Just reload the page after clearing tokens
    // OIDC logout requires post_logout_redirect_uri to be registered
    // TODO: Enable OIDC logout once post_logout_redirect_uri is configured
    window.location.href = window.location.origin;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
