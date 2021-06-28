mapboxgl.accessToken =
  "pk.eyJ1IjoienNjaG5laWRlciIsImEiOiJjaXg3eWUzeGowMXEyMnlxeWI1MzBudzN0In0.i-aef9w2ifwlPvXerrQOwA";

const mapContainer = document.querySelector("#map");
const buttons = document.querySelectorAll("button.filter");

const inListFilter = [
  "any",
  ["==", ["get", "eaterNY"], "1"],
  ["==", ["get", "NYTimes"], "1"],
  ["==", ["get", "timeOut"], "1"],
  ["==", ["get", "yotam"], "1"],
  ["==", ["get", "thrillist"], "1"],
  ["==", ["get", "scan"], "1"],
];
let audio = null;
let currentMarker = null;

// Create and initialize map variable
const map = new mapboxgl.Map({
  container: mapContainer,
  style: "mapbox://styles/zschneider/ckpohayy112xe17qlj1asuw3i",
  center: [-73.99, 40.715],
  zoom: 11.25,
  scrollZoom: false,
  maxZoom: 17,
  minZoom: 10,
  maxBounds: [
    [-74.5, 40.475],
    [-73.5, 40.95],
  ],
});

function loadImage(name, url) {
  return new Promise((resolve, reject) => {
    map.loadImage(url, (error, image) => {
      if (error) reject(error);
      map.addImage(name, image);
      resolve();
    });
  });
}

function setupLayer(symbol) {
  Promise.all([
    loadImage("marker-active", "./assets/marker-active.png"),
    loadImage("marker-inactive", "./assets/marker-inactive.png"),
  ]).then((results) => {
    const [activeImage, inactiveImg] = results;
    map.addLayer(
      {
        id: "pizzaPlaces",
        type: "symbol",
        source: {
          type: "geojson",
          data: "data/pizzaPlaces.geojson",
          tolerance: 0,
        },
        layout: {
          "icon-image": "marker-inactive",
          "icon-size": [
            "interpolate",
            ["exponential", 2],
            ["zoom"],
            10,
            0.5,
            16,
            1.5,
          ],
        },
      },
      "settlement-minor-label"
    );
    map.setFilter("pizzaPlaces", inListFilter);
    buttons.forEach((button) => button.addEventListener("click", filter));
  });
}

function getPopupHTML(props) {
  return `
    <div class=''>
      <h3 class='f4 mt0 mb0'>${props.name}</h3>
      <p class='f5 mt0 lh-copy'>${props.address}, ${props.borough}</p>
      ${(() => {
        if (props.scan === "1") {
          return `
            <div>
              <p class='f5 mt0 mb0 lh-copy'>
                <span class='b'>price:</span> $${props.price}
              </p>
              <p class='f5 mt0 mb0 lh-copy'>
                <span class='b'>date and time:</span> ${props.datetime}
              </p>
              <p class='f5 mt0 mb0 lh-copy'>
                <span class='b'>serving temperature:</span> ${props.temperatureC}C
              </p>
              <p class='f5 mt0 mb0 lh-copy'>
                <span class='b'>notes:</span> ${props.notes}
              </p>
            </div>
            <model-viewer
              src="${props["3dModel"]}/model.gltf"
              ios-src="${props["3dModel"]}/model.usdz"
              alt="A pizza slice"
              ar
              ar-modes="webxr scene-viewer quick-look"
              field-of-view="10deg"
              camera-orbit="0deg 10deg 105%"
              max-camera-orbit="Infinity 60deg auto"
              min-camera-orbit="-Infinity -60deg 40%"
              camera-controls
              auto-rotate
            >
            </model-viewer>
            `;
        } else {
          return "";
        }
      })()}
    </div>
  `;
}

function showPopup(props) {
  const popup = new mapboxgl.Popup({
    maxWidth: "350px",
    anchor: "top",
  })
    .setLngLat({ lng: props.longitude, lat: props.latitude })
    .setHTML(getPopupHTML(props))
    .addTo(map);

  stopAudio();

  if (props.scan === "1") {
    audio = new Audio(`${props["3dModel"]}/audio.m4a`);
    audio.loop = true;
    audio.play();
  }

  map.flyTo({ center: [props.longitude, props.latitude - 0.002] });
}

function enableZoom(entries) {
  if (!entries[0].isIntersecting && !map.scrollZoom.isEnabled()) {
    map.scrollZoom.enable({ around: "center" });
  } else if (entries[0].isIntersecting && map.scrollZoom.isEnabled()) {
    map.scrollZoom.disable();
  }
}

function stopAudio() {
  if (audio) {
    audio.pause();
    audio = null;
  }
}

function filter(e) {
  const name = e.target.dataset.filter;
  buttons.forEach((button) => button.classList.remove("active"));
  e.target.classList.add("active");
  map.setFilter(
    "pizzaPlaces",
    name === "all" ? inListFilter : ["==", ["get", name], "1"]
  );
}

map.on("load", function () {
  var layers = map.getStyle().layers;
  var firstSymbolId;
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].type === "symbol") {
      firstSymbolId = layers[i].id;
      break;
    }
  }
  setupLayer(firstSymbolId);
});

map.on("click", "pizzaPlaces", function (e) {
  e.originalEvent.preventDefault();
  showPopup(e.features[0].properties);
});

map.on("mouseenter", "pizzaPlaces", function () {
  map.getCanvas().style.cursor = "pointer";
});

map.on("mouseleave", "pizzaPlaces", function () {
  map.getCanvas().style.cursor = "";
});

mapContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("mapboxgl-popup-close-button")) {
    stopAudio();
  }
});

// Adding the zoom in/out buttons
var nav = new mapboxgl.NavigationControl({
  showCompass: false,
});
map.addControl(nav, "bottom-left");
