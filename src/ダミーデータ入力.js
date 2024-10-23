fetch('https://suzume.dev/tools/dummy/names.csv')
	.then((res) => res.text())
	.then((data) => {
		let used = {};
		const cols = [
			/slug/i, // 0
			/email/i, // 11
			/(website|url)/i, // 12
			/company.*name/i, // 1
			/company.*kana/i, // 2
			/sei/i,
			/mei/i,
			/sei.kana/i,
			/mei.kana/i,
			/name/i, // 3
			/kana/i, // 4
			/(postal_?code|zip)/i, // 5
			/(pref|region)/i, // 6
			/(city|locality)/i, // 7
			/(street|address)/i, // 8
			/(tel|phone)/i, // 9
			/fax/i, // 10
		],
			items = data.split('\n')
				.map((line) => line.split(','))
				.map((v) => {
					const [sei, mei] = v[3].split(' '),
						[seiKana, meiKana] = v[4].split(' ');
					return [v[0], ...v.slice(11, 13), ...v.slice(1, 3), sei, mei, seiKana, meiKana, ...v.slice(3, 11)];
				}),
			storageKey = 'local.bookmarklets.dummyData.index',
			prev = localStorage.getItem(storageKey),
			index = ((prev == null ? -1 : +prev) + 1) % items.length;

		[].forEach.call(document.querySelectorAll('input[name], textarea[name]'), (input) => {
			for (const [colIndex, col] of Object.entries(cols)) {
				if (!used[colIndex] && col.test(input.getAttribute('name'))) {
					input.value = items[index][colIndex];
					// メールアドレスは確認入力がある可能性があるので2回以上入力
					if (!col.test("email")) used[colIndex] = true;
					break;
				}
			}
		});

		localStorage.setItem(storageKey, index.toString());
	});
