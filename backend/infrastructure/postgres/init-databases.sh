#!/bin/bash
set -e

for db in spicyeat_auth spicyeat_user spicyeat_menu spicyeat_cart spicyeat_order spicyeat_payment spicyeat_delivery spicyeat_notification; do
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    SELECT 'CREATE DATABASE $db OWNER $POSTGRES_USER'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$db')\gexec
EOSQL
done
