(() => {
	const PLAYER_KEY = "__ametoSequentialPlayer";
	const UI_ID = "ameto-seq-player";
	const STYLE_ID = "ameto-seq-player-style";
	const CURRENT_CLASS = "ameto-mp3-current";
	const PLAYING_CLASS = "ameto-mp3-playing";
	const PROXY_STORAGE_KEY = "ameto-mp3-proxy";

	const toAbsoluteURL = (href) => {
		try {
			return new URL(href, location.href).toString();
		} catch {
			return "";
		}
	};

	const isMP3Link = (urlString) => {
		try {
			return /\.mp3$/i.test(new URL(urlString).pathname);
		} catch {
			return false;
		}
	};

	const isHTTPURL = (urlString) => {
		try {
			return new URL(urlString).protocol === "http:";
		} catch {
			return false;
		}
	};

	const buildProxyURL = (proxyBase, targetURL) => {
		if (!proxyBase) return targetURL;
		if (proxyBase.indexOf("{url}") >= 0) {
			return proxyBase.replace("{url}", encodeURIComponent(targetURL));
		}
		return proxyBase + (proxyBase.indexOf("?") >= 0 ? "&" : "?") + "url=" + encodeURIComponent(targetURL);
	};

	const links = Array.from(document.querySelectorAll("a[href]"))
		.filter((a) => isMP3Link(toAbsoluteURL(a.getAttribute("href"))))
		.map((a) => ({
			el: a,
			originalURL: toAbsoluteURL(a.getAttribute("href")),
			url: toAbsoluteURL(a.getAttribute("href")),
			label: (a.textContent || "").trim() || a.getAttribute("href") || "(untitled)",
		}));

	if (links.length === 0) {
		alert(".mp3 リンクが見つかりませんでした");
		return;
	}

	let proxyBase = "";
	try {
		proxyBase = localStorage.getItem(PROXY_STORAGE_KEY) || "";
	} catch {
		proxyBase = "";
	}

	const applyProxyToLinks = () => {
		links.forEach((item) => {
			item.url = proxyBase && isHTTPURL(item.originalURL)
				? buildProxyURL(proxyBase, item.originalURL)
				: item.originalURL;
		});
	};

	applyProxyToLinks();

	const old = window[PLAYER_KEY];
	if (old && typeof old.destroy === "function") {
		old.destroy();
	}

	const style = document.createElement("style");
	style.id = STYLE_ID;
	style.textContent = ""
		+ "#" + UI_ID + "{"
		+ "position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:2147483647;"
		+ "display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:999px;"
		+ "background:rgba(20,20,20,.92);color:#fff;box-shadow:0 12px 28px rgba(0,0,0,.35);"
		+ "font:600 14px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"
		+ "backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);"
		+ "}"
		+ "#" + UI_ID + " button{"
		+ "all:unset;cursor:pointer;user-select:none;padding:7px 10px;border-radius:999px;"
		+ "background:rgba(255,255,255,.1);color:#fff;min-width:2.4em;text-align:center;"
		+ "transition:background .2s ease,transform .12s ease;"
		+ "}"
		+ "#" + UI_ID + " button:hover{background:rgba(255,255,255,.2);}"
		+ "#" + UI_ID + " button:active{transform:translateY(1px);}"
		+ "#" + UI_ID + " .ameto-title{max-width:min(44vw,540px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;opacity:.9;}"
		+ "a." + CURRENT_CLASS + "{"
		+ "background:linear-gradient(transparent 70%,rgba(250,230,80,.6) 70%);"
		+ "outline:2px solid rgba(245,205,0,.45);outline-offset:2px;border-radius:3px;"
		+ "}"
		+ "a." + CURRENT_CLASS + "." + PLAYING_CLASS + "{"
		+ "animation:ametoPulse .95s ease-in-out infinite alternate;"
		+ "}"
		+ "@keyframes ametoPulse{from{filter:brightness(1);}to{filter:brightness(1.35);}}";
	document.head.append(style);

	const ui = document.createElement("div");
	ui.id = UI_ID;

	const prevButton = document.createElement("button");
	prevButton.type = "button";
	prevButton.textContent = "◀";

	const playPauseButton = document.createElement("button");
	playPauseButton.type = "button";
	playPauseButton.textContent = "⏸";

	const nextButton = document.createElement("button");
	nextButton.type = "button";
	nextButton.textContent = "▶";

	const title = document.createElement("span");
	title.className = "ameto-title";

	ui.append(prevButton, playPauseButton, nextButton, title);
	document.body.append(ui);

	const audio = new Audio();
	audio.preload = "auto";
	audio.crossOrigin = "anonymous";

	let index = 0;

	const clearClasses = () => {
		links.forEach(({ el }) => el.classList.remove(CURRENT_CLASS, PLAYING_CLASS));
	};

	const markCurrent = () => {
		clearClasses();
		const current = links[index];
		if (!current) return;
		current.el.classList.add(CURRENT_CLASS);
		title.textContent = (index + 1) + "/" + links.length + " " + current.label;
	};

	const updatePlayState = () => {
		const current = links[index];
		if (!current) return;
		playPauseButton.textContent = audio.paused ? "▶" : "⏸";
		current.el.classList.toggle(PLAYING_CLASS, !audio.paused);
	};

	const loadTrack = (nextIndex) => {
		if (nextIndex < 0 || nextIndex >= links.length) return false;
		index = nextIndex;
		audio.src = links[index].url;
		markCurrent();
		updatePlayState();
		return true;
	};

	const playTrack = async (nextIndex) => {
		if (typeof nextIndex === "number") {
			const loaded = loadTrack(nextIndex);
			if (!loaded) return;
		}
		try {
			await audio.play();
		} catch (error) {
			console.error(error);
			const current = links[index];
			const needsProxy = location.protocol === "https:" && current && isHTTPURL(current.originalURL) && !proxyBase;
			if (needsProxy) {
				const input = prompt(
					"httpのmp3をhttps経由で取得するためのプロキシURLを入力してください。\n例: https://example.com/proxy?url=\nまたは: https://example.com/proxy/{url}",
					"",
				);
				if (input && /^https:\/\//i.test(input)) {
					proxyBase = input.trim();
					try {
						localStorage.setItem(PROXY_STORAGE_KEY, proxyBase);
					} catch {
						// no-op
					}
					applyProxyToLinks();
					loadTrack(index);
					try {
						await audio.play();
					} catch (retryError) {
						console.error(retryError);
					}
				}
			}
		}
		updatePlayState();
	};

	audio.addEventListener("play", updatePlayState);
	audio.addEventListener("pause", updatePlayState);
	audio.addEventListener("ended", () => {
		if (index + 1 < links.length) {
			playTrack(index + 1);
			return;
		}
		updatePlayState();
	});

	prevButton.onclick = () => {
		if (index > 0) playTrack(index - 1);
	};

	nextButton.onclick = () => {
		if (index + 1 < links.length) playTrack(index + 1);
	};

	playPauseButton.onclick = async () => {
		if (audio.paused) {
			await playTrack();
		} else {
			audio.pause();
		}
		updatePlayState();
	};

	loadTrack(0);
	playTrack();

	window[PLAYER_KEY] = {
		destroy: () => {
			audio.pause();
			audio.src = "";
			clearClasses();
			ui.remove();
			document.getElementById(STYLE_ID)?.remove();
			delete window[PLAYER_KEY];
		},
	};
})();
