"use strict";

Router.map(function () {
	this.route('showCourse', {
		path: 'course/:_id/:slug?',
		template: 'coursedetails',
		waitOn: function () {
			return [
				Meteor.subscribe('categories'),
				Meteor.subscribe('course', this.params._id),
				Meteor.subscribe('users'),
				Meteor.subscribe('events')
			]
		},
		data: function () {
			var course = Courses.findOne({_id: this.params._id})
			// this should not be necessary if waitOn actually waited for the course subscription to be loaded
			if (!course) return {};
			return {
				edit: !!this.params.edit,
				roleDetails: loadroles(course, this.params.enrol),
				course: course,
				subscribe: this.params.subscribe
			};
		},
		onAfterAction: function() {
			var course = Courses.findOne({_id: this.params._id})
			if (!course) return;
			document.title = webpagename + 'Course: ' + course.name
		}
	})
	this.route('showCourseWiki', {
		path: 'course/:_id/:slug/wiki',
		template: 'coursewiki',
		waitOn: function () {
			return [
				Meteor.subscribe('categories'),
				Meteor.subscribe('course', this.params._id),
				Meteor.subscribe('users'),
				Meteor.subscribe('events')
			]
		},
		data: function () {
			var course = Courses.findOne({_id: this.params._id})
			return {
				course: course
			};
		}
	})

})

function loadroles(course, enroling) {
	var userId = Meteor.userId()
	var member = getMember(course.members, userId)
	return _.reduce(Roles.find({}, {sort: {type: 1} }).fetch(), function(goodroles, roletype) {
		var role = roletype.type
		var sub = hasRoleUser(course.members, role, userId)
		if (course.roles.indexOf(role) !== -1) {
			goodroles.push({
				roletype: roletype,
				role: role,
				subscribed: !!sub,
				anonsub: sub == 'anon',
				course: course,
				enroling: enroling == role,
				comment: member.comment
			})
		}
		return goodroles;
	}, []);
}


Template.coursedetails.helpers({    // more helpers in course.roles.js
	currentUserMayEdit: function() {
		return mayEdit(Meteor.user(), this);
	}
})


Template.coursedetails.events({
	'click input.del': function () {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;}

		if (confirm("really?")) {
			Courses.remove(this._id);
			Router.go('/');
		}
	},
	'click input.edit': function () {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;
		}
		Router.go('showCourse', this, { query: {edit: 'course'} })

	}
})

