let userTrailSymbol;
let userTrailStyle;
let userTrailColor;

let trailWidth = 8.0;
let hoverTrailWidth = 5.0;
let lineWidth = 1.5;
let decorWidth = 6.0;
let alpha = 0.4;
let abnormalSegementLimit = 0.0199000;


let trailCategoryUrl = "src/data/Biking_walking_no_elevation/";


//===== Create alpha for trail color function =============
function setAlpha(color, alpha) {
    let rgba = color.toRgb();
    rgba.push(alpha);
    return new esri.Color(rgba);
}


//===== Fetch and forward .json-files =====================
async function getTraildata() {
    try {
        await fetchTrailData("trails.json");
    } catch (error) {
        console.error("Data fetching error: ", error)
    }
}
async function getTrailElevationData() {
    try {
        await fetchTrailElevationData("trails_withelevation.json");
    } catch (error) {
        console.error("Data fetching error: ", error)
    }
}
async function fetchTrailData(file) {
    try {
        const response = await fetch(trailUrl + file);
        const data = await response.json();
        console.log(data);
        showTrails(data);
        console.log("fetched and sent to showTrails...");
    } catch (error) {
        console.error("Error fetching etapp data:", error);
    }
}
async function fetchTrailElevationData(file) {
    try {
        const response = await fetch(trailEUrl + file);
        const data = await response.json();
        console.log(data);
        showTrails(data);
        console.log("fetched and sent to showTrails...");
    } catch (error) {
        console.error("Error fetching etapp data:", error);
    }
}
//=========================================================



//===== Toggle visuble trail types ========================
function toggleTrailType(trailtype) {
    trailLayer.graphics.forEach((graphic) => {
        if (graphic.attributes && graphic.attributes.type) {
            console.log(graphic.attributes)
            
            if (graphic.attributes.type === trailtype) {    
                graphic.visible ? graphic.hide() : graphic.show();
            }
        }
    });
}
//=========================================================



//===== Iterate and read the trails data ==================
function showTrails(JSONdata) {
    console.log(JSONdata);

    Object.keys(JSONdata).map((type) => {
        let trailData = JSONdata[type];
        const trailPath = [];

        Object.keys(trailData).forEach((etapp) => {
            if (etapp !== "type" && etapp !== "name" && etapp !== "desc") {
                trailPath.push(...trailData[etapp].map((longLat) => {
                    return [longLat.longitude, longLat.latitude];
                }));
            }
        });

        if (trailData.type === "UserTrail") {
            createUserTrails(trailPath, trailData, trailData);
        } else {
            createTrails(trailPath, trailData.type, trailData);
        }
        return trailPath, trailData;
    });
}
//=========================================================



//===== Create and show all default trails ================
function createTrails(trailPath, type, jsonData) {

    // Filter input function: Get rid of "gps disturbance".
    let d, x1, x2, y1, y2;
    for(let i = 0; i < trailPath.length-1; i++){
        for(let j = 0; j < trailPath[i].length-1; j++){
            x1 = trailPath[i][j];
            y1 = trailPath[i][j+1];
            x2 = trailPath[i+1][j];
            y2 = trailPath[i+1][j+1];
            d = Math.abs(Math.sqrt( Math.pow((x2 - x1),2) + Math.pow((y2 - y1),2)));
            if(d > abnormalSegementLimit){
                trailPath[i+1][j] = x1;
                trailPath[i+1][j+1] = y1;
                console.log("Long distance, replaced a coordinate...");
            } 
        }
    }
    //--------------------------------------------


    const trailData = jsonData
    const inputType = type;

    let trailSymbol, lineSymbol, decorSymbol;

    let colorBike = new esri.Color("red");
    let colorBike_a = setAlpha(colorBike, alpha);

    let colorWalk = new esri.Color("green");
    let colorWalk_a = setAlpha(colorWalk, alpha);

    let colorCanoe = new esri.Color("blue");
    let colorCanoe_a = setAlpha(colorCanoe, alpha);

    //Category related trail color and style.
    const trailBiking = new esri.symbol.CartographicLineSymbol({
        color: colorBike_a,
        width: trailWidth,
    });
    const lineBiking = new esri.symbol.CartographicLineSymbol({
        color: colorBike,
        width: lineWidth
    });
    const decorBiking = new esri.symbol.CartographicLineSymbol({
        color: new esri.Color("white"),
        width: decorWidth
    });
    const trailWalking = new esri.symbol.CartographicLineSymbol({
        color: colorWalk_a,
        width: trailWidth,
    });
    const lineWalking = new esri.symbol.CartographicLineSymbol({
        color: colorWalk,
        width: lineWidth
    });
    const decorWalking = new esri.symbol.CartographicLineSymbol({
        color: new esri.Color("white"),
        width: decorWidth
    });
    const trailCanoeing = new esri.symbol.CartographicLineSymbol({
        color: colorCanoe_a,
        width: trailWidth,
    });
    const lineCanoeing = new esri.symbol.CartographicLineSymbol({
        color: colorCanoe,
        width: lineWidth
    });
    const decorCanoeing = new esri.symbol.CartographicLineSymbol({
        color: new esri.Color("white"),
        width: decorWidth
    });

    switch (type) {
        case "" | null:
            console.log("Error: 'Type' missing from trail Data")
            return;
        case "walking":
            trailSymbol = trailWalking;
            lineSymbol = lineWalking;
            lineSymbol.setStyle(esri.symbol.CartographicLineSymbol.STYLE_DASH);
            decorSymbol = decorWalking;
            break;
        case "biking":
            trailSymbol = trailBiking;
            lineSymbol = lineBiking;
            lineSymbol.setStyle(esri.symbol.CartographicLineSymbol.STYLE_SOLID);
            decorSymbol = decorBiking;
            break;
        case "canoeing":
            trailSymbol = trailCanoeing;
            lineSymbol = lineCanoeing;
            lineSymbol.setStyle(esri.symbol.CartographicLineSymbol.STYLE_SHORTDASHDOT);
            decorSymbol = decorCanoeing;
            break;
    }

    function drawDecor(){
        const decorPolyline = new esri.geometry.Polyline({
            paths: [trailPath]
        });
        lineSymbol.setCap(esri.symbol.CartographicLineSymbol.CAP_ROUND);
        const linePolyGraphic = new esri.Graphic(decorPolyline, decorSymbol, {
            name: trailData.name,
            type: inputType,
            description: trailData.desc,
            imgPath: ""
        });
        trailLayer.add(linePolyGraphic);
    }
    function drawLine() {
        //A polyline to enhance the presentation of a trail.
        const linePolyline = new esri.geometry.Polyline({
            paths: [trailPath]
        });
        lineSymbol.setCap(esri.symbol.CartographicLineSymbol.CAP_ROUND);
        const linePolyGraphic = new esri.Graphic(linePolyline, lineSymbol, {
            name: trailData.name,
            type: inputType,
            description: trailData.desc,
            imgPath: ""
        });
        trailLayer.add(linePolyGraphic);
    }
    function drawTrail() {
        // Draw the category's wider click able trail polyline on top.
        const trailPolyline = new esri.geometry.Polyline({
            paths: [trailPath],
            spatialReference: new esri.SpatialReference({ wkid: 4326 })
        });
        trailSymbol.setCap(esri.symbol.CartographicLineSymbol.CAP_ROUND);
        let trailPolyGraphic = new esri.Graphic(trailPolyline, trailSymbol, {
            name: trailData.name,
            type: inputType,
            description: trailData.desc,
            imgPath: ""
        });

        objectAddClickHandler(trailLayer);
        objectAddMouseover(trailLayer, trailPolyGraphic);
        objectAddMouseleave(trailLayer, trailPolyGraphic);
        trailLayer.add(trailPolyGraphic);
    }
    
    drawDecor();
    drawLine();
    drawTrail();
    
}
//=========================================================



//===== Create user-made trails ===========================
function createUserTrails(trailPath, trailData) {
    
    console.log("incoming path createUserTrail..")
    console.log(trailPath);
   
    let test_lineColor = new esri.Color("blue");
    let test_trailColor = setAlpha(test_lineColor, alpha);

    const userDecorSymbol = new esri.symbol.CartographicLineSymbol({
        color: new esri.Color("white"),
        width: decorWidth
    });
    
    let userLineSymbol = new esri.symbol.CartographicLineSymbol({
        color: test_lineColor,
        width: lineWidth,
    })

    const userTrailSymbol = new esri.symbol.CartographicLineSymbol({
        color: test_trailColor,
        width: trailWidth,
    });

    function drawUserDecor(){
        const decorPolyline = new esri.geometry.Polyline({
            paths: [trailPath]
        });
        userDecorSymbol.setCap(esri.symbol.CartographicLineSymbol.CAP_ROUND);
        const decorPolyGraphic = new esri.Graphic(decorPolyline, userDecorSymbol, trailData);
        trailLayer.add(decorPolyGraphic);
    }

    function drawUserLine() {
        const linePolyline = new esri.geometry.Polyline({
            paths: [trailPath]
        });

        userLineSymbol.setCap(esri.symbol.CartographicLineSymbol.CAP_ROUND);
        userLineSymbol.setStyle(esri.symbol.CartographicLineSymbol.STYLE_SHORTDASHDOT);
        const linePolyGraphic = new esri.Graphic(linePolyline, userLineSymbol, trailData);
        placedUserTrails.push(linePolyGraphic);
        trailLayer.add(linePolyGraphic);
    }

    function drawUserTrail() {
        const trailPolyline = new esri.geometry.Polyline({
            paths: [trailPath],
            spatialReference: new esri.SpatialReference({ wkid: 4326 })
        });
        userTrailSymbol.setCap(esri.symbol.CartographicLineSymbol.CAP_ROUND);
        const trailPolyGraphic = new esri.Graphic(trailPolyline, userTrailSymbol, trailData);

        objectAddClickHandler(trailLayer);
        objectAddMouseover(trailLayer, trailPolyGraphic);
        objectAddMouseleave(trailLayer, trailPolyGraphic);
        placedUserTrails.push(trailPolyGraphic);
        trailLayer.add(trailPolyGraphic);
        
    }
    drawUserDecor();
    drawUserLine();
    drawUserTrail();
}
//=========================================================



//===== Create and store a users trail category ===========
async function createTrailCategory(categoryInput) {
    try {
        var newTrailCategory = categoryInput;
        // Check for stored trail categories first.
        if (localStorage.getItem('storedTrailCategories')) {
            console.log("Local save already exists, using local save.");
            const loadedTrailCategories = localStorage.getItem('storedTrailCategories');
            console.log(loadedTrailCategories)
            const trailCategories = JSON.parse(loadedTrailCategories);
            for (let i = 0; i < trailCategories.length; i++) {
                const category = trailCategories[i];
                if (category.toLowerCase() === newTrailCategory.toLowerCase()) {
                    console.log("Category already exists");
                    return;
                }
            }

            console.log("Category does not exist, creating " + newTrailCategory);
            trailCategories.push(newTrailCategory);
            await saveTrailCategory(trailCategories);
            repopulateTrailDropdown()
            
        } else {
            // If no existing categories, fetch default types.
            const trailCatData = await fetchDefaultTrailCategories();

            for (let i = 0; i < trailCatData.length; i++) {
                const category = trailCatData[i];
                if (category.toLowerCase() === newTrailCategory.toLowerCase()) {
                    console.log("Category already exists");
                    return true;
                }
            }
            console.log("Category does not exist, creating " + newTrailCategory);
            trailCatData.push(newTrailCategory);
            console.log(trailCatData)
            await saveTrailCategory(trailCatData);
            repopulateTrailDropdown();
            return true;
        }
    } catch (error) {
        console.error("Error fetching trail Categories:", error);
        return false;
    }
}

//===== Repopulate trail category dropdown ======================
function repopulateTrailDropdown() {
    let storedTrailCategories = JSON.parse(localStorage.getItem('storedTrailCategories'));
    // If storedTrailCategories is null or empty, fetch them from default URL
    if (!storedTrailCategories || storedTrailCategories.length === 0) {
        fetchDefaultTrailCategories()
            .then(defaultTrailCategories => {
                storedTrailCategories = defaultTrailCategories;
                populateTrailCategoryDropdown(storedTrailCategories, "toolbar__dropdown-trail-categories");
                populateTrailCategoryDropdown(storedTrailCategories, "filter__dropdown-trail-categories");
            })
            .catch(error => {
                console.error('Failed to fetch default trail categories:', error);
            });
    } else {
        populateTrailCategoryDropdown(storedTrailCategories, "toolbar__dropdown-trail-categories");
        populateTrailCategoryDropdown(storedTrailCategories, "filter__dropdown-trail-categories");
    }
}
//=========================================================



//===== Populate the trail category dropdown ====================
function populateTrailCategoryDropdown(trailCat, elementId) {
    const categoryDropdown = document.getElementById(elementId);
    // Reset content
    categoryDropdown.innerHTML = ""; 

    if (trailCat && trailCat.length > 0) {
        const defaultOption = document.createElement("option");
        defaultOption.value = "0";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.hidden = true;
        defaultOption.text = elementId === "toolbar__dropdown-trail-categories" ? "Category..." : "Filter trail";
        categoryDropdown.add(defaultOption);

        trailCat.forEach(typeObj => {
            const option = document.createElement("option");
            option.value = typeObj.toLowerCase();
            option.text = typeObj;
            categoryDropdown.add(option);
            
        });
        if(elementId === "toolbar__dropdown-trail-categories"){
            const customOption = document.createElement("option");
            customOption.value = "custom";
            customOption.text = "Create new..."
            categoryDropdown.add(customOption);
        }
    } else {
        console.error('Invalid trail category data:', trailCates);
    }
}
//=========================================================



//===== Fetch default trail categories =====================
async function fetchDefaultTrailCategories() {
    const response = await fetch(trailCategoryUrl + "trail_categories.json");
    const data = await response.json();
    return data.types.map(typeObj => typeObj.type);
}
//=========================================================



//===== Save trail categories =============================
async function saveTrailCategory(catData) {
    if (catData === null || catData === "") {
        console.log("Trail-type save failed.")
    } else {
        let jsonData = JSON.stringify(catData);
        localStorage.setItem('storedTrailCategories', jsonData);
        console.log(jsonData)
        console.log("Trail-types Saved")
    }
}
//=========================================================



//===== Remove trail categories (localStorage) ============
function removeSavedTrailCategories() {
    if(deleteMode){
        localStorage.removeItem('storedTrailCategories');
    }
    
}
//=========================================================

