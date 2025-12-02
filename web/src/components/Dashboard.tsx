import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

const Dashboard = () => {
  const { user, accessToken } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!user) {
    return null;
  }

  const copyToken = () => {
    if (accessToken) {
      navigator.clipboard.writeText(accessToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="dashboard">
      <div className="card card-dashboard">
        <h2>🔒 Protected Dashboard</h2>
        <div className="dashboard-grid">
          {/* Profile Card */}
          <div className="dashboard-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {user.picture ? (
                  <img src={user.picture} alt="Avatar" />
                ) : (
                  (user.name || user.email || "U")[0].toUpperCase()
                )}
              </div>
              <div className="profile-info">
                <h3>{user.name || "User"}</h3>
                <p>{user.email}</p>
              </div>
            </div>
            <div className="profile-details">
              {user.given_name && (
                <p>
                  <span>First Name</span>
                  <strong>{user.given_name}</strong>
                </p>
              )}
              {user.family_name && (
                <p>
                  <span>Last Name</span>
                  <strong>{user.family_name}</strong>
                </p>
              )}
              <p>
                <span>User ID</span>
                <code>{user.sub?.substring(0, 20)}...</code>
              </p>
            </div>
          </div>

          {/* Token Card */}
          <div className="dashboard-card">
            <h3>🔑 Access Token</h3>
            <div className="token-display">
              <code>
                {accessToken
                  ? `${accessToken.substring(0, 80)}...`
                  : "No token"}
              </code>
            </div>
            <button className="btn-copy" onClick={copyToken}>
              {copied ? "✅ Copied!" : "📋 Copy Full Token"}
            </button>
          </div>

          {/* Protected APIs Card */}
          <div className="dashboard-card">
            <h3>🛡️ Protected Endpoints</h3>
            <ul className="api-list">
              <li>
                <span className="method">GET</span>
                <code>/api/profile</code>
              </li>
              <li>
                <span className="method">GET</span>
                <code>/auth/userinfo</code>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
