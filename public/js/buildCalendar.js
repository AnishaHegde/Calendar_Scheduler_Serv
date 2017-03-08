var app = angular.module('myAppModule', ['ui.calendar']);
app.controller('MyController', displayCallback);

function displayCallback($scope, $rootScope, $http, $window, uiCalendarConfig){
	
	console.log("Success");
	var usersObj = JSON.parse(document.getElementById("response").innerHTML);	
	
	var user = [];
	var totalEvents = [];
	var counter = 0;
	
	// To Find hours free and busy for each user
	var totalHoursCheck = [];
	
	// Find user who is max busy and who is max free
	var maxBusyUser = "";
	var maxFreeUser = "";
	var max = 0;
	var min = 40;
	
	// Print in descending order of hours; users busy with task work and the respective hour
	var taskHours = [];
	// Print in descending order of hours; users busy with meeting and the respective hour
	var meetingHours = [];
	
	// Iterate over all users
	for(var key in usersObj){	
		
		// Create list of users
		user.push({'name': usersObj[key]['name'], 'userId':counter++});
		
		totalHoursCheck.push({
			'name'		: usersObj[key]['name'], 
			'hrsBusy'	: usersObj[key]['noOfHoursBusy'],
			'hrsFree'	: (40 - parseInt(usersObj[key]['noOfHoursBusy']))
		});	
		
		if(max <= usersObj[key]['noOfHoursBusy']){
			maxBusyUser = usersObj[key]['name'];
			max = usersObj[key]['noOfHoursBusy'];
		}
		if(min >= usersObj[key]['noOfHoursBusy']){
			maxFreeUser = usersObj[key]['name'];
			min = usersObj[key]['noOfHoursBusy'];
		}
		
		taskHours.push({'name': usersObj[key]['name'], 'hrs': usersObj[key]['noOfTaskHours']});
		
		if(usersObj[key]['noOfMeetingHours'] != 0)
			meetingHours.push({'name': usersObj[key]['name'], 'hrs': usersObj[key]['noOfMeetingHours']});
		
		// Create events list for each user
		var eventObj = usersObj[key]['events'];
		var ev = [];
		var link = "";
		
		// Iterate over each user event
		for(var i in eventObj){	
		    
			var currEvent = JSON.parse(eventObj[i]);
			//console.log(currEvent);
			
			if(currEvent.hasOwnProperty('task'))
				link = currEvent['task']['link'];
			else if(currEvent.hasOwnProperty('user'))
				link = currEvent['user']['link'];
			else
				link = "http://localhost:3000";
			
			ev.push({
				'title': currEvent.name + "-" + currEvent.type,
				'start': new Date(currEvent.start_date + " " + currEvent.start_time),
				'end': new Date(currEvent.end_date + " " + currEvent.end_time),
				'url': link,
				'allDay' : false
			});
		}//end events for loop
		
		totalEvents.push(ev);
		
	}//end users for loop
  
    
    /*----Set all scope variables---*/
    $scope.user = user;        
    $scope.totalHours = totalHoursCheck;
    
    $scope.busyUser = maxBusyUser;
    $scope.freeUser = maxFreeUser;
    $scope.maxhrs = max;
    $scope.minhrs = min;
    
    $scope.taskWorkHrs = taskHours;
    $scope.meetingHrs = meetingHours;
    
    $scope.events = [];
    $scope.eventSources = [$scope.events];
    
    $scope.getEvents = function(){
    	isFirstTime = false;
    	var empSelected = parseInt(document.getElementById("emp").value);
    	console.log(empSelected);
    	
    	$scope.setEventSource(totalEvents[empSelected]);
    	//$scope.events = totalEvents[empSelected];
        //$scope.eventSources = [$scope.events];
    	
    };

    $scope.setEventSource = function(value) {
    	// remove the event source.
    	uiCalendarConfig.calendars['myCalendar'].fullCalendar('removeEventSource', $scope.eventSource);
    	// Create the new event source url
    	$scope.eventSource = value;
    	// add the new event source.
    	uiCalendarConfig.calendars['myCalendar'].fullCalendar('addEventSource', $scope.eventSource);
    }   
    
	/* alert on eventClick */
    $scope.alertOnEventClick = function( date, jsEvent, view){
        $scope.alertMessage = (date.title + ' was clicked ');
    };
	
	$scope.uiConfig = {
      calendar:{
        height: 450,
        editable: true,
        displayEventTime: true,
        header:{
          left: 'month basicWeek basicDay agendaWeek agendaDay',
          center: 'title',
          right: 'today prev,next'
        },
        eventClick: $scope.alertEventOnClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize
      }
    };
	
}//end call back function