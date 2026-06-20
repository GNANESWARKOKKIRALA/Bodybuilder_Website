import sqlite3
import os
import glob

def migrate():
    print("Scanning for SQLite databases on your server...")
    
    # Scan the entire repository and home directory for any .db files
    db_paths = glob.glob('/home/bodybuilder2024/**/*.db', recursive=True)
    
    # Also add standard relative paths
    standard_paths = [
        os.path.join(os.path.dirname(__file__), 'gnaneswar_fitness.db'),
        os.path.abspath(os.path.join(os.path.dirname(__file__), '../gnaneswar_fitness.db')),
        'gnaneswar_fitness.db'
    ]
    
    for p in standard_paths:
        if os.path.exists(p) and p not in db_paths:
            db_paths.append(p)
            
    # Filter out duplicate path resolutions
    resolved_paths = list(set([os.path.abspath(p) for p in db_paths if os.path.exists(p)]))
    
    if not resolved_paths:
        print("No SQLite database files (.db) found on the server.")
        print("Creating default database at: /home/bodybuilder2024/Bodybuilder_Website/backend/gnaneswar_fitness.db")
        resolved_paths = ['/home/bodybuilder2024/Bodybuilder_Website/backend/gnaneswar_fitness.db']
        
    for db_path in resolved_paths:
        print(f"\n--- Migrating Database: {db_path} ---")
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Check user_profiles columns
            cursor.execute("PRAGMA table_info(user_profiles)")
            columns = [row[1] for row in cursor.fetchall()]
            
            if not columns:
                print("Table 'user_profiles' does not exist in this database file. Skipping column additions.")
            else:
                if 'workout_program_id' not in columns:
                    print("Adding workout_program_id column to user_profiles...")
                    cursor.execute("ALTER TABLE user_profiles ADD COLUMN workout_program_id INTEGER")
                else:
                    print("workout_program_id column already exists.")
                    
                if 'nutrition_plan_id' not in columns:
                    print("Adding nutrition_plan_id column to user_profiles...")
                    cursor.execute("ALTER TABLE user_profiles ADD COLUMN nutrition_plan_id INTEGER")
                else:
                    print("nutrition_plan_id column already exists.")
            
            # Check/Recreate chat_messages table
            print("Checking chat_messages table...")
            cursor.execute("DROP TABLE IF EXISTS chat_messages")
            cursor.execute("""
                CREATE TABLE chat_messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    sender_id INTEGER NOT NULL,
                    receiver_id INTEGER NOT NULL,
                    message TEXT NOT NULL,
                    is_read INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
                )
            """)
            print("chat_messages table verified/created.")
            
            conn.commit()
            print("Migration completed successfully for this file.")
        except Exception as e:
            print(f"Error during migration for {db_path}: {e}")
            try:
                conn.rollback()
            except:
                pass
        finally:
            try:
                conn.close()
            except:
                pass

if __name__ == '__main__':
    migrate()
