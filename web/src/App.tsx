import { useState, useEffect } from 'react'
import './App.css'

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
  const [apiInfo, setApiInfo] = useState<ApiInfo | null>(null)
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [infoRes, healthRes] = await Promise.all([
          fetch('/api/info'),
          fetch('/health')
        ])
        
        if (!infoRes.ok || !healthRes.ok) {
          throw new Error('API request failed')
        }

        const infoData = await infoRes.json()
        const healthData = await healthRes.json()
        
        setApiInfo(infoData)
        setHealth(healthData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch API')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="container">
      <header className="header">
        <h1>🚀 MindX Week 1</h1>
        <p className="subtitle">Full-Stack App on Azure Cloud</p>
      </header>

      <main className="main">
        {/* Health Status Card */}
        <div className="card">
          <h2>📊 API Health Status</h2>
          {loading ? (
            <p className="loading">Loading...</p>
          ) : error ? (
            <p className="error">❌ {error}</p>
          ) : health ? (
            <div className="status-grid">
              <div className="status-item">
                <span className="label">Status</span>
                <span className={`value ${health.status === 'healthy' ? 'healthy' : 'unhealthy'}`}>
                  {health.status === 'healthy' ? '✅' : '❌'} {health.status}
                </span>
              </div>
              <div className="status-item">
                <span className="label">Version</span>
                <span className="value">{health.version}</span>
              </div>
              <div className="status-item">
                <span className="label">Environment</span>
                <span className="value">{health.environment}</span>
              </div>
              <div className="status-item">
                <span className="label">Uptime</span>
                <span className="value">{Math.floor(health.uptime / 60)} min</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* API Info Card */}
        <div className="card">
          <h2>📡 API Information</h2>
          {loading ? (
            <p className="loading">Loading...</p>
          ) : error ? (
            <p className="error">❌ {error}</p>
          ) : apiInfo ? (
            <div className="info-content">
              <p><strong>Service:</strong> {apiInfo.service}</p>
              <p><strong>Version:</strong> {apiInfo.version}</p>
              <p><strong>Description:</strong> {apiInfo.description}</p>
              <div className="endpoints">
                <strong>Available Endpoints:</strong>
                <ul>
                  {Object.entries(apiInfo.endpoints).map(([name, path]) => (
                    <li key={name}><code>{name}: {path}</code></li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>

        {/* Tech Stack Card */}
        <div className="card">
          <h2>🛠️ Tech Stack</h2>
          <div className="tech-grid">
            <div className="tech-item">
              <span className="tech-icon">⚛️</span>
              <span>React + TypeScript</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🟢</span>
              <span>Node.js + Express</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🐳</span>
              <span>Docker</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">☸️</span>
              <span>Kubernetes (AKS)</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">☁️</span>
              <span>Azure Cloud</span>
            </div>
            <div className="tech-item">
              <span className="tech-icon">🔐</span>
              <span>OpenID Auth</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>MindX Onboarding Program - Week 1 Challenge</p>
        <p className="author">By Phuc Do</p>
      </footer>
    </div>
  )
}

export default App
