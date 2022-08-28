## Feel Free to update this file, but please leave notes on any changes you make in your readme file

FROM php:8.1-fpm

# Arguments defined in docker-compose.yml
ARG user
ARG uid

# timezone environment
ENV TZ=UTC \
  # locale
  LANG=en_US.UTF-8 \
  LANGUAGE=en_US:en \
  LC_ALL=en_US.UTF-8 \
  # composer environment
  COMPOSER_ALLOW_SUPERUSER=1 \
  COMPOSER_HOME=/composer

# https://benpetering.com/posts/2020/10/25/php-and-postgres-with-docker.html
RUN apt-get update && apt-get install -y libpq-dev libicu-dev \
  libonig-dev libzip-dev libpng-dev libwebp-dev libjpeg-dev libfreetype6-dev \
  exiftool uuid-dev libffi-dev unzip locales git zip

# Must be after apt-get (installing required libraries
RUN locale-gen en_US.UTF-8 \
  && localedef -f UTF-8 -i en_US en_US.UTF-8

# Setup all PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql \
  && ln -s /usr/local/etc/php/php.ini-production /usr/local/etc/php/php.ini \
  && docker-php-ext-configure intl \
  && docker-php-ext-install intl \
  && docker-php-ext-configure gd \
    --with-webp=/usr/include/ \
    --with-freetype=/usr/include/ \
    --with-jpeg=/usr/include/ \
  && docker-php-ext-install gd \
  && docker-php-ext-install fileinfo \
  && pecl install -f uuid \
  && docker-php-ext-enable uuid \
  && docker-php-ext-configure exif \
  && docker-php-ext-install exif \
  && docker-php-ext-enable exif \
  # Install/Enable FFI which speeds up php
  && docker-php-ext-configure ffi --with-ffi \
  && docker-php-ext-install ffi \
  # Install/Enable Data Structures
  && pecl install ds \ 
  && docker-php-ext-enable ds\
  # Install/Enable Xdebug
  && pecl install xdebug \
  && docker-php-ext-enable xdebug

RUN curl --silent --show-error https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Create system user to run Composer and Artisan Commands
RUN useradd -G www-data,root -u $uid -d /home/$user $user \
  && mkdir -p /home/$user/.composer \
  && mkdir -p /composer/cache/files \
  && chown -R $user:$user /home/$user

# Set working directory
WORKDIR /var/www

USER $user
