# PostgreSQL Configuration & Management Study Guide

PostgreSQL is a powerful, open-source object-relational database system. Effective administration requires a deep understanding of its configuration, user management, and essential command-line tools. This guide will cover the core aspects of managing a PostgreSQL server.

## 1. Server Configuration (`postgresql.conf`)

The `postgresql.conf` file is the primary configuration file for your PostgreSQL server. It controls global parameters that affect the server's behavior, performance, and resource usage. Changes to this file typically require a server restart or reload to take effect.

### Key Parameters:

*   `listen_addresses`: Specifies the TCP/IP address(es) on which the server is to listen for incoming connections. Use `'*'` to listen on all available interfaces.
*   `port`: The TCP port number the server listens on (default is 5432).
*   `max_connections`: The maximum number of concurrent connections to the database server.
*   `shared_buffers`: The amount of shared memory used by the database server (e.g., `256MB`). Crucial for performance.
*   `data_directory`: The location of the database cluster's data files (read-only in this file).
*   `log_destination`: Where server logs are sent (e.g., `stderr`, `csvlog`).

### Configuration Example:

```ini
# postgresql.conf snippet
listen_addresses = 'localhost'    # what IP address(es) to listen on;
                                  # comma-separated list of addresses;
                                  # defaults to 'localhost'; use '*' for all
port = 5432                       # (change requires restart)
max_connections = 100             # (change requires restart)
shared_buffers = 1GB              # min 128kB
log_destination = 'stderr'
```

## 2. Client Authentication (`pg_hba.conf`)

The `pg_hba.conf` (Host-Based Authentication) file controls which hosts are allowed to connect, which PostgreSQL users they can connect as, and which authentication method is used. This is a critical security file.

### File Structure:

Each line in `pg_hba.conf` specifies an authentication rule with the following fields:

`TYPE DATABASE USER ADDRESS METHOD [OPTIONS]`

*   **TYPE**: `local` (for Unix-domain sockets), `host` (for TCP/IP connections), `hostssl` (for SSL encrypted TCP/IP), `hostnossl` (for non-SSL TCP/IP).
*   **DATABASE**: Which database(s) the rule applies to (`all`, `sameuser`, `samerole`, or a specific database name).
*   **USER**: Which user(s) the rule applies to (`all`, `samegroup`, or a specific username).
*   **ADDRESS**: The client IP address(es) allowed to connect (e.g., `127.0.0.1/32` for localhost, `0.0.0.0/0` for all IP addresses).
*   **METHOD**: The authentication method (e.g., `trust`, `reject`, `md5`, `scram-sha-256`, `ident`, `peer`).

### Authentication Methods:

*   `trust`: Connects without a password (use with extreme caution, typically only for `local`).
*   `reject`: Explicitly rejects the connection.
*   `md5` / `scram-sha-256`: Requires password authentication, `scram-sha-256` is more secure.
*   `ident` / `peer`: Authenticates using the client's operating system username.

### Configuration Example:

```ini
# pg_hba.conf snippet
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     peer
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             0.0.0.0/0               md5
```

## 3. User and Role Management

PostgreSQL uses the concept of "roles" to manage both users and groups. A role can have login privileges (making it a user) and/or memberships in other roles (making it a group).

### Creating Roles (Users):

```sql
CREATE ROLE my_admin_user WITH LOGIN PASSWORD 'strong_password';
CREATE ROLE app_user WITH LOGIN PASSWORD 'another_strong_password';

-- Create a superuser role (use with caution!)
CREATE ROLE superuser_role WITH LOGIN SUPERUSER PASSWORD 'very_strong_password';

-- Grant specific permissions later
GRANT my_admin_user TO postgres; -- Example: Grant membership to postgres role
```

### Modifying and Deleting Roles:

```sql
ALTER ROLE app_user RENAME TO new_app_user;
ALTER ROLE my_admin_user WITH NOSUPERUSER;
DROP ROLE app_user;
```

## 4. Database Creation

Creating databases is a fundamental administrative task. Each database is a separate collection of tables, functions, and other objects.

### Creating a Database:

```sql
CREATE DATABASE my_new_database OWNER my_admin_user TEMPLATE template0 ENCODING 'UTF8';

-- Example for a simple database
CREATE DATABASE sales_db OWNER app_user;
```

## 5. Object Privileges

After creating users and databases, you need to grant specific privileges on database objects (tables, schemas, functions, etc.) to control access.

### Granting and Revoking Privileges:

```sql
-- Grant all privileges on a table to a user
GRANT ALL PRIVILEGES ON TABLE products TO app_user;

-- Grant only SELECT and INSERT on a table
GRANT SELECT, INSERT ON TABLE orders TO app_user;

-- Grant USAGE privilege on a schema
GRANT USAGE ON SCHEMA public TO app_user;

-- Revoke privileges
REVOKE INSERT ON TABLE orders FROM app_user;

-- Grant connect privilege on a database
GRANT CONNECT ON DATABASE sales_db TO app_user;

-- Grant privileges on all existing tables in a schema for a user
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_user;

-- Grant privileges on future tables in a schema (default privileges)
ALTER DEFAULT PRIVILEGES FOR ROLE my_admin_user IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
```

## 6. Essential Command-Line Tools

PostgreSQL provides several command-line utilities for administration and interaction.

### `psql` - The Interactive Terminal

`psql` is a terminal-based front-end to PostgreSQL. It allows you to type in queries interactively, issue them to PostgreSQL, and see the query results.

*   **Connect:** `psql -U username -d database_name -h hostname -p port_number`
    *   Example: `psql -U postgres -d postgres`
*   **Common `psql` commands (prefixed with `\`):**
    *   `\l`: List databases.
    *   `\dt`: List tables in the current database.
    *   `\du`: List roles (users).
    *   `\c database_name`: Connect to another database.
    *   `\q`: Quit `psql`.
    *   `\dn`: List schemas.
    *   `\d table_name`: Describe a table.

### `pg_dump` - Database Backup Utility

`pg_dump` extracts a PostgreSQL database into a script file or other archive file. It's crucial for backups.

*   **Full database backup (plain text SQL script):**
    ```bash
    pg_dump -U postgres my_database > my_database_backup.sql
    ```
*   **Backup a single table:**
    ```bash
    pg_dump -U postgres -t my_table my_database > my_table_backup.sql
    ```
*   **Custom format archive (recommended for `pg_restore`):**
    ```bash
    pg_dump -U postgres -Fc my_database > my_database_backup.dump
    ```

### `pg_restore` - Database Restore Utility

`pg_restore` restores a PostgreSQL database from an archive created by `pg_dump` in one of the non-plain-text formats (custom, directory, or tar).

*   **Restore from a custom format archive:**
    ```bash
    pg_restore -U postgres -d new_database my_database_backup.dump
    ```
*   **Restore a plain text SQL script (using `psql`):**
    ```bash
    psql -U postgres -d new_database < my_database_backup.sql
    ```

## Checklist/Exercise:

1.  Identify where you would configure PostgreSQL to listen on all network interfaces instead of just `localhost` and what file you would modify to allow a specific remote IP address (`192.168.1.100`) to connect as any user to any database using `md5` authentication.
2.  Write SQL commands to create a new role named `report_reader`, grant it `SELECT` privilege on a table named `sales_data` in the `public` schema, and then connect to a database named `analytics_db` using this new role.
3.  Explain the difference between `pg_dump` and `pg_restore` and when you would typically use each tool.