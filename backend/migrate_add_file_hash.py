"""
Migration script to add file_hash column to medical_reports table
Run this script once to update the database schema
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from database import engine
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_add_file_hash():
    """Add file_hash column to medical_reports table if it doesn't exist"""
    try:
        with engine.connect() as conn:
            # Check if column already exists (SQLite specific)
            result = conn.execute(text("PRAGMA table_info(medical_reports)"))
            columns = [row[1] for row in result]
            
            if 'file_hash' in columns:
                logger.info("[OK] Column 'file_hash' already exists in medical_reports table")
                return True
            
            # Add the column
            logger.info("Adding 'file_hash' column to medical_reports table...")
            conn.execute(text("ALTER TABLE medical_reports ADD COLUMN file_hash VARCHAR"))
            conn.commit()
            logger.info("[OK] Successfully added 'file_hash' column to medical_reports table")
            return True
            
    except Exception as e:
        logger.error(f"[ERROR] Error adding file_hash column: {e}")
        return False

if __name__ == "__main__":
    print("Running migration: Add file_hash column to medical_reports table...")
    success = migrate_add_file_hash()
    if success:
        print("[OK] Migration completed successfully!")
    else:
        print("[ERROR] Migration failed. Please check the error messages above.")
        sys.exit(1)

