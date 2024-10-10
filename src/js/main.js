/* GLOBALS */
let toggleButton;
let toggleEditButton;
let toggleDeleteButton;
let infoPanel;
let infoPanelOpen = false;
let navBarEditMode = false;


function openInfoPanel() {
    infoPanel.style.right = '0px';
    infoPanelOpen = true;
}

function closeInfoPanel() {
    infoPanel.style.right = '-350px';
    infoPanelOpen = false;
}

function toggleEditMode() {
    if (editMode) {
        editMode = false
        toggleEditButton.textContent = "Editmode: off"
        console.log("editMode false")
    } else {
        editMode = true
        toggleEditButton.textContent = "Editmode: on"
        console.log("editMode true")
    }
}

function toggleDeleteMode() {
    if (deleteMode) {
        deleteMode = false
        toggleDeleteButton.textContent = "Delete-mode: off"
        console.log("delete-Mode false")
    } else {
        deleteMode = true
        toggleDeleteButton.textContent = "Delete-mode: on"
        console.log("delete-Mode true")
    }
}

/* End of globals */

//===== DOM related functions for HTML and CSS ========
document.addEventListener("DOMContentLoaded", function () {
    toggleButton = document.getElementById('infoPanel__toggleButton');
    toggleEditButton = document.getElementById('nav-bar__toggleEditButton');
    toggleDeleteButton = document.getElementById('nav-bar__toggleDeleteButton');
    infoPanel = document.getElementById('infoPanel');


    toggleButton.addEventListener('click', () => {
        if (!toggleButton.classList.contains("toolbar__tools-link-on")) {     
            openInfoPanel();
            toggleButton.classList.toggle("toolbar__tools-link-on");
        } else {
            closeInfoPanel();
            toggleButton.classList.toggle("toolbar__tools-link-on");
        }
    });

    toggleEditButton.addEventListener('click', () => {
        toggleEditMode()
    });

    toggleDeleteButton.addEventListener('click', () => {
        toggleDeleteMode()
    });

    // Loops through all nav-bar dropdown buttons and toggles show/hide content.
    const dropdowns = document.querySelectorAll(".nav-bar__dropdown-btn");
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener("click", function () {
            this.classList.toggle("nav-bar__active");
            const dropdownContent = this.nextElementSibling;
            dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
        });
    });

    // Add event listener to close the info panel when clicking outside
    document.addEventListener('click', (evt) => {
        const mapDiv = document.getElementById('mapDiv');
        if (!infoPanel.contains(evt.target) && evt.target !== toggleButton && !navBar.contains(evt.target)) {
            if (!(mapDiv.contains(evt.target) && evt.graphic)) {
                closeInfoPanel();
            }
        }
    });
});


