$(document).ready(function () {
  // if deployed to a site supporting SSL, use wss://
  const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
  const webSocket = new WebSocket(protocol + location.host);
  
  // A class for holding the last N points of telemetry for a device
  class DeviceData {
    constructor(deviceId) {
      this.deviceId = deviceId;
      this.maxLen = 50;
      this.timeData = new Array(this.maxLen);
      this.detection = new Array(this.maxLen);

      this.last_detection = [];
    }
  
    addData(time, obj_detections) {
      this.timeData.push(time);
      this.detections.push(obj_detections);
      this.last_detection = obj_detections;
  
      if (this.timeData.length > this.maxLen) {
        this.timeData.shift();
        this.detections.shift();
      }
    }
  }
  
  // All the devices in the list (those that have been sending telemetry)
  class TrackedDevices {
    constructor() {
      this.devices = [];
    }
  
    // Find a device based on its Id
    findDevice(deviceId) {
      for (let i = 0; i < this.devices.length; ++i) {
        if (this.devices[i].deviceId === deviceId) {
          return this.devices[i];
        }
      }
  
      return undefined;
    }
  
    getDevicesCount() {
      return this.devices.length;
    }
  }
  
  const chart1 = document.querySelector(".chart-bar");
  var ctx = chart1.getContext("2d");
  var chart_data = [10,10,20];
  var barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Cars", "People", "Bicycle"],
      datasets: [
        {
          label: "# Count",
          data: chart_data,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  const chart2 = document.querySelector(".chart-pie");
  var ctx = chart2.getContext("2d");
  var pieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Cars", "People", "Bicycle"],
      datasets: [
        {
          label: "# Count",
          data: chart_data,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  const trackedDevices = new TrackedDevices();

  function update_data() {
    class_names = ["car", "person", "bicycle"];
    var time_date_format = 'YYYY-MM-DDTHH:mm:ss.sssssss';

    $.post('/total_counts', function(data){
      var now = moment().utc().format(time_date_format);
      obj_map = {
        'car':{'total_count':0, 'timestamp':now} , 
        'person':{'total_count':0, 'timestamp':now}, 
        'bicycle':{'total_count':0, 'timestamp':now}
      };
      for(var i=0; i<data.length; i++){
        var object = data[i]['object'].toLowerCase();
        obj_map[object]['total_count'] = data[i]['total_count'];
        obj_map[object]['timestamp'] = data[i]['timestamp'];
      }

      chart_data = [
        obj_map['car']['total_count'],
        obj_map['person']['total_count'],
        obj_map['bicycle']['total_count']
      ];

      barChart.data.datasets[0].data = chart_data;
      barChart.update();

      pieChart.data.datasets[0].data = chart_data;
      pieChart.update();

      for(var i=0; i<class_names.length; i++){
        var object = class_names[i];
        const count_elm = document.querySelector(".card-"+object);
        count_elm.innerText = obj_map[object]['total_count'].toString();

        const text_elm = document.querySelector(".text-muted-"+object)
        const time_stamp = moment.utc(obj_map[object]['timestamp']).local();
        text_elm.innerText =  time_stamp.fromNow()
      }
    });
  }

  update_data();
  setInterval(function(){ 
    update_data();
  }, 10000);
  
  // When a web socket message arrives:
  // 1. Unpack it
  // 2. Validate it has date/time and temperature
  // 3. Find or create a cached device to hold the telemetry data
  // 4. Append the telemetry data
  // 5. Update the chart UI
  webSocket.onmessage = function onMessage(message) {
    try {
      const messageData = JSON.parse(message.data);
      console.log(messageData);
  
      // time and either temperature or humidity are required
      if (!messageData.count || !messageData.IotData.length) {
        return;
      }
  
      // find or add device to list of tracked devices
      const existingDeviceData = trackedDevices.findDevice(messageData.DeviceId);
  
      if (existingDeviceData) {
        existingDeviceData.addData(messageData.count, messageData.IotData);
      } else {
        const newDeviceData = new DeviceData(messageData.DeviceId);
        trackedDevices.devices.push(newDeviceData);
        const numDevices = trackedDevices.getDevicesCount();
        deviceCount.innerText = numDevices === 1 ? `${numDevices} device` : `${numDevices} devices`;
        newDeviceData.addData(messageData.count, messageData.IotData);
      }
    } catch (err) {
      console.error(err);
    }
  };
});
