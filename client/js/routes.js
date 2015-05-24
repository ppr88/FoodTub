Router.configure({
  layoutTemplate: 'appLayout'
});

Router.route('/', {name: 'home'}, function () {
  this.render('home');
});

Router.route('/device', function () {
  this.render('device');
});
