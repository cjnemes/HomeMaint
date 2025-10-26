# Personal Deployment Guide

Complete guide for deploying HomeMaint for personal use on your Mac or Synology NAS.

## Table of Contents

1. [Option 1: Mac Local Deployment (Recommended for Personal Use)](#option-1-mac-local-deployment)
2. [Option 2: Synology NAS Deployment](#option-2-synology-nas-deployment)
3. [Backup & Maintenance](#backup--maintenance)
4. [Troubleshooting](#troubleshooting)

---

## Option 1: Mac Local Deployment

**Best for:** Personal use on your primary Mac with easy access

### Prerequisites

- macOS 10.15 or later
- Node.js 18.17.0 or later installed
- Terminal access

### Quick Start

1. **Navigate to Project Directory**

   ```bash
   cd /Users/chris/dev/HomeMaint
   ```

2. **Build Production Version**

   ```bash
   npm run build
   ```

   This takes 1-2 minutes and creates an optimized production build.

3. **Start HomeMaint**

   ```bash
   ./scripts/start-production-mac.sh
   ```

   Or manually:

   ```bash
   NODE_ENV=production npm start
   ```

4. **Access HomeMaint**

   Open your browser to:
   - Local: http://localhost:3000
   - Network: http://[your-mac-ip]:3000

### Run on Startup (Optional)

To have HomeMaint start automatically when you log in:

1. **Create Launch Agent**

   ```bash
   mkdir -p ~/Library/LaunchAgents
   ```

2. **Create plist file:**

   ```bash
   cat > ~/Library/LaunchAgents/com.homemaint.app.plist << 'EOF'
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
       <key>Label</key>
       <string>com.homemaint.app</string>
       <key>ProgramArguments</key>
       <array>
           <string>/usr/local/bin/node</string>
           <string>/Users/chris/dev/HomeMaint/node_modules/next/dist/bin/next</string>
           <string>start</string>
       </array>
       <key>WorkingDirectory</key>
       <string>/Users/chris/dev/HomeMaint</string>
       <key>RunAtLoad</key>
       <true/>
       <key>KeepAlive</key>
       <true/>
       <key>StandardOutPath</key>
       <string>/Users/chris/Library/Logs/homemaint.log</string>
       <key>StandardErrorPath</key>
       <string>/Users/chris/Library/Logs/homemaint-error.log</string>
       <key>EnvironmentVariables</key>
       <dict>
           <key>NODE_ENV</key>
           <string>production</string>
           <key>PORT</key>
           <string>3000</string>
       </dict>
   </dict>
   </plist>
   EOF
   ```

3. **Load the service:**

   ```bash
   launchctl load ~/Library/LaunchAgents/com.homemaint.app.plist
   ```

4. **Start the service:**

   ```bash
   launchctl start com.homemaint.app
   ```

5. **Check if running:**

   ```bash
   launchctl list | grep homemaint
   curl http://localhost:3000
   ```

### Stop/Manage the Service

```bash
# Stop the service
launchctl stop com.homemaint.app

# Unload (remove from startup)
launchctl unload ~/Library/LaunchAgents/com.homemaint.app.plist

# Reload after making changes
launchctl unload ~/Library/LaunchAgents/com.homemaint.app.plist
launchctl load ~/Library/LaunchAgents/com.homemaint.app.plist
```

### Access from Other Devices

To access HomeMaint from your iPhone/iPad on the same network:

1. Find your Mac's IP address:

   ```bash
   ipconfig getifaddr en0
   ```

2. On your iPhone/iPad, open Safari and navigate to:

   ```
   http://[your-mac-ip]:3000
   ```

3. **Add to Home Screen** for app-like experience:
   - Tap the Share button
   - Scroll down and tap "Add to Home Screen"
   - Name it "HomeMaint"
   - Tap "Add"

---

## Option 2: Synology NAS Deployment

**Best for:** Always-on access from anywhere, automatic backups

### Prerequisites

- Synology NAS with DSM 7.0 or later
- Docker package installed on Synology
- SSH access to NAS (optional, for advanced setup)

### Method A: Using Docker via DSM UI

1. **Install Docker Package**
   - Open Package Center on DSM
   - Search for "Docker"
   - Click Install

2. **Prepare Project Files**

   On your Mac, create a deployment package:

   ```bash
   cd /Users/chris/dev/HomeMaint

   # Create deployment archive (excludes dev files)
   tar --exclude='node_modules' \
       --exclude='.next' \
       --exclude='data' \
       --exclude='.git' \
       -czf homemaint-deploy.tar.gz .
   ```

3. **Upload to Synology**
   - Open File Station
   - Navigate to `/docker/homemaint/` (create if needed)
   - Upload `homemaint-deploy.tar.gz`
   - Extract the archive

4. **Create Docker Container via SSH**

   SSH into your Synology:

   ```bash
   ssh admin@your-synology-ip
   ```

   Navigate to the app directory:

   ```bash
   cd /volume1/docker/homemaint
   tar -xzf homemaint-deploy.tar.gz
   ```

   Build and start:

   ```bash
   docker-compose up -d --build
   ```

5. **Access HomeMaint**
   - Local network: http://synology-ip:3000
   - Via QuickConnect: Configure reverse proxy in DSM

### Method B: Using Synology Container Manager

1. **Create Project**
   - Open Container Manager in DSM
   - Go to Project tab
   - Click Create
   - Name: "homemaint"
   - Path: `/docker/homemaint`
   - Select "Upload docker-compose.yml"
   - Upload the `docker-compose.yml` file from this repo

2. **Configure Volumes**

   The compose file automatically creates persistent volumes for:
   - `/app/data` → SQLite database
   - `/app/data/backups` → Backup storage

3. **Build and Start**
   - Click "Build" to create the image
   - Once built, click "Start" to launch the container

### Setting Up Reverse Proxy (Optional)

For HTTPS access and custom domain:

1. **In DSM Control Panel → Login Portal → Advanced → Reverse Proxy**

2. **Create new reverse proxy rule:**
   - Source:
     - Protocol: HTTPS
     - Hostname: home.yourdomain.com
     - Port: 443
   - Destination:
     - Protocol: HTTP
     - Hostname: localhost
     - Port: 3000

3. **Enable HSTS and HTTP/2** in the proxy settings

4. **Set up SSL certificate** via DSM Control Panel → Security → Certificate

### External Access via QuickConnect

1. Enable QuickConnect in DSM Control Panel
2. Access via: http://QuickConnectID.quickconnect.to:3000

---

## Backup & Maintenance

### Automatic Backups

The backup script is included and ready to use:

```bash
# Run manual backup
./scripts/backup.sh
```

### Schedule Automatic Backups

**On Mac (using cron):**

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /Users/chris/dev/HomeMaint && ./scripts/backup.sh

# Add weekly backup on Sundays at 3 AM
0 3 * * 0 cd /Users/chris/dev/HomeMaint && ./scripts/backup.sh
```

**On Synology:**

1. Open Control Panel → Task Scheduler
2. Create → Scheduled Task → User-defined script
3. General:
   - Task: HomeMaint Backup
   - User: root
4. Schedule:
   - Daily at 2:00 AM
5. Task Settings → Run command:
   ```bash
   docker exec homemaint /app/scripts/backup.sh
   ```

### Backup Retention

The backup script automatically keeps the last 30 backups. Modify in `scripts/backup.sh`:

```bash
MAX_BACKUPS=30  # Change this value
```

### Restore from Backup

1. **Stop HomeMaint**

   Mac:

   ```bash
   launchctl stop com.homemaint.app
   # or Ctrl+C if running manually
   ```

   Synology:

   ```bash
   docker-compose stop
   ```

2. **Restore Database**

   ```bash
   # Replace with your backup file
   cp data/backups/homemaint_backup_YYYYMMDD_HHMMSS.db data/homemaint.db
   ```

3. **Restart HomeMaint**

   Mac:

   ```bash
   launchctl start com.homemaint.app
   ```

   Synology:

   ```bash
   docker-compose start
   ```

### Reset All Data (Starting Fresh)

**Location:** Settings → Data Management → Reset All Data

This feature allows you to clear all data and start fresh:

- ✅ **Automatic backup created** before reset
- ✅ **Safe implementation** - uses SQL DELETE statements (doesn't delete database file)
- ✅ **Auto-recovery** - database reseeds with default home/categories/locations
- ✅ **No server restart needed** - operation completes without crashing

**How it works:**

1. Creates automatic backup in `data/backups/`
2. Deletes all data from tables in correct order (respects foreign keys)
3. Resets auto-increment sequences
4. Runs VACUUM to reclaim space
5. Reseeds database with default home on next access

**Important:** The automatic backup can be restored from Settings if you change your mind.

### Database Maintenance

The app includes automatic database optimization. For manual optimization:

```bash
# Manually optimize database (while app is running)
sqlite3 data/homemaint.db "VACUUM; ANALYZE;"
```

---

## Troubleshooting

### Mac Issues

**Port 3000 already in use:**

```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or use a different port
PORT=3001 npm start
```

**Permission errors with data directory:**

```bash
chmod 755 data
chmod 644 data/homemaint.db
```

**App not starting on boot:**

```bash
# Check launchd logs
tail -f ~/Library/Logs/homemaint.log
tail -f ~/Library/Logs/homemaint-error.log

# Verify plist is loaded
launchctl list | grep homemaint
```

### Synology Issues

**Container won't start:**

```bash
# View container logs
docker logs homemaint

# Rebuild container
docker-compose down
docker-compose up -d --build
```

**Can't access from external network:**

- Check Synology firewall settings (Control Panel → Security → Firewall)
- Add rule to allow port 3000 (or your configured port)
- Check router port forwarding if accessing from outside home network

**Database permission errors:**

```bash
# Fix permissions
docker exec homemaint chown -R nextjs:nodejs /app/data
```

### General Issues

**Database corrupted:**

The app includes auto-recovery, but if you need to manually reset:

```bash
# Backup current database first!
cp data/homemaint.db data/homemaint.db.backup

# Remove database (app will create new one)
rm data/homemaint.db

# Restart app
```

**Slow performance:**

```bash
# Check database size
du -h data/homemaint.db

# Optimize database
sqlite3 data/homemaint.db "VACUUM; ANALYZE;"
```

**Build failures:**

```bash
# Clean and rebuild
rm -rf .next node_modules
npm install
npm run build
```

---

## Updating HomeMaint

### Mac Local

```bash
cd /Users/chris/dev/HomeMaint
git pull origin main
npm install
npm run build

# If using launchd service:
launchctl stop com.homemaint.app
launchctl start com.homemaint.app
```

### Synology Docker

```bash
# SSH into Synology
cd /volume1/docker/homemaint

# Update code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

---

## Data Location

All your data is stored locally:

- **Mac:** `/Users/chris/dev/HomeMaint/data/`
- **Synology:** `/volume1/docker/homemaint/data/`

Contents:

- `homemaint.db` - SQLite database with all your data
- `backups/` - Automated database backups
- Uploaded files are stored as base64 in the database

**Important:** Always backup the `data/` directory before major updates!

---

## Performance Tips

- Database is optimized for < 1000 assets
- Keep uploaded files under 5MB each
- Run weekly database optimization
- Monitor disk space (database can grow with attachments)

---

## Security Recommendations

For local Mac deployment:

- ✅ Only accessible on your local network by default
- ✅ No external exposure unless you configure port forwarding
- ✅ All data stays on your machine

For Synology deployment:

- ✅ Use HTTPS with Let's Encrypt certificate
- ✅ Enable firewall rules
- ✅ Use strong QuickConnect password
- ✅ Consider VPN for external access instead of port forwarding

---

## Support

- **Documentation:** See README.md
- **Issues:** Create a GitHub issue
- **Backups:** Located in `data/backups/`
- **Logs:** Check console output or log files

---

**Ready to deploy! Choose your preferred option above and follow the steps.** 🚀
