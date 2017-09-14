/* Карта */
function initMap() {
	var $map = $('.map');

	if (!$map.length || $map.is(':hidden')) return;

	/* Точки */
	var dot1 = {lat: 59.940776, lng: 30.369471}; // Адрес 1
	/* ===== */

	/* Карты */
	if (document.getElementById('map')) { // Карта 1
		var map1 = new google.maps.Map(document.getElementById('map'), {
			zoom: 13,
			center: dot1,
			scrollwheel: false,
			mapTypeControl: true,
			streetViewControl: false,
			mapTypeControlOptions: {
				mapTypeIds: [
					google.maps.MapTypeId.roadmap
				]
			}
		});

		/* Образец карточки */
		var contentString1 = '<div class="map__info">Адрес 1</div>';
		/* ================ */

		/* Рамка */
		var infoWindow = new google.maps.InfoWindow({
			content: contentString1
		});
		/* ===== */

		/* Маркеры */
		var marker1 = new google.maps.Marker({
			position: dot1,
			map: map1
		});

		marker1.addListener('click', function() {
			infoWindow.open(map1, marker1);
		});
		/* ======= */

		// При ресайзе
		google.maps.event.addDomListener(window, "resize", function() {
			google.maps.event.trigger(map1, "resize");
			map1.panTo(dot1);
		});
		// =====

		/* ===== */
	}
	/* ===== */
}
/* ========== */
