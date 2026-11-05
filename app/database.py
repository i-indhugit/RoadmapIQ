import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool

from app.config import settings

# For SQLite, ensure directory exists and enable foreign keys
# For PostgreSQL (Neon), support POSTGRES_URL and NullPool in serverless Vercel environment
db_url = os.environ.get("POSTGRES_URL") or os.environ.get("DATABASE_URL") or settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

connect_args = {}
engine_kwargs = {}

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False, "timeout": 30}
else:
    # Use NullPool in serverless lambda environments to avoid connection exhaustion on Neon
    if os.environ.get("VERCEL") or os.environ.get("SERVERLESS"):
        engine_kwargs = {
            "poolclass": NullPool,
            "pool_pre_ping": True,
        }
    else:
        engine_kwargs = {
            "pool_pre_ping": True,
            "pool_recycle": 300,
            "pool_size": 5,
            "max_overflow": 10,
        }

engine = create_engine(db_url, connect_args=connect_args, **engine_kwargs)

# Enable foreign keys and WAL mode for SQLite
if db_url.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
