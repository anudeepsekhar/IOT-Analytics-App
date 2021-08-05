const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const EventHubReader = require('./scripts/event-hub-reader.js');
const database = require('./scripts/db.js');

const iotHubConnectionString = process.env.IotHubConnectionString;
if (!iotHubConnectionString) {
  console.error(`Environment variable IotHubConnectionString must be specified.`);
  return;
}
console.log(`Using IoT Hub connection string [${iotHubConnectionString}]`);

const eventHubConsumerGroup = process.env.EventHubConsumerGroup;
console.log(eventHubConsumerGroup);
if (!eventHubConsumerGroup) {
  console.error(`Environment variable EventHubConsumerGroup must be specified.`);
  return;
}
console.log(`Using event hub consumer group [${eventHubConsumerGroup}]`);

// Redirect requests to the public subdirectory to the root
const app = express();
app.use(express.static(path.join(__dirname, 'dashboard3')));

//app.use('/', function(req, res, next){
//  res.sendFile(path.join(__dirname+'/public/index.html'));
//});

app.use('/moment', express.static(__dirname + '/node_modules/moment/dist/'));

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded());

app.post('/total_counts', function (req, res, next){
  database.total_counts((err, result) => {
    res.json(result);
  });
});

app.post('/get_data', function (req, res, next){
  console.log(req.body);
  var from_time = req.body.from_time;
  var to_time = req.body.to_time;
  var group_by = req.body.group_by;
  var minutes_offset = req.body.minutes_offset;

  database.get_data((err, result) => {
    res.json(result);
  }, from_time, to_time, group_by, minutes_offset);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        //console.log(`Broadcasting data ${data}`);
        client.send(data);
      } catch (e) {
        console.error(e);
      }
    }
  });
};

server.listen(process.env.PORT || '3000', () => {
  console.log('Listening on %d.', server.address().port);
});

const eventHubReader = new EventHubReader(iotHubConnectionString, eventHubConsumerGroup);

(async () => {
  await eventHubReader.startReadMessage((message, date, deviceId) => {
    try {
      message = message.toString();
      console.log(message);
      console.log("------------------------");
      message = message.replace(/(\r\n|\n|\r)/gm, ""); ;
      message = message.replace(/}{/g, "},{");
      message = "[" + message + "]";
      message_json = JSON.parse(message);

      const payload = {
        IotData: message,
        MessageDate: date || Date.now().toISOString(),
        DeviceId: deviceId,
      };

      console.log(message.toString());
      wss.broadcast(JSON.stringify(payload));
      database.add_data(message_json, deviceId);
    } catch (err) {
      console.error('Error broadcasting: [%s] from [%s].', err, message);
    }
  });
})().catch();
