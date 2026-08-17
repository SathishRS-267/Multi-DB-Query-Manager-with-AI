# Multi-DB Query Manager with AI 🚀

A modern, full-stack database management platform with AI assistance that enables developers and data analysts to manage, query, and analyze multiple database engines (**PostgreSQL**, **MySQL**, and **MongoDB**) from a single unified interface.

---

## 🌟 Key Features

- **Multi-Database Support**: Connect and interact with **PostgreSQL**, **MySQL**, and **MongoDB** databases seamlessly.
- **AI-Powered Query Generation**: Transform plain English prompts into syntactically valid SQL and MongoDB aggregation queries using AI models (OpenAI API).
- **Interactive Query Editor**: SQL & MongoDB editor with syntax highlighting, schema auto-completion, execution timers, and formatted data tables.
- **Saved Queries & History**: Save frequently used queries per database and view query execution history.
- **Query Sharing**: Share query code and execution results directly via email.
- **AI Chat Assistant**: Embedded AI chatbot with database context awareness to answer database questions and optimize queries.
- **User Authentication**: Secure JWT-based registration, login, and password reset workflow.
- **One-Time Data Seeding Script**: Includes `seed_database.py` to automatically provision demo tables, collections, demo records, and pre-saved queries.

---

## 🏗️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, TailwindCSS, Lucide Icons |
| **Backend** | FastAPI, Python 3.10+, Uvicorn, Pydantic |
| **Database Drivers** | `psycopg2-binary`, `pymysql`, `pymongo`, `asyncpg`, `SQLAlchemy` |
| **AI Integration** | OpenAI API |
| **Databases** | PostgreSQL, MySQL, MongoDB |

---

## 📋 System Prerequisites

Before running the application, ensure you have the following installed on your machine:

1. **Python**: Python 3.10 or higher
2. **Node.js**: Node.js 18+ and `npm`
3. **Database Services** (running locally or accessible remotely):
   - **PostgreSQL**: Default port `5432`
   - **MySQL**: Default port `3306`
   - **MongoDB**: Default port `27017`

---

## ⚙️ Environment Configuration

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Copy `.env.example` to create your active `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` and fill in your database credentials and API key:

   ```ini
   # OpenAI API Key
   OPENAI_API_KEY=your_openai_api_key_here

   # Management Database Configuration (PostgreSQL)
   MGMT_DB_HOST=localhost
   MGMT_DB_PORT=5432
   MGMT_DB_NAME=multi-db-query-manager
   MGMT_DB_USER=postgres
   MGMT_DB_PASSWORD=pwd

   # Email Configuration (SMTP for Password Reset & Query Sharing)
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   ```

---

## 🗄️ One-Time Database Seeding Script

The project includes a standalone seeding script (`seed_database.py`) that sets up sample databases, schemas, demo data, connection profiles, and 9 ready-to-run queries across PostgreSQL, MySQL, and MongoDB.

### Created Databases Summary:

1. **`multi-db-query-manager`** *(PostgreSQL)*: Main management database storing user accounts, active connection profiles, pre-saved queries, and AI chat logs.
2. **`multidb_postgres`** *(PostgreSQL)*: E-Commerce target database (`customers`, `categories`, `products`, `orders`, `order_items`).
3. **`multidb_mysql`** *(MySQL)*: HR & Projects target database (`departments`, `employees`, `projects`, `timesheets`).
4. **`multidb_mongodb`** *(MongoDB)*: Analytics target database (`users_activity`, `product_reviews`, `analytics_events`).

### Running the Seed Script:

From the `backend/` directory, run:

```bash
python seed_database.py
```

#### Custom Options & Command-Line Arguments:

```bash
# Pass custom passwords directly:
python seed_database.py --pg-pass YOUR_PG_PASS --mysql-user root --mysql-pass YOUR_MYSQL_PASS

# Reset/re-create sample tables:
python seed_database.py --reset
```

---

## 🚀 How to Run the Project

### 1. Start the Backend API Server

From the `backend/` directory:

```bash
# Activate virtual environment (if using one)
# Windows: venv\Scripts\activate
# Linux/macOS: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
python main.py
```
> The API server will start on **`http://localhost:8080`**.  
> API documentation is available at `http://localhost:8080/docs`.

---

### 2. Start the Frontend React App

In a new terminal window, navigate to the `frontend/` directory:

```bash
cd frontend

# Install npm dependencies
npm install

# Start the React development server
npm start
```
> The React app will launch in your browser at **`http://localhost:3000`**.

---

## 🎯 Demo Walkthrough & Credentials

- **Pre-Seeded Demo User**:
  - **Email**: `admin@example.com`
  - **Password**: `admin123`
- **Pre-Configured Connections**:
  - `PostgreSQL E-Commerce DB` (`multidb_postgres`)
  - `MySQL HR & Projects DB` (`multidb_mysql`)
  - `MongoDB Analytics & Reviews DB` (`multidb_mongodb`)
- **Saved Sample Queries**:
  - Open **Saved Queries** in the UI to instantly view and run pre-populated multi-table joins, salary budget aggregations, and MongoDB aggregation pipelines.

---

## 🛠️ Project Directory Structure

```text
Multi-DB Query Manager/
├── README.md                 # Project Overview & Setup Guide
├── backend/
│   ├── .env                  # Environment Variables (Ignored in git)
│   ├── .env.example          # Environment Template
│   ├── seed_database.py      # One-Time Setup & Data Seeding Script
│   ├── main.py               # FastAPI Entrypoint & Routes
│   ├── config.py             # Settings & Environment Loader
│   ├── database.py           # SQLAlchemy Engine & Base
│   ├── database_router.py    # Database Connection Management Router
│   ├── query_handler.py      # SQL Execution & Saved Query Router
│   ├── mongodb_handler.py    # MongoDB Operations Router
│   ├── chat_router.py        # AI Chatbot & WebSocket Router
│   ├── ai_client.py          # NVIDIA / OpenAI AI Client Wrapper
│   └── auth/                 # Authentication Models & Routes
└── frontend/
    ├── package.json          # Node Dependencies & Scripts
    ├── src/
    │   ├── pages/            # React Pages (Dashboard, QueryEditor, Login, etc.)
    │   ├── components/       # UI Components & Schema Browser
    │   └── contexts/         # Authentication Context
    └── public/
```

---

## 📝 License

This project is licensed under the MIT License.
