// サイトごとの自動操作をまとめたスクリプト
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
		notify(`コピーしました:\n${text}`);
	};

	// 一時的なメッセージを表示する
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
		await sleep(9999);
		body.removeChild(outer);
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
		const [yen, sen] = text.replace(/,/g, "").replace(/\s*銭/, "").split(/\s*円\s*/);
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
		// Duolingo
		case "https://www.duolingo.com":
			switch (pathname) {
				case "/lesson": {
					const text = qsa("div[dir]")
						.map((div) => div.textContent)
						.join("\n");
					copy(text);
					break;
				}
			}
			break;
		// 北陸電力 ほくリンク
		case "https://mieruka.rikuden.co.jp":
			switch (pathname) {
				// Web明細をスプレッドシートに貼り付けられる形式でコピーする
				case "/OI008_WEB/oi008_ka004p01/oi008_ka004_scr001.render": {
					const records = tableRecords(qs("[class*='result-using-expense-t02']"));
					copy([
						text("[id*='shiyoryohyoji_1']"), // 使用量 [kWh]
						yenSenToNumber(records.get("基本料金")),
						yenSenToNumber(records.get("電力量料金（１段階目）")),
						yenSenToNumber(records.get("電力量料金（２段階目）")),
						yenSenToNumber(records.get("電力量料金（３段階目）")),
						yenSenToNumber(records.get("燃料費調整額")),
						yenSenToNumber(records.get("割引")),
						yenSenToNumber(records.get("再エネ発電賦課金")),
					].join("\t"));
					break;
				}
			}
			break;
		default:
			notify(`未設定 (origin = ${origin}, path = ${pathname})`);
	}
})(document);
