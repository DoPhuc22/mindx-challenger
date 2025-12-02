# 🛠️ Setup Guide

## Prerequisites

- **Node.js** 20+
- **Docker Desktop**
- **Azure CLI**
- **kubectl**

## Local Development

### Backend API

```powershell
cd api
npm install
npm run dev
```
> API runs on http://localhost:3000

### Frontend

```powershell
cd web
npm install
npm run dev
```
> Frontend runs on http://localhost:5173

## Environment Variables

### API (.env)

```env
PORT=3000
OIDC_ISSUER_URL=https://id-dev.mindx.edu.vn
OIDC_CLIENT_ID=mindx-onboarding
OIDC_CLIENT_SECRET=<your-secret>
OIDC_REDIRECT_URI=http://localhost:3000/auth/callback
FRONTEND_URL=http://localhost:5173
```

### Frontend

The frontend reads auth config from `/auth/config` API endpoint at runtime. No build-time environment variables needed.

## Build Docker Images

```powershell
# Build API
cd api
docker build -t mindxphucdhacr.azurecr.io/mindx-week1-api:v2.1 .

# Build Web
cd web
docker build -t mindxphucdhacr.azurecr.io/mindx-week1-web:v2.3 .
```

## Run Locally with Docker

```powershell
# Run API
docker run -p 3000:3000 --env-file api/.env mindxphucdhacr.azurecr.io/mindx-week1-api:v2.1

# Run Web
docker run -p 80:80 mindxphucdhacr.azurecr.io/mindx-week1-web:v2.3
```
