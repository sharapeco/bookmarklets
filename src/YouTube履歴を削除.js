(async () => {
	const qsa = (query) => [].slice.call(document.querySelectorAll(query));
	const wait = (ms) => new Promise((success) => setTimeout(() => success(), ms));

	if (location.origin !== "https://www.youtube.com" || location.pathname !== "/feed/history") {
		alert("YouTubeの履歴ページで実行してください");
		return;
	}

	const scrollElement = document.documentElement;
	let prevScrollY = 0;
	scroll(0, 0);

	const query = prompt("検索クエリ：");
	if (!query) return;

	const matchTitles = qsa("#video-title").map((title) => title.textContent.indexOf(query) >= 0 ? title : null).filter((el) => el).map((el) => el.textContent);
	const toContinue = confirm(`"${query}" に一致する動画タイトル：` + "\n" + matchTitles.join("\n") + "\n\nこれらの動画を削除しますか？");
	if (!toContinue) return;

	while (true) {
		const matches = qsa("#video-title").map((title) => title.textContent.indexOf(query) >= 0 ? title : null).filter((el) => el);

		for (const title of matches) {
			const button = title.closest("#dismissible")?.querySelector("[aria-label*='履歴から削除']");
			if (button) {
				button.click();
				await wait(500);
			}
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