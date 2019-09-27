((elements, events, stopEvent) => {
	// NOTE: map のほうが forEach より短いので
	elements.map(
		elem => events.map(type => {
			elem['on' + type] = stopEvent
			elem.style.userSelect = 'auto'
		})
	)
})(
	// elements
	[
		document.body,
		document.documentElement,
	],
	// events
	[
		'contextmenu',
		'selectstart',
		'copy',
	],
	// stopEvent
	e => e.stopPropagation()
)
