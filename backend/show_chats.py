import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

def show_chats():
    conn = sqlite3.connect('edurag.db')
    cursor = conn.cursor()

    cursor.execute('''
        SELECT 
            s.id AS session_id,
            u.name AS user_name,
            u.email AS user_email,
            c.name AS course_name,
            s.title AS session_title,
            s.updated_at
        FROM chat_sessions s
        JOIN users u ON s.user_id = u.id
        JOIN courses c ON s.course_id = c.id
        ORDER BY s.id DESC
    ''')

    sessions = cursor.fetchall()
    print(f"=== TOTAL CHAT SESSIONS FOUND: {len(sessions)} ===\n")

    for sess in sessions:
        sess_id, user_name, user_email, course_name, title, updated_at = sess
        print(f"Session #{sess_id}: '{title}'")
        print(f"Course: {course_name} | User: {user_name} ({user_email}) | Time: {updated_at}")
        
        cursor.execute('''
            SELECT role, content 
            FROM messages 
            WHERE session_id = ? 
            ORDER BY id ASC
        ''', (sess_id,))
        
        msgs = cursor.fetchall()
        for role, content in msgs:
            label = "Student" if role == "user" else "AI Tutor"
            # Format single line preview
            cleaned = content.replace('\r', '').replace('\n', ' ')
            if len(cleaned) > 180:
                cleaned = cleaned[:180] + "..."
            print(f"  [{label}]: {cleaned}")
        print("-" * 60)

    conn.close()

if __name__ == "__main__":
    show_chats()
