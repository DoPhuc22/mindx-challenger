# ☁️ Azure Setup Guide

Hướng dẫn setup các Azure resources cho MindX Onboarding Project.

---

## 1. Resource Overview

| Resource               | Name                       | Location       |
| ---------------------- | -------------------------- | -------------- |
| **Resource Group**     | `mindx-phucdh-rg`          | Japan East     |
| **AKS Cluster**        | `mindx-phucdh-aks`         | Japan East     |
| **Container Registry** | `mindxphucdhacr`           | Japan East     |
| **App Insights**       | `mindx-phucdh-appinsights` | Southeast Asia |
| **Action Group**       | `mindx-phucdh-alerts`      | Global         |

---

## 2. Prerequisites

### 2.1 Azure CLI

```bash
# Install Azure CLI (Windows)
winget install Microsoft.AzureCLI

# Login
az login

# Set subscription
az account set --subscription "<subscription-id>"
```

### 2.2 kubectl

```bash
# Install kubectl (Windows)
winget install Kubernetes.kubectl

# Get AKS credentials
az aks get-credentials --resource-group mindx-phucdh-rg --name mindx-phucdh-aks
```

---

## 3. Resource Group

```bash
# Create resource group
az group create \
  --name mindx-phucdh-rg \
  --location japaneast
```

---

## 4. Azure Container Registry (ACR)

### 4.1 Create ACR

```bash
az acr create \
  --name mindxphucdhacr \
  --resource-group mindx-phucdh-rg \
  --sku Basic \
  --admin-enabled true
```

### 4.2 Login to ACR

```bash
az acr login --name mindxphucdhacr
```

### 4.3 Build & Push Images

```bash
# API
cd api
docker build -t mindxphucdhacr.azurecr.io/mindx-week1-api:v2.3 .
docker push mindxphucdhacr.azurecr.io/mindx-week1-api:v2.3

# Web
cd ../web
docker build -t mindxphucdhacr.azurecr.io/mindx-week1-web:v3.1 .
docker push mindxphucdhacr.azurecr.io/mindx-week1-web:v3.1
```

---

## 5. Azure Kubernetes Service (AKS)

### 5.1 Create AKS Cluster

```bash
az aks create \
  --name mindx-phucdh-aks \
  --resource-group mindx-phucdh-rg \
  --node-count 2 \
  --node-vm-size Standard_B2s \
  --generate-ssh-keys \
  --attach-acr mindxphucdhacr
```

### 5.2 Get Credentials

```bash
az aks get-credentials \
  --resource-group mindx-phucdh-rg \
  --name mindx-phucdh-aks
```

### 5.3 Deploy Applications

```bash
# Create secrets
kubectl create secret generic google-oauth-secret \
  --from-literal=client-id="<GOOGLE_CLIENT_ID>" \
  --from-literal=client-secret="<GOOGLE_CLIENT_SECRET>"

kubectl create secret generic appinsights-secret \
  --from-literal=connection-string="<APP_INSIGHTS_CONNECTION_STRING>"

# Deploy API
kubectl apply -f api/k8s/

# Deploy Web
kubectl apply -f web/k8s/
```

---

## 6. Application Insights

### 6.1 Create App Insights

```bash
az monitor app-insights component create \
  --app mindx-phucdh-appinsights \
  --location southeastasia \
  --resource-group mindx-phucdh-rg \
  --application-type web
```

### 6.2 Get Connection String

```bash
az monitor app-insights component show \
  --app mindx-phucdh-appinsights \
  --resource-group mindx-phucdh-rg \
  --query connectionString \
  --output tsv
```

---

## 7. Ingress & TLS

### 7.1 Install NGINX Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
```

### 7.2 Install cert-manager

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml
```

### 7.3 Create ClusterIssuer

```yaml
# api/k8s/cluster-issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    email: phucdh@mindx.com.vn
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
```

### 7.4 Create Ingress

```yaml
# api/k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mindx-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - phucdh.mindx.com.vn
      secretName: mindx-tls
  rules:
    - host: phucdh.mindx.com.vn
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 3000
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-service
                port:
                  number: 80
```

---

## 8. DNS Configuration

### 8.1 Get Ingress External IP

```bash
kubectl get svc -n ingress-nginx
# Note the EXTERNAL-IP
```

### 8.2 Update DNS

- Add A record: `phucdh.mindx.com.vn` → `<EXTERNAL-IP>`
- Wait for DNS propagation (5-30 minutes)

---

## 9. Useful Commands

### 9.1 Check Pod Status

```bash
kubectl get pods
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### 9.2 Check Services

```bash
kubectl get svc
kubectl get ingress
```

### 9.3 Restart Deployment

```bash
kubectl rollout restart deployment api-deployment
kubectl rollout restart deployment web-deployment
```

### 9.4 Check Secrets

```bash
kubectl get secrets
kubectl describe secret google-oauth-secret
```

### 9.5 Scale Deployment

```bash
kubectl scale deployment api-deployment --replicas=3
```

---

## 10. Cost Optimization

| Resource     | SKU             | Monthly Cost (Est.) |
| ------------ | --------------- | ------------------- |
| AKS          | 2x Standard_B2s | ~$60                |
| ACR          | Basic           | ~$5                 |
| App Insights | Pay-as-you-go   | ~$2-5               |
| **Total**    |                 | **~$70/month**      |

### Tips

- Use Reserved Instances for production
- Enable auto-scaling
- Use spot instances for dev/test
- Monitor with Cost Management

---

## 11. Security Checklist

- [ ] Use secrets for sensitive data (not env vars in YAML)
- [ ] Enable HTTPS with cert-manager
- [ ] Use RBAC for Kubernetes access
- [ ] Enable Azure AD integration for AKS
- [ ] Scan container images for vulnerabilities
- [ ] Enable network policies
- [ ] Regular security updates
