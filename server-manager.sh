#!/bin/bash

# ========================================
# Server Manager - Consejo de Redacción
# Unified script for all server operations
# ========================================

# Server Configuration
SERVER_USER="n8n"
SERVER_HOST="192.168.0.99"
SERVER_PASS="N8n*123*"
REMOTE_DIR="/home/n8n/ConsejoRedaccion"
FRONTEND_PORT=3002
BACKEND_PORT=8002
DB_PORT=5435

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ssh_cmd() {
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_HOST}" "$1"
}

rsync_to_server() {
    sshpass -p "$SERVER_PASS" rsync -avz --exclude 'node_modules/' --exclude '.next/' --exclude '__pycache__/' --exclude '.git/' --exclude 'uploads/' "$1" "${SERVER_USER}@${SERVER_HOST}:$2"
}

show_menu() {
    clear
    echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║    ${GREEN}Consejo de Redacción - Manager${BLUE}         ║${NC}"
    echo -e "${BLUE}║    ${NC}Server: ${SERVER_HOST}${BLUE}                    ║${NC}"
    echo -e "${BLUE}╠═══════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║${NC}  1) 🚀 Deploy (rebuild + preserve DB)      ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}  2) ⚡ Quick Update (sync + restart)       ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}  3) 🗄️  Database Menu                      ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}  4) 🔧 Services Menu                       ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}  5) 📋 View Logs                           ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}  6) ❌ Exit                                ${BLUE}║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
    echo ""
}

show_db_menu() {
    echo -e "${YELLOW}Database Operations:${NC}"
    echo "  a) Migrate Schema (apply new tables/columns - SAFE)"
    echo "  b) Reset Database (drop & recreate - DESTRUCTIVE)"
    echo "  c) Seed Users"
    echo "  d) Backup Database"
    echo "  e) View Tables"
    echo "  x) Back"
    echo ""
}

show_services_menu() {
    echo -e "${YELLOW}Services Operations:${NC}"
    echo "  a) Start All Services"
    echo "  b) Stop All Services"
    echo "  c) Restart All Services"
    echo "  d) Status"
    echo "  e) Check Ports"
    echo "  x) Back"
    echo ""
}

do_deploy() {
    echo -e "${GREEN}Starting full deployment...${NC}"
    
    # Load GEMINI_API_KEY from .env
    if [ -f ".env" ]; then
        export $(cat .env | grep GEMINI_API_KEY | xargs)
    fi
    
    echo "📦 Creating production docker-compose..."
    cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
      args:
        NEXT_PUBLIC_API_URL: http://${SERVER_HOST}:${BACKEND_PORT}
    ports:
      - "${FRONTEND_PORT}:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://${SERVER_HOST}:${BACKEND_PORT}
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "${BACKEND_PORT}:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/consejo_redaccion
      - GEMINI_API_KEY=${GEMINI_API_KEY:-YOUR_KEY_HERE}
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    ports:
      - "${DB_PORT}:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=consejo_redaccion
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
EOF

    echo "📤 Syncing files to server..."
    rsync_to_server "./" "${REMOTE_DIR}/"
    
    echo "🏗️ Building and starting services (PRESERVING DATABASE)..."
    # Stop frontend and backend only, keep DB running
    ssh_cmd "cd ${REMOTE_DIR} && docker compose -f docker-compose.prod.yml stop frontend backend 2>/dev/null || true"
    ssh_cmd "cd ${REMOTE_DIR} && docker compose -f docker-compose.prod.yml build --no-cache frontend backend"
    ssh_cmd "cd ${REMOTE_DIR} && docker compose -f docker-compose.prod.yml up -d"
    
    echo -e "${GREEN}✅ Deployment complete!${NC}"
    echo "Frontend: http://${SERVER_HOST}:${FRONTEND_PORT}"
    echo "Backend:  http://${SERVER_HOST}:${BACKEND_PORT}"
}

do_quick_update() {
    echo -e "${GREEN}Quick update (sync + rebuild frontend/backend)...${NC}"
    echo -e "${YELLOW}⚠️  Database will NOT be affected${NC}"
    
    rsync_to_server "./frontend/" "${REMOTE_DIR}/frontend/"
    rsync_to_server "./backend/" "${REMOTE_DIR}/backend/"
    
    echo "🔄 Rebuilding frontend and backend..."
    ssh_cmd "cd ${REMOTE_DIR} && docker compose stop frontend backend"
    ssh_cmd "cd ${REMOTE_DIR} && docker compose build --no-cache frontend backend"
    ssh_cmd "cd ${REMOTE_DIR} && docker compose up -d"
    echo -e "${GREEN}✅ Update complete! Database preserved.${NC}"
}

do_migrate() {
    echo -e "${GREEN}Applying schema migrations...${NC}"
    echo -e "${YELLOW}This will add new tables/columns without deleting existing data.${NC}"
    
    # Restart backend to trigger SQLAlchemy's create_all()
    ssh_cmd "cd ${REMOTE_DIR} && docker compose restart backend"
    
    # Wait for backend to be ready
    sleep 5
    
    # Verify by checking tables
    echo "Current tables:"
    ssh_cmd "cd ${REMOTE_DIR} && docker compose exec -T db psql -U postgres -d consejo_redaccion -c '\dt'"
    
    echo -e "${GREEN}✅ Migration complete! Existing data preserved.${NC}"
}

do_db_reset() {
    echo -e "${RED}⚠️  WARNING: This will DELETE ALL DATA!${NC}"
    echo -e "${RED}   Consider using 'Backup Database' first!${NC}"
    read -p "Type 'DELETE' to confirm: " confirm
    if [ "$confirm" = "DELETE" ]; then
        ssh_cmd "cd ${REMOTE_DIR} && docker compose exec -T db psql -U postgres -c 'DROP DATABASE IF EXISTS consejo_redaccion;'"
        ssh_cmd "cd ${REMOTE_DIR} && docker compose exec -T db psql -U postgres -c 'CREATE DATABASE consejo_redaccion;'"
        ssh_cmd "cd ${REMOTE_DIR} && docker compose restart backend"
        echo -e "${GREEN}✅ Database reset complete!${NC}"
    else
        echo "Cancelled."
    fi
}

do_seed_users() {
    echo "Seeding users..."
    ssh_cmd "cd ${REMOTE_DIR} && docker compose exec -T backend python seed.py"
    echo -e "${GREEN}✅ Users seeded!${NC}"
}

do_backup() {
    local backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
    echo "Creating backup: ${backup_file}..."
    ssh_cmd "cd ${REMOTE_DIR} && docker compose exec -T db pg_dump -U postgres consejo_redaccion > ${backup_file}"
    echo -e "${GREEN}✅ Backup saved on server: ${REMOTE_DIR}/${backup_file}${NC}"
}

do_view_tables() {
    ssh_cmd "cd ${REMOTE_DIR} && docker compose exec -T db psql -U postgres -d consejo_redaccion -c '\dt'"
}

do_start() {
    ssh_cmd "cd ${REMOTE_DIR} && docker compose up -d"
    echo -e "${GREEN}✅ Services started!${NC}"
}

do_stop() {
    ssh_cmd "cd ${REMOTE_DIR} && docker compose down"
    echo -e "${YELLOW}⏹️ Services stopped${NC}"
}

do_restart() {
    ssh_cmd "cd ${REMOTE_DIR} && docker compose restart"
    echo -e "${GREEN}✅ Services restarted!${NC}"
}

do_status() {
    ssh_cmd "cd ${REMOTE_DIR} && docker compose ps"
}

do_check_ports() {
    echo "Checking ports..."
    echo "Frontend (${FRONTEND_PORT}):" && curl -s -o /dev/null -w "%{http_code}" "http://${SERVER_HOST}:${FRONTEND_PORT}" && echo ""
    echo "Backend (${BACKEND_PORT}):" && curl -s -o /dev/null -w "%{http_code}" "http://${SERVER_HOST}:${BACKEND_PORT}" && echo ""
}

do_logs() {
    echo "Select service: frontend/backend/db (or 'all'):"
    read service
    if [ "$service" = "all" ]; then
        ssh_cmd "cd ${REMOTE_DIR} && docker compose logs --tail=50"
    else
        ssh_cmd "cd ${REMOTE_DIR} && docker compose logs --tail=50 ${service}"
    fi
}

# Main Loop
while true; do
    show_menu
    read -p "Select option: " choice
    case $choice in
        1) do_deploy; read -p "Press enter to continue..." ;;
        2) do_quick_update; read -p "Press enter to continue..." ;;
        3)
            while true; do
                show_db_menu
                read -p "Select: " db_choice
                case $db_choice in
                    a) do_migrate ;;
                    b) do_db_reset ;;
                    c) do_seed_users ;;
                    d) do_backup ;;
                    e) do_view_tables ;;
                    x) break ;;
                esac
                read -p "Press enter to continue..."
            done
            ;;
        4)
            while true; do
                show_services_menu
                read -p "Select: " svc_choice
                case $svc_choice in
                    a) do_start ;;
                    b) do_stop ;;
                    c) do_restart ;;
                    d) do_status ;;
                    e) do_check_ports ;;
                    x) break ;;
                esac
                read -p "Press enter to continue..."
            done
            ;;
        5) do_logs; read -p "Press enter to continue..." ;;
        6) echo "Goodbye!"; exit 0 ;;
    esac
done
