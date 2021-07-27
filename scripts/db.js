var sqlite3 = require('sqlite3').verbose();
var moment = require('moment');

var DATABASE_FILE = "./iot_database.db";
var DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.sssssss';

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

exports.insert_sample_data = function(){
    db.serialize(function(){
        var now = moment();
        now.add(-11, 'minutes');

        sample_data = [
            {'count': 2,'sensorId': 'Camera_0','object': 'Person','@timestamp': now.add(1, 'minutes').utc().format(DATE_TIME_FORMAT)},
            {'count': 3,'sensorId': 'Camera_0','object': 'Car','@timestamp': now.add(1, 'minutes').utc().format(DATE_TIME_FORMAT)},
            {'count': 1,'sensorId': 'Camera_0','object': 'Car','@timestamp': now.add(1, 'minutes').utc().format(DATE_TIME_FORMAT)},
            {'count': 4,'sensorId': 'Camera_0','object': 'Bicycle','@timestamp': now.add(1, 'minutes').utc().format(DATE_TIME_FORMAT)},
            {'count': 2,'sensorId': 'Camera_0','object': 'Car','@timestamp': now.add(1, 'minutes').utc().format(DATE_TIME_FORMAT)},
            {'count': 1,'sensorId': 'Camera_0','object': 'Person','@timestamp': now.add(1, 'minutes').utc().format(DATE_TIME_FORMAT)},
            {'count': 3,'sensorId': 'Camera_0','object': 'Bicycle','@timestamp': now.add(1, 'minutes').utc().format(DATE_TIME_FORMAT)},
            {'count': 1,'sensorId': 'Camera_0','object': 'Car','@timestamp': now.add(1, 'minutes').utc().format(DATE_TIME_FORMAT)},
            {'count': 4,'sensorId': 'Camera_0','object': 'Car','@timestamp': now.add(1, 'minutes').utc().format(DATE_TIME_FORMAT)},
            {'count': 3,'sensorId': 'Camera_0','object': 'Bicycle','@timestamp': now.add(1, 'minutes').utc().format(DATE_TIME_FORMAT)},
            {'count': 2,'sensorId': 'Camera_0','object': 'Person','@timestamp': now.add(1, 'minutes').utc().format(DATE_TIME_FORMAT)},
        ];

        exports.add_data(sample_data, '123456');
    });
}

exports.total_counts = function(callback) {
    db.serialize(function(){
        const query = 'select object,sum(count) as total_count, max(timestamp) as timestamp from telemetry_data GROUP BY object';
        db.all(query, callback);
    })
}

exports.get_data = function(callback, from_time, to_time=null){
    //Expecting from_time and to_time in UTC format
    if(!to_time || to_time==''){
        to_time = moment().utc().format(DATE_TIME_FORMAT);
    }

    db.serialize(function(){
        const query = 'select * from telemetry_data order by timestamp where timestamp >= ' + 
                    from_time + ' and timestamp <= ' + to_time + ' order by timestamp desc';
        db.run(query, callback); 
    });
}