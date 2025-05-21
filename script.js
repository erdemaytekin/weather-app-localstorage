const apiKey = "fc11c37bf3de43644f9f6b23ecda8f68" // Bu API anahtarını OpenWeatherMap'ten aldık.

// DOM Elementleri
const cityInput = document.getElementById("city-input")
const searchBtn = document.getElementById("search-btn")
const cityName = document.getElementById("city-name")
const weatherIcon = document.getElementById("weather-icon")
const temperature = document.getElementById("temperature")
const description = document.getElementById("description")
const humidity = document.getElementById("humidity")
const windSpeed = document.getElementById("wind-speed")
const feelsLike = document.getElementById("feels-like")
const pressure = document.getElementById("pressure")
const sunriseEl = document.getElementById("sunrise")
const sunsetEl = document.getElementById("sunset")
const weatherInfo = document.getElementById("weather-info")
const errorMessage = document.getElementById("error-message")
const loadingSpinner = document.getElementById("loading")
const rainContainer = document.getElementById("rain-container")
const forecastContainer = document.getElementById("forecast-container")
const favoritesContainer = document.getElementById("favorites-container")
const addToFavoritesBtn = document.getElementById("add-to-favorites")
const unitToggle = document.getElementById("unit-toggle")
const locationBtn = document.getElementById("location-btn")
const chartContainer = document.getElementById("temperature-chart")
const forecastNoData = document.getElementById("forecast-no-data")
const chartNoData = document.getElementById("chart-no-data")
const localTimeEl = document.getElementById("local-time")
const sunElement = document.querySelector(".sun")
const moonElement = document.querySelector(".moon")

// Tab Elementleri
const tabButtons = document.querySelectorAll(".tab-btn")
const tabContents = document.querySelectorAll(".tab-content")

// Birim değişkeni (metric: Celsius, imperial: Fahrenheit)
let units = "metric"
let currentCity = ""
let favorites = JSON.parse(localStorage.getItem("favoritesCities")) || []
let forecastData = null
let currentTimezone = 0

// Tab değiştirme işlevi
function switchTab(tabId) {
  // Tüm tab içeriklerini gizle
  tabContents.forEach((content) => {
    content.classList.remove("active")
  })

  // Tüm tab butonlarını pasif yap
  tabButtons.forEach((btn) => {
    btn.classList.remove("active")
  })

  // Seçilen tab'ı aktif et
  document.getElementById(`${tabId}-tab`).classList.add("active")
  document.querySelector(`[data-tab="${tabId}"]`).classList.add("active")

  // Eğer tahmin sekmesine geçilirse ve veri varsa göster
  if (tabId === "forecast" && forecastData) {
    forecastNoData.style.display = "none"
    displayForecast(forecastData)
  }

  // Eğer grafik sekmesine geçilirse ve veri varsa göster
  if (tabId === "chart" && forecastData) {
    chartNoData.style.display = "none"
    createTemperatureChart(forecastData)
  }

  // Eğer favoriler sekmesine geçilirse, favori listesini güncelle
  if (tabId === "favorites") {
    displayFavorites()
  }
}

// Tab butonlarına olay dinleyicisi ekle
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tabId = button.getAttribute("data-tab")
    switchTab(tabId)
  })
})

// Sayfa yüklendiğinde favori şehirleri göster
function displayFavorites() {
  favoritesContainer.innerHTML = ""

  if (favorites.length === 0) {
    favoritesContainer.innerHTML = '<p class="no-favorites">Henüz favori şehir eklenmedi</p>'
    return
  }

  favorites.forEach((city) => {
    const favoriteItem = document.createElement("div")
    favoriteItem.classList.add("favorite-item")
    favoriteItem.innerHTML = `
      <span>${city}</span>
      <div class="favorite-actions">
        <button class="get-weather-btn" data-city="${city}"><i class="fas fa-cloud-sun"></i></button>
        <button class="remove-favorite-btn" data-city="${city}"><i class="fas fa-trash"></i></button>
      </div>
    `
    favoritesContainer.appendChild(favoriteItem)
  })

  // Favori şehir hava durumu butonlarına olay dinleyicisi ekle
  document.querySelectorAll(".get-weather-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const city = this.getAttribute("data-city")
      cityInput.value = city
      getWeather()
      switchTab("current") // Güncel hava durumu sekmesine geç
    })
  })

  // Favori şehir silme butonlarına olay dinleyicisi ekle
  document.querySelectorAll(".remove-favorite-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const city = this.getAttribute("data-city")
      removeFavorite(city)
    })
  })
}

// Favori şehir ekle
function addToFavorites(city) {
  if (!favorites.includes(city)) {
    favorites.push(city)
    localStorage.setItem("favoritesCities", JSON.stringify(favorites))
    showNotification(`${city} favorilere eklendi!`, "success")
  } else {
    showNotification(`${city} zaten favorilerinizde!`, "info")
  }
}

// Favori şehir çıkar
function removeFavorite(city) {
  favorites = favorites.filter((item) => item !== city)
  localStorage.setItem("favoritesCities", JSON.stringify(favorites))
  displayFavorites()
  showNotification(`${city} favorilerden çıkarıldı!`, "info")
}

// Bildirim göster
function showNotification(message, type) {
  const notification = document.createElement("div")
  notification.classList.add("notification", `notification-${type}`)
  notification.textContent = message

  document.body.appendChild(notification)

  // Animasyon ekle
  setTimeout(() => {
    notification.classList.add("show")
  }, 10)

  // Belirli bir süre sonra kaldır
  setTimeout(() => {
    notification.classList.remove("show")
    setTimeout(() => {
      notification.remove()
    }, 300)
  }, 3000)
}

searchBtn.addEventListener("click", getWeather)
cityInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    getWeather()
  }
})

// Favori ekleme butonuna olay dinleyicisi ekle
addToFavoritesBtn.addEventListener("click", () => {
  if (currentCity) {
    if (favorites.includes(currentCity)) {
      removeFavorite(currentCity)
      addToFavoritesBtn.classList.remove("active")
      addToFavoritesBtn.style.color = "#ccc"
    } else {
      addToFavorites(currentCity)
      addToFavoritesBtn.classList.add("active")
      addToFavoritesBtn.style.color = "#ff6b6b"
    }
  } else {
    showNotification("Lütfen önce bir şehir arayın!", "error")
  }
})

// Birim değiştirme düğmesine olay dinleyicisi ekle
unitToggle.addEventListener("change", function () {
  units = this.checked ? "imperial" : "metric"
  if (currentCity) {
    getWeather(true)
  }
})

// Konum butonuna olay dinleyicisi ekle
locationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    loadingSpinner.style.display = "block"
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        getWeatherByCoords(lat, lon)
      },
      (error) => {
        loadingSpinner.style.display = "none"
        showNotification("Konum alınamadı: " + error.message, "error")
      },
    )
  } else {
    showNotification("Tarayıcınız konum hizmetini desteklemiyor!", "error")
  }
})

function createRaindrops() {
  rainContainer.innerHTML = ""
  const numberOfDrops = 100

  for (let i = 0; i < numberOfDrops; i++) {
    const drop = document.createElement("div")
    drop.classList.add("raindrop")

    drop.style.left = `${Math.random() * 100}%`
    drop.style.animationDuration = `${0.7 + Math.random() * 0.3}s`
    drop.style.animationDelay = `${Math.random() * 0.5}s`
    drop.style.opacity = `${0.4 + Math.random() * 0.6}`

    rainContainer.appendChild(drop)
  }
}

createRaindrops()

// Koordinatlara göre hava durumu al
function getWeatherByCoords(lat, lon) {
  loadingSpinner.style.display = "block"
  weatherInfo.classList.remove("show")
  errorMessage.style.display = "none"

  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`)
    .then((response) => {
      if (!response.ok) throw new Error("Hava durumu alınamadı")
      return response.json()
    })
    .then((data) => {
      currentCity = data.name
      cityInput.value = data.name
      currentTimezone = data.timezone // Şehrin saat dilimi farkını kaydet
      displayWeatherData(data)
      getForecast(lat, lon)
      applyWeatherEffects(data.weather[0].main)
      updateLocalTime() // Yerel saati güncelle
      applyTimeBasedBackground() // Zamana göre arka planı güncelle

      // Güncel hava durumu sekmesine geç
      switchTab("current")
    })
    .catch((error) => {
      showError()
      console.error(error)
    })
}

function getWeather(skipInput = false) {
  const city = skipInput ? currentCity : cityInput.value.trim()
  if (city === "" && !skipInput) {
    showNotification("Lütfen bir şehir ismi girin", "error")
    return
  }

  currentCity = city
  localStorage.setItem("lastCity", city)

  loadingSpinner.style.display = "block"
  weatherInfo.classList.remove("show")
  errorMessage.style.display = "none"

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`)
    .then((response) => {
      if (!response.ok) throw new Error("City not found")
      return response.json()
    })
    .then((data) => {
      currentTimezone = data.timezone // Şehrin saat dilimi farkını kaydet
      displayWeatherData(data)
      getForecast(data.coord.lat, data.coord.lon)
      applyWeatherEffects(data.weather[0].main)
      updateLocalTime() // Yerel saati güncelle
      applyTimeBasedBackground() // Zamana göre arka planı güncelle
      if (!skipInput) cityInput.value = ""

      // Güncel hava durumu sekmesine geç
      switchTab("current")
    })
    .catch((error) => {
      showError()
      console.error(error)
    })
}

// Şehrin yerel saatini güncelle
function updateLocalTime() {
  // UTC zamanını al
  const now = new Date()
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000

  // Şehrin yerel saatini hesapla (timezone saniye cinsinden)
  const cityTime = new Date(utcTime + 1000 * currentTimezone)

  // Saati formatla
  const timeString = cityTime.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  // Tarihi formatla
  const dateString = cityTime.toLocaleDateString("tr-TR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Yerel saat bilgisini güncelle
  localTimeEl.textContent = `Yerel Saat: ${timeString} - ${dateString}`

  return cityTime
}

// Zamana göre arka plan rengini değiştir
function applyTimeBasedBackground() {
  // Şehrin yerel saatini al
  const cityTime = updateLocalTime()
  const hours = cityTime.getHours()

  // Tüm zaman sınıflarını temizle
  document.body.classList.remove("morning", "afternoon", "evening", "night")

  // Güneş ve ay elementlerini gizle
  sunElement.style.display = "none"
  moonElement.style.display = "none"

  // Saate göre arka plan rengini ayarla
  if (hours >= 5 && hours < 12) {
    // Sabah
    document.body.classList.add("morning")
    sunElement.style.display = "block"
  } else if (hours >= 12 && hours < 17) {
    // Öğleden sonra
    document.body.classList.add("afternoon")
    sunElement.style.display = "block"
  } else if (hours >= 17 && hours < 20) {
    // Akşam
    document.body.classList.add("evening")
    sunElement.style.display = "block"
  } else {
    // Gece
    document.body.classList.add("night")
    moonElement.style.display = "block"
  }
}

// 5 günlük tahmin al
function getForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`)
    .then((response) => {
      if (!response.ok) throw new Error("Forecast data not found")
      return response.json()
    })
    .then((data) => {
      forecastData = data // Veriyi global değişkende sakla

      // Eğer tahmin sekmesi aktifse, tahminleri göster
      if (document.getElementById("forecast-tab").classList.contains("active")) {
        displayForecast(data)
      }

      // Eğer grafik sekmesi aktifse, grafiği göster
      if (document.getElementById("chart-tab").classList.contains("active")) {
        createTemperatureChart(data)
      }
    })
    .catch((error) => {
      console.error("Tahmin verisi alınamadı:", error)
    })
}

// Tahmin verilerini göster
function displayForecast(data) {
  forecastContainer.innerHTML = ""
  forecastNoData.style.display = "none"

  // Günlük tahminleri grupla (her gün için bir tahmin)
  const dailyForecasts = {}

  data.list.forEach((item) => {
    const date = new Date(item.dt * 1000)
    const day = date.toLocaleDateString("tr-TR", { weekday: "short" })

    if (!dailyForecasts[day] || date.getHours() === 12) {
      dailyForecasts[day] = item
    }
  })

  // İlk 5 günü göster
  Object.keys(dailyForecasts)
    .slice(0, 5)
    .forEach((day) => {
      const forecast = dailyForecasts[day]
      const date = new Date(forecast.dt * 1000)
      const formattedDate = date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })

      const forecastItem = document.createElement("div")
      forecastItem.classList.add("forecast-item")

      const tempUnit = units === "metric" ? "°C" : "°F"

      forecastItem.innerHTML = `
      <div class="forecast-day">${day}</div>
      <div class="forecast-date">${formattedDate}</div>
      <div class="forecast-icon">
        <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}">
      </div>
      <div class="forecast-temp">${Math.round(forecast.main.temp)}${tempUnit}</div>
      <div class="forecast-desc">${translateDescription(forecast.weather[0].description)}</div>
    `

      forecastContainer.appendChild(forecastItem)
    })
}

// Sıcaklık grafiği oluştur
function createTemperatureChart(data) {
  // Canvas temizle
  chartContainer.innerHTML = '<canvas id="temp-chart"></canvas>'
  chartNoData.style.display = "none"

  const canvas = document.getElementById("temp-chart")
  const ctx = canvas.getContext("2d")

  // Veri hazırla - sonraki 24 saat
  const next24Hours = data.list.slice(0, 8)
  const labels = next24Hours.map((item) => {
    const date = new Date(item.dt * 1000)
    return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
  })

  const temperatures = next24Hours.map((item) => Math.round(item.main.temp))
  const tempUnit = units === "metric" ? "°C" : "°F"

  // Grafik boyutları
  canvas.width = chartContainer.offsetWidth
  canvas.height = 300

  // Grafik çiz
  const padding = 40
  const chartWidth = canvas.width - padding * 2
  const chartHeight = canvas.height - padding * 2

  // Maksimum ve minimum sıcaklıkları bul
  const maxTemp = Math.max(...temperatures) + 2
  const minTemp = Math.min(...temperatures) - 2
  const tempRange = maxTemp - minTemp

  // Arka plan
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Başlık
  ctx.fillStyle = "#0083b0"
  ctx.font = "16px Poppins"
  ctx.textAlign = "center"
  ctx.fillText("24 Saatlik Sıcaklık Tahmini", canvas.width / 2, 20)

  // Y ekseni çizgileri ve etiketleri
  ctx.strokeStyle = "rgba(0, 131, 176, 0.2)"
  ctx.fillStyle = "#0083b0"
  ctx.font = "12px Poppins"
  ctx.textAlign = "right"

  const tempStep = tempRange / 4
  for (let i = 0; i <= 4; i++) {
    const temp = maxTemp - tempStep * i
    const y = padding + (chartHeight * i) / 4

    // Yatay çizgi
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(padding + chartWidth, y)
    ctx.stroke()

    // Sıcaklık etiketi
    ctx.fillText(`${Math.round(temp)}${tempUnit}`, padding - 5, y + 4)
  }

  // X ekseni etiketleri
  ctx.textAlign = "center"
  ctx.fillStyle = "#0083b0"

  const barWidth = chartWidth / temperatures.length

  for (let i = 0; i < labels.length; i++) {
    const x = padding + i * barWidth + barWidth / 2
    ctx.fillText(labels[i], x, canvas.height - 10)
  }

  // Sıcaklık çizgisi
  ctx.strokeStyle = "#0083b0"
  ctx.lineWidth = 3
  ctx.beginPath()

  for (let i = 0; i < temperatures.length; i++) {
    const x = padding + i * barWidth + barWidth / 2
    const normalizedTemp = (maxTemp - temperatures[i]) / tempRange
    const y = padding + normalizedTemp * chartHeight

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }

    // Nokta çiz
    ctx.fillStyle = "#0083b0"
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()

    // Sıcaklık değeri
    ctx.fillStyle = "#0083b0"
    ctx.font = "bold 12px Poppins"
    ctx.fillText(`${temperatures[i]}${tempUnit}`, x, y - 10)
  }

  ctx.stroke()
}

function applyWeatherEffects(weatherMain) {
  document.body.className = ""
  rainContainer.classList.remove("show")

  // Zamana göre arka plan rengini uygula
  applyTimeBasedBackground()

  switch (weatherMain.toLowerCase()) {
    case "rain":
    case "drizzle":
    case "shower rain":
      document.body.classList.add("rainy")
      rainContainer.classList.add("show")
      break
    case "clear":
      document.body.classList.add("sunny")
      break
    case "clouds":
      document.body.classList.add("cloudy")
      break
    case "thunderstorm":
      document.body.classList.add("stormy")
      rainContainer.classList.add("show")
      break
    case "snow":
      document.body.classList.add("snowy")
      break
    case "mist":
    case "fog":
    case "haze":
      document.body.classList.add("misty")
      break
    default:
      document.body.classList.add("default")
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
    rain: "Yağmurlu",
    "light rain": "Hafif yağmur",
    "moderate rain": "Orta şiddetli yağmur",
    thunderstorm: "Gök gürültülü fırtına",
    snow: "Karlı",
    mist: "Sisli",
    haze: "Puslu",
    fog: "Sisli",
    drizzle: "Çiseleyen Yağmur",
  }
  return dictionary[desc.toLowerCase()] || desc
}

// Favori butonunun doğru çalışması için displayWeatherData fonksiyonunu düzelt
function displayWeatherData(data) {
  cityName.textContent = `${data.name}, ${data.sys.country}`

  const tempUnit = units === "metric" ? "°C" : "°F"
  const speedUnit = units === "metric" ? "km/s" : "mph"

  temperature.textContent = Math.round(data.main.temp)
  document.getElementById("temp-unit").textContent = tempUnit

  description.textContent = translateDescription(data.weather[0].description)
  humidity.textContent = data.main.humidity
  windSpeed.textContent = data.wind.speed
  document.getElementById("wind-unit").textContent = speedUnit

  feelsLike.textContent = Math.round(data.main.feels_like)
  document.getElementById("feels-like-unit").textContent = tempUnit

  pressure.textContent = data.main.pressure

  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })

  sunriseEl.textContent = sunrise
  sunsetEl.textContent = sunset

  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`

  // Hava kalitesi bilgisini al
  getAirQuality(data.coord.lat, data.coord.lon)

  loadingSpinner.style.display = "none"
  weatherInfo.classList.add("show")

  setTimeout(() => {
    weatherIcon.classList.add("animated")
  }, 300)

  // Favorilerde olup olmadığını kontrol et ve kalp ikonunu güncelle
  if (favorites.includes(currentCity)) {
    addToFavoritesBtn.classList.add("active")
    addToFavoritesBtn.style.color = "#ff6b6b"
  } else {
    addToFavoritesBtn.classList.remove("active")
    addToFavoritesBtn.style.color = "#ccc"
  }
}

// Hava kalitesi verisi al
function getAirQuality(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)
    .then((response) => response.json())
    .then((data) => {
      if (data && data.list && data.list.length > 0) {
        displayAirQuality(data.list[0])
      }
    })
    .catch((error) => {
      console.error("Hava kalitesi verisi alınamadı:", error)
    })
}

// Hava kalitesi verilerini göster
function displayAirQuality(data) {
  const aqiElement = document.getElementById("aqi")
  const aqiLevelElement = document.getElementById("aqi-level")

  if (!aqiElement || !aqiLevelElement) return

  const aqi = data.main.aqi
  aqiElement.textContent = aqi

  let aqiLevel = ""
  let aqiClass = ""

  switch (aqi) {
    case 1:
      aqiLevel = "Çok İyi"
      aqiClass = "aqi-very-good"
      break
    case 2:
      aqiLevel = "İyi"
      aqiClass = "aqi-good"
      break
    case 3:
      aqiLevel = "Orta"
      aqiClass = "aqi-moderate"
      break
    case 4:
      aqiLevel = "Kötü"
      aqiClass = "aqi-poor"
      break
    case 5:
      aqiLevel = "Çok Kötü"
      aqiClass = "aqi-very-poor"
      break
    default:
      aqiLevel = "Bilinmiyor"
      aqiClass = ""
  }

  aqiLevelElement.textContent = aqiLevel
  aqiLevelElement.className = ""
  aqiLevelElement.classList.add(aqiClass)
}

function showError() {
  loadingSpinner.style.display = "none"
  weatherInfo.classList.remove("show")
  errorMessage.style.display = "block"
}

function updateTimeBasedEffects() {
  // Şehrin yerel saatini kullanarak güncelleme yap
  applyTimeBasedBackground()
}

function addDynamicStyles() {
  const styleElement = document.createElement("style")
  styleElement.textContent = `
    .rainy { background: linear-gradient(135deg, #57839d 0%, #456c85 100%); }
    .sunny { background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%); }
    .cloudy { background: linear-gradient(135deg, #bdc3c7 0%, #89a0b0 100%); }
    .stormy { background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%); }
    .snowy { background: linear-gradient(135deg, #e6e6e6 0%, #b3d1ff 100%); }
    .misty { background: linear-gradient(135deg, #b8c6db 0%, #f5f7fa 100%); }
  `
  document.head.appendChild(styleElement)
}

window.addEventListener("load", () => {
  addDynamicStyles()
  displayFavorites()

  // İlk sekmeyi aktif et
  switchTab("current")

  const lastCity = localStorage.getItem("lastCity")
  if (lastCity) {
    cityInput.value = lastCity
    getWeather()
  }

  // Yerel saati her dakika güncelle
  setInterval(updateLocalTime, 60000)
})
