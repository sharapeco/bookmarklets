fetch('https://suzume.dev/tools/dummy/names.csv')
	.then((res) => res.text())
	.then((data) => {
		let used = {};
		const cols = [
			/slug/i,
			/company.*name/i,
			/company.*kana/i,
			/name/i,
			/kana/i,
			/(postal_?code|zip)/i,
			/(pref|region)/i,
			/(city|locality)/i,
			/(street|address)/i,
			/(tel|phone)/i,
			/fax/i,
			/email/i,
			/(website|url)/i,
		],
			items = data.split('\n').map((line) => line.split(',')),
			storageKey = 'local.bookmarklets.dummyData.index',
			prev = localStorage.getItem(storageKey),
			index = ((prev == null ? -1 : +prev) + 1) % items.length;

		[].forEach.call(document.querySelectorAll('input[name], textarea[name]'), (input) => {
			for (const [colIndex, col] of Object.entries(cols)) {
				if (!used[colIndex] && col.test(input.getAttribute('name'))) {
					input.value = items[index][colIndex];
					used[colIndex] = true;
					break;
				}
			}
		});

		localStorage.setItem(storageKey, index.toString());
	});
