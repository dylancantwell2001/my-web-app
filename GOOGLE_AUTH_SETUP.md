# Google Calendar Integration Setup Guide 📅

To allow Wacky Calendar to add events to your Google Calendar, you need to set up a project in the Google Cloud Console. It's free and takes about 5 minutes.

## Step 1: Create a Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown in the top-left (next to the Google Cloud logo).
3. Click **"New Project"**.
4. Name it something like "Wacky Calendar" and click **Create**.
5. Wait a moment, then select your new project from the notification bell or the dropdown.

## Step 2: Enable the Calendar API
1. In the search bar at the very top, type **"Google Calendar API"**.
2. Click on "Google Calendar API" (Marketplace).
3. Click **Enable**.

## Step 3: Configure Consent Screen
1. Go to **"APIs & Services" > "OAuth consent screen"**.
2. Select **External** (unless you have a Google Workspace organization) and click **Create**.
3. **App Information**:
   - **App name**: Wacky Calendar
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **Save and Continue**.
5. **Scopes**: You can skip this or click "Add or Remove Scopes" and search for `calendar.events`, but our code handles the request dynamically, so you can often skip this in the console setup for testing. Just click **Save and Continue**.
6. **Test Users**:
   - Since the app is in "Testing" mode, you MUST add your own email address here.
   - Click **+ Add Users** and enter your Google email.
   - Click **Save and Continue**.

## Step 4: Create Credentials
1. Go to **"APIs & Services" > "Credentials"**.
2. Click **+ Create Credentials** > **OAuth client ID**.
3. **Application type**: Select **Web application**.
4. **Name**: "Wacky Web Client".
5. **Authorized JavaScript origins**:
   - This is critical! You must add the URL where your app runs.
   - Click **+ Add URI**.
   - Add: `http://localhost:8080` (or whatever port your app is running on).
   - If you deploy later (e.g., to Vercel/Netlify), come back and add that URL too.
6. **Authorized redirect URIs**:
   - Click **+ Add URI**.
   - Add: `http://localhost:8080`
   - Also add: `http://localhost` (sometimes required for development).
7. Click **Create**.

## Step 5: Get Your Client ID
1. You will see a popup with "Your Client ID" and "Your Client Secret".
2. **Copy the Client ID** (it ends in `.apps.googleusercontent.com`).
3. You do NOT need the Client Secret for this frontend integration.

## Step 6: Add to Your Project
1. In your project folder (`my-web-app-main`), look for a file named `.env`. If it doesn't exist, create it.
2. Add this line to the file:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-copied-client-id-here
   ```
3. Save the file.
4. **Restart your server**: Stop the running terminal (Ctrl+C) and run `npm run dev` again.

Done! Now when you click "Add to Google Calendar", the Google popup should appear authorized for your app.
