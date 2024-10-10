function getPoiData() {
    fetchPoiData("Canoe_POI.json").then(showPois);
}

async function fetchPoiData(file) {
    const response = await fetch(poiUrl + file);
    return response.json();
}

//===== Create and add-to-map default pois ================
function createPOIGraphic(JSONdata, key, poi, isUserPoi) {
    const poiSymbolCamping = new esri.symbol.PictureMarkerSymbol("src/icons/poiCamping.svg", 30, 30);
    const poiSymbolRest = new esri.symbol.PictureMarkerSymbol("src/icons/poiRest.svg", 30, 30);
    const poiSymbolBath = new esri.symbol.PictureMarkerSymbol("src/icons/poiBeach.svg", 30, 30);
    const poiSymbolPoi = new esri.symbol.PictureMarkerSymbol("src/icons/poiPoi.svg", 30, 30);
    const poiSymbolUser = new esri.symbol.PictureMarkerSymbol("src/icons/poiUser.svg", 30, 30);

    let lon = JSONdata[key][poi][0].lon;
    let lat = JSONdata[key][poi][0].lat;
    let userPoi = null
    let poiPoint = new esri.geometry.Point(lon, lat);
    let poiSymbol;
    if (isUserPoi) {
        userPoi = isUserPoi
    }
    switch (JSONdata[key][poi][0].type) {
        case "" | null:
            console.log("Error: 'Type' missing from JSON Data")
            return;
        case "Camping":
            poiSymbol = poiSymbolCamping;
            break;
        case "Badplats":
            poiSymbol = poiSymbolBath;
            break;
        case "POI":
            poiSymbol = poiSymbolPoi;
            break;
        case "Rastplats":
            poiSymbol = poiSymbolRest;
            break;
        case "UserPoi":
            poiSymbol = poiSymbolUser;
            break;
        default:
            poiSymbol = poiSymbolCamping;
            break;
    }
    // When: NOT a user poi.
    if (JSONdata[key][poi][0].type !== "UserPoi" && userPoi === null) {
        let poiGraphic = new esri.Graphic(poiPoint, poiSymbol, {
            name: JSONdata[key][poi][0].name,
            description: JSONdata[key][poi][0].desc,
            type: JSONdata[key][poi][0].type,
            imgPath: JSONdata[key][poi][0].imgPath,
        });

        // Add poiLayer handlers for click, hover and mouse-out (default pois). 
        poiLayer.on("click", (evt)=> {
            let clickedGraphic = evt.graphic;
            let attributes = clickedGraphic.attributes;
            handlePoiClick(attributes);
        });
        poiLayer.on("mouse-over", (evt)=> {
            if (evt.graphic === poiGraphic) {
                poiGraphic.size = 35
                evt.graphic.getShape().getNode().classList.add('object-hover-pointer');
                poiLayer.refresh()
            }
        });
        poiLayer.on("mouse-out", (evt)=> {
            if (evt.graphic === poiGraphic) {
                poiGraphic.size = 30
                evt.graphic.getShape().getNode().classList.remove('object-hover-pointer');
                poiLayer.refresh()
            }
        });
        //---------------------------------------------------------

        poiLayer.add(poiGraphic);
        poisArray.push(poiGraphic);


        // When: IS a user poi.
    } else {
        let poiGraphic = new esri.Graphic(poiPoint, poiSymbol, {
            name: JSONdata[key][poi][0].name,
            description: JSONdata[key][poi][0].desc,
            type: JSONdata[key][poi][0].type,
        });

        // Add poiLayer handlers for click, hover and mouse-out (default pois). 
        poiLayer.on("click", (evt)=> {
            let clickedGraphic = evt.graphic;
            let attributes = clickedGraphic.attributes;
            handlePoiClick(attributes);
        });
        poiLayer.on("mouse-over", (evt)=> {
            if (evt.graphic === poiGraphic) {
                poiGraphic.size = 35
                evt.graphic.getShape().getNode().classList.add('object-hover-pointer');
                poiLayer.refresh()
            }
        });
        poiLayer.on("mouse-out", (evt)=> {
            if (evt.graphic === poiGraphic) {
                poiGraphic.size = 30
                evt.graphic.getShape().getNode().classList.remove('object-hover-pointer');
                poiLayer.refresh()
            }
        });
        //-------------------------------------------------

        poiLayer.add(poiGraphic);
        userPoisArray.push(poiGraphic);
    }
}
//=========================================================



//===== Hide/show poiLayer ================================
function togglePoiLayer(poiLayer) {
    poiLayer.setVisibility(!poiLayer.visible);
}
//=========================================================



//===== Let all pois re-appear ============================
function unfilterPois(){
    poiLayer.graphics.forEach((poi)=>{
        poi.show();
    });
}




//===== Toggle visible poi types ==========================
function togglePoiType(poiType) {
    poiLayer.graphics.forEach(function (graphic) {
        if (graphic.attributes && graphic.attributes.type) {
            if (graphic.attributes.type === poiType) {
                graphic.visible ? graphic.hide() : graphic.show();
            }
        }
    });
}
//=========================================================



//===== POI-Category handler ==============================
async function createPoiType() {
    try {
        var newPoiType = document.getElementById('newPoiType').value;
        // Check for stored poi types first.
        if (localStorage.getItem('storedPoiTypes')) {
            console.log("Local save already exists, using local save.");
            const loadedPoiTypesFile = localStorage.getItem('storedPoiTypes');
            console.log(loadedPoiTypesFile)
            const poiTypes = JSON.parse(loadedPoiTypesFile);
            for (let i = 0; i < poiTypes.length; i++) {
                const type = poiTypes[i];
                if (type.toLowerCase() === newPoiType.toLowerCase()) {
                    console.log("Type already exists");
                    return true;
                }
            }

            console.log("Type does not exist, creating " + newPoiType);
            poiTypes.push(newPoiType);
            await savePoiTypes(poiTypes);
            repopulatePoiDropdown()
            return true;
        } else {
            // If no existing types, fetch default types.
            const poiTypeData = await fetchPoiDefaultTypes();

            for (let i = 0; i < poiTypeData.length; i++) {
                const type = poiTypeData[i];
                if (type.toLowerCase() === newPoiType.toLowerCase()) {
                    console.log("Type already exists");
                    return true;
                }
            }
            console.log("Type does not exist, creating " + newPoiType);
            poiTypeData.push(newPoiType);
            console.log(poiTypeData)
            await savePoiTypes(poiTypeData);
            repopulatePoiDropdown()
            return true;
        }
    } catch (error) {
        console.error("Error fetching POI types:", error);
        return false;
    }
}
//=========================================================



//===== Remove a poi type and update dropdown =============
async function removePoiType(typeName) {
    try {
        if (localStorage.getItem('storedPoiTypes')) {
            const loadedPoiTypesFile = localStorage.getItem('storedPoiTypes');
            const poiTypes = JSON.parse(loadedPoiTypesFile);
            const index = poiTypes.findIndex(type => type.toLowerCase() === typeName.toLowerCase());
            if (index === -1) {
                console.log("Type does not exist");
                return false;
            } else {
                console.log("Removing type: " + typeName);
                poiTypes.splice(index, 1);
                await savePoiTypes(poiTypes);
                repopulatePoiDropdown()
                return true;
            }
        } else {
            console.log("No saved POI types found.");
            return false;
        }
    } catch (error) {
        console.error("Error removing POI type:", error);
        return false;
    }
}
//=========================================================



//===== Remove selected poi type ==========================
async function removeSelectedPoiType() {
    const removePoiTypeSelect = document.getElementById('removePoiTypeSelect');
    const selectedType = removePoiTypeSelect.value;
    if (selectedType) {
        const success = await removePoiType(selectedType);
        if (success) {
            alert('Removed POI Type: ' + selectedType);
        } else {
            alert('Failed to remove POI Type: ' + selectedType);
        }
        hideForms();
    } else {
        alert('Please select a POI type to remove.');
    }
}
//=========================================================



//===== Fetch default types (paused, not in use ===========
async function fetchPoiDefaultTypes2222() {
    const response = await fetch(poiUrl + "Poi_Types.json");
    const data = await response.json();
    return data.types.map(typeObj => typeObj.type);
}
//=========================================================



//===== List poi-types ====================================
async function listPoiTypes() {
    try {
        if (localStorage.getItem('storedPoiTypes')) {
            const loadedPoiTypesFile = localStorage.getItem('storedPoiTypes');
            const poiTypes = JSON.parse(loadedPoiTypesFile);
            return poiTypes;
        } else {
            console.log("No saved POI types found.");
            return [];
        }
    } catch (error) {
        console.error("Error listing POI types:", error);
        return [];
    }
}
//=========================================================



//===== Rename a poi-type =================================
async function renamePoiType(oldPoiType, newPoiTypeName) {
    try {
        if (localStorage.getItem('storedPoiTypes')) {
            const loadedPoiTypesFile = localStorage.getItem('storedPoiTypes');
            const poiTypes = JSON.parse(loadedPoiTypesFile);
            const index = poiTypes.findIndex(type => type.toLowerCase() === oldPoiType.toLowerCase());
            console.log(index)
            if (index === -1) {
                console.log("Type does not exist");
                return false;
            } else {
                console.log("Renaming type from " + oldPoiType + " to " + newPoiTypeName);
                poiTypes[index] = newPoiTypeName;
                await savePoiTypes(poiTypes);
                repopulatePoiDropdown();
                return true;
            }
        } else {
            console.log("No saved POI types found.");
            return false;
        }
    } catch (error) {
        console.error("Error renaming POI type:", error);
        return false;
    }
}
//=========================================================



//===== Rename selected poi-type ==========================
async function renameSelectedPoiType() {
    const renamePoiTypeSelect = document.getElementById('renamePoiTypeSelect');
    const newPoiTypeNameInput = document.getElementById('newPoiTypeName');

    if (!renamePoiTypeSelect || !newPoiTypeNameInput) {
        console.error('Element not found');
        return;
    }

    const oldPoiType = renamePoiTypeSelect.value;
    const newPoiTypeName = newPoiTypeNameInput.value;

    if (oldPoiType && newPoiTypeName) {
        const success = await renamePoiType(oldPoiType, newPoiTypeName);
        if (success) {
            alert('Renamed POI Type: ' + oldPoiType + ' to ' + newPoiTypeName);
        } else {
            alert('Failed to rename POI Type: ' + oldPoiType);
        }
        hideForms();
    } else {
        alert('Please select a POI type to rename and provide a new name.');
    }
}
//=========================================================



//===== Repopulate poi-type dropdown ======================
function repopulatePoiDropdown() {
    let storedPoiTypes = JSON.parse(localStorage.getItem('storedPoiTypes'));
    // If storedPoiTypes is null or empty, fetch them from default URL
    if (!storedPoiTypes || storedPoiTypes.length === 0) {
        fetchPoiDefaultTypes()
            .then(defaultPoiTypes => {
                storedPoiTypes = defaultPoiTypes;
                populatePoiTypeDropdown(storedPoiTypes);
            })
            .catch(error => {
                console.error('Failed to fetch default POI types:', error);
            });
    } else {
        populatePoiTypeDropdown(storedPoiTypes);
    }
}
//=========================================================



//===== Remove poi-types (localStorage) ?==================
function removePoiTypeSave() {
    localStorage.removeItem('storedPoiTypes')
}
//=========================================================



//===== Fetch default poi-types ===========================
async function fetchPoiDefaultTypes() {
    const response = await fetch(poiUrl + "Poi_Types.json");
    const data = await response.json();
    return data.types.map(typeObj => typeObj.type);
}
//=========================================================



//===== Save poi-types ====================================
async function savePoiTypes(typeData) {
    if (typeData === null || typeData === "") {
        console.log("Poi-type save failed.")
    } else {
        let jsonData = JSON.stringify(typeData);
        localStorage.setItem('storedPoiTypes', jsonData);
        console.log(jsonData)
        console.log("Poi-types Saved")
    }
}
//=========================================================



//===== Create and show default poi objects ===============
function showPois(JSONdata, isUserPoi) {
    poisArray = [];

    for (let key in JSONdata) {
        for (let poi in JSONdata[key]) {
            createPOIGraphic(JSONdata, key, poi, isUserPoi);
        }
    }
}
//=========================================================



//===== Click handler for graphic objects =================
function handlePoiClick(attributes, objectGeometry) {

    //Filter distance tool - Get geometry of clicked polyline object to measure distance from.
    const showNameInDistanceFilter = document.getElementById("filter__distance-nameview");
    showNameInDistanceFilter.value = attributes.name;
    polyLineEventInput = objectGeometry;
    //-----------------------------------------------------

    const infoPanelTitle = document.getElementById('info-panel__title');
    const infoPanelImg = document.getElementById('info-panel__img');
    const infoPanelDesc = document.getElementById('info-panel__desc');
    
    infoPanelTitle.innerHTML = attributes.name + "<br>(" + attributes.type + ")";

    if (attributes.imgPath === "" || attributes.imgPath == null) {
        infoPanelImg.textContent = 'Ingen bild :(';
    } else {
        infoPanelImg.innerHTML = "<img src='src/img/poi/" + attributes.imgPath + "' alt='Text ifall bilden inte laddas'>";
    }
    infoPanelDesc.textContent =
        attributes.description === "" || attributes.description == null ? 'Ingen beskrivning :(' : attributes.description;
    openInfoPanel();
}
//=========================================================


//===== Visual guiding marker for user ====================
function showReferencePoint(mapPoint) {
    if (editMode) {
        if (infoPanelOpen) {
            closeInfoPanel();
            return;
        }
        let point = new esri.geometry.Point(mapPoint.x, mapPoint.y);
        let marker = new esri.symbol.PictureMarkerSymbol("src/icons/point-svgrepo-com.svg", 25, 25);
        clickPoiLayer.remove(clickGraphic);
        clickGraphic = new esri.Graphic(point, marker);
        clickPoiLayer.add(clickGraphic);
    } 
}
//=========================================================



//===== Remove the guiding marker =========================
function clearReferencePoint() {
    clickPoiLayer.remove(clickGraphic);
}
//=========================================================



//===== Create and show infoWindow ========================
function showClickedPoint(evt) {
    // Close info panel if open
    if (infoPanelOpen) {
      closeInfoPanel();
      return;
    }

    let mapPoint = esri.geometry.webMercatorToGeographic(evt.mapPoint);
  
    // Create content for popup
    const popupContent = `
      <div style="
        text-align: center; 
        background-color: var(--clr-bg-standard-secondary);
        border: var(--clr-border-standard);
        border-radius: var(--rad-border-divs)
        ">
        <h3 style="margin: 5px 0;">Coordinates</h3>
        <p style="margin: 5px 0;">Lat: ${mapPoint.y.toFixed(6)}</p>
        <p style="margin: 5px 0;">Lon: ${mapPoint.x.toFixed(6)}</p>
        <button style="margin-top: 10px;" onclick="map.infoWindow.hide()">Close</button>
      </div>
    `;
  
    map.infoWindow.setContent(popupContent);
    map.infoWindow.setTitle("");
    map.infoWindow.show(mapPoint);
}
//=========================================================



//===== Populate the poi-type dropdown ====================
function populatePoiTypeDropdown(poiTypes) {
    const poiTypeDropdown = document.getElementById("toolbar__dropdown-poi-markers");
    // Reset content
    poiTypeDropdown.innerHTML = ""; 

    if (poiTypes) {
        poiTypes.forEach(typeObj => {
            const option = document.createElement("option");
            option.text = typeObj;
            poiTypeDropdown.add(option);
        });
    } else {
        console.error('Invalid POI types data:', poiTypes);
    }
}
//=========================================================



//===== Create user poi ===================================
function createUserPoi(poiName, poiType, poiIcon, poxX, posY, poiDesc) {
    const sms = new esri.symbol.SimpleMarkerSymbol({
        color: [255, 0, 0],
        size: 16,
        outline: {
            color: [30, 30, 30],
            width: 2,
        }
    });
    const point = new esri.geometry.Point(poxX, posY);
    console.log(point)
    let clickGraphic = new esri.Graphic(point, sms, {
        name: poiName,
        type: poiType,
        desc: poiDesc
    });
    console.log(clickGraphic);
    clickGraphic.setInfoTemplate = new esri.InfoTemplate(
        "User placed POI no: " + poiCounter
    );
    clickPoiLayer.add(clickGraphic);
    clickPoiArray.push(clickGraphic);
    console.log(clickPoiArray);

    return clickPoiArray;
}
//=========================================================



//===== Show the form for poi-type creation ===============
function showCreatePoiTypeForm() {
    hideForms();
    document.getElementById('createPoiTypeForm').style.display = 'block';
}
//=========================================================



//===== Show the form for renaming poi-types ==============
async function showRenamePoiTypeForm() {
    hideForms();
    const poiTypes = await listPoiTypes();
    const defaultTypes = await fetchPoiDefaultTypes();
    const renamePoiTypeSelect = document.getElementById('renamePoiTypeSelect');
    renamePoiTypeSelect.innerHTML = '<option value="">Select POI Type to Rename</option>';

    poiTypes.forEach(type => {
        if (!defaultTypes.includes(type)) {
            const option = document.createElement('option');
            option.value = type;
            option.text = type;
            renamePoiTypeSelect.appendChild(option);
        }
    });

    document.getElementById('renamePoiTypeForm').style.display = 'block';
}
//=========================================================



//===== Show the form for removing poi-types ==============
async function showRemovePoiTypeForm() {
    hideForms();
    const poiTypes = await listPoiTypes();
    const defaultTypes = await fetchPoiDefaultTypes();
    const removePoiTypeSelect = document.getElementById('removePoiTypeSelect');
    removePoiTypeSelect.innerHTML = '<option value="">Select POI Type to Remove</option>';

    poiTypes.forEach(type => {
        if (!defaultTypes.includes(type)) {
            const option = document.createElement('option');
            option.value = type;
            option.text = type;
            removePoiTypeSelect.appendChild(option);
        }
    });

    document.getElementById('removePoiTypeForm').style.display = 'block';
}
//=========================================================



//===== Hide the forms ====================================
function hideForms() {
    document.getElementById('createPoiTypeForm').style.display = 'none';
    document.getElementById('renamePoiTypeForm').style.display = 'none';
    document.getElementById('removePoiTypeForm').style.display = 'none';
}
//=========================================================