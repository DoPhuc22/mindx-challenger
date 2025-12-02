import { useState, useEffect } from "react";
import { useAuth } from "./auth/AuthContext";
import Dashboard from "./components/Dashboard";

interface ApiInfo {
  service: string;
  version: string;
  description: string;
  endpoints: Record<string, string>;
}

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
}

function App() {
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    login,
    logout,
  } = useAuth();
  const [apiInfo, setApiInfo] = useState<ApiInfo | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [infoRes, healthRes] = await Promise.all([
          fetch("/api/info"),
          fetch("/health"),
        ]);

        if (!infoRes.ok || !healthRes.ok) {
          throw new Error("API request failed");
        }

        const infoData = await infoRes.json();
        const healthData = await healthRes.json();

        setApiInfo(infoData);
        setHealth(healthData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch API");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Header */}
      <header className="w-full bg-black/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-4 lg:py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text">
              🚀 MindX Week 1
            </h1>
            <p className="text-slate-400 text-sm lg:text-base mt-1">
              Full-Stack App on Azure Cloud
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {authLoading ? (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 flex items-center justify-center text-slate-900 font-bold text-sm">
                  {(user.name || user.email || "U").charAt(0).toUpperCase()}
                </div>
                <span className="text-emerald-400 font-medium hidden sm:block">
                  {user.name || user.email || "User"}
                </span>
                <button
                  onClick={logout}
                  className="btn-outline text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={login} className="btn-primary">
                🔐 Login with MindX
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          
          {/* Dashboard - Full Width when authenticated */}
          {isAuthenticated && user && (
            <div className="col-span-full">
              <Dashboard />
            </div>
          )}

          {/* Health Status Card */}
          <div className="glass-card glass-card-hover p-6">
            <h2 className="text-lg lg:text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span> API Health Status
            </h2>
            
            {loading ? (
              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-red-400">
                <span>❌</span> {error}
              </div>
            ) : health ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</p>
                  <p className={`font-semibold flex items-center gap-2 ${health.status === "healthy" ? "text-emerald-400" : "text-red-400"}`}>
                    {health.status === "healthy" ? "✅" : "❌"} {health.status}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Version</p>
                  <p className="font-semibold text-white">{health.version}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Environment</p>
                  <p className="font-semibold text-white">{health.environment}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Uptime</p>
                  <p className="font-semibold text-white">{Math.floor(health.uptime / 60)} min</p>
                </div>
              </div>
            ) : null}
          </div>

          {/* API Info Card */}
          <div className="glass-card glass-card-hover p-6">
            <h2 className="text-lg lg:text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
              <span className="text-2xl">📡</span> API Information
            </h2>
            
            {loading ? (
              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-red-400">
                <span>❌</span> {error}
              </div>
            ) : apiInfo ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400">Service</span>
                  <span className="text-white font-medium">{apiInfo.service}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-slate-400">Version</span>
                  <span className="text-white font-medium">{apiInfo.version}</span>
                </div>
                <div className="pt-2">
                  <p className="text-slate-400 text-sm mb-3">Endpoints:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(apiInfo.endpoints).map(([name, path]) => (
                      <div key={name} className="bg-cyan-500/5 border border-cyan-500/10 rounded-lg px-3 py-2">
                        <code className="text-cyan-400 text-sm">{name}: {path}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Tech Stack Card */}
          <div className="glass-card glass-card-hover p-6">
            <h2 className="text-lg lg:text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
              <span className="text-2xl">🛠️</span> Tech Stack
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "⚛️", name: "React + TS", color: "from-cyan-500 to-blue-500" },
                { icon: "🟢", name: "Node.js", color: "from-green-500 to-emerald-500" },
                { icon: "🐳", name: "Docker", color: "from-blue-500 to-cyan-500" },
                { icon: "☸️", name: "Kubernetes", color: "from-indigo-500 to-purple-500" },
                { icon: "☁️", name: "Azure Cloud", color: "from-blue-400 to-sky-500" },
                { icon: "🔐", name: "OpenID Auth", color: "from-orange-500 to-amber-500" },
              ].map((tech) => (
                <div
                  key={tech.name}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform duration-300">
                    {tech.icon}
                  </span>
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-black/20 border-t border-white/10 py-6 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-slate-400 text-sm">
          MindX Onboarding Program - Week 1 Challenge
        </p>
        <p className="text-cyan-400 font-semibold mt-1">
          By Phuc Do
        </p>
      </footer>
    </div>
  );
}

export default App;
