(() => {
  const socket = io("https://damarekozou.onrender.com");
  const form = document.getElementById("post-form");
  const nameInput = document.getElementById("name");
  const seedInput = document.getElementById("seed");

  const textInput = document.getElementById("text");
  const postsTbody = document.getElementById("posts");
  const refreshBtn = document.getElementById("refresh");

  function renderPosts(posts) {
    postsTbody.innerHTML = "";
    // 最新投稿が上になるように逆順で描画
    posts.sort((a,b) => b.id - a.id).forEach(post => {
      const tr = document.createElement("tr");
      tr.dataset.id = post.id;
      tr.dataset.name = post.name;
      tr.dataset.seed = post.seed;
      tr.dataset.content = post.content;
      tr.dataset.color = post.color;
      tr.dataset.timestamp = post.timestamp;

      const tdId = document.createElement("td");
      tdId.textContent = post.id;

      const tdName = document.createElement("td");
      tdName.textContent = post.name;
      if(post.seed) tdName.textContent += ` (${post.seed})`;
      if(post.color === "red") tdName.classList.add("admin");

      const tdContent = document.createElement("td");
      tdContent.textContent = post.content;

      const tdTime = document.createElement("td");
      tdTime.textContent = new Date(post.timestamp).toLocaleString();

      tr.append(tdId, tdName, tdContent, tdTime);
      postsTbody.appendChild(tr);
    });
  }

  socket.on("init_posts", renderPosts);
  socket.on("new_post", (post) => renderPosts([post, ...Array.from(postsTbody.children).map(tr => ({
    id: parseInt(tr.dataset.id),
    name: tr.dataset.name,
    seed: tr.dataset.seed,
    content: tr.dataset.content,
    color: tr.dataset.color,
    timestamp: tr.dataset.timestamp
  }))]));

  form.addEventListener("submit", e => {
    e.preventDefault();
    if(!nameInput.value || !textInput.value) return alert("名前と本文を入力してください");
    const payload = {
      name: nameInput.value,
      seed: seedInput.value || undefined,
      password: passInput.value || "",
      content: textInput.value
    };
    socket.emit("post", payload, res => {
      if(res && res.ok) textInput.value = "";
    });
  });

  refreshBtn.addEventListener("click", () => {
    socket.emit("noop");
  });
})();
