# Contact form backend (Google Apps Script) — one-time setup

This powers 3 automations for free, using nothing but your own Google account:
1. Every form submission (Contact page + Onboarding page) is saved as a row in a Google Sheet.
2. You get an email at anshpatel4204@gmail.com for every submission.
3. The person who submitted gets an automatic "thanks, we got it" reply.

No third-party service, no API keys, no monthly limits to worry about. Takes about 5 minutes.

## Steps

1. **Create a new Google Sheet.**
   Go to [sheets.new](https://sheets.new) and rename it something like "AK Forge — Leads".

2. **Open the script editor.**
   In the Sheet, go to `Extensions → Apps Script`. This opens a blank script editor tied to this Sheet.

3. **Paste the code.**
   Delete the placeholder `function myFunction() {}` code, and paste in the entire contents of `Code.gs` (in this same folder).

4. **Check the owner email.**
   Near the top of the script, confirm this line has your correct email:
   ```
   const OWNER_EMAIL = "anshpatel4204@gmail.com";
   ```

5. **Deploy as a Web App.**
   - Click **Deploy → New deployment**.
   - Click the gear icon next to "Select type" and choose **Web app**.
   - Description: `AK Forge form handler`.
   - **Execute as:** Me (your Google account).
   - **Who has access:** Anyone.
   - Click **Deploy**.
   - Google will ask you to authorize the script (it needs permission to send email and edit the Sheet on your behalf) — click through the "Advanced" / "Go to (unsafe)" prompt if it appears. This is expected for scripts you write yourself.
   - Copy the **Web app URL** it gives you (looks like `https://script.google.com/macros/s/XXXXXXX/exec`).

6. **Paste the URL into the website.**
   Open `assets/js/main.js` in the site and replace this line near the top:
   ```js
   const FORM_ENDPOINT = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
   ```
   with your real URL, e.g.:
   ```js
   const FORM_ENDPOINT = "https://script.google.com/macros/s/XXXXXXX/exec";
   ```
   Commit and push — GitHub Actions will redeploy the site automatically.

7. **Test it.**
   Submit the Contact form on your live site with your own email address. You should see:
   - A new row appear in the Google Sheet (tab "Leads").
   - An email land in anshpatel4204@gmail.com.
   - An auto-reply land in the email address you tested with.

   Do the same for the Onboarding form — it logs to a second tab called "Onboarding".

## Updating later

If you ever edit `Code.gs` again, you need to **create a new deployment version** for changes to go live:
`Deploy → Manage deployments → (pencil/edit icon) → Version: New version → Deploy`.

## Free tier limits (Google Apps Script, personal Gmail account)

- Email sending: 100 emails/day (owner notification + auto-reply = 2 per form submission, so about 50 submissions/day — plenty for a new studio).
- No cost, no credit card, no expiry.
