const { MessageEmbed } = require('discord.js');
const axios = require("axios");

const constants =  require('../constants')

async function sendBlocks(client, channel){
  try {
    var blocks = await axios.get('https://mynano.ninja/api/blockcount');
  } catch (error) {
    return console.log(error);
  }

  const embed = new MessageEmbed()
    .setTitle('Blocks')
    .setColor(constants.nanoBlue)
    .setDescription(parseInt(blocks.data.count).toLocaleString('en-US'))
    .setFooter('My Nano Ninja | mynano.ninja', client.user.avatarURL)

  // Send the embed to the same channel as the message
  channel.send(embed);
}

module.exports = sendBlocks;