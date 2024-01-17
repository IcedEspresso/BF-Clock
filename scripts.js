document.getElementById("volumeControl").value =
  localStorage.getItem("volume") || 0.5;

let serverStart;
let currentTime;

let nextAuraSpawnTime;
let nextAuraDespawnTime;
let auraActive;

let nextFruitSpawnTime;
let nextFruitDespawnTime;
let fruitActive;

let nextEventFruitSpawnTime;
let nextEventFruitDespawnTime;
let eventFruitActive;

/* Keeps track of the current local device time */
function updateCurrentTime() {
  // const currentTimeElement = document.getElementById("current-time");
  currentTime = new Date(); // Reassign the current time
  // const options = {
  //   weekday: "long",
  //   year: "numeric",
  //   month: "long",
  //   day: "numeric",
  //   hour: "numeric",
  //   minute: "numeric",
  //   second: "numeric",
  //   timeZoneName: "short",
  // };
  // const formattedTime = currentTime.toLocaleString("en-US", options);
  // currentTimeElement.textContent = formattedTime;
}

function syncInputs(value) {
  let userInputs = document.getElementsByClassName("userInput");

  for (let i = 0; i < userInputs.length; i++) {
    userInputs[i].value = value;
  }

  serverStart = value;
}

function saveServerStart() {
  const mainInput = document.getElementById("mainInput");
  const userInputValue = serverStart;

  // Validate the user input
  if (!userInputValue || !isValidTimeFormat(userInputValue)) {
    alert("Please enter a valid 24-hour time (HH:mm).");
    return;
  }

  mainInput.style.display = "none";

  serverStart = userInputValue;

  document.getElementById("server-start-time").innerHTML =
    "<h4>Server Start at " + serverStart + "</h4>";

  // Set the visibility of containers with class "container.spawn"
  const spawnContainers = document.querySelectorAll(".container.spawn");
  spawnContainers.forEach((container) => {
    container.style.display = "block";
  });

  closeSettings();
  calculateTime();
}

function isValidTimeFormat(time) {
  const regex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(time);
}

function handleEnterKey(event) {
  if (event.key === "Enter") {
    saveServerStart();
  }
}

function calculateTime() {
  // Split the input into hours and minutes
  const [hours, minutes] = serverStart.split(":").map(Number);

  // Create a Date object with the provided hours and minutes
  const serverStartTime = new Date();
  serverStartTime.setHours(hours, minutes, 0, 0);

  // Reset the next spawn times to the new calculated values
  nextAuraSpawnTime = new Date(serverStartTime.getTime() + 25 * 60 * 1000);
  nextFruitSpawnTime = new Date(serverStartTime.getTime() + 60 * 60 * 1000);
  nextEventFruitSpawnTime = new Date(
    serverStartTime.getTime() + 90 * 60 * 1000
  );

  // Pass the new Date object to necessary functions
  auraSeller(serverStartTime);
  fruitSpawn(serverStartTime);
  eventFruit(serverStartTime);
}

function auraSeller(serverStartTime) {
  function calculateAuraTimes() {
    const auraSpawnInterval = 25 * 60 * 1000; // 25 Minutes
    const auraDespawnInterval = 20 * 60 * 1000; // 20 Minutes

    // Get current time
    const currentTime = new Date();

    // Initialize aura times if not already set
    if (!nextAuraDespawnTime) {
      nextAuraSpawnTime = new Date(
        serverStartTime.getTime() + auraSpawnInterval
      );
      nextAuraDespawnTime = new Date(
        nextAuraSpawnTime.getTime() + auraDespawnInterval
      );
    }

    if (currentTime > nextAuraSpawnTime) {
      console.log(
        currentTime +
          " is passing spawn timer " +
          nextAuraSpawnTime +
          ". Updating to next interval..."
      );

      // Use a while loop to ensure nextAuraSpawnTime is in the future
      while (currentTime > nextAuraSpawnTime) {
        nextAuraSpawnTime = new Date(
          nextAuraSpawnTime.getTime() + auraSpawnInterval
        );
      }

      auraActive = true;

      // Play the sound after updating the spawn time
      playSpawnSound();
    }

    // Check if despawned
    if (currentTime > nextAuraDespawnTime) {
      console.log(
        currentTime +
          " is passing despawn timer " +
          nextAuraDespawnTime +
          ". Updating to next interval..."
      );
      nextAuraDespawnTime = new Date(
        nextAuraDespawnTime.getTime() + auraDespawnInterval
      );
      auraActive = false;
    }

    // Display the aura times after both checks
    displayAuraTimes(nextAuraSpawnTime, nextAuraDespawnTime);
  }

  function displayAuraTimes(auraSpawnTime, auraDespawnTime) {
    const auraSpawnTimeSpan = document.getElementById("aura-spawn-time");
    const auraDespawnTimeSpan = document.getElementById("aura-despawn-time");
    const auraTimerSpan = document.getElementById("aura-timer");
    const auraActiveDiv = document.getElementById("aura-active");

    auraSpawnTimeSpan.textContent = auraSpawnTime.toLocaleTimeString();
    auraDespawnTimeSpan.textContent = auraDespawnTime.toLocaleTimeString();

    // Calculate and display Time until next spawn
    const timeUntilNextSpawn = auraSpawnTime - currentTime;

    const hoursUntilNextSpawn = Math.floor(
      timeUntilNextSpawn / (60 * 60 * 1000)
    );
    const minutesUntilNextSpawn = Math.floor(
      (timeUntilNextSpawn % (60 * 60 * 1000)) / (60 * 1000)
    );
    const secondsUntilNextSpawn = Math.floor(
      (timeUntilNextSpawn % (60 * 1000)) / 1000
    );

    auraTimerSpan.textContent = `${hoursUntilNextSpawn}h ${minutesUntilNextSpawn}m ${secondsUntilNextSpawn}s`;

    if (auraActive) {
      auraActiveDiv.innerHTML = "<span class='active'>Active</span>";
    } else {
      auraActiveDiv.innerHTML = "<span class='inactive'>Inactive</span>";
    }
  }
  // Calculate initial aura times
  calculateAuraTimes();

  // Set up an interval to recalculate aura time every second
  setInterval(() => {
    calculateAuraTimes();
  }, 1000); // Update every second for real-time tracking
}

function fruitSpawn(serverStartTime) {
  function calculateFruitTimes() {
    const fruitSpawnInterval = 60 * 60 * 1000; // 60 Minutes
    const fruitDespawnInterval = 20 * 60 * 1000; // 20 Minutes

    // Initialize fruit times if not already set
    if (!nextFruitDespawnTime) {
      nextFruitSpawnTime = new Date(
        serverStartTime.getTime() + fruitSpawnInterval
      );
      nextFruitDespawnTime = new Date(
        nextFruitSpawnTime.getTime() + fruitDespawnInterval
      );
    }

    if (currentTime > nextFruitSpawnTime) {
      console.log(
        currentTime +
          " is passing spawn timer " +
          nextFruitSpawnTime +
          ". Updating to next interval..."
      );

      // Use a while loop to ensure nextAuraSpawnTime is in the future
      while (currentTime > nextFruitSpawnTime) {
        nextFruitSpawnTime = new Date(
          nextFruitSpawnTime.getTime() + fruitSpawnInterval
        );
      }

      // Play the sound after updating the spawn time
      fruitActive = true;
      playSpawnSound();
    }

    // Check if despawned
    if (currentTime > nextFruitDespawnTime) {
      console.log(
        currentTime +
          " is passing despawn timer " +
          nextFruitDespawnTime +
          ". Updating to next interval..."
      );
      nextFruitDespawnTime = new Date(
        nextFruitSpawnTime.getTime() + fruitDespawnInterval
      );
      fruitActive = false;
    }

    // Display the fruit times after both checks
    displayFruitTimes(nextFruitSpawnTime, nextFruitDespawnTime);
  }

  function displayFruitTimes(fruitSpawnTime, fruitDespawnTime) {
    const fruitSpawnTimeSpan = document.getElementById("fruit-spawn-time");
    const fruitDespawnTimeSpan = document.getElementById("fruit-despawn-time");
    const fruitTimerSpan = document.getElementById("fruit-timer");
    const fruitActiveDiv = document.getElementById("fruit-active");

    // Display Next Fruit Spawn Time
    fruitSpawnTimeSpan.textContent = fruitSpawnTime.toLocaleTimeString();

    // Display Next Fruit Despawn Time
    fruitDespawnTimeSpan.textContent = fruitDespawnTime.toLocaleTimeString();

    // Calculate and display Time until next spawn
    const timeUntilNextSpawn = fruitSpawnTime - currentTime;

    const hoursUntilNextSpawn = Math.floor(
      timeUntilNextSpawn / (60 * 60 * 1000)
    );
    const minutesUntilNextSpawn = Math.floor(
      (timeUntilNextSpawn % (60 * 60 * 1000)) / (60 * 1000)
    );
    const secondsUntilNextSpawn = Math.floor(
      (timeUntilNextSpawn % (60 * 1000)) / 1000
    );

    fruitTimerSpan.textContent = `${hoursUntilNextSpawn}h ${minutesUntilNextSpawn}m ${secondsUntilNextSpawn}s`;

    if (fruitActive) {
      fruitActiveDiv.innerHTML = "<span class='active'>Active</span>";
    } else {
      fruitActiveDiv.innerHTML = "<span class='inactive'>Inactive</span>";
    }
  }

  // Calculate initial fruit times
  calculateFruitTimes();

  // Set up an interval to recalculate fruit time every second
  setInterval(() => {
    calculateFruitTimes();
  }, 1000); // Update every second for real-time tracking
}

function eventFruit(serverStartTime) {
  function calculateEventFruitTimes() {
    const eventFruitSpawnInterval = 90 * 60 * 1000; // 90 Minutes
    const eventFruitDespawnInterval = 5 * 60 * 1000; // 5 Minutes

    // Initialize event fruit times if not already set
    if (!nextEventFruitDespawnTime) {
      nextEventFruitSpawnTime = new Date(
        serverStartTime.getTime() + eventFruitSpawnInterval
      );
      nextEventFruitDespawnTime = new Date(
        nextEventFruitSpawnTime.getTime() + eventFruitDespawnInterval
      );
    }

    // Check if spawned
    if (currentTime > nextEventFruitSpawnTime) {
      console.log(
        currentTime +
          " is passing spawn timer " +
          nextEventFruitSpawnTime +
          ". Updating to next interval..."
      );

      // Use a while loop to ensure nextAuraSpawnTime is in the future
      while (currentTime > nextEventFruitSpawnTime) {
        nextEventFruitSpawnTime = new Date(
          nextEventFruitSpawnTime.getTime() + eventFruitSpawnInterval
        );
      }

      eventFruitActive = true;

      // Play the sound after updating the spawn time
      playSpawnSound();
    }
    // Check if despawned
    if (currentTime > nextEventFruitDespawnTime) {
      console.log(
        currentTime +
          " is passing despawn timer " +
          nextEventFruitDespawnTime +
          ". Updating to next interval..."
      );
      nextEventFruitDespawnTime = new Date(
        nextEventFruitSpawnTime.getTime() + eventFruitDespawnInterval
      );

      eventFruitActive = false;
    }

    // Display the event fruit times after both checks
    displayEventFruitTimes(nextEventFruitSpawnTime, nextEventFruitDespawnTime);
  }

  function displayEventFruitTimes(eventFruitSpawnTime, eventFruitDespawnTime) {
    const eventFruitSpawnTimeSpan = document.getElementById("event-spawn-time");
    const eventFruitDespawnTimeSpan =
      document.getElementById("event-despawn-time");
    const eventFruitTimerSpan = document.getElementById("event-timer");
    const eventFruitActiveDiv = document.getElementById("event-active");

    // Display Next Fruit Spawn Time
    eventFruitSpawnTimeSpan.textContent =
      eventFruitSpawnTime.toLocaleTimeString();

    // Display Next Fruit Despawn Time
    eventFruitDespawnTimeSpan.textContent =
      eventFruitDespawnTime.toLocaleTimeString();

    // Calculate and display Time until next spawn
    const timeUntilNextSpawn = eventFruitSpawnTime - currentTime;

    const hoursUntilNextSpawn = Math.floor(
      timeUntilNextSpawn / (60 * 60 * 1000)
    );
    const minutesUntilNextSpawn = Math.floor(
      (timeUntilNextSpawn % (60 * 60 * 1000)) / (60 * 1000)
    );
    const secondsUntilNextSpawn = Math.floor(
      (timeUntilNextSpawn % (60 * 1000)) / 1000
    );

    eventFruitTimerSpan.textContent = `${hoursUntilNextSpawn}h ${minutesUntilNextSpawn}m ${secondsUntilNextSpawn}s`;

    if (eventFruitActive) {
      eventFruitActiveDiv.innerHTML = "<span class='active'>Active</span>";
    } else {
      eventFruitActiveDiv.innerHTML = "<span class='inactive'>Inactive</span>";
    }
  }

  // Calculate initial event fruit times
  calculateEventFruitTimes();

  // Set up an interval to recalculate event fruit time every second
  setInterval(() => {
    calculateEventFruitTimes();
  }, 1000); // Update every second for real-time tracking
}

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

window.addEventListener("load", updateVolume);

// Update the time every second
setInterval(updateCurrentTime, 1000);

// Initial update
updateCurrentTime();
