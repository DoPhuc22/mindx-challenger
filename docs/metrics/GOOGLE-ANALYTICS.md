# 📈 Google Analytics 4 (GA4)

Hướng dẫn setup và sử dụng Google Analytics 4 cho Product Metrics.

---

## 1. Thông Tin Property

| Property           | Value               |
| ------------------ | ------------------- |
| **Property Name**  | MindX Onboarding    |
| **Measurement ID** | `G-W0JQ0W6X0W`      |
| **Platform**       | Web                 |
| **Data Stream**    | phucdh.mindx.com.vn |

---

## 2. Setup GA4

### 2.1 Thêm Script vào HTML (`web/index.html`)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Google Analytics 4 -->
    <script
      async
      src="https://www.googletagmanager.com/gtag/js?id=G-W0JQ0W6X0W"
    ></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag("js", new Date());
      gtag("config", "G-W0JQ0W6X0W");
    </script>
    <!-- End Google Analytics -->

    <meta charset="UTF-8" />
    <!-- ... other head content ... -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 3. Analytics Helper Functions

### File: `web/src/utils/analytics.ts`

```typescript
// Google Analytics 4 Helper Functions
declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

// Track page views
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }
};

// Track user login
export const trackLogin = (method: string = "google") => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("event", "login", {
      method: method,
    });
  }
};

// Track user logout
export const trackLogout = () => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("event", "logout", {
      event_category: "engagement",
    });
  }
};

// Track button clicks
export const trackButtonClick = (buttonName: string, category?: string) => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("event", "click", {
      event_category: category || "button",
      event_label: buttonName,
    });
  }
};

// Track API calls
export const trackApiCall = (
  endpoint: string,
  method: string,
  success: boolean
) => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("event", "api_call", {
      event_category: "api",
      event_label: `${method} ${endpoint}`,
      success: success,
    });
  }
};

// Track errors
export const trackError = (errorMessage: string, errorType?: string) => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("event", "exception", {
      description: errorMessage,
      fatal: false,
      error_type: errorType || "unknown",
    });
  }
};

// Set user ID for cross-session tracking
export const setUserId = (userId: string) => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("config", "G-W0JQ0W6X0W", {
      user_id: userId,
    });
  }
};
```

---

## 4. Integration với Auth Context

### File: `web/src/auth/AuthContext.tsx`

```typescript
import { trackLogin, trackLogout, setUserId } from "../utils/analytics";

// Trong handleCallback (sau khi login thành công)
const handleCallback = async (code: string) => {
  try {
    // ... exchange code for tokens ...

    if (userInfo) {
      // Track successful login
      trackLogin("google");

      // Set user ID for GA
      if (userInfo.email) {
        setUserId(userInfo.email);
      }
    }
  } catch (error) {
    // Track login failure
    trackError("Login failed", "auth_error");
  }
};

// Trong logout function
const logout = () => {
  // Track logout event BEFORE clearing state
  trackLogout();

  // Clear auth state
  setAccessToken(null);
  setUserInfo(null);
  localStorage.removeItem("access_token");
};
```

---

## 5. Tracked Events

| Event Name  | Trigger      | Parameters                  |
| ----------- | ------------ | --------------------------- |
| `page_view` | Tự động      | page_path, page_title       |
| `login`     | User login   | method (google)             |
| `logout`    | User logout  | event_category              |
| `click`     | Button click | event_label, event_category |
| `api_call`  | API request  | endpoint, method, success   |
| `exception` | Error occurs | description, error_type     |

---

## 6. Google Analytics Console

### 6.1 Truy cập Reports

1. https://analytics.google.com
2. Chọn Property: MindX Onboarding
3. Menu: **Reports**

### 6.2 Real-time

- Xem users đang active
- Xem events đang fire
- Debug tracking issues

### 6.3 Engagement Reports

- **Events**: Xem tất cả custom events
- **Pages and screens**: Xem page views
- **Landing page**: Xem first page users visit

### 6.4 User Reports

- **User attributes**: Demographics, interests
- **Tech**: Browser, device, OS
- **Acquisition**: Traffic sources

---

## 7. DebugView

1. Cài Chrome Extension: **Google Analytics Debugger**
2. Enable extension
3. Truy cập website
4. GA Console → **Configure** → **DebugView**
5. Xem events real-time với full parameters

---

## 8. Custom Dimensions (Optional)

### Setup trong GA Console

1. **Admin** → **Custom definitions** → **Custom dimensions**
2. Create new:
   - **user_role**: Scope = User
   - **subscription_type**: Scope = User

### Track trong code

```typescript
gtag("config", "G-W0JQ0W6X0W", {
  custom_map: {
    dimension1: "user_role",
    dimension2: "subscription_type",
  },
});

gtag("event", "login", {
  user_role: "admin",
  subscription_type: "premium",
});
```

---

## 9. Troubleshooting

### Issue: Events không xuất hiện

1. Check browser console cho errors
2. Verify Measurement ID đúng
3. Check network tab cho gtag requests
4. Sử dụng GA Debugger extension
5. Đợi 24-48h cho data processing

### Issue: User ID không tracking

1. Verify setUserId được gọi sau login
2. Check GA đã nhận user_id trong DebugView
3. Enable User-ID feature trong GA Admin

### Issue: Real-time không update

1. Tắt ad-blockers
2. Check network connectivity
3. Verify script load trong HTML
4. Try incognito mode

---

## 10. Best Practices

1. **Track meaningful events**: Không track quá nhiều events
2. **Use consistent naming**: `snake_case` cho event names
3. **Set user ID**: Cho cross-session analysis
4. **Test với DebugView**: Trước khi deploy production
5. **Respect privacy**: Không track PII (email, phone trong event params)
6. **Document events**: Maintain list of all tracked events
