
function createMap(earthquakes) {

  // Create the tile layer that will be the background of our map.
  let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });


  // Create a baseMaps object to hold the streetmap layer.
  let baseMaps = {
    "Street Map": streetmap
  };

  // Create an overlayMaps object to hold the earthquakes layer.
  let overlayMaps = {
    "USGS All Earthquakes, Past Week": earthquakes
  };

  // Create the map object with options.
  let map = L.map("map-id", {
    center: [40.00, -110.00 ],
    zoom: 4,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);

  // Create a legend to display information about our map.
  let legend = L.control({
    position: "bottomright"
  });
  // Define the legend items
  const legendData = [
    { color: '#b2fab4', label: '-10 to 10' },
    { color: '#86d979', label: '10 to 30' },
    { color: '#ffcc66', label: '30 to 50' },
    { color: '#ff9966', label: '50 to 70 ' },
    { color: '#ff6666', label: '70 to 90' },
    { color: '#cc0000', label: '>90 ' }
  ];


  // When the layer control is added, insert a div with the class of "legend".
  legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    // Add a title for the legend (optional)
    div.innerHTML = "<h4>Depth Ranges</h4>";

    // Loop through the legendData and add items to the legend
    legendData.forEach(item => {
        div.innerHTML += `
            <div class="legend-item">
                <span class="color-box" style="background-color:${item.color};"></span>
                <span>${item.label}</span>
            </div>
        `;
    });
   return div;
  };

  // Add the info legend to the map.
  legend.addTo(map);

}

function markerSize(magnitude, min, max) {
  return (((magnitude-min)/(max-min)*10 + 1) * 10000);
}


// choose a fill color based on the depth range.
function chooseColor(depth)
{
  if (depth >= -10 && depth <= 10) {
    return '#b2fab4'; // Pale green
  } else if (depth > 10 && depth <= 30) {
    return '#86d979'; // Light green
  } else if (depth > 30 && depth <= 50) {
    return '#ffcc66'; // Yellow-orange
  } else if (depth > 50 && depth <= 70) {
    return '#ff9966'; // Light red-orange
  } else if (depth > 70 && depth <= 90) {
    return '#ff6666'; // Bright red
  } else if (depth > 90) {
    return '#cc0000'; // Dark red
  } else {
    return '#cccccc'; // Default (e.g., gray for out-of-range values)
  }
}



// // Function to create the legend
// function createLegend(legendId, data) {
//       const legend = document.getElementById(legendId);
//       data.forEach(item => {
//             const legendItem = document.createElement('div');
//             legendItem.className = 'legend-item';

//             const colorBox = document.createElement('div');
//             colorBox.className = 'color-box';
//             colorBox.style.backgroundColor = item.color;

//             const label = document.createElement('span');
//             label.textContent = item.label;

//             legendItem.appendChild(colorBox);
//             legendItem.appendChild(label);
//             legend.appendChild(legendItem);
//       });
//     }

   


function createMarkers(response) {

    // Pull the earthquake "features" property from response
    let features = response.features;
    // console.log(features);
    //find the minimum and maximum magnitude and depth
    let min_mag = 0;
    let max_mag = 0;
    let min_depth = 0;
    let max_depth = 0;
    for (let i = 0; i < features.length; i++) {
      let feature = features[i];
      if (feature.properties.mag < min_mag) min_mag = feature.properties.mag;
      if (feature.properties.mag > max_mag) max_mag = feature.properties.mag;
      if (feature.geometry.coordinates[2] < min_depth) min_depth = feature.geometry.coordinates[2];
      if (feature.geometry.coordinates[2] > max_depth) max_depth = feature.geometry.coordinates[2];
    }
    // console.log("Minimum mag :", min_mag);
    // console.log("Maximum mag :", max_mag);
    // console.log("Minimum depth :", min_depth);
    // console.log("Maximum depth :", max_depth);

    // Initialize an array to hold earthquake markers.
    let earthquakeMarkers = [];

    // Loop through the earthquake array.
    for (let index = 0; index < features.length; index++) {
        let feature = features[index];

        // For each earthquake, create a marker, and bind a popup with the earthquake's name.
        let earthquakeMarker = 
            L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]],{
                      stroke :false,
                      fillOpacity:0.90, //markerOpacity(feature.geometry.coordinates[2],min_depth,max_depth),
                      color : "black",
                      stroke : "#cccccc", 
                      weight : 0.5,
                      fillColor : chooseColor(feature.geometry.coordinates[2]),
                      radius : markerSize(feature.properties.mag,min_mag,max_mag),

                    })
            .bindPopup("<h3>" + feature.properties.title + 
                       "<h3><h3>Magnitude: " + feature.properties.mag + 
                       "<h3><h3>Location:  [ " + feature.geometry.coordinates[1] + " , " 
                       + feature.geometry.coordinates[0] + " ] " +
                       "<h3><h3>Depth : " + feature.geometry.coordinates[2] +
                      "</h3>" );

        // Add the marker to the bikeMarkers array.
        earthquakeMarkers.push(earthquakeMarker);
    }

    // Create a layer group that's made from the bike markers array, and pass it to the createMap function.
    
    createMap(L.layerGroup(earthquakeMarkers));
    
}


// Perform an API call to the Citi Bike API to get the station information. Call createMarkers when it completes.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(createMarkers);