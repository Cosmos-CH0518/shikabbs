const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const sqlite3 = require("sqlite3");
const path = require("path");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --------------------
// DB初期化
// --------------------
const db = new sqlite3.Database("bbs.db");

// 投稿テーブル
db.run(`
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    seed TEXT NOT NULL,
    content TEXT NOT NULL,
    color TEXT NOT NULL,
    ip TEXT NOT NULL,
    timestamp INTEGER NOT NULL
)
`);

// 運営用IPテーブル
db.run(`
CREATE TABLE IF NOT EXISTS admin_ips (
    ip TEXT PRIMARY KEY
)
`);

// ロール管理（色）
db.run(`
CREATE TABLE IF NOT EXISTS roles (
    role_name TEXT PRIMARY KEY,
    color TEXT NOT NULL
)
`);

// --------------------
// ユーティリティ
// --------------------
function generateSeed(name, salt = null) {
    if (!salt) salt = crypto.randomBytes(4).toString("hex");
    const hash = crypto.createHash("sha256").update(name + salt).digest("hex");
    return hash.slice(0, 8);
}

function getRoleColor(seed) {
    const code = parseInt(seed.slice(0,2),16);
    if (code < 85) return "red";
    else if (code < 170) return "blue";
    else return "green";
}

// --------------------
// REST API
// --------------------

// 投稿取得
app.get("/api/posts", (req, res) => {
    db.all("SELECT id, name, seed, content, color, timestamp FROM posts ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 投稿作成
app.post("/api/posts", (req, res) => {
    const { name, content } = req.body;
    if (!name || !content) return res.status(400).json({ error: "name and content required" });

    const seed = generateSeed(name);
    const color = getRoleColor(seed);
    const timestamp = Date.now();
    const ip = req.ip;

    db.run(
        "INSERT INTO posts (name, seed, content, color, ip, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
        [name, seed, content, color, ip, timestamp],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            const post = { id: this.lastID, name, seed, content, color, timestamp };
            io.emit("new_post", post);
            res.json({ ok: true, post });
        }
    );
});

// --------------------
// Socket.IO
// --------------------
io.on("connection", (socket) => {
    const clientIp = socket.handshake.address;

    // 接続時に全投稿送信
    db.all("SELECT id, name, seed, content, color, timestamp, ip FROM posts ORDER BY id DESC", [], (err, rows) => {
        if (err) return console.error(err);

        // 運営IPの場合は名前赤でシード非表示
        const posts = rows.map(r => {
            const isAdmin = false; // 管理者IPは admin_ips テーブルで確認可
            return {
                id: r.id,
                name: r.name,
                seed: isAdmin ? "" : r.seed,
                content: r.content,
                color: isAdmin ? "red" : r.color,
                timestamp: r.timestamp
            };
        });
        socket.emit("init_posts", posts);
    });

    socket.on("post", (payload) => {
        const { name, content } = payload;
        if (!name || !content) return;

        const seed = generateSeed(name);
        const color = getRoleColor(seed);
        const timestamp = Date.now();
        const ip = clientIp;

        db.run(
            "INSERT INTO posts (name, seed, content, color, ip, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
            [name, seed, content, color, ip, timestamp],
            function(err) {
                if (err) return console.error(err);

                const post = { id: this.lastID, name, seed, content, color, timestamp };
                io.emit("new_post", post);
            }
        );
    });
});

// --------------------
// サーバー起動
// --------------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Central BBS running on port ${PORT}`));
