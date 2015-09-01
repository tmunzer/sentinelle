var pcap = require("./pcap"),
pcap_session = pcap.createSession("wlan0mon");
var sys = require("sys");

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

var accessPointsList = [];

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
	console.log(accessPoint);
	accessPointsList[BSSID]=accessPoint;
    }
};
