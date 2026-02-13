FROM php:8.3-cli

WORKDIR /app/apps/api-symfony

RUN apt-get update \
    && apt-get install -y git unzip libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY apps/api-symfony/composer.json ./composer.json
COPY apps/api-symfony/.env.example ./.env.example
RUN composer install --no-interaction --prefer-dist || true

COPY apps/api-symfony .

EXPOSE 8000
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
