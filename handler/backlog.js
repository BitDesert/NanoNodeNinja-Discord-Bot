const { MessageEmbed } = require('discord.js');
const axios = require("axios");
const moment = require("moment");

const tools =  require('../tools')
const constants =  require('../constants')
const getBlocksPerSecond =  require('../bps')

async function sendBlockCounts(client, channel){
  try {
    var blocks = await axios.get('https://mynano.ninja/api/blockcount');
    var cps = await getBlocksPerSecond('cps_p75');
  } catch (error) {
    return console.log(error);
  }

  const sum = cps.raw.reduce((a, b) => a + b, 0);
  const cps_avg = (sum / cps.raw.length) || 0;

  var backlog = parseInt(blocks.data.count) - parseInt(blocks.data.cemented);
  var percent_cemented = parseInt(blocks.data.cemented) / parseInt(blocks.data.count);
  var clearedin_seconds = backlog / cps_avg;
  var clearedin = moment().seconds(clearedin_seconds).fromNow();
  
  if(percent_cemented < 0.999){
    channel.send('No backlog');
    return;
  }

  const embed = new MessageEmbed()
    .setTitle('Backlog Estimation')
    .setColor(constants.nanoBlue)
    .addField('Backlog', backlog.toLocaleString('en-US'), true)
    .addField('CPS (avg 60 min)', tools.round(cps_avg, 2), true)
    .addField('Cleared', clearedin, true)
    .setFooter('My Nano Ninja | mynano.ninja', client.user.avatarURL)

  // Send the embed to the same channel as the message
  channel.send(embed);
}

module.exports = sendBlockCounts;
