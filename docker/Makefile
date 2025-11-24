# Docker Makefile untuk kemudahan penggunaan
# Usage: make <command>

.PHONY: help up down restart build logs shell migrate seed test clean

help: ## Menampilkan bantuan
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## Start semua services
	docker-compose up -d

down: ## Stop semua services
	docker-compose down

restart: ## Restart semua services
	docker-compose restart

build: ## Build semua images
	docker-compose build

rebuild: ## Rebuild semua images tanpa cache
	docker-compose build --no-cache
	docker-compose up -d

logs: ## Lihat logs semua services
	docker-compose logs -f

logs-app: ## Lihat logs Laravel app
	docker-compose logs -f app

logs-nginx: ## Lihat logs Nginx
	docker-compose logs -f nginx

logs-mysql: ## Lihat logs MySQL
	docker-compose logs -f mysql

logs-ocr: ## Lihat logs OCR service
	docker-compose logs -f ocr_service

logs-n8n: ## Lihat logs n8n
	docker-compose logs -f n8n

shell: ## Masuk ke Laravel container
	docker-compose exec app bash

shell-mysql: ## Masuk ke MySQL container
	docker-compose exec mysql bash

shell-ocr: ## Masuk ke OCR service container
	docker-compose exec ocr_service bash

migrate: ## Jalankan migrations
	docker-compose exec app php artisan migrate

migrate-fresh: ## Fresh migration dengan seeding
	docker-compose exec app php artisan migrate:fresh --seed

seed: ## Jalankan seeders
	docker-compose exec app php artisan db:seed

test: ## Jalankan tests
	docker-compose exec app php artisan test

test-phpunit: ## Jalankan PHPUnit tests
	docker-compose exec app vendor/bin/phpunit

npm-install: ## Install NPM dependencies
	docker-compose exec app npm install

npm-dev: ## Run NPM dev (watch mode)
	docker-compose exec app npm run dev

npm-build: ## Build production assets
	docker-compose exec app npm run build

composer-install: ## Install Composer dependencies
	docker-compose exec app composer install

composer-update: ## Update Composer dependencies
	docker-compose exec app composer update

key-generate: ## Generate application key
	docker-compose exec app php artisan key:generate

cache-clear: ## Clear semua cache
	docker-compose exec app php artisan cache:clear
	docker-compose exec app php artisan config:clear
	docker-compose exec app php artisan route:clear
	docker-compose exec app php artisan view:clear

permissions: ## Fix storage permissions (Linux/Mac)
	docker-compose exec app chmod -R 775 storage bootstrap/cache
	docker-compose exec app chown -R www-data:www-data storage bootstrap/cache

clean: ## Hapus containers, networks, dan volumes (HATI-HATI!)
	docker-compose down -v
	docker system prune -f

status: ## Cek status semua services
	docker-compose ps

