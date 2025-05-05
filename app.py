from flask import Flask, render_template, request, redirect, url_for, jsonify, Response
import sqlite3
import requests
import re

app = Flask(__name__)

vocab_cache = []

# ------------------------- LOAD VOCAB --------------------------
def load_vocab():
    global vocab_cache
    with sqlite3.connect("vocab.db") as conn:
        rows = conn.execute("SELECT chinese FROM vocab").fetchall()
        vocab_cache = [row[0] for row in rows]

# ------------------------- DATABASE SETUP --------------------------
def init_db():
    with sqlite3.connect("vocab.db") as conn:
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS vocab (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chinese TEXT NOT NULL UNIQUE
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                role TEXT NOT NULL,
                message TEXT NOT NULL
            )
        """)
        conn.commit()

def migrate_vocab_table():
    with sqlite3.connect("vocab.db") as conn:
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS new_vocab (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chinese TEXT NOT NULL UNIQUE
            )
        """)
        existing_words = c.execute("SELECT DISTINCT chinese FROM vocab").fetchall()
        for (chinese,) in existing_words:
            try:
                c.execute("INSERT INTO new_vocab (chinese) VALUES (?)", (chinese,))
            except sqlite3.IntegrityError:
                pass
        c.execute("DROP TABLE IF EXISTS vocab")
        c.execute("ALTER TABLE new_vocab RENAME TO vocab")
        conn.commit()

# ------------------------- ROUTES ----------------------------
@app.route("/")
def landing():
    return render_template("landing.html")

@app.route("/chat")
def index():
    with sqlite3.connect("vocab.db") as conn:
        messages = conn.execute("SELECT role, message FROM chat_history").fetchall()
    return render_template("index.html", messages=messages)

@app.route("/clear-chat", methods=["POST"])
def clear_chat():
    with sqlite3.connect("vocab.db") as conn:
        conn.execute("DELETE FROM chat_history")
        conn.commit()
    return redirect(url_for("index"))

@app.route("/word-bank")
def word_bank():
    with sqlite3.connect("vocab.db") as conn:
        words = conn.execute("SELECT * FROM vocab").fetchall()
    return render_template("word_bank.html", words=words)

@app.route("/add-word", methods=["POST"])
def add_word():
    chinese = request.form["chinese"].strip()
    characters = [char for char in chinese if char.strip()]
    with sqlite3.connect("vocab.db") as conn:
        for char in characters:
            try:
                conn.execute("INSERT INTO vocab (chinese) VALUES (?)", (char,))
            except sqlite3.IntegrityError:
                pass
        conn.commit()
    load_vocab()
    return redirect(url_for("word_bank"))

@app.route("/delete-multiple-words", methods=["POST"])
def delete_multiple_words():
    ids_to_delete = request.form.getlist("delete_ids")
    with sqlite3.connect("vocab.db") as conn:
        for word_id in ids_to_delete:
            conn.execute("DELETE FROM vocab WHERE id = ?", (word_id,))
        conn.commit()
    load_vocab()
    return redirect(url_for("word_bank"))

@app.route("/delete-word/<int:word_id>")
def delete_word(word_id):
    with sqlite3.connect("vocab.db") as conn:
        conn.execute("DELETE FROM vocab WHERE id = ?", (word_id,))
        conn.commit()
    load_vocab()
    return redirect(url_for("word_bank"))

# ---------------------- CHATBOT ENDPOINT ----------------------
def extract_chinese_characters(text):
    return [char for char in text if re.match(r'[\u4e00-\u9fff]', char)]

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json["message"].strip()
    new_chars = extract_chinese_characters(user_input)
    with sqlite3.connect("vocab.db") as conn:
        for char in new_chars:
            try:
                conn.execute("INSERT INTO vocab (chinese) VALUES (?)", (char,))
            except sqlite3.IntegrityError:
                pass
        conn.commit()
    load_vocab()

    with sqlite3.connect("vocab.db") as conn:
        history = conn.execute("SELECT role, message FROM chat_history ORDER BY id DESC LIMIT 8").fetchall()
        history = list(reversed(history))

    chat_context = "\n".join([f"{'User' if role == 'user' else 'Bot'}: {msg}" for role, msg in history])

    known_chars = set(vocab_cache)
    banned_chars = set()
    attempt = 0
    max_attempts = 3
    final_reply = ""

    while attempt < max_attempts:
        ban_note = f"Do not use these characters: {', '.join(banned_chars)}." if banned_chars else ""
        prompt = f"""
        You are a friendly Chinese bot that likes casual conversations and tutor users if needed.
        Reply to the user using simplified, simple, known Chinese characters. Keep it short and clear.
        {ban_note}

        Conversation:
        {chat_context}
        User: {user_input}
        Reply in Chinese:
        """
        response = requests.post("http://localhost:11434/api/generate", json={
            "model": "mistral",
            "prompt": prompt,
            "stream": False
        })
        ai_reply = response.json().get("response", "")
        used_chars = set(extract_chinese_characters(ai_reply))
        unknown = used_chars - known_chars

        if not unknown:
            final_reply = ai_reply
            break

        banned_chars.update(unknown)
        attempt += 1

    if not final_reply:
        final_reply = ai_reply + "\n(Note: Some characters may be unfamiliar.)"

    with sqlite3.connect("vocab.db") as conn:
        conn.execute("INSERT INTO chat_history (role, message) VALUES (?, ?)", ("user", user_input))
        conn.execute("INSERT INTO chat_history (role, message) VALUES (?, ?)", ("bot", final_reply))
        conn.commit()

    def generate():
        for char in final_reply:
            yield char
        with sqlite3.connect("vocab.db") as conn:
            conn.execute("INSERT INTO chat_history (role, message) VALUES (?, ?)", ("user", user_input))
            conn.execute("INSERT INTO chat_history (role, message) VALUES (?, ?)", ("bot", final_reply))
            conn.commit()

    return Response(generate(), content_type="text/plain")

if __name__ == "__main__":
    init_db()
    migrate_vocab_table()
    load_vocab()
    app.run(debug=True)
