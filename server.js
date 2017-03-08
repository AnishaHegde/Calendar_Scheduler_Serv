var fs = require('fs');

var express = require("express"),
	path    = require("path");

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));


/* ----------------------------------------------Build users data------------------------------------------------------*/
//Read and parse users.json file and store in users object
var usersJSON = JSON.parse(fs.readFileSync('./json/users.json', 'utf8'));
var employees = usersJSON.result;
var users = {};

var usersMap = new Map();

for(i = 0; i < employees.length; i++){
	var user_id = employees[i].sys_id + "";
	users[user_id] = {};
	users[user_id]['name'] = employees[i].name;
	users[user_id]['user_name'] = employees[i].user_name;
	users[user_id]['noOfTaskHours'] = 0;
	users[user_id]['noOfMeetingHours'] = 0;
	users[user_id]['noOfHoursBusy'] = 0;
	users[user_id]['events'] = [];

	var dateMap = {
			"03/06/2017" : {"8":"N", "9":"N", "10":"N", "11":"N"},
			"03/07/2017" : {"8":"N", "9":"N", "10":"N", "11":"N"},
			"03/08/2017" : {"8":"N", "9":"N", "10":"N", "11":"N"},
			"03/09/2017" : {"8":"N", "9":"N", "10":"N", "11":"N"},
			"03/10/2017" : {"8":"N", "9":"N", "10":"N", "11":"N"}
	};
	
	usersMap.set(user_id, dateMap);
}


/* ----------------------------------------------Build events data------------------------------------------------------*/
//Read and parse resource_event.json file and store in events object
var eventsJSON = JSON.parse(fs.readFileSync('./json/resource_event.json', 'utf8'));
var events = eventsJSON.result;

for(i=0; i<events.length; i++){
	var user_id = events[i].user.value;
	
	// date-time timestamp
	var sdt = events[i].start_date_time;
	var edt = events[i].end_date_time;
	
	// date and time as converted from timestamp
	var sdate = retriveDateTime(sdt);
	var edate = retriveDateTime(edt);
	
	// date and time as individual elements
	var s = sdate.split(" ");
	var e = edate.split(" ");	
	
	// Calculate hours for task/meeting
	var start_date_time = new Date(Date.parse(sdate));
	var end_date_time = new Date(Date.parse(edate));
	var timeDiff = ((end_date_time - start_date_time)/(1000 * 3600));
	
	// Build map for future use in recurring task
	
	var myMap = usersMap.get(user_id);

	var start = start_date_time.getHours();
	var end = end_date_time.getHours();
	if((start >= 8 && start < 12) && (end > 8 && end <= 12)){
		for(t = 0; t < timeDiff; t++){			
			myMap[s[0]][start+t] = "Y"; 
		}	
		usersMap.set(user_id, myMap);
	}
	
	if(events[i].type == "task")
		users[user_id]['noOfTaskHours'] += timeDiff;
	else (events[i].type == "task")
		users[user_id]['noOfMeetingHours'] += timeDiff;
	
	users[user_id]['noOfHoursBusy'] += timeDiff;
	
	var event = {};
	event['type'] = events[i].type;
	event['name'] = events[i].name;
	event['task'] = events[i].task;
	event['user'] = events[i].user;
	event['start_date'] = s[0];
	event['end_date'] = e[0];
	event['start_time'] = s[1];
	event['end_time'] = e[1];
		
	users[user_id]['events'].push(JSON.stringify(event));
	
}//end for events

/*usersMap.forEach(function (item, key, mapObj) {    					
	  console.log(key.toString() + "-" + JSON.stringify(item));
}); */


// To extract date and time from given date-time string
function retriveDateTime(dateTimeFormat){
	var dateAsString = dateTimeFormat.split('', dateTimeFormat.length);
	var year = dateAsString.splice(0, 4).join('');
	var month = dateAsString.splice(0, 2).join('');
	var day = dateAsString.splice(0, 2).join('');
	var hours = dateAsString.splice(1, 2).join('');
	var minutes = dateAsString.splice(1, 2).join('');
	var seconds = dateAsString.splice(1, 2).join('');
	var date = month + '/' + day + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;
	
	return date;
}


/* ----------------------------------------------Add recurring event data------------------------------------------------------*/
// To be changed to store dates dynamically
var days = [];
days.push("03/06/2017");
days.push("03/07/2017");
days.push("03/08/2017");
days.push("03/09/2017");
days.push("03/10/2017");

for(i = 0; i < employees.length; i++){
	var user_id = employees[i].sys_id + "";	
	var dateObj = usersMap.get(user_id);
		
	for(j = 0; j < days.length; j++){
	
		if(dateObj[days[j]]['8'] == "N"){
			var event = {"type":"task", "name":"Repeating task", "start_date":days[j], "end_date":days[j], "start_time":"08:00:00", "end_time":"09:00:00"};
			users[user_id]['events'].push(JSON.stringify(event));
			users[user_id]['noOfTaskHours'] += 1;
			users[user_id]['noOfHoursBusy'] += 1;
			continue;
		}
		else if(dateObj[days[j]]["9"] == "N"){
			var event = {"type":"task", "name":"Repeating task", "start_date":days[j], "end_date":days[j], "start_time":"09:00:00", "end_time":"10:00:00"};
			users[user_id]['events'].push(JSON.stringify(event));
			users[user_id]['noOfTaskHours'] += 1;
			users[user_id]['noOfHoursBusy'] += 1;
			continue;
		}	
		else if(dateObj[days[j]]["10"] == "N"){
			var event = {"type":"task", "name":"Repeating task", "start_date":days[j], "end_date":days[j], "start_time":"10:00:00", "end_time":"11:00:00"};
			users[user_id]['events'].push(JSON.stringify(event));
			users[user_id]['noOfTaskHours'] += 1;
			users[user_id]['noOfHoursBusy'] += 1;
			continue;
		}
		else if(dateObj[days[j]]["11"] == "N"){
			var event = {"type":"task", "name":"Repeating task", "start_date":days[j], "end_date":days[j], "start_time":"11:00:00", "end_time":"12:00:00"};
			users[user_id]['events'].push(JSON.stringify(event));
			users[user_id]['noOfTaskHours'] += 1;
			users[user_id]['noOfHoursBusy'] += 1;
			continue;
		}		
	}//end for j
}// end for i

app.get('/', function(req,res){
	res.render('ViewCalendar', {'users':JSON.stringify(users)});
	//res.sendFile(path.join(__dirname+'/ViewCalendar.html'));
    //__dirname : It will resolve to your project folder.
});

app.listen(3000);
console.log("Running at Port 3000");