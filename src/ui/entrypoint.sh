#!/bin/sh

cd /var/www

yarn

exec "$@"