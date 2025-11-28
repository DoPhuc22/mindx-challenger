# Azure Deployment Script for MindX Week 1 API
# Customized for subscription: f244cdf7-5150-4b10-b3f2-d4bff23c5f45

Write-Host "========================================" -ForegroundColor Green
Write-Host "  MindX Week 1 - API Deployment" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Azure Configuration
$SUBSCRIPTION_ID = "f244cdf7-5150-4b10-b3f2-d4bff23c5f45"
$RESOURCE_GROUP = "mindx-phucdh-rg"  # Using your existing resource group
$LOCATION = "eastus"

# Generate unique names (you can customize these)
$TIMESTAMP = Get-Date -Format "MMddHHmm"
$ACR_NAME = "mindxphucdh$TIMESTAMP"  # Must be lowercase, alphanumeric only
$APP_NAME = "mindx-phucdh-api-$TIMESTAMP"  # Must be globally unique
$APP_PLAN = "mindx-phucdh-plan"
$IMAGE_NAME = "mindx-week1-api"
$IMAGE_TAG = "v1.0"

Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Subscription: $SUBSCRIPTION_ID" -ForegroundColor White
Write-Host "  Resource Group: $RESOURCE_GROUP" -ForegroundColor White
Write-Host "  ACR Name: $ACR_NAME" -ForegroundColor White
Write-Host "  App Name: $APP_NAME" -ForegroundColor White
Write-Host "  Location: $LOCATION" -ForegroundColor White
Write-Host ""

# Pause for user confirmation
Write-Host "Press any key to continue or Ctrl+C to cancel..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# Step 1: Verify Azure Login
Write-Host "[Step 1/8] Verifying Azure login..." -ForegroundColor Cyan
try {
    $account = az account show 2>$null | ConvertFrom-Json
    if ($account.id -eq $SUBSCRIPTION_ID) {
        Write-Host "[OK] Logged in as: $($account.user.name)" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Different subscription active. Setting correct subscription..." -ForegroundColor Yellow
        az account set --subscription $SUBSCRIPTION_ID
        Write-Host "[OK] Subscription set successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "[ERROR] Not logged in. Please login to Azure..." -ForegroundColor Red
    az login
    az account set --subscription $SUBSCRIPTION_ID
}
Write-Host ""

# Step 2: Verify Resource Group
Write-Host "[Step 2/8] Verifying resource group..." -ForegroundColor Cyan
$rgExists = az group exists --name $RESOURCE_GROUP
if ($rgExists -eq "true") {
    Write-Host "[OK] Resource group '$RESOURCE_GROUP' exists" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Resource group not found. Creating..." -ForegroundColor Yellow
    az group create --name $RESOURCE_GROUP --location $LOCATION
    Write-Host "[OK] Resource group created" -ForegroundColor Green
}
Write-Host ""

# Step 3: Create Azure Container Registry
Write-Host "[Step 3/8] Creating Azure Container Registry..." -ForegroundColor Cyan
$acrExists = az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP 2>$null
if ($acrExists) {
    Write-Host "[OK] ACR '$ACR_NAME' already exists" -ForegroundColor Green
} else {
    Write-Host "Creating ACR (this may take 2-3 minutes)..." -ForegroundColor Yellow
    az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --location $LOCATION
    Write-Host "[OK] ACR created successfully" -ForegroundColor Green
}

# Enable admin access
Write-Host "Enabling admin access..." -ForegroundColor Yellow
az acr update -n $ACR_NAME --admin-enabled true
Write-Host "[OK] Admin access enabled" -ForegroundColor Green
Write-Host ""

# Step 4: Build and Push Docker Image
Write-Host "[Step 4/8] Building and pushing Docker image to ACR..." -ForegroundColor Cyan
Write-Host "Building image in Azure (this may take 3-5 minutes)..." -ForegroundColor Yellow
$buildResult = az acr build --registry $ACR_NAME --image "${IMAGE_NAME}:${IMAGE_TAG}" --image "${IMAGE_NAME}:latest" . 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Image built and pushed successfully" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Build failed. Check the output above." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 5: Verify Image
Write-Host "[Step 5/8] Verifying image in ACR..." -ForegroundColor Cyan
$images = az acr repository list --name $ACR_NAME --output table
Write-Host $images
$tags = az acr repository show-tags --name $ACR_NAME --repository $IMAGE_NAME --output table
Write-Host $tags
Write-Host "[OK] Image verified in ACR" -ForegroundColor Green
Write-Host ""

# Step 6: Create App Service Plan
Write-Host "[Step 6/8] Creating App Service Plan..." -ForegroundColor Cyan
$planExists = az appservice plan show --name $APP_PLAN --resource-group $RESOURCE_GROUP 2>$null
if ($planExists) {
    Write-Host "[OK] App Service Plan '$APP_PLAN' already exists" -ForegroundColor Green
} else {
    Write-Host "Creating App Service Plan (Linux, B1 tier)..." -ForegroundColor Yellow
    az appservice plan create `
        --name $APP_PLAN `
        --resource-group $RESOURCE_GROUP `
        --is-linux `
        --sku B1 `
        --location $LOCATION
    Write-Host "[OK] App Service Plan created" -ForegroundColor Green
}
Write-Host ""

# Step 7: Create and Configure Web App
Write-Host "[Step 7/8] Creating Web App from container..." -ForegroundColor Cyan

# Get ACR credentials
$ACR_LOGIN_SERVER = az acr show --name $ACR_NAME --query loginServer --output tsv
$ACR_USERNAME = az acr credential show --name $ACR_NAME --query username --output tsv
$ACR_PASSWORD = az acr credential show --name $ACR_NAME --query "passwords[0].value" --output tsv

Write-Host "ACR Login Server: $ACR_LOGIN_SERVER" -ForegroundColor White

# Create Web App
$webAppExists = az webapp show --name $APP_NAME --resource-group $RESOURCE_GROUP 2>$null
if ($webAppExists) {
    Write-Host "[WARNING] Web App '$APP_NAME' already exists. Updating configuration..." -ForegroundColor Yellow
} else {
    Write-Host "Creating Web App (this may take 2-3 minutes)..." -ForegroundColor Yellow
    az webapp create `
        --resource-group $RESOURCE_GROUP `
        --plan $APP_PLAN `
        --name $APP_NAME `
        --deployment-container-image-name "${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${IMAGE_TAG}"
    Write-Host "[OK] Web App created" -ForegroundColor Green
}

# Configure container settings
Write-Host "Configuring container settings..." -ForegroundColor Yellow
az webapp config container set `
    --name $APP_NAME `
    --resource-group $RESOURCE_GROUP `
    --docker-custom-image-name "${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${IMAGE_TAG}" `
    --docker-registry-server-url "https://${ACR_LOGIN_SERVER}" `
    --docker-registry-server-user $ACR_USERNAME `
    --docker-registry-server-password $ACR_PASSWORD

# Set required port
az webapp config appsettings set `
    --resource-group $RESOURCE_GROUP `
    --name $APP_NAME `
    --settings WEBSITES_PORT=3000

Write-Host "[OK] Web App configured" -ForegroundColor Green
Write-Host ""

# Step 8: Enable Logging
Write-Host "[Step 8/8] Enabling logging..." -ForegroundColor Cyan
az webapp log config `
    --name $APP_NAME `
    --resource-group $RESOURCE_GROUP `
    --docker-container-logging filesystem `
    --level information
Write-Host "[OK] Logging enabled" -ForegroundColor Green
Write-Host ""

# Display Results
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$WEB_APP_URL = "https://${APP_NAME}.azurewebsites.net"
Write-Host "Your API is deployed at:" -ForegroundColor Cyan
Write-Host "  $WEB_APP_URL" -ForegroundColor White
Write-Host ""
Write-Host "Test endpoints:" -ForegroundColor Cyan
Write-Host "  Health: ${WEB_APP_URL}/health" -ForegroundColor White
Write-Host "  Hello:  ${WEB_APP_URL}/api/hello?name=MindX" -ForegroundColor White
Write-Host "  Info:   ${WEB_APP_URL}/api/info" -ForegroundColor White
Write-Host ""
Write-Host "Note: First startup may take 2-3 minutes." -ForegroundColor Yellow
Write-Host ""

# Wait and test
Write-Host "Waiting 60 seconds for container to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

Write-Host "Testing health endpoint..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "${WEB_APP_URL}/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "API is responding!" -ForegroundColor Green
        Write-Host $response.Content -ForegroundColor White
    }
} catch {
    Write-Host "API not responding yet. Please wait a few more minutes and try:" -ForegroundColor Yellow
    Write-Host "  Invoke-WebRequest -Uri '${WEB_APP_URL}/health' -UseBasicParsing" -ForegroundColor White
}

Write-Host ""
Write-Host "View logs with:" -ForegroundColor Cyan
Write-Host "  az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP" -ForegroundColor White
Write-Host ""
Write-Host "Azure Portal:" -ForegroundColor Cyan
Write-Host "  https://portal.azure.com/#@mindx.com.vn/resource/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}/overview" -ForegroundColor White
Write-Host ""

# Save configuration
$config = @{
    subscriptionId = $SUBSCRIPTION_ID
    resourceGroup = $RESOURCE_GROUP
    acrName = $ACR_NAME
    appName = $APP_NAME
    appPlan = $APP_PLAN
    imageName = $IMAGE_NAME
    imageTag = $IMAGE_TAG
    webAppUrl = $WEB_APP_URL
    deployedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
}

$config | ConvertTo-Json | Out-File -FilePath "azure-deployment-info.json" -Encoding UTF8
Write-Host "Deployment info saved to: azure-deployment-info.json" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
