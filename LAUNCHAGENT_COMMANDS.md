# HomeMaint LaunchAgent Quick Reference

HomeMaint is now configured to start automatically when you log in!

## Status

✅ **Auto-start enabled** - HomeMaint will start automatically on login
✅ **KeepAlive enabled** - If the app crashes, it will automatically restart
✅ **Running now** - Service is currently active

## Useful Commands

### Check if service is running

```bash
launchctl list | grep homemaint
```

Output shows: `PID  Status  Label`

- If PID > 0, service is running
- Status should be 0

### Check server status

```bash
curl http://localhost:3000
# or visit in browser: http://localhost:3000
```

### View logs

```bash
# View live output
tail -f ~/Library/Logs/homemaint.log

# View errors
tail -f ~/Library/Logs/homemaint-error.log

# View last 20 lines
tail -20 ~/Library/Logs/homemaint.log
```

### Stop the service

```bash
launchctl stop com.homemaint.app
```

Note: It will auto-restart due to KeepAlive. To stop permanently, use unload.

### Disable auto-start (unload)

```bash
launchctl unload ~/Library/LaunchAgents/com.homemaint.app.plist
```

### Re-enable auto-start (load)

```bash
launchctl load ~/Library/LaunchAgents/com.homemaint.app.plist
```

### Restart the service

```bash
launchctl unload ~/Library/LaunchAgents/com.homemaint.app.plist
launchctl load ~/Library/LaunchAgents/com.homemaint.app.plist
```

Or use kickstart:

```bash
launchctl kickstart -k gui/$(id -u)/com.homemaint.app
```

### Remove auto-start completely

```bash
launchctl unload ~/Library/LaunchAgents/com.homemaint.app.plist
rm ~/Library/LaunchAgents/com.homemaint.app.plist
```

## Access URLs

- **This Mac:** http://localhost:3000
- **Network devices:** http://192.168.1.237:3000 (your current IP)

## Log Files Location

- **Startup logs:** `~/Library/Logs/homemaint.log`
- **Error logs:** `~/Library/Logs/homemaint-error.log`

## What Happens on Login

1. macOS loads the LaunchAgent
2. HomeMaint starts automatically
3. Available at http://localhost:3000 within seconds
4. If it crashes, it automatically restarts

## Troubleshooting

**Service won't start:**

```bash
# Check error logs
cat ~/Library/Logs/homemaint-error.log

# Verify plist syntax
plutil -lint ~/Library/LaunchAgents/com.homemaint.app.plist
```

**Port already in use:**

```bash
# Find what's using port 3000
lsof -i :3000

# Kill it
lsof -ti:3000 | xargs kill -9
```

**After updating HomeMaint code:**

```bash
# Rebuild
npm run build

# Restart service
launchctl kickstart -k gui/$(id -u)/com.homemaint.app
```

---

**Service is running! 🎉**

HomeMaint will now start automatically every time you log in to your Mac.
