#!/usr/bin/env python3
"""
One-Time Database Seeding Script for Multi-DB Query Manager with AI
Project: multi-db-query-manager-with-ai

This script creates and populates sample schemas and data across:
1. Management Database (PostgreSQL): multi-db-query-manager
   - Pre-seeds users, connection profiles, saved demo queries, and sample AI chats.
2. Target Database (PostgreSQL): multidb_postgres
   - E-Commerce domain (customers, categories, products, orders, order_items).
3. Target Database (MySQL): multidb_mysql
   - HR & Project Management domain (departments, employees, projects, timesheets).
4. Target Database (MongoDB): multidb_mongodb
   - Telemetry & Analytics domain (users_activity, product_reviews, analytics_events).
"""

import os
import sys
import argparse
import datetime
import uuid
import json
from dotenv import load_dotenv

# Load environment variables from backend/.env if present
load_dotenv()

# Import database connectors
try:
    import psycopg2
    from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
    import psycopg2.extras
except ImportError:
    print("❌ Error: psycopg2 is required. Install with: pip install psycopg2-binary")
    sys.exit(1)

try:
    import pymysql
except ImportError:
    print("❌ Error: pymysql is required. Install with: pip install pymysql")
    sys.exit(1)

try:
    import pymongo
except ImportError:
    print("❌ Error: pymongo is required. Install with: pip install pymongo")
    sys.exit(1)

try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)
except Exception:
    def hash_password(password: str) -> str:
        # Fallback bcrypt hash for 'admin123' if passlib isn't fully set up
        return "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"


# Helper for safe SQL string execution
def log_step(msg):
    print(f"--> {msg}")

def log_success(msg):
    print(f"   [OK] {msg}")

def log_warn(msg):
    print(f"   [WARN] {msg}")



def seed_postgres_databases(pg_host, pg_port, pg_user, pg_password, mgmt_db_name, target_pg_db_name, reset=False):
    log_step(f"Connecting to PostgreSQL server at {pg_host}:{pg_port}...")
    try:
        # Connect to system database 'postgres' to check/create databases
        sys_conn = psycopg2.connect(
            host=pg_host,
            port=pg_port,
            user=pg_user,
            password=pg_password,
            dbname="postgres"
        )
        sys_conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = sys_conn.cursor()

        # 1. Create multi-db-query-manager database if needed
        cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (mgmt_db_name,))
        if not cur.fetchone():
            log_step(f"Creating management database '{mgmt_db_name}' in PostgreSQL...")
            cur.execute(f'CREATE DATABASE "{mgmt_db_name}"')
            log_success(f"Database '{mgmt_db_name}' created.")
        else:
            log_success(f"Management database '{mgmt_db_name}' already exists.")

        # 2. Create multidb_postgres target database if needed
        cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (target_pg_db_name,))
        if not cur.fetchone():
            log_step(f"Creating target database '{target_pg_db_name}' in PostgreSQL...")
            cur.execute(f'CREATE DATABASE "{target_pg_db_name}"')
            log_success(f"Database '{target_pg_db_name}' created.")
        else:
            log_success(f"Target database '{target_pg_db_name}' already exists.")

        cur.close()
        sys_conn.close()

    except Exception as e:
        log_warn(f"Failed to create PostgreSQL databases automatically: {e}")
        log_warn("Continuing under assumption databases already exist...")

    # Now populate Management Database (multi-db-query-manager)
    log_step(f"Populating Management Database '{mgmt_db_name}'...")
    conn = psycopg2.connect(
        host=pg_host,
        port=pg_port,
        user=pg_user,
        password=pg_password,
        dbname=mgmt_db_name
    )
    conn.autocommit = True
    cur = conn.cursor()

    if reset:
        log_step("Reset flag passed. Dropping management tables if they exist...")
        cur.execute("DROP TABLE IF EXISTS saved_queries CASCADE;")
        cur.execute("DROP TABLE IF EXISTS connections CASCADE;")
        cur.execute("DROP TABLE IF EXISTS chat_messages CASCADE;")
        cur.execute("DROP TABLE IF EXISTS chat_histories CASCADE;")
        cur.execute("DROP TABLE IF EXISTS users CASCADE;")

    # Create tables
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            is_verified BOOLEAN DEFAULT TRUE,
            reset_token VARCHAR(255),
            reset_token_expires TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS connections (
            id VARCHAR(36) PRIMARY KEY,
            type VARCHAR(50) NOT NULL,
            name VARCHAR(100) NOT NULL,
            host VARCHAR(255) NOT NULL,
            port INTEGER NOT NULL,
            database_name VARCHAR(100) NOT NULL,
            username VARCHAR(100) NOT NULL,
            password VARCHAR(255) NOT NULL,
            last_accessed TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS saved_queries (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            query TEXT NOT NULL,
            connection_id UUID NOT NULL,
            db_type TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'sql',
            database TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS chat_histories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) DEFAULT 'New Chat',
            user_id VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id SERIAL PRIMARY KEY,
            chat_id INTEGER REFERENCES chat_histories(id) ON DELETE CASCADE,
            message_type VARCHAR(50) NOT NULL,
            content TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Seed Admin/Demo User
    demo_pass_hash = hash_password("admin123")
    cur.execute("""
        INSERT INTO users (username, email, hashed_password, is_active, is_verified)
        VALUES ('demo_admin', 'admin@example.com', %s, TRUE, TRUE)
        ON CONFLICT (username) DO NOTHING;
    """, (demo_pass_hash,))

    # Connection IDs
    pg_conn_id = "11111111-1111-1111-1111-111111111111"
    mysql_conn_id = "22222222-2222-2222-2222-222222222222"
    mongo_conn_id = "33333333-3333-3333-3333-333333333333"

    # Seed Connections
    connections_data = [
        (pg_conn_id, "postgres", "PostgreSQL E-Commerce DB", pg_host, pg_port, target_pg_db_name, pg_user, pg_password),
        (mysql_conn_id, "mysql", "MySQL HR & Projects DB", os.getenv("MYSQL_HOST", "localhost"), int(os.getenv("MYSQL_PORT", "3306")), "multidb_mysql", os.getenv("MYSQL_USER", "root"), os.getenv("MYSQL_PASSWORD", "Root@123")),
        (mongo_conn_id, "mongodb", "MongoDB Analytics & Reviews DB", os.getenv("MONGO_HOST", "localhost"), int(os.getenv("MONGO_PORT", "27017")), "multidb_mongodb", os.getenv("MONGO_USER", ""), os.getenv("MONGO_PASSWORD", ""))
    ]

    for cid, ctype, cname, chost, cport, cdbname, cuser, cpass in connections_data:
        cur.execute("""
            INSERT INTO connections (id, type, name, host, port, database_name, username, password, last_accessed)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (id) DO UPDATE SET
                type = EXCLUDED.type,
                name = EXCLUDED.name,
                host = EXCLUDED.host,
                port = EXCLUDED.port,
                database_name = EXCLUDED.database_name,
                username = EXCLUDED.username,
                password = EXCLUDED.password,
                last_accessed = CURRENT_TIMESTAMP;
        """, (cid, ctype, cname, chost, cport, cdbname, cuser, cpass))

    # Seed Saved Queries
    saved_queries = [
        # PostgreSQL Queries
        ("Top 5 High-Spending Customers",
         "Finds top 5 customers sorted by total completed order expenditures.",
         "SELECT c.id, c.first_name, c.last_name, c.email, c.city, COUNT(o.id) as total_orders, SUM(o.total_amount) as total_spent FROM customers c JOIN orders o ON c.id = o.customer_id WHERE o.status = 'Completed' GROUP BY c.id, c.first_name, c.last_name, c.email, c.city ORDER BY total_spent DESC LIMIT 5;",
         pg_conn_id, "postgres", "sql", target_pg_db_name),

        ("Revenue & Item Quantity by Product Category",
         "Aggregates total revenue and items sold grouped by product category.",
         "SELECT cat.name AS category_name, COUNT(DISTINCT o.id) AS total_orders, SUM(oi.quantity) AS items_sold, SUM(oi.quantity * oi.unit_price) AS total_revenue FROM categories cat JOIN products p ON cat.id = p.category_id JOIN order_items oi ON p.id = oi.product_id JOIN orders o ON oi.order_id = o.id GROUP BY cat.id, cat.name ORDER BY total_revenue DESC;",
         pg_conn_id, "postgres", "sql", target_pg_db_name),

        ("Low Stock Inventory Warning (< 25 units)",
         "Lists products with inventory stock below 25 units for replenishment.",
         "SELECT p.id, p.name AS product_name, cat.name AS category, p.price, p.stock_quantity FROM products p JOIN categories cat ON p.category_id = cat.id WHERE p.stock_quantity < 25 ORDER BY p.stock_quantity ASC;",
         pg_conn_id, "postgres", "sql", target_pg_db_name),

        # MySQL Queries
        ("Department Budget vs Salary Overhead",
         "Compares department annual budget allocation against employee total salary expenses.",
         "SELECT d.dept_name, d.budget AS dept_budget, COUNT(e.id) AS employee_count, SUM(e.salary) AS total_salary_cost, (d.budget - SUM(e.salary)) AS remaining_budget FROM departments d LEFT JOIN employees e ON d.id = e.department_id GROUP BY d.id, d.dept_name, d.budget ORDER BY total_salary_cost DESC;",
         mysql_conn_id, "mysql", "sql", "multidb_mysql"),

        ("Logged Work Hours per Active Project",
         "Calculates overall employee work hours logged per project from timesheets.",
         "SELECT p.project_name, d.dept_name, COUNT(DISTINCT t.employee_id) AS active_employees, SUM(t.hours_logged) AS total_hours_worked FROM projects p JOIN departments d ON p.department_id = d.id JOIN timesheets t ON p.id = t.project_id GROUP BY p.id, p.project_name, d.dept_name ORDER BY total_hours_worked DESC;",
         mysql_conn_id, "mysql", "sql", "multidb_mysql"),

        ("High Earning Employees (Salary >= $80k)",
         "Lists all high earning staff members along with department and hire date details.",
         "SELECT e.id, e.first_name, e.last_name, e.email, d.dept_name, e.salary, e.hire_date FROM employees e JOIN departments d ON e.department_id = d.id WHERE e.salary >= 80000 ORDER BY e.salary DESC;",
         mysql_conn_id, "mysql", "sql", "multidb_mysql"),

        # MongoDB Queries
        ("Average Rating & Review Counts by Product",
         "MongoDB aggregation pipeline calculating average rating and review volume per product.",
         '{"collection": "product_reviews", "operation": "aggregate", "pipeline": [{"$group": {"_id": "$product_id", "avg_rating": {"$avg": "$rating"}, "review_count": {"$sum": 1}}}, {"$sort": {"avg_rating": -1}}]}',
         mongo_conn_id, "mongodb", "mongo", "multidb_mongodb"),

        ("Verified High-Rating Customer Reviews (>= 4 Stars)",
         "Finds verified buyer reviews rated 4 or 5 stars.",
         '{"collection": "product_reviews", "operation": "find", "query": {"rating": {"$gte": 4}, "verified_purchase": true}, "options": {"sort": {"created_at": -1}}}',
         mongo_conn_id, "mongodb", "mongo", "multidb_mongodb"),

        ("User Sessions & Engagement by Device Category",
         "Aggregates session count and average duration grouped by user device type.",
         '{"collection": "users_activity", "operation": "aggregate", "pipeline": [{"$group": {"_id": "$device", "avg_duration_sec": {"$avg": "$session_duration"}, "total_sessions": {"$sum": 1}}}, {"$sort": {"total_sessions": -1}}]}',
         mongo_conn_id, "mongodb", "mongo", "multidb_mongodb")
    ]

    for qname, qdesc, qquery, qcid, qdbtype, qtype, qdbname in saved_queries:
        cur.execute("""
            INSERT INTO saved_queries (name, description, query, connection_id, db_type, type, database)
            SELECT %s, %s, %s, %s, %s, %s, %s
            WHERE NOT EXISTS (
                SELECT 1 FROM saved_queries WHERE name = %s AND connection_id = %s
            );
        """, (qname, qdesc, qquery, qcid, qdbtype, qtype, qdbname, qname, qcid))

    # Seed Sample AI Chat Session
    cur.execute("SELECT id FROM chat_histories WHERE name = 'Demo AI Query Assistant' LIMIT 1;")
    chat_row = cur.fetchone()
    if not chat_row:
        cur.execute("INSERT INTO chat_histories (name, user_id) VALUES ('Demo AI Query Assistant', 'demo_admin') RETURNING id;")
        chat_id = cur.fetchone()[0]
        cur.execute("""
            INSERT INTO chat_messages (chat_id, message_type, content) VALUES
            (%s, 'user', 'Show me top 5 spending customers in PostgreSQL'),
            (%s, 'bot', 'Here is the SQL query to find the top 5 spending customers:\n\n```sql\nSELECT c.id, c.first_name, c.last_name, c.email, SUM(o.total_amount) as total_spent\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.id, c.first_name, c.last_name, c.email\nORDER BY total_spent DESC\nLIMIT 5;\n```');
        """, (chat_id, chat_id))

    cur.close()
    conn.close()
    log_success(f"Management database '{mgmt_db_name}' seeded successfully.")

    # Populate PostgreSQL Target Database (multidb_postgres)
    log_step(f"Populating Target PostgreSQL Database '{target_pg_db_name}'...")
    target_conn = psycopg2.connect(
        host=pg_host,
        port=pg_port,
        user=pg_user,
        password=pg_password,
        dbname=target_pg_db_name
    )
    target_conn.autocommit = True
    tcur = target_conn.cursor()

    if reset:
        tcur.execute("DROP TABLE IF EXISTS order_items CASCADE;")
        tcur.execute("DROP TABLE IF EXISTS orders CASCADE;")
        tcur.execute("DROP TABLE IF EXISTS products CASCADE;")
        tcur.execute("DROP TABLE IF EXISTS categories CASCADE;")
        tcur.execute("DROP TABLE IF EXISTS customers CASCADE;")

    tcur.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT
        );
    """)

    tcur.execute("""
        CREATE TABLE IF NOT EXISTS customers (
            id SERIAL PRIMARY KEY,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            city VARCHAR(100),
            country VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    tcur.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
            price NUMERIC(10, 2) NOT NULL,
            stock_quantity INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    tcur.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
            order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(50) NOT NULL DEFAULT 'Completed',
            total_amount NUMERIC(10, 2) NOT NULL,
            payment_method VARCHAR(50) NOT NULL
        );
    """)

    tcur.execute("""
        CREATE TABLE IF NOT EXISTS order_items (
            id SERIAL PRIMARY KEY,
            order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
            product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
            quantity INTEGER NOT NULL,
            unit_price NUMERIC(10, 2) NOT NULL
        );
    """)

    # Seed Categories
    tcur.execute("SELECT COUNT(*) FROM categories;")
    if tcur.fetchone()[0] == 0:
        categories = [
            ("Electronics", "Smartphones, laptops, monitors, accessories"),
            ("Furniture", "Office desks, chairs, ergonomic setup"),
            ("Clothing", "Apparel, footwear, fashion items"),
            ("Books", "Technical manuals, novels, science books"),
            ("Sports & Outdoors", "Fitness equipment, outdoor gear, yoga accessories")
        ]
        tcur.executemany("INSERT INTO categories (name, description) VALUES (%s, %s);", categories)

    # Seed Customers
    tcur.execute("SELECT COUNT(*) FROM customers;")
    if tcur.fetchone()[0] == 0:
        customers = [
            ("Alice", "Smith", "alice.smith@example.com", "New York", "USA"),
            ("Bob", "Johnson", "bob.johnson@example.com", "London", "UK"),
            ("Charlie", "Brown", "charlie.brown@example.com", "Toronto", "Canada"),
            ("Diana", "Prince", "diana.prince@example.com", "Chicago", "USA"),
            ("Evan", "Wright", "evan.wright@example.com", "Berlin", "Germany"),
            ("Fiona", "Gallagher", "fiona.g@example.com", "Dublin", "Ireland"),
            ("George", "Clark", "george.clark@example.com", "Sydney", "Australia"),
            ("Hannah", "Abbott", "hannah.a@example.com", "Boston", "USA"),
            ("Ian", "Malcolm", "ian.malcolm@example.com", "Austin", "USA"),
            ("Julia", "Roberts", "julia.roberts@example.com", "Los Angeles", "USA")
        ]
        tcur.executemany("INSERT INTO customers (first_name, last_name, email, city, country) VALUES (%s, %s, %s, %s, %s);", customers)

    # Seed Products
    tcur.execute("SELECT COUNT(*) FROM products;")
    if tcur.fetchone()[0] == 0:
        products = [
            ("Laptop Pro 15\"", 1, 1299.99, 15),
            ("Wireless Noise-Canceling Headphones", 1, 199.99, 45),
            ("Ergonomic Office Chair", 2, 349.50, 12),
            ("Mechanical Gaming Keyboard", 1, 89.99, 60),
            ("Smart Watch Ultra", 1, 299.00, 8),
            ("4K Ultra HD Monitor", 1, 450.00, 20),
            ("Standing Desk Converter", 2, 220.00, 10),
            ("Cotton Casual T-Shirt", 3, 24.99, 100),
            ("Leather Jacket", 3, 189.00, 14),
            ("Python Data Science Handbook", 4, 49.99, 30),
            ("Clean Code Book", 4, 39.95, 25),
            ("Ergonomic Wireless Mouse", 1, 45.00, 50),
            ("Fitness Tracker Band", 5, 79.99, 18),
            ("Yoga Mat Pro Extra Thick", 5, 35.00, 40),
            ("Trail Running Shoes", 5, 110.00, 22)
        ]
        tcur.executemany("INSERT INTO products (name, category_id, price, stock_quantity) VALUES (%s, %s, %s, %s);", products)

    # Seed Orders & Order Items
    tcur.execute("SELECT COUNT(*) FROM orders;")
    if tcur.fetchone()[0] == 0:
        orders = [
            (1, '2026-07-10 10:30:00', 'Completed', 1499.98, 'Credit Card'),
            (2, '2026-07-12 14:15:00', 'Completed', 349.50, 'PayPal'),
            (3, '2026-07-15 09:00:00', 'Completed', 89.94, 'Apple Pay'),
            (4, '2026-07-20 16:45:00', 'Completed', 749.00, 'Credit Card'),
            (5, '2026-07-22 11:20:00', 'Completed', 220.00, 'Wire Transfer'),
            (6, '2026-07-25 13:00:00', 'Completed', 189.00, 'Credit Card'),
            (7, '2026-08-01 15:30:00', 'Completed', 49.99, 'PayPal'),
            (8, '2026-08-03 10:00:00', 'Completed', 549.99, 'Credit Card'),
            (9, '2026-08-05 17:10:00', 'Completed', 114.99, 'Apple Pay'),
            (10, '2026-08-10 12:00:00', 'Completed', 1299.99, 'Credit Card')
        ]
        tcur.executemany("INSERT INTO orders (customer_id, order_date, status, total_amount, payment_method) VALUES (%s, %s, %s, %s, %s);", orders)

        order_items = [
            (1, 1, 1, 1299.99), # Order 1: Laptop
            (1, 2, 1, 199.99),  # Order 1: Headphones
            (2, 3, 1, 349.50),  # Order 2: Chair
            (3, 8, 2, 24.99),   # Order 3: 2 T-Shirts
            (3, 11, 1, 39.95),  # Order 3: Clean Code
            (4, 5, 1, 299.00),  # Order 4: Smart Watch
            (4, 6, 1, 450.00),  # Order 4: 4K Monitor
            (5, 7, 1, 220.00),  # Order 5: Standing Desk
            (6, 9, 1, 189.00),  # Order 6: Leather Jacket
            (7, 10, 1, 49.99),  # Order 7: Python Book
            (8, 6, 1, 450.00),  # Order 8: 4K Monitor
            (8, 4, 1, 89.99),   # Order 8: Keyboard
            (8, 12, 2, 45.00),  # Order 8: Mouse
            (9, 13, 1, 79.99),  # Order 9: Fitness Tracker
            (9, 14, 1, 35.00),  # Order 9: Yoga Mat
            (10, 1, 1, 1299.99) # Order 10: Laptop
        ]
        tcur.executemany("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (%s, %s, %s, %s);", order_items)

    tcur.close()
    target_conn.close()
    log_success(f"PostgreSQL target database '{target_pg_db_name}' populated successfully.")


def seed_mysql_database(mysql_host, mysql_port, mysql_user, mysql_password, target_mysql_db_name="multidb_mysql", reset=False):
    log_step(f"Connecting to MySQL server at {mysql_host}:{mysql_port}...")
    try:
        conn = pymysql.connect(
            host=mysql_host,
            port=mysql_port,
            user=mysql_user,
            password=mysql_password,
            autocommit=True
        )
        cur = conn.cursor()
        cur.execute(f"CREATE DATABASE IF NOT EXISTS `{target_mysql_db_name}`;")
        cur.execute(f"USE `{target_mysql_db_name}`;")
        log_success(f"MySQL Database '{target_mysql_db_name}' created/selected.")

        if reset:
            cur.execute("SET FOREIGN_KEY_CHECKS = 0;")
            cur.execute("DROP TABLE IF EXISTS timesheets;")
            cur.execute("DROP TABLE IF EXISTS projects;")
            cur.execute("DROP TABLE IF EXISTS employees;")
            cur.execute("DROP TABLE IF EXISTS departments;")
            cur.execute("SET FOREIGN_KEY_CHECKS = 1;")

        cur.execute("""
            CREATE TABLE IF NOT EXISTS departments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                dept_name VARCHAR(100) NOT NULL,
                location VARCHAR(100) NOT NULL,
                budget DECIMAL(12, 2) NOT NULL
            );
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS employees (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                department_id INT,
                salary DECIMAL(10, 2) NOT NULL,
                hire_date DATE NOT NULL,
                FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
            );
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                project_name VARCHAR(200) NOT NULL,
                department_id INT,
                status VARCHAR(50) NOT NULL DEFAULT 'In Progress',
                budget DECIMAL(12, 2) NOT NULL,
                start_date DATE,
                end_date DATE,
                FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
            );
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS timesheets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                employee_id INT NOT NULL,
                project_id INT NOT NULL,
                hours_logged DECIMAL(5, 2) NOT NULL,
                work_date DATE NOT NULL,
                task_description TEXT,
                FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            );
        """)

        # Seed Departments
        cur.execute("SELECT COUNT(*) FROM departments;")
        if cur.fetchone()[0] == 0:
            departments = [
                ("Engineering", "Building A - Floor 3", 500000.00),
                ("Sales & Marketing", "Building B - Floor 2", 350000.00),
                ("Human Resources", "Building A - Floor 1", 150000.00),
                ("Product & Design", "Building C - Floor 4", 250000.00)
            ]
            cur.executemany("INSERT INTO departments (dept_name, location, budget) VALUES (%s, %s, %s);", departments)

        # Seed Employees
        cur.execute("SELECT COUNT(*) FROM employees;")
        if cur.fetchone()[0] == 0:
            employees = [
                ("Sarah", "Connor", "sarah.connor@example.com", 1, 95000.00, "2023-01-15"),
                ("John", "Doe", "john.doe@example.com", 1, 85000.00, "2023-03-01"),
                ("Jane", "Smith", "jane.smith@example.com", 2, 72000.00, "2023-05-10"),
                ("Alex", "Mercer", "alex.mercer@example.com", 1, 105000.00, "2022-11-20"),
                ("Emma", "Watson", "emma.watson@example.com", 4, 88000.00, "2023-08-01"),
                ("Michael", "Scott", "michael.scott@example.com", 2, 90000.00, "2021-04-12"),
                ("Pam", "Beesly", "pam.beesly@example.com", 3, 55000.00, "2022-02-01"),
                ("Jim", "Halpert", "jim.halpert@example.com", 2, 78000.00, "2022-06-15"),
                ("Dwight", "Schrute", "dwight.schrute@example.com", 2, 82000.00, "2021-09-01"),
                ("Stanley", "Hudson", "stanley.hudson@example.com", 1, 92000.00, "2020-10-10")
            ]
            cur.executemany("INSERT INTO employees (first_name, last_name, email, department_id, salary, hire_date) VALUES (%s, %s, %s, %s, %s, %s);", employees)

        # Seed Projects
        cur.execute("SELECT COUNT(*) FROM projects;")
        if cur.fetchone()[0] == 0:
            projects = [
                ("Cloud Infrastructure Migration", 1, "In Progress", 120000.00, "2026-01-10", "2026-09-30"),
                ("AI Assistant Portal", 1, "In Progress", 85000.00, "2026-03-01", "2026-11-15"),
                ("Q3 Global Marketing Campaign", 2, "In Progress", 60000.00, "2026-06-01", "2026-09-30"),
                ("Employee Onboarding Redesign", 3, "Completed", 25000.00, "2026-02-01", "2026-05-30"),
                ("Design System 2.0", 4, "In Progress", 45000.00, "2026-04-15", "2026-10-31")
            ]
            cur.executemany("INSERT INTO projects (project_name, department_id, status, budget, start_date, end_date) VALUES (%s, %s, %s, %s, %s, %s);", projects)

        # Seed Timesheets
        cur.execute("SELECT COUNT(*) FROM timesheets;")
        if cur.fetchone()[0] == 0:
            timesheets = [
                (1, 1, 8.0, "2026-08-01", "Database schema design and optimization"),
                (2, 1, 7.5, "2026-08-01", "Docker container configuration"),
                (4, 2, 8.5, "2026-08-01", "NVIDIA AI API client integration"),
                (5, 5, 6.0, "2026-08-02", "UI Figma component redesign"),
                (3, 3, 8.0, "2026-08-02", "Lead generation campaign analysis"),
                (1, 2, 7.0, "2026-08-03", "FastAPI WebSocket endpoints"),
                (2, 2, 8.0, "2026-08-03", "MongoDB aggregation query handler"),
                (6, 3, 6.5, "2026-08-03", "Client strategy meeting"),
                (7, 4, 8.0, "2026-08-04", "New hire documentation review"),
                (8, 3, 7.5, "2026-08-04", "Enterprise sales demo presentation")
            ]
            cur.executemany("INSERT INTO timesheets (employee_id, project_id, hours_logged, work_date, task_description) VALUES (%s, %s, %s, %s, %s);", timesheets)

        cur.close()
        conn.close()
        log_success(f"MySQL target database '{target_mysql_db_name}' populated successfully.")

    except Exception as e:
        log_warn(f"Failed to populate MySQL database '{target_mysql_db_name}': {e}")
        log_warn("Please check MySQL connection settings or ensure MySQL service is running.")


def seed_mongodb_database(mongo_host, mongo_port, mongo_user, mongo_password, target_mongo_db_name="multidb_mongodb", reset=False):
    log_step(f"Connecting to MongoDB server at {mongo_host}:{mongo_port}...")
    try:
        if mongo_user and mongo_password:
            uri = f"mongodb://{mongo_user}:{mongo_password}@{mongo_host}:{mongo_port}/"
        else:
            uri = f"mongodb://{mongo_host}:{mongo_port}/"

        client = pymongo.MongoClient(uri, serverSelectionTimeoutMS=3000)
        client.admin.command('ping')
        db = client[target_mongo_db_name]

        if reset:
            client.drop_database(target_mongo_db_name)
            log_step(f"Dropped MongoDB database '{target_mongo_db_name}'.")

        # 1. Collection: users_activity
        users_activity = db["users_activity"]
        if users_activity.count_documents({}) == 0:
            activity_docs = [
                {"user_id": "usr_101", "device": "Desktop", "ip_address": "192.168.1.45", "session_duration": 450, "pages_visited": ["/dashboard", "/query-editor", "/saved-queries"], "timestamp": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=2)},
                {"user_id": "usr_102", "device": "Mobile", "ip_address": "172.16.0.12", "session_duration": 120, "pages_visited": ["/login", "/dashboard"], "timestamp": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=5)},
                {"user_id": "usr_103", "device": "Desktop", "ip_address": "10.0.0.88", "session_duration": 1200, "pages_visited": ["/dashboard", "/schema-browser", "/ai-chat", "/query-editor"], "timestamp": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1)},
                {"user_id": "usr_104", "device": "Tablet", "ip_address": "192.168.2.11", "session_duration": 340, "pages_visited": ["/dashboard", "/settings"], "timestamp": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1, hours=3)},
                {"user_id": "usr_105", "device": "Desktop", "ip_address": "192.168.1.99", "session_duration": 890, "pages_visited": ["/query-editor", "/history"], "timestamp": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=2)}
            ]
            users_activity.insert_many(activity_docs)
            log_success("Seeded MongoDB collection 'users_activity'.")

        # 2. Collection: product_reviews
        product_reviews = db["product_reviews"]
        if product_reviews.count_documents({}) == 0:
            reviews_docs = [
                {"product_id": 1, "user_email": "alice.smith@example.com", "rating": 5, "title": "Outstanding Laptop Performance", "comment": "Blazing fast processor, crisp resolution screen, and great battery life!", "verified_purchase": True, "created_at": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=10), "tags": ["fast", "battery", "premium"]},
                {"product_id": 1, "user_email": "bob.johnson@example.com", "rating": 4, "title": "Great machine but lightweight", "comment": "Handles multi-tab browsing and Docker smooth.", "verified_purchase": True, "created_at": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=8), "tags": ["docker", "dev"]},
                {"product_id": 2, "user_email": "charlie.brown@example.com", "rating": 5, "title": "Best Noise Cancellation", "comment": "Blocks out background office chatter completely.", "verified_purchase": True, "created_at": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=5), "tags": ["anc", "audio", "comfortable"]},
                {"product_id": 3, "user_email": "diana.prince@example.com", "rating": 5, "title": "Saved my back!", "comment": "Super ergonomic lumbar support for 8+ hour coding sessions.", "verified_purchase": True, "created_at": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=14), "tags": ["ergonomic", "office"]},
                {"product_id": 4, "user_email": "evan.wright@example.com", "rating": 3, "title": "Good tactile feel", "comment": "Key switches feel great but slightly loud.", "verified_purchase": False, "created_at": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=3), "tags": ["gaming", "keyboard"]}
            ]
            product_reviews.insert_many(reviews_docs)
            log_success("Seeded MongoDB collection 'product_reviews'.")

        # 3. Collection: analytics_events
        analytics_events = db["analytics_events"]
        if analytics_events.count_documents({}) == 0:
            event_docs = [
                {"event_name": "query_executed", "payload": {"db_type": "postgres", "execution_time_ms": 42.5, "rows_returned": 10}, "environment": "production", "timestamp": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=30)},
                {"event_name": "ai_prompt_sent", "payload": {"model": "nvidia/llama-3.1", "prompt_tokens": 128}, "environment": "production", "timestamp": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=15)},
                {"event_name": "connection_added", "payload": {"type": "mysql", "host": "localhost"}, "environment": "production", "timestamp": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=1)}
            ]
            analytics_events.insert_many(event_docs)
            log_success("Seeded MongoDB collection 'analytics_events'.")

        client.close()
        log_success(f"MongoDB target database '{target_mongo_db_name}' populated successfully.")

    except Exception as e:
        log_warn(f"Failed to populate MongoDB database '{target_mongo_db_name}': {e}")
        log_warn("Please check MongoDB connection settings or ensure MongoDB service is running.")


def main():
    parser = argparse.ArgumentParser(description="One-Time Seed Script for Multi-DB Query Manager with AI")
    parser.add_argument("--reset", action="store_true", help="Drop and recreate sample tables & collections")
    parser.add_argument("--pg-host", default=os.getenv("MGMT_DB_HOST", "localhost"), help="PostgreSQL Host")
    parser.add_argument("--pg-port", type=int, default=int(os.getenv("MGMT_DB_PORT", "5432")), help="PostgreSQL Port")
    parser.add_argument("--pg-user", default=os.getenv("MGMT_DB_USER", "postgres"), help="PostgreSQL User")
    parser.add_argument("--pg-pass", default=os.getenv("MGMT_DB_PASSWORD", ""), help="PostgreSQL Password")
    
    parser.add_argument("--mysql-host", default="localhost", help="MySQL Host")
    parser.add_argument("--mysql-port", type=int, default=3306, help="MySQL Port")
    parser.add_argument("--mysql-user", default="root", help="MySQL User")
    parser.add_argument("--mysql-pass", default="", help="MySQL Password")

    parser.add_argument("--mongo-host", default="localhost", help="MongoDB Host")
    parser.add_argument("--mongo-port", type=int, default=27017, help="MongoDB Port")
    parser.add_argument("--mongo-user", default="", help="MongoDB Username")
    parser.add_argument("--mongo-pass", default="", help="MongoDB Password")

    args = parser.parse_args()

    print("=========================================================================")
    print("Multi-DB Query Manager with AI - One-Time Data Seeding Script")
    print("=========================================================================")

    mgmt_db_name = os.getenv("MGMT_DB_NAME", "multi-db-query-manager")

    # 1. PostgreSQL (Management DB & Target DB 'multidb_postgres')
    seed_postgres_databases(
        pg_host=args.pg_host,
        pg_port=args.pg_port,
        pg_user=args.pg_user,
        pg_password=args.pg_pass,
        mgmt_db_name=mgmt_db_name,
        target_pg_db_name="multidb_postgres",
        reset=args.reset
    )

    # 2. MySQL (Target DB 'multidb_mysql')
    seed_mysql_database(
        mysql_host=args.mysql_host,
        mysql_port=args.mysql_port,
        mysql_user=args.mysql_user,
        mysql_password=args.mysql_pass,
        target_mysql_db_name="multidb_mysql",
        reset=args.reset
    )

    # 3. MongoDB (Target DB 'multidb_mongodb')
    seed_mongodb_database(
        mongo_host=args.mongo_host,
        mongo_port=args.mongo_port,
        mongo_user=args.mongo_user,
        mongo_password=args.mongo_pass,
        target_mongo_db_name="multidb_mongodb",
        reset=args.reset
    )

    print("=========================================================================")
    print("One-Time Seeding Completed Successfully!")
    print("=========================================================================")
    print("Summary of Created Databases:")
    print(f" 1. {mgmt_db_name:<20} (PostgreSQL Management DB: Users, Connections, Saved Queries, AI Chat)")
    print(" 2. multidb_postgres     (PostgreSQL Target DB: Customers, Products, Categories, Orders, Items)")
    print(" 3. multidb_mysql        (MySQL Target DB: Departments, Employees, Projects, Timesheets)")
    print(" 4. multidb_mongodb      (MongoDB Target DB: users_activity, product_reviews, analytics_events)")
    print("=========================================================================")

if __name__ == "__main__":
    main()
