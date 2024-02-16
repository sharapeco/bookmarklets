(async (document) => {
	const { origin, pathname } = location;
	const { body } = document;
	const qs = (query, p) => (p || document).querySelector(query);
	const qsa = (query, p) =>
		[].slice.call((p || document).querySelectorAll(query));
	const E = (tag) => document.createElement(tag);
	const text = (query, p) => qs(query, p).textContent.trim();
	const csvCol = (value) => `"${value.replace(/"/g, '""')}"`;
	const padDatePart = (part) => part.padStart(2, "0");
	const sleep = (time) => {
		return new Promise((resolve) => {
			setTimeout(resolve, time);
		});
	};
	// const keyCode = (key) => {
	// 	return key.toUpperCase().charCodeAt(0)
	// }
	// const type = async (elem, keys) => {
	// 	if (!Array.isArray(keys)) return
	// 	elem.focus()
	// 	elem.value = keys
	// 	await sleep(100)
	// 	elem.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', keyCode: 0 }))
	// };
	// const splitChars = (str) => str.split('');
	const download = (content, mimeType, name) => {
		const blob = new Blob([content], { type: mimeType });
		const link = E("a");
		link.href = URL.createObjectURL(blob);
		link.target = "_blank";
		link.download = name;
		body.appendChild(link);
		link.click();
		body.removeChild(link);
	};

	const copy = (text) => {
		navigator.clipboard.writeText(text);
		console.log(`Copied: ${text}`);
	};

	const notify = async (text) => {
		const outer = E("div");
		const outerStyle = outer.style;
		outerStyle.position = "fixed";
		outerStyle.zIndex = "infinity";
		outerStyle.top = outerStyle.left = outerStyle.right = "0";
		const inner = E("div");
		inner.textContent = text;
		const innerStyle = inner.style;
		innerStyle.background = "#28e";
		innerStyle.color = "#fff";
		innerStyle.width = "fit-content";
		innerStyle.margin = "0 auto";
		innerStyle.padding = "10px";
		innerStyle.fontFamily = "sans-serif";
		innerStyle.fontSize = "15px";
		innerStyle.fontWeight = "700";
		innerStyle.textAlign = "center";
		innerStyle.borderRadius = "0 0 5px 5px";
		innerStyle.whiteSpace = "pre-line";
		outer.appendChild(inner);
		body.appendChild(outer);
		await sleep(2000);
		body.removeChild(outer);
	};

	switch (origin) {
		case "https://secure.goldpoint.co.jp":
			switch (pathname) {
				case "/gpm/membertop.html": {
					qs('a[href*="/web_meisai/"]').click();
					break;
				}
				case "/memx/web_meisai/top/index.html": {
					const link = qs(".btn_big_size");
					if (!/\bCSV\b/.test(link.textContent)) break;
					link.click();
					break;
				}
			}
			break;
		case "https://recochoku.jp":
			switch (pathname) {
				case "/lapap/wsPurchaseComp": {
					for (const link of qsa(".download-track-list__btn-link")) {
						link.click();
						await sleep(5000);
					}
					break;
				}
			}
			break;
		case "https://www.aeon.co.jp":
			switch (pathname) {
				case "/auth/realms/msweb/protocol/openid-connect/auth": {
					const input = qs("input#username");
					input.autocomplete = "username";
					input.focus();
					break;
				}
				case "/app/": {
					location.href = "https://www.aeon.co.jp/app/details/";
					break;
				}
				case "/app/details/": {
					const headers = ["日付", "摘要", "金額"];
					const rows = qsa(".o-list > li").map((li) => [
						text(".m-listitem_thumb_date", li)
							.replace(/[年月日]/g, "-")
							.split("-")
							.slice(0, 3)
							.map(padDatePart)
							.join("-"),
						text(".u-omitpipe_contents", li),
						text(".m-listitem_thumb_price", li)
							.replace("円", "")
							.replace(",", ""),
					]);
					const csv = `${headers.join(",")}\r\n${rows
						.map((cols) => cols.map(csvCol).join(","))
						.join("\r\n")}`;
					const title = text(".m-debitaccountpanel_billingdate")
						.replace(/^.*(\d{4})年(\d+)月.*$/, "$1-$2")
						.split("-")
						.map(padDatePart)
						.join("-");
					download(csv, "text/csv", `aeon-card-${title}-00.csv`);
					break;
				}
			}
			break;
		case "https://www.duolingo.com":
			switch (pathname) {
				case "/lesson": {
					const text = qsa("div[dir]")
						.map((div) => div.textContent)
						.join("\n");
					copy(text);
					notify(`Copied: ${text}`);
					break;
				}
			}
			break;
		default:
			notify(`未設定 (origin = ${origin}, path = ${pathname})`);
	}
})(document);
