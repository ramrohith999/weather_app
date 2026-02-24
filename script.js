const apiKey = "bf60e66faa94a656915b3cfb1cc8a4c0";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const errorBox = document.getElementById("errorBox");
const loading = document.getElementById("loading");
const todayWeather = document.getElementById("todayWeather");

const cityNameEl = document.getElementById("cityName");
const temperatureEl = document.getElementById("temperature");
const descriptionEl = document.getElementById("description");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");

const locationButton = document.getElementById("locationBtn");

// Search button click
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();

  if (city === "") {
    showError("Please enter a city name.");
    return;
  }

  getWeatherByCity(city);
});

//get current location 

locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeatherByCoords(latitude, longitude);
    },
    () => {
      showError("Unable to retrieve your location.");
    }
  );
});
// Fetch weather by city
async function getWeatherByCity(city) {
  try {
    showLoading(true);
    hideError();

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`,
    );

    if (!response.ok) {
      throw new Error("City not found.");
    }

    const data = await response.json();
    displayWeather(data);
  } catch (error) {
    showError(error.message);
  } finally {
    showLoading(false);
  }
}

//function to fetch by coordinates 
async function fetchWeatherByCoords(lat, lon) {
  try {
    showLoading(true);
    hideError();

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch location weather.");
    }

    const data = await response.json();
    displayWeather(data);

  } catch (error) {
    showError(error.message);
  } finally {
    showLoading(false);
  }
}

// Display weather
function displayWeather(data) {
  todayWeather.classList.remove("hidden");

  cityNameEl.textContent = data.name;
  temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
  descriptionEl.textContent = data.weather[0].description;
  humidityEl.textContent = `Humidity: ${data.main.humidity}%`;
  windEl.textContent = `Wind Speed: ${data.wind.speed} m/s`;
}

// Error display
function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function hideError() {
  errorBox.classList.add("hidden");
}

// Loading state
function showLoading(isLoading) {
  if (isLoading) {
    loading.classList.remove("hidden");
  } else {
    loading.classList.add("hidden");
  }
}
