const axios = require("axios");
var tools = require('./tools');
const getBlocksPerSecondGrowth =  require('./bps_growth')

async function updatePresence(client) {
  var presence = '';

  try {
    var result = await axios.get('https://nanoticker.info/json/stats.json');
    var growth_cps = await getBlocksPerSecondGrowth('cps_p75');
    var growth_bps = await getBlocksPerSecondGrowth('bps_p75');

    presence = tools.growthToEmoji(growth_cps) + tools.formatTPS(result.data.CPSMedian_pr) + ' CPS | ' + tools.growthToEmoji(growth_bps) + tools.formatTPS(result.data.BPSMedian_pr) + ' BPS | .help'
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