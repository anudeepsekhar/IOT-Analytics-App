var sqlite3 = require('sqlite3').verbose();
var moment = require('moment');

var DATABASE_FILE = "./iot_database.db";
var DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.sssssss';

function getRandomInt(max) {
  return Math.ceil(Math.random() * max);
}

let db = new sqlite3.Database(DATABASE_FILE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('\nConnected to the analytics database.\n');
});

db.serialize(function(){
  db.run("CREATE TABLE IF NOT EXISTS telemetry_data ("+
    "ID INTEGER PRIMARY KEY AUTOINCREMENT,"+
    "count INTEGER NOT NULL,"+
    "deviceId TEXT NOT NULL,"+
    "object TEXT NOT NULL,"+
    "timestamp TEXT NULL"+
    ")"
  );
});

exports.add_data = function(data, deviceId) {
  db.serialize(function(){
    var stmt = db.prepare("INSERT INTO telemetry_data(count, deviceId, object, timestamp) VALUES(?, ?, ?, ?)")
    for(let i=0; i < data.length; i++){
      //Convert UTC timestamp to ISO timestamp ( YYYY-MM-DD HH:mm:ss.sss)
      row = data[i];
      stmt.run(row['count'], deviceId, row['object'], row['@timestamp']);
    }

    stmt.finalize();
  });;
}

exports.insert_sample_data_for_day = function(datetime){
  db.serialize(function(){
    sample_data = [
      {'count': getRandomInt(5),'sensorId': 'Camera_0','object': 'Person','@timestamp': datetime.add(-1*getRandomInt(360), 'minutes').utc().format(DATE_TIME_FORMAT)},
      {'count': getRandomInt(5),'sensorId': 'Camera_0','object': 'Car','@timestamp': datetime.add(-1*getRandomInt(360), 'minutes').utc().format(DATE_TIME_FORMAT)},
      {'count': getRandomInt(5),'sensorId': 'Camera_0','object': 'Car','@timestamp': datetime.add(-1*getRandomInt(360), 'minutes').utc().format(DATE_TIME_FORMAT)},
      {'count': getRandomInt(5),'sensorId': 'Camera_0','object': 'Bicycle','@timestamp': datetime.add(-1*getRandomInt(360), 'minutes').utc().format(DATE_TIME_FORMAT)},
      {'count': getRandomInt(5),'sensorId': 'Camera_0','object': 'Car','@timestamp': datetime.add(-1*getRandomInt(360), 'minutes').utc().format(DATE_TIME_FORMAT)},
      {'count': getRandomInt(5),'sensorId': 'Camera_0','object': 'Person','@timestamp': datetime.add(-1*getRandomInt(360), 'minutes').utc().format(DATE_TIME_FORMAT)},
      {'count': getRandomInt(5),'sensorId': 'Camera_0','object': 'Bicycle','@timestamp': datetime.add(-1*getRandomInt(360), 'minutes').utc().format(DATE_TIME_FORMAT)},
      {'count': getRandomInt(5),'sensorId': 'Camera_0','object': 'Car','@timestamp': datetime.add(-1*getRandomInt(360), 'minutes').utc().format(DATE_TIME_FORMAT)},
      {'count': getRandomInt(5),'sensorId': 'Camera_0','object': 'Car','@timestamp': datetime.add(-1*getRandomInt(360), 'minutes').utc().format(DATE_TIME_FORMAT)},
      {'count': getRandomInt(5),'sensorId': 'Camera_0','object': 'Bicycle','@timestamp': datetime.add(-1*getRandomInt(360), 'minutes').utc().format(DATE_TIME_FORMAT)},
      {'count': getRandomInt(5),'sensorId': 'Camera_0','object': 'Person','@timestamp': datetime.add(-1*getRandomInt(360), 'minutes').utc().format(DATE_TIME_FORMAT)},
    ];

    exports.add_data(sample_data, '123456');
  });
}

exports.insert_sample_data = function(){
  //Insert data for last 100 days
  for(var day=0; day<100; day++){
    var now = moment();
    now.add(-1*day, "days");
    exports.insert_sample_data_for_day(now);
  }
}

exports.total_counts = function(callback) {
  db.serialize(function(){
    const query = 'select object,sum(count) as total_count, max(timestamp) as timestamp from telemetry_data GROUP BY object';
    db.all(query, callback);
  })
}

exports.get_data = function(callback, from_time, to_time=null, group_by=null, minutes_offset="0"){
  //Expecting from_time and to_time in UTC format
  if(!to_time || to_time==''){
    to_time = moment().utc().format(DATE_TIME_FORMAT);
  }

  var time_group_string = "";
  group_by = group_by.toLowerCase();
  if(group_by == "month")
    time_group_string = "%Y-%m";
  if(group_by == "day")
    time_group_string = "%Y-%m-%d"

  var query = "";
  if(time_group_string == ""){
    query = 'select * from telemetry_data where timestamp >= "' + from_time + 
      '" and timestamp <= "' + to_time + '" order by timestamp desc';
  } else {
    query = 'select sum(count) as count, object, timestamp from telemetry_data where timestamp >= "' + 
      from_time + '" and timestamp <= "' + to_time + '" group by strftime("' + time_group_string + '", DATETIME(timestamp, "'+minutes_offset+' minutes")), object order by timestamp desc';
  }

  db.serialize(function(){
    console.log(query);
    db.all(query, callback); 
  });
}
