// initialization code to run on server and client at startup
Meteor.startup(function () {
  AccessToken = new Mongo.Collection("access_token");
  Devices = new Mongo.Collection("devices");
});
