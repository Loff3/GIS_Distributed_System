//===== Spara users POIS ==================================
function savePois() {
    console.table(userPoisArray);

    if (userPoisArray.length === 0) {
        console.log("userPoisArray is empty, there is nothing to save!");
    } else {
        const poiObjects = {};

        userPoisArray.forEach((object) => {
            const category = object.category || 'default_category';  // Define your categories

            // Generate a simplified location name based on the "name" attribute
            let location = object.attributes?.name?.toLowerCase().replace(/\s+/g, '_') || 'default_location';

            const poiData = {
                name: object.attributes?.name || '',
                lat: object.geometry?.y || 0,
                lon: object.geometry?.x || 0,
                desc: object.attributes?.description || '',
                imgPath: object.attributes?.imgPath || '',
                type: object.attributes?.type || ''
            };

            if (!poiObjects[category]) {
                poiObjects[category] = {};
            }

            // Each POI has its own location based on the simplified name
            poiObjects[category][location] = [poiData];
        });

        let userPoiData = JSON.stringify(poiObjects, null, 2);

        localStorage.setItem('storedPois', userPoiData);
        let getJson = localStorage.getItem('storedPois');
        let debugJson = JSON.parse(getJson);
        console.log("debug localStorage json: ", debugJson);

        console.log("Användar-POIS är sparade! /savePois().");
    }
}
//=========================================================



//=========================================================
function listPois() {
    console.log(localStorage.getItem('storedPois'))
}
//=========================================================



//=========================================================
function loadPois() {
    const stringifiedPois = localStorage.getItem('storedPois');
    if (stringifiedPois) {
        const poisToLoad = JSON.parse(stringifiedPois);
        const array = poisToLoad[0]

        console.log(poisToLoad)
        showPois(poisToLoad, true)

        console.log("Användar-POIS är laddade! /loadPois().");
    } else {
        console.log("Det fanns inga sparade användar-POI att ladda. /loadPois().");
    }
}
//=========================================================



//===== Återställ placerade punkter =======================
function clearPois() {
    if (editMode) {
        clickPoiLayer.clear();
        console.log("Placerade punkter återställdes.");
    }
}
//=========================================================



//===== Ta bort sparade punkter ===========================
function deleteSavedPois() {
    if (editMode && deleteMode) {
        localStorage.removeItem('storedPois');
        console.log("Sparade pois togs bort.");
    }
}
//=========================================================



//===== Spara users TRAILS ==================================
function saveTrails() {

    if (placedUserTrails.length === 0) {
        console.log(" PlacedUserTrails is empty, there is nothing to save!")
        return;
    } else {

        const trailObjects = placedUserTrails.map((object) => {
            const objectData = {};

            if (object.geometry.type === 'polyline') {
                objectData.trailPath = object.geometry.paths[0];
            }

            if (object.attributes && object.attributes.type) {
                objectData.type = object.attributes.type;  
                objectData.name = object.attributes.name; 
                objectData.desc = object.attributes.desc; 
                objectData.nbr = object.attributes.nbr;// ---> If a certain index of the trailLayer is to be removed.
            }
            return objectData;
        });

        let userTrailData = JSON.stringify(trailObjects);
        localStorage.setItem('storedTrails', userTrailData);

        let getJson = localStorage.getItem('storedTrails');
        let debugJson = JSON.parse(getJson);
        console.log(debugJson);
        console.log("Användar-TRAILS är sparade! /saveTrails().");
    }
}
//=========================================================



//===== Load user-made trails =============================
function loadTrails() {
    const stringifiedTrails = localStorage.getItem('storedTrails');
    
    if (stringifiedTrails) {
        const trailsToLoad = JSON.parse(stringifiedTrails);
        console.log("trailsToLoad..." + trailsToLoad);
        trailsToLoad.forEach((t) => {

            const loadUserTrailPath = t.trailPath;
            const loadUserTrailData = {
                type: t.type,
                name: t.name,
                desc: t.desc,
                nbr: t.nbr
            };

            createUserTrails(loadUserTrailPath, loadUserTrailData);
            console.log("loaded/added a trail...???");
        });
        console.log("Användar-leder är laddade! /loadTrails().");

    } else {
        console.log("Det fanns inga sparade användar-leder att ladda. /loadTrails().");
    }
}
//=========================================================



//===== Återställ placerade trails =======================
function clearTrails() {
    clickTrailLayer.clear();
    console.log("Placerade leder återställdes.");
}
//=========================================================



//===== Ta bort sparade leder ===========================
function deleteSavedTrails() {
    if (editMode && deleteMode) {
        localStorage.removeItem('storedTrails');
        console.log("Sparade leder togs bort.");
    }
}
//=========================================================