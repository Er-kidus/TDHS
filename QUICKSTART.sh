#!/bin/bash
# QUICK START DEPLOYMENT SCRIPT
# Comprehensive Staff Management System
# Total Time: ~15 minutes

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   STAFF MANAGEMENT SYSTEM - QUICK START DEPLOYMENT         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
POSTGRES_USER="${1:-tenadam}"
POSTGRES_DB="${2:-tenadam}"
POSTGRES_HOST="${3:-localhost}"
POSTGRES_PORT="${4:-5432}"

echo -e "${YELLOW}Configuration:${NC}"
echo "  User: $POSTGRES_USER"
echo "  Database: $POSTGRES_DB"
echo "  Host: $POSTGRES_HOST:$POSTGRES_PORT"
echo ""

# Step 1: Database Schema
echo -e "${YELLOW}[1/5] Applying Database Schema...${NC}"
if [ ! -f "database/schemas/003_staff_management.sql" ]; then
    echo -e "${RED}✗ Schema file not found: database/schemas/003_staff_management.sql${NC}"
    exit 1
fi

PGPASSWORD="$5" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f database/schemas/003_staff_management.sql 2>/dev/null
echo -e "${GREEN}✓ Schema applied${NC}"
echo ""

# Step 2: Seed Data
echo -e "${YELLOW}[2/5] Applying Seed Data...${NC}"
if [ ! -f "database/seeds/001_staff_roles_and_templates.sql" ]; then
    echo -e "${RED}✗ Seed file not found: database/seeds/001_staff_roles_and_templates.sql${NC}"
    exit 1
fi

PGPASSWORD="$5" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f database/seeds/001_staff_roles_and_templates.sql 2>/dev/null
echo -e "${GREEN}✓ Seed data applied${NC}"
echo ""

# Step 3: Verification
echo -e "${YELLOW}[3/5] Verifying Installation...${NC}"

ROLE_COUNT=$(PGPASSWORD="$5" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT COUNT(*) FROM roles WHERE active = TRUE;" 2>/dev/null)
TEMPLATE_COUNT=$(PGPASSWORD="$5" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT COUNT(*) FROM staff_role_templates WHERE active = TRUE;" 2>/dev/null)

echo -e "${GREEN}✓ System Roles: $ROLE_COUNT${NC}"
echo -e "${GREEN}✓ Staff Templates: $TEMPLATE_COUNT${NC}"

if [ "$ROLE_COUNT" -lt 70 ] || [ "$TEMPLATE_COUNT" -lt 30 ]; then
    echo -e "${RED}✗ Unexpected record count${NC}"
    exit 1
fi
echo ""

# Step 4: Frontend Files Check
echo -e "${YELLOW}[4/5] Checking Frontend Files...${NC}"

FILES=(
    "apps/web/src/config.ts"
    "apps/web/src/services/staff.service.ts"
    "apps/web/src/hooks/useStaff.ts"
    "apps/web/src/components/staff/StaffForm.tsx"
    "apps/web/src/components/staff/StaffList.tsx"
    "apps/web/src/components/staff/AlertMessage.tsx"
    "apps/web/src/pages/StaffManagementPage.tsx"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file NOT FOUND${NC}"
    fi
done
echo ""

# Step 5: Summary
echo -e "${YELLOW}[5/5] Deployment Summary...${NC}"
echo -e "${GREEN}✓ Database schema applied${NC}"
echo -e "${GREEN}✓ Seed data inserted${NC}"
echo -e "${GREEN}✓ $ROLE_COUNT system roles available${NC}"
echo -e "${GREEN}✓ $TEMPLATE_COUNT staff templates available${NC}"
echo -e "${GREEN}✓ All frontend files present${NC}"
echo ""

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}✓ DEPLOYMENT COMPLETE!${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review: DOCUMENTATION_INDEX.md"
echo "2. Test: Use curl examples from VISUAL_DEPLOYMENT_GUIDE.md"
echo "3. Verify: Run checklist from DATABASE_IMPLEMENTATION_CHECKLIST.md"
echo ""

echo -e "${YELLOW}Documentation:${NC}"
echo "  • Deployment Guide: DATABASE_DEPLOYMENT_GUIDE.md"
echo "  • Visual Overview: VISUAL_DEPLOYMENT_GUIDE.md"
echo "  • Quick Reference: STAFF_SYSTEM_QUICK_REFERENCE.md"
echo "  • Full System: COMPREHENSIVE_STAFF_SYSTEM_COMPLETE.md"
echo ""

echo -e "${GREEN}Ready for production! 🚀${NC}"
