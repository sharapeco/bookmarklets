((query, create) => {
	[].forEach.call(document.querySelectorAll(query), input => {
		input.parentNode.insertBefore(
			create(input.getAttribute('name')),
			input
		)
	})
})(
	'input[name], textarea[name], select[name], button[name]',
	name => {
		const el = document.createElement('span')
		Object.assign(el.style, {
			display: 'inline-block',
			margin: '0 2px 2px',
			padding: '8px',
			font: '300 12px/1 "Verdana", sans-serif',
			color: '#666',
			background: '#ffffeb',
			border: 'solid 1px #ddd',
			borderRadius: '3px'
		})
		el.textContent = name
		return el
	}
)
