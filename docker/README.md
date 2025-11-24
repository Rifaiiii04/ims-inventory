# Docker Commands Quick Reference

Koleksi perintah Docker yang sering digunakan untuk development.

## 🚀 Quick Start

```bash
# Start semua services
docker-compose up -d

# Stop semua services
docker-compose down

# Rebuild containers
docker-compose up -d --build
```

## 📋 Perintah Umum

### Services Management
```bash
docker-compose up -d          # Start services di background
docker-compose down            # Stop services
docker-compose restart        # Restart services
docker-compose ps             # Status services
docker-compose logs -f        # Lihat logs real-time
```

### Laravel Commands
```bash
docker-compose exec app php artisan migrate
docker-compose exec app php artisan db:seed
docker-compose exec app php artisan key:generate
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan tinker
```

### Dependencies
```bash
docker-compose exec app composer install
docker-compose exec app composer update
docker-compose exec app npm install
docker-compose exec app npm run dev
docker-compose exec app npm run build
```

### Container Shell
```bash
docker-compose exec app bash        # Laravel container
docker-compose exec mysql bash      # MySQL container
docker-compose exec ocr_service bash # OCR container
```

### Database
```bash
# Masuk ke MySQL
docker-compose exec mysql mysql -u angkringan_user -p angkringan_ims

# Backup
docker-compose exec mysql mysqldump -u angkringan_user -p angkringan_ims > backup.sql

# Restore
docker-compose exec -T mysql mysql -u angkringan_user -p angkringan_ims < backup.sql
```

## 🔧 Makefile (Linux/Mac)

Jika menggunakan Makefile:

```bash
make up              # Start services
make down            # Stop services
make logs            # View logs
make migrate         # Run migrations
make shell           # Enter Laravel container
make cache-clear     # Clear all caches
```

Lihat semua commands: `make help`

## 📊 Monitoring

### Portainer (Optional)
```bash
docker volume create portainer_data
docker run -d -p 9000:9000 --name=portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce
```

Akses: http://localhost:9000

## 🆘 Troubleshooting

### Port Conflict
Ubah port di `.env`:
```env
APP_PORT=8080
DB_PORT=3307
```

### Permission Issues
```bash
docker-compose exec app chmod -R 775 storage bootstrap/cache
```

### Rebuild Everything
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

