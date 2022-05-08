var mqtt = require('mqtt')
var mqttopts = require("./data/mqtt-options.json");

// --- data/mqtt-options.json content:
// {
//  "__protocolId": "MQIsdp",
//  "__protocolVersion": 3,
//  "username": "<mqtt username>",
//  "password": "<mqtt password>",
//  "__rejectUnauthorized": false
// }


var client  = mqtt.connect('mqtts://o-borg.xyz', mqttopts)

client.on('connect', function () {
  console.log('connected!')
  client.subscribe('irrigation_evt', function (err) {
    if (!err) {
      client.publish('irrigation_cmd', 'get_pressure')
    }
  })
})

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  setTimeout(function() {client.end() }, 2000)
})
