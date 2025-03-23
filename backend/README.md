# Focus Flow Backend

This is the backend service for Focus Flow application.

## Setup Instructions

### 1. Create and activate virtual environment (optional but recommended)

```bash
python -m venv .venv
source .venv/bin/activate  # On Unix/macOS
# or
.venv\Scripts\activate  # On Windows
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Database Setup

Run migrations to set up the database schema:

```bash
python manage.py migrate
```

### 4. Populate Database

Load initial data using the management commands:

```bash
python manage.py populate_db
```

Remove initial data from the database (if needed):

```bash
python manage.py populate_db --delete
```

### 5. Run Development Server

Start the Django development server:

```bash
python manage.py runserver
```

The server will start at `http://127.0.0.1:8000/`

## Additional Notes

- Make sure you have Python 3.x installed
- The project uses SQLite as the default database
