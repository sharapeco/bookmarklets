(async () => {
	const qs = (query, element = document) => element.querySelector(query);
	const qsa = (query, element = document) => Array.from(element.querySelectorAll(query));
	const wait = (ms) => new Promise((success) => setTimeout(() => success(), ms));

	if (location.origin !== "https://www.youtube.com" || location.pathname !== "/playlist") {
		alert("YouTubeの再生リストページで実行してください");
		return;
	}

	const query = prompt("件数：");
	if (!query) return;
	if (!/^\d+$/.test(query)) {
		alert("件数は数字で入力してください");
		return;
	}
	let count = Number.parseInt(query, 10);
	if (count <= 0) {
		alert("件数は1以上の数字で入力してください");
		return;
	}

	let signal = true;
	const stop = (error) => {
		signal = false;
		stopButton.remove();
		if (error) console.error(error);
	};

	const stopButton = document.createElement("button");
	stopButton.textContent = `停止 (残り ${count})`;
	Object.assign(stopButton.style, {
		position: "fixed",
		zIndex: 10000,
		right: "1em",
		bottom: "1em",
		padding: "1em",
		font: "bold 1.5rem/1.2 sans-serif",
		color: "#fff",
		background: "#e23",
		border: "none",
		borderRadius: "0.5em",
	});
	stopButton.onclick = stop;
	document.body.appendChild(stopButton);

	const container = qs("ytd-playlist-video-list-renderer");
	while (signal && count > 0) {
		const menu = qs("ytd-playlist-video-renderer:not([is-dismissed]) [aria-label='操作メニュー']", container);
		if (!menu) return stop(new Error("menu not found"));

		menu.click();
		await wait(300);

		const deleteMenu = qsa("ytd-menu-service-item-renderer").find((el) => /から削除/.test(el.textContent));
		if (!deleteMenu) return stop(new Error("deleteMenu not found"));
		deleteMenu.click();
		await wait(700);

		count--;
		stopButton.textContent = `停止 (残り ${count})`;
	}

	stop();
})()