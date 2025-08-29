// SocketサーバーURL（Renderの場合は必ず本番URLに変更する）
const API_BASE = 'https://damarekozou.onrender.com';
const socket = io(API_BASE);
const postsTableBody = document.querySelector("#posts tbody");
function formatYMDHM(ms) {
  if (!ms) return "";
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}
function renderPosts(posts) {
  postsTableBody.innerHTML = "";
  for (const post of posts) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${post.id}</td>
      <td style="color: ${post.color};">${post.name}</td>
      <td>${post.content}</td>
      <td>${post.color}</td>
      <td>${formatYMDHM(post.timestamp)}</td>
    `;
    // 管理者色
    if (post.color === 'red') {
      row.querySelectorAll('td').forEach(td => td.classList.add('admin-text'));
    }
    postsTableBody.appendChild(row);
  }
}
// 新着時、一覧初期送信時
socket.on("new_post", post => {
  fetchPosts();
});
socket.on("init_posts", renderPosts);
function fetchPosts() {
  fetch(API_BASE + '/api/posts').then(r=>r.json()).then(renderPosts);
}
// 投稿
document.getElementById("post-form").addEventListener("submit", function(e){
  e.preventDefault();
  const name = document.getElementById("name").value;
  const seed = document.getElementById("seed").value;
  const content = document.getElementById("content").value;
  if (!content) return alert("本文は必須です");
  fetch(API_BASE+'/api/posts', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, seed, content })
  }).then(r=>r.json()).then(() => {
    document.getElementById("content").value = "";
  });
});
document.getElementById("refresh").addEventListener("click", fetchPosts);
// 初回取得
fetchPosts();
