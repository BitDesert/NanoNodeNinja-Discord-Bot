const { MessageEmbed } = require('discord.js');
const axios = require("axios");
const nanocurrency = require("nanocurrency");

const constants =  require('../constants')
const tools =  require('../tools')

async function sendAddressInfo(client, channel, accountname){
  try {
    var account = await axios.get('https://mynano.ninja/api/accounts/' + accountname + '/info');
  } catch (error) {
    return console.log(error);
  }

  const embed = new MessageEmbed()
    .setTitle(accountname)
    .setColor(constants.nanoBlue)
    .setDescription('[More information](https://mynano.ninja/account/' + accountname+')')
    .setFooter('My Nano Ninja | mynano.ninja', client.user.avatarURL)
    .addField('Balance', nanocurrency.convert(account.data.balance, { from: 'raw', to: 'NANO' }) + ' NANO', true)
    .addField('Pending', nanocurrency.convert(account.data.pending, { from: 'raw', to: 'NANO' }) + ' NANO', true)

  // Send the embed to the same channel as the message
  channel.send(embed);
}

module.exports = sendAddressInfo;