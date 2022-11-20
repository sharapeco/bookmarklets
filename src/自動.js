((document) => {
	const { origin, pathname } = location;
	const { body } = document;
	const qs = (query, p) => (p || document).querySelector(query);
	const qsa = (query, p) => [].slice.call((p || document).querySelectorAll(query));
	const text = (query, p) => qs(query, p).textContent.trim();
	const csvCol = (value) => '"' + value.replace(/"/g, '""') + '"';
	const padDatePart = (part) => part.padStart(2, '0')
	// const sleep = (time) => {
	// 	return new Promise((resolve) => {
	// 		setTimeout(resolve, time)
	// 	})
	// };
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

	switch (origin) {
		case 'https://secure.goldpoint.co.jp':
			switch (pathname) {
				case '/gpm/membertop.html': {
					const link = qs('a[href*="/web_meisai/"]')
					link && link.click()
					break
				}
				case '/memx/web_meisai/top/index.html': {
					const link = qs('.btn_big_size')
					if (!link || !/\bCSV\b/.test(link.textContent)) break
					link.click()
					break
				}
			}
			break
		case 'https://www.aeon.co.jp':
			switch (pathname) {
				case '/auth/realms/msweb/protocol/openid-connect/auth': {
					const input = qs('input#username')
					if (!input) break
					input.autocomplete = 'username'
					input.focus()
					break
				}
				case '/app/details/': {
					const title = text('.m-debitaccountpanel_billingdate').replace(/^.*(\d{4})年(\d+)月.*$/, '$1-$2').split('-').map(padDatePart).join('-')
					const headers = ['日付', '摘要', '金額'];
					const rows = qsa('.o-list > li').map((li) => [
						text('.m-listitem_thumb_date', li).replace(/[年月日]/g, '-').split('-').slice(0, 3).map(padDatePart).join('-'),
						text('.u-omitpipe_contents', li),
						text('.m-listitem_thumb_price', li).replace('円', ''),
					])
					const csv = headers.join(',') + '\r\n' + rows.map((cols) => cols.map(csvCol).join(',')).join('\r\n')
					console.log('csv created', csv)
					const blob = new Blob([csv], { type: 'text/csv' })
					const link = document.createElement('a')
					link.href = URL.createObjectURL(blob)
					link.target = "_blank"
					link.download = `aeon-card-${title}-00.csv`
					body.appendChild(link)
					link.click()
					break
				}
			}
	}
})(document)