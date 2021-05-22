const { MessageEmbed } = require('discord.js');
const axios = require("axios");
const nanocurrency = require("nanocurrency");
var moment = require('moment');

const constants = require('../constants')

async function sendRepInfo(client, channel, accountname) {
  try {
    var account = await axios.get('https://mynano.ninja/api/accounts/' + accountname);
  } catch (error) {
    return console.log(error);
  }

  const embed = new MessageEmbed()
    .setTitle(accountname)
    .setColor(constants.nanoBlue)
    .setDescription('[More information](https://mynano.ninja/account/' + accountname + ')')
    .setFooter('My Nano Ninja | mynano.ninja', client.user.avatarURL)
    .addField('Voting Weight', nanocurrency.convert(account.data.votingweight.toString(), { from: 'raw', to: 'NANO' }) + ' NANO', true)
    .addField('Uptime', tools.round(account.data.uptime, 3) + ' %', true)
    .addField('Last voted', moment(account.data.lastVoted).fromNow(), true)

  // Send the embed to the same channel as the message
  channel.send(embed);
}

module.exports = sendRepInfo;