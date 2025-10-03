## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <https://github.com/aditya19138/levoai_demo.git>
cd levoai_demo
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
PORT=3000
DATABASE_PATH=./database/schema.db
STORAGE_PATH=./storage/schemas
```

4. Initialize the database (automatic on first run):
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Endpoints
---

### 1. Import Schema
```
POST /api/v1/schemas/import
```

**Request Body:**
```json
{
  "application": "app1",
  "service": "service1",
  "spec": "<schema-content-as-string>",
  "format": "json"
}
```


**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "duplicate": false,
    "application": "api1",
    "service": "service1",
    "version": 1,
    "format": "json",
    "created_at": "2025-10-01 12:34:56"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid OpenAPI specification: ..."
}
```

---

### 2. Get Latest Schema
```
GET /api/v1/schemas/latest?application=crAPI&service=identity-service
```

**Query Parameters:**
- `application` (required): Application name
- `service` (optional): Service name

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "application": "api1",
    "service": "service1",
    "version": 3,
    "format": "yaml",
    "spec": "<schema-content>",
    "created_at": "2025-10-01 12:34:56"
  }
}
```

---

## Database Schema

### Applications Table
```sql
CREATE TABLE applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Services Table
```sql
CREATE TABLE services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  application_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id),
  UNIQUE(name, application_id)
);
```

### Schema Versions Table
```sql
CREATE TABLE schema_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL,
  service_id INTEGER,
  version INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  file_format TEXT NOT NULL,
  is_latest BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id),
  FOREIGN KEY (service_id) REFERENCES services(id),
  UNIQUE(application_id, service_id, version)
);
```


## Testing 

```bash
npm test
```
