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

const appBody = document.getElementById("appBody");
const weatherPattern = document.getElementById("weatherPattern");


let hasWeatherLoaded = false;

const weatherIconEl = document.getElementById("weatherIcon");

const forecastContainer = document.getElementById("forecastContainer");


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
    },
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
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
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


//5 day forecast function

async function getFiveDayForecast(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch forecast data.");
    }

    const data = await response.json();
    processForecastData(data);

  } catch (error) {
    console.error(error.message);
  }
}

//forecast function
function processForecastData(data) {
  forecastContainer.innerHTML = "";

  const dailyData = data.list.filter(item =>
    item.dt_txt.includes("12:00:00")
  );

  dailyData.slice(0, 5).forEach(day => {
    const date = new Date(day.dt_txt);

    const dayName = date.toLocaleDateString("en-US", {
      weekday: "short"
    });

    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });

    const card = document.createElement("div");
    card.className =
      "bg-gradient-to-br from-white to-sky-50 rounded-2xl p-5 shadow-lg hover:scale-105 transition-transform duration-300 border border-sky-200";

    card.innerHTML = `
      <div class="flex flex-col items-center gap-2">
        <p class="text-sky-700 font-semibold text-lg">${dayName}</p>
        <p class="text-xs text-gray-500">${formattedDate}</p>

        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"
             class="w-14 h-14" />

        <p class="text-indigo-600 font-bold text-2xl">
          ${Math.round(day.main.temp)}°C
        </p>

        <div class="w-full border-t border-sky-100 my-2"></div>

        <div class="flex justify-between w-full text-sm text-gray-600">
          <span>💧 ${day.main.humidity}%</span>
          <span>🌬 ${day.wind.speed} m/s</span>
        </div>
      </div>
    `;

    forecastContainer.appendChild(card);
  });
}
// Display weather
function displayWeather(data) {
  const iconCode = data.weather[0].icon;
  weatherIconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  hasWeatherLoaded = true;
  todayWeather.classList.remove("hidden");

  currentTempCelsius = data.main.temp;
  isCelsius = true;
  // Extreme temperature check
  if (currentTempCelsius > 29) {
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
  updateBackground(data.weather[0].main);
  getFiveDayForecast(data.name);
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
  if (
    !cityInput.contains(e.target) &&
    !suggestionsList.contains(e.target)
  ) {
    suggestionsList.classList.add("hidden");
  }
});

function showSuggestions() {
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  if (cities.length === 0) return;

  suggestionsList.innerHTML = "";
  suggestionsList.classList.remove("hidden");

  cities.forEach((city) => {
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

//function for dynamic backgrounds
function updateBackground(condition) {
  if (!weatherPattern) {
    console.log("weatherPattern not found");
    return;
  }

  const weather = condition.toLowerCase();

  weatherPattern.innerHTML = "";
  weatherPattern.classList.remove("hidden");

  let symbol = "☀️";

  if (weather.includes("rain")) symbol = "🌧️";
  else if (weather.includes("snow")) symbol = "❄️";
  else if (weather.includes("cloud")) symbol = "☁️";
  else if (weather.includes("thunder")) symbol = "⛈️";

  for (let i = 0; i < 20; i++) {
    const span = document.createElement("span");
    span.textContent = symbol;
    span.style.position = "absolute";
    span.style.left = Math.random() * 100 + "%";
    span.style.top = Math.random() * 100 + "%";
    span.style.opacity = "0.8";
    span.style.fontSize = "22px";

    weatherPattern.appendChild(span);
  }
}

