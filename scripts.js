let serverStart;
let currentTime;

let nextAuraSpawnTime;
let nextAuraDespawnTime;

let nextFruitSpawnTime;
let nextFruitDespawnTime;

let nextCoreSpawnTime;
let nextCoreDespawnTime;

/* Keeps track of the current local device time */
function updateCurrentTime() {
  const currentTimeElement = document.getElementById("current-time");
  currentTime = new Date(); // Reassign the current time
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
  };
  const formattedTime = currentTime.toLocaleString("en-US", options);
  currentTimeElement.textContent = formattedTime;
}

// Saves the user's input to the serverStart variable
function saveServerStart() {
  const userInputElement = document.getElementById("userInput");
  const userInputValue = userInputElement.value;

  // Validate the user input (you may need more robust validation)
  if (!userInputValue || !userInputValue.match(/^\d{2}:\d{2}$/)) {
    alert("Please enter a valid 24-hour time (HH:mm).");
    return;
  }

  serverStart = userInputValue;
  alert("Server start time saved: " + serverStart);

  document.getElementById("server-start-time").textContent = serverStart;

  calculateTime();
}

function calculateTime() {
  // Split the input into hours and minutes
  const [hours, minutes] = serverStart.split(":").map(Number);

  // Create a Date object with the provided hours and minutes
  const serverStartTime = new Date();
  serverStartTime.setHours(hours, minutes, 0, 0);

  // Pass the new Date object to necessary functions
  auraSeller(serverStartTime);
  fruitSpawn(serverStartTime);
  coreEvent(serverStartTime);
}

function auraSeller(serverStartTime) {
  const auraSellerOutput = document.getElementById("aura-seller-output");

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
    } else if (currentTime > nextAuraDespawnTime) {
      console.log(
        currentTime +
          " is passing " +
          nextAuraDespawnTime +
          ". Updating to next interval..."
      );
      nextAuraSpawnTime = new Date(
        nextAuraDespawnTime.getTime() + auraSpawnInterval
      );
      nextAuraDespawnTime = new Date(
        nextAuraSpawnTime.getTime() + auraDespawnInterval
      );

      // Recursively call the function to check again
      calculateAuraTimes();
    } else {
      // If no update is needed, display the aura times
      displayAuraTimes(nextAuraSpawnTime, nextAuraDespawnTime);
    }
  }

  function displayAuraTimes(auraSpawnTime, auraDespawnTime) {
    auraSellerOutput.innerHTML =
      "Current Aura Spawn Time: " +
      auraSpawnTime.toLocaleTimeString() +
      "<br>Current Aura Despawn Time: " +
      auraDespawnTime.toLocaleTimeString();
  }

  // Calculate initial aura times
  calculateAuraTimes();

  // Set up an interval to recalculate aura time every second
  setInterval(() => {
    calculateAuraTimes();
  }, 1000); // Update every second for real-time tracking
}

function fruitSpawn(serverStartTime) {
  const fruitSpawnOutput = document.getElementById("fruit-spawn-output");

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
    } else if (currentTime > nextFruitDespawnTime) {
      console.log(
        currentTime +
          " is passing " +
          nextFruitDespawnTime +
          ". Updating to next interval..."
      );
      /*
       * Unlike the aura seller, the timer for the following fruit begins when the previous one spawns,
       * therefore we instead add an hour to the previous spawn time to get the new one.
       */
      nextFruitSpawnTime = new Date(
        nextFruitSpawnTime.getTime() + fruitSpawnInterval
      );
      nextFruitDespawnTime = new Date(
        nextFruitSpawnTime.getTime() + fruitDespawnInterval
      );

      // Recursively call the function to check again
      calculateFruitTimes();
    } else {
      // If no update is needed, display the fruit times
      displayFruitTimes(nextFruitSpawnTime, nextFruitDespawnTime);
    }
  }

  function displayFruitTimes(fruitSpawnTime, fruitDespawnTime) {
    const fruitSpawnTimeSpan = document.getElementById("fruit-spawn-time");
    const fruitDespawnTimeSpan = document.getElementById("fruit-despawn-time");
    const fruitTimerSpan = document.getElementById("fruit-timer");

    // Display Next Fruit Spawn Time
    fruitSpawnTimeSpan.textContent =
      "Next Fruit Spawn: " + fruitSpawnTime.toLocaleTimeString();

    // Display Next Fruit Despawn Time
    fruitDespawnTimeSpan.textContent =
      "Next Fruit Despawn: " + fruitDespawnTime.toLocaleTimeString();

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

    fruitTimerSpan.textContent =
      "Time until next spawn: " +
      `${hoursUntilNextSpawn}h ${minutesUntilNextSpawn}m ${secondsUntilNextSpawn}s`;
  }

  // Calculate initial fruit times
  calculateFruitTimes();

  // Set up an interval to recalculate fruit time every second
  setInterval(() => {
    calculateFruitTimes();
  }, 1000); // Update every second for real-time tracking
}

function coreEvent(serverStartTime) {
  const coreEventOutput = document.getElementById("core-event-output");

  function calculateCoreTimes() {
    const coreSpawnInterval = 90 * 60 * 1000; // 90 Minutes
    const coreDespawnInterval = 5 * 60 * 1000; // 5 Minutes

    // Initialize core times if not already set
    if (!nextCoreDespawnTime) {
      nextCoreSpawnTime = new Date(
        serverStartTime.getTime() + coreSpawnInterval
      );
      nextCoreDespawnTime = new Date(
        nextCoreSpawnTime.getTime() + coreDespawnInterval
      );
    } else if (currentTime > nextCoreDespawnTime) {
      console.log(
        currentTime +
          " is passing " +
          nextCoreDespawnTime +
          ". Updating to next interval..."
      );
      /*
       * Unlike the aura seller, the timer for the following core begins when the previous one spawns,
       * therefore we instead add an hour to the previous spawn time to get the new one.
       */
      nextCoreSpawnTime = new Date(
        nextCoreSpawnTime.getTime() + coreSpawnInterval
      );
      nextCoreDespawnTime = new Date(
        nextCoreSpawnTime.getTime() + coreSpawnInterval
      );

      // Recursively call the function to check again
      calculateCoreTimes();
    } else {
      // If no update is needed, display the core times
      displayCoreTimes(nextCoreSpawnTime, nextCoreDespawnTime);
    }
  }

  function displayCoreTimes(coreSpawnTime, coreDespawnTime) {
    coreEventOutput.innerHTML =
      "Current Core Spawn Time: " +
      coreSpawnTime.toLocaleTimeString() +
      "<br>Current Core Despawn Time: " +
      coreDespawnTime.toLocaleTimeString();
  }

  // Calculate initial core times
  calculateCoreTimes();

  // Set up an interval to recalculate core time every second
  setInterval(() => {
    calculateCoreTimes();
  }, 1000); // Update every second for real-time tracking
}

// Update the time every second
setInterval(updateCurrentTime, 1000);

// Initial update
updateCurrentTime();
