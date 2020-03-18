//document.ready causes the js to wait until the DOM is constructed to run
$(document).ready(function() {
    //jQuery selecting html element with id search-button and assigning it an onclick function
    $("#search-button").on("click", function() {
      //new variable searchValue stores the text value that the user puts in the text input box
      var searchValue = $("#search-value").val();
        
      // clear input box
      $("#search-value").val("");
        //calls function searchWeather and passes in the value of searchValue as a parameter
      searchWeather(searchValue);
    });

    //this function's purpose is to dynamically change the values to show the weather in previously searched cities
    //jQuery referencing the list items with the unordered ist with class history and adding an on click function
    
    $(".history").on("click", "li", function() {
    //calls search weather function with the name of the city stored in the appended li that was clicked
      searchWeather($(this).text());
    });
  
    //when called this function makes a list item in the history unordered list. This function takes a parameter called text
    function makeRow(text) {
        //uses jQuery to make a new list item element with several classes and sets the text equal to the text parameter passed into the function
      var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
      //appends new list item to the history unordered list
      $(".history").append(li);
    }
  
    //function searchWeather is used to make an API call using the searchValue as a parameter
    function searchWeather(searchValue) {
        //using the jQuery method ajax to call the open weather API
      $.ajax({
        //we are getting data from the API therefore this is a GET request
        type: "GET",
        //generating the url to call the API
        url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=600327cb1a9160fea2ab005509d1dc6d&units=imperial",
        //setting the return data type to JSON
        dataType: "json",
        //success is a method of the ajax object that will run a block of code if the ajax call is deemed successful. 
        success: function(data) {
          // create history link for this search
          //if a location has already been searched, it will be in the history array and this if statement will not run. 
          if (history.indexOf(searchValue) === -1) {
            //location is added to the history array
            history.push(searchValue);
            //history array is turned into a string and is added to the local storage
            window.localStorage.setItem("history", JSON.stringify(history));
            //calls make row function to add location to list. 
            makeRow(searchValue);
          }
          
          // clear any old content
          $("#today").empty();
  
          // create html content for current weather
          //var title is a dynamically created h3 that displays the location name and the current date.
          //an h3 is created with jQuery with class card-title
          //data.name is the city name returned from the API call. 
          //new Date() is calling the date function and is converting result into a string
          var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
          //creates div that is a bootstrap card
          var card = $("<div>").addClass("card");
          //creates paragraph with card-text class for windspeed
          var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
          //creates paragraph with card-text class for humidity
          var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
          //creates paragraph with card-text class for temp
          var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
          //creating a div to use as a container for the card-text class items
          var cardBody = $("<div>").addClass("card-body");
          //creating an image and gets src from API to give a little weather icon
          var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
  
          //constructing the card by appending items 
          //appending icon to h3 tag
          title.append(img);
          //appending text paragraphs to card body
          cardBody.append(title, temp, humid, wind);
          //appending card body to card
          card.append(cardBody);
          //appending completed card to the #today div
          $("#today").append(card);
  
          // call follow-up api endpoints
          //calling api to get the 5 day forecast
          getForecast(searchValue);
          //calling getUVIfunction to get UV Index based on the lat/long returned from the above ajax call
          getUVIndex(data.coord.lat, data.coord.lon);
        },
        error: function(xhr, status, error){
            // xhr.status is the error code (400, etc.), and xhr.statusText is the description ('Bad Request', etc.)
            console.log(xhr.status + xhr.statusText);
            // activate Bootstrap modal dialog
            $('#myModal').modal('show');
          }

      });
    }
    
    //this function is used to call the api and render a 5 day forcast for the user specified location
    //the API returns the weather in three hour increments for 5 days into the future
    function getForecast(searchValue) {
        //creating an ajax call to openweathermap API
      $.ajax({
        //we are retreiving info from the api, therefore it is a GET request
        type: "GET",
        //constructing api call using searchValue input
        url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=600327cb1a9160fea2ab005509d1dc6d&units=imperial",
        //data is returned in JSON format
        dataType: "json",
        //if call is successful, 
        success: function(data) {
          // overwrite any existing content with title and empty row
          $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");
  
          // for loop is used to 
          for (var i = 0; i < data.list.length; i++) {
            // only look at forecasts around 3:00pm otherwise increment i without action until the next day at 3pm is reached
            //list[i] is refering to an array of objects returned by the API that is a forecast for each 3 hour period
            if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
              
              //creating bootstrap column to hold card
              var col = $("<div>").addClass("col-md-2");
              //creating new div as a card
              var card = $("<div>").addClass("card bg-primary text-white");
              //creating card body to hold informatino
              var body = $("<div>").addClass("card-body p-2");
                
              //title shows the city name and date of the forecast.
              var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());
              //creating an img take and appending the src from the api data
              var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
                
              //creating content for the card that displays the temp at 3pm and the humidity
              var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
              var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
  
              //appending text content to the card-body, the card-body to the card, and the card to the column.
              col.append(card.append(body.append(title, img, p1, p2)));
              //appending the column to the div.row in the forecast div
              $("#forecast .row").append(col);
            }
          }
        }
      });
    }
  
    //this functino gets the UV index for a current time based on the lat/long passed in from inside the searchWeather function
    function getUVIndex(lat, lon) {
        
      //making an ajax call to the uvi endpoint
      $.ajax({
        //get request
        type: "GET",
        //constructing api call
        url: "https://api.openweathermap.org/data/2.5/uvi?appid=600327cb1a9160fea2ab005509d1dc6d&lat=" + lat + "&lon=" + lon,
        //return data as json
        dataType: "json",
        //if successful function is called with the returned data
        success: function(data) {
          //jquery creating paragraph element with text
          var uv = $("<p>").text("UV Index: ");
          //creating a span element to act as a button whose text is the UV index value returned from API
          var btn = $("<span>").addClass("btn btn-sm").text(data.value);
          
          // change button color depending on uv range
          if (data.value < 3) {
            btn.addClass("btn-success");
            //fun in the sun
          }
          else if (data.value < 7) {
            btn.addClass("btn-warning");
            //wear your sunglasses
          }
          else {
            btn.addClass("btn-danger");
            //run for cover
          }
          //appends the newly created button to the uv paragraph, and paragraph is appended to the card body inside the #today div
          $("#today .card-body").append(uv.append(btn));
        }
      });
    }
  
    // declares new array variable
    //if history is not in local storage, an empty array is created
    //if there is a history item in local storage, json string is parsed into an array
    var history = JSON.parse(window.localStorage.getItem("history")) || [];
  
    //if the history array is populated, the last city entered will be rendered upon page load
    if (history.length > 0) {
      searchWeather(history[history.length-1]);
    }
    //for every city in the history array, call makeRow function to display the city on the screen
    for (var i = 0; i < history.length; i++) {
      makeRow(history[i]);
    }
  });
  