This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Deployment

This guide walks through deploying the app to a home Ubuntu/Debian server using Docker Compose. No prior Docker or Linux knowledge is assumed — every command is explained.

### Prerequisites

- A home server or PC running **Ubuntu 22.04+** or **Debian 12+** (can be headless/no monitor)
- The server must be on the same local network as the devices that will use the app
- Internet access on the server (to pull Docker images and clone the repo)
- A terminal or SSH session on the server

---

### Step 1 — Install Docker & Docker Compose

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker

# Verify the installations
docker --version
docker compose version
```

**What each command does:**
- `apt update` — refreshes the package list so you get the latest versions
- `apt install` — installs Docker and the Compose plugin
- `usermod -aG docker $USER` — adds your user to the `docker` group so you don't need `sudo` for every Docker command
- `newgrp docker` — activates the group change immediately without requiring you to log out and back in

---

### Step 2 — Get the code onto the server

```bash
git clone <repo-url> ~/3d-printing-assistant
cd ~/3d-printing-assistant
```

Replace `<repo-url>` with the actual URL of this repository.

**No git installed?** You can copy the project folder from another machine using `scp`:
```bash
# Run this from your development machine, not the server
scp -r /path/to/3d-printing-assistant user@server-ip:~/3d-printing-assistant
```

---

### Step 3 — Find your server's local IP address

```bash
ip addr show | grep 'inet ' | grep -v '127.0.0.1'
```

Look for a line that starts with `inet 192.168.x.x` — that's your server's local IP address. Write it down; you'll need it in the next step.

Example output:
```
inet 192.168.1.42/24 brd 192.168.1.255 scope global eth0
```
In this example, the IP is `192.168.1.42`.

---

### Step 4 — Configure environment variables

```bash
cp .env.production.example .env.production
nano .env.production
```

Edit each variable as described below:

| Variable | What to set |
|---|---|
| `DATABASE_URL` | Leave as-is — it points to the SQLite file inside the container |
| `NEXTAUTH_SECRET` | A strong random string (see generation command below) |
| `NEXTAUTH_URL` | `http://<your-server-ip>` — use the IP from Step 3, no port, no trailing slash |
| `SEED_EMAIL` | Your login email for the app |
| `SEED_PASSWORD` | Your login password — change from the default |
| `SEED_ON_START` | Set to `"true"` for the first run to create your admin account |
| `NODE_ENV` | Leave as `"production"` |

**Generate a secure `NEXTAUTH_SECRET`:**
```bash
openssl rand -base64 32
```
Copy the output and paste it as the value for `NEXTAUTH_SECRET`.

**Example `.env.production`:**
```
DATABASE_URL="file:/app/data/dev.db"
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://192.168.1.42"
SEED_EMAIL="you@example.com"
SEED_PASSWORD="a-strong-password"
SEED_ON_START="true"
NODE_ENV="production"
```

**How to save and exit nano:** Press `Ctrl+O`, then `Enter` to save. Press `Ctrl+X` to exit.

---

### Step 5 — Build and start the app

```bash
docker compose up --build -d
```

**Flag explanations:**
- `--build` — builds the Docker image from source (required on first run and after updates)
- `-d` — runs the containers in the background (detached mode) so your terminal is free

Docker will pull base images, build the app, and start the containers. **The first build takes 5–10 minutes** — subsequent builds are faster due to layer caching.

---

### Step 6 — Watch the startup logs

```bash
docker compose logs -f
```

Wait until you see output like this:
```
[entrypoint] Running prisma db push...
[entrypoint] Seeding database...
[entrypoint] Starting Next.js...
✓ Ready on http://0.0.0.0:3000
```

Press `Ctrl+C` to stop watching the logs — the app keeps running in the background.

---

### Step 7 — Open the app

Open a browser on any device on your network and go to:
```
http://<your-server-ip>
```

Log in with the `SEED_EMAIL` and `SEED_PASSWORD` you set in Step 4.

---

### Step 8 — Post-first-run: disable seeding

After the first successful login, open `.env.production` and change `SEED_ON_START` back to `"false"`:

```bash
nano .env.production
# Change: SEED_ON_START="false"
# Save: Ctrl+O, Enter, Ctrl+X
```

Then restart the app to apply the change:
```bash
docker compose up -d
```

> **Why?** Seeding is idempotent (safe to run multiple times), but disabling it after setup avoids any accidental resets if you change `SEED_PASSWORD` later without intending a reset.

---

## Updating the App

```bash
cd ~/3d-printing-assistant
git pull
docker compose up --build -d
```

Your database (`./data/`) and uploaded files (`./public/uploads/`) live in bind-mounted folders on the host filesystem — they are never touched during a rebuild and survive every update.

---

## Backing Up Your Data

### Database

```bash
# Create a dated backup of the database
cp ~/3d-printing-assistant/data/dev.db ~/backups/dev-$(date +%Y%m%d).db
```

The `data/` directory is a plain folder on your host machine. Copy it anywhere you like.

### Uploaded images & models

```bash
cp -r ~/3d-printing-assistant/public/uploads ~/backups/uploads-$(date +%Y%m%d)
```

### Automating backups with cron

```bash
crontab -e
```

Add this line to run a database backup every day at 2:00 AM:
```
0 2 * * * cp ~/3d-printing-assistant/data/dev.db ~/backups/dev-$(date +\%Y\%m\%d).db
```

> **Note:** The `\%` escaping is required inside crontab entries.

First, make sure the backups folder exists:
```bash
mkdir -p ~/backups
```

---

## Restoring from Backup

```bash
# Stop the app
docker compose down

# Overwrite the live database with your backup
cp ~/backups/dev-20240315.db ~/3d-printing-assistant/data/dev.db

# Start again
docker compose up -d
```

---

## Managing the Container

| Task | Command |
|---|---|
| Stop the app | `docker compose down` |
| Start again | `docker compose up -d` |
| Restart | `docker compose restart app` |
| View live logs | `docker compose logs -f` |
| Check running containers | `docker ps` |
| Open a shell inside the container | `docker compose exec app sh` |

---

## Troubleshooting

### Port 80 already in use

```
Error: bind: address already in use
```

Another process (often Apache or Nginx) is using port 80. Find and stop it:

```bash
sudo ss -tlnp | grep :80
sudo systemctl stop apache2   # or: sudo systemctl stop nginx
```

### Permission denied on `data/` or `uploads/`

The `init` service in `docker-compose.yml` handles permissions automatically on every start. If you still see errors, fix them manually:

```bash
sudo chown -R 1001:1001 ~/3d-printing-assistant/data ~/3d-printing-assistant/public/uploads
```

### App not reachable from other devices

1. Confirm the server IP: `ip addr show`
2. Check your firewall status: `sudo ufw status`
3. Allow port 80 if it's blocked: `sudo ufw allow 80/tcp`

### "Invalid NEXTAUTH_URL" or redirect loops

Make sure `NEXTAUTH_URL` in `.env.production` matches **exactly** what you type in your browser:
- Include `http://`
- Use the server's IP address, not `localhost`
- No trailing slash
- No port number (port 80 is implicit)

**Correct:** `NEXTAUTH_URL="http://192.168.1.42"`
**Wrong:** `NEXTAUTH_URL="http://192.168.1.42:3000/"` or `NEXTAUTH_URL="http://localhost"`

### Forgot password / want to reset credentials

Edit `.env.production`: set `SEED_ON_START="true"` and update `SEED_PASSWORD` to your new password, then restart:

```bash
docker compose up -d
```

Once the container has started and you've confirmed the new credentials work, set `SEED_ON_START="false"` and restart once more.

---

## Verification Checklist

After deployment, run through these checks to confirm everything is working:

- [ ] `docker compose logs app` shows `Ready on http://0.0.0.0:3000`
- [ ] `http://<server-ip>` opens the login page (no port in the URL)
- [ ] Login works with the credentials you set in `.env.production`
- [ ] Navigate to all pages: Dashboard, Inventory, Products, Jobs, Calculator
- [ ] Upload an image; restart the container (`docker compose restart app`); confirm the image still appears
- [ ] `docker compose down && docker compose up -d` — database and uploaded files survive the restart
