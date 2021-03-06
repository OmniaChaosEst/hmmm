"use strict";


Router.map(function () {
	this.route('courses', {
		path: 'courses',
		template: 'coursepage',
		waitOn: function () {
			return Meteor.subscribe('courses');
		},
		data: function () {
			return {
				missing_organisator: get_courselist({missing: "organisator"}).fetch(),
				missing_subscribers: get_courselist({missing: "subscribers"}),
				all_courses: get_courselist({})
			};
		},
		onAfterAction: function() {
			document.title = webpagename + 'Courselist'
		},
	})
})

/* ------------------------- Query / List ------------------------- */

// TODO: convert to lirary function or method

function get_courselist(listparameters){
	//return a course list
	var find ={};

	if (listparameters.courses_from_userid) {
		// courses where given user is member
		find['members.user'] = listparameters.courses_from_userid
	}

	if (Session.get('region')) {
		find.region = Session.get('region')
	}

	if (listparameters.missing=="organisator") {
		// show courses with no organisator
		find['members.roles'] = { $ne: 'team' }
	}

	return Courses.find(find, {sort: {time_lastedit: -1, time_created: -1}});
}


Template.course.helpers({
	participant_status: function() {
		if (this.subscribers_min < 1) return 'ontheway';
		var ratio = this.roles.participant.subscribed.length / this.subscribers_min;
		if (ratio < 0.5) return 'no';
		if (ratio >= 1) return 'yes';
		return 'ontheway';
	},
	
	requiresMentor: function() {
		return this.roles.indexOf('mentor') != -1
	},

	requiresHost: function() {
		return this.roles.indexOf('host') != -1
	},

	needsTeam: function() {
		return !hasRole(this.members, 'team')
	},

	needsMentor: function() {
		return !hasRole(this.members, 'mentor')
	},

	TneedsHost: function() {
		return !hasRole(this.members, 'host')
	},

	is_host: function() {
		return hasRoleUser(this.members, 'host', Meteor.userId())
	},

	is_team: function() {
		return hasRoleUser(this.members, 'team', Meteor.userId())
	},

	is_mentor: function() {
		return hasRoleUser(this.members, 'mentor', Meteor.userId())
	},

	coursestate: function() {

		var today = new Date();
		var upcoming = Events.find({course_id: this._id, startdate: {$gt:today}}).count() > 0
		var past = Events.find({course_id: this._id, startdate: {$lt:today}}).count() > 0

		if(upcoming || past){
			if(upcoming){
				return "hasupcomingevents"
			}else{
				return "haspastevents"
			}
		}else{
			return "proposal"
		}
	},

	donator_status: function() {
		return this.roles.donator.subscribed.length > 0 ? 'yes' : 'no'
	},

	cook_status: function() {
		return this.roles.cook.subscribed.length > 0 ? 'yes' : 'no'
	},

	is_subscriber: function() {
		return hasRoleUser(this.members, 'participant', Meteor.userId()) ? '*' : ''
	},

	is_donator: function() {
		return this.roles.donator.subscribed.indexOf(Meteor.userId()) >= 0 ? true : false
	},

	is_cook: function() {
		return this.roles.cook.subscribed.indexOf(Meteor.userId()) >= 0 ? true : false
	},

	categorynames: function() {
		return Categories.find({_id: {$in: course.categories}}).map(function(cat) { return cat.name }).join(', ')
	},


	course_eventlist: function() {
		var today= new Date();
		return Events.find({course_id: this._id, startdate: {$gt:today}}, {sort: {startdate: 1}, limit: 1});
	},


	course_eventlist_hasmore: function() {

		var today= new Date();
		var eventcount = Events.find({course_id: this._id,startdate: {$gt:today}},{sort: {startdate: 1}}).count();
		return eventcount > 1 ? (eventcount-1)  : false
	},

	hasupcomingevents: function() {

		var today= new Date();
		return Events.find({course_id: this._id, startdate: {$gt:today}},{sort: {startdate: 1}}).count() > 0

	},
})