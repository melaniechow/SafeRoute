 function initMap() {

        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 12,
          center: {lat: 40.7446828, lng: -73.9848745}
        });

        // Create an array of alphabetical characters used to label the markers.
        var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        // Add some markers to the map.
        // Note: The code uses the JavaScript Array.prototype.map() method to
        // create an array of markers based on a given "locations" array.
        // The map() method here has nothing to do with the Google Maps API.
        var markers = locations.map(function(location, i) {
          return new google.maps.Marker({
            position: location,
            label: labels[i % labels.length]
          });
        });

        // Add a marker clusterer to manage the markers.
        var markerCluster = new MarkerClusterer(map, markers,
            {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
      }


      var return_first = function(){
        var tmp = null;
        $.ajax({
        url: "https://data.cityofnewyork.us/resource/7x9x-zpz6.json",
        type: "GET",
        async: false,
        data: {
          "$limit" : 15000,
          //"$$app_token" : "YOURAPPTOKENHERE"
        },
        success: function (data) {
          tmp = data;
        }  
      });
      return tmp;
      }();
      //console.log(return_first);

      var locations = function () {
        var holder = return_first;
        for(var i = 0; i < 15000; i++) {
          for(info in holder[i]){
            //console.log()
            if (info=== 'latitude' || info==='longitude'){
              var temp = parseFloat(holder[i][info]);
              holder[i][info] = temp;
            }
            else {
              delete holder[i][info];
            }
          }
        }
        for(var j = 0; j < 15000; j++){
          holder[j]["lat"] = holder[j]["latitude"];
          holder[j]["lng"] = holder[j]["longitude"];
          delete holder[j]["latitude"];
          delete holder[j]["longitude"];
        }
        //console.log(holder);
        return holder;
      } ();

    //console.log(locations);