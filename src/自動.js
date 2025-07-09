// サイトごとの自動操作をまとめたスクリプト
(async (document) => {
	const EOL = "\n";
	const CSV_EOL = "\r\n";
	const { origin, pathname } = location;
	const { body } = document;
	const qs = (query, p) => (p || document).querySelector(query);
	const qsa = (query, p) => Array.from((p || document).querySelectorAll(query));
	const h = (tag, attributes, children) => {
		const element = document.createElement(tag);
		for (const [key, value] of Object.entries(attributes)) {
			if (key === "style") {
				Object.assign(element.style, value);
				continue;
			}
			if (typeof value === "string") {
				element.setAttribute(key, value);
			}
		}
		for (const child of children ?? []) {
			if (typeof child === "string") {
				element.appendChild(document.createTextNode(child));
				continue;
			}
			element.appendChild(child);
		}
		return element;
	};
	const text = (query, p) => qs(query, p).textContent.trim();
	const csvCol = (value) => `"${value.replace(/"/g, '""')}"`;
	const padDatePart = (part) => part.padStart(2, "0");

	const sleep = (time) => {
		return new Promise((resolve) => {
			setTimeout(resolve, time);
		});
	};

	const download = (blobOrURL, name) => {
		const url =
			blobOrURL instanceof Blob ? URL.createObjectURL(blobOrURL) : blobOrURL;
		const link = h("a", {
			href: url,
			target: "_blank",
			download: name,
		});
		body.appendChild(link);
		link.click();
		body.removeChild(link);
		if (blobOrURL instanceof Blob) {
			URL.revokeObjectURL(url);
		}
	};

	const downloadWithProxy = (items) => {
		const proxy = "http://macaron.local/tools/download-proxy/";
		const proxyUrl = new URL(proxy);
		const searchParams = proxyUrl.searchParams;
		for (const item of items) {
			searchParams.append("urls[]", item.src);
			searchParams.append("names[]", item.download);
		}
		const link = h("a", { href: proxyUrl.toString(), target: "_blank" });
		body.appendChild(link);
		link.click();
		body.removeChild(link);
	};

	const copy = (text) => {
		navigator.clipboard.writeText(text);
		notify(
			h("div", { style: { color: "#666", font: "700 80%/1.5 sans-serif" } }, [
				"コピーしました:",
			]),
			text,
		);
	};

	// 一時的なメッセージを表示する
	const notify = async (...text) => {
		const popup = h(
			"div",
			{
				style: {
					position: "fixed",
					zIndex: "infinity",
					top: "0",
					left: "0",
					right: "0",
				},
			},
			[
				h(
					"div",
					{
						style: {
							width: "fit-content",
							margin: "0 auto",
							padding: "10px",
							font: "500 15px/1.5 sans-serif",
							textAlign: "left",
							whiteSpace: "pre-line",
							background: "#fff",
							color: "#222",
							border: "solid 1px #ddd",
							borderRadius: "0 0 5px 5px",
							boxShadow: "0 2px 20px rgba(0,0,0,.4)",
						},
					},
					text,
				),
			],
		);
		body.appendChild(popup);
		await sleep(9999);
		body.removeChild(popup);
	};

	// tr*>th+td という構造のテーブルの th と td の組を Map にして返す
	const tableRecords = (table) => {
		const records = new Map();
		qsa("th:not([rowspan])", table).map((th) => {
			const td = th.nextElementSibling;
			records.set(th.textContent.trim(), td?.textContent?.trim());
		});
		return records;
	};

	// ○円○銭 という文字列を数値に変換する
	const yenSenToNumber = (text) => {
		if (text == null) return "";
		const [yen, sen] = text
			.replace(/,/g, "")
			.replace(/\s*銭/, "")
			.split(/\s*円\s*/);
		return `${yen}.${sen}`;
	};

	switch (origin) {
		// ゴールドポイントカード+
		case "https://secure.goldpoint.co.jp":
			switch (pathname) {
				// ログイン後の画面で明細ページを開く
				case "/gpm/membertop.html": {
					qs('a[href*="/web_meisai/"]').click();
					break;
				}
				// 明細ページでCSVダウンロードリンクをクリックする
				case "/memx/web_meisai/top/index.html": {
					const link = qs(".btn_big_size");
					if (!/\bCSV\b/.test(link.textContent)) break;
					link.click();
					break;
				}
			}
			break;
		// レコチョク
		case "https://recochoku.jp":
			switch (pathname) {
				// 購入した音楽を一括ダウンロード
				case "/lapap/wsPurchaseComp": {
					for (const link of qsa(".download-track-list__btn-link")) {
						link.click();
						await sleep(5000);
					}
					break;
				}
			}
			break;
		// イオンカード
		case "https://www.aeon.co.jp":
			switch (pathname) {
				// ログイン画面でオートコンプリートを有効にする
				case "/auth/realms/msweb/protocol/openid-connect/auth": {
					const input = qs("input#username");
					input.autocomplete = "username";
					input.focus();
					break;
				}
				// ログイン後の画面で明細ページを開く
				case "/app/": {
					location.href = "https://www.aeon.co.jp/app/details/";
					break;
				}
				// 明細をCSV形式でダウンロード
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
					const csv =
						headers.join(",") +
						CSV_EOL +
						rows.map((cols) => cols.map(csvCol).join(",")).join(CSV_EOL);
					const title = text(".m-debitaccountpanel_billingdate")
						.replace(/^.*(\d{4})年(\d+)月.*$/, "$1-$2")
						.split("-")
						.map(padDatePart)
						.join("-");
					download(
						new Blob([csv], { type: "text/csv" }),
						`aeon-card-${title}-00.csv`,
					);
					break;
				}
			}
			break;
		// Duolingo
		case "https://www.duolingo.com":
			switch (pathname) {
				case "/lesson": {
					const text = qsa("div[dir]")
						.map((div) => div.textContent)
						.join(EOL);
					copy(text);
					break;
				}
			}
			break;
		// 北陸電力 ほくリンク
		case "https://mieruka.rikuden.co.jp":
			switch (pathname) {
				case "/OI008_WEB/oi008_ba002p01/oi008_ba002_scr001.render": {
					// 最新の明細ページを開く
					qs("#oi008_ba002_scr001-kenshinkekkashokaibutton")?.click();
					break;
				}
				case "/OI008_WEB/oi008_ka004p01/oi008_ka004_scr001.render": {
					// Web明細をスプレッドシートに貼り付けられる形式でコピーする
					const records = tableRecords(
						qs("[class*='result-using-expense-t02']"),
					);
					copy(
						[
							text("[id*='shiyoryohyoji_1']"), // 使用量 [kWh]
							yenSenToNumber(records.get("基本料金")),
							yenSenToNumber(records.get("電力量料金（１段階目）")),
							yenSenToNumber(records.get("電力量料金（２段階目）")),
							yenSenToNumber(records.get("電力量料金（３段階目）")),
							yenSenToNumber(records.get("燃料費調整額")),
							yenSenToNumber(records.get("割引")),
							yenSenToNumber(records.get("再エネ発電賦課金")),
						].join("\t"),
					);
					break;
				}
			}
			break;
		// コドモン
		case "https://parents.codmon.com":
			switch (qs(".toolbar__title")?.textContent) {
				case "お知らせ詳細": {
					const title = qs(".timelineDetails_title")?.textContent.trim();
					if (title == null) break;
					const dateParts = qs(".timelineDetails_date")
						.textContent.trim()
						.replace(/[年月]/gu, ":")
						.replace(/日/u, ":")
						.replace(/[時分]/gu, ":")
						.split(":")
						.map((s) => s.padStart(2, "0"));
					const date = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}T${dateParts[3]}${dateParts[4]}00`;
					const downloadItems = qsa("ons-carousel-item img")
						.filter((img) => img.checkVisibility())
						.map((img, index) => ({
							src: img.src.replace(/\bwidth=\d+/, "width=0"),
							download: `${date}_${title}_${(index + 1).toString().padStart(2, "0")}.jpg`,
						}));
					downloadWithProxy(downloadItems);
					break;
				}
			}
			break;
		// GitHub
		case "https://github.com": {
			const editor = qs("slash-command-expander textarea");
			const removeHeight = (str) => str.replace(/ height="\d+"/g, "");
			if (editor) {
				// <img width="1179" height="2556" alt="Image" src="https://github.com/user-attachments/assets/c7c263b2-6368-4e09-9ad6-0b9f20577942" />
				// ![Screenshot_20250619_171304.jpg](https://github.com/user-attachments/assets/c26bd72d-4bc9-443e-b52b-63383f26e15b)
				editor.value = editor.value.replace(
					/<img([^>]*) width="\d+"([^>]*)>/g,
					(_, attr1, attr2) => `<img${removeHeight(attr1)} width="375"${removeHeight(attr2)}>`
				).replace(
					/!\[([^\]]+)]\(([^)]+)\)/g,
					'<img alt="$1" src="$2" width="375" />'
				);
			}
			break;
		}
		default:
			notify(`未設定 (origin = ${origin}, path = ${pathname})`);
	}
})(document);
