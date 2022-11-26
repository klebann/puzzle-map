const map = L.map('map').setView([53.43, 14.55], 13);

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

function geoFindMe() {
  const status = document.querySelector('#status');
  const location = document.querySelector('#mylocation');

  location.textContent = '';

  function success(position) {
    const latitude  = position.coords.latitude;
    const longitude = position.coords.longitude;

    status.textContent = '';
    location.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
		map.setView([latitude, longitude]);
  }

  function error() {
    status.textContent = 'Unable to retrieve your location';
  }

  if (!navigator.geolocation) {
    status.textContent = 'Geolocation is not supported by your browser';
  } else {
    status.textContent = 'Locating…';
    navigator.geolocation.getCurrentPosition(success, error);
  }

}

document.querySelector("#geolocationButton").addEventListener("click", geoFindMe);