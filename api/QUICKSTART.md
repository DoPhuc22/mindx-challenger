# Quick Start Guide - Day 1: API Foundation

## ⚡ Fast Track Deployment

Copy and paste these commands in PowerShell to deploy your API to Azure:

### 1️⃣ Install Dependencies and Test Locally

```powershell
cd d:\workspace\Mindx\Week1\api
npm install
npm run dev
```

Open browser: http://localhost:3000/health

Press `Ctrl+C` to stop.

### 2️⃣ Set Azure Variables (CUSTOMIZE THESE!)

```powershell
# ⚠️ IMPORTANT: Change these to your unique names
$RESOURCE_GROUP = "mindx-week1-rg"
$LOCATION = "eastus"
$ACR_NAME = "mindxweek1acr$(Get-Random -Maximum 9999)"  # Auto-generates unique name
$APP_NAME = "mindx-week1-api$(Get-Random -Maximum 9999)"  # Auto-generates unique name
$APP_PLAN = "mindx-week1-plan"
$IMAGE_NAME = "mindx-week1-api"
$IMAGE_TAG = "latest"

# Save your names (you'll need them later)
Write-Host "====================================" -ForegroundColor Green
Write-Host "📝 SAVE THESE VALUES:" -ForegroundColor Yellow
Write-Host "ACR Name: $ACR_NAME" -ForegroundColor Cyan
Write-Host "App Name: $APP_NAME" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Green
```

### 3️⃣ Login to Azure

```powershell
az login
az account show
```

### 4️⃣ Create Resource Group

```powershell
az group create --name $RESOURCE_GROUP --location $LOCATION
```

### 5️⃣ Create Azure Container Registry

```powershell
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic
az acr update -n $ACR_NAME --admin-enabled true
```

### 6️⃣ Build and Push Image to ACR

```powershell
# Build in Azure (recommended - no need to upload from local machine)
cd d:\workspace\Mindx\Week1\api
az acr build --registry $ACR_NAME --image ${IMAGE_NAME}:${IMAGE_TAG} .
```

### 7️⃣ Create App Service Plan

```powershell
az appservice plan create `
  --name $APP_PLAN `
  --resource-group $RESOURCE_GROUP `
  --is-linux `
  --sku B1
```

### 8️⃣ Deploy Web App from ACR

```powershell
# Get ACR details
$ACR_LOGIN_SERVER = az acr show --name $ACR_NAME --query loginServer --output tsv
$ACR_USERNAME = az acr credential show --name $ACR_NAME --query username --output tsv
$ACR_PASSWORD = az acr credential show --name $ACR_NAME --query "passwords[0].value" --output tsv

# Create Web App
az webapp create `
  --resource-group $RESOURCE_GROUP `
  --plan $APP_PLAN `
  --name $APP_NAME `
  --deployment-container-image-name ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${IMAGE_TAG}

# Configure container settings
az webapp config container set `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --docker-custom-image-name ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${IMAGE_TAG} `
  --docker-registry-server-url https://${ACR_LOGIN_SERVER} `
  --docker-registry-server-user $ACR_USERNAME `
  --docker-registry-server-password $ACR_PASSWORD

# Set port
az webapp config appsettings set `
  --resource-group $RESOURCE_GROUP `
  --name $APP_NAME `
  --settings WEBSITES_PORT=3000
```

### 9️⃣ Get Your Public URL

```powershell
$WEB_APP_URL = "https://${APP_NAME}.azurewebsites.net"
Write-Host "====================================" -ForegroundColor Green
Write-Host "🚀 YOUR API IS DEPLOYING!" -ForegroundColor Yellow
Write-Host "URL: $WEB_APP_URL" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Green
Write-Host "⏳ Wait 2-3 minutes for container startup..." -ForegroundColor Yellow

# Wait and test
Start-Sleep -Seconds 120
Write-Host "Testing endpoints..." -ForegroundColor Yellow
curl "${WEB_APP_URL}/health"
curl "${WEB_APP_URL}/api/info"
```

### 🔟 View Logs (If Something Goes Wrong)

```powershell
az webapp log config `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --docker-container-logging filesystem

az webapp log tail `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP
```

## ✅ Verify Deployment

Open these URLs in your browser:

- https://YOUR-APP-NAME.azurewebsites.net/health
- https://YOUR-APP-NAME.azurewebsites.net/api/info
- https://YOUR-APP-NAME.azurewebsites.net/api/hello?name=MindX

## 🔄 Update Your Deployment

After making code changes:

```powershell
cd d:\workspace\Mindx\Week1\api
az acr build --registry $ACR_NAME --image ${IMAGE_NAME}:${IMAGE_TAG} .
az webapp restart --name $APP_NAME --resource-group $RESOURCE_GROUP
Start-Sleep -Seconds 60
curl "https://${APP_NAME}.azurewebsites.net/health"
```

## 🧹 Cleanup (When Done Testing)

```powershell
az group delete --name $RESOURCE_GROUP --yes --no-wait
```

## 🐛 Common Issues

### Issue: "ACR name is not available"

**Fix:** Change `$ACR_NAME` to something more unique

### Issue: "Web App name is already taken"

**Fix:** Change `$APP_NAME` to something more unique

### Issue: "503 Service Unavailable"

**Fix:** Wait 2-3 more minutes. Container is still starting up.

### Issue: "Cannot find module 'express'"

**Fix:** Run `npm install` in the api directory

### Issue: "Access Denied" when creating resources

**Fix:** Ask your Azure admin for Contributor permissions on subscription

## 📊 Check Your Work

✅ Step 1.1: API code created  
✅ Step 1.2: Docker container built  
✅ Step 1.3: ACR created and accessible  
✅ Step 1.4: Image pushed to ACR  
✅ Step 1.5: Web App deployed  
✅ Step 1.6: API responds to HTTPS requests  
✅ Step 1.7: Code in Git repository

## 🎯 Success Criteria Met

- [x] API responds to HTTP requests on the Azure Web App URL
- [x] Container image successfully stored and retrievable from ACR
- [x] All source code and configurations are version controlled
- [x] Documentation allows another developer to reproduce the deployment
- [x] Health check endpoint returns successful response

## 🎉 Next Steps

Day 2-3: Deploy to Azure Kubernetes Service (AKS)

- See README.md for detailed instructions
- Or continue with Step 2 in tasks.md

---

**Need Help?** Check the full README.md in the api folder for detailed explanations.
