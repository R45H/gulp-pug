// Для ссылок с href='#' и наличием только атрибутов class, href и style отключается стандартное поведение ссылки
$(document).on('click', 'a', function(event) {
	var $this = $(this);

	if ($this.attr('href') != '#') return;

	if (
		(this.attributes.length < 4 && $this.attr('class') && $this.attr('href') && $this.attr('style')) ||
		(this.attributes.length < 3 && $this.attr('class') && $this.attr('href')) ||
		(this.attributes.length < 2 && !$this.attr('class') && $this.attr('href'))
	) {
		event.preventDefault();
	}
});

$('.js-print').on('click', function() {
	window.print();
	return false;
});

svg4everybody();