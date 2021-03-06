import Map from 'ol/Map.js';

var layerMapper = [{
    name: 'DriveBC Incidents',
    type: 'geojson',
    endpoint: 'https://drivebctokml.now.sh/geojson',
    style: 'drivebc'
  },
  {
    name: 'Active Fire Points',
    type: 'geojson',
    endpoint: 'https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/BCWS_ActiveFires_PublicView/FeatureServer/0/query?where=FIRE_STATUS+%3C%3E+%27Not+Active%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelEnvelopeIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson&token=',
    style: 'firepoint'
  },
  {
    name: 'Active Fire Perimeters',
    type: 'geojson',
    endpoint: 'https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/BCWS_FirePerimeters_PublicView/FeatureServer/0/query?where=FIRE_STATUS+%3C%3E+%27Not+Active%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson&token=',
    style: 'fireperimeter'
  },
  {
    name: 'BC Highway Cameras',
    type: 'geojson',
    endpoint: 'https://services5.arcgis.com/DMpNrZXwcnMmkWrW/arcgis/rest/services/BC_HighwayCams/FeatureServer/0/query?where=&objectIds=&time=&geometry=-14709312.23546%2C+6171605.41945905%2C+-12789524.9063483%2C+8399302.6434706&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson&token=',
    style: 'highwaycams'
  }
];

const defaultStyles = {
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
  })],
  'Polygon': [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'red',
      width: 3
    })
  })]
};

var style = [];

style['firepoint'] = {
  'Point': [new ol.style.Style({
    image: new ol.style.Circle({
      fill: new ol.style.Fill({
        color: [255, 0, 0, 0.5]
      }),
      stroke: new ol.style.Stroke({
        color: 'red'
      }),
      radius: 5
    })
  })]
};

style['highwaycams'] = {
  'Point': [new ol.style.Style({
    image: new ol.style.Circle({
      fill: new ol.style.Fill({
        color: [0, 0, 255, 0.5]
      }),
      stroke: new ol.style.Stroke({
        color: [0, 0, 255, 1]
      }),
      radius: 5
    })
  })]
};

function styleFunction(feature, resolution) {
  const geom_name = feature.getGeometry().getType();
  const layer_style = feature.get('layerStyle');
  console.log(layer_style);

  if (layer_style && style[layer_style]){
    return style[layer_style][geom_name];
  }

  return defaultStyles[geom_name];
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
    zoom: 7,
    extent: [-15483011.17792913, 5744113.096350914, -12675020.506844893, 8679294.982501682],
  })
});

// geojson so far
layerMapper.forEach((loadLayer) => {

  if(loadLayer.type == 'geojson'){
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
  
    loadLayer.source.on( 'addfeature', (event) => addLayerName(event, loadLayer.style));
    
    map.addLayer(loadLayer.layer);
  }
  
});


map.on('click', (evt) => {
  var features = [];
  map.forEachFeatureAtPixel(evt.pixel, function(f, l) {
    features.push(f);
  });

  var infoView = document.getElementById('information');
  infoView.innerHTML = '';
  var info = [];

  features.forEach((feature) => {

    //assumption there is a 'name' property
    var properties = feature.getProperties();

    for (var key in properties) {
      var html = '<div class="row"><div class="col">' + key + '</div><div class="col">' + properties[key] + '</div></div>';
      infoView.insertAdjacentHTML('beforeend', html);
    };

  });

});

function addLayerName(event, layerStyle){
    const feature = event.feature;
    feature.set('layerStyle', layerStyle);
}
