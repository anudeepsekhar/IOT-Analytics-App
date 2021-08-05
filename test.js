var db = require('./scripts/db.js');
var moment = require('moment');
var DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.sssssss';

var d = moment()
d.add(-5, 'days');
d_str = d.utc().format(DATE_TIME_FORMAT);

db.get_data((err,r) => { 
  console.log(r); 
  console.log(err);
}, d_str, null, 'month');
