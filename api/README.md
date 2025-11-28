# MindX Week 1 - API Service

Simple Express API built with Node.js and TypeScript, containerized with Docker, and deployed to Azure.

## 📋 Features

- ✅ Express.js with TypeScript
- ✅ Health check endpoint for Azure monitoring
- ✅ CORS and security headers (Helmet)
- ✅ Request logging
- ✅ Error handling
- ✅ Containerized with multi-stage Docker build
- ✅ Production-ready configuration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (for containerization)
- Azure CLI (for deployment)

### Local Development

1. **Install dependencies:**

```bash
cd api
npm install
```

2. **Create environment file:**

```bash
cp .env.example .env
```

3. **Run in development mode:**

```bash
npm run dev
```

4. **Build TypeScript:**

```bash
npm run build
```

5. **Run production build:**

```bash
npm start
```

The API will be available at `http://localhost:3000`

### Test Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Hello endpoint
curl http://localhost:3000/api/hello?name=MindX

# API info
curl http://localhost:3000/api/info
```

## 🐳 Docker

### Build Docker Image

```bash
cd api
docker build -t mindx-week1-api:latest .
```

### Run Docker Container

```bash
docker run -p 3000:3000 mindx-week1-api:latest
```

### Test Docker Container

```bash
curl http://localhost:3000/health
```

## ☁️ Azure Deployment

### Step 1: Set Variables

```powershell
# Set your Azure configuration
$RESOURCE_GROUP="mindx-week1-rg"
$LOCATION="eastus"
$ACR_NAME="mindxweek1acr"  # Must be globally unique, lowercase alphanumeric only
$APP_NAME="mindx-week1-api"  # Must be globally unique
$APP_PLAN="mindx-week1-plan"
$IMAGE_NAME="mindx-week1-api"
$IMAGE_TAG="latest"
```

### Step 2: Verify Azure Login

```powershell
# Login to Azure (if not already logged in)
az login

# Verify your subscription
az account show

# Set subscription (if you have multiple)
# az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### Step 3: Create Resource Group

```powershell
az group create --name $RESOURCE_GROUP --location $LOCATION
```

### Step 4: Create Azure Container Registry (ACR)

```powershell
# Create ACR
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic

# Enable admin access (for simple authentication)
az acr update -n $ACR_NAME --admin-enabled true

# Get ACR login server
$ACR_LOGIN_SERVER = az acr show --name $ACR_NAME --query loginServer --output tsv
Write-Host "ACR Login Server: $ACR_LOGIN_SERVER"
```

### Step 5: Build and Push Image to ACR

**Option A: Build locally and push**

```powershell
# Login to ACR
az acr login --name $ACR_NAME

# Build image
docker build -t ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${IMAGE_TAG} .

# Push image
docker push ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${IMAGE_TAG}
```

**Option B: Build in Azure (recommended for slower connections)**

```powershell
# Build image in ACR directly
az acr build --registry $ACR_NAME --image ${IMAGE_NAME}:${IMAGE_TAG} .
```

### Step 6: Verify Image in ACR

```powershell
# List images in ACR
az acr repository list --name $ACR_NAME --output table

# Show tags for your image
az acr repository show-tags --name $ACR_NAME --repository $IMAGE_NAME --output table
```

### Step 7: Create App Service Plan

```powershell
# Create Linux-based App Service Plan (B1 tier)
az appservice plan create `
  --name $APP_PLAN `
  --resource-group $RESOURCE_GROUP `
  --is-linux `
  --sku B1
```

### Step 8: Create Web App from ACR

```powershell
# Get ACR credentials
$ACR_USERNAME = az acr credential show --name $ACR_NAME --query username --output tsv
$ACR_PASSWORD = az acr credential show --name $ACR_NAME --query "passwords[0].value" --output tsv

# Create Web App from container
az webapp create `
  --resource-group $RESOURCE_GROUP `
  --plan $APP_PLAN `
  --name $APP_NAME `
  --deployment-container-image-name ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${IMAGE_TAG}

# Configure Web App to use ACR credentials
az webapp config container set `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --docker-custom-image-name ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${IMAGE_TAG} `
  --docker-registry-server-url https://${ACR_LOGIN_SERVER} `
  --docker-registry-server-user $ACR_USERNAME `
  --docker-registry-server-password $ACR_PASSWORD

# Set port (Azure needs to know which port the container listens on)
az webapp config appsettings set `
  --resource-group $RESOURCE_GROUP `
  --name $APP_NAME `
  --settings WEBSITES_PORT=3000
```

### Step 9: Enable Continuous Deployment (Optional)

```powershell
# Enable continuous deployment from ACR
az webapp deployment container config `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --enable-cd true

# Get webhook URL (use this to trigger deployments on ACR push)
az webapp deployment container show-cd-url `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP
```

### Step 10: Get Web App URL and Test

```powershell
# Get the Web App URL
$WEB_APP_URL = "https://${APP_NAME}.azurewebsites.net"
Write-Host "Web App URL: $WEB_APP_URL"

# Test the deployment (after a few minutes for startup)
Start-Sleep -Seconds 30
curl "${WEB_APP_URL}/health"
curl "${WEB_APP_URL}/api/info"
```

### Step 11: View Logs (Troubleshooting)

```powershell
# Enable logging
az webapp log config `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --docker-container-logging filesystem

# Stream logs in real-time
az webapp log tail `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP
```

## 🔄 Updating the Deployment

After making code changes:

```powershell
# 1. Build and push new image
az acr build --registry $ACR_NAME --image ${IMAGE_NAME}:${IMAGE_TAG} .

# 2. Restart Web App to pull new image (if continuous deployment is not enabled)
az webapp restart --name $APP_NAME --resource-group $RESOURCE_GROUP

# 3. Verify deployment
curl https://${APP_NAME}.azurewebsites.net/health
```

## 📊 Monitoring

### Check Web App Status

```powershell
# Get Web App details
az webapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --output table

# Check if app is running
az webapp browse --name $APP_NAME --resource-group $RESOURCE_GROUP
```

### View Metrics in Azure Portal

1. Navigate to: https://portal.azure.com
2. Go to your Web App resource
3. View "Metrics" and "Log stream" sections

## 🧹 Cleanup Resources

When you're done testing:

```powershell
# Delete the entire resource group (removes all resources)
az group delete --name $RESOURCE_GROUP --yes --no-wait
```

## 📚 API Endpoints

| Endpoint     | Method | Description                               |
| ------------ | ------ | ----------------------------------------- |
| `/`          | GET    | Root endpoint with API info               |
| `/health`    | GET    | Health check (for Azure monitoring)       |
| `/api/hello` | GET    | Hello endpoint (query param: `name`)      |
| `/api/info`  | GET    | API documentation and available endpoints |

## 🔒 Security Features

- Helmet.js for security headers
- CORS enabled
- Non-root Docker user
- Environment variable configuration
- Error messages sanitized in production

## 📝 Project Structure

```
api/
├── src/
│   └── index.ts          # Main application file
├── dist/                 # Compiled JavaScript (generated)
├── .dockerignore        # Docker ignore file
├── .env.example         # Environment variables template
├── Dockerfile           # Multi-stage Docker build
├── package.json         # NPM dependencies
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## ✅ Success Criteria

- [x] API responds to HTTP requests
- [x] Health check endpoint returns 200 OK
- [x] Docker image builds successfully
- [x] Image pushed to Azure Container Registry
- [x] Web App accessible via public HTTPS URL
- [x] Documentation provided

## 🎯 Next Steps (Week 1 - Step 2)

- Deploy to Azure Kubernetes Service (AKS)
- Set up Kubernetes manifests
- Configure internal ClusterIP service

## 🐛 Troubleshooting

### Container won't start on Azure

- Check logs: `az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP`
- Verify `WEBSITES_PORT=3000` is set in app settings
- Ensure image was pushed successfully: `az acr repository show-tags --name $ACR_NAME --repository $IMAGE_NAME`

### Can't push to ACR

- Verify you're logged in: `az acr login --name $ACR_NAME`
- Check admin is enabled: `az acr update -n $ACR_NAME --admin-enabled true`
- Verify ACR name is globally unique and lowercase

### Web App shows 503 errors

- Container may still be starting (wait 2-3 minutes)
- Check container logs for errors
- Verify health check endpoint returns 200

## 📖 Additional Resources

- [Azure Container Registry Documentation](https://docs.microsoft.com/en-us/azure/container-registry/)
- [Azure Web Apps Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

**Author:** MindX Engineer  
**Week:** 1 - Step 1  
**Last Updated:** November 2025
