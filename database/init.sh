#!/bin/bash
# Database initialization script
# Applies all schema and seed files to the database

set -e

# Configuration
POSTGRES_USER="${POSTGRES_USER:-tenadam}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-tenadam_dev}"
POSTGRES_DB="${POSTGRES_DB:-tenadam}"
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Database Initialization...${NC}"
echo "Host: $POSTGRES_HOST:$POSTGRES_PORT"
echo "Database: $POSTGRES_DB"
echo "User: $POSTGRES_USER"
echo ""

# Function to execute SQL file
execute_sql() {
    local file=$1
    local description=$2
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}✗ File not found: $file${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}→ Applying: $description${NC}"
    PGPASSWORD="$POSTGRES_PASSWORD" psql \
        -h "$POSTGRES_HOST" \
        -p "$POSTGRES_PORT" \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        -f "$file"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $description applied successfully${NC}"
    else
        echo -e "${RED}✗ Failed to apply $description${NC}"
        return 1
    fi
    echo ""
}

# Test database connection
echo -e "${YELLOW}Testing database connection...${NC}"
PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h "$POSTGRES_HOST" \
    -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    -c "SELECT 1;" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Cannot connect to database. Make sure PostgreSQL is running.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Database connection successful${NC}"
echo ""

# Apply schema files in order
echo -e "${YELLOW}=== APPLYING SCHEMA FILES ===${NC}"
execute_sql "database/schemas/001_core.sql" "Core Schema (tenants, users)" || exit 1
execute_sql "database/schemas/002_registry.sql" "Registry Schema (patients, practitioners, facilities)" || exit 1
execute_sql "database/schemas/003_staff_management.sql" "Staff Management Schema (roles, templates, assignments)" || exit 1

# Apply seed files
echo -e "${YELLOW}=== APPLYING SEED DATA ===${NC}"
execute_sql "database/seeds/001_staff_roles_and_templates.sql" "Staff Roles and Templates Seed Data" || exit 1

# Verify data was created
echo -e "${YELLOW}=== VERIFYING DATA ===${NC}"

# Count roles
ROLE_COUNT=$(PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h "$POSTGRES_HOST" \
    -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    -t -c "SELECT COUNT(*) FROM roles WHERE active = TRUE;")
echo "✓ System Roles Created: $ROLE_COUNT"

# Count templates
TEMPLATE_COUNT=$(PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h "$POSTGRES_HOST" \
    -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    -t -c "SELECT COUNT(*) FROM staff_role_templates WHERE active = TRUE;")
echo "✓ Staff Templates Created: $TEMPLATE_COUNT"

# List sample roles
echo ""
echo -e "${YELLOW}Sample Roles (first 10):${NC}"
PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h "$POSTGRES_HOST" \
    -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    -c "SELECT name, description FROM roles WHERE active = TRUE ORDER BY name LIMIT 10;"

# List sample templates
echo ""
echo -e "${YELLOW}Sample Templates (first 10):${NC}"
PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h "$POSTGRES_HOST" \
    -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    -c "SELECT template_key, title, api_role FROM staff_role_templates WHERE active = TRUE ORDER BY title LIMIT 10;"

echo ""
echo -e "${GREEN}=== DATABASE INITIALIZATION COMPLETE ===${NC}"
echo "✓ All schemas and seed data have been applied successfully"
echo "✓ System is ready for staff management operations"
