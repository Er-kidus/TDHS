.PHONY: help dev build test lint migrate clean

SHELL := /bin/bash

help: ## Show this help
@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# ── Development ──────────────────────────────
dev: ## Start local development stack
docker compose up -d postgres redis kafka
@echo "Infrastructure ready. Start services individually."

dev-all: ## Start complete stack with all services
docker compose up -d

# ── Build ────────────────────────────────────
build-gateway: ## Build API gateway
docker build -t tenadam/api-gateway:latest gateway/api-gateway

build-web: ## Build web app
docker build -t tenadam/web:latest apps/web

build-superadmin-web: ## Build super-admin portal web app
	docker build -t tenadam/superadmin-portal:latest apps/web

build-all: ## Build all Docker images
@bash infrastructure/scripts/build-all.sh

# ── Testing ──────────────────────────────────
test-go: ## Run Go tests across all services
@find services gateway -name "go.mod" -execdir go test ./... \;

test-web: ## Run web app tests
cd apps/web && npm test

dev-superadmin-web: ## Start super-admin portal web app
	cd apps/web && npm run dev

# ── Database ─────────────────────────────────
migrate: ## Run database migrations
@bash infrastructure/scripts/migrate.sh

seed: ## Seed database with test data
	@bash infrastructure/scripts/seed.sh

# ── Lint ─────────────────────────────────────
lint-go: ## Lint all Go code
@find services gateway -name "go.mod" -execdir golangci-lint run \;

lint-web: ## Lint web app
cd apps/web && npm run lint

# ── Clean ────────────────────────────────────
clean: ## Remove build artifacts
docker compose down -v
find . -name "*.test" -delete

# ── Infrastructure ───────────────────────────
k8s-apply-dev: ## Apply Kubernetes dev manifests
kubectl apply -k infrastructure/k8s/overlays/dev

k8s-apply-prod: ## Apply Kubernetes production manifests
kubectl apply -k infrastructure/k8s/overlays/production

# ── Codegen ──────────────────────────────────
new-service: ## Scaffold new Go service (name=service-name)
@go run tools/cli/cmd/root.go new-service $(name)
