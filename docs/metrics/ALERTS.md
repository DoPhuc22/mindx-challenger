# 🚨 Azure Alerts Configuration

Hướng dẫn cấu hình Azure Alerts cho monitoring và notification.

---

## 1. Action Group

| Property           | Value                 |
| ------------------ | --------------------- |
| **Name**           | `mindx-phucdh-alerts` |
| **Resource Group** | `mindx-phucdh-rg`     |
| **Email**          | phucdh@mindx.com.vn   |
| **Type**           | Email/SMS/Push/Voice  |

### Tạo Action Group

```bash
# Azure CLI
az monitor action-group create \
  --name mindx-phucdh-alerts \
  --resource-group mindx-phucdh-rg \
  --action email admin phucdh@mindx.com.vn
```

---

## 2. Alert Rules

### 2.1 Response Time Alert

| Property       | Value                            |
| -------------- | -------------------------------- |
| **Name**       | `mindx-phucdh-api-response-time` |
| **Signal**     | Server response time             |
| **Condition**  | Average > 2000ms                 |
| **Evaluation** | Every 5 min, lookback 5 min      |
| **Severity**   | 2 - Warning                      |

```bash
# Azure CLI
az monitor metrics alert create \
  --name mindx-phucdh-api-response-time \
  --resource-group mindx-phucdh-rg \
  --scopes "/subscriptions/<sub-id>/resourceGroups/mindx-phucdh-rg/providers/microsoft.insights/components/mindx-phucdh-appinsights" \
  --condition "avg requests/duration > 2000" \
  --window-size 5m \
  --evaluation-frequency 5m \
  --severity 2 \
  --action-group mindx-phucdh-alerts
```

---

### 2.2 Failed Requests Alert

| Property       | Value                       |
| -------------- | --------------------------- |
| **Name**       | `mindx-phucdh-api-failures` |
| **Signal**     | Failed requests             |
| **Condition**  | Count > 5                   |
| **Evaluation** | Every 5 min, lookback 5 min |
| **Severity**   | 1 - Error                   |

```bash
az monitor metrics alert create \
  --name mindx-phucdh-api-failures \
  --resource-group mindx-phucdh-rg \
  --scopes "/subscriptions/<sub-id>/resourceGroups/mindx-phucdh-rg/providers/microsoft.insights/components/mindx-phucdh-appinsights" \
  --condition "count requests/failed > 5" \
  --window-size 5m \
  --evaluation-frequency 5m \
  --severity 1 \
  --action-group mindx-phucdh-alerts
```

---

### 2.3 Exceptions Alert

| Property       | Value                         |
| -------------- | ----------------------------- |
| **Name**       | `mindx-phucdh-api-exceptions` |
| **Signal**     | Server exceptions             |
| **Condition**  | Count > 3                     |
| **Evaluation** | Every 5 min, lookback 5 min   |
| **Severity**   | 1 - Error                     |

```bash
az monitor metrics alert create \
  --name mindx-phucdh-api-exceptions \
  --resource-group mindx-phucdh-rg \
  --scopes "/subscriptions/<sub-id>/resourceGroups/mindx-phucdh-rg/providers/microsoft.insights/components/mindx-phucdh-appinsights" \
  --condition "count exceptions/server > 3" \
  --window-size 5m \
  --evaluation-frequency 5m \
  --severity 1 \
  --action-group mindx-phucdh-alerts
```

---

### 2.4 Availability Alert

| Property       | Value                           |
| -------------- | ------------------------------- |
| **Name**       | `mindx-phucdh-api-availability` |
| **Signal**     | Availability                    |
| **Condition**  | Average < 99%                   |
| **Evaluation** | Every 5 min, lookback 15 min    |
| **Severity**   | 0 - Critical                    |

```bash
az monitor metrics alert create \
  --name mindx-phucdh-api-availability \
  --resource-group mindx-phucdh-rg \
  --scopes "/subscriptions/<sub-id>/resourceGroups/mindx-phucdh-rg/providers/microsoft.insights/components/mindx-phucdh-appinsights" \
  --condition "avg availabilityResults/availabilityPercentage < 99" \
  --window-size 15m \
  --evaluation-frequency 5m \
  --severity 0 \
  --action-group mindx-phucdh-alerts
```

---

## 3. Alert Summary Table

| Alert           | Condition | Severity     | Action |
| --------------- | --------- | ------------ | ------ |
| Response Time   | > 2s avg  | 2 (Warning)  | Email  |
| Failed Requests | > 5 count | 1 (Error)    | Email  |
| Exceptions      | > 3 count | 1 (Error)    | Email  |
| Availability    | < 99%     | 0 (Critical) | Email  |

---

## 4. Severity Levels

| Level | Name          | Description                            |
| ----- | ------------- | -------------------------------------- |
| 0     | Critical      | System down, immediate action required |
| 1     | Error         | Service degraded, urgent attention     |
| 2     | Warning       | Potential issues, monitor closely      |
| 3     | Informational | FYI, no action needed                  |
| 4     | Verbose       | Debug information                      |

---

## 5. Azure Portal Management

### 5.1 Xem Alerts

1. Azure Portal → **Monitor** → **Alerts**
2. Filter by resource group: `mindx-phucdh-rg`
3. Xem fired/resolved alerts

### 5.2 Edit Alert Rule

1. Azure Portal → **Monitor** → **Alerts** → **Alert rules**
2. Click alert rule name
3. Modify conditions, thresholds, actions
4. Save

### 5.3 Disable/Enable Alert

1. Azure Portal → **Monitor** → **Alerts** → **Alert rules**
2. Select alert rule
3. Toggle **Enable** / **Disable**

### 5.4 Test Alert

1. Modify threshold to trigger easily (e.g., response time > 1ms)
2. Wait for evaluation period
3. Check email inbox
4. Reset threshold to normal value

---

## 6. Email Notification Format

### Alert Fired Email

```
Subject: [Azure Monitor Alert] mindx-phucdh-api-response-time triggered

Alert Rule: mindx-phucdh-api-response-time
Severity: 2 - Warning
Fired Time: 2025-01-15T10:30:00Z
Resource: mindx-phucdh-appinsights

Condition: avg requests/duration > 2000ms
Current Value: 2534ms

Action: Review API performance in Application Insights
```

### Alert Resolved Email

```
Subject: [Azure Monitor Alert] mindx-phucdh-api-response-time resolved

Alert Rule: mindx-phucdh-api-response-time
Resolved Time: 2025-01-15T10:45:00Z
Duration: 15 minutes

Current Value: 850ms (below threshold)
```

---

## 7. Advanced: Custom Log Alerts

### 7.1 Create Log Alert (KQL-based)

```kusto
// Alert when login failures > 10 in 5 minutes
customEvents
| where name == 'AuthFailure'
| where timestamp > ago(5m)
| summarize FailureCount = count()
| where FailureCount > 10
```

### 7.2 Setup via Portal

1. Azure Portal → Application Insights → **Alerts**
2. **New alert rule**
3. Signal: **Custom log search**
4. Enter KQL query
5. Set threshold and frequency
6. Attach action group

---

## 8. Troubleshooting

### Issue: Alert không fire

1. Check alert rule enabled
2. Verify threshold đúng
3. Check evaluation frequency
4. Verify data đang được collect

### Issue: Không nhận email

1. Check email trong action group
2. Verify action group attached to alert
3. Check spam/junk folder
4. Test với Azure Portal test function

### Issue: Too many alerts (alert fatigue)

1. Adjust thresholds để realistic hơn
2. Increase window size
3. Use severity levels để prioritize
4. Consider suppression rules

---

## 9. Best Practices

1. **Start simple**: 4-5 core alerts là đủ
2. **Tune thresholds**: Dựa trên baseline của application
3. **Use severity**: Critical, Error, Warning phân biệt rõ
4. **Multiple channels**: Email + SMS cho critical alerts
5. **Document runbooks**: Response procedure cho mỗi alert
6. **Review regularly**: Monthly review alert effectiveness
