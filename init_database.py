import os
import sys
import time
import psycopg2
import subprocess

# Database connection details
DB_NAME_DEFAULT = "postgres"
DB_NAME = "sigma"
DB_USER = "postgres"
DB_PASS = "admin"
DB_HOST = "localhost"
DB_PORT = "5432"

# SQL create tables
CREATE_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS Types (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS Honeytokens (
    token_id VARCHAR PRIMARY KEY,
    group_id VARCHAR,
    type_id INT REFERENCES Types(type_id),
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expire_date TIMESTAMP,
    notes TEXT,
    data TEXT
);

CREATE TABLE IF NOT EXISTS Alerts (
    alert_id VARCHAR PRIMARY KEY,
    token_id VARCHAR REFERENCES Honeytokens(token_id),
    alert_grade INT,
    alert_date DATE,
    alert_time TIME,
    access_ip VARCHAR,
    log TEXT
);

CREATE TABLE IF NOT EXISTS Whitelist (
    token_id VARCHAR REFERENCES Honeytokens(token_id),
    access_ip VARCHAR,
    username  VARCHAR,
    PRIMARY KEY (token_id, access_ip)
);
"""

def is_postgresql_running():
    """Check if PostgreSQL is running on Windows or Linux/macOS."""
    try:
        # Try connecting to PostgreSQL
        conn = psycopg2.connect(dbname=DB_NAME_DEFAULT, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
        conn.close()
        return True  # Connection successful, PostgreSQL is running
    except:
        return False  # Connection failed, PostgreSQL is not running

def get_postgresql_service_name():
    """Return the known PostgreSQL service name."""
    return "postgresql-x64-17"


def install_postgresql():
    """Checks if PostgreSQL is installed and running, and installs it if necessary."""
    try:
        if is_postgresql_running():
            print("[✔] PostgreSQL is already running. Skipping installation.")
            return
        
        print("[+] Checking for PostgreSQL installation on Windows...")
        
        if sys.platform == "win32":
            service_name = get_postgresql_service_name()
            
            if service_name:
                print(f"[✔] Found PostgreSQL service: {service_name}")

                # Check if service is running
                pg_service_status = subprocess.run(["sc", "query", service_name], capture_output=True, text=True)
                
                if "RUNNING" in pg_service_status.stdout:
                    print("[✔] PostgreSQL service is running.")
                else:
                    print("[!] PostgreSQL service is installed but not running. Trying to start it...")
                    subprocess.run(["net", "start", service_name], shell=True)
                    time.sleep(3)
                    
                    if is_postgresql_running():
                        print("[✔] PostgreSQL is now running.")
                        return
                    else:
                        print("[!] Failed to start PostgreSQL. Please start it manually from 'services.msc'.")
                        sys.exit(1)
            else:
                print("[!] PostgreSQL service not found. Please install PostgreSQL manually.")
                sys.exit(1)

        elif sys.platform.startswith("linux"):
            subprocess.run(["sudo", "apt", "update"], check=True)
            subprocess.run(["sudo", "apt", "install", "-y", "postgresql", "postgresql-contrib"], check=True)
            subprocess.run(["sudo", "systemctl", "start", "postgresql"], check=True)
            subprocess.run(["sudo", "systemctl", "enable", "postgresql"], check=True)

        elif sys.platform == "darwin":  # macOS
            subprocess.run(["brew", "install", "postgresql"], check=True)
            subprocess.run(["brew", "services", "start", "postgresql"], check=True)

        print("[+] PostgreSQL installation check completed.")

    except subprocess.CalledProcessError as e:
        print(f"[!] Error installing PostgreSQL: {e}")
        sys.exit(1)

def setup_database():
    """Creates the PostgreSQL database and user if they do not exist."""
    try:
        print("[+] Setting up the database...")

        # Connect to PostgreSQL default database
        conn = psycopg2.connect(dbname=DB_NAME_DEFAULT, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
        conn.autocommit = True
        cursor = conn.cursor()

        # Create user if not exists
        cursor.execute(f"SELECT 1 FROM pg_roles WHERE rolname='{DB_USER}';")
        if not cursor.fetchone():
            cursor.execute(f"CREATE USER {DB_USER} WITH PASSWORD '{DB_PASS}';")
            print(f"[+] Created user {DB_USER}")

        # Create database if not exists
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname='{DB_NAME}';")
        if not cursor.fetchone():
            cursor.execute(f"CREATE DATABASE {DB_NAME} OWNER {DB_USER};")
            print(f"[+] Created database {DB_NAME}")

        # Grant privileges
        cursor.execute(f"GRANT ALL PRIVILEGES ON DATABASE {DB_NAME} TO {DB_USER};")

        cursor.close()
        conn.close()
    except Exception as e:
        print(f"[!] Error setting up the database: {e}")
        sys.exit(1)

def initialize_database():
    """Initializes the database by creating tables."""
    try:
        print("[+] Initializing database schema...")
        conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)
        conn.autocommit = True
        cursor = conn.cursor()

        # Create tables
        cursor.execute(CREATE_TABLES_SQL)
        print("[✔] Tables created successfully!")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"[!] Error initializing database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    install_postgresql()   # Step 1: Check and install PostgreSQL if needed
    time.sleep(5)          # Wait a few seconds for stability
    setup_database()       # Step 2: Create DB & User
    initialize_database()  # Step 3: Initialize tables

    print("[✅] PostgreSQL database setup complete!")
