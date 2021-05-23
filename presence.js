const axios = require("axios");
var tools = require('./tools');
const getBlocksPerSecond =  require('./bps')

async function updatePresence(client) {
  var presence = '';

  try {
    var growth_cps = await getBlocksPerSecond('cps_p75');
    var growth_bps = await getBlocksPerSecond('bps_p75');

    presence = tools.growthToEmoji(growth_cps.growth) + tools.formatTPS(growth_cps.lastValue) + ' CPS | ' + tools.growthToEmoji(growth_bps.growth) + tools.formatTPS(growth_bps.lastValue) + ' BPS | .help'
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