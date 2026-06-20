import sqlite3
import os

def migrate():
    # Detect database path
    possible_paths = [
        os.path.join(os.path.dirname(__file__), 'gnaneswar_fitness.db'),
        '/home/bodybuilder2024/Bodybuilder_Website/backend/gnaneswar_fitness.db',
        'gnaneswar_fitness.db'
    ]
    
    db_path = None
    for path in possible_paths:
        if os.path.exists(path):
            db_path = path
            break
            
    if not db_path:
        # Default to local path if none found
        db_path = os.path.join(os.path.dirname(__file__), 'gnaneswar_fitness.db')
        print(f"No existing database found. Creating a new one at: {db_path}")
    else:
        print(f"Found database at: {db_path}")
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 1. Check user_profiles columns
        cursor.execute("PRAGMA table_info(user_profiles)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if not columns:
            print("user_profiles table does not exist. It will be created automatically by Flask on startup.")
        else:
            if 'workout_program_id' not in columns:
                print("Adding workout_program_id column to user_profiles...")
                cursor.execute("ALTER TABLE user_profiles ADD COLUMN workout_program_id INTEGER")
                
            if 'nutrition_plan_id' not in columns:
                print("Adding nutrition_plan_id column to user_profiles...")
                cursor.execute("ALTER TABLE user_profiles ADD COLUMN nutrition_plan_id INTEGER")
                
        # 2. Recreate chat_messages table
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
        print("chat_messages table created successfully.")
        
        conn.commit()
        print("SQLite Database migration completed successfully!")
    except Exception as e:
        print(f"Error during SQLite migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    migrate()
