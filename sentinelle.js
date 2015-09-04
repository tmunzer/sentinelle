var app = require("./app.js");
var sys = require("sys");
var pcap = require("./pcap");


function AccessPoint(BSSID, payload) {
    this.BSSID = BSSID;
    this.beacon = payload.beacon;

    for (var tag in payload.beacon.tags) {
        if (payload.beacon.tags[tag].hasOwnProperty("type")) {
            switch (payload.beacon.tags[tag].typeId) {
                //SSID
                case 0:
                    //		    console.log(payload.beacon.tags[tag].ssid);
                    this.SSID = payload.beacon.tags[tag].ssid;
                    break;
                //rates
                case 1:
                    //		    console.log(payload.beacon.tags[tag].value);
                    this.rates = payload.beacon.tags[tag].rates;
                    break;
                //channel
                case 3:
                    //		    console.log(payload.beacon.tags[tag].channel);
                    this.channel = payload.beacon.tags[tag].channel;
                    break;
                //extended rates
                case 50:
                    //		    console.log(payload.beacon.tags[tag].value);
                    this.extended_rates = payload.beacon.tags[tag].extended_rates;
                    break;
                case 7:
                    //		    console.log(payload.beacon.tags[tag].value);
                    this.country = payload.beacon.tags[tag].country;
                    break;
            }
        }
    }
}


function Sentinelle(capture_interface) {

    this.capture_interface = capture_interface;
    this.pcap_session = null;
    var accessPointsList = [];

    this.is_running = function () {
        if (this.pcap_session != null) {
            return true;
        } else {
            return false;
        }
    };

    this.s_start = function () {
        this.pcap_session = pcap.createSession(this.capture_interface);
        this.sentinelle_capture();
return this.is_running()
    };
    this.s_stop = function () {
        this.pcap_session.close();
        this.pcap_session = null;
        return this.is_running()
    };


    this.sentinelle_capture = function () {
        this.pcap_session.on("packet", function (raw_packet) {
            var packet = pcap.decode.packet(raw_packet);
            //control frames
            if (packet.payload.ieee802_11Frame.type == 0) {
                //beacons
                if (packet.payload.ieee802_11Frame.subType == 8) {
                    var BSSID = packet.payload.ieee802_11Frame.shost.addr;
                    if (!accessPointsList.hasOwnProperty(BSSID)) {
                        var accessPoint = new AccessPoint(BSSID, packet.payload.ieee802_11Frame);
                        accessPointsList[BSSID] = accessPoint;
                        app.io.sockets.emit('new_access_point', accessPoint);

                    }
                }
            } else if (packet.payload.ieee802_11Frame.type == 2) {
//    console.log(sys.inspect(packet));
                console.log(sys.inspect(packet.payload.ieee802_11Frame.llc));
            }

        });

    };

    this.get_access_points = function () {
        return accessPointsList;
    };


}


exports.Sentinelle = Sentinelle;

