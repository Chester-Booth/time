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
}

// Save key and URL
function saveShortcut() {
    const key = document.getElementById('key').value;
    const url = document.getElementById('url').value;

    if (key && url) {
        localStorage.setItem(key, url);
        alert(`Shortcut saved! Press '${key}' to open ${url}`);
        //TODO: add to shortcutOrder
        hidePopup();
        
    } else if (key && !url && localStorage.getItem(key)) {
        localStorage.removeItem(key);
        alert(`Shortcut for key '${key}' has been deleted.`);
        //TODO: remove from to shortcutOrder
        hidePopup();
        
    } else {
        alert('Please enter a key and optionally a URL to save, or just a key to delete its shortcut.');
    }
}

// Display saved shortcuts in the popup
function displayShortcuts() {
    const shortcutsContainer = document.getElementById('saved-shortcuts');
    shortcutsContainer.innerHTML = '';

    const orderedKeys = JSON.parse(localStorage.getItem('shortcutOrder')) || Object.keys(localStorage);

    orderedKeys.forEach(key => {
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
        console.log(width);
        if (width > maxWidth) {
            maxWidth = width;
        }
    });

    console.log("maxWidth: ", maxWidth);

    // Apply the maximum width to all boxes
    boxes.forEach(box => {
        box.style.width = `${maxWidth}px`;
    });
}

// Update favicons row
function updateFavicons() {
    const faviconsContainer = document.getElementById('favicons');
    faviconsContainer.innerHTML = '';

    const orderedKeys = JSON.parse(localStorage.getItem('shortcutOrder')) || Object.keys(localStorage);

    // Remove "mode" from the array
    const updatedKeys = orderedKeys.filter(key => key !== "mode");//cookie from v1

    updatedKeys.forEach(key => {
        const url = localStorage.getItem(key);
    
        if (url) {
            const faviconElement = document.createElement('a');
            faviconElement.href = url;
            faviconElement.target = '_blank';

            const faviconImg = document.createElement('img');
            faviconImg.src = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`;
            faviconImg.alt = 'Favicon';
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
document.getElementById('save').addEventListener('click', saveShortcut);
document.getElementById('close').addEventListener('click', hidePopup);
document.getElementById('rotate').addEventListener('click', rotateContent);
document.addEventListener('keydown', handleKeyPress);


// Close popup when clicking outside the content
document.getElementById('popup-background').addEventListener('click', (event) => {
    if (event.target === document.getElementById('popup-background')) {
        hidePopup();
    }
});




// Update time and date every second
setInterval(formatTimeDate, 1000);

// Initialize time, date, and favicons
formatTimeDate();
updateFavicons();

window.addEventListener("load", () => {
    displayShortcuts();
    updateColours();

});

function updateColours(){
    const BGColour = localStorage.getItem("BGColour");
    const TextColour = localStorage.getItem("TextColour");

    document.body.style.backgroundColor = BGColour;
    document.body.style.color = TextColour;
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