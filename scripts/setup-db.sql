-- Base de datos local para Chrono (ejecutar como superusuario postgres)

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'chrono') THEN
    CREATE ROLE chrono WITH LOGIN PASSWORD 'chrono_secret';
  END IF;
END
$$;

SELECT 'CREATE DATABASE chrono OWNER chrono'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'chrono')\gexec

GRANT ALL PRIVILEGES ON DATABASE chrono TO chrono;
