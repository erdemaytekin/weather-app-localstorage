const apiKey = "fc11c37bf3de43644f9f6b23ecda8f68";  // Bu API anahtarını OpenWeatherMap’ten aldık.

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityName = document.getElementById('city-name');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const feelsLike = document.getElementById('feels-like');
const pressure = document.getElementById('pressure');
const sunriseEl = document.getElementById('sunrise');
const sunsetEl = document.getElementById('sunset');
const weatherInfo = document.getElementById('weather-info');
const errorMessage = document.getElementById('error-message');
const loadingSpinner = document.getElementById('loading');
const rainContainer = document.getElementById('rain-container');

searchBtn.addEventListener('click', getWeather);
cityInput.addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    getWeather();
  }
});

function createRaindrops() {
  rainContainer.innerHTML = '';
  const numberOfDrops = 100;

  for (let i = 0; i < numberOfDrops; i++) {
    const drop = document.createElement('div');
    drop.classList.add('raindrop');

    drop.style.left = `${Math.random() * 100}%`;
    drop.style.animationDuration = `${0.7 + Math.random() * 0.3}s`;
    drop.style.animationDelay = `${Math.random() * 0.5}s`;
    drop.style.opacity = `${0.4 + Math.random() * 0.6}`;

    rainContainer.appendChild(drop);
  }
}

createRaindrops();

function getWeather() {
  const city = cityInput.value.trim();
  if (city === '') {
    alert('Lütfen bir şehir ismi girin');
    return;
  }

  localStorage.setItem("lastCity", city);

  loadingSpinner.style.display = 'block';
  weatherInfo.classList.remove('show');
  errorMessage.style.display = 'none';

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
    .then(response => {
      if (!response.ok) throw new Error('City not found');
      return response.json();
    })
    .then(data => {
      displayWeatherData(data);
      applyWeatherEffects(data.weather[0].main);
      cityInput.value = '';
    })
    .catch(error => {
      showError();
      console.error(error);
    });
}

function applyWeatherEffects(weatherMain) {
  document.body.className = '';
  rainContainer.classList.remove('show');

  switch(weatherMain.toLowerCase()) {
    case 'rain':
    case 'drizzle':
    case 'shower rain':
      document.body.classList.add('rainy');
      rainContainer.classList.add('show');
      break;
    case 'clear':
      document.body.classList.add('sunny');
      break;
    case 'clouds':
      document.body.classList.add('cloudy');
      break;
    case 'thunderstorm':
      document.body.classList.add('stormy');
      rainContainer.classList.add('show');
      break;
    case 'snow':
      document.body.classList.add('snowy');
      break;
    case 'mist':
    case 'fog':
    case 'haze':
      document.body.classList.add('misty');
      break;
    default:
      document.body.classList.add('default');
  }
}

function translateDescription(desc) {
  const dictionary = {
    "clear sky": "Açık hava",
    "few clouds": "Az bulutlu",
    "scattered clouds": "Parçalı bulutlu",
    "broken clouds": "Çok bulutlu",
    "overcast clouds": "Kapalı hava",
    "shower rain": "Sağanak yağış",
    "rain": "Yağmurlu",
    "light rain": "Hafif yağmur",
    "moderate rain": "Orta şiddetli yağmur",
    "thunderstorm": "Gök gürültülü fırtına",
    "snow": "Karlı",
    "mist": "Sisli",
    "haze": "Puslu",
    "fog": "Sisli",
    "drizzle": "Çiseleyen Yağmur"
  };
  return dictionary[desc.toLowerCase()] || desc;
}

function displayWeatherData(data) {
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  temperature.textContent = Math.round(data.main.temp);
  description.textContent = translateDescription(data.weather[0].description);
  humidity.textContent = data.main.humidity;
  windSpeed.textContent = data.wind.speed;
  feelsLike.textContent = Math.round(data.main.feels_like);
  pressure.textContent = data.main.pressure;

  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  sunriseEl.textContent = sunrise;
  sunsetEl.textContent = sunset;

  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  loadingSpinner.style.display = 'none';
  weatherInfo.classList.add('show');

  setTimeout(() => {
    weatherIcon.classList.add('animated');
  }, 300);
}

function showError() {
  loadingSpinner.style.display = 'none';
  weatherInfo.classList.remove('show');
  errorMessage.style.display = 'block';
}

function updateTimeBasedEffects() {
  const now = new Date();
  const hours = now.getHours();

  if (hours >= 19 || hours < 6) {
    document.body.classList.add('night-mode');
  } else {
    document.body.classList.remove('night-mode');
  }
}

function addDynamicStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .rainy { background: linear-gradient(135deg, #57839d 0%, #456c85 100%); }
    .sunny { background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%); }
    .cloudy { background: linear-gradient(135deg, #bdc3c7 0%, #89a0b0 100%); }
    .stormy { background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%); }
    .snowy { background: linear-gradient(135deg, #e6e6e6 0%, #b3d1ff 100%); }
    .misty { background: linear-gradient(135deg, #b8c6db 0%, #f5f7fa 100%); }
    .night-mode { filter: brightness(0.8) saturate(0.8); }
    .night-mode .sun { background: radial-gradient(circle, #d6d6d6 20%, #b0b0b0 70%, transparent); box-shadow: 0 0 60px #b0b0b0; }
  `;
  document.head.appendChild(styleElement);
}

window.addEventListener('load', () => {
  addDynamicStyles();
  updateTimeBasedEffects();

  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    cityInput.value = lastCity;
    getWeather();
  }

  setInterval(updateTimeBasedEffects, 3600000);
});
