
let isMouseDown = false;
let toolbarToggle = false;


let filterToggle = false;

let filterPoi = false;
let filterPoiButton;
let filterPoiOption;


let filterTrail = false;
let filterTrailButton;
let filterTrailOption;

let toggleDistance = false;
let distanceInputPopout;
let distanceInMeterInput;
let polyLineEventInput;

let toolbarCreatePoi;
let toolbarCreateTrail;

let getSVG;
let standardTextClr;

let toggleTrail = false;
let customTrailPath = [];
let trailName = "";
let trailDescription = "";
let trailCategory = "";

let togglePoi = false;
let customPoiCoordinates;
let customTrailCoordinates;
let poiName = "";
let poiDescription = "";
let poiMarker = "";

let trailObjects = [];
let poiObjects = [];

let placedUserTrails = [];
let placedBuffers = [];
let trailCount = 0;
let poiCount = 0;
let bufferCount = 0;


document.addEventListener("DOMContentLoaded", function () {

    // Toolbar svg icons color to a css variable.
    getSVG = document.querySelector(".toolbar__tools-item");
    standardTextClr = getComputedStyle(document.documentElement).getPropertyValue("--clr-text-standard");
    getSVG.setAttribute("fill", standardTextClr);

    const svgIconButtons = document.querySelectorAll(".toolbar__tools-link");
    svgIconButtons.forEach(button => {

        button.addEventListener("mousedown", function () {
            isMouseDown = true;
            this.classList.add("pressed");
        });

        button.addEventListener("mouseup", function () {
            isMouseDown = false;
            this.classList.remove("pressed");
        });

        button.addEventListener("mouseleave", function () {
            if (isMouseDown) {
                this.classList.remove("pressed");
                isMouseDown = false;
            }
        });
    });


//========= TOGGLE SUB MENUS TRAIL/POINT ====
    function toggleEditMode(toggle) {
        editMode = toggle;
        if (!editMode) {
            clearReferencePoint();
        }
    }
    function toggleToolbarMode(toggle) {
        toolbarToggle = toggle;
        if (!toolbarToggle) {
            resetToggleButtons();
        }
    }
    function toggleFilterMode(toggle) {
        filterToggle = toggle;
        if (!filterToggle) {
            resetFilterButtons();
        }
    }

    function resetFilterButtons() {
        if(filterPoi){
            filterPoiButton.classList.remove("toolbar__tools-link-on");
            createPoiFilter.style.display = "none";
        }
        if(filterTrail){
            filterTrailButton.classList.remove("toolbar__tools-link-on");
            createTrailFilter.style.display = "none";
        }
    }
    function resetToggleButtons() {
        if(togglePoi){
            togglePoiButton.classList.remove("toolbar__tools-link-on");
            toolbarCreatePoi.style.display = "none";
        }
        if(toggleTrail){
            toggleTrailButton.classList.remove("toolbar__tools-link-on");
            toolbarCreateTrail.style.display = "none";
        }
        toggleEditMode(false);
    }

    function resetInputs(){
        if(toggleTrail){
            customTrailPath = [];
            document.getElementById("customTrail-name").value = "";
            document.getElementById("customTrail-description").value = "";
            document.getElementById("customTrail-category").value = "";
            document.getElementById("toolbar__dropdown-trail-categories").value = "Välj kategori";
        }else if(togglePoi){
            customPoiCoordinates = "";
            document.getElementById("customPoi-name").value = "";
            document.getElementById("customPoi-description").value = "";
            document.getElementById("toolbar__dropdown-poi-markers").value = "Välj markör";
        }
    }

    function undoObject(){
        console.log(toggleTrail);
        console.log(trailCount);
        
        if(filterToggle && bufferCount > 0){
            let lastAddedBuffer = bufferLayer.graphics[bufferLayer.graphics.length -1];
            if(lastAddedBuffer){
                bufferLayer.remove(lastAddedBuffer);
                placedBuffers.pop();
                bufferCount--;
            }         
        }

        if(toggleTrail && trailCount > 0){
            let trailColorLayers = 3;

            for(let i = 0; i < trailColorLayers; i++){
                let lastAddedTrail = trailLayer.graphics[trailLayer.graphics.length -1];
                if(lastAddedTrail){
                    trailLayer.remove(lastAddedTrail);                       
                    placedUserTrails.pop();
                    }
                    console.log("removed a trail...")
            }
            trailCount--;
            console.log(trailCount);
            
        }else if(togglePoi && poiCount > 0){
            const lastAddedPoi = poiLayer.graphics[poiLayer.graphics.length -1];
            if(lastAddedPoi){
                poiLayer.remove(lastAddedPoi);
                userPoisArray.pop();
                poiCount--;
            }
        }else if(toggleTrail && !filterToggle && refSegmentCount > 0){
            const lastAddedSegment = refLayer.graphics[refLayer.graphics.length -1];
            if(lastAddedSegment){
                refLayer.remove(lastAddedSegment);
                referenceTrailPath.pop();
                refSegmentCount--;
                if(refSegmentCount=== 0){
                    referenceTrailPath = [];
                }
            }    
        }
    }


    function removeRefTrail(){
        let lastSegment;
        for(let i = 0; i < refSegmentCount; i++){
            lastSegment = refLayer.graphics[refLayer.graphics.length -1];
            refLayer.remove(lastSegment);
            console.log("refLayer remove..")
        }
        referenceTrailPath = [];
        refSegmentCount = 0;
    }

    
    function clearPoiInputVariables(){
        customPoiCoordinates = "";
        poiName = "";
        poiDescription = "";
        poiMarker = "";
    }
    function clearTrailInputVariables(){
        customTrailPath = [];
        trailName = "";
        trailDescription = "";
        trailCategory = "";
    }


//===== Hide all objects from map ========================
    function hideAllMapObjects() {

        poiLayer.graphics.forEach((poi)=> {
                poi.hide();
        });
        trailLayer.graphics.forEach((trail)=> {
            trail.hide();
        });
        clickTrailLayer.graphics.forEach((clTrail)=> {
            clTrail.hide();
        });
        bufferLayer.graphics.forEach((buff)=> {
            buff.hide();
        });
        refLayer.graphics.forEach((ref)=> {
            ref.hide();
        });
    }
//=========================================================



    function forwardSaveData(){
        if(toggleTrail){
            console.log("spara trail...placedUserTrail: ")
            console.log(placedUserTrails);
            saveTrails(placedUserTrails);
            
        }else if(togglePoi){
            console.log("spara pois...userPoisArray: ")
            console.log(userPoisArray);
            savePois(userPoisArray);
        }
    }



    let toolbarToggleButton = document.getElementById("toolbar__tools-toggle-button");
    toolbarToggleButton.addEventListener("click", function () {
        const toolbarSelectObject = document.getElementById("toolbar__select-object");
        if(!this.classList.contains("toolbar__tools-link-on")){
            this.classList.toggle("toolbar__tools-link-on");
            toggleToolbarMode(true);
        }else{
            this.classList.toggle("toolbar__tools-link-on");
            toggleToolbarMode(false);
        }
        toolbarSelectObject.style.display = toolbarToggle ? "flex" : "none";
    });

    let filterToggleButton = document.getElementById("toolbar__tools-filter-button");
    filterToggleButton.addEventListener("click", function () {
        const filterSelectObject = document.getElementById("filter__select-object");
        if(!this.classList.contains("toolbar__tools-link-on")){
            this.classList.toggle("toolbar__tools-link-on");
            toggleFilterMode(true);
            toggleEditMode(false);
        }else{
            this.classList.toggle("toolbar__tools-link-on");
            toggleFilterMode(false);
            
        }
        filterSelectObject.style.display = filterToggle ? "flex" : "none";
    });




    let togglePoiButton = document.getElementById("toolbar__choose-poi");
    togglePoiButton.addEventListener("click", function () {
        toolbarCreatePoi = document.getElementById("toolbar__create-poi-object");
        if (!this.classList.contains("toolbar__tools-link-on")) {

            if (toggleTrailButton.classList.contains("toolbar__tools-link-on")) {
                toggleTrailButton.classList.remove("toolbar__tools-link-on");
                toolbarCreateTrail.style.display = "none";
                toggleTrail = false;
            }
            this.classList.add("toolbar__tools-link-on");
            toolbarCreatePoi.style.display = "flex";
            togglePoi = true;
            toggleEditMode(true);
        } else {
            this.classList.remove("toolbar__tools-link-on");
            toolbarCreatePoi.style.display = "none";
            togglePoi = false;
            toggleEditMode(false);
        }
    });


    let toggleTrailButton = document.getElementById("toolbar__choose-trail");
    toggleTrailButton.addEventListener("click", function () {
        toolbarCreateTrail = document.getElementById("toolbar__create-trail-object");
        if (!this.classList.contains("toolbar__tools-link-on")) {

            if (togglePoiButton.classList.contains("toolbar__tools-link-on")) {
                togglePoiButton.classList.remove("toolbar__tools-link-on");
                toolbarCreatePoi.style.display = "none";
                togglePoi = false;
            }
            this.classList.add("toolbar__tools-link-on");
            toolbarCreateTrail.style.display = "flex";
            toggleTrail = true;
            toggleEditMode(true);
        } else {
            this.classList.remove("toolbar__tools-link-on");
            toolbarCreateTrail.style.display = "none";
            toggleTrail = false;
            toggleEditMode(false);
        }
    });


    





//===================== CREATE TRAIL ===============================================================

// Dropdown categories select - for user created trails.
    const trailDropdown = document.getElementById("toolbar__dropdown-trail-categories");
    const customTrailInput = document.getElementById("customTrail-category");

    trailDropdown.addEventListener("change", () => {
        customTrailInput.style.display = trailDropdown.value === "custom" ? "inline-block" : "none";
    });
    customTrailInput.style.display = "none";

    document.getElementById("customTrail-name").addEventListener("input", (evt) => {
        trailName = evt.target.value;
    });

    document.getElementById("customTrail-description").addEventListener("input", (evt) => {
        trailDescription = evt.target.value;
    });

    document.getElementById("toolbar__dropdown-trail-list").addEventListener("change", (evt) => {
        trailCategory = evt.target.value;

        if (trailCategory === "custom") {
            document.getElementById("customTrail-category").addEventListener("input", (evt) => {
                trailCategory = evt.target.value;
                
            });
        }
        console.log("TrailCategory: " + trailCategory);
        return trailCategory;
    });




// RESET TRAIL INPUT
    document.getElementById("toolbar__reset-trail-input-button").addEventListener("mousedown", function () {
        this.classList.add("toolbar__tools-link-mousedown");
        resetInputs();
    });

    document.getElementById("toolbar__reset-trail-input-button").addEventListener("mouseup", function () {
        this.classList.remove("toolbar__tools-link-mousedown");
    });

// UNDO PLACED TRAIL
    document.getElementById("toolbar__undo-trail-input-button").addEventListener("mousedown", function () {
        this.classList.add("toolbar__tools-link-mousedown");
        undoObject();
    });

    document.getElementById("toolbar__undo-trail-input-button").addEventListener("mouseup", function () {
        this.classList.remove("toolbar__tools-link-mousedown");
        
    });

// STORE TRAIL TEMP
    document.getElementById("toolbar__store-trail-input-button").addEventListener("mousedown", function (evt) {
        console.log("toggleTrail: ");
        console.log(toggleTrail);
        createTrailCategory(trailCategory);
        if(!validateInputs() || !validateSelections()){
            evt.preventDefault();
            console.log("Trail prevented default.")
            return;
        }else{
            this.classList.add("toolbar__tools-link-mousedown");
            tempHoldUserTrailObjects({ customTrailPath, trailName, trailDescription, trailCategory });
            clearReferencePoint();
            resetInputs();
            clearTrailInputVariables();
            removeRefTrail()
            trailCount++;
        }
    });
    document.getElementById("toolbar__store-trail-input-button").addEventListener("mouseup", function () {
        this.classList.remove("toolbar__tools-link-mousedown");
    });

    

// SAVE PLACED TRAILS
    document.getElementById("toolbar__save-trail-input-button").addEventListener("mousedown", function (evt) {
        this.classList.add("toolbar__tools-link-mousedown");
        if(placedUserTrails.length === 0){
            evt.preventDefault();
            console.log("Ingen trail är skapad, inget att spara");
            return;
        }else{
            forwardSaveData();
            clearReferencePoint();
            resetInputs();
            clearTrailInputVariables();
            toggleToolbarMode();
            trailCount = 0;
        }
    });

    document.getElementById("toolbar__save-trail-input-button").addEventListener("mouseup", function () {
        this.classList.remove("toolbar__tools-link-mousedown");
    });

// LOAD STORED TRAILS
    document.getElementById("toolbar__load-trail-input-button").addEventListener("mousedown", function () {
        this.classList.add("toolbar__tools-link-mousedown");
        // check?!
        loadTrails();
    });

    document.getElementById("toolbar__load-trail-input-button").addEventListener("mouseup", function () {
        this.classList.remove("toolbar__tools-link-mousedown");
    });

// DELETE SAVED TRAILS
    document.getElementById("toolbar__delete-trail-input-button").addEventListener("mousedown", function () {
        this.classList.add("toolbar__tools-link-mousedown");
        // check?!
        toggleDeleteMode(true);
        deleteSavedTrails();
        removeSavedTrailCategories();
        toggleDeleteMode(false);
        
    });

    document.getElementById("toolbar__delete-trail-input-button").addEventListener("mouseup", function () {
        this.classList.remove("toolbar__tools-link-mousedown");
    });

// REFRESH MAP VIEW. CLEAR ALL OBJECTS.
    document.getElementById("toolbar__refresh-trail-input-button").addEventListener("mousedown", function () {
        this.classList.add("toolbar__tools-link-mousedown");
        hideAllMapObjects();
    });

    document.getElementById("toolbar__refresh-trail-input-button").addEventListener("mouseup", function () {
        this.classList.remove("toolbar__tools-link-mousedown");
    });


    







//===================== CREATE POI ===============================================================

    document.getElementById("toolbar__dropdown-poi-markers").addEventListener("change", (evt) => {
        poiMarker = evt.target.value;
    });

    document.getElementById("customPoi-name").addEventListener("input", (evt) => {
        poiName = evt.target.value;
    });

    document.getElementById("customPoi-description").addEventListener("input", (evt) => {
        poiDescription = evt.target.value;
    });


// RESET POI INPUT
    document.getElementById("toolbar__reset-poi-input-button").addEventListener("mousedown", function () {
        this.classList.add("toolbar__tools-link-mousedown");
        resetInputs();
    });

    document.getElementById("toolbar__reset-poi-input-button").addEventListener("mouseup", function () {
        this.classList.remove("toolbar__tools-link-mousedown");
    });

// UNDO PLACED POI
    document.getElementById("toolbar__undo-poi-input-button").addEventListener("mousedown", function () {
        this.classList.add("toolbar__tools-link-mousedown");
        undoObject();
    });

    document.getElementById("toolbar__undo-poi-input-button").addEventListener("mouseup", function () {
        this.classList.remove("toolbar__tools-link-mousedown");
    });

// STORE POI TEMP
    document.getElementById("toolbar__store-poi-input-button").addEventListener("mousedown", function (evt) {
        console.log("togglePoi: ");
        console.log(togglePoi);
        if(!validateInputs() || !validateSelections()){
            evt.preventDefault();
            console.log("Poi prevented default.")
            return;
        }
        this.classList.add("toolbar__tools-link-mousedown");
        tempHoldUserPoiObjects({ customPoiCoordinates, poiName, poiDescription, poiMarker });
        clearReferencePoint();
        clearPoiInputVariables();
    });

    

    document.getElementById("toolbar__store-poi-input-button").addEventListener("mouseup", function () {
        this.classList.remove("toolbar__tools-link-mousedown");
    });

// SAVE PLACED POIS
    document.getElementById("toolbar__save-poi-input-button").addEventListener("mousedown", function () {
        this.classList.add("toolbar__tools-link-mousedown");
        forwardSaveData();
        clearReferencePoint();
        resetInputs();
        clearPoiInputVariables();
        toggleToolbarMode();
    });

    document.getElementById("toolbar__save-poi-input-button").addEventListener("mouseup", function () {
        this.classList.remove("toolbar__tools-link-mousedown");
    });

// LOAD STORED POIS
    document.getElementById("toolbar__load-poi-input-button").addEventListener("mousedown", function () {
        this.classList.add("toolbar__tools-link-mousedown");
        // check?!
        loadPois();
    });

    document.getElementById("toolbar__load-poi-input-button").addEventListener("mouseup", function () {
        this.classList.remove("toolbar__tools-link-mousedown");
    });

// DELETE SAVED POIS
    document.getElementById("toolbar__delete-poi-input-button").addEventListener("mousedown", function () {
        this.classList.add("toolbar__tools-link-mousedown");
        // check?!
        toggleDeleteMode(true);
        deleteSavedPois();
        toggleDeleteMode(false);
    });

    document.getElementById("toolbar__delete-poi-input-button").addEventListener("mouseup", function () {
        this.classList.remove("toolbar__tools-link-mousedown");
    });

// REFRESH MAP VIEW. CLEAR ALL OBJECTS.
    document.getElementById("toolbar__refresh-poi-input-button").addEventListener("mousedown", function () {
        this.classList.add("toolbar__tools-link-mousedown");
        hideAllMapObjects();
    });

    document.getElementById("toolbar__refresh-poi-input-button").addEventListener("mouseup", function () {
        this.classList.remove("toolbar__tools-link-mousedown");
    });






//===================== FILTER MAP OBJECTS ===============================================================

    let distanceToggleButton = document.getElementById("filter__tools-distance-button");
    distanceToggleButton.addEventListener("click", function () {
        let distanceInputPopout = document.getElementById("filter__tools-distance-popout");
        
        if (!this.classList.contains("toolbar__tools-link-on")) {
            this.classList.add("toolbar__tools-link-on");
            distanceInputPopout.style.display = "flex";
            toggleDistance = true;
            
        } else {
            this.classList.remove("toolbar__tools-link-on");
            distanceInputPopout.style.display = "none";
            toggleDistance = false;
        }
    });


//DISTANCE INPUT FIELD (meters)
    let distanceInput = document.getElementById("filter__distance-input");
    distanceInput.addEventListener("input", function(){
        distanceInMeterInput = distanceInput.value;
        console.log("distanceInMeterInput: " + distanceInMeterInput);
    });
    

//CONFIRM DISTANCE-TO FILTER
    document.getElementById("filter__tools-confirm-button").addEventListener("mousedown", function () {
        this.classList.add("toolbar__tools-link-mousedown");

        findNearestPoisfromTrail(polyLineEventInput, distanceInMeterInput)

    });

    document.getElementById("filter__tools-confirm-button").addEventListener("mouseup", function () {
        this.classList.remove("toolbar__tools-link-mousedown");
    });

//REMOVE ADDED BUFFER FILTER
    document.getElementById("toolbar__undo-buffer-input-button").addEventListener("mousedown", function () {
        this.classList.add("toolbar__tools-link-mousedown");
        undoObject();
        unfilterPois()
    });

    document.getElementById("toolbar__undo-buffer-input-button").addEventListener("mouseup", function () {
        this.classList.remove("toolbar__tools-link-mousedown");
    });
    

//===================== FILTER TRAIL ===============================================================
    // Dropdown filter - for trail.
    let filterTrailDropdown = document.getElementById("filter__dropdown-trail-categories");
    filterTrailDropdown.addEventListener("change", (evt) => {
        filterTrailOption = evt.target.value;
        toggleTrailType(filterTrailOption);
    });


//===================== FILTER POI ===============================================================
    // Dropdown filter - for POI.
    let filterPoiDropdown = document.getElementById("filter__dropdown-poi-categories");
    filterPoiDropdown.addEventListener("change", (evt) => {
        filterPoiOption = evt.target.value;
        togglePoiType(filterPoiOption);
        // varje val ska togglas på eller av.
    });



//Toolbar passes on graphic objects for visual creation and keep track of count, to have undo-function.
    function tempHoldUserTrailObjects() {
        trailCount++;
        console.log(trailCount);
        const userTrailData = {
            "type": trailCategory,
            "name": trailName,
            "desc": trailDescription,
            "nbr" : trailCount,
        };
        console.log(customTrailPath);
        customTrailPath = referenceTrailPath;
        createUserTrails(referenceTrailPath, userTrailData);
    }

    function tempHoldUserPoiObjects() {
        poiCount++;
        const customPoiObject = { userPoi: [] };

        const userPoi = {
            "name": poiName,
            "lon": customPoiCoordinates.x,
            "lat": customPoiCoordinates.y,
            "desc": poiDescription,
            "imgPath": "",
            "type": poiMarker.toString()
        };
        customPoiObject.userPoi.push(userPoi);
        const poiJson = {
            customPoiObject
        };
        showPois(poiJson, true);
    }
});