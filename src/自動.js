(() => {
	const { origin, pathname } = location
	const qs = (query) => document.querySelector(query)

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
			}
	}
})()