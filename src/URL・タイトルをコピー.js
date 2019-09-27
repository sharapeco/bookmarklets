// <div> 経由でコピーする
(value => {
	// get <div>
	((doc, wrap, textarea, label) => {
		wrap = doc.createElement('div')
		textarea = doc.createElement('div')
		Object.assign(textarea.style, {
			fontSize: '18px',
			whiteSpace: 'pre-line'
		})
		label = doc.createElement('div')
		label.textContent = 'Click this area to copy.'
		Object.assign(label.style, {
			fontSize: '75%',
			color: '#777'
		})
		Object.assign(wrap.style, {
			position: 'fixed',
			zIndex: '99999',
			left: '10px',
			top: '10px',
			width: '400px',
			padding: '10px',
			background: '#fff',
			borderRadius: '5px',
			boxShadow: '0 2px 5px rgba(0,0,0,20%)',
			font: '400 16px/1.2 sans-serif',
			lineHeight: '',
			cursor: 'pointer'
		})
		wrap.appendChild(textarea)
		wrap.appendChild(label)
		wrap.onclick = () => {
			doc.getSelection().selectAllChildren(textarea)
			doc.execCommand('copy')
			doc.body.removeChild(wrap)
		}
		doc.body.appendChild(wrap)
		return textarea
	})(document)
	.textContent = value
})(
	// ここにコピーする文字列
	document.title + "\n" + document.URL
)
