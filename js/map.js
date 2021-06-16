mapboxgl.accessToken = "pk.eyJ1IjoienNjaG5laWRlciIsImEiOiJjaXg3eWUzeGowMXEyMnlxeWI1MzBudzN0In0.i-aef9w2ifwlPvXerrQOwA";

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/zschneider/ckpohayy112xe17qlj1asuw3i",
  center: [-73.99, 40.715],
  zoom: 11.25,
});

map.on('load', function() {
    var layers = map.getStyle().layers;
    var firstSymbolId;
    for (var i = 0; i < layers.length; i++) {
      if (layers[i].type === "symbol") {
        firstSymbolId = layers[i].id;
        // console.log(firstSymbolId);
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
})