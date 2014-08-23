"use strict";

Meteor.publish ('course', function(courseId){
	return Courses.find({_id: courseId});
});

Meteor.publish ('coursesFind', function(region, query, filter){
	var find = {}
	if (region != 'all') find.region = region
	if (filter.hasUpcomingEvent) {
		var future_events = Events.find({startdate: {$gt: new Date()}}).fetch()
		var course_ids_with_future_events = _.pluck(future_events, 'course_id')
		find._id = { $in: _.uniq(course_ids_with_future_events) }
	}
	if (query) {
		var searchTerms = query.split(/\s+/);
		var searchQueries = _.map(searchTerms, function(searchTerm) {
			return { $or: [
				{ name: { $regex: escapeRegex(searchTerm), $options: 'i' } },
				{ description: { $regex: escapeRegex(searchTerm), $options: 'i' } }
			] }
		});

		find.$and = searchQueries;
	}
	var options = { limit: 40 };
	return Courses.find(find, options);
});

Meteor.publish ('categories', function(){
	return Categories.find();
});

Meteor.publish ('votings', function(){
	return Votings.find();
});

Meteor.publish ('roles', function(){
	return Roles.find();
});

Meteor.publish ('regions', function(){
	return Regions.find();
});

Meteor.publish ('messages', function(){
	return Messages.find();
});

Meteor.publish ('locations', function(){
	return Locations.find();
});

Meteor.publish ('discussions', function(courseId){
	var query = {course_ID: courseId};
	return CourseDiscussions.find(query);
});


Meteor.publish ('events', function(){
	return Events.find();
});

/*
Meteor.publish ('comments', function(){
	return CourseComments.find();
});
*/

//tried this, for publishing the users
Meteor.publish ('users', function(){
	return Meteor.users.find({}, {
		fields: {username: 1}
	});

});

Meteor.publish('currentUser', function() {
  var user = Meteor.users.find(this.userId);
  return user;
});
