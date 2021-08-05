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

  var options = {
    series: [], 
    noData: {
      text: 'Loading...'
    },
    chart: {
      type: 'area',
      stacked: false,
      height: 280,
      zoom: {
        type: 'x',
        enabled: true,
        autoScaleYaxis: true
      },
      toolbar: {
        autoSelected: 'zoom'
      }
    },
    dataLabels: {
      enabled: false
    },
    markers: {
      size: 0,
    },
    title: {
      text: 'Vehicle Movement',
      align: 'left'
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 90, 100]
      },
    },
    yaxis: {
      title: {
        text: 'Count'
      },
    },
    xaxis: {
      type: 'datetime',
    },
    tooltip: {
      shared: false
    }
  };

  var chart = new ApexCharts(document.querySelector("#chart1"), options);
  chart.render();

  const trackedDevices = new TrackedDevices();

  function update_data() {
    class_names = ["car", "person", "bicycle"];
    var time_date_format = 'YYYY-MM-DDTHH:mm:ss.sssssss';

    //Get aggregated data for two months
    var date = new Date();
    var minutes_offset = -1*date.getTimezoneOffset();
    var now = moment()
    var from_time = now.subtract(1,'months').startOf('month').utc().format(time_date_format);
    var post_data = {
      'from_time' : from_time,
      'group_by' : 'month',
      'minutes_offset' : minutes_offset
    };

    $.post('/get_data', post_data, function(data){
      console.log(data);
      var cards_data = {};
      for(var i=0; i<data.length; i++){
        const month_str = moment.utc(data[i]['timestamp']).local().format('YYYYMM');
        var object = data[i].object
        if (!( object in cards_data)) cards_data[object] = {};
        cards_data[object][ month_str] = data[i]['count'];
      }

      var cmonth_str = moment().format('YYYYMM');
      var pmonth_str = moment().subtract(1, 'months').format('YYYYMM');

      var objects = Object.keys(cards_data);
      for ( var i=0; i<objects.length; i++){
        var object = objects[i];

        var cmonth_count = 0;
        var pmonth_count = 0;
        if(cmonth_str in cards_data[object]){
          cmonth_count = Number(cards_data[object][cmonth_str]);
        }
        if(pmonth_str in cards_data[object]){
          pmonth_count = Number(cards_data[object][pmonth_str]);
        }

        var html = '<i class="bx"></i> NA';
        if(pmonth_count != 0){
          percentage = (cmonth_count - pmonth_count)*100/pmonth_count
          percentage = percentage.toFixed(2);
          if( percentage < 0 ){
            percentage = (-1*percentage);
            html = '<i class="bx bxs-down-arrow"></i> '+percentage.toString()+'%';
          } else {
            html = '<i class="bx bxs-up-arrow"></i> '+percentage.toString()+'%';
          }
        }

        const count_elm = document.querySelector("."+object.toLowerCase()+"_count");
        count_elm.innerText = cmonth_count.toString();

        const text_elm = document.querySelector("."+object.toLowerCase()+"_text");
        text_elm.innerHTML = html;
      }

      console.log(cards_data);
    });


    from_time = now.subtract(10,'days').startOf('day').utc().format(time_date_format);
    post_data = {
      'from_time' : from_time,
      'group_by' : 'day',
      'minutes_offset' : minutes_offset
    };

    $.post('/get_data', post_data, function(data){
      var temp_data = {};
      for(var i=0; i<data.length; i++){
        const day_str = moment.utc(data[i]['timestamp']).local().format('YYYYMMDD');
        var object = data[i].object
        if (!( object in temp_data)) temp_data[object] = {};
        temp_data[object][day_str] = Number(data[i]['count']);
      }

      var objects = Object.keys(temp_data);
      var graphs_data = {};

      var cur_time = moment();
      for(var i=0; i<10; i++){
        cur_time.subtract(i, 'days');
        var day_str = cur_time.format('YYYYMMDD');
        var unix_time_stamp = Number(cur_time.format('x'));

        for(var o=0; o < objects.length; o++){
          var object = objects[o];
          if (!( object in graphs_data)) graphs_data[object] = [];
          if( day_str in temp_data[object] ){
            graphs_data[object].push([ unix_time_stamp, temp_data[object][day_str] ]);
          } else {
            graphs_data[object].push([ unix_time_stamp, 0]);
          }
        }
      }
      
      var series_data = [];
      for(var i=0; i<objects.length; i++){
        var object = objects[i];
        series_data.push({
          'name' : object,
          'data' : graphs_data[object] 
        });
      }

      chart.updateSeries(series_data);
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
