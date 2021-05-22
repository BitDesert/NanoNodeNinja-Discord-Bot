const { MessageEmbed } = require('discord.js');
const Big = require('big.js');

const tools = require('../tools')
const constants = require('../constants')

async function convert(client, channel, number, unit) {
  // based on https://nanoo.tools/unit-converter

  var inputBig = Big(number);

  // define multipliers/dividers. dividers will be implemented as multipliers for precision reasons. 
  multMnano = Big('1000000000000000000000000000000'); // 10^30
  divMnano = Big('0.000000000000000000000000000001'); // 10^-30
  multknano = Big('1000000000000000000000000000'); // 10^27
  divknano = Big('0.000000000000000000000000001'); // 10^-27
  multnano = Big('1000000000000000000000000'); // 10^24
  divnano = Big('0.000000000000000000000001'); // 10^-24

  // Convert input to raw amount
  if (unit == "NANO") {
    var raw = Big(inputBig.times(multMnano));
  } else if (unit == "knano") {
    var raw = Big(inputBig.times(multknano));
  } else if (unit == "nano") {
    var raw = Big(inputBig.times(multnano));
  } else if (unit == "raw") {
    var raw = Big(inputBig);
  } else {
    channel.send('unit is not known!');
    return;
  }

  channel.send({
    embed: {
      color: 16007990,
      fields: [
        {
          name: "NANO",
          value: Big(raw.times(divMnano)).toFixed().toString(),
          inline: true
        },
        {
          name: "knano",
          value: Big(raw.times(divknano)).toFixed().toString(),
          inline: true
        },
        {
          name: "nano",
          value: Big(raw.times(divnano)).toFixed().toString(),
          inline: true
        },
        {
          name: "raw",
          value: raw.toFixed().toString(),
          inline: true
        },
        {
          name: "raw Hex",
          value: tools.pad16bytehex(tools.dec2hex(raw.toFixed().toString())).toUpperCase(),
          inline: true
        }
      ],
      footer: {
        icon_url: client.user.avatarURL,
        text: 'My Nano Ninja | mynano.ninja'
      }
    }
  });
}

module.exports = convert;