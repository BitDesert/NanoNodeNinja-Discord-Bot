const { MessageEmbed } = require('discord.js');
const axios = require("axios");
const nanocurrency = require("nanocurrency");

const constants =  require('../constants')
const tools =  require('../tools')

async function sendBlockInfo(client, channel, block){
  try {
    var blockresponse = await axios.get('https://mynano.ninja/api/blocks/' + block);
  } catch (error) {
    channel.send('Block '+block+' not found!');
    return console.log(error);
  }

  const embed = new MessageEmbed()
    .setTitle(block)
    .setColor(constants.nanoBlue)
    .setDescription('[More information](https://mynano.ninja/block/' + block+')')
    .setFooter('My Nano Ninja | mynano.ninja', client.user.avatarURL)
    .addField('Account', blockresponse.data.block_account)
    .addField('Link', blockresponse.data.contents.link_as_account)
    .addField('Type', blockresponse.data.subtype, true)
    .addField('Amount', nanocurrency.convert(blockresponse.data.amount, { from: 'raw', to: 'NANO' }) + ' NANO', true)
    .addField('Balance', nanocurrency.convert(blockresponse.data.balance, { from: 'raw', to: 'NANO' }) + ' NANO', true)
    .addField('Confirmed', blockresponse.data.confirmed, true)

  // Send the embed to the same channel as the message
  channel.send(embed);
}

module.exports = sendBlockInfo;