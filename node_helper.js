/*********************************

  Node Helper for MMM-PirateSkyForecast.

  This helper is responsible for the data pull from Pirate Sky.
  At a minimum the API key, Latitude and Longitude parameters
  must be provided.  If any of these are missing, the request
  to Pirate Sky will not be executed, and instead an error
  will be output the the MagicMirror log.

  Additional, this module supplies two optional parameters:

    units - one of "ca", "uk2", "us", or "si"
    lang - Any of the languages Pirate Sky supports, as listed here: https://pirateweather.net/en/latest/API/#response

  The Pirate Sky API request looks like this:

    https://api.pirateweather.net/forecast/API_KEY/LATITUDE,LONGITUDE?units=XXX&lang=YY

*********************************/

const Log = require("logger");
const NodeHelper = require("node_helper");
const moment = require("moment");

module.exports = NodeHelper.create({

  start () {
    Log.log(`Starting node_helper for module [${this.name}]`);
  },

  socketNotificationReceived (notification, payload) {
    if (notification === "DARK_SKY_FORECAST_GET") {
      var self = this;
      if (payload.apikey === null || payload.apikey === "") {
        Log.log(`[MMM-PirateSkyForecast] ${moment().format("D-MMM-YY HH:mm")} ** ERROR ** No API key configured. Get an API key at https://pirateweather.net`);
      } else if (payload.latitude === null || payload.latitude === "" || payload.longitude === null || payload.longitude == "") {
        Log.log(`[MMM-PirateSkyForecast] ${moment().format("D-MMM-YY HH:mm")} ** ERROR ** Latitude and/or longitude not provided.`);
      } else {
        requestData();
      }
    }

    async function requestData () {
      // make request to Pirate Sky API
      const url = `https://api.pirateweather.net/forecast/${
        payload.apikey}/${
        payload.latitude},${payload.longitude
      }?units=${payload.units
      }&lang=${payload.language}`;
      // "&exclude=minutely"
      Log.debug(`[MMM-PirateSkyForecast] Getting data: ${url}`);
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const resp = await response.json();
        resp.instanceId = payload.instanceId;
        self.sendSocketNotification("DARK_SKY_FORECAST_DATA", resp);
      } catch (error) {
        Log.error(`[MMM-PirateSkyForecast] ${moment().format("D-MMM-YY HH:mm")} ** ERROR ** ${error}`);
      }
    }
  }
});
