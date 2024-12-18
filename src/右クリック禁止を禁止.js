(() => {
	const events = ["contextmenu", "copy", "mousedown", "selectstart"];
	const qsa = (selector, target) =>
		Array.from((target ?? document).querySelectorAll(selector));
	const removeEvents = (elem) => {
		const repl = elem.cloneNode();
		events.map((type) => repl.removeAttribute(`on${type}`));
		elem.replaceWith(repl);
	};

	// NOTE: map のほうが forEach より短いので

	// <img> のイベントを削除
	qsa("img").map(removeEvents);

	// on* 属性のついた要素のイベントを削除
	events.map((type) => qsa(`[on${type}]`).map(removeEvents));
})();
