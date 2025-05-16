from flask import Flask, jsonify, render_template, request
import sqlite3
import os
import json

app = Flask(__name__, static_url_path='', static_folder='static')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, "temples.db")

# Database connection helper
def get_connection():
    return sqlite3.connect(db_path)

from flask import render_template, request

@app.route('/temple/<int:temple_id>/gallery_page')
def temple_gallery_page(temple_id):
    return render_template('temple-gallery.html', temple_id=temple_id)

@app.route('/temple/<int:temple_id>/info')
def temple_info_page(temple_id):
    return render_template('temple-info.html', temple_id=temple_id)

# Endpoint to fetch all temples
@app.route("/temples", methods=["GET"])
def get_temples():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, image_url, description FROM temples")
    temples = cursor.fetchall()
    conn.close()
    # Parse description JSON string to list if possible
    def parse_description(desc):
        try:
            return json.loads(desc)
        except Exception:
            return [desc] if desc else []
    return jsonify([{
        "id": row[0],
        "name": row[1],
        "image_url": row[2],
        "description": parse_description(row[3])
    } for row in temples])

# Endpoint to fetch details of a specific temple
@app.route("/temple/<int:temple_id>", methods=["GET"])
def get_temple_info(temple_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name, description FROM temples WHERE id = ?", (temple_id,))
    temple = cursor.fetchone()
    conn.close()
    if temple:
        try:
            description = json.loads(temple[1])
        except Exception:
            description = [temple[1]] if temple[1] else []
        return jsonify({"name": temple[0], "description": description})
    return jsonify({"error": "Temple not found"}), 404

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    if data and data.get('username') == 'Ryuk' and data.get('password') == 'ryuk123':
        return jsonify({'success': True})
    return jsonify({'success': False}), 401

import logging

@app.route('/admin/update_temple', methods=['POST'])
def update_temple():
    data = request.get_json()
    app.logger.info(f"Received update_temple data: {data}")
    if not data or not all(key in data for key in ['id', 'name', 'description', 'image_url']):
        app.logger.error("Missing data in update_temple request")
        return jsonify({'success': False, 'error': 'Missing data'}), 400

    # Convert description list to JSON string if needed
    description = data['description']
    if isinstance(description, list):
        description = json.dumps(description)

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE temples 
            SET name = ?, description = ?, image_url = ?
            WHERE id = ?
        """, (data['name'], description, data['image_url'], data['id']))
        conn.commit()

        # Update gallery photos if provided
        if 'gallery_photos' in data:
            cursor.execute("DELETE FROM temple_gallery WHERE temple_id = ?", (data['id'],))
            for photo_url in data['gallery_photos']:
                cursor.execute("INSERT INTO temple_gallery (temple_id, photo_url) VALUES (?, ?)", (data['id'], photo_url))
            conn.commit()

        conn.close()
        return jsonify({'success': True})
    except sqlite3.Error as e:
        app.logger.error(f"Database error in update_temple: {e}")
        conn.rollback()
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/temple/<int:temple_id>/gallery', methods=['GET'])
def get_temple_gallery(temple_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT photo_url FROM temple_gallery WHERE temple_id = ?", (temple_id,))
    photos = cursor.fetchall()
    conn.close()
    return jsonify([{"url": row[0]} for row in photos])

@app.route('/admin/add_temple', methods=['POST'])
def add_temple():
    data = request.get_json()
    if not data or not all(key in data for key in ['name', 'description', 'image_url']):
        app.logger.error("Missing data in add_temple request: %s", data)
        return jsonify({'success': False, 'error': 'Missing data'}), 400

    name = data['name']
    description = data['description']
    if isinstance(description, list):
        description = json.dumps(description)
    image_url = data['image_url']
    gallery_photos = data.get('gallery_photos', [])

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO temples (name, description, image_url)
            VALUES (?, ?, ?)
        """, (name, description, image_url))
        temple_id = cursor.lastrowid

        for photo_url in gallery_photos:
            cursor.execute("INSERT INTO temple_gallery (temple_id, photo_url) VALUES (?, ?)", (temple_id, photo_url))

        conn.commit()
        conn.close()
        return jsonify({'success': True, 'temple_id': temple_id})
    except sqlite3.Error as e:
        app.logger.error("Database error in add_temple: %s", e)
        conn.rollback()
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/admin/delete_temple/<int:temple_id>', methods=['DELETE'])
def delete_temple(temple_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM temple_gallery WHERE temple_id = ?", (temple_id,))
        cursor.execute("DELETE FROM temples WHERE id = ?", (temple_id,))
        conn.commit()
        conn.close()
        return jsonify({'success': True})
    except sqlite3.Error as e:
        conn.rollback()
        conn.close()
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
