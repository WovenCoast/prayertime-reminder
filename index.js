const ms = require("ms");
const pollingTime = 500; // in milliseconds, higher means slower but more accurate
const islandId = 102; // good luck https://github.com/WovenCoast/prayertime-reminder/blob/main/island-mapping.md
const preAlerts = [
  // however many alerts you want however long before you want the alerts
  ms("10min"),
  ms("5min"),
  ms("1min"),
];

const notifier = require("node-notifier");
// give a read through https://www.npmjs.com/package/node-notifier
// also nothing is stopping you from making these functions async
function generateAlertNotification(data) {
  return notifier.notify({
    title: "Prayer Alert",
    message: `${data.nextPrayer} prayer is in ${data.timeTillNextPrayer}!`,
    wait: true,
  });
}
function generatePrayerTimeNotification(data) {
  return notifier.notify({
    title: `${data.currentPrayer} Prayer Time`,
    message: `It's time to go pray ${data.currentPrayer}`,
    wait: true,
  });
}

// -----------------------------------------------------------------------------
// highly advisable not to edit the things below this line
// -----------------------------------------------------------------------------

const SalatDB = require("./classes/SalatDB");

let lastNextPrayer = null;
let invokedAlerts = 0;

async function main() {
  await SalatDB.init();

  setInterval(async () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    let prayerTimes = await SalatDB.getTimesInIsland(now, islandId);
    let nextPrayer = null;
    ["Fajuru", "Dhuhr", "Asr", "Maghrib", "Isha"].forEach((key) => {
      if (nextPrayer) return;
      if (SalatDB.convertTimestampToDate(prayerTimes[key]) > now) {
        nextPrayer = key;
      }
    });
    if (nextPrayer === null) {
      prayerTimes = await SalatDB.getTimesInIsland(tomorrow, islandId);
      nextPrayer = "Fajuru";
    }
    if (lastNextPrayer === null) lastNextPrayer = nextPrayer;

    // console.log(SalatDB.daysIntoYear(tomorrow), prayerTimes, nextPrayer);

    let nextPrayerTimestamp = SalatDB.convertTimestampToDate(
      prayerTimes[nextPrayer]
    );
    // what a complicated way to check if it's tomorrow
    if (prayerTimes.Date === SalatDB.daysIntoYear(tomorrow)) {
      nextPrayerTimestamp = new Date(
        nextPrayerTimestamp.getTime() + 24 * 60 * 60 * 1000
      );
    }
    const timeTillNextPrayer = nextPrayerTimestamp - now;
    // console.log(nextPrayerTimestamp, timeTillNextPrayer, nextPrayer);

    const island = await SalatDB.getIsland(islandId);
    // why a for loop? because there's a race condition where it
    // breaks if there's like a 2 hour alert for isha prayer and
    // it breaks if you start the script after an alert should have
    // been done already
    for (let i = invokedAlerts; i < preAlerts.length; i++) {
      if (timeTillNextPrayer < preAlerts[i]) {
        invokedAlerts++;
        generateAlertNotification({
          nextPrayer,
          timeTillNextPrayer: ms(timeTillNextPrayer),
          raw: prayerTimes,
          island,
        });
        break;
      }
    }

    if (lastNextPrayer !== nextPrayer) {
      generatePrayerTimeNotification({
        currentPrayer: lastNextPrayer,
        nextPrayer,
        timeTillNextPrayer: ms(timeTillNextPrayer),
        raw: prayerTimes,
        island,
      });
    }
    lastNextPrayer = nextPrayer;
  }, pollingTime);
}

main();
