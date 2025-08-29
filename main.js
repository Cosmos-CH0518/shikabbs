const socket = io("https://damarekozou.onrender.com"); // 中心BBSのURL

const postsContainer = document.getElementById("posts");
const nameInput = document.getElementById("name");
const seedInput = document.getElementById("seed");
const contentInput = document.getElementById("content");
const sendBtn = document.getElementById("sendBtn");

// Helper: タイムスタンプを見やすく
function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleString();
}

// 投稿をレンダリング
function renderPosts(posts) {
    // 最新順
    postsContainer.innerHTML = "";
    posts.sort((a,b) => b.id - a.id).forEach(p => {
        const div = document.createElement("div");
        div.className = "post";

        // 名前 + シード
        const header = document.createElement("div");
        header.className = "header";

        const nameSpan = document.createElement("span");
        nameSpan.className = "name";
        nameSpan.style.color = p.color || "black";
        nameSpan.textContent = p.name;

        const seedSpan = document.createElement("span");
        seedSpan.className = "seed";
        seedSpan.textContent = p.seed ? `[${p.seed}]` : "";

        const timeSpan = document.createElement("span");
        timeSpan.className = "timestamp";
        timeSpan.textContent = formatTime(p.timestamp);

        header.appendChild(nameSpan);
        header.appendChild(seedSpan);
        header.appendChild(timeSpan);

        const contentDiv = document.createElement("div");
        contentDiv.className = "content";
        contentDiv.textContent = p.content;

        div.appendChild(header);
        div.appendChild(contentDiv);
        postsContainer.appendChild(div);
    });
}

// 初期データ取得
socket.on("init_posts", renderPosts);

// 新規投稿を受信
socket.on("new_post", post => {
    renderPosts([post, ...Array.from(postsContainer.children).map(div => ({
        id: parseInt(div.dataset.id),
        name: div.querySelector(".name").textContent,
        seed: div.querySelector(".seed").textContent.replace(/\[|\]/g,""),
        content: div.querySelector(".content").textContent,
        color: div.querySelector(".name").style.color,
        timestamp: new Date(div.querySelector(".timestamp").textContent).getTime()
    }))]);
});

// 投稿ボタン
sendBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const seed = seedInput.value.trim();
    const content = contentInput.value.trim();
    if(!name || !content) return alert("名前と内容を入力してください");

    socket.emit("post", { name, seed, content });
    contentInput.value = "";
});
