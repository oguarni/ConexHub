#!/bin/bash
# =====================================
# Docker Build Script - Optimized
# =====================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUILD_ENV="${1:-production}"
NO_CACHE="${2:-false}"
REGISTRY="${DOCKER_REGISTRY:-localhost}"

echo -e "${BLUE}🏗️  Building Docker images for environment: ${BUILD_ENV}${NC}"

# Function to build image with error handling
build_image() {
    local service=$1
    local dockerfile=$2
    local context=$3
    local tag="${REGISTRY}/b2b-${service}:${BUILD_ENV}"
    
    echo -e "${YELLOW}📦 Building ${service} image...${NC}"
    
    local build_args=""
    if [ "$NO_CACHE" = "true" ]; then
        build_args="--no-cache"
    fi
    
    if docker build ${build_args} \
        -f "${context}/${dockerfile}" \
        -t "${tag}" \
        --target production \
        "${context}/"; then
        echo -e "${GREEN}✅ ${service} build completed successfully${NC}"
        
        # Show image size
        local size=$(docker images --format "table {{.Size}}" "${tag}" | tail -n +2)
        echo -e "${BLUE}📏 Image size: ${size}${NC}"
    else
        echo -e "${RED}❌ ${service} build failed${NC}"
        exit 1
    fi
}

# Function to analyze image
analyze_image() {
    local service=$1
    local tag="${REGISTRY}/b2b-${service}:${BUILD_ENV}"
    
    echo -e "${YELLOW}🔍 Analyzing ${service} image...${NC}"
    
    # Show layer information
    echo "📋 Layer breakdown:"
    docker history "${tag}" --format "table {{.CreatedBy}}\t{{.Size}}" | head -10
    
    # Security scan (if available)
    if command -v docker-scout &> /dev/null; then
        echo "🛡️  Security scan:"
        docker scout quickview "${tag}" || echo "Security scan unavailable"
    fi
}

# Main build process
main() {
    echo -e "${BLUE}🚀 Starting optimized Docker build process${NC}"
    echo -e "${BLUE}Environment: ${BUILD_ENV}${NC}"
    echo -e "${BLUE}No cache: ${NO_CACHE}${NC}"
    echo ""
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running${NC}"
        exit 1
    fi
    
    # Build backend
    build_image "backend" "Dockerfile" "backend"
    
    # Build frontend
    build_image "frontend" "Dockerfile" "frontend"
    
    echo ""
    echo -e "${GREEN}🎉 All images built successfully!${NC}"
    
    # Show total size
    local total_size=$(docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep "b2b-" | grep "${BUILD_ENV}")
    echo ""
    echo -e "${BLUE}📊 Built images:${NC}"
    echo "${total_size}"
    
    # Optional analysis
    if [ "$BUILD_ENV" = "production" ]; then
        echo ""
        echo -e "${YELLOW}🔍 Running image analysis...${NC}"
        analyze_image "backend"
        analyze_image "frontend"
    fi
    
    echo ""
    echo -e "${GREEN}✅ Build process completed successfully!${NC}"
    echo -e "${BLUE}💡 Next steps:${NC}"
    echo "   • Run: docker-compose -f docker-compose.${BUILD_ENV}.yml up -d"
    echo "   • Test: scripts/test-deployment.sh"
    echo "   • Deploy: scripts/deploy.sh ${BUILD_ENV}"
}

# Help function
show_help() {
    echo "Docker Build Script - Multi-Stage Optimization"
    echo ""
    echo "Usage: $0 [environment] [no-cache]"
    echo ""
    echo "Arguments:"
    echo "  environment    Build environment (development|production) [default: production]"
    echo "  no-cache      Use --no-cache flag (true|false) [default: false]"
    echo ""
    echo "Examples:"
    echo "  $0                          # Build production with cache"
    echo "  $0 development              # Build development with cache"
    echo "  $0 production true          # Build production without cache"
    echo ""
    echo "Environment Variables:"
    echo "  DOCKER_REGISTRY    Docker registry URL [default: localhost]"
}

# Handle arguments
case "$1" in
    -h|--help)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac