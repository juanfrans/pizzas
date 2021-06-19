mapboxgl.accessToken = "pk.eyJ1IjoienNjaG5laWRlciIsImEiOiJjaXg3eWUzeGowMXEyMnlxeWI1MzBudzN0In0.i-aef9w2ifwlPvXerrQOwA";

const mainContainer = document.querySelector('.main')
const mapContainer = document.querySelector('#map')
const buttons = document.querySelectorAll('button.filter')
const observer = new IntersectionObserver(enableZoom)
observer.observe(mainContainer)
const inListFilter = [
    'any', 
    ['==', ['get', 'eaterNY'], '1' ],
    ['==', ['get', 'NYTimes'], '1'],
    ['==', ['get', 'timeOut'], '1'],
    ['==', ['get', 'yotam'], '1'],
    ['==', ['get', 'thrillist'], '1'],
    ['==', ['get', 'scan'], '1'],
]
let audio

// Create and initialize map variable
const map = new mapboxgl.Map({
  container: mapContainer,
  style: "mapbox://styles/zschneider/ckpohayy112xe17qlj1asuw3i",
  center: [-73.99, 40.715],
  zoom: 11.25,
  scrollZoom: false,
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
          "circle-color": 'black',
          "circle-opacity": 1,
          "circle-radius": [
            "interpolate",
            ["exponential", 2],
            ["zoom"],
            10,
            4,
            16,
            30,
          ],
        },
      },
      firstSymbolId
    );
    
  map.setFilter('pizzaPlaces', inListFilter)
  buttons.forEach( button => button.addEventListener('click', filter))
});

// Create popups
map.on("click", "pizzaPlaces", function (e) {
  e.originalEvent.preventDefault();
  console.log("Clicked on a pizza place...", e.features[0]);
  const props = e.features[0].properties
  let popuphtml =
  `
    <div class=''>
      <h3 class='f4 mt0 mb0'>${props.name}</h3>
      <p class='f5 mt0 lh-copy'>${props.address}, ${props.borough}</p>
      ${
        (() => {
          if(props.scan === '1') {
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
              src="${props['3dModel']}/model.gltf"
              ios-src="${props['3dModel']}/model.usdz"
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
            `
          } else {
            return ''
          }
        })()
      }
    </div>
  `
  const popup = new mapboxgl.Popup({ maxWidth: '350px'})
    .setLngLat(e.lngLat)
    .setHTML(popuphtml)
    .addTo(map);
  
  stopAudio()

  if(props.scan === '1') {
    audio = new Audio(`${props['3dModel']}/audio.m4a`);
    audio.loop = true
    audio.play();
  } 
});

map.on("mouseenter", "pizzaPlaces", function () {
  map.getCanvas().style.cursor = "pointer";
});

map.on("mouseleave", "pizzaPlaces", function () {
  map.getCanvas().style.cursor = "";
});

mapContainer.addEventListener('click', e => {
  if (e.target.classList.contains('mapboxgl-popup-close-button')) {
    stopAudio()
  }
})

function enableZoom(entries) {
  console.log(entries[0].isIntersecting)
  if( !entries[0].isIntersecting && !map.scrollZoom.isEnabled() ) {
    map.scrollZoom.enable({ around: 'center' })
  } else if (entries[0].isIntersecting && map.scrollZoom.isEnabled()){
    map.scrollZoom.disable()
  }
}

function stopAudio() {
  if (audio) {
    audio.pause()
    audio = null
  }
}

function filter(e) {
  const name = e.target.dataset.filter
  buttons.forEach(button => button.classList.remove('active'))
  e.target.classList.add('active')
  map.setFilter('pizzaPlaces', name === 'all' ? inListFilter : [
    '==',
    ['get', name],
    '1'
  ])
}