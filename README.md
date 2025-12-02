# MindX Week 1 - Fullstack App on Azure Cloud

A full-stack JavaScript/TypeScript application deployed on Azure Kubernetes Service (AKS) with OpenID authentication.

## 🎯 Objectives Completed

| Criteria | Status |
|----------|--------|
| Backend API deployed via public HTTPS endpoint | ✅ |
| Frontend React app via public HTTPS domain | ✅ |
| HTTPS enforced for all endpoints | ✅ |
| OpenID authentication integrated | ✅ |
| Users can login/logout via OpenID | ✅ |
| Protected routes after login | ✅ |
| Backend validates OpenID tokens | ✅ |
| All services on Azure Cloud | ✅ |
| Deployment scripts committed | ✅ |
| Documentation provided | ✅ |

## 🌐 Live Demo

- **Frontend**: https://phucdh.mindx.com.vn
- **API Health**: https://phucdh.mindx.com.vn/health
- **API Info**: https://phucdh.mindx.com.vn/api/info

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Azure Cloud (Japan East)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   Azure Kubernetes Service                    │   │
│  │                     (mindx-phucdh-aks)                        │   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │              NGINX Ingress Controller                 │   │   │
│  │  │         + cert-manager (Let's Encrypt TLS)           │   │   │
│  │  │                                                       │   │   │
│  │  │   phucdh.mindx.com.vn (HTTPS:443)                    │   │   │
│  │  └──────────────────┬───────────────────────────────────┘   │   │
│  │                     │                                        │   │
│  │         ┌───────────┴───────────┐                           │   │
│  │         │                       │                           │   │
│  │         ▼                       ▼                           │   │
│  │  ┌─────────────┐        ┌─────────────┐                    │   │
│  │  │  Frontend   │        │   Backend   │                    │   │
│  │  │   (React)   │        │   (Express) │                    │   │
│  │  │   :80       │        │   :3000     │                    │   │
│  │  └─────────────┘        └──────┬──────┘                    │   │
│  │         │                      │                            │   │
│  │         │ Path: /              │ Paths: /api/*, /auth/*,   │   │
│  │         │                      │        /health            │   │
│  │         │                      │                            │   │
│  └─────────┴──────────────────────┴────────────────────────────┘   │
│                                   │                                  │
│  ┌────────────────────────────────┴────────────────────────────┐   │
│  │              Azure Container Registry                        │   │
│  │                 (mindxphucdhacr)                             │   │
│  │                                                              │   │
│  │   mindx-week1-api:v2.1    mindx-week1-web:v2.2              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │   MindX OpenID Provider     │
                    │  id-dev.mindx.edu.vn        │
                    │                             │
                    │  - Authorization Endpoint   │
                    │  - Token Endpoint           │
                    │  - Userinfo Endpoint        │
                    └─────────────────────────────┘
```

## 📁 Project Structure

```
Week1/
├── README.md                    # This file
├── api/                         # Backend API
│   ├── src/
│   │   └── index.ts            # Express server with OIDC auth
│   ├── k8s/
│   │   ├── deployment.yaml     # API deployment
│   │   ├── service.yaml        # API service
│   │   ├── ingress.yaml        # Ingress with TLS
│   │   └── cluster-issuer.yaml # Let's Encrypt issuer
│   ├── Dockerfile              # Multi-stage build
│   ├── package.json
│   └── deploy-azure.ps1        # Azure deployment script
│
├── web/                         # Frontend React
│   ├── src/
│   │   ├── App.tsx             # Main component
│   │   ├── auth/
│   │   │   ├── AuthContext.tsx # Auth provider
│   │   │   └── CallbackHandler.tsx
│   │   └── components/
│   │       └── Dashboard.tsx   # Protected dashboard
│   ├── k8s/
│   │   ├── deployment.yaml     # Web deployment
│   │   └── service.yaml        # Web service
│   ├── Dockerfile              # Multi-stage build
│   ├── nginx.conf              # Nginx config for SPA
│   └── package.json
│
└── docs/
    └── plans/
        └── week-1/
            ├── overview.md     # Week 1 objectives
            ├── architecture.md # Architecture details
            └── tasks.md        # Task breakdown
```

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 19, TypeScript, Vite |
| **Backend** | Node.js, Express, TypeScript |
| **Container** | Docker, multi-stage builds |
| **Orchestration** | Azure Kubernetes Service (AKS) |
| **Registry** | Azure Container Registry (ACR) |
| **Ingress** | NGINX Ingress Controller |
| **TLS** | cert-manager + Let's Encrypt |
| **Authentication** | OpenID Connect (OIDC) |
| **Identity Provider** | MindX ID (id-dev.mindx.edu.vn) |

## 🔐 Authentication Flow

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
     │                 │                 │                 │
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker Desktop
- Azure CLI
- kubectl

### Local Development

**Backend API:**
```powershell
cd api
npm install
npm run dev
# API runs on http://localhost:3000
```

**Frontend:**
```powershell
cd web
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### Build Docker Images

```powershell
# Build API
cd api
docker build -t mindxphucdhacr.azurecr.io/mindx-week1-api:v2.1 .

# Build Web
cd web
docker build -t mindxphucdhacr.azurecr.io/mindx-week1-web:v2.2 .
```

### Deploy to Azure

**1. Login to Azure:**
```powershell
az login
az account set --subscription "<subscription-id>"
```

**2. Login to ACR:**
```powershell
az acr login --name mindxphucdhacr
```

**3. Push images:**
```powershell
docker push mindxphucdhacr.azurecr.io/mindx-week1-api:v2.1
docker push mindxphucdhacr.azurecr.io/mindx-week1-web:v2.2
```

**4. Get AKS credentials:**
```powershell
az aks get-credentials --resource-group mindx-onboarding-phucdh --name mindx-phucdh-aks
```

**5. Create OIDC secret:**
```powershell
kubectl create secret generic oidc-credentials `
  --from-literal=client-id=mindx-onboarding `
  --from-literal=client-secret=<YOUR_SECRET> `
  --from-literal=redirect-uri=https://phucdh.mindx.com.vn/auth/callback `
  --from-literal=frontend-url=https://phucdh.mindx.com.vn
```

**6. Deploy to AKS:**
```powershell
# Deploy API
kubectl apply -f api/k8s/deployment.yaml
kubectl apply -f api/k8s/service.yaml

# Deploy cert-manager and cluster issuer
kubectl apply -f api/k8s/cluster-issuer.yaml

# Deploy ingress
kubectl apply -f api/k8s/ingress.yaml

# Deploy Web
kubectl apply -f web/k8s/deployment.yaml
kubectl apply -f web/k8s/service.yaml
```

**7. Verify deployment:**
```powershell
kubectl get pods
kubectl get svc
kubectl get ingress
kubectl get certificate
```

## 📋 API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health check |
| GET | `/api/info` | No | API information |
| GET | `/api/hello` | No | Hello endpoint |
| GET | `/api/profile` | Yes | Protected user profile |
| GET | `/auth/config` | No | OIDC configuration |
| GET | `/auth/callback` | No | OIDC callback handler |
| GET | `/auth/userinfo` | Yes | Get user info from token |

## 🔧 Environment Variables

### API Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default: 3000) |
| `OIDC_ISSUER_URL` | OpenID issuer URL |
| `OIDC_CLIENT_ID` | OpenID client ID |
| `OIDC_CLIENT_SECRET` | OpenID client secret |
| `OIDC_REDIRECT_URI` | Callback URL after auth |
| `FRONTEND_URL` | Frontend URL for CORS |

### Frontend Configuration

The frontend reads auth config from `/auth/config` API endpoint at runtime.

## 🔒 Security Features

- **HTTPS Enforced**: All traffic encrypted via TLS 1.2+
- **Let's Encrypt**: Automatic certificate management
- **Token Validation**: Backend validates access tokens via userinfo endpoint
- **CORS Configured**: Only allows frontend domain
- **Secure Cookies**: HttpOnly, Secure flags on tokens
- **Protected Routes**: Dashboard only visible when authenticated

## 📝 Kubernetes Resources

| Resource | Name | Purpose |
|----------|------|---------|
| Deployment | `mindx-api` | Backend API pods |
| Deployment | `mindx-web` | Frontend pods |
| Service | `mindx-api` | API ClusterIP service |
| Service | `mindx-web` | Web ClusterIP service |
| Ingress | `mindx-ingress` | External access + TLS |
| Secret | `oidc-credentials` | OIDC client credentials |
| ClusterIssuer | `letsencrypt-prod` | Let's Encrypt issuer |
| Certificate | `phucdh-mindx-tls` | TLS certificate |

## 🐛 Troubleshooting

### Check pod status
```powershell
kubectl get pods
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Check certificate status
```powershell
kubectl get certificate
kubectl describe certificate phucdh-mindx-tls
```

### Restart deployments
```powershell
kubectl rollout restart deployment/mindx-api
kubectl rollout restart deployment/mindx-web
```

### View ingress
```powershell
kubectl describe ingress mindx-ingress
```

## 👤 Author

**Phúc Đặng Hoàng**  
MindX Technology School - Onboarding Week 1

## 📅 Timeline

- **Start**: Week 1 Onboarding
- **Completed**: All 10 acceptance criteria met

---

*Built with ❤️ for MindX Technology School*
