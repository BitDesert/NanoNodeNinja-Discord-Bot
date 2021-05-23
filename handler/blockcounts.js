const { MessageEmbed } = require('discord.js');
const axios = require("axios");

const constants =  require('../constants')

async function sendBlockCounts(client, channel){
  try {
    var blocks = await axios.get('https://mynano.ninja/api/blockcount');
  } catch (error) {
    return console.log(error);
  }

  const embed = new MessageEmbed()
    .setTitle('Block Counts')
    .setColor(constants.nanoBlue)
    .addField('Checked', parseInt(blocks.data.count).toLocaleString('en-US'), true)
    .addField('Unchecked', parseInt(blocks.data.unchecked).toLocaleString('en-US'), true)
    .addField('Cemented', parseInt(blocks.data.cemented).toLocaleString('en-US'), true)
    .setFooter('My Nano Ninja | mynano.ninja', client.user.avatarURL)

  // Send the embed to the same channel as the message
  channel.send(embed);
}

module.exports = sendBlockCounts;