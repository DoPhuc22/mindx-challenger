# MindX Week 1 - Fullstack App on Azure Cloud

A full-stack JavaScript/TypeScript application deployed on Azure Kubernetes Service (AKS) with OpenID authentication.

## 🌐 Live Demo

**https://phucdh.mindx.com.vn**

## ✅ Acceptance Criteria

| # | Criteria | Status |
|---|----------|--------|
| 1 | Backend API via HTTPS endpoint | ✅ |
| 2 | Frontend React via HTTPS domain | ✅ |
| 3 | HTTPS enforced | ✅ |
| 4 | OpenID authentication integrated | ✅ |
| 5 | Login/logout via OpenID | ✅ |
| 6 | Protected routes after login | ✅ |
| 7 | Backend validates OpenID token | ✅ |
| 8 | Azure Cloud infrastructure | ✅ |
| 9 | Deployment scripts committed | ✅ |
| 10 | Documentation provided | ✅ |

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Setup Guide](docs/SETUP.md) | Local development & environment setup |
| [Deployment Guide](docs/DEPLOYMENT.md) | Azure AKS deployment instructions |
| [Auth Flow](docs/AUTH-FLOW.md) | OpenID Connect authentication details |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Azure Cloud (Japan East)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Azure Kubernetes Service                  │  │
│  │                                                        │  │
│  │   NGINX Ingress + Let's Encrypt TLS                   │  │
│  │          phucdh.mindx.com.vn                          │  │
│  │                    │                                   │  │
│  │         ┌──────────┴──────────┐                       │  │
│  │         ▼                     ▼                       │  │
│  │   ┌──────────┐         ┌──────────┐                   │  │
│  │   │ Frontend │         │ Backend  │                   │  │
│  │   │ (React)  │         │ (Express)│                   │  │
│  │   └──────────┘         └────┬─────┘                   │  │
│  └─────────────────────────────┼─────────────────────────┘  │
│                                │                             │
│  ┌─────────────────────────────┴─────────────────────────┐  │
│  │           Azure Container Registry                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
              ┌─────────────────────────┐
              │   MindX OpenID Provider  │
              │   id-dev.mindx.edu.vn    │
              └─────────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Container | Docker (multi-stage builds) |
| Orchestration | Azure Kubernetes Service |
| Registry | Azure Container Registry |
| Ingress | NGINX + cert-manager |
| TLS | Let's Encrypt |
| Auth | OpenID Connect |

## 📁 Project Structure

```
Week1/
├── README.md
├── docs/
│   ├── SETUP.md          # Setup guide
│   ├── DEPLOYMENT.md     # Deployment guide
│   └── AUTH-FLOW.md      # Auth documentation
├── api/
│   ├── src/index.ts      # Express API
│   ├── k8s/              # Kubernetes manifests
│   └── Dockerfile
└── web/
    ├── src/              # React app
    ├── k8s/              # Kubernetes manifests
    └── Dockerfile
```

## 🚀 Quick Start

```powershell
# Backend
cd api && npm install && npm run dev

# Frontend (new terminal)
cd web && npm install && npm run dev
```

## 👤 Author

**Đỗ Hồng Phúc** - MindX Technology School

---

*Built with ❤️ for MindX Onboarding Week 1*
