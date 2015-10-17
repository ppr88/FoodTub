/** Template **/

Template.home.onRendered(setPollingFunctions);
Template.home.onDestroyed(clearPollingFunctions);




/** UI **/

function setDeviceStatusLabel(deviceConnected) {
  var divDeviceInfo = $("#div-device-status");
  divDeviceInfo.find(".label-default").addClass("hidden");
  if (deviceConnected) {
    divDeviceInfo.find(".label-success").removeClass("hidden");
    divDeviceInfo.find(".label-danger").addClass("hidden");
  }
  else {
    divDeviceInfo.find(".label-success").addClass("hidden");
    divDeviceInfo.find(".label-danger").removeClass("hidden");
  }
}




/** Polling **/

function pingDevice() {
  console.log("pingDevice");
  checkDeviceConnection(getDevice().id, pingDeviceCb);
}
function pingDeviceCb(error, result) {
  if (error != null) {
    setDeviceStatusLabel(false);
  }
  else {
    setDeviceStatusLabel(result.data.connected);
  }
}

//list of polling functions
var pollingList = [
  {method: pingDevice, interval: 5000, id: 0}
]

function setPollingFunctions() {
  var arrayLength = pollingList.length;
  for (var i = 0; i < arrayLength; i++) {
    pollingList[i].id = Meteor.setInterval(pollingList[i].method, pollingList[i].interval);
  }
}

function clearPollingFunctions() {
  var arrayLength = pollingList.length;
  for (var i = 0; i < arrayLength; i++) {
    Meteor.clearInterval(pollingList[i].id);
  }
}
