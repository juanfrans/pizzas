mapboxgl.accessToken = "pk.eyJ1IjoienNjaG5laWRlciIsImEiOiJjaXg3eWUzeGowMXEyMnlxeWI1MzBudzN0In0.i-aef9w2ifwlPvXerrQOwA";

// Create and initialize map variable
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/zschneider/ckpohayy112xe17qlj1asuw3i",
  center: [-73.99, 40.715],
  zoom: 11.25,
});

// Load other layers
map.on('load', function() {
    var layers = map.getStyle().layers;
    var firstSymbolId;
    for (var i = 0; i < layers.length; i++) {
      if (layers[i].type === "symbol") {
        firstSymbolId = layers[i].id;
        break;
      }
    }

    map.addLayer(
      {
        id: "pizzaPlaces",
        type: "circle",
        source: {
          type: "geojson",
          data: "data/pizzaPlaces.geojson",
        },
        layout: {
          visibility: "visible",
        },
        paint: {
          "circle-color": "black",
          "circle-opacity": 1,
          "circle-radius": [
            "interpolate",
            ["exponential", 2],
            ["zoom"],
            10,
            4,
            16,
            8,
          ],
        },
      },
      firstSymbolId
    );
});

// Create popups
map.on("click", "pizzaPlaces", function (e) {
  e.originalEvent.preventDefault();
  console.log("Clicked on a pizza place...");
  let popuphtml =
    "<div class='mt2 mb2 dark-gray'><h4 class='ttu mb0'>Pizza Place X</h4>" +
    "<p class='mt2'>Placeholder text for address, url, telephone, and 3d model.</p>";
  popup = new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(popuphtml)
    .addTo(map);
});
map.on("mouseenter", "pizzaPlaces", function () {
  map.getCanvas().style.cursor = "pointer";
});
map.on("mouseleave", "pizzaPlaces", function () {
  map.getCanvas().style.cursor = "";
});