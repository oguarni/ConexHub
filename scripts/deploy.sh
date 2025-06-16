#!/bin/bash
# =====================================
# Docker Deployment Script - Production Ready
# =====================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${1:-production}"
COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"
BACKUP_DIR="./backups/$(date +%Y-%m-%d_%H-%M-%S)"
HEALTH_CHECK_TIMEOUT=120

echo -e "${BLUE}🚀 Starting deployment to ${ENVIRONMENT} environment${NC}"

# Function to create backup
create_backup() {
    echo -e "${YELLOW}💾 Creating backup...${NC}"
    
    mkdir -p "${BACKUP_DIR}"
    
    # Backup database
    if docker-compose -f "${COMPOSE_FILE}" ps postgres | grep -q "Up"; then
        echo "📊 Backing up database..."
        docker-compose -f "${COMPOSE_FILE}" exec -T postgres pg_dump \
            -U postgres -d b2b_marketplace > "${BACKUP_DIR}/database.sql"
    fi
    
    # Backup volumes
    echo "📁 Backing up volumes..."
    docker run --rm -v "$(pwd)":/backup \
        -v b2b_postgres_data:/data \
        alpine tar czf "/backup/${BACKUP_DIR}/postgres_data.tar.gz" -C /data .
    
    echo -e "${GREEN}✅ Backup created at ${BACKUP_DIR}${NC}"
}

# Function to wait for health checks
wait_for_health() {
    local service=$1
    local timeout=$2
    local count=0
    
    echo -e "${YELLOW}⏳ Waiting for ${service} to be healthy...${NC}"
    
    while [ $count -lt $timeout ]; do
        if docker-compose -f "${COMPOSE_FILE}" ps "${service}" | grep -q "healthy"; then
            echo -e "${GREEN}✅ ${service} is healthy${NC}"
            return 0
        fi
        
        sleep 1
        count=$((count + 1))
        
        if [ $((count % 10)) -eq 0 ]; then
            echo -e "${BLUE}⏳ Still waiting... (${count}s/${timeout}s)${NC}"
        fi
    done
    
    echo -e "${RED}❌ ${service} health check timeout${NC}"
    return 1
}

# Function to verify deployment
verify_deployment() {
    echo -e "${YELLOW}🔍 Verifying deployment...${NC}"
    
    # Check all services are running
    local services=("postgres" "redis" "backend" "frontend")
    
    for service in "${services[@]}"; do
        if docker-compose -f "${COMPOSE_FILE}" ps "${service}" | grep -q "Up"; then
            echo -e "${GREEN}✅ ${service} is running${NC}"
        else
            echo -e "${RED}❌ ${service} is not running${NC}"
            return 1
        fi
    done
    
    # Test endpoints
    echo "🌐 Testing endpoints..."
    
    # Backend health check
    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend health check passed${NC}"
    else
        echo -e "${RED}❌ Backend health check failed${NC}"
        return 1
    fi
    
    # Frontend health check
    if curl -f http://localhost:3000/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend health check passed${NC}"
    else
        echo -e "${RED}❌ Frontend health check failed${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ All verification checks passed${NC}"
}

# Function to rollback
rollback() {
    echo -e "${RED}🔄 Rolling back deployment...${NC}"
    
    # Stop current containers
    docker-compose -f "${COMPOSE_FILE}" down
    
    # Restore from latest backup
    local latest_backup=$(ls -t backups/ | head -n1)
    if [ -n "$latest_backup" ]; then
        echo -e "${YELLOW}📥 Restoring from backup: ${latest_backup}${NC}"
        
        # Restore database
        if [ -f "backups/${latest_backup}/database.sql" ]; then
            docker-compose -f "${COMPOSE_FILE}" up -d postgres
            sleep 10
            docker-compose -f "${COMPOSE_FILE}" exec -T postgres psql \
                -U postgres -d b2b_marketplace < "backups/${latest_backup}/database.sql"
        fi
        
        # Restore volumes
        if [ -f "backups/${latest_backup}/postgres_data.tar.gz" ]; then
            docker run --rm -v "$(pwd)":/backup \
                -v b2b_postgres_data:/data \
                alpine tar xzf "/backup/backups/${latest_backup}/postgres_data.tar.gz" -C /data
        fi
    fi
    
    echo -e "${GREEN}✅ Rollback completed${NC}"
}

# Function to show deployment status
show_status() {
    echo -e "${BLUE}📊 Deployment Status${NC}"
    echo ""
    
    # Show running containers
    docker-compose -f "${COMPOSE_FILE}" ps
    
    echo ""
    echo -e "${BLUE}📈 Resource Usage${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
    
    echo ""
    echo -e "${BLUE}📋 Recent Logs${NC}"
    docker-compose -f "${COMPOSE_FILE}" logs --tail=10
}

# Main deployment process
main() {
    echo -e "${BLUE}🚀 B2B Marketplace Deployment${NC}"
    echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
    echo -e "${BLUE}Compose file: ${COMPOSE_FILE}${NC}"
    echo ""
    
    # Check if compose file exists
    if [ ! -f "${COMPOSE_FILE}" ]; then
        echo -e "${RED}❌ Compose file ${COMPOSE_FILE} not found${NC}"
        exit 1
    fi
    
    # Create backup if production
    if [ "${ENVIRONMENT}" = "production" ]; then
        create_backup
    fi
    
    # Pull latest images
    echo -e "${YELLOW}📥 Pulling latest images...${NC}"
    docker-compose -f "${COMPOSE_FILE}" pull
    
    # Stop existing containers
    echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
    docker-compose -f "${COMPOSE_FILE}" down
    
    # Start new containers
    echo -e "${YELLOW}🚀 Starting new containers...${NC}"
    docker-compose -f "${COMPOSE_FILE}" up -d
    
    # Wait for services to be healthy
    echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
    
    # Wait for database
    if ! wait_for_health "postgres" 60; then
        echo -e "${RED}❌ Database failed to start${NC}"
        rollback
        exit 1
    fi
    
    # Wait for backend
    if ! wait_for_health "backend" "${HEALTH_CHECK_TIMEOUT}"; then
        echo -e "${RED}❌ Backend failed to start${NC}"
        rollback
        exit 1
    fi
    
    # Wait for frontend
    if ! wait_for_health "frontend" 60; then
        echo -e "${RED}❌ Frontend failed to start${NC}"
        rollback
        exit 1
    fi
    
    # Verify deployment
    if ! verify_deployment; then
        echo -e "${RED}❌ Deployment verification failed${NC}"
        rollback
        exit 1
    fi
    
    # Show final status
    show_status
    
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${BLUE}💡 Useful commands:${NC}"
    echo "   • View logs: docker-compose -f ${COMPOSE_FILE} logs -f"
    echo "   • Check status: docker-compose -f ${COMPOSE_FILE} ps"
    echo "   • Stop services: docker-compose -f ${COMPOSE_FILE} down"
    echo "   • Update: scripts/deploy.sh ${ENVIRONMENT}"
}

# Function to show help
show_help() {
    echo "Docker Deployment Script"
    echo ""
    echo "Usage: $0 [environment]"
    echo ""
    echo "Arguments:"
    echo "  environment    Target environment (development|production) [default: production]"
    echo ""
    echo "Examples:"
    echo "  $0                    # Deploy to production"
    echo "  $0 development        # Deploy to development"
    echo "  $0 production         # Deploy to production with backup"
    echo ""
    echo "Features:"
    echo "  • Automatic backup creation (production)"
    echo "  • Health check monitoring"
    echo "  • Automatic rollback on failure"
    echo "  • Deployment verification"
}

# Handle arguments
case "$1" in
    -h|--help)
        show_help
        exit 0
        ;;
    status)
        show_status
        exit 0
        ;;
    rollback)
        rollback
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac