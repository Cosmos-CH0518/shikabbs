(() => {
  const socket = io("https://damarekozou.onrender.com"); // 必要に応じて自分のサーバーに変更
  const form = document.getElementById("post-form");
  const nameInput = document.getElementById("name");
  const passInput = document.getElementById("password");
  const textInput = document.getElementById("text");
  const postsTbody = document.getElementById("posts");
  const refreshBtn = document.getElementById("refresh");

  function renderPosts(posts) {
    postsTbody.innerHTML = "";
    posts.sort((a,b) => b.id - a.id).forEach(post => {
      const tr = document.createElement("tr");
      tr.dataset.id = post.id;
      tr.dataset.name = post.name;
      tr.dataset.content = post.content;
      tr.dataset.color = post.color;
      tr.dataset.timestamp = post.timestamp;

      const tdId = document.createElement("td");
      tdId.textContent = post.id;

      const tdName = document.createElement("td");
      tdName.textContent = post.name;
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
  socket.on("new_post", post => {
    renderPosts([post, ...Array.from(postsTbody.children).map(tr => ({
      id: parseInt(tr.dataset.id),
      name: tr.dataset.name,
      content: tr.dataset.content,
      color: tr.dataset.color,
      timestamp: tr.dataset.timestamp
    }))]);
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    if(!nameInput.value || !textInput.value) return alert("名前と本文を入力してください");

    const payload = {
      name: nameInput.value,
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
