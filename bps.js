const axios = require("axios");
const trend = require("./trend");

async function getBlocksPerSecond(dimension){
  var stats = await axios.get('https://node-proxy.nanoticker.info/api/v1/data?chart=repstats_v21_local.tps_median&format=json&points=320&group=average&after=-3600&options=flip|jsonwrap&dimension='+dimension);

  var statsvalues = stats.data.result.data;
  let cps = statsvalues.map(a => a[1]);

  var lastPoints = Math.round(statsvalues.length * 0.1);

  var growth = trend(cps, {
    lastPoints,
    avgPoints: (statsvalues.length - lastPoints)
  });

  console.log(dimension, growth, lastPoints, statsvalues.length);

  return {
    lastValue: stats.data.latest_values[0],
    growth: growth
  };
}

module.exports = getBlocksPerSecond;