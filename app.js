let search = document.querySelector("input");
let currTemp = document.querySelector("#curr-temp");
let hilo = document.querySelector("#hi-lo");
let city = document.querySelector("#city");
let status = document.querySelector("#w-status");
let wImg = document.querySelector("#w-img");
let inner1 = document.querySelector(".inner1");
let inner2 = document.querySelector(".inner2");
let togglebtn = document.querySelector("#toggleSwitch");
let resultsList = document.querySelector("#resultsList");
let searchBox = document.querySelector(".search");
let main = document.querySelector(".main");
let label = document.querySelector(".close");
let dropImg = document.querySelector(".drop img");

let URL;
let lat = 28.625;
let long = 77.25;
let wURL;
let data;
let idx;
let isDrop = false;

dropImg.addEventListener("click", () => {
  if (dropImg.src.includes("images/water-drop.svg")) {
    isDrop = true;
    dropImg.src = "images/filled.svg";
    inner1.innerHTML = "";
    inner2.innerHTML = "";
    getHourElementsRain();
    getWeeklyElementsRain();
  } else {
    isDrop = false;
    dropImg.src = "images/water-drop.svg";
    inner1.innerHTML = "";
    inner2.innerHTML = "";
    getHourElements();
    getWeeklyElements();
  }
});

label.addEventListener("click", () => {
  search.value = "";
  resultsList.innerHTML = "";
  searchBox.classList.remove("search-b");
  main.classList.remove("main-f");
  label.classList.remove("label-o");
});

let fetchPlaces = async (query) => {
  if (!query) {
    resultsList.innerHTML = "";
    return;
  }

  let api_url = `https://geocoding-api.open-meteo.com/v1/search?name=${query}`;

  try {
    let response = await fetch(api_url);
    let data = await response.json();

    if (!data.results && search.value) {
      resultsList.innerHTML = `<li>No results found</>`;
      return;
    }

    resultsList.innerHTML = data.results
      .map(
        (
          place
        ) => `<li data-lat="${place.latitude}" data-lon="${place.longitude}" place="${place.name}" country="${place.country}">
            ${place.name}, ${place.admin1} (${place.country})
          </li>`
      )
      .join("");
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

let searchStyle = (val) => {
  if (val !== "") {
    searchBox.classList.add("search-b");
    main.classList.add("main-f");
    label.classList.add("label-o");
  } else {
    searchBox.classList.remove("search-b");
    main.classList.remove("main-f");
    label.classList.remove("label-o");
  }
};

search.addEventListener("input", (e) => {
  fetchPlaces(e.target.value);
  searchStyle(e.target.value);
});

resultsList.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    inner1.innerHTML = "";
    inner2.innerHTML = "";

    lat = e.target.getAttribute("data-lat");
    long = e.target.getAttribute("data-lon");
    let name = e.target.getAttribute("place");
    let country = e.target.getAttribute("country");

    resultsList.innerHTML = ""; // Clear search results after selection
    search.value = e.target.textContent.trim(); //Fill input with selected place
    getWeatherData();
    city.innerHTML = `${name}, ${country}`;
    searchBox.classList.remove("search-b");
    main.classList.remove("main-f");
  }
});

let getWeatherData = async () => {
  wURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,precipitation,rain,showers,snowfall,weather_code&hourly=temperature_2m,precipitation_probability,rain,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
  let response = await fetch(wURL);
  data = await response.json();
  console.log(data);
  currTemp.innerHTML = `${Math.floor(data.current.temperature_2m)}°C`;
  hilo.innerHTML = `H:${data.daily.temperature_2m_max[0]}° &nbsp; L:${data.daily.temperature_2m_min[0]}°`;
  let wCode = data.current.weather_code;
  status.innerHTML = `${findWeatherText(wCode)}`;

  let dateTimeString = `${data.current.time}`;
  let dateTime = new Date(dateTimeString);
  idx = dateTime.getHours();
  console.log(idx);

  let isDay = data.hourly.is_day[idx];

  try {
    if (isDay === 1) {
      wImg.src = `images/weather/w${wCode}.svg`;
    } else {
      wImg.src = `images/weather/n${wCode}.svg`;
    }
  } catch (err) {
    console.log(err);
  }

  wImg.onerror = function () {
    this.onerror = null;
    this.src = `images/weather/w${wCode}.svg`;
  };

  if (isDrop) {
    getHourElementsRain();
    getWeeklyElementsRain();
  } else {
    getHourElements();
    getWeeklyElements();
  }
};

const findWeatherText = (code) => {
  return (
    WMO_Weather_Codes.find((item) => item.code === code)?.text || "Unknown Code"
  );
};

let getHourElements = () => {
  for (let i = idx - 1; i <= idx + 23; i++) {
    let div = document.createElement("div");
    let time = document.createElement("p");
    let img = document.createElement("img");
    let temp = document.createElement("p");

    div.classList.add("hour");
    time.classList.add("time");
    temp.classList.add("degree");

    let dateTimeString = data.hourly.time[i];
    let date = new Date(dateTimeString);
    let formattedTime = date.toLocaleString("en-US", {
      hour: "numeric",
      hour12: true,
    });

    let wc = data.hourly.weather_code[i];
    let isDay = data.hourly.is_day[i];

    if (i === idx) {
      time.innerText = "NOW";
      div.classList.add("now");
    } else {
      time.innerText = formattedTime;
    }

    try {
      if (isDay === 1) {
        img.src = `images/weather/w${wc}.svg`;
      } else {
        img.src = `images/weather/n${wc}.svg`;
      }
    } catch (err) {
      console.log(err);
    }

    img.onerror = function () {
      this.onerror = null;
      this.src = `images/weather/w${wc}.svg`;
    };

    temp.innerText = `${Math.floor(data.hourly.temperature_2m[i])}°`;

    inner1.append(div);
    div.append(time);
    div.append(img);
    div.append(temp);
  }
};

let getWeeklyElements = () => {
  for (let i = 0; i <= 6; i++) {
    let weekly = document.createElement("div");
    let day = document.createElement("p");
    let img = document.createElement("img");
    let wDegree = document.createElement("p");

    weekly.classList.add("weekly");
    day.classList.add("day");
    wDegree.classList.add("w-degree");
    img.classList.add("w-img");

    let dateString = data.daily.time[i];
    let dateObj = new Date(dateString);
    const weekday = dateObj
      .toLocaleDateString("en-US", { weekday: "short" })
      .toUpperCase();

    if (i === 0) {
      day.innerText = "TODAY";
    } else {
      day.innerText = weekday;
    }

    let wCode = data.daily.weather_code[i];
    let hi = Math.floor(data.daily.temperature_2m_max[i]);
    let lo = Math.floor(data.daily.temperature_2m_min[i]);

    img.src = `images/weather/w${wCode}.svg`;
    wDegree.innerHTML = `${hi}°<span>/${lo}°</span>`;

    inner2.append(weekly);
    weekly.append(day);
    weekly.append(img);
    weekly.append(wDegree);
  }
};

togglebtn.addEventListener("change", function () {
  let toggle1 = document.querySelector(".toggle1");
  let toggle2 = document.querySelector(".toggle2");
  if (this.checked) {
    inner1.classList.add("hide");
    inner2.classList.add("visible");
    toggle1.classList.add("toggle-off");
    toggle2.classList.add("toggle-on");
  } else {
    inner1.classList.remove("hide");
    inner2.classList.remove("visible");
    toggle1.classList.remove("toggle-off");
    toggle2.classList.remove("toggle-on");
  } // used normal function instead of arrow function to use THIS method
});

let getHourElementsRain = () => {
  for (let i = idx - 1; i <= idx + 23; i++) {
    let div = document.createElement("div");
    let time = document.createElement("p");
    let img = document.createElement("img");
    let chances = document.createElement("p");

    div.classList.add("hour");
    time.classList.add("time");
    chances.classList.add("chances");

    let dateTimeString = data.hourly.time[i];
    let date = new Date(dateTimeString);
    let formattedTime = date.toLocaleString("en-US", {
      hour: "numeric",
      hour12: true,
    });

    if (i === idx) {
      time.innerText = "NOW";
      div.classList.add("now");
    } else {
      time.innerText = formattedTime;
    }

    img.src = `images/rain-drop.svg`;

    let rainChance = data.hourly.precipitation_probability[i];
    chances.innerText = `${rainChance}%`;

    if (rainChance >= 30 && rainChance < 70) {
      chances.classList.add("yellow");
    } else if (rainChance >= 70 && rainChance < 80) {
      chances.classList.add("orange");
    } else if (rainChance >= 80 && rainChance < 90) {
      chances.classList.add("dark-orange");
    } else if (rainChance >= 90 && rainChance <= 100) {
      chances.classList.add("red");
    }

    inner1.append(div);
    div.append(time);
    div.append(img);
    div.append(chances);
  }
};

let getWeeklyElementsRain = () => {
  for (let i = 0; i <= 6; i++) {
    let weekly = document.createElement("div");
    let day = document.createElement("p");
    let img = document.createElement("img");
    let chances = document.createElement("p");

    weekly.classList.add("weekly");
    day.classList.add("day");
    chances.classList.add("w-chances");
    img.classList.add("wr-img");

    let dateString = data.daily.time[i];
    let dateObj = new Date(dateString);
    const weekday = dateObj
      .toLocaleDateString("en-US", { weekday: "short" })
      .toUpperCase();

    if (i === 0) {
      day.innerText = "TODAY";
    } else {
      day.innerText = weekday;
    }

    img.src = `images/rain-drop.svg`;
    let rainChance = data.daily.precipitation_probability_max[i];
    chances.innerText = `${rainChance}%`;

    if (rainChance >= 30 && rainChance < 70) {
      chances.classList.add("yellow");
    } else if (rainChance >= 70 && rainChance < 80) {
      chances.classList.add("orange");
    } else if (rainChance >= 80 && rainChance < 90) {
      chances.classList.add("dark-orange");
    } else if (rainChance >= 90 && rainChance <= 100) {
      chances.classList.add("red");
    }

    inner2.append(weekly);
    weekly.append(day);
    weekly.append(img);
    weekly.append(chances);
  }
};

window.addEventListener("load", () => {
  getWeatherData();
});
