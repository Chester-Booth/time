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
    document.getElementById('popup').style.display = 'flex';
}

// Hide popup
function hidePopup() {
    document.getElementById('popup').style.display = 'none';
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

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const url = localStorage.getItem(key);

        const shortcutElement = document.createElement('div');
        shortcutElement.classList.add('shortcut');
        shortcutElement.textContent = `${key}: ${url}`;
        shortcutsContainer.appendChild(shortcutElement);
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

// Update time and date every second
setInterval(formatTimeDate, 1000);

// Initialize time and date
formatTimeDate();

