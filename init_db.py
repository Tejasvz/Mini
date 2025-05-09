import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, "temples.db")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS temples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS temple_gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    temple_id INTEGER NOT NULL,
    photo_url TEXT NOT NULL,
    FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE
)
""")

temples = [
    ("Vishnu Temple", "/Assets/temple1.png", "Old Vishnu temple with rich heritage and architecture."),
    ("Shiva Temple", "/Assets/temple2.jpg", "Ancient Shiva temple believed to be from the 12th century."),
    ("Kali Mandir", "/Assets/temple3.jpg", "Dedicated to Goddess Kali, known for its vibrant rituals.")
]

cursor.executemany("INSERT INTO temples (name, image_url, description) VALUES (?, ?, ?)", temples)

conn.commit()
conn.close()

print("Database created and initialized successfully.")