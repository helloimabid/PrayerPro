document.addEventListener("DOMContentLoaded", function () {
  setTimeout(
    () => (document.getElementById("splash-screen").style.display = "none"),
    2000
  );
});
const currentDate = new Date();

const day = String(currentDate.getDate()).padStart(2, "0");
const month = String(currentDate.getMonth() + 1).padStart(2, "0");
const year = currentDate.getFullYear();

const formattedDate = `${day}-${month}-${year}`;
const qiblaDirection = 278;

// function fetchUserLocation() {
//   const apiKey = "10b09b1e447240a0a46b84a1fd06660b";
//   const url = `https://api.geoapify.com/v1/ipinfo?apiKey=${apiKey}`;

//   fetch(url)
//     .then((response) => response.json())
//     .then((data) => {
//       if (data && data.location) {
//         const latitude = data.location.latitude;
//         const longitude = data.location.longitude;
//         const city = data.city.name;

//         fetchPrayerTimings(latitude, longitude);
//       } else {
//         console.error("Location data not available.");
//       }
//     })
//     .catch((error) => {
//       console.error("Error fetching location:", error);
//       alert("Unable to get your location.");
//     });
//   return latitude, longitude, city;
// }
function fetchUserLocation() {
  const apiKey = "10b09b1e447240a0a46b84a1fd06660b";
  const url = `https://api.geoapify.com/v1/ipinfo?apiKey=${apiKey}`;

  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.location) {
          const latitude = data.location.latitude;
          const longitude = data.location.longitude;
          const city = data.city.name;

          // Now we can fetch prayer timings
          fetchPrayerTimings(latitude, longitude, city);

          resolve({ latitude, longitude, city }); // Resolving the data
        } else {
          console.error("Location data not available.");
          reject("Location data not available");
        }
      })
      .catch((error) => {
        console.error("Error fetching location:", error);
        alert("Unable to get your location.");
        reject(error);
      });
  });
}

// function fetchqiblaDirection() {
//   fetch(`https://api.aladhan.com/v1/qibla/{latitude}/{longitude}`).then((response) => response.json()).then((data) => {
//     const qiblaDirection = data.direction;
//     console.log(qiblaDirection);
//   });

// }

function fetchQiblaDirection(latitude, longitude) {
  // Fetch Qibla direction from Aladhan API
  fetch(`https://api.aladhan.com/v1/qibla/${latitude}/${longitude}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "OK" && data.data.direction) {
        const qiblaDirection = data.data.direction; // Get the direction from the API response
        console.log("Qibla direction: ", qiblaDirection); // You can log it to confirm

        // Now use this direction value for your compass
        updateCompass(qiblaDirection);
      } else {
        console.error("Failed to fetch Qibla direction.");
      }
    })
    .catch((error) => {
      console.error("Error fetching Qibla direction:", error);
    });
}

function updateCompass(qiblaDirection) {
  // Assuming you already have a compass arrow element
  const arrow = document.querySelector(".arrow");

  // Get device orientation (alpha) to adjust the rotation of the compass arrow
  function handleOrientation(event) {
    let alpha;
    if (event.webkitCompassHeading) {
      alpha = event.webkitCompassHeading; // iOS
    } else {
      alpha = event.alpha; // Non-iOS
    }

    // Calculate the rotation angle to point towards Qibla
    const rotation = qiblaDirection - alpha;

    // Rotate the arrow based on the calculated rotation
    arrow.style.transform = `translate(-50%, -100%) rotate(${rotation}deg)`;
  }

  // Request permission for iOS (if needed)
  function requestPermission() {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      DeviceOrientationEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === "granted") {
            window.addEventListener(
              "deviceorientation",
              handleOrientation,
              true
            );
          } else {
            alert("Permission to access device orientation was denied.");
          }
        })
        .catch(console.error);
    } else {
      // Handle non iOS 13+ devices
      window.addEventListener("deviceorientation", handleOrientation, true);
    }
  }

  // Initialize the permission request
  requestPermission();
}

// Example usage:
// Fetch the user's location and then get Qibla direction
fetchUserLocation().then(({ latitude, longitude }) => {
  fetchQiblaDirection(latitude, longitude); // Fetch Qibla direction based on location
});

function handleOrientation(event) {
  let alpha;

  // Check for iOS property
  if (event.webkitCompassHeading) {
    alpha = event.webkitCompassHeading; // iOS
  } else {
    alpha = event.alpha; // Non-iOS
  }

  // Calculate the rotation angle to point towards Qibla
  const rotation = qiblaDirection - alpha;

  // Rotate the arrow to point towards Qibla
  const arrow = document.querySelector(".arrow");
  arrow.style.transform = `translate(-50%, -100%) rotate(${rotation}deg)`;
}

// Request permission for iOS 13+ devices
function requestPermission() {
  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    DeviceOrientationEvent.requestPermission()
      .then((permissionState) => {
        if (permissionState === "granted") {
          window.addEventListener("deviceorientation", handleOrientation, true);
        } else {
          alert("Permission to access device orientation was denied.");
        }
      })
      .catch(console.error);
  } else {
    // Handle non iOS 13+ devices
    window.addEventListener("deviceorientation", handleOrientation, true);
  }
}

// Initialize the compass
requestPermission();;


function getNextPrayerTime(timings) {
  const now = new Date();
  const prayerTimes = [
    { name: "Fajr", time: timings.Fajr },
    { name: "Dhuhr", time: timings.Dhuhr },
    { name: "Asr", time: timings.Asr },
    { name: "Maghrib", time: timings.Maghrib },
    { name: "Isha", time: timings.Isha },
  ];

  prayerTimes.forEach((prayer) => {
    const [hours, minutes] = prayer.time.split(":");
    prayer.time = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    );
  });

  prayerTimes.sort((a, b) => a.time - b.time);

  for (let i = 0; i < prayerTimes.length; i++) {
    if (prayerTimes[i].time > now) {
      return prayerTimes[i];
    }
  }

  const nextDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );
  const nextPrayer = prayerTimes[0];
  nextPrayer.time.setDate(nextDay.getDate());
  return nextPrayer;
}

function displayNextPrayer(timings) {
  const nextPrayer = getNextPrayerTime(timings);
  const nextPrayerName = nextPrayer.name;
  const nextPrayerTime = nextPrayer.time.toLocaleTimeString();

  document.getElementById(
    "next-prayer-name"
  ).textContent = `Next Prayer: ${nextPrayerName}`;
  document.getElementById("next-prayer-time").textContent = nextPrayerTime;
}
function fetchPrayerTimings(latitude, longitude, city) {
  const today = new Date();

  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();

  const currentDate = `${day}-${month}-${year}`;

  const url = `https://api.aladhan.com/v1/timingsByAddress/${currentDate}?address=${latitude},${longitude}&method=8`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const timings = data.data.timings;
      displayPrayerTimings(timings);
      displayNextPrayer(timings);
    })
    .catch((error) => {
      console.error("Error fetching prayer timings:", error);
    });
}
function countdownToNextPrayer(timings) {
  const nextPrayer = getNextPrayerTime(timings);
  const now = new Date();
  const timeDifference = nextPrayer.time - now;

  const countdownElement = document.getElementById("next-prayer-time");

  if (timeDifference > 0) {
    const countdownInterval = setInterval(() => {
      const remainingTime = nextPrayer.time - new Date();
      if (remainingTime <= 0) {
        clearInterval(countdownInterval);
        countdownElement.textContent = `It's time for ${nextPrayer.name}!`;
      } else {
        const hours = Math.floor(remainingTime / (1000 * 60 * 60));
        const minutes = Math.floor(
          (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
        countdownElement.textContent = `${hours}h ${minutes}m ${seconds}s remaining`;
      }
    }, 1000);
  }
}

window.onload = fetchUserLocation;

function displayPrayerTimings(timings) {
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
    // closeSettings();//this is not working and i was not able to figure out why
  }
}

function showQiblaFinder() {
  document.getElementById("main-content").style.display = "none";
  document.getElementById("qibla-content").style.display = "flex";
  //(if any bangladeshi is reading)এতক্ষণে... অবশেষ কাজ শেষ আর একটু
  // বিভীষণের প্রতি মেঘনাদ কবিতা একটু মনে পড়লো এই আরকি
  // 🤧
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
// And btw your are reading my code wow now i am famous hehe boi 😁
