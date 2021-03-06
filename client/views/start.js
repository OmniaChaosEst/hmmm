
Router.map(function () {
	this.route('home', {
		path: '/',
		template: 'start',
		onBeforeAction: function() {
			// Allow setting the region in the URL by parameter '?region=Testistan'
			if (this.params.region) {
				var region = Regions.findOne({ name: this.params.region } )
				if (region) Session.set('region', region._id)
			}
		},
		waitOn: function () {
			var region = Session.get('region')
			return Meteor.subscribe('coursesFind', region, false, {});
		},
		data: function() {
			return {
				results: Courses.find()
			}
		},
		onAfterAction: function() {
			document.title = webpagename + 'Home'
		}
	})
})