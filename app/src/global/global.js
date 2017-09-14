$("a[href='#']").on('click', function(event) {
	event.preventDefault();
});

$('.js-print').on('click', function() {
	window.print();
	return false;
});