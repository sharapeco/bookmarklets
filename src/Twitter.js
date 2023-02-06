(() => {
	let container

	let running = false

	const sleep = (milliseconds) => {
		return new Promise((resolve) => {
			setTimeout(resolve, milliseconds)
		})
	}

	const findPromotions = () => {
		if (!container) return
		return [].filter.call(container.querySelectorAll('article'), (el) => />プロモーション</.test(el.innerHTML))
	}

	const muteAccount = async (article) => {
		article.querySelector('[aria-haspopup]').click()
		await sleep(100)
		const muteButton = [].find.call(
			document.querySelectorAll('[role=menu] [role=menuitem]'),
			(menuItem) => /をミュート</.test(menuItem.innerHTML)
		)
		if (muteButton) {
			muteButton.click()
			await sleep(100)
		}
	}

	/**
	 * @param {MutationRecord[]} mutationsList
	 */
	const onDOMChange = async (mutationsList) => {
		if (running) return

		const childListChanged = mutationsList.some((m) => m.type === 'childList')
		if (!childListChanged) return

		running = true

		const promotions = findPromotions()
		for (const article of promotions) {
			await muteAccount(article)
		}

		running = false
	}
	const observer = new MutationObserver(onDOMChange)

	const observe = () => {
		container = document.querySelector('main')
		if (!container) return
		observer.observe(container, {
			childList: true,
			subtree: true
		})
	}

	observe()
})()
