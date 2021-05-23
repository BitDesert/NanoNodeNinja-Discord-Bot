const axios = require("axios");
const trend = require("./trend");

async function getBlocksPerSecondGrowth(dimension){
  var stats = await axios.get('https://node-proxy.nanoticker.info/api/v1/data?chart=repstats_v21_local.tps_median&format=json&points=320&group=average&after=-3600&dimension='+dimension+'&options=flip|jsonwrap');

  var statsvalues = stats.data.result.data;
  let cps = statsvalues.map(a => a[1]);

  var growth = trend(cps, {
    //lastPoints: 20,
    avgPoints: (statsvalues.length - 1)
  });

  console.log(growth, statsvalues.length);
  return growth;
}

module.exports = getBlocksPerSecondGrowth;