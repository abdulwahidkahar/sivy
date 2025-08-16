# SIVY Deployment Guide

This guide covers deploying SIVY to production environments with best practices for security, performance, and reliability.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Server Requirements](#server-requirements)
- [Deployment Methods](#deployment-methods)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Web Server Configuration](#web-server-configuration)
- [Queue Workers](#queue-workers)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup Strategy](#backup-strategy)
- [Performance Optimization](#performance-optimization)
- [Security Hardening](#security-hardening)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying SIVY, ensure you have:

- **Server Access**: SSH access to your production server
- **Domain Name**: Configured domain pointing to your server
- **SSL Certificate**: Valid SSL certificate for HTTPS
- **Database**: MySQL 8.0+ or PostgreSQL 13+ instance
- **Redis**: Redis 6.x+ for caching and queues
- **Google Gemini API**: Valid API key for AI analysis
- **Email Service**: SMTP configuration for notifications

## Server Requirements

### Minimum Requirements

- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **Bandwidth**: 100 Mbps
- **OS**: Ubuntu 20.04+ or CentOS 8+

### Recommended Requirements

- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 100GB+ SSD
- **Bandwidth**: 1 Gbps
- **OS**: Ubuntu 22.04 LTS

### Software Requirements

- **PHP**: 8.2+
- **Node.js**: 18.x+
- **Composer**: Latest
- **Web Server**: Nginx 1.20+ or Apache 2.4+
- **Database**: MySQL 8.0+ or PostgreSQL 13+
- **Redis**: 6.x+
- **Supervisor**: For queue management

## Deployment Methods

### Method 1: Manual Deployment

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx mysql-server redis-server supervisor \
  php8.2 php8.2-fpm php8.2-mysql php8.2-redis php8.2-xml \
  php8.2-mbstring php8.2-curl php8.2-zip php8.2-gd \
  nodejs npm git unzip

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

#### 2. Application Deployment

```bash
# Create application directory
sudo mkdir -p /var/www/sivy
sudo chown $USER:$USER /var/www/sivy

# Clone repository
cd /var/www/sivy
git clone https://github.com/your-username/sivy.git .

# Install dependencies
composer install --no-dev --optimize-autoloader
npm ci
npm run build

# Set permissions
sudo chown -R www-data:www-data /var/www/sivy
sudo chmod -R 755 /var/www/sivy
sudo chmod -R 775 /var/www/sivy/storage
sudo chmod -R 775 /var/www/sivy/bootstrap/cache
```

#### 3. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure environment (see Environment Configuration section)
nano .env
```

### Method 2: Docker Deployment

#### 1. Docker Compose Setup

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: sivy-app
    restart: unless-stopped
    working_dir: /var/www
    volumes:
      - ./:/var/www
      - ./storage:/var/www/storage
    networks:
      - sivy-network
    depends_on:
      - database
      - redis

  nginx:
    image: nginx:alpine
    container_name: sivy-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./:/var/www
      - ./docker/nginx:/etc/nginx/conf.d
      - ./docker/ssl:/etc/ssl/certs
    networks:
      - sivy-network
    depends_on:
      - app

  database:
    image: mysql:8.0
    container_name: sivy-db
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: sivy
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_USER: ${DB_USERNAME}
    volumes:
      - db-data:/var/lib/mysql
    networks:
      - sivy-network

  redis:
    image: redis:7-alpine
    container_name: sivy-redis
    restart: unless-stopped
    networks:
      - sivy-network

  queue:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: sivy-queue
    restart: unless-stopped
    command: php artisan queue:work --sleep=3 --tries=3
    volumes:
      - ./:/var/www
    networks:
      - sivy-network
    depends_on:
      - database
      - redis

volumes:
  db-data:

networks:
  sivy-network:
    driver: bridge
```

#### 2. Production Dockerfile

```dockerfile
# Dockerfile.prod
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy application files
COPY . /var/www

# Install dependencies
RUN composer install --no-dev --optimize-autoloader
RUN npm ci && npm run build

# Set permissions
RUN chown -R www-data:www-data /var/www
RUN chmod -R 755 /var/www
RUN chmod -R 775 /var/www/storage
RUN chmod -R 775 /var/www/bootstrap/cache

# Expose port
EXPOSE 9000

CMD ["php-fpm"]
```

#### 3. Deploy with Docker

```bash
# Build and start containers
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose exec app php artisan migrate --force

# Cache configuration
docker-compose exec app php artisan config:cache
docker-compose exec app php artisan route:cache
docker-compose exec app php artisan view:cache
```

### Method 3: CI/CD with GitHub Actions

#### 1. GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: '8.2'
        extensions: mbstring, xml, ctype, iconv, intl, pdo_mysql, redis
        
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install PHP dependencies
      run: composer install --no-dev --optimize-autoloader
      
    - name: Install Node dependencies
      run: npm ci
      
    - name: Build assets
      run: npm run build
      
    - name: Run tests
      run: php artisan test
      
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/sivy
          git pull origin main
          composer install --no-dev --optimize-autoloader
          npm ci
          npm run build
          php artisan migrate --force
          php artisan config:cache
          php artisan route:cache
          php artisan view:cache
          sudo systemctl reload php8.2-fpm
          sudo systemctl reload nginx
```

## Environment Configuration

### Production .env File

```env
# Application
APP_NAME="SIVY"
APP_ENV=production
APP_KEY=base64:your-generated-key
APP_DEBUG=false
APP_URL=https://your-domain.com

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sivy_production
DB_USERNAME=sivy_user
DB_PASSWORD=secure_password

# Cache & Sessions
CACHE_DRIVER=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=120
SESSION_ENCRYPT=true
SESSION_PATH=/
SESSION_DOMAIN=your-domain.com

# Queue
QUEUE_CONNECTION=redis

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=redis_password
REDIS_PORT=6379

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="SIVY"

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# File Storage
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=sivy-production
AWS_USE_PATH_STYLE_ENDPOINT=false

# Logging
LOG_CHANNEL=stack
LOG_STACK=single,slack
LOG_LEVEL=error

# Monitoring
SENTRY_LARAVEL_DSN=your_sentry_dsn

# Security
SESSION_SECURE_COOKIE=true
SANCTUM_STATEFUL_DOMAINS=your-domain.com
```

## Database Setup

### MySQL Configuration

```sql
-- Create database and user
CREATE DATABASE sivy_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sivy_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON sivy_production.* TO 'sivy_user'@'localhost';
FLUSH PRIVILEGES;
```

### PostgreSQL Configuration

```sql
-- Create database and user
CREATE DATABASE sivy_production;
CREATE USER sivy_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE sivy_production TO sivy_user;
```

### Run Migrations

```bash
# Run migrations
php artisan migrate --force

# Seed database (optional)
php artisan db:seed --force
```

## Web Server Configuration

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/sivy
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    root /var/www/sivy/public;
    index index.php;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/your-domain.com.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # File Upload Limits
    client_max_body_size 50M;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Static Files Caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|txt|tar|gz)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # PHP Processing
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ /(storage|bootstrap/cache) {
        deny all;
    }
}
```

### Apache Configuration

```apache
# /etc/apache2/sites-available/sivy.conf
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias www.your-domain.com
    Redirect permanent / https://your-domain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName your-domain.com
    ServerAlias www.your-domain.com
    DocumentRoot /var/www/sivy/public

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/your-domain.com.crt
    SSLCertificateKeyFile /etc/ssl/private/your-domain.com.key
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384

    # Security Headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

    # PHP Configuration
    <FilesMatch \.php$>
        SetHandler "proxy:unix:/var/run/php/php8.2-fpm.sock|fcgi://localhost"
    </FilesMatch>

    # Directory Configuration
    <Directory /var/www/sivy/public>
        AllowOverride All
        Require all granted
    </Directory>

    # Deny access to sensitive directories
    <Directory /var/www/sivy/storage>
        Require all denied
    </Directory>

    <Directory /var/www/sivy/bootstrap/cache>
        Require all denied
    </Directory>
</VirtualHost>
```

## Queue Workers

### Supervisor Configuration

```ini
# /etc/supervisor/conf.d/sivy-worker.conf
[program:sivy-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/sivy/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/sivy/storage/logs/worker.log
stopwaitsecs=3600
```

### Start Supervisor

```bash
# Update supervisor configuration
sudo supervisorctl reread
sudo supervisorctl update

# Start workers
sudo supervisorctl start sivy-worker:*

# Check status
sudo supervisorctl status
```

## SSL/TLS Configuration

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Custom SSL Certificate

```bash
# Copy certificate files
sudo cp your-domain.com.crt /etc/ssl/certs/
sudo cp your-domain.com.key /etc/ssl/private/

# Set permissions
sudo chmod 644 /etc/ssl/certs/your-domain.com.crt
sudo chmod 600 /etc/ssl/private/your-domain.com.key
```

## Monitoring and Logging

### Application Monitoring

```bash
# Install monitoring tools
composer require sentry/sentry-laravel

# Configure Sentry
php artisan sentry:publish --dsn=your_sentry_dsn
```

### Log Management

```bash
# Configure log rotation
sudo nano /etc/logrotate.d/sivy

# Add configuration:
/var/www/sivy/storage/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

### System Monitoring

```bash
# Install monitoring stack
sudo apt install prometheus node-exporter grafana

# Configure Prometheus
sudo nano /etc/prometheus/prometheus.yml
```

## Backup Strategy

### Database Backup

```bash
#!/bin/bash
# /usr/local/bin/backup-sivy.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/sivy"
DB_NAME="sivy_production"
DB_USER="sivy_user"
DB_PASS="secure_password"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Application files backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/sivy/storage

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://your-backup-bucket/
aws s3 cp $BACKUP_DIR/files_$DATE.tar.gz s3://your-backup-bucket/

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
```

### Automated Backups

```bash
# Add to crontab
sudo crontab -e

# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-sivy.sh
```

## Performance Optimization

### PHP-FPM Optimization

```ini
# /etc/php/8.2/fpm/pool.d/www.conf
[www]
user = www-data
group = www-data
listen = /var/run/php/php8.2-fpm.sock
listen.owner = www-data
listen.group = www-data
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.process_idle_timeout = 10s
pm.max_requests = 500
```

### MySQL Optimization

```ini
# /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
innodb_buffer_pool_size = 2G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
query_cache_type = 1
query_cache_size = 256M
max_connections = 200
```

### Redis Optimization

```ini
# /etc/redis/redis.conf
maxmemory 1gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### Laravel Optimization

```bash
# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Optimize autoloader
composer dump-autoload --optimize

# Enable OPcache
echo "opcache.enable=1" >> /etc/php/8.2/fpm/php.ini
echo "opcache.memory_consumption=256" >> /etc/php/8.2/fpm/php.ini
echo "opcache.max_accelerated_files=20000" >> /etc/php/8.2/fpm/php.ini
```

## Security Hardening

### Server Security

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
# Set: PasswordAuthentication no

# Install fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

### Application Security

```bash
# Set secure file permissions
sudo chown -R www-data:www-data /var/www/sivy
sudo find /var/www/sivy -type f -exec chmod 644 {} \;
sudo find /var/www/sivy -type d -exec chmod 755 {} \;
sudo chmod -R 775 /var/www/sivy/storage
sudo chmod -R 775 /var/www/sivy/bootstrap/cache

# Secure environment file
sudo chmod 600 /var/www/sivy/.env
```

## Troubleshooting

### Common Issues

#### 1. Queue Jobs Not Processing

```bash
# Check supervisor status
sudo supervisorctl status

# Restart workers
sudo supervisorctl restart sivy-worker:*

# Check logs
tail -f /var/www/sivy/storage/logs/worker.log
```

#### 2. High Memory Usage

```bash
# Check PHP memory limit
php -i | grep memory_limit

# Monitor processes
top -p $(pgrep -d',' php)

# Optimize PHP-FPM
sudo nano /etc/php/8.2/fpm/pool.d/www.conf
```

#### 3. Database Connection Issues

```bash
# Test database connection
php artisan tinker
>>> DB::connection()->getPdo();

# Check MySQL status
sudo systemctl status mysql

# Review MySQL logs
sudo tail -f /var/log/mysql/error.log
```

#### 4. SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in /etc/ssl/certs/your-domain.com.crt -text -noout

# Test SSL configuration
ssl-cert-check -c /etc/ssl/certs/your-domain.com.crt

# Renew Let's Encrypt certificate
sudo certbot renew --dry-run
```

### Performance Issues

#### 1. Slow Response Times

```bash
# Enable query logging
php artisan db:monitor

# Profile application
composer require barryvdh/laravel-debugbar --dev

# Check server resources
htop
iotop
```

#### 2. High CPU Usage

```bash
# Identify processes
top -c

# Check PHP-FPM status
sudo systemctl status php8.2-fpm

# Monitor queue workers
ps aux | grep queue:work
```

### Log Analysis

```bash
# Application logs
tail -f /var/www/sivy/storage/logs/laravel.log

# Web server logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -f
```

## Maintenance

### Regular Maintenance Tasks

```bash
#!/bin/bash
# /usr/local/bin/sivy-maintenance.sh

# Clear expired sessions
php /var/www/sivy/artisan session:gc

# Clear old logs
find /var/www/sivy/storage/logs -name "*.log" -mtime +30 -delete

# Optimize database
mysql -u sivy_user -p sivy_production -e "OPTIMIZE TABLE analyses, resumes, roles, skills;"

# Clear application cache
php /var/www/sivy/artisan cache:clear
php /var/www/sivy/artisan view:clear

# Restart services
sudo systemctl reload php8.2-fpm
sudo systemctl reload nginx
```

### Update Process

```bash
# 1. Backup current version
/usr/local/bin/backup-sivy.sh

# 2. Put application in maintenance mode
php artisan down

# 3. Update code
git pull origin main
composer install --no-dev --optimize-autoloader
npm ci && npm run build

# 4. Run migrations
php artisan migrate --force

# 5. Clear caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 6. Restart services
sudo supervisorctl restart sivy-worker:*
sudo systemctl reload php8.2-fpm

# 7. Bring application back online
php artisan up
```

---

**Last Updated**: January 2024  
**Version**: 1.0