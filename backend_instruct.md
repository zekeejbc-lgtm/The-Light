# Firebase Backend Setup Instructions

To switch the application from using Mock Data to a live Firebase backend, follow these steps:

1.  **Create a Firebase Project**
    *   Go to [console.firebase.google.com](https://console.firebase.google.com).
    *   Click "Add project" and follow the setup wizard.

2.  **Enable Firebase Services**
    *   **Authentication**:
        *   Go to Build > Authentication.
        *   Click "Get Started".
        *   Enable "Google" sign-in provider.
    *   **Firestore Database**:
        *   Go to Build > Firestore Database.
        *   Click "Create Database".
        *   Select "Start in test mode" (for development purposes).
        *   Choose a location near you.

3.  **Get Your Configuration**
    *   Click the Gear icon (Project Settings) > General.
    *   Scroll down to "Your apps".
    *   Click the Web icon (`</>`) to register a web app.
    *   Give it a name (e.g., "The Light PWA").
    *   Copy the `firebaseConfig` object (apiKey, authDomain, etc.).

4.  **Integrate Code**
    *   Open the file `services/backend.ts`.
    *   Replace the `firebaseConfig` placeholder object with your actual configuration from Step 3.
    *   **Important**: To fully activate the backend, you must update `services/contentService.ts` to call the functions exported from `backend.ts` instead of manipulating the local mock arrays.

5.  **Data Structure (Firestore)**
    *   The app expects the following collections:
        *   `users`
        *   `articles`
        *   `pages`
        *   `reports`
        *   `comments`
        *   `systemConfig` (document ID `main`)

6.  **Deploy**
    *   You can host this on Firebase Hosting or any static site host.