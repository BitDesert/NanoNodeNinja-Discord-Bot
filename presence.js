const axios = require("axios");
var tools = require('./tools');

async function updatePresence(client) {
  var presence = '';

  try {
    var result = await axios.get('https://nanoticker.info/json/stats.json');
    presence = tools.formatTPS(result.data.CPSMedian_pr) + ' CPS | ' + tools.formatTPS(result.data.BPSMedian_pr) + ' BPS | .help'
  } catch (error) {
    return console.log('Cannot catch current CPS', error); 
  }

  client.user.setActivity(presence, { type: 'WATCHING' })
  .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
  .catch(console.error);

}

module.exports = {
  updatePresence
}