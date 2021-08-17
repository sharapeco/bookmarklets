[].map.call(document.querySelectorAll('script'), el => el.parentNode.removeChild(el))
document.documentElement.innerHTML = document.documentElement.innerHTML
