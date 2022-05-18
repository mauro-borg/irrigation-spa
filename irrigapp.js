
var express = require("express");
var app = express();
var bodyParser = require("body-parser");

var mqtt = require('mqtt')
var mqttopts = require("./data/mqtt-options.json");
var mqttclient  = mqtt.connect('mqtts://o-borg.xyz', mqttopts)

var pressure = -1;
var irrig_status = "";
const messages = [];

app.set("views", "./views");
app.set("view engine", "jade");

// define dirs from which static content is served
app.use(express.static("public"));
app.use(express.static("node_modules/bootstrap/dist"));
app.use(express.static("node_modules/jquery/dist"));

// bodyParser middleware switches parsing methods based on contentType
// header
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); // handle json posted from client-side js

// function plugged into middleware for logging
app.use(function(req, res, next) {
	console.log(`Incoming request: ${req.method} ${req.url}`);
	next();
});

app.get('/', function(req, res) {
	// point to home.jade view (without extension because we set
  // "view engine" to "jade")
	res.render("home", {title: "Home"});
});

app.get('/api/pump_control_auto', function(req, res) {
	mqttclient.publish('irrigation_cmd', 'pump_control_auto');
	res.sendStatus(200);
});

app.get('/api/pump_control_manual', function(req, res) {
	mqttclient.publish('irrigation_cmd', 'pump_control_manual');
	res.sendStatus(200);
});

app.get('/api/relay/:relayid/:relaystatus', function(req,res) {
	var relay = req.params.relayid;
	var targetstatus = req.params.relaystatus;
	var validrelay = ['1','2','3','4','5','6','7','8'];
	var validstatus = ['on','off'];
	console.log(`relay: ${relay} - target status: ${targetstatus}`);
	if (validrelay.includes(relay) &&
	    validstatus.includes(targetstatus)) {
		let pin = parseInt(relay) + 1;
		let mqttmsg = pin.toString() + ':' + targetstatus;
		console.log(`Sending command: ${mqttmsg}`)
		mqttclient.publish('irrigation_cmd', mqttmsg);
		res.sendStatus(202);
	} else {
		res.sendStatus(400);
	}
});

app.get('/api/pressure', function(req, res) {
	mqttclient.publish('irrigation_cmd', 'get_pressure');
	if (pressure < 0) {
	  res.sendStatus(102);
	} else {
		res.json({pressure: pressure});
	}
});

app.get('/api/status', function(req, res) {
	mqttclient.publish('irrigation_cmd', 'get_status');
	if (irrig_status == "") {
	  res.sendStatus(102);
	} else {
		res.json({status: irrig_status});
	}
});

app.get('/api/messages', function(req, res) {
	res.json({msglist: messages});
});

mqttclient.on('connect', function () {
  console.log('mqtt client connected');
  mqttclient.subscribe('irrigation_evt', function (err) {
		if (!err) {
      // mqttclient.publish('irrigation_cmd', 'get_pressure')
    }
  })
})

mqttclient.on('message', function (topic, message) {
  // message is Buffer
	msgstr = message.toString()
  console.log(msgstr);
	if (messages.push(msgstr) > 10) messages.shift();

	if (msgstr.startsWith('Pressure [mbar]')) {
		const pval = parseInt(msgstr.split(":")[1]);
		if (isNaN(pval)) {
			pressure = -1;
		} else {
			pressure = pval;
		}
	}
  // setTimeout(function() {client.end() }, 2000)
})


app.listen(3001, "0.0.0.0", function () {
	console.log('irrigapp listening on port 3001.');
});
