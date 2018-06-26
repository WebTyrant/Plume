var layerMapper = [{
    name: 'DriveBC',
    type: 'geojson',
    endpoint: 'https://drivebctokml.now.sh/geojson',
  },
  {
    name: 'ActiveFirePoints',
    type: 'geojson',
    endpoint: 'https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/BCWS_ActiveFires_PublicView/FeatureServer/0/query?where=FIRE_STATUS+%3C%3E+%27Not+Active%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelEnvelopeIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson&token=',
  }
];

var styles = {
  'Point': [new ol.style.Style({
    image: new ol.style.Circle({
      fill: new ol.style.Fill({
        color: [255, 255, 255, 1]
      }),
      stroke: new ol.style.Stroke({
        color: [0, 0, 0, 1]
      }),
      radius: 5
    })
  })],
  'LineString': [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'green',
      width: 3
    })
  })]
};

function styleFunction(feature, resolution) {
  var geom_name = feature.getGeometry().getType();
  // return styles[geom_name]
  // so styles['Point'] or styles['LineString']
  console.log(feature.getId());
  return styles[geom_name];
};

var map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    }),
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([-127.6476, 53.7267]),
    zoom: 6
  })
});

// geojson so far
layerMapper.forEach((loadLayer) => {

  loadLayer.source = new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    projection: 'EPSG:3857',
    url: loadLayer.endpoint,
  });

  loadLayer.layer = new ol.layer.Vector({
    name: loadLayer.name,
    source: loadLayer.source,
    style: styleFunction,
  });

  map.addLayer(loadLayer.layer);
});

console.log(map.getLayers());


map.on('click', (evt) => {
  var features = [];
  map.forEachFeatureAtPixel(evt.pixel, (f, l) => {
    features.push(f);
  });

  var infoView = document.getElementById('information');
  infoView.innerHTML = '';
  var info = [];

  features.forEach((feature) => {

    //assumption there is a 'name' property
    var properties = feature.getProperties();

    for (var key in properties) {
      var html = '<div><div>' + key + '</div><div>' + properties[key] + '</div></div>';
      infoView.insertAdjacentHTML('beforeend', html);
    };

  });

});