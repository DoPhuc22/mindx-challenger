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
    <div className="glass-card p-6 lg:p-8 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5">
      <h2 className="text-xl lg:text-2xl font-bold text-emerald-400 mb-6 flex items-center gap-3">
        <span className="text-3xl">🔒</span>
        Protected Dashboard
        <span className="status-healthy text-xs ml-auto">Authenticated</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Profile Card */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-cyan-400 via-emerald-400 to-purple-500 p-[2px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                {user.picture ? (
                  <img src={user.picture} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                    {(user.name || user.email || "U")[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-semibold text-white">
                {user.name || "User"}
              </h3>
              <p className="text-slate-400 text-sm">{user.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            {user.given_name && (
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-500 text-sm">First Name</span>
                <span className="text-white font-medium">{user.given_name}</span>
              </div>
            )}
            {user.family_name && (
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-500 text-sm">Last Name</span>
                <span className="text-white font-medium">{user.family_name}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500 text-sm">User ID</span>
              <code className="text-cyan-400 text-xs bg-cyan-500/10 px-2 py-1 rounded">
                {user.sub?.substring(0, 16)}...
              </code>
            </div>
          </div>
        </div>

        {/* Token Card */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <span>🔑</span> Access Token
          </h3>
          
          <div className="bg-black/40 rounded-lg p-4 mb-4 border border-white/5">
            <code className="text-slate-400 text-xs break-all leading-relaxed block max-h-32 overflow-y-auto">
              {accessToken ? `${accessToken.substring(0, 120)}...` : "No token"}
            </code>
          </div>

          <button
            onClick={copyToken}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2
              ${copied 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20"
              }`}
          >
            {copied ? (
              <>
                <span>✅</span> Copied to clipboard!
              </>
            ) : (
              <>
                <span>📋</span> Copy Full Token
              </>
            )}
          </button>
        </div>

        {/* Protected APIs Card */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all">
          <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
            <span>🛡️</span> Protected Endpoints
          </h3>

          <div className="space-y-3">
            {[
              { method: "GET", path: "/api/profile", desc: "User profile data" },
              { method: "GET", path: "/auth/userinfo", desc: "Token validation" },
            ].map((endpoint) => (
              <div
                key={endpoint.path}
                className="bg-white/5 rounded-lg p-3 border border-white/5 hover:border-purple-500/20 transition-all group"
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {endpoint.method}
                  </span>
                  <code className="text-cyan-400 text-sm group-hover:text-cyan-300 transition-colors">
                    {endpoint.path}
                  </code>
                </div>
                <p className="text-slate-500 text-xs mt-1">{endpoint.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-amber-400 text-xs flex items-start gap-2">
              <span>💡</span>
              <span>These endpoints require a valid access token in the Authorization header.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
