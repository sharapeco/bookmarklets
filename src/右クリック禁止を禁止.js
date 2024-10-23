((elements, events, stopEvent) => {
	// NOTE: map のほうが forEach より短いので
	elements.map(
		elem => events.map(type => {
			elem[`on${type}`] = stopEvent
			elem.style.userSelect = 'auto'
		})
	);
	events.map(type => {
		[].map.call(document.querySelectorAll(`[on${type}]`), elem => {
			elem[`on${type}`] = null
		})
	})
})(
	// elements
	[
		document.body,
		document.documentElement,
		...[].slice.call(document.querySelectorAll("img")),
	],
	// events
	[
		'contextmenu',
		'copy',
		'mousedown',
		'selectstart',
	],
	// stopEvent
	e => e.stopPropagation()
)
