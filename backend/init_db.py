import os
import pymysql

def init_db():
    print("Connecting to MySQL...")
    conn = pymysql.connect(
        host='127.0.0.1',
        user='root',
        password='kgap2004',
        charset='utf8mb4'
    )
    
    try:
        with conn.cursor() as cursor:
            # Read schema.sql
            schema_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database', 'schema.sql')
            print(f"Reading schema from {schema_path}...")
            with open(schema_path, 'r', encoding='utf-8') as f:
                sql = f.read()
            
            # Split commands by semicolon
            # (None of the SQL statements in schema.sql contain semicolons inside strings)
            commands = sql.split(';')
            print(f"Executing {len(commands)} SQL commands...")
            for i, cmd in enumerate(commands):
                cmd = cmd.strip()
                if not cmd:
                    continue
                try:
                    cursor.execute(cmd)
                except Exception as e:
                    print(f"Error executing command {i}: {cmd[:50]}...")
                    print(f"Error details: {e}")
                    raise e
            
            conn.commit()
            print("Database initialized and seeded successfully!")
    finally:
        conn.close()

if __name__ == '__main__':
    init_db()
