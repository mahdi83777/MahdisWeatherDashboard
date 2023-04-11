var time = dayjs();
//to show current date
var currentDate = (time.format("MM/DD/YYYY"));
var city = "";
var citySearch = $("#city-search");
var citySearchButton = $("#city-search-button");
//my api key
var key = "3f8a6f9dfe234d4670bcba96dd05b6f0";

//Shows weather after clicking on button
citySearchButton.on("click", displayW);

//displays weather after running currentWeather function
function displayW(event) {
  event.preventDefault();
  if (citySearch.val().trim() !== "") {
    city = citySearch.val().trim();
    currentW(city);

    //localstorage for searched cities
    var cityList = document.getElementById("city-list");
    cityList.textContent = "";

    var searchedhist = localStorage.getItem("visited");
    if (searchedhist === null) {
        searchedhist = [];
    } else {
        searchedhist = JSON.parse(searchedhist);
    }
    searchedhist.push(city);

    var visitedCity = JSON.stringify(searchedhist);
    localStorage.setItem("visited", visitedCity);

    //creates list items from cities saved in localstorage
    for (let i = 0; i < searchedhist.length; i++) {
      var list = document.createElement("li");
      list.setAttribute("class", "list-group-item");
      list.setAttribute("id", "city-link");
      list.textContent = searchedhist[i];
      cityList.appendChild(list);
    }
  }
}

//this function receives the data from the server side api using ajax and outputs the city name, temperature, humidity, wind
function currentW(city) {
    var queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + key + "&units=imperial";
    $.ajax({
      url: queryUrl,
      method: "GET",
    }).then(function (response) {
      console.log(response);
      var weatherIcon = response.weather[0].icon;
      var icon = "https://openweathermap.org/img/wn/" + weatherIcon + "@2x.png";
      var city = document.getElementById("current");
      city.innerHTML = (response.name + " " + "(" + time.format("MM/DD/YYYY") + ")" + '<img src="' + icon + '">');
  
      var temp = document.getElementById("temp");
      temp.textContent = "Temperature: " + response.main.temp + " °F";
  
      var humidity = document.getElementById("humidity");
      humidity.textContent = "Humidity: " + response.main.humidity + "%";
  
      var wind = document.getElementById("wind-speed");
      wind.textContent = "Wind Speed: " + response.wind.speed + " MPH";
  
      //gets UV data and sets icon color based on number retrieved
      var lat = response.coord.lat;
      var lon = response.coord.lon;
      var uvdata = "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=" + key
  
      $.ajax({
        url: uvdata,
        method: "GET",
      }).then(function (response) {
        var uvIndex = document.getElementById("uv-index");
        uvIndex.textContent = "UV Index: " + response.value;
  
        var uvText = response.value;
        if (uvText <= 2) {
          uvIndex.setAttribute("class", "badge bg-success");
        }
        else if (uvText <= 6) {
          uvIndex.setAttribute("class", "badge bg-warning");
        }
        else if (uvText > 6) {
          uvIndex.setAttribute("class", "badge bg-danger");
        }
      });
  
      //receives forecast data and converts it to 5 weather cards
      $.ajax({
        url: "https://api.openweathermap.org/data/3.0/onecall?units=imperial&" + "lat=" + lat + "&lon=" + lon + "&exclude=current,minutely,hourly,alerts" + "&appid=" + key,
        method: "GET",
      }).then(function (response) {
        //emptys current forecast before applying new
        $("#forecast").empty();
        console.log(response);
  
        for (var i = 1; i < 6; i++) {
          var forecastSect = document.getElementById("forecast");
          //get the unix timestamp and format date to show
          var unix_time = response.daily[i].dt;
          var date = new Date(unix_time * 1000);
          var forecastDate = dayjs(date).format('MM/DD/YYYY');
  
          var div = document.createElement("div");
          div.setAttribute("class", "col-sm");
          forecastSect.appendChild(div);
  
          var div2 = document.createElement("div");
          div2.setAttribute("class", "card card-body bg-primary border-dark");
          div.appendChild(div2);
  
          var ptag = document.createElement("p");
          ptag.textContent = forecastDate;
          div2.appendChild(ptag);
  
          var img2 = document.createElement('img');
          img2.setAttribute("src", "https://openweathermap.org/img/wn/" + response.daily[i].weather[0].icon + "@2x.png");
          img2.setAttribute("alt", response.daily[i].weather[0].description);
          div2.appendChild(img2);
  
          var forecastTemp = response.daily[i].temp.day;
          var ptag2 = document.createElement("p");
          div2.appendChild(ptag2);
          ptag2.textContent = "Temp:" + forecastTemp + "°F";
  
          var forecastHumidity = response.daily[i].humidity;
          var ptag3 = document.createElement("p");
          div2.appendChild(ptag3);
          ptag3.textContent = "Humidity:" + forecastHumidity + "%";
        }
      })
    });
  };
  
  //Clears local storage and deletes search history
  function deleteItems() {
    var searchedhist = localStorage.getItem("visited");
    if (searchedhist === null) {
      searchedhist = [];
    } else {
      searchedhist = JSON.parse(searchedhist);
    }
    localStorage.clear();
    var list = document.getElementById("city-list");
    for (let i = 0; i < searchedhist.length; i++) {
      list.textContent = " ";
    }
  }