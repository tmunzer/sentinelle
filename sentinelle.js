var app = require("./app.js");
var sys = require("sys");
var pcap = require("./pcap");


function AccessPoint(BSSID, payload) {
    this.BSSID = BSSID;
    this.beacon = payload.beacon;
    this.stations = [];

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
    var stationsList = [];


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
            switch (packet.payload.ieee802_11Frame.type) {
                // control frames
                case 0x0000:

                    switch (packet.payload.ieee802_11Frame.subType) {
                        // 802.11 association request
                        case 0x0000:
                            //console.log(sys.inspect(packet.payload.ieee802_11Frame));
                            break;
                        // 802.11 association response
                        case 0x0001:
                            //console.log(sys.inspect(packet.payload.ieee802_11Frame));
                            break;
                        // 802.11 reassociation request
                        case 0x0002:
                            //console.log(sys.inspect(packet.payload.ieee802_11Frame));
                            break;
                        // 802.11 reassociation response
                        case 0x0003:
                            //console.log(sys.inspect(packet.payload.ieee802_11Frame));
                            break;
                        // probe request
                        case 0x0004:
                            //console.log(sys.inspect(packet.payload.ieee802_11Frame));
                            break;
                        // probe response
                        case 0x0005:
                            //console.log(sys.inspect(packet.payload.ieee802_11Frame));
                            break;
                        //beacons
                        case 0x0008:
                            var BSSID = packet.payload.ieee802_11Frame.shost.addr;
                            if (!accessPointsList.hasOwnProperty(BSSID)) {
                                var accessPoint = new AccessPoint(BSSID, packet.payload.ieee802_11Frame);
                                accessPointsList[BSSID] = accessPoint;
                                app.io.sockets.emit('new_access_point', accessPoint);

                            }
                            ;
                            break;
                        // 802.11 disassociate
                        case 0x000a:
                            //console.log(sys.inspect(packet.payload.ieee802_11Frame));
                            break;
                        // 802.11 authentication
                        case 0x000b:
                            //console.log(sys.inspect(packet.payload.ieee802_11Frame));
                            break;
                        // 802.11 deauthentication
                        case 0x000c:
                            //console.log(sys.inspect(packet.payload.ieee802_11Frame));
                            break;
                    };
                    break;
                // management frames
                case 0x0001:
                    break;
                // data frames
                case 0x0002:
                    switch (packet.payload.ieee802_11Frame.subType){
                        //data
                        case 0x0000:
                            break;
                        // NULL data
                        case 0x0004:
                            break;
                        // QoS Data
                        case 0x0008:
                            if (packet.payload.ieee802_11Frame.flags.encrypted && packet.payload.ieee802_11Frame.flags.pwrMgmt){
                                console.log('this is encreypted:');
                                console.log(sys.inspect(packet.payload.ieee802_11Frame));

                            }else {
                            console.log(sys.inspect(packet.payload.ieee802_11Frame.llc));
                            }
                            break;
                    }
                    break;
            }
        });

        };

        this.get_access_points = function () {
            return accessPointsList;
        };


    }


    exports.Sentinelle = Sentinelle;

