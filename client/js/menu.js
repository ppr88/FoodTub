if (Meteor.isClient) {
  Template.menu.helpers({
    activeStatus: function (template) {
      var currentRoute = Router.current().route.getName();
      return currentRoute &&
        template === currentRoute ? 'active' : '';
    }
  });
}
