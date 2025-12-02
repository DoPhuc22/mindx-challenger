import { useEffect } from "react";
import { useAuth } from "./AuthContext";

// This component handles the OAuth callback
// It's rendered at /callback route and processes the tokens from URL
export const CallbackHandler = () => {
  const { isLoading } = useAuth();

  useEffect(() => {
    // The AuthContext already handles token extraction from URL
    // This component just shows a loading state

    // If there's an error in URL, show it
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");

    if (error) {
      console.error("Auth error:", error);
    }
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔐</div>
        <h2>Authenticating...</h2>
        <p style={{ color: "#94a3b8" }}>
          Please wait while we complete your login
        </p>
      </div>
    );
  }

  // After loading, the AuthContext will have set the user
  // and the main App component will render
  return null;
};
