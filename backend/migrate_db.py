import pymysql

def run_migration():
    print("Connecting to MySQL for migrations...")
    conn = pymysql.connect(
        host='127.0.0.1',
        user='root',
        password='kgap2004',
        database='gnaneswar_fitness',
        charset='utf8mb4'
    )
    
    try:
        with conn.cursor() as cursor:
            # 1. Add assignment columns to user_profiles if they do not exist
            print("Checking user_profiles table...")
            cursor.execute("SHOW COLUMNS FROM user_profiles")
            columns = [col[0] for col in cursor.fetchall()]
            
            if 'workout_program_id' not in columns:
                print("Adding workout_program_id column to user_profiles...")
                cursor.execute("ALTER TABLE user_profiles ADD COLUMN workout_program_id INT NULL")
                cursor.execute("""
                    ALTER TABLE user_profiles 
                    ADD CONSTRAINT fk_user_profiles_workout_program 
                    FOREIGN KEY (workout_program_id) 
                    REFERENCES workout_programs(id) 
                    ON DELETE SET NULL
                """)
            
            if 'nutrition_plan_id' not in columns:
                print("Adding nutrition_plan_id column to user_profiles...")
                cursor.execute("ALTER TABLE user_profiles ADD COLUMN nutrition_plan_id INT NULL")
                cursor.execute("""
                    ALTER TABLE user_profiles 
                    ADD CONSTRAINT fk_user_profiles_nutrition_plan 
                    FOREIGN KEY (nutrition_plan_id) 
                    REFERENCES nutrition_plans(id) 
                    ON DELETE SET NULL
                """)
            
            # 2. Recreate chat_messages table to avoid any pre-existing table conflicts
            print("Dropping chat_messages table if exists...")
            cursor.execute("DROP TABLE IF EXISTS chat_messages")
            
            print("Creating chat_messages table...")
            cursor.execute("""
                CREATE TABLE chat_messages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    sender_id INT NOT NULL,
                    receiver_id INT NOT NULL,
                    message TEXT NOT NULL,
                    is_read TINYINT(1) NOT NULL DEFAULT 0,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """)
            
            # 3. Add index on chat messages
            cursor.execute("CREATE INDEX idx_sender_receiver ON chat_messages (sender_id, receiver_id)")
                
            conn.commit()
            print("Database migration ran successfully!")
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
        raise e
    finally:
        conn.close()

if __name__ == '__main__':
    run_migration()
