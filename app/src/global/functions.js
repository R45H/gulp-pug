/* Проверка наличия скролла на странице */
function hasScroll(a) {
	var d = document,
		b = d.body,
		e = d.documentElement,
		c = "client" + a;
	a = "scroll" + a;
	return /CSS/.test(d.compatMode)? (e[c]< e[a]) : (b[c]< b[a])
}
/* ========== */

/* Узнать ширину ползунка */
function getScrollbarWidth() {
	var
		documentWidth = parseInt(document.documentElement.clientWidth),
		windowWidth = parseInt(window.innerWidth);
	return windowWidth - documentWidth;
}
/* ========== */

/* Сделать боди фиксированным */
function toggleBodyScroll(noscroll) {
	var
		$body = $('body'),
		noScrollClass = 'noscroll';

	if (noscroll === false) {
		$body
			.css('padding-right', '')
			.removeClass(noScrollClass);
	} else {
		$body
			.css('padding-right', getScrollbarWidth())
			.addClass(noScrollClass);
	}
}
/* ========== */
