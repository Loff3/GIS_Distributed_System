function validateInputs(){

    let regex = /^[A-ZÅÄÖa-zåäö0-9\s-]{1,15}$/;
    let inputs;
    
    if(toolbarToggle){
        
        if(toggleTrail){
            const nameInput = trailName;
            const descInput = trailDescription;
            const cateInput = trailCategory;

            inputs = {
                namn: nameInput,
                beskrivning: descInput,
                kategori: cateInput,
            }
        }else if(togglePoi){
            const nameInput = poiName;
            const descInput = poiDescription;
            const markInput = poiMarker;

            inputs = {
                namn: nameInput,
                beskrivning: descInput,
                kategori: markInput,
            }
        }
    }
/*    
    else{

        // Add more text inputs for validation here.

        inputs = {
            namn:"",
            beskrivning:"",
            kategori:"",
        }
    }
*/

    for(let key in inputs){
        if(!regex.test(inputs[key])){

            if(inputs[key].length < 1 || inputs[key].length > 15){
                alert("Invalid input: " + key + ".\nInput empty.\nMust be atleast one character." );               
            }else{
                alert("Invalid input:  " + key + ".\nInput: [ " + inputs[key] + " ]\nCorrect and try again!" );
            }
            return false;
        }
    }
    return true;
}

function validateSelections(){
    // For selections validations and such.
    return true;
}