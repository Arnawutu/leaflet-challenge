// Declare myMap in the broader scope.
var myMap;

// Store the API endpoint URL in a variable.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the API endpoint using d3.json.
d3.json(queryUrl).then(function(data) {
  // Once the response is received, call the createFeatures function with the data's features.
  createFeatures(data.features);
});

// Function to determine color based on earthquake depth.
function getColor(depth) {
  return depth < 10 ? "#ffffcc" :
         depth < 30 ? "#a1dab4" :
         depth < 50 ? "#41b6c4" :
         depth < 70 ? "#2c7fb8" :
         depth < 90 ? "#253494" :
                      "#081d58";
}

// Function to create features for each earthquake.
function createFeatures(earthquakeData) {
  // Function to create popups for each earthquake feature.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
  }

  // Create GeoJSON layer with circle markers for earthquakes.
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, {
        radius: feature.properties.mag * 5,
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    },
    onEachFeature: onEachFeature
  });

  // Send the earthquakes layer to the createMap function.
  createMap(earthquakes);
}

// Function to create the map with base layers and overlay.
function createMap(earthquakes) {
  // Create the base layer using OpenStreetMap tiles.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // Create a baseMaps object with the street map layer.
  var baseMaps = {
    "Street Map": street
  };

  // Create an overlayMaps object with the earthquakes layer.
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create the map with specified options and layers.
  myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control and add it to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Add the legend to the map.
  legend.addTo(myMap);
}

// Create a legend for the map based on depth.
var legend = L.control({position: "bottomright"});
legend.onAdd = function() {
  var div = L.DomUtil.create("div", "info legend");
  var depth = [-10, 10, 30, 50, 70, 90];
  var labels = [];

  // Loop through the depth intervals and generate a label with a colored square for each interval.
  for (var i = 0; i < depth.length; i++) {
    div.innerHTML +=
      '<i style="background:' + getColor(depth[i] + 1) + '"></i> ' +
      depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
  }
  return div;
};

// Add the legend to the map.
legend.addTo(myMap);