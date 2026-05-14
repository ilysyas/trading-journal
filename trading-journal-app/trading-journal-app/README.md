# Trading Journal — Elias Vigigi

Your personal trading journal. Monthly calendar, trade logging, screenshots, win rate tracking.

---

## How to Deploy (one time setup, ~5 minutes)

### Step 1 — Create a GitHub account
Go to https://github.com and create a free account if you don't have one.

### Step 2 — Create a new repository
1. Click the **+** button (top right) → **New repository**
2. Name it: `trading-journal`
3. Set it to **Public**
4. Click **Create repository**

### Step 3 — Upload the files
1. In your new repo, click **uploading an existing file**
2. Drag and drop ALL the files from this folder:
   - `package.json`
   - `vercel.json`
   - The `public/` folder
   - The `src/` folder
3. Click **Commit changes**

### Step 4 — Deploy on Vercel (free)
1. Go to https://vercel.com and sign up with your GitHub account
2. Click **Add New Project**
3. Select your `trading-journal` repository
4. Click **Deploy** — that's it

Vercel will give you a URL like: `https://trading-journal-abc.vercel.app`

That's your app. Bookmark it. Open it on any device.

---

## How to Update

Whenever Claude gives you updated code:
1. Go to your GitHub repo
2. Click the file you want to update (e.g. `src/App.js`)
3. Click the pencil icon (Edit)
4. Replace the content with the new code
5. Click **Commit changes**

Vercel will automatically redeploy within ~30 seconds.

---

## Data

Your trade data is saved in your browser's localStorage.
It persists as long as you use the same browser.
To use across devices, we can add a cloud sync later.
