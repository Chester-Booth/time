const DEFAULTS = {
  bgColour: "#111111",
  textColour: "#ffffff",
  textFont: "Arial",
  textSize: 60,
  textPosition: 0,
};

const elements = {
  time: document.getElementById("time"),
  date: document.getElementById("date"),
  timeDate: document.getElementById("time-date"),
  favicons: document.getElementById("favicons"),
  popup: document.getElementById("popup"),
  popupBackground: document.getElementById("popup-background"),
  popupBoxes: document.getElementsByClassName("popup-boxes"),
  cog: document.getElementById("cog"),
  rotate: document.getElementById("rotate"),
  close: document.getElementById("close"),
  key: document.getElementById("key"),
  url: document.getElementById("url"),
  shortcutStatus: document.getElementById("shortcut-status"),
  savedShortcuts: document.getElementById("saved-shortcuts"),
  font: document.getElementById("font"),
  fontPreview: document.getElementById("font-preview"),
  sizeNumber: document.getElementById("size-number"),
  sizeRange: document.getElementById("size-range"),
  heightNumber: document.getElementById("height-number"),
  heightRange: document.getElementById("height-range"),
};

function getShortcutOrder() {
  try {
    return JSON.parse(localStorage.getItem("shortcutOrder")) || [];
  } catch {
    return [];
  }
}

function setShortcutOrder(order) {
  localStorage.setItem("shortcutOrder", JSON.stringify(order));
}

function getTextSettings() {
  return {
    font: localStorage.getItem("TextFont") || DEFAULTS.textFont,
    size: parseInt(localStorage.getItem("TextSize"), 10) || DEFAULTS.textSize,
    position: parseInt(localStorage.getItem("TextPosition"), 10) || DEFAULTS.textPosition,
  };
}

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function normalizeShortcutKey(key) {
  return key.trim().slice(0, 1).toLowerCase();
}

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const withProtocol = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  const url = new URL(withProtocol);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http and https URLs are supported.");
  }

  return url.href;
}

function setShortcutStatus(message, isError = false) {
  elements.shortcutStatus.textContent = message;
  elements.shortcutStatus.style.color = isError ? "#b00020" : "";
}

function formatTimeDate() {
  const now = new Date();
  const hours = now.getHours() % 12 || 12;
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const time = `${hours}:${minutes}:${seconds}`;
  const date = now
    .toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "short",
    })
    .replace(" ", ", ");

  elements.time.textContent = time;
  elements.date.textContent = date;
  elements.fontPreview.textContent = `${time} ${date}`;
  document.title = time;
}

function showPopup() {
  displayShortcuts();
  elements.popup.style.visibility = "visible";
  elements.popup.style.opacity = "1";
  elements.popup.setAttribute("aria-hidden", "false");
  elements.popupBackground.style.animation = "fadeIn 0.2s forwards";

  for (const box of elements.popupBoxes) {
    box.style.animation = "slideIn 0.25s forwards";
  }

  elements.cog.style.visibility = "hidden";
  elements.close.focus();
}

function hidePopup() {
  updateFavicons();
  elements.popupBackground.style.animation = "fadeOut 0.2s forwards";

  for (const box of elements.popupBoxes) {
    box.style.animation = "slideOut 0.2s forwards";
  }

  window.setTimeout(() => {
    elements.popup.style.visibility = "hidden";
    elements.popup.style.opacity = "0";
    elements.popup.setAttribute("aria-hidden", "true");
  }, 220);

  elements.cog.style.visibility = "visible";
  elements.cog.focus();
}

function saveShortcut() {
  const key = normalizeShortcutKey(elements.key.value);
  let url = "";

  try {
    url = normalizeUrl(elements.url.value);
  } catch (error) {
    setShortcutStatus(error.message, true);
    return;
  }

  if (!key) {
    setShortcutStatus("Enter a single shortcut key.", true);
    return;
  }

  if (!url) {
    deleteShortcut(key);
    setShortcutStatus(`Removed shortcut for "${key}".`);
    elements.key.value = "";
    return;
  }

  localStorage.setItem(key, url);

  const shortcutOrder = getShortcutOrder().filter((item) => item !== key && item.length === 1);
  shortcutOrder.push(key);
  setShortcutOrder(shortcutOrder);

  elements.key.value = "";
  elements.url.value = "";
  setShortcutStatus(`Saved "${key}" for ${new URL(url).hostname}.`);
  displayShortcuts();
  updateFavicons();
}

function displayShortcuts() {
  elements.savedShortcuts.innerHTML = "";
  const orderedKeys = getShortcutOrder().filter((key) => key.length === 1 && localStorage.getItem(key));

  if (orderedKeys.length !== getShortcutOrder().length) {
    setShortcutOrder(orderedKeys);
  }

  orderedKeys.forEach((originalKey) => {
    const url = localStorage.getItem(originalKey);
    const shortcutElement = document.createElement("div");
    shortcutElement.className = "shortcut";
    shortcutElement.dataset.key = originalKey;
    shortcutElement.draggable = true;

    const keyInput = document.createElement("input");
    keyInput.type = "text";
    keyInput.className = "shortcut-key";
    keyInput.value = originalKey;
    keyInput.placeholder = "#";
    keyInput.maxLength = 1;
    keyInput.ariaLabel = "Shortcut key";
    keyInput.addEventListener("change", (event) => {
      const newKey = normalizeShortcutKey(event.target.value);
      const oldKey = shortcutElement.dataset.key;
      if (!newKey || newKey === oldKey) {
        event.target.value = oldKey;
        return;
      }

      updateShortcutKey(oldKey, newKey);
      shortcutElement.dataset.key = newKey;
      setShortcutStatus(`Changed "${oldKey}" to "${newKey}".`);
    });

    const urlInput = document.createElement("input");
    urlInput.type = "text";
    urlInput.className = "shortcut-url";
    urlInput.value = url;
    urlInput.placeholder = "URL";
    urlInput.ariaLabel = `URL for ${originalKey}`;
    urlInput.addEventListener("change", (event) => {
      try {
        const newUrl = normalizeUrl(event.target.value);
        localStorage.setItem(shortcutElement.dataset.key, newUrl);
        event.target.value = newUrl;
        setShortcutStatus(`Updated "${shortcutElement.dataset.key}".`);
        updateFavicons();
      } catch (error) {
        event.target.value = localStorage.getItem(shortcutElement.dataset.key);
        setShortcutStatus(error.message, true);
      }
    });

    shortcutElement.append(
      keyInput,
      urlInput,
      createShortcutButton("arrow_upward", "Move up", () => reorderShortcut(shortcutElement.dataset.key, "up")),
      createShortcutButton("arrow_downward", "Move down", () => reorderShortcut(shortcutElement.dataset.key, "down")),
      createShortcutButton("delete", "Delete shortcut", () => {
        deleteShortcut(shortcutElement.dataset.key);
        setShortcutStatus(`Deleted "${shortcutElement.dataset.key}".`);
      }, "delete-btn"),
    );

    shortcutElement.addEventListener("dragstart", handleDragStart);
    shortcutElement.addEventListener("dragover", handleDragOver);
    shortcutElement.addEventListener("drop", handleDrop);
    elements.savedShortcuts.appendChild(shortcutElement);
  });
}

function createShortcutButton(icon, label, onClick, extraClass = "reorder-btn") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `icon-button material-symbols-outlined ${extraClass}`;
  button.textContent = icon;
  button.title = label;
  button.ariaLabel = label;
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    onClick();
  });
  return button;
}

function updateFavicons() {
  elements.favicons.innerHTML = "";
  const orderedKeys = getShortcutOrder().filter((key) => key.length === 1 && localStorage.getItem(key));

  orderedKeys.forEach((key) => {
    const url = localStorage.getItem(key);
    let parsedUrl;

    try {
      parsedUrl = new URL(url);
    } catch {
      return;
    }

    const link = document.createElement("a");
    link.href = parsedUrl.href;
    link.title = `${key} | ${parsedUrl.hostname}`;
    link.ariaLabel = `Open ${parsedUrl.hostname} with shortcut ${key}`;

    const img = document.createElement("img");
    img.alt = "";
    img.className = "favicon";
    img.src = faviconUrlFor(parsedUrl.hostname);

    link.appendChild(img);
    elements.favicons.appendChild(link);
  });
}

function faviconUrlFor(hostname) {
  if (hostname === "calendar.google.com") {
    const currentDay = String(new Date().getDate()).padStart(2, "0");
    return `https://www.gstatic.com/images/branding/productlogos/calendar_2026_${currentDay}/v2/ico/calendar_2026_${currentDay}_32dp.ico`;
  }

  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;
}

function updateShortcutKey(oldKey, newKey) {
  if (localStorage.getItem(newKey)) {
    setShortcutStatus(`"${newKey}" is already in use.`, true);
    displayShortcuts();
    return;
  }

  const url = localStorage.getItem(oldKey);
  if (!url) return;

  localStorage.removeItem(oldKey);
  localStorage.setItem(newKey, url);

  const shortcutOrder = getShortcutOrder().map((key) => (key === oldKey ? newKey : key));
  setShortcutOrder(shortcutOrder);
  displayShortcuts();
  updateFavicons();
}

function deleteShortcut(key) {
  localStorage.removeItem(key);
  setShortcutOrder(getShortcutOrder().filter((item) => item !== key));
  displayShortcuts();
  updateFavicons();
}

function reorderShortcut(key, direction) {
  const orderedKeys = getShortcutOrder();
  const index = orderedKeys.indexOf(key);
  if (index === -1) return;

  if (direction === "up" && index > 0) {
    [orderedKeys[index - 1], orderedKeys[index]] = [orderedKeys[index], orderedKeys[index - 1]];
  } else if (direction === "down" && index < orderedKeys.length - 1) {
    [orderedKeys[index], orderedKeys[index + 1]] = [orderedKeys[index + 1], orderedKeys[index]];
  }

  setShortcutOrder(orderedKeys);
  displayShortcuts();
  updateFavicons();
}

function handleDragStart(event) {
  event.dataTransfer.setData("text/plain", event.currentTarget.dataset.key);
}

function handleDragOver(event) {
  event.preventDefault();
}

function handleDrop(event) {
  event.preventDefault();
  const draggedKey = event.dataTransfer.getData("text/plain");
  const targetElement = event.target.closest(".shortcut");
  if (!targetElement || draggedKey === targetElement.dataset.key) return;

  const orderedKeys = getShortcutOrder();
  const draggedIndex = orderedKeys.indexOf(draggedKey);
  const targetIndex = orderedKeys.indexOf(targetElement.dataset.key);
  if (draggedIndex === -1 || targetIndex === -1) return;

  orderedKeys.splice(draggedIndex, 1);
  orderedKeys.splice(targetIndex, 0, draggedKey);
  setShortcutOrder(orderedKeys);
  displayShortcuts();
  updateFavicons();
}

function handleKeyPress(event) {
  if (event.key === "Escape" && isPopupVisible()) {
    hidePopup();
    return;
  }

  if (isEditableTarget(event.target) || isPopupVisible()) return;

  const url = localStorage.getItem(event.key.toLowerCase());
  if (url) {
    window.location.href = url;
  }
}

function isPopupVisible() {
  return elements.popup.getAttribute("aria-hidden") === "false";
}

function isEditableTarget(target) {
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable;
}

function rotateContent() {
  const currentRotation = parseFloat(elements.timeDate.dataset.rotation || "0");
  const nextRotation = currentRotation + 90;
  elements.timeDate.dataset.rotation = String(nextRotation);
  elements.timeDate.style.transform = `rotate(${nextRotation}deg)`;
}

function updateColours() {
  const bgColour = localStorage.getItem("BGColour") || DEFAULTS.bgColour;
  const textColour = localStorage.getItem("TextColour") || DEFAULTS.textColour;

  document.body.style.backgroundColor = bgColour;
  document.body.style.color = textColour;
}

function resetColours() {
  localStorage.setItem("BGColour", DEFAULTS.bgColour);
  localStorage.setItem("TextColour", DEFAULTS.textColour);
  updateColours();
  $("#BG-colour-picker").spectrum("set", DEFAULTS.bgColour);
  $("#TXT-colour-picker").spectrum("set", DEFAULTS.textColour);
}

function updateText() {
  const settings = getTextSettings();
  const size = clampNumber(settings.size, 24, 180, DEFAULTS.textSize);
  const position = clampNumber(settings.position, -320, 320, DEFAULTS.textPosition);

  elements.timeDate.style.fontFamily = `"${settings.font}", Arial, sans-serif`;
  elements.timeDate.style.fontSize = `${size}px`;
  elements.time.style.fontSize = `${size * 2}px`;
  elements.timeDate.style.marginTop = `${position}px`;

  elements.fontPreview.style.fontFamily = `"${settings.font}", Arial, sans-serif`;
  elements.font.style.fontFamily = `"${settings.font}", Arial, sans-serif`;
  elements.font.value = settings.font;
  elements.sizeNumber.value = size;
  elements.sizeRange.value = size;
  elements.heightNumber.value = position;
  elements.heightRange.value = position;
}

function resetText() {
  localStorage.setItem("TextFont", DEFAULTS.textFont);
  localStorage.setItem("TextSize", `${DEFAULTS.textSize}px`);
  localStorage.setItem("TextPosition", `${DEFAULTS.textPosition}px`);
  updateText();
}

function saveText() {
  localStorage.setItem("TextFont", elements.font.value.trim() || DEFAULTS.textFont);
  updateText();
}

function saveSizeNumber() {
  elements.sizeRange.value = elements.sizeNumber.value;
  saveSize();
}

function saveSizeRange() {
  elements.sizeNumber.value = elements.sizeRange.value;
  saveSize();
}

function saveSize() {
  const size = clampNumber(elements.sizeNumber.value, 24, 180, DEFAULTS.textSize);
  localStorage.setItem("TextSize", `${size}px`);
  updateText();
}

function saveHeightNumber() {
  elements.heightRange.value = elements.heightNumber.value;
  saveHeight();
}

function saveHeightRange() {
  elements.heightNumber.value = elements.heightRange.value;
  saveHeight();
}

function saveHeight() {
  const position = clampNumber(elements.heightNumber.value, -320, 320, DEFAULTS.textPosition);
  localStorage.setItem("TextPosition", `${position}px`);
  updateText();
}

function initialiseColourPickers() {
  $("#BG-colour-picker").spectrum({
    color: localStorage.getItem("BGColour") || DEFAULTS.bgColour,
    showInput: true,
    cancelText: "Cancel",
    chooseText: "Select",
    preferredFormat: "hex",
    change(color) {
      localStorage.setItem("BGColour", color.toHexString());
      updateColours();
    },
  });

  $("#TXT-colour-picker").spectrum({
    color: localStorage.getItem("TextColour") || DEFAULTS.textColour,
    showInput: true,
    cancelText: "Cancel",
    chooseText: "Select",
    preferredFormat: "hex",
    change(color) {
      localStorage.setItem("TextColour", color.toHexString());
      updateColours();
    },
  });
}

function setEventListeners() {
  elements.cog.addEventListener("click", showPopup);
  document.getElementById("save-shortcuts-button").addEventListener("click", saveShortcut);
  elements.url.addEventListener("keydown", (event) => {
    if (event.key === "Enter") saveShortcut();
  });
  elements.key.addEventListener("keydown", (event) => {
    if (event.key === "Enter") elements.url.focus();
  });
  elements.close.addEventListener("click", hidePopup);
  elements.rotate.addEventListener("click", rotateContent);
  document.getElementById("reset_settings_colours").addEventListener("click", resetColours);
  document.getElementById("reset_settings_text").addEventListener("click", resetText);
  document.getElementById("save-text-button").addEventListener("click", saveText);
  elements.font.addEventListener("keydown", (event) => {
    if (event.key === "Enter") saveText();
  });
  elements.sizeRange.addEventListener("input", saveSizeRange);
  elements.sizeNumber.addEventListener("input", saveSizeNumber);
  elements.heightRange.addEventListener("input", saveHeightRange);
  elements.heightNumber.addEventListener("input", saveHeightNumber);
  document.addEventListener("keydown", handleKeyPress);
  elements.popupBackground.addEventListener("click", (event) => {
    if (event.target === elements.popupBackground) hidePopup();
  });
}

function initialise() {
  initialiseColourPickers();
  setEventListeners();
  formatTimeDate();
  updateColours();
  updateText();
  updateFavicons();
  displayShortcuts();
  document.getElementById("Text-Settings-Note").innerHTML =
    "Note: font must be installed on your system and an <strong>exact match</strong> is required.";
  window.setInterval(formatTimeDate, 1000);
}

initialise();
