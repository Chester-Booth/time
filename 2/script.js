// Utility to format time and date
function formatTimeDate() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false });
    const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    
    document.getElementById('time').textContent = time;
    document.getElementById('date').textContent = date;
}

// Show popup
function showPopup() {
    displayShortcuts();
    const popup = document.getElementById('popup');
    const background = document.getElementById('popup-background');
    const content = document.getElementById('popup-content');

    popup.style.display = 'flex';
    background.style.animation = 'fadeIn 0.2s forwards';
    content.style.animation = 'slideIn 0.3s forwards';
}

// Hide popup
function hidePopup() {
    updateFavicons();
    const popup = document.getElementById('popup');
    const background = document.getElementById('popup-background');
    const content = document.getElementById('popup-content');

    background.style.animation = 'fadeOut 0.2s forwards';
    content.style.animation = 'slideOut 0.3s forwards';

    setTimeout(() => {
        popup.style.display = 'none';
    }, 300); // Match the duration of the animations
}

// Save key and URL
function saveShortcut() {
    const key = document.getElementById('key').value;
    const url = document.getElementById('url').value;

    if (key && url) {
        localStorage.setItem(key, url);
        alert(`Shortcut saved! Press '${key}' to open ${url}`);
        hidePopup();
        
    } else if (key && !url && localStorage.getItem(key)) {
        localStorage.removeItem(key);
        alert(`Shortcut for key '${key}' has been deleted.`);
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
}

// Update favicons row
function updateFavicons() {
    const faviconsContainer = document.getElementById('favicons');
    faviconsContainer.innerHTML = '';

    const orderedKeys = JSON.parse(localStorage.getItem('shortcutOrder')) || Object.keys(localStorage);

    orderedKeys.forEach(key => {
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
document.getElementById('popup').addEventListener('click', (event) => {
    if (event.target === document.getElementById('popup')) {
        hidePopup();
    }
});



// Update time and date every second
setInterval(formatTimeDate, 1000);

// Initialize time, date, and favicons
formatTimeDate();
updateFavicons();

