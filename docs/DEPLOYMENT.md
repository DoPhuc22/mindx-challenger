# 🚀 Deployment Guide

## Azure Resources

| Resource | Name | Region |
|----------|------|--------|
| Resource Group | `mindx-onboarding-phucdh` | Japan East |
| AKS Cluster | `mindx-phucdh-aks` | Japan East |
| Container Registry | `mindxphucdhacr` | Japan East |
| Domain | `phucdh.mindx.com.vn` | - |

## Step-by-Step Deployment

### 1. Login to Azure

```powershell
az login
az account set --subscription "<subscription-id>"
```

### 2. Login to Azure Container Registry

```powershell
az acr login --name mindxphucdhacr
```

### 3. Push Docker Images

```powershell
docker push mindxphucdhacr.azurecr.io/mindx-week1-api:v2.1
docker push mindxphucdhacr.azurecr.io/mindx-week1-web:v2.3
```

### 4. Get AKS Credentials

```powershell
az aks get-credentials --resource-group mindx-onboarding-phucdh --name mindx-phucdh-aks
```

### 5. Create OIDC Secret

```powershell
kubectl create secret generic oidc-credentials `
  --from-literal=client-id=mindx-onboarding `
  --from-literal=client-secret=<YOUR_SECRET> `
  --from-literal=redirect-uri=https://phucdh.mindx.com.vn/auth/callback `
  --from-literal=frontend-url=https://phucdh.mindx.com.vn
```

### 6. Deploy to AKS

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

### 7. Verify Deployment

```powershell
kubectl get pods
kubectl get svc
kubectl get ingress
kubectl get certificate
```

## Kubernetes Resources

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

## Updating Deployments

```powershell
# Update image version in deployment.yaml, then:
kubectl apply -f api/k8s/deployment.yaml
kubectl rollout status deployment/mindx-api

kubectl apply -f web/k8s/deployment.yaml
kubectl rollout status deployment/mindx-web
```

## Rollback

```powershell
kubectl rollout undo deployment/mindx-api
kubectl rollout undo deployment/mindx-web
```

## Troubleshooting

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
