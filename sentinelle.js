var app = require("./app.js");
var pcap = require("./pcap"),
	pcap_session = pcap.createSession("wlan0mon");
var sys = require("sys");
var EventEmitter = require('events').EventEmitter;

var accessPointsList = new Array();


sentinelle_capture = function(){
	pcap_session.on("packet", function(raw_packet){
		var packet = pcap.decode.packet(raw_packet);
		//control frames
		if (packet.payload.ieee802_11Frame.type == 0){
			//beacons
			if (packet.payload.ieee802_11Frame.subType == 8){
				access_point(packet.payload.ieee802_11Frame);
			}
		}
		else if (packet.payload.ieee802_11Frame.type == 2){
//    console.log(sys.inspect(packet));
			console.log(sys.inspect(packet.payload.ieee802_11Frame.llc));
		}

	});
};


get_access_points = function(){
	return accessPointsList;
};

function AccessPoint (BSSID, beacon){
	this.BSSID = BSSID;
	this.beacon = beacon;
	this.SSID = "";
	this.rates = "";
	this.channel = "";
	this.extended_rates = "";
	this.country = "";
}

AccessPoint.prototype.set_SSID = function(SSID){
	this.SSID = SSID;
};
AccessPoint.prototype.set_rates = function(rates){
	this.rates = rates;
};
AccessPoint.prototype.set_channel = function(channel){
	this.channel = channel;
};
AccessPoint.prototype.set_extended_rates = function(erates){
	this.extended_rates = erates;
};
AccessPoint.prototype.set_country = function(country){
	this.country = country;
};

AccessPoint.prototype.get_BSSID = function(){
	return this.BSSID;
};
AccessPoint.prototype.get_SSID = function(){
	return this.SSID;
};
AccessPoint.prototype.get_beacon = function(){
	return this.beacon;
};
AccessPoint.prototype.get_rates = function(){
	return this.rates;
};
AccessPoint.prototype.get_channel = function(){
	return this.channel;
};
AccessPoint.prototype.get_extended_rates = function(){
	return this.extended_rates;
};
AccessPoint.prototype.get_country = function(){
	return this.country;
};

access_point = function(payload){
	var BSSID = payload.shost.addr;
	if (!accessPointsList.hasOwnProperty(BSSID)){
		var accessPoint = new AccessPoint(BSSID, payload.beacon);
		for (var tag in payload.beacon.tags) {
			if (payload.beacon.tags[tag].hasOwnProperty("type")) {
				//SSID
				if (payload.beacon.tags[tag].typeId == 0) {
					//		    console.log(payload.beacon.tags[tag].ssid);
					accessPoint.set_SSID(payload.beacon.tags[tag].ssid);
					//rates
				} else if (payload.beacon.tags[tag].typeId == 1) {
					//		    console.log(payload.beacon.tags[tag].value);
					accessPoint.set_rates(payload.beacon.tags[tag].rates);
					//channel
				} else if (payload.beacon.tags[tag].typeId == 3) {
					//		    console.log(payload.beacon.tags[tag].channel);
					accessPoint.set_channel(payload.beacon.tags[tag].channel);
					//extended rates
				} else if (payload.beacon.tags[tag].typeId == 50) {
					//		    console.log(payload.beacon.tags[tag].value);
					accessPoint.set_extended_rates(payload.beacon.tags[tag].extended_rates);

				} else if (payload.beacon.tags[tag].typeId == 7) {
					//		    console.log(payload.beacon.tags[tag].value);
					accessPoint.set_country(payload.beacon.tags[tag].country);
				}
			}
		}
		//console.log(accessPoint);
		app.io.sockets.emit('new_access_point', accessPoint);
		accessPointsList[BSSID]=accessPoint;
	}
};


exports.capture = sentinelle_capture;
exports.get_access_points = get_access_points;