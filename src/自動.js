(() => {
	switch (location.origin) {
		case 'https://secure.goldpoint.co.jp':
			switch (location.pathname) {
				case '/gpm/membertop.html': {
					const link = document.querySelector('a[href*="/web_meisai/"]')
					link && link.click()
					break
				}
				case '/memx/web_meisai/top/index.html': {
					const link = document.querySelector('.btn_big_size')
					if (!link || !/\bCSV\b/.test(link.textContent)) break
					link.click()
					break
				}
			}
			break
	}
})()