(() => {
  // あなたの Render サーバーの URL に置き換えてね
  const socket = io("https://damarekozou.onrender.com");

  const form = document.getElementById("post-form");
  const nameInput = document.getElementById("name");
  const textInput = document.getElementById("text");
  const postsTbody = document.getElementById("posts");
  const refreshBtn = document.getElementById("refresh");

  // 投稿一覧を描画
  function renderPosts(posts) {
    postsTbody.innerHTML = "";
    posts.sort((a, b) => b.id - a.id).forEach(post => {
      const tr = document.createElement("tr");

      const tdId = document.createElement("td");
      tdId.textContent = post.id;

      const tdName = document.createElement("td");
      tdName.textContent = post.name;

      const tdContent = document.createElement("td");
      tdContent.textContent = post.content;

      const tdTime = document.createElement("td");
      tdTime.textContent = new Date(post.timestamp).toLocaleString();

      tr.append(tdId, tdName, tdContent, tdTime);
      postsTbody.appendChild(tr);
    });
  }

  // サーバーから初期投稿を受け取る
  socket.on("init_posts", renderPosts);

  // 新規投稿を受け取ったら再描画
  socket.on("new_post", post => {
    renderPosts([post, ...Array.from(postsTbody.children).map(tr => ({
      id: parseInt(tr.children[0].textContent),
      name: tr.children[1].textContent,
      content: tr.children[2].textContent,
      timestamp: tr.children[3].textContent
    }))]);
  });

  // フォーム送信時
  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!nameInput.value || !textInput.value) return alert("名前と本文を入力してください");

    const payload = {
      name: nameInput.value || "名無し",
      content: textInput.value
    };
    socket.emit("post", payload, res => {
      if (res && res.ok) textInput.value = "";
    });
  });

  // 更新ボタン
  refreshBtn.addEventListener("click", () => {
    socket.emit("noop"); // サーバー側に noop がなければここは fetch("/api/posts") にしてもOK
    fetch("https://YOUR-RENDER-APP.onrender.com/api/posts")
      .then(res => res.json())
      .then(renderPosts);
  });
})();
