const socket = io("https://damarekozou.onrender.com");

// 初期投稿受信
socket.on("init_posts", (posts) => {
  const container = document.getElementById("posts");
  container.innerHTML = "";
  posts.forEach(p => {
    const div = document.createElement("div");
    div.style.color = p.color;
    div.textContent = `${p.name}: ${p.content}`;
    container.appendChild(div);
  });
});

// 新規投稿受信
socket.on("new_post", (post) => {
  const container = document.getElementById("posts");
  const div = document.createElement("div");
  div.style.color = post.color;
  div.textContent = `${post.name}: ${post.content}`;
  container.appendChild(div);
});

// 投稿送信
document.getElementById("sendBtn").addEventListener("click", () => {
  const name = document.getElementById("name").value;
  const content = document.getElementById("text").value;
  if (!name || !content) return alert("名前と内容を入力して下さい");
  socket.emit("post", { name, content });
  document.getElementById("text").value = "";
});
