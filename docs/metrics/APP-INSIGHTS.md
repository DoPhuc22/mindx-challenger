# 📊 Azure Application Insights

Hướng dẫn setup và sử dụng Azure Application Insights cho Production Metrics.

---

## 1. Thông Tin Resource

| Property           | Value                      |
| ------------------ | -------------------------- |
| **Name**           | `mindx-phucdh-appinsights` |
| **Resource Group** | `mindx-phucdh-rg`          |
| **Location**       | Southeast Asia             |
| **Type**           | Application Insights       |

### Connection String

```
InstrumentationKey=4abf0b3a-6d84-4453-8ea1-ab3e0be9b66d;IngestionEndpoint=https://southeastasia-1.in.applicationinsights.azure.com/;LiveEndpoint=https://southeastasia.livediagnostics.monitor.azure.com/;ApplicationId=b3b08c50-7c64-4d9c-a9ca-03b8b75b1afb
```

---

## 2. SDK Integration

### 2.1 Cài đặt Package

```bash
npm install applicationinsights
```

### 2.2 Code Integration (`api/src/index.ts`)

```typescript
import appInsights from "applicationinsights";

// Initialize Application Insights FIRST (before other imports)
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  appInsights
    .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(true)
    .start();

  console.log("Application Insights initialized");
}

// Rest of your application code...
```

### 2.3 Custom Event Tracking

```typescript
// Track authentication events
const client = appInsights.defaultClient;

// Track successful login
client.trackEvent({
  name: "AuthSuccess",
  properties: {
    provider: "google",
    timestamp: new Date().toISOString(),
  },
});

// Track failed login
client.trackEvent({
  name: "AuthFailure",
  properties: {
    error: "invalid_token",
    timestamp: new Date().toISOString(),
  },
});
```

---

## 3. Kubernetes Deployment

### 3.1 Create Secret

```bash
kubectl create secret generic appinsights-secret \
  --from-literal=connection-string="<YOUR_CONNECTION_STRING>"
```

### 3.2 Deployment YAML (`api/k8s/deployment.yaml`)

```yaml
env:
  - name: APPLICATIONINSIGHTS_CONNECTION_STRING
    valueFrom:
      secretKeyRef:
        name: appinsights-secret
        key: connection-string
```

---

## 4. Azure Portal Navigation

### 4.1 Logs (Query)

1. Azure Portal → Application Insights
2. Menu: **Monitoring** → **Logs**
3. Xem bảng: `requests`, `traces`, `exceptions`, `customEvents`

### 4.2 Live Metrics

1. Azure Portal → Application Insights
2. Menu: **Investigate** → **Live Metrics**
3. Xem real-time: requests, response time, CPU, memory

### 4.3 Performance

1. Azure Portal → Application Insights
2. Menu: **Investigate** → **Performance**
3. Phân tích: slow requests, dependencies, bottlenecks

### 4.4 Failures

1. Azure Portal → Application Insights
2. Menu: **Investigate** → **Failures**
3. Xem: exceptions, failed requests, error trends

---

## 5. Kusto Queries (KQL)

### 5.1 Requests trong 24h

```kusto
requests
| where timestamp > ago(24h)
| summarize count() by bin(timestamp, 1h), resultCode
| render timechart
```

### 5.2 Response Time Percentiles

```kusto
requests
| where timestamp > ago(1h)
| summarize
    avg_duration = avg(duration),
    p50 = percentile(duration, 50),
    p95 = percentile(duration, 95),
    p99 = percentile(duration, 99)
```

### 5.3 Failed Requests

```kusto
requests
| where timestamp > ago(24h)
| where success == false
| summarize count() by resultCode, name
| order by count_ desc
```

### 5.4 Exceptions by Type

```kusto
exceptions
| where timestamp > ago(24h)
| summarize count() by type
| order by count_ desc
```

### 5.5 Custom Events (Auth)

```kusto
customEvents
| where timestamp > ago(24h)
| where name in ('AuthSuccess', 'AuthFailure')
| summarize count() by name, bin(timestamp, 1h)
| render timechart
```

### 5.6 Slow Requests (> 1s)

```kusto
requests
| where timestamp > ago(24h)
| where duration > 1000
| project timestamp, name, duration, resultCode
| order by duration desc
| take 100
```

### 5.7 Top Endpoints by Request Count

```kusto
requests
| where timestamp > ago(24h)
| summarize count() by name
| order by count_ desc
| take 10
```

---

## 6. Troubleshooting

### Issue: Logs không xuất hiện

1. Verify connection string chính xác
2. Check secret đã được tạo: `kubectl get secrets`
3. Check env trong pod: `kubectl exec -it <pod> -- env | grep APPLICATIONINSIGHTS`
4. Đợi 2-3 phút cho telemetry sync

### Issue: Live Metrics không hoạt động

1. Verify `setSendLiveMetrics(true)` trong code
2. Check pod có network access đến Azure
3. Restart pod sau khi deploy

### Issue: Custom Events không tracking

1. Verify `appInsights.defaultClient` exists
2. Check code path được execute
3. Xem `traces` table cho console logs

---

## 7. Best Practices

1. **Initialize sớm**: App Insights phải init trước tất cả code khác
2. **Use secrets**: Không hardcode connection string
3. **Track custom events**: Login, logout, critical actions
4. **Set up alerts**: Response time, failures, exceptions
5. **Review regularly**: Check Failures và Performance hàng tuần
