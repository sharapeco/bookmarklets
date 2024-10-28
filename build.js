const path = require('path')
const fs = require('fs')
const find = require('find')
const UglifyJS = require('uglify-js')

const SRC = path.join(__dirname, 'src')
const DEST = path.join(__dirname, 'out')

const uglifyOptions = {
}

find
.fileSync(/[.]js$/, SRC)
.forEach(file => {
	const jsName = path.basename(file)
	const baseName = path.basename(file, '.js')
	const out = path.join(DEST, baseName + '.url')
	const input = {
		[jsName]: fs.readFileSync(file, 'UTF-8')
	}
	const result = UglifyJS.minify(input, uglifyOptions)

	if (result.error) {
		console.log(result.error)
		return
	}
	if (result.warning) {
		console.log(jsName + ': ' + result.warning)
	}

	fs.writeFileSync(out, [
		'[InternetShortcut]',
		'URL=javascript:' + result.code,
		'IDList=',
		'HotKey=0',
		''
	].join('\r\n'))
})
