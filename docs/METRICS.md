# 📊 Metrics Documentation

This document provides guidance on how to access and interpret both production and product metrics for the MindX Week 1 application.

## Table of Contents

- [Production Metrics (Azure Application Insights)](#production-metrics-azure-application-insights)
- [Product Metrics (Google Analytics 4)](#product-metrics-google-analytics-4)
- [Alert Configuration](#alert-configuration)
- [Troubleshooting](#troubleshooting)

---

## Production Metrics (Azure Application Insights)

### Overview

Azure Application Insights monitors the backend API performance, errors, and availability.

**Resource Details:**
- **Name:** `mindx-phucdh-appinsights`
- **Resource Group:** `mindx-phucdh-rg`
- **Region:** Southeast Asia
- **Instrumentation Key:** `4abf0b3a-6d84-4453-8ea1-ab3e0be9b66d`

### Accessing App Insights

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Resource Groups** → `mindx-phucdh-rg`
3. Click on **mindx-phucdh-appinsights**

Or use direct link:
```
https://portal.azure.com/#@/resource/subscriptions/f244cdf7-5150-4b10-b3f2-d4bff23c5f45/resourceGroups/mindx-phucdh-rg/providers/microsoft.insights/components/mindx-phucdh-appinsights/overview
```

### Key Dashboards

#### 1. Overview Dashboard
Shows high-level metrics:
- **Server requests** - Total API calls
- **Failed requests** - HTTP 4xx/5xx errors
- **Server response time** - Average latency
- **Availability** - Uptime percentage

#### 2. Performance Dashboard
Navigate to **Investigate** → **Performance**

| Metric | Description | Target |
|--------|-------------|--------|
| Request duration | Average response time | < 500ms |
| Dependency duration | External service calls | < 200ms |
| Request rate | Requests per second | Monitor trends |

#### 3. Failures Dashboard
Navigate to **Investigate** → **Failures**

- View failed requests by endpoint
- See exception details and stack traces
- Identify error patterns

#### 4. Live Metrics
Navigate to **Investigate** → **Live Metrics**

Real-time view of:
- Active requests
- Request rate
- Request duration
- CPU/Memory usage

### Useful Queries (Log Analytics)

Open **Monitoring** → **Logs** to run Kusto queries:

```kusto
// Top 10 slowest requests
requests
| where timestamp > ago(24h)
| top 10 by duration desc
| project timestamp, name, duration, resultCode
```

```kusto
// Failed requests by endpoint
requests
| where timestamp > ago(24h)
| where success == false
| summarize count() by name
| order by count_ desc
```

```kusto
// Exception count by type
exceptions
| where timestamp > ago(24h)
| summarize count() by type
| order by count_ desc
```

```kusto
// Request rate per hour
requests
| where timestamp > ago(24h)
| summarize count() by bin(timestamp, 1h)
| render timechart
```

### Custom Events Tracked

| Event Name | Description | Properties |
|------------|-------------|------------|
| `UserLogin_Success` | User successfully logged in | `hasIdToken` |
| `AuthCallback_NoCode` | Auth callback without code | `state` |

---

## Product Metrics (Google Analytics 4)

### Overview

Google Analytics 4 tracks user behavior on the frontend application.

**Property Details:**
- **Property Name:** MindX Week 1 - Phuc DH
- **Measurement ID:** `G-W0JQ0W6X0W`
- **Website:** https://phucdh.mindx.com.vn

### Accessing Google Analytics

1. Go to [Google Analytics](https://analytics.google.com)
2. Select property **MindX Week 1 - Phuc DH**

### Key Reports

#### 1. Realtime Report
**Reports** → **Realtime**

Shows live data:
- Active users on site
- Page views in last 30 minutes
- Events triggered
- User locations

#### 2. Acquisition Report
**Reports** → **Acquisition** → **Traffic acquisition**

- How users find your site
- Traffic sources (direct, organic, referral)
- Campaign performance

#### 3. Engagement Report
**Reports** → **Engagement** → **Pages and screens**

| Metric | Description |
|--------|-------------|
| Views | Total page views |
| Users | Unique users |
| Average engagement time | Time spent on page |
| Bounce rate | Single-page sessions |

#### 4. User Report
**Reports** → **User** → **User attributes**

- Demographics
- Technology (browser, device)
- Geographic location

### Custom Events Tracked

| Event | Trigger | Parameters |
|-------|---------|------------|
| `page_view` | Page load | `page_path`, `page_title` |
| `login` | User logs in | `method: "MindX_OpenID"` |
| `logout` | User logs out | - |
| `button_click` | Button clicked | `button_name`, `section` |
| `api_call` | API request made | `endpoint`, `success`, `duration_ms` |
| `error` | Error occurs | `error_type`, `error_message` |

### Setting Up Custom Reports

1. Go to **Explore** → **Blank**
2. Add dimensions: `Event name`, `Page path`
3. Add metrics: `Event count`, `Total users`
4. Create visualization

### User ID Tracking

After login, users are tracked with their OpenID `sub` claim:
```javascript
gtag('config', 'G-W0JQ0W6X0W', { user_id: 'user-sub-id' });
```

This enables:
- Cross-device tracking
- User journey analysis
- Cohort analysis

---

## Alert Configuration

### Azure Alerts

| Alert Name | Condition | Severity | Action |
|------------|-----------|----------|--------|
| `mindx-phucdh-api-response-time` | Avg duration > 2000ms | ⚠️ Warning (2) | Email |
| `mindx-phucdh-api-failures` | Failed requests > 5 in 5min | 🔴 Error (1) | Email |
| `mindx-phucdh-api-exceptions` | Exceptions > 3 in 5min | 🔴 Error (1) | Email |
| `mindx-phucdh-api-availability` | Availability < 99% | 🚨 Critical (0) | Email |

### Action Group

- **Name:** `mindx-phucdh-alerts`
- **Email:** phucdh@mindx.com.vn

### Managing Alerts

```bash
# List all alerts
az monitor metrics alert list --resource-group mindx-phucdh-rg -o table

# Disable an alert
az monitor metrics alert update --name "alert-name" --resource-group mindx-phucdh-rg --enabled false

# Delete an alert
az monitor metrics alert delete --name "alert-name" --resource-group mindx-phucdh-rg
```

---

## Troubleshooting

### App Insights Not Receiving Data

1. **Check connection string:**
   ```bash
   kubectl get secret appinsights-secret -o jsonpath='{.data.connection-string}' | base64 -d
   ```

2. **Check pod logs:**
   ```bash
   kubectl logs deployment/mindx-api --tail=50 | grep -i insight
   ```

3. **Verify env var is set:**
   ```bash
   kubectl exec deployment/mindx-api -- env | grep APPLICATION
   ```

### Google Analytics Not Tracking

1. **Check GA4 script in page source:**
   - Open https://phucdh.mindx.com.vn
   - View Page Source (Ctrl+U)
   - Search for `G-W0JQ0W6X0W`

2. **Use GA4 DebugView:**
   - Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger) extension
   - Enable debug mode
   - Check **Admin** → **DebugView** in GA4

3. **Check browser console:**
   ```javascript
   // Should return function
   typeof gtag
   
   // Manually send test event
   gtag('event', 'test_event', { test: true });
   ```

### Alerts Not Firing

1. **Check alert status:**
   ```bash
   az monitor metrics alert show --name "alert-name" --resource-group mindx-phucdh-rg
   ```

2. **Verify action group:**
   ```bash
   az monitor action-group show --name mindx-phucdh-alerts --resource-group mindx-phucdh-rg
   ```

3. **Check email spam folder**

---

## Quick Links

| Resource | URL |
|----------|-----|
| Live Website | https://phucdh.mindx.com.vn |
| Azure App Insights | [Portal Link](https://portal.azure.com/#@/resource/subscriptions/f244cdf7-5150-4b10-b3f2-d4bff23c5f45/resourceGroups/mindx-phucdh-rg/providers/microsoft.insights/components/mindx-phucdh-appinsights/overview) |
| Google Analytics | https://analytics.google.com |
| GitHub Repo | https://github.com/DoPhuc22/mindx-challenger |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    React Frontend                         │   │
│  │  ┌─────────────────────────────────────────────────────┐  │   │
│  │  │  Google Analytics 4 (G-W0JQ0W6X0W)                 │  │   │
│  │  │  - Page views                                       │  │   │
│  │  │  - User sessions                                    │  │   │
│  │  │  - Custom events (login, logout, clicks)           │  │   │
│  │  └─────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Azure Kubernetes Service                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Node.js API                            │   │
│  │  ┌─────────────────────────────────────────────────────┐  │   │
│  │  │  Azure Application Insights                         │  │   │
│  │  │  - Request logging                                  │  │   │
│  │  │  - Performance metrics                              │  │   │
│  │  │  - Exception tracking                               │  │   │
│  │  │  - Custom events (UserLogin, AuthCallback)         │  │   │
│  │  └─────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Azure Monitor Alerts                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │ Response Time  │  │ Failed Reqs    │  │ Exceptions     │    │
│  │    > 2s        │  │    > 5         │  │    > 3         │    │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘    │
│          └──────────────────┬┴───────────────────┘              │
│                             ▼                                    │
│                    ┌────────────────┐                            │
│                    │  Action Group  │                            │
│                    │  📧 Email      │                            │
│                    └────────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```
