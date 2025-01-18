// Utility to format time and date
function formatTimeDate() {
    const now = new Date();
    let hours = now.getHours() % 12 || 12; // Convert to 12-hour format, ensuring 12:00 is displayed correctly
    let minutes = String(now.getMinutes()).padStart(2, '0'); // Add leading zero if needed
    let seconds = String(now.getSeconds()).padStart(2, '0'); // Add leading zero if needed
    
    const time = `${hours}:${minutes}:${seconds}`; // Construct the time string
    const date = now.toLocaleDateString('en-GB', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'short' 
    }).replace(' ', ', '); // Add a comma between weekday and date
    
    document.getElementById('time').textContent = time;
    document.getElementById('date').textContent = date;
    document.getElementById('font-preview').textContent = `${time} ${date}`;

    document.title = time;
}

// Show popup
function showPopup() {
    displayShortcuts();
    const popup = document.getElementById('popup');
    const background = document.getElementById('popup-background');
    const boxes = document.getElementsByClassName('popup-boxes');
   
    popup.style.visibility = 'visible'; // Make popup visible
    popup.style.opacity = '1';         // Ensure opacity is fully visible   
    popup.style.display = 'flex';
   


    background.style.animation = 'fadeIn 0.2s forwards';

    for (box of boxes) {
        box.style.animation = 'slideIn 0.3s forwards';
    }


    const cog = document.getElementById('cog');
    cog.style.visibility = 'hidden';

}

// Hide popup
function hidePopup() {
    updateFavicons();
    const popup = document.getElementById('popup');
    const background = document.getElementById('popup-background');
    const boxes = document.getElementsByClassName('popup-boxes');

    background.style.animation = 'fadeOut 0.2s forwards';
    

    for (box of boxes) {
        box.style.animation = 'slideOut 0.3s forwards';
    }


    setTimeout(() => {
        popup.style.visibility = 'hidden'; 
        popup.style.opacity = '0';        

    }, 300); // Match the duration of the animations

    const cog = document.getElementById('cog');
    cog.style.visibility = 'visible';
}

// Save key and URL
function saveShortcut() {
    const key = document.getElementById('key').value;
    const url = document.getElementById('url').value;

    if (key && url) {
        localStorage.setItem(key, url);
        alert(`Shortcut saved! Press '${key}' to open ${url}`);
        //TODO: add to shortcutOrder
        
    } else if (key && !url && localStorage.getItem(key)) {
        localStorage.removeItem(key);
        alert(`Shortcut for key '${key}' has been deleted.`);
        //TODO: remove from to shortcutOrder

        
    } else {
        alert('Please enter a key and optionally a URL to save, or just a key to delete its shortcut.');
    }
}

// Display saved shortcuts in the popup
function displayShortcuts() {
    const shortcutsContainer = document.getElementById('saved-shortcuts');
    shortcutsContainer.innerHTML = '';

    const orderedKeys = JSON.parse(localStorage.getItem('shortcutOrder')) || Object.keys(localStorage);
    const updatedKeys = orderedKeys.filter(key => key.length == 1);//cookies from v1 and cookies for colours


    updatedKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            const url = localStorage.getItem(key);

            const shortcutElement = document.createElement('div');
            shortcutElement.classList.add('shortcut');
            shortcutElement.setAttribute('draggable', 'true');
            shortcutElement.dataset.key = key;
            shortcutElement.textContent = `${key}: ${url}`;

            shortcutElement.addEventListener('dragstart', handleDragStart);
            shortcutElement.addEventListener('dragover', handleDragOver);
            shortcutElement.addEventListener('drop', handleDrop);

            shortcutsContainer.appendChild(shortcutElement);
        }
    });

    setPopupWidth();
    
}

function setPopupWidth(){
    const boxes = document.querySelectorAll('.popup-boxes');
    let maxWidth = 0;

    // Find the maximum width among all boxes
    boxes.forEach(box => {
        const width = box.offsetWidth;
        if (width > maxWidth) {
            maxWidth = width;
        }
    });

    maxWidth++;//add 1px to prevent wrapping

    // Apply the maximum width to all boxes
    boxes.forEach(box => {
        box.style.width = `${maxWidth}px`;
    });

    //put text in after assigning width so it will wrap
    document.getElementById("Text-Settings-Note").innerHTML = "Note: Font must be installed on your system and an <strong>exact match</strong> is required.";
}

// Update favicons row
function updateFavicons() {
    const faviconsContainer = document.getElementById('favicons');
    faviconsContainer.innerHTML = '';

    const orderedKeys = JSON.parse(localStorage.getItem('shortcutOrder')) || Object.keys(localStorage);

    const updatedKeys = orderedKeys.filter(key => key.length == 1);//cookies from v1 and cookies for colours

    updatedKeys.forEach(key => {
        const url = localStorage.getItem(key);
    
        if (url) {
            const faviconElement = document.createElement('a');
            faviconElement.href = url;
            faviconElement.target = '_blank';
            
            const urlHostName = new URL(url).hostname;

            const faviconImg = document.createElement('img');
            faviconImg.src = `https://www.google.com/s2/favicons?domain=${urlHostName}`;
            faviconImg.title = `${key} | ${urlHostName}`;
            faviconImg.alt = `key ${key} for ${urlHostName}`;
            faviconImg.classList.add('favicon');

            faviconElement.appendChild(faviconImg);

            if (faviconsContainer.childNodes.length > 0) {
                faviconsContainer.appendChild(document.createTextNode(' • '));
            }

            faviconsContainer.appendChild(faviconElement);
        }
    });
}

// Drag and drop functionality
function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.dataset.key);
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    const draggedKey = event.dataTransfer.getData('text/plain');
    const targetKey = event.target.dataset.key;

    if (draggedKey && targetKey && draggedKey !== targetKey) {
        const orderedKeys = JSON.parse(localStorage.getItem('shortcutOrder')) || Object.keys(localStorage);
        const draggedIndex = orderedKeys.indexOf(draggedKey);
        const targetIndex = orderedKeys.indexOf(targetKey);

        if (draggedIndex > -1 && targetIndex > -1) {
            orderedKeys.splice(draggedIndex, 1);
            orderedKeys.splice(targetIndex, 0, draggedKey);
            localStorage.setItem('shortcutOrder', JSON.stringify(orderedKeys));
            displayShortcuts();
            updateFavicons();
        }
    }
}

// Handle key press
function handleKeyPress(event) {
    const key = event.key;
    const url = localStorage.getItem(key);
    const popupVisible = document.getElementById('popup').style.display === 'flex';

    if (!popupVisible && url) {
        window.open(url, '_blank');
        window.close();
    }

    // Close popup on Escape key
    if (event.key === 'Escape') {
        hidePopup();
    }
}

// Rotate content
function rotateContent() {
    const container = document.getElementById('time-date');
    const currentRotation = parseFloat(container.style.transform.replace('rotate(', '').replace('deg)', '')) || 0;
    container.style.transform = `rotate(${currentRotation + 90}deg)`;
}

// Set event listeners
document.getElementById('cog').addEventListener('click', showPopup);
document.getElementById('save-shortcuts-button').addEventListener('click', saveShortcut);
document.getElementById('url').addEventListener('keydown', function(event) {if (event.key === 'Enter') {saveShortcut();}});
document.getElementById('close').addEventListener('click', hidePopup);
document.getElementById('rotate').addEventListener('click', rotateContent);
document.getElementById('reset_settings_colours').addEventListener('click', resetColours);
document.getElementById('reset_settings_text').addEventListener('click', resetText);
document.getElementById('save-text-button').addEventListener('click', saveText);
document.getElementById('font').addEventListener('keydown', function(event) {if (event.key === 'Enter') {saveText();}});
document.getElementById('size-range').addEventListener('input', saveSizeRange);
document.getElementById('size-number').addEventListener('input', saveSizeNumber);
document.getElementById('height-range').addEventListener('input', saveHeightRange);
document.getElementById('height-number').addEventListener('input', saveHeightNumber);
document.addEventListener('keydown', handleKeyPress);
document.getElementById('popup-background').addEventListener('click', (event) => { if (event.target === document.getElementById('popup-background')) { hidePopup();}});




// Update time and date every second
setInterval(formatTimeDate, 1000);

// Initialize time, date, and favicons
formatTimeDate();
updateFavicons();

window.addEventListener("load", () => {
    displayShortcuts();
    updateColours();
    updateText();
//Note: Font must be installed on your system and an <strong>exact match</strong> is required.
});

function updateColours(){
    const BGColour = localStorage.getItem("BGColour");
    const TextColour = localStorage.getItem("TextColour");

    document.body.style.backgroundColor = BGColour;
    document.body.style.color = TextColour;

    document.body.style.visibility = "visible";
}

function resetColours(){

    localStorage.removeItem("BGColour");
    localStorage.removeItem("TextColour");

    updateColours();

    $("#BG-colour-picker").spectrum("set", "#222222");
    $("#TXT-colour-picker").spectrum("set", "#ffffff");
}

    $("#BG-colour-picker").spectrum({
    color: localStorage.getItem("BGColour") || "#222222",
    showInput: true,
    cancelText: "Cancel",
    chooseText: "Select",
    preferredFormat: "hex",
    change: function(color) {
    console.log("New colour selected: " + color.toHexString());
    localStorage.setItem("BGColour", color.toHexString());
    updateColours();
    }
});

$("#TXT-colour-picker").spectrum({
    color: localStorage.getItem("TextColour") || "#ffffff",
    showInput: true,
    cancelText: "Cancel",
    chooseText: "Select",
    preferredFormat: "hex",
    change: function(color) {
    console.log("New colour selected: " + color.toHexString());
    localStorage.setItem("TextColour", color.toHexString());
    updateColours();
    }
});
function updateText(){
    const TextFont = localStorage.getItem("TextFont");
    const TextSize = localStorage.getItem("TextSize");
    const TextPosition = localStorage.getItem("TextPosition");

    //apply changes to the time-date div
    document.getElementById('time-date').style.fontFamily = `${TextFont},Sans-serif`;
    document.getElementById('time-date').style.fontSize = TextSize;
    document.getElementById('time').style.fontSize = TextSize*2;
    document.getElementById('time-date').style.marginTop = TextPosition;

    //apply changes to the font preview
    document.getElementById('font-preview').style.fontFamily = `${TextFont},Sans-serif`;
    document.getElementById('font').style.fontFamily = `${TextFont},Sans-serif`;

    //apply changes to the font picker
    document.getElementById('font').value = TextFont;

    //apply changes to the font size
    document.getElementById('size-number').value = TextSize.replace("px","");
    document.getElementById('size-range').value = TextSize.replace("px",""); 

    //apply changes to the font position
    document.getElementById('height-number').value = TextPosition.replace("vh","");
    document.getElementById('height-range').value = TextPosition.replace("vh","");
}
function resetText(){
    localStorage.setItem("TextFont","Arial");
    localStorage.setItem("TextSize","60px");
    localStorage.setItem("TextPosition","0vh");

    updateText();
}

function saveText(){
    const TextFont = document.getElementById('font').value;
    localStorage.setItem("TextFont", TextFont);

    updateText();

}


function saveSizeNumber(){
    const numberInput = document.getElementById('size-number');
    const rangeInput = document.getElementById('size-range');

    rangeInput.value = numberInput.value;
    saveSize();
}

function saveSizeRange(){
    const numberInput = document.getElementById('size-number');
    const rangeInput = document.getElementById('size-range');

    numberInput.value = rangeInput.value;
    saveSize();
}

function saveSize(){
    const TextSize = document.getElementById('size-number').value;
    localStorage.setItem("TextSize", `${TextSize}px`);
    
    updateText();
}




function saveHeightNumber(){
    const numberInput = document.getElementById('height-number');
    const rangeInput = document.getElementById('height-range');

    rangeInput.value = numberInput.value;
    saveHeight();
}

function saveHeightRange(){
    const numberInput = document.getElementById('height-number');
    const rangeInput = document.getElementById('height-range');

    numberInput.value = rangeInput.value;
    saveHeight();
}

function saveHeight(){
    const TextPosition = document.getElementById('height-number').value;
    localStorage.setItem("TextPosition", `${TextPosition}vh`);
    
    updateText();
}
