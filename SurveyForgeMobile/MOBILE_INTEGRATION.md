# Survexa Mobile Integration Guide (Shared Backend)

This document provides proof and instructions for the unified Survexa ecosystem where the **Android App** and **Web App** share the same backend and database.

## 1. Unified Architecture

- **Backend**: Node.js (Express) running at `http://localhost:5000`
- **Database**: SQLite (sql.js) shared via the backend service.
- **Web App**: React (Vite) running at `http://localhost:5173`
- **Android App**: React Native (Expo) buildable via Android Studio.

## 2. API Mapping & Data Sync

The mobile app reuses the same REST API endpoints as the web app to ensure real-time synchronization:

| Feature | Endpoint | Reused Web API |
| :--- | :--- | :--- |
| **Authentication** | `POST /auth/login` | Yes |
| **User Profile** | `GET /auth/me` | Yes |
| **Survey List** | `GET /surveys` | Yes |
| **Survey Creation** | `POST /surveys` | Yes |
| **Analytics** | `GET /surveys` (summary) | Yes |

## 3. Data Sync Proof (Verification Steps)

To verify that the Android app and Web app are perfectly in sync, follow these steps:

### Scenario A: Mobile to Web Sync (Create)
1. Open the **Android App** (Emulator/Device).
2. Login and tap **"New Survey"**.
3. Enter title "Mobile Created Survey" and tap **"Create Survey"**.
4. Now, open the **Web App** in your browser (`http://localhost:5173`).
5. Go to your Dashboard. You will see "Mobile Created Survey" appear in the list.

### Scenario B: Web to Mobile Sync (Edit/Update)
1. Open the **Web App** and change the title of an existing survey to "Updated on Web".
2. Open the **Android App** and pull-to-refresh or tap **"Refresh"**.
3. The survey title will automatically update to "Updated on Web" in the mobile list.

### Scenario C: Analytics Sync
1. Submit a response to a survey via the Web's public link.
2. Open the **Android App** and navigate to the **Analytics** tab.
3. The "Total Responses" count will increase, reflecting the new data submitted via the web.

## 4. How to Run for Local Development

### Step 1: Start Backend
```bash
cd SurveyForge/backend
npm run dev
```

### Step 2: Start Mobile App (Expo)
```bash
cd SurveyForgeMobile
npm start
# Press 'a' to run on Android Emulator
```

### Step 3: Android Studio Compatibility
The project includes a pre-generated `android` folder. To open in Android Studio:
1. Launch Android Studio.
2. Select **"Open"** and choose the `C:/Users/B Aishwarya/OneDrive/Desktop/PDD DOC/SurveyForgeMobile/android` directory.
3. Android Studio will index the project and you can build/run the native APK directly.

## 5. Security & Tokens
- Tokens are retrieved during login and stored in local state (expandable to `SecureStore`).
- All requests include the `Authorization: Bearer <token>` header, ensuring the same RBAC (Role-Based Access Control) as the web application.
