//===== Map related functions esri / require ===============
let map;
let mapPoint;
let clickGraphic;
let poisArray;
let userPoisArray = [];
let testDataArray = [];
let editMode = false;
let deleteMode = false;
let clickPoiArray = [];
let clickTrailArray = [];

let objectGeometry;
let geometryEngine;

let referenceTrailPath = [];
let refPointCount = 0;
let refSegmentCount = 0;
let refTrails = [];

//Map layers
let clickPoiLayer;
let clickTrailLayer;
let poiLayer;

let trailLayer;
let bufferLayer;
let refLayer;

let poiCounter = 0;
const poiUrl = ["src/data/POI/"];
const trailUrl = ["src/data/Biking_walking_no_elevation/"];
const trailEUrl = ["src/data/biking_walking_with_elevation/"];
const geodataUrl = ["src/data/Biking_walking_no_elevation/"];

require(["esri/map", "esri/geometry/geometryEngine", "dojo/domReady!"], (Map, geoEng) => {
    geometryEngine = geoEng;
    
    map = new Map("mapDiv", {
        spatialReference: {
            wkid: 4326,
        },
        basemap: "national-geographic",
        logo: false,
        center: [16.895893767662415, 60.288546945883354],
        zoom: 9,
        sliderStyle: false,
        showAttribution: false,
    });

    refLayer = new esri.layers.GraphicsLayer();
    bufferLayer = new esri.layers.GraphicsLayer();
    trailLayer = new esri.layers.GraphicsLayer();
    poiLayer = new esri.layers.GraphicsLayer();
    clickPoiLayer = new esri.layers.GraphicsLayer();
    clickTrailLayer = new esri.layers.GraphicsLayer();

    // Z-order/index for correct layer stacking.
    map.addLayer(refLayer, 3);
    map.addLayer(bufferLayer, 0);
    map.addLayer(trailLayer, 1);
    map.addLayer(clickTrailLayer, 0);
    map.addLayer(clickPoiLayer, 3);
    map.addLayer(poiLayer, 3);
    

    map.on('click', (evt) => {
        mapPoint = esri.geometry.webMercatorToGeographic(evt.mapPoint);
        const mapEvent = evt;
        const coords = [mapPoint.x, mapPoint.y];
        if (togglePoi) {
            customPoiCoordinates = mapPoint;
        } else if (toggleTrail) {
            customTrailCoordinates = mapPoint;
            referenceTrailPath.push(coords);
            customTrailPath.push(coords);
            drawReferenceTrail();
        }
        if (!editMode && !evt.graphic) {
            showClickedPoint(mapEvent);
        }else{
        console.log(evt)
        showReferencePoint(mapPoint);
        map.infoWindow.hide();}

    });
    getTraildata();
    getTrailElevationData()
    loadTrails();
    getPoiData();
    loadPois();
    repopulatePoiDropdown();
    repopulateTrailDropdown();
    
});

//===== Toggle between basemaps ===========================
function changeBasemap(newBasemap) {
    map.setBasemap(newBasemap);
}
//=========================================================



//===== Mouse event handlers for objects(trails) ==========
function objectAddClickHandler(layer) {
    layer.on("click", (evt)=> {
        let clickedGraphic = evt.graphic;
        let attributes = clickedGraphic.attributes;
        objectGeometry = clickedGraphic.geometry
        handlePoiClick(attributes, objectGeometry);
    });
}
function objectAddMouseover(layer, polyGraphic) {
    layer.on("mouse-over", (evt)=> {
        if (evt.graphic === polyGraphic) {
            polyGraphic.symbol.width = hoverTrailWidth;
            evt.graphic.getShape().getNode().classList.add('object-hover-pointer');
            layer.refresh();
        }
    });
}
function objectAddMouseleave(layer, polyGraphic) {
    layer.on("mouse-out", (evt)=> {
        if (evt.graphic === polyGraphic) {
            polyGraphic.symbol.width = trailWidth;
            evt.graphic.getShape().getNode().classList.remove('object-hover-pointer');
            layer.refresh();
        }
    });
}
//=========================================================



//===== Hide all pois, (to later show all filtered) =======
function hidePois() {
    poiLayer.graphics.forEach((poi)=> {
        poi.hide();
    });
}
//=========================================================



//===== Filter pois within a input buffer distance ========
function findNearestPoisfromTrail(polyline, distance) {
    if (!geometryEngine) {
        console.error("geometryEngine fuck up!");
        return;
    }
    if(!map.spatialReference){
        console.error("spatialReference fuck up!");
        return;

    }
    distance = parseInt(distance);
    
    const bufferLine = new esri.geometry.Polyline({
        paths:[polyline.paths[0]],
        spatialReference: new esri.SpatialReference({ wkid: 4326 })
    });
    const bufferZone = geometryEngine.geodesicBuffer(bufferLine, distance, "meters");


    //Create a visual presentation of the filtered/intersect area.
    const bufferBorder = new esri.symbol.CartographicLineSymbol({
        color: new esri.Color([0, 0, 0, 0.7]),
        width: 1,
    }).setStyle(esri.symbol.CartographicLineSymbol.STYLE_DASH);
    
    const bufferSymbol = new esri.symbol.SimpleFillSymbol()
    .setColor(new esri.Color([255, 255, 250, 0.2]))
    .setOutline(bufferBorder);

    const bufferPolygon = new esri.geometry.Polygon();
    const ring = bufferZone.rings[0];
    bufferPolygon.addRing(ring);
    const bufferGraphic = new esri.Graphic(bufferPolygon, bufferSymbol);
    //-----------------------------------------------------
    
    hidePois();
    bufferLayer.add(bufferGraphic);
    placedBuffers.push(bufferGraphic);
    bufferCount++;
    poiLayer.graphics.forEach((poi)=>{
        if(geometryEngine.intersects(bufferZone, poi.geometry)){
            poi.show();    
        }
    });
//=========================================================
}

function drawReferenceTrail (){

    if(toggleTrail && !filterToggle){
        let refPoint = new esri.geometry.Point(mapPoint.x, mapPoint.y);
        let refMarker = new esri.symbol.PictureMarkerSymbol("src/icons/point-svgrepo-com.svg", 2, 2);
        refGraphic = new esri.Graphic(refPoint, refMarker);
        clickPoiLayer.add(refGraphic);
        refPointCount++;

        
        if(referenceTrailPath.length > 1){

            const refLineSymbol = new esri.symbol.CartographicLineSymbol({
                color: new esri.Color("black"),
                width: 2,
            });

            const refPolyline = new esri.geometry.Polyline({
                paths: [referenceTrailPath]
            });
            
            refLineSymbol.setStyle(esri.symbol.CartographicLineSymbol.STYLE_SOLID);
            const refPolyGraphic = new esri.Graphic(refPolyline, refLineSymbol);
            refTrails.push(refPolyGraphic);
            refLayer.add(refPolyGraphic);
            refSegmentCount++;
            
        }
    }
    
}

