#!/bin/bash

# HomeMaint Database Backup Script
# This script creates backups of the SQLite database and manages backup retention

# Configuration
BACKUP_DIR="./data/backups"
DB_FILE="./data/homemaint.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/homemaint_backup_$TIMESTAMP.db"
MAX_BACKUPS=30  # Keep last 30 backups

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if database exists
if [ ! -f "$DB_FILE" ]; then
    echo -e "${RED}Error: Database file not found at $DB_FILE${NC}"
    exit 1
fi

# Create backup
echo -e "${YELLOW}Creating backup...${NC}"
cp "$DB_FILE" "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    # Get backup size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✓ Backup created successfully:${NC}"
    echo -e "  File: $BACKUP_FILE"
    echo -e "  Size: $BACKUP_SIZE"
else
    echo -e "${RED}✗ Backup failed!${NC}"
    exit 1
fi

# Clean up old backups (keep only MAX_BACKUPS most recent)
echo -e "${YELLOW}Cleaning up old backups...${NC}"
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/homemaint_backup_*.db 2>/dev/null | wc -l)

if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    DELETE_COUNT=$((BACKUP_COUNT - MAX_BACKUPS))
    echo -e "  Found $BACKUP_COUNT backups, removing $DELETE_COUNT oldest..."

    ls -1t "$BACKUP_DIR"/homemaint_backup_*.db | tail -n "$DELETE_COUNT" | while read -r old_backup; do
        rm "$old_backup"
        echo -e "  ${YELLOW}Deleted:${NC} $(basename "$old_backup")"
    done
else
    echo -e "  ${GREEN}✓${NC} Current backup count: $BACKUP_COUNT (within limit of $MAX_BACKUPS)"
fi

echo -e "${GREEN}✓ Backup complete!${NC}"
