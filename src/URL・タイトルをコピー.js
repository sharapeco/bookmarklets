// クリップボードへのコピーにはユーザの操作が必要なため、
// <div> を作ってクリックさせています。
((doc, obj, cleanURL) => {
	// このブックマークレットを実行した際に、ブラウザのURLを綺麗にしてしまう
	const newUrl = cleanURL(doc.URL);
	history.replaceState(history.state, "", newUrl);

	// コピーする文字列
	// biome-ignore lint/style/useTemplate: ブックマークレットでは template literal による改行が使えないため
	const value = doc.title + "\n" + newUrl;

	const wrap = doc.createElement("div");
	obj.assign(wrap.style, {
		position: "fixed",
		zIndex: "99999",
		left: "10px",
		top: "10px",
		width: "400px",
		margin: "0",
		padding: "10px",
		background: "#fff",
		borderRadius: "5px",
		boxShadow: "0 2px 5px rgba(0,0,0,20%)",
		font: "400 16px/1.2 sans-serif",
		lineHeight: "",
		fontSize: "18px",
		whiteSpace: "pre-line",
		cursor: "pointer",
	});
	wrap.textContent = value;

	const label = doc.createElement("div");
	label.textContent = "Click this area to copy.";
	obj.assign(label.style, {
		fontSize: "75%",
		color: "#aaa",
	});
	wrap.append(label);

	wrap.onclick = () => {
		navigator.clipboard.writeText(value);
		wrap.remove();
	};
	doc.body.append(wrap);
})(
	document,
	Object,
	// UTMパラメータを除去する
	(urlString) => {
		const url = new URL(urlString);
		["utm_campaign", "utm_medium", "utm_source", "utm_content"].map((key) => {
			url.searchParams.delete(key);
		});
		return url.toString();
	},
);
