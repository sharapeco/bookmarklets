(async () => {
	const qsa = (query) => [].slice.call(document.querySelectorAll(query));
	const wait = (ms) => new Promise((success) => setTimeout(() => success(), ms));

	if (location.origin !== "https://www.youtube.com" || location.pathname !== "/feed/history") {
		alert("YouTubeの履歴ページで実行してください");
		return;
	}

	const query = prompt("検索クエリ：");
	if (query == null) return;

	const titleQuery = "ytm-shorts-lockup-view-model .ShortsLockupViewModelHostMetadataTitle";
	const matchTitles = qsa(titleQuery).map((title) => title.textContent.indexOf(query) >= 0 ? title : null).filter((el) => el).map((el) => el.textContent.trim());
	// biome-ignore lint/style/useTemplate: ブックマークレットでは改行を含むテンプレートリテラルを使用できない
	const toContinue = confirm(`"${query}" に一致するショート動画：` + "\n" + matchTitles.join("\n") + "\n\nこれらの動画を削除しますか？");
	if (!toContinue) return;

	let signal = true;

	const stopButton = document.createElement("button");
	stopButton.textContent = "停止";
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
	stopButton.onclick = () => {
		signal = false;
		stopButton.remove();
	};
	document.body.appendChild(stopButton);

	const scrollElement = document.documentElement;
	let prevScrollY = 0;
	scroll(0, 0);

	while (signal) {
		const matches = qsa(titleQuery).map((title) => title.textContent.indexOf(query) >= 0 ? title : null).filter((el) => el);

		for (const title of matches) {
			const container = title.closest("ytm-shorts-lockup-view-model");
			if (!container) continue;

			const button = container.querySelector("[aria-label='その他の操作']");
			if (!button) continue;
			button.click();
			await wait(500);

			const deleteMenu = qsa("tp-yt-iron-dropdown yt-list-item-view-model").find((el) => /履歴から削除/.test(el.textContent));
			if (!deleteMenu) continue;
			deleteMenu.click();
			await wait(500);
			container.remove();
		}

		scrollBy(0, 1000);
		await wait(3000);
		while (scrollElement.scrollTop === prevScrollY) {
			scrollBy(0, 10);
			await wait(1000);
		}
		prevScrollY = scrollElement.scrollTop;
	}
})()