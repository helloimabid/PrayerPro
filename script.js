document.addEventListener("DOMContentLoaded", function () {
  setTimeout(
    () => (document.getElementById("splash-screen").style.display = "none"),
    2000
  );
  useManualOrGeoLocation();
});

function requestCompassAccess() {
  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    DeviceOrientationEvent.requestPermission()
      .then((permissionState) => {
        if (permissionState === "granted") {
          setupCompass();
        }
      })
      .catch(console.error);
  } else {
    setupCompass();
  }
}

function useManualOrGeoLocation() {
  let savedLocation = localStorage.getItem("savedLocation");
  if (savedLocation) {
    fetchPrayerTimesByCity(savedLocation);
  } else {
    getUserLocation();
  }
}

 function setupCompass() {
   if (window.DeviceOrientationEvent) {
     window.addEventListener("deviceorientation", (event) => {
       if (event.alpha !== null) {
         document.getElementById(
           "compass"
         ).style.transform = `rotate(${event.alpha}deg)`;
       }
     });
   } else {
     document.getElementById("compass").textContent = "Compass not supported";
   }
}
 

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        fetchPrayerTimes(position.coords.latitude, position.coords.longitude),
      () => useFallbackLocation()
    );
  } else {
    useFallbackLocation();
  }
}

function fetchPrayerTimesByCity(city) {
  const apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=&method=2`;
  fetch(apiUrl)
    .then((response) => response.json())
      .then((data) => updatePrayerTimes(data.data.timings),
      document.getElementById("location").textContent =
          "Prayer times for " + city)
    .catch(
      () =>
        (document.getElementById("location").textContent =
          "Error fetching data")
    );
}

function fetchPrayerTimes(lat, lon) {
  const apiUrl = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`;
  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => updatePrayerTimes(data.data.timings))
    .catch(
      () =>
        (document.getElementById("location").textContent =
          "Error fetching data")
    );
}

function updatePrayerTimes(timings) {
  document.getElementById("fajr").textContent = timings.Fajr;
  document.getElementById("dhuhr").textContent = timings.Dhuhr;
  document.getElementById("asr").textContent = timings.Asr;
  document.getElementById("maghrib").textContent = timings.Maghrib;
    document.getElementById("isha").textContent = timings.Isha;
    document.getElementById("sunrise").textContent = timings.Sunrise;
    document.getElementById("sunset").textContent = timings.Sunset;
}



function showSettings() {
  let settingsPanel = document.getElementById("settings-panel");
  if (!settingsPanel) {
    settingsPanel = document.createElement("div");
    settingsPanel.id = "settings-panel";
    settingsPanel.innerHTML = `
                    <h2>Settings</h2>
                    <input type="text" id="manualLocation" placeholder="City, Country">
                    <button onclick="saveLocation()">Save Location</button>
                    <label class ="togglelabel" id="togglelabel"><input type="checkbox" id="darkModeToggle" onchange="toggleDarkMode()"> Dark Mode</label>
                    <button onclick="closeSettings()">Close</button>
                `;
    document.body.appendChild(settingsPanel);
    document.getElementById("manualLocation").value =
      localStorage.getItem("savedLocation") || "";
    document.getElementById("darkModeToggle").checked =
      localStorage.getItem("darkMode") === "enabled";
  }
  settingsPanel.style.display = "flex";
}

function saveLocation() {
  let location = document.getElementById("manualLocation").value.trim();
  if (location) {
    localStorage.setItem("savedLocation", location);
    alert("Location saved! Refresh to apply.");
    fetchPrayerTimesByCity(location);
  }
}

function closeSettings() {
  document.getElementById("settings-panel").style.display = "none";
}
function toggleDarkMode() {
    let darkModeEnabled = document.getElementById("darkModeToggle").checked;
    if (darkModeEnabled) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("darkMode", "enabled");
       
        useManualOrGeoLocation();
    } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("darkMode", "disabled");
    }
}

function closeSettingsOnClick(event) {
  let settingsPanel = document.getElementById("settings-panel");
  if (
    settingsPanel &&
    settingsPanel.style.display === "block" &&
    !settingsPanel.contains(event.target)
  ) {
    // closeSettings();
  }
}

function showQiblaFinder() {
  document.getElementById("main-content").style.display = "none";
  document.getElementById("qibla-content").style.display = "block";
}

function showPrayerTimes() {
  document.getElementById("main-content").style.display = "block";
  document.getElementById("qibla-content").style.display = "none";
}

 setInterval(updateClock, 1000);

        function updateClock() {
            const currentTime = new Date();
            const clockElement = document.getElementById("clock");
            clockElement.textContent = currentTime.toLocaleTimeString();
        }