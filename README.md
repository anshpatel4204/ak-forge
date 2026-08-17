# AK Forge — Website

Static site for AK Forge (Ansh Patel), free-hosted on GitHub Pages. No build
step, no framework — plain HTML/CSS/JS, so it's easy to edit by hand.

## 1. Put this on GitHub

1. Create a **new, empty** GitHub repository named `ak-forge` (Settings you'll want: Public, no README/license auto-created).
2. From this folder, run:
   ```bash
   git init
   git add .
   git commit -m "Launch AK Forge website"
   git branch -M main
   git remote add origin https://github.com/<your-username>/ak-forge.git
   git push -u origin main
   ```
3. In the repo on GitHub: **Settings → Pages → Build and deployment → Source → GitHub Actions.**
   (Don't pick "Deploy from a branch" — the included workflow handles deployment.)
4. Push again (or re-run the "Deploy AK Forge site to GitHub Pages" workflow from the **Actions** tab) and your site goes live at:
   ```
   https://<your-username>.github.io/ak-forge/
   ```

From now on, **every push to `main` auto-redeploys the live site** — that's the `.github/workflows/deploy.yml` automation. No manual deploy step, ever.

> If your GitHub username isn't `anshpatel4204`, update the URL in `.github/workflows/uptime.yml` (`SITE_URL`), `robots.txt`, and `sitemap.xml`.

## 2. Connect the contact form (required for automations to work)

The Contact and Onboarding forms need a free Google Apps Script backend to
actually send emails and log leads. Full step-by-step guide:
**[`apps-script/README.md`](apps-script/README.md)** — takes about 5 minutes,
uses only your own Google account.

Until you do this, the forms will show a friendly "not connected yet" message
instead of failing silently.

## 3. What's automated out of the box

| Automation | How | Where |
|---|---|---|
| Auto-deploy on push | GitHub Actions rebuilds & redeploys the live site on every push to `main` | `.github/workflows/deploy.yml` |
| Contact form → your email | Google Apps Script emails anshpatel4204@gmail.com on every submission | `apps-script/Code.gs` |
| Auto-reply to the client | Same script sends the submitter a "we got it" confirmation | `apps-script/Code.gs` |
| Lead logging | Same script appends every submission as a row in a Google Sheet | `apps-script/Code.gs` |
| Digital client onboarding | Contact form success reveals a link to `onboarding.html`, a self-serve version of the intake form (logs to a separate Sheet tab) | `contact.html`, `onboarding.html` |
| WhatsApp quick-connect | Buttons deep-link into WhatsApp with a prefilled message | `assets/js/main.js` (`data-wa-text`) |
| Uptime monitoring | A scheduled GitHub Actions check pings the live site every 30 min; if it goes down, it opens a GitHub issue (which emails you automatically) and auto-closes it once the site's back | `.github/workflows/uptime.yml` |

## 4. Updating content later

- **Stats, services, process steps, and portfolio projects** all live in one place: `assets/data/site-data.js`. Add a new project or change a stat there — no HTML editing needed.
- **Logo / favicons**: `assets/img/`.
- **Phone, email, WhatsApp number, location**: top of `assets/data/site-data.js` under `business`.
- **Colours**: CSS variables at the top of `assets/css/style.css` (`--accent`, `--navy`, etc.) — pulled from your real logo colours.

## 5. No pricing on the site

By design, none of your service package prices from the Management & Billing
folder are shown publicly — visitors are directed to the contact form to get
a quote, matching how your quotation/invoice process already works.

## 6. Local preview

No build tools needed — just open `index.html` in a browser, or serve it locally:
```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```
