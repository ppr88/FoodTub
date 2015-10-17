checkDeviceConnection = function checkDeviceConnection(deviceId, cb) {
  //get device details from particle.io API
  var options = {
    headers: {Authorization: "Bearer " + getAccessToken()}
  };
  HTTP.get("https://api.particle.io/v1/devices/" + deviceId, options, cb);
}
