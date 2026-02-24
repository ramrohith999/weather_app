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

const suggestionsList = document.getElementById("suggestions");

const unitToggleBtn = document.getElementById("unitToggle");
let currentTempCelsius = null;
let isCelsius = true;

const tempAlert = document.getElementById("tempAlert");

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
    saveCity(data.name);
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

  currentTempCelsius = data.main.temp;
  isCelsius = true;
  // Extreme temperature check
if (currentTempCelsius > 40) {
  tempAlert.textContent = "⚠ Extreme Heat Warning! Stay Hydrated.";
  tempAlert.classList.remove("hidden");
} else if (currentTempCelsius < 5) {
  tempAlert.textContent = "❄ Extreme Cold Alert! Stay Warm.";
  tempAlert.classList.remove("hidden");
} else {
  tempAlert.classList.add("hidden");
}

  cityNameEl.textContent = data.name;
  temperatureEl.textContent = `${Math.round(currentTempCelsius)}°C`;
  descriptionEl.textContent = data.weather[0].description;
  humidityEl.textContent = `Humidity: ${data.main.humidity}%`;
  windEl.textContent = `Wind Speed: ${data.wind.speed} m/s`;

  unitToggleBtn.textContent = "Switch to °F";
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
// Save city
function saveCity(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  city = city.trim();

  if (!cities.includes(city)) {
    cities.unshift(city);
  }

  if (cities.length > 5) {
    cities = cities.slice(0, 5);
  }

  localStorage.setItem("recentCities", JSON.stringify(cities));
}

// Show suggestions when input focused
cityInput.addEventListener("focus", showSuggestions);

// Hide when clicking outside
document.addEventListener("click", (e) => {
  if (!cityInput.contains(e.target)) {
    suggestionsList.classList.add("hidden");
  }
});

function showSuggestions() {
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  if (cities.length === 0) return;

  suggestionsList.innerHTML = "";
  suggestionsList.classList.remove("hidden");

  cities.forEach(city => {
    const li = document.createElement("li");
    li.textContent = city;
    li.className = "px-4 py-2 hover:bg-sky-100 cursor-pointer";

    li.addEventListener("click", () => {
      cityInput.value = city;
      suggestionsList.classList.add("hidden");
      getWeatherByCity(city);
    });

    suggestionsList.appendChild(li);
  });
}

//c anf F tggle button
unitToggleBtn.addEventListener("click", () => {
  if (currentTempCelsius === null) return;

  if (isCelsius) {
    const tempF = (currentTempCelsius * 9) / 5 + 32;
    temperatureEl.textContent = `${Math.round(tempF)}°F`;
    unitToggleBtn.textContent = "Switch to °C";
    isCelsius = false;
  } else {
    temperatureEl.textContent = `${Math.round(currentTempCelsius)}°C`;
    unitToggleBtn.textContent = "Switch to °F";
    isCelsius = true;
  }
});