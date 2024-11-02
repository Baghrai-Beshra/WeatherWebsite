const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = '867e611a74423c7bd9f2821b303b1414'; // API key for OpenWeatherMap API

const createWeatherCard = (cityName, weatherItem, index) => {
    const date = new Date(weatherItem.dt_txt).toLocaleDateString();  // Convert date to a readable format
    const icon = weatherItem.weather[0].icon;  // Get the weather icon code
    const temperature = weatherItem.main.temp;  // Temperature in Kelvin
    const windSpeed = weatherItem.wind.speed;  // Wind speed in meters/second
    const humidity = weatherItem.main.humidity;  // Humidity percentage
    const weatherDescription = weatherItem.weather[0].description;  // Weather description

    if (index === 0) {
        return `<div class="details">
                    <h2>${cityName} (${date})</h2>
                    <h4>Temperature: ${(temperature - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${windSpeed} m/s</h4>
                    <h4>Humidity: ${humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="weather-icon">
                    <h4>${weatherDescription}</h4>
                </div>`;
    } else {
        return `<li class="card">
                    <h4>${date}</h4>
                    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="weather-icon">
                    <h4>Temperature: ${(temperature - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${windSpeed} m/s</h4>
                    <h4>Humidity: ${humidity}%</h4>
                </li>`;
    }
};

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    
    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {

            // Filter the forecasts to get only one forecast per day
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });

            // Clearing previous weather data
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";

            // Create weather cards for each forecast
            fiveDaysForecast.forEach((weatherItem, index) => {
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML('beforeend', createWeatherCard(cityName, weatherItem, index));
                } else {
                    weatherCardsDiv.insertAdjacentHTML('beforeend', createWeatherCard(cityName, weatherItem, index));
                }
            });
        })
        .catch(() => {
            alert("An error occurred while fetching the weather forecast!");
        });
};

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();  // Get user-entered city name and remove extra spaces
    if (!cityName) return;  // Return if cityName is empty
    
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    // Get entered city coordinates (latitude, longitude, and name) from the API response
    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data.length) return alert(`No coordinates found for ${cityName}`);
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An error occurred while fetching the coordinates!");
        });
};

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            
            fetch(REVERSE_GEOCODING_URL)
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);  // Fetch weather details based on user's location
                } else {
                    alert("Unable to determine your city.");
                }
            })
            .catch(() => {
                alert("An error occurred while fetching the city!");
            });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Location access denied. Please enable location services and try again.");
            } else {
                alert("Unable to retrieve your location. Please try again.");
            }
        }
    );
};

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e=>e.key ==="Enter" && getCityCoordinates());