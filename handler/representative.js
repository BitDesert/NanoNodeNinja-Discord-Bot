const { MessageEmbed } = require('discord.js');
const axios = require("axios");
const nanocurrency = require("nanocurrency");
var moment = require('moment');

const tools = require('../tools')
const constants = require('../constants')

async function sendRepInfo(client, channel, accountname) {
  try {
    var account = await axios.get('https://mynano.ninja/api/accounts/' + accountname);
  } catch (error) {
    return console.log(error);
  }

  console.log(account.data.votingweight, tools.variableRound(tools.rawtoNANO(account.data.votingweight)));

  const embed = new MessageEmbed()
    .setTitle(accountname)
    .setColor(constants.nanoBlue)
    .setDescription('[More information](https://mynano.ninja/account/' + accountname + ')')
    .setFooter('My Nano Ninja | mynano.ninja', client.user.avatarURL)
    .addField('Voting Weight', tools.toLocaleString(tools.variableRound(tools.rawtoNANO(account.data.votingweight))) + ' NANO', true)
    .addField('Uptime', tools.round(account.data.uptime, 3) + ' %', true)
    .addField('Last voted', moment(account.data.lastVoted).fromNow(), true)

  // Send the embed to the same channel as the message
  channel.send(embed);
}

module.exports = sendRepInfo;