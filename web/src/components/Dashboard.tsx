import { useAuth } from '../auth/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, accessToken } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard">
      <h2>🔒 Protected Dashboard</h2>
      <p className="dashboard-subtitle">This page is only visible to authenticated users</p>
      
      <div className="dashboard-content">
        <div className="dashboard-section">
          <h3>👤 Your Profile</h3>
          <div className="profile-grid">
            {user.name && (
              <div className="profile-item">
                <span className="profile-label">Name</span>
                <span className="profile-value">{user.name}</span>
              </div>
            )}
            {user.email && (
              <div className="profile-item">
                <span className="profile-label">Email</span>
                <span className="profile-value">{user.email}</span>
              </div>
            )}
            {user.given_name && (
              <div className="profile-item">
                <span className="profile-label">First Name</span>
                <span className="profile-value">{user.given_name}</span>
              </div>
            )}
            {user.family_name && (
              <div className="profile-item">
                <span className="profile-label">Last Name</span>
                <span className="profile-value">{user.family_name}</span>
              </div>
            )}
            <div className="profile-item">
              <span className="profile-label">User ID</span>
              <span className="profile-value profile-id">{user.sub}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>🔑 Access Token</h3>
          <div className="token-display">
            <code>{accessToken ? `${accessToken.substring(0, 50)}...` : 'No token'}</code>
          </div>
          <p className="token-info">
            This token is used to authenticate API requests to protected endpoints.
          </p>
        </div>

        <div className="dashboard-section">
          <h3>🛡️ Protected API Test</h3>
          <p>Your authentication status allows access to:</p>
          <ul className="api-list">
            <li><code>GET /api/profile</code> - Get your profile from backend</li>
            <li><code>GET /auth/userinfo</code> - Get user info from OpenID</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
