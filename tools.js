function dec2hex(str, bytes = null) {
  var dec = str.toString().split(''), sum = [], hex = [], i, s
  while (dec.length) {
    s = 1 * dec.shift()
    for (i = 0; s || i < sum.length; i++) {
      s += (sum[i] || 0) * 10
      sum[i] = s % 16
      s = (s - sum[i]) / 16
    }
  }
  while (sum.length) {
    hex.push(sum.pop().toString(16));
  }

  hex = hex.join('');

  if (hex.length % 2 != 0)
    hex = "0" + hex;

  if (bytes > hex.length / 2) {
    var diff = bytes - hex.length / 2;
    for (var i = 0; i < diff; i++)
      hex = "00" + hex;
  }

  return hex;
}

// Zerofill HEX ... modified https://stackoverflow.com/questions/1267283/how-can-i-pad-a-value-with-leading-zeros
function pad16bytehex(n) {
  var pad = '00000000000000000000000000000000'
  return (pad + n).slice(-pad.length);
}

function variableRound(value) {
  if (value > 1) {
    return round(value, 2);
  } else {
    return round(value, 5);
  }
}

function round(value, precision) {
  if (Number.isInteger(precision)) {
    var shift = Math.pow(10, precision);
    return Math.round(value * shift) / shift;
  } else {
    return Math.round(value);
  }
}

function formatTPS(tps) {
  return parseFloat(tps).toFixed(2).toLocaleString('en-US');
}

function rawtoNANO(raw) {
  return raw / 1000000000000000000000000000000;
}

function toLocaleString(value) {
  if(isNaN(value)) return '0';
  return Number.parseFloat(value).toLocaleString('en-US')
}

function hasAddress(string){
  return /^.*(nano_[13][13-9a-km-uw-z]{59}).*$/.test(string)
}

function getAddress(string){
  return string.match(/^.*(nano_[13][13-9a-km-uw-z]{59}).*$/)
}

function growthToEmoji(growth){
  if(growth < 0.5){
    return '⏬';
  } else if(growth < 0.8){
    return '🔽';
  } else if(growth < 1.2){
    return '⏺️';
  } else if(growth < 1.6){
    return '🔼';
  } else {
    return '⏫';
  }
}

module.exports = {
  dec2hex,
  pad16bytehex,
  variableRound,
  round,
  formatTPS,
  rawtoNANO,
  toLocaleString,
  hasAddress,
  getAddress,
  growthToEmoji
}