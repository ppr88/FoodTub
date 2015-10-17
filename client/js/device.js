Session.set("device", null);
Session.set("deviceList", null);
Session.set("accessToken", null);

getDevice = function getDevice() {
  if (Session.get("device") === null) {
    Session.set("device", Devices.findOne());
  }
  return Session.get("device");
}

getAccessToken = function getAccessToken() {
  if (Session.get("accessToken") === null) {
    Session.set("accessToken", AccessToken.findOne().accessToken);
  }
  return Session.get("accessToken");
}

if (Meteor.isClient) {
  Template.device.events({
    "submit #access-token-form": function (event) {
      event.preventDefault();
      verifyAccessToken(event.target.accessToken.value);
    },

    "click #verify-access-token": function (event, template) {
      verifyAccessToken(template.find("#access-token-input").value);
    },

    "click #button-check-connection": function (event, template) {
      checkDeviceConnectionUI(getDevice().id);
    },

    "change #select-devices": function (event, template) {
      $(".div-device-info").addClass('hidden');
      setDeviceById(template.find("#select-devices").value);
    }
  });

  Template.device.helpers({
    "accessToken": function () {
        return getAccessToken();
    },

    "devices": function () {
      if (Session.get("deviceList") !== null) {
        return Session.get("deviceList");
      }
      else {
        return Devices.find();
      }
    },

    "isDeviceSelected": function () {
      if (this.id === getDevice().id) {
        return "selected";
      }
    },

    "isButtonCheckDeviceDisabled": function () {
      if (getDevice() === null || getDevice() === undefined) {
        return "disabled";
      }
    }
  })
}

function setDeviceById(deviceId) {
  var deviceList = Session.get("deviceList");

  for (var i = 0; i < deviceList.length; i++) {
    if (deviceList[i].id === deviceId) {
      Session.set("device", deviceList[i]);
      break;
    }
  }

  persistDevice(getDevice());
}

/** Event handlers **/
function checkDeviceConnectionUI(deviceId) {
  $(".div-device-info").addClass('hidden');
  $(".device-info-spinner").removeClass("hidden");

  //get device details from particle.io API
  checkDeviceConnection(deviceId, checkDeviceConnectionCb);
}

function verifyAccessToken(accessTokenInput) {
  //get devices from particle.io API
  var options = {
    headers: {Authorization: "Bearer " + accessTokenInput}
  };
  HTTP.get("https://api.particle.io/v1/devices", options, verifyAccessTokenCb.bind(null, accessTokenInput));
}

function persistAccessToken(accessTokenInput) {
  //persist access token
  var firstDoc = AccessToken.findOne();
  if (firstDoc != null) {
    AccessToken.update(firstDoc._id, {$set: {accessToken: accessTokenInput}});
  }
  else {
    AccessToken.insert({accessToken: accessTokenInput});
  }
}

function persistDevice(device) {
  var firstDoc = Devices.findOne();
  if (firstDoc != null) {
    Devices.update(firstDoc._id, device);
  }
  else {
    Devices.insert(device);
  }
}

/** Callbacks **/
function verifyAccessTokenCb(accessTokenInput, error, result) {
  if (error === null) {
    verifyAccessTokenOk(accessTokenInput);
    Session.set("deviceList", result.data);
  }
  else {
    verifyAccessTokenFail(error)
  }
}

function verifyAccessTokenOk(accessTokenInput) {
  persistAccessToken(accessTokenInput);

  var divAccessTokenAlert = $("#div-access-token-alert");
  var selectDevices = $("#select-devices");
  var buttonCheckConnection = $("#button-check-connection");
  divAccessTokenAlert.removeClass('hidden');
  divAccessTokenAlert.removeClass("alert-danger");
  divAccessTokenAlert.addClass("alert-success");
  var alertIcon = divAccessTokenAlert.find(".glyphicon");
  var alertText = divAccessTokenAlert.find(".alert-text");
  alertIcon.removeClass("glyphicon-exclamation-sign");
  alertIcon.addClass("glyphicon-ok");
  alertText.text("Access token validated!");
  selectDevices.removeAttr('disabled');
}

function verifyAccessTokenFail(error) {
  var divAccessTokenAlert = $("#div-access-token-alert");
  var selectDevices = $("#select-devices");
  var buttonCheckConnection = $("#button-check-connection");
  divAccessTokenAlert.removeClass('hidden');
  divAccessTokenAlert.removeClass("alert-success");
  divAccessTokenAlert.addClass("alert-danger");
  var alertIcon = divAccessTokenAlert.find(".glyphicon");
  var alertText = divAccessTokenAlert.find(".alert-text");
  alertIcon.removeClass("glyphicon-ok");
  alertIcon.addClass("glyphicon-exclamation-sign");
  selectDevices.attr('disabled', 'disabled');
  try {
    var msg = JSON.parse(error.message.substr(error.message.indexOf('{')));
    alertText.text(msg.error_description);
  }
  catch (err) {
    alertText.text("Error: " + error.message);
  }
}

function checkDeviceConnectionCb(error, result) {
  $(".device-info-spinner").addClass("hidden");

  if (error !== null) {
    var divDeviceInfoAlert = $("#div-device-info-alert");
    divDeviceInfoAlert.removeClass("hidden");
    $(".div-device-info").addClass("hidden");

    try {
      var msg = JSON.parse(error.message.substr(error.message.indexOf('{')));
      divDeviceInfoAlert.find(".alert-text").text(msg.error_description);
    }
    catch (err) {
      divDeviceInfoAlert.find(".alert-text").text("Error: " + error.message);
    }
  }
  else {
    var deviceDetails = result.data;
    var divDeviceInfo = $(".div-device-info");
    divDeviceInfo.removeClass('hidden');
    $("#div-device-info-alert").addClass("hidden");

    if (deviceDetails.connected) {
      divDeviceInfo.find(".label-success").removeClass("hidden");
      divDeviceInfo.find(".label-danger").addClass("hidden");
    }
    else {
      divDeviceInfo.find(".label-success").addClass("hidden");
      divDeviceInfo.find(".label-danger").removeClass("hidden");
    }

    divDeviceInfo.find("#div-device-info-id").text(deviceDetails.id);
    divDeviceInfo.find("#div-device-info-name").text(deviceDetails.name);
    divDeviceInfo.find("#div-device-info-last-heard").text(deviceDetails.last_heard);
    divDeviceInfo.find("#div-device-info-variables").text(JSON.stringify(deviceDetails.variables));
    divDeviceInfo.find("#div-device-info-functions").text(JSON.stringify(deviceDetails.functions));
  }
}
