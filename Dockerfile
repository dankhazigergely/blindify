FROM webdevops/php-nginx:8.2-alpine

WORKDIR /app

# Laravel kód bemásolása (benne a public is!)
COPY php-backend/blindify-backend/ ./

# Függőségek telepítése
RUN composer install --no-dev --optimize-autoloader

# Jogosultságok beállítása (storage és cache írható legyen)
RUN chown -R application:application storage bootstrap/cache

# .env másolása (ha kell)
# COPY php-backend/blindify-backend/.env .env

# Laravel public mappa legyen a web root
ENV WEB_DOCUMENT_ROOT=/app/public

EXPOSE 80