const apiID = "abb412a4c111804415d00ee669c4e5de";
const city = document.querySelector(".city");
const time = document.querySelector(".time");
const wkDay = document.querySelector(".week-day");
const mainTemp = document.querySelector(".temp");
const windSpeed = document.querySelector(".wind-integer");
const humidity = document.querySelector(".hum-integer");
const timesForcast = document.querySelectorAll("li");
const btn = document.querySelector(".btn");
const input = document.querySelector(".search-city");
const mapContainer = document.getElementById("map");

const options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  timeZone: "UTC",
};

function currentLocalisation() {
  navigator.geolocation.getCurrentPosition((position) => {
    lat = position.coords.latitude;
    lng = position.coords.longitude;
    wetherLocation(lat, lng);
    renderMap(lat, lng);
  });
}

const customLocation = async (city) => {
  try {
    city = input.value;
    const customLoc = await fetch(`
    https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiID}
    `);
    const finalData = await customLoc.json();
    const customCoords = [finalData.coord.lat, finalData.coord.lon];
    wetherLocation(customCoords[0], customCoords[1]);
    renderMap(customCoords[0], customCoords[1]);
  } catch {
    alert("You have to enter a valid city");
    input.value = "";
  }
};

let map;
const renderMap = async (lat, lng) => {
  coords = [lat, lng];
  if (!map) {
    map = L.map("map").setView(coords, 12);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    L.marker(coords).addTo(map);
  } else {
    map.setView(coords, 12);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    L.marker(coords).addTo(map);
  }
};

const wetherLocation = async (lat, lng) => {
  const result = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiID}`
  );
  const res = await result.json();
  console.log(res);
  city.innerText = `${res.city.name}, ${res.city.country}`;
  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const currentConditions = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiID}`
  );
  const curRes = await currentConditions.json();
  console.log(curRes);
  const currentTimestamp = curRes.dt;
  const timezoneOffset = curRes.timezone;
  const currentTime = new Date(currentTimestamp * 1000 + timezoneOffset * 1000);
  const day = weekdays[currentTime.getUTCDay()];
  const hour = currentTime.getUTCHours().toString().padStart(2, "0");
  const minutes = +currentTime.getUTCMinutes().toString().padStart(2, "0");

  console.log(day);

  time.innerText = `${hour} : ${minutes}`;
  wkDay.innerText = day;

  mainTemp.innerHTML = `<span>${Math.trunc(
    curRes.main.temp - 273.15
  )}</span><sup>o</sup>`;

  windSpeed.innerText = String(curRes.wind.speed * 3.6).substring(0, 4);
  humidity.innerText = `${curRes.main.humidity} %`;

  let i = 2;
  timesForcast.forEach((el) => {
    const apiData = new Date(res.list[i].dt_txt);
    const time = apiData.getUTCHours().toString().padStart(2, "0");
    const dayOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][apiData.getUTCDay()];
    const temp = Math.trunc(res.list[i].main.temp - 273.15);
    const prec = Math.floor(res.list[i].pop * 100);
    el.innerHTML = "";
    el.insertAdjacentHTML(
      "afterbegin",
      `<div>${dayOfWeek}</div><div>${time}:00</div><div>${temp}<sup>o</sup></div><div>Precipitation:</div><div>${prec}%</div>`
    );
    i++;
  });
  input.value = "";
  return res;
};

currentLocalisation();
btn.addEventListener("click", customLocation);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") customLocation();
});
