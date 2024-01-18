document.getElementById("volumeControl").value =
  localStorage.getItem("volume") || 0.5;

let firstStart = false;
let serverStart;
let userInputStart;
let currentTime;

let currentSea;
let seaSwitched = true;

let nextAuraSpawnTime;
let nextAuraDespawnTime;
let auraFirstSpawn = false;

let nextFruitSpawnTime;
let nextFruitDespawnTime;

let nextEventSpawnTime;
let nextEventDespawnTime;

let hasChanged = false;

let timeInterval;

// Function to play the spawn sound
function playSpawnSound() {
  const spawnSound = new Audio("./audio/notification.mp3");
  spawnSound.volume = document.getElementById("volumeControl").value;
  spawnSound.play();
}
// Function to update the volume based on user input
function updateVolume() {
  const volumeControl = document.getElementById("volumeControl");

  // Save the volume setting to localStorage
  localStorage.setItem("volume", volumeControl.value);
}
window.addEventListener("load", updateVolume);

function openSettings() {
  const modal = document.getElementById("settingsModal");
  const overlay = document.getElementById("overlay");

  modal.style.display = "block";
  overlay.style.display = "block";
}
function closeSettings() {
  const modal = document.getElementById("settingsModal");
  const overlay = document.getElementById("overlay");

  modal.style.display = "none";
  overlay.style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  const seaButtons = document.querySelectorAll('input[name="seaType"]');
  currentSea = "secondSea";
  // Add event listener to each radio button
  seaButtons.forEach(function (button) {
    button.addEventListener("change", function () {
      // Handle the change event
      if (this.checked) {
        const selectedSea = this.id;
        switch (selectedSea) {
          case "secondSea":
            currentSea = "secondSea";
            break;
          case "thirdSea":
            currentSea = "thirdSea";
            break;
          default:
            break;
        }
        console.log(selectedSea + " selected.");
        // seaSwitched = true;
        saveServerStart();
      }
    });
  });
});

function isValidTimeFormat(time) {
  const regex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
  return regex.test(time);
}

// Syncs and keep track of serverStart input fields.
function syncInputs(value) {
  let userInputs = document.getElementsByClassName("userInput");

  for (let i = 0; i < userInputs.length; i++) {
    userInputs[i].value = value;
  }

  userInputStart = value;
}

// Enter key event handler for input fields
function handleEnterKey(event) {
  if (event.key === "Enter") {
    saveServerStart();
  }
}

// Saves the user inputted time as a Date object
function saveServerStart() {
  // Updated by syncInputs()
  const userInputValue = userInputStart;
  console.error(userInputStart);
  // Validate the user input, set if fine
  if (!userInputValue || !isValidTimeFormat(userInputValue)) {
    alert("Please enter a valid 24-hour time (HH:mm:ss).");
    return;
  }

  // Split the HH:mm:ss string into hours, minutes, and seconds
  const [hours, minutes, seconds] = userInputValue.split(":");

  // Set time, reset variables
  serverStart = new Date();
  serverStart.setHours(parseInt(hours, 10));
  serverStart.setMinutes(parseInt(minutes, 10));
  serverStart.setSeconds(parseInt(seconds, 10));

  firstStart = true;

  nextAuraSpawnTime = nextAuraDespawnTime = auraActive = undefined;
  auraFirstSpawn = false;

  nextFruitSpawnTime = nextFruitDespawnTime = fruitActive = undefined;

  nextEventSpawnTime = nextEventDespawnTime = eventActive = undefined;

  // Hide Main Input
  const mainInput = document.getElementById("mainInput");
  mainInput.style.display = "none";

  document.getElementById("server-start-time").innerHTML =
    "<h4>Server Start at " +
    serverStart.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }) +
    "</h4>";

  // Set the visibility of containers with class "container.spawn"
  const spawnContainers = document.querySelectorAll(".container.spawn");
  spawnContainers.forEach((container) => {
    container.style.display = "block";
  });

  closeSettings();
  resetInterval();
}

/* PRIMARY TIMER SCRIPTS */
function auraSpawn() {
  let nextAuraSpawnInterval;
  let nextAuraDespawnInterval;

  if (!auraFirstSpawn) {
    nextAuraSpawnInterval = 25 * 60 * 1000; // 25 Minutes;
    nextAuraDespawnInterval = 20 * 60 * 1000; // 20 Minutes;
  } else {
    nextAuraSpawnInterval = 5 * 60 * 1000; // 5 Minutes;
    nextAuraDespawnInterval = 20 * 60 * 1000; // 20 Minutes;
  }

  // If nextAuraSpawnTime is undefined or currentTime surpasses it
  if (nextAuraSpawnTime === undefined) {
    nextAuraSpawnTime = new Date(serverStart.getTime() + nextAuraSpawnInterval);
    nextAuraDespawnTime = new Date(
      nextAuraSpawnTime.getTime() + nextAuraDespawnInterval
    );
    auraFirstSpawn = true;
  } else {
    while (currentTime > nextAuraSpawnTime) {
      nextAuraDespawnTime = new Date(
        nextAuraSpawnTime.getTime() + nextAuraDespawnInterval
      );
      nextAuraSpawnTime = new Date(
        nextAuraDespawnTime.getTime() + nextAuraSpawnInterval
      );
      hasChanged = true;
    }

    if (currentTime > nextAuraDespawnTime) {
      nextAuraDespawnTime = new Date(
        nextAuraSpawnTime.getTime() + nextAuraDespawnInterval
      );
    }
  }

  displayValues("aura");

  // console.log(nextAuraSpawnTime.toTimeString());
  // console.log(nextAuraDespawnTime.toTimeString());
}

function fruitSpawn() {
  let nextFruitSpawnInterval = 60 * 60 * 1000; // 60 Minutes (1 hour);
  let nextFruitDespawnInterval = 20 * 60 * 1000; // 20 Minutes;

  // If nextFruitSpawnTime is undefined or currentTime surpasses it
  if (nextFruitSpawnTime === undefined) {
    nextFruitSpawnTime = new Date(
      serverStart.getTime() + nextFruitSpawnInterval
    );
    nextFruitDespawnTime = new Date(
      nextFruitSpawnTime.getTime() + nextFruitDespawnInterval
    );
  } else {
    while (currentTime > nextFruitSpawnTime) {
      nextFruitDespawnTime = new Date(
        nextFruitSpawnTime.getTime() + nextFruitDespawnInterval
      );
      nextFruitSpawnTime = new Date(
        nextFruitDespawnTime.getTime() + nextFruitSpawnInterval
      );
      hasChanged = true;
    }

    if (currentTime > nextFruitDespawnTime) {
      nextFruitDespawnTime = new Date(
        nextFruitSpawnTime.getTime() + nextFruitDespawnInterval
      );
    }
  }

  displayValues("fruit");

  // console.log(nextFruitSpawnTime.toTimeString());
  // console.log(nextFruitDespawnTime.toTimeString());
}

function eventSpawn() {
  let nextEventSpawnInterval;
  let nextEventDespawnInterval = 5 * 60 * 1000; // 5 Minutes;

  // Set spawn and despawn intervals based on the selected sea type
  switch (currentSea) {
    case "secondSea":
      nextEventSpawnInterval = 90 * 60 * 1000; // 1 Hour 30 Minutes;
      break;
    case "thirdSea":
      nextEventSpawnInterval = 75 * 60 * 1000; // 1 Hour 15 Minutes;
      break;
    default:
      break;
  }

  // If nextEventSpawnTime is undefined or currentTime surpasses it
  if (nextEventSpawnTime === undefined) {
    nextEventSpawnTime = new Date(
      serverStart.getTime() + nextEventSpawnInterval
    );
    nextEventDespawnTime = new Date(
      nextEventSpawnTime.getTime() + nextEventDespawnInterval
    );
  } else {
    while (currentTime > nextEventSpawnTime) {
      nextEventDespawnTime = new Date(
        nextEventSpawnTime.getTime() + nextEventDespawnInterval
      );
      nextEventSpawnTime = new Date(
        nextEventDespawnTime.getTime() + nextEventSpawnInterval
      );
      hasChanged = true;
    }

    if (currentTime > nextEventDespawnTime) {
      nextEventDespawnTime = new Date(
        nextEventSpawnTime.getTime() + nextEventDespawnInterval
      );
    }
  }

  displayValues("event"); // Assuming you have a displayValues function

  // console.log(nextEventSpawnTime.toTimeString());
  // console.log(nextEventDespawnTime.toTimeString());
}

function displayValues(type) {
  let nextSpawnTime;
  let nextDespawnTime;
  let isActive;

  console.log("Printing " + type);

  if (type === "fruit") {
    nextSpawnTime = nextFruitSpawnTime;
    nextDespawnTime = nextFruitDespawnTime;
    isActive =
      currentTime > nextFruitSpawnTime && currentTime <= nextFruitDespawnTime;
  } else if (type === "event") {
    nextSpawnTime = nextEventSpawnTime;
    nextDespawnTime = nextEventDespawnTime;
    isActive =
      currentTime > nextEventSpawnTime && currentTime <= nextEventDespawnTime;
  } else if (type === "aura") {
    nextSpawnTime = nextAuraSpawnTime;
    nextDespawnTime = nextAuraDespawnTime;
    isActive =
      currentTime < nextAuraSpawnTime &&
      nextAuraDespawnTime <= nextAuraSpawnTime;
  }

  console.log(type + " " + isActive);

  // Update the spans with the new values
  document.getElementById(type + "-spawn-time").textContent =
    nextSpawnTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  document.getElementById(type + "-despawn-time").textContent =
    nextDespawnTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  document.getElementById(type + "-active").innerHTML = isActive
    ? '<span class="active">Active</span>'
    : '<span class="inactive">Inactive</span>';

  if (isActive && hasChanged) {
    playSpawnSound();
    hasChanged = false;
  }

  // Calculate time until spawn
  const timeDifference = nextSpawnTime - currentTime;
  const minutes = Math.floor(timeDifference / (1000 * 60));
  const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
  const timer = `${minutes}m ${seconds}s`;

  // Update the timer span
  document.getElementById(type + "-timer").textContent = timer;
}

/* Used in an interval to keep track of current time and update events */
function updateCurrentTime() {
  currentTime = new Date();
  if (firstStart) {
    auraSpawn();
    eventSpawn();
    fruitSpawn();
  }
}

// Initial update
updateCurrentTime();

timeInterval = setInterval(updateCurrentTime, 1000);

function resetInterval() {
  clearInterval(timeInterval);
  timeInterval = setInterval(updateCurrentTime, 1000);
}
