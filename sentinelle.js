var app = require("./app.js");
var sys = require("sys");
var pcap = require("./pcap");


function AccessPoint(BSSID, payload) {
    this.BSSID = BSSID;
    this.associated_STA = [];

    if (payload == null) {
        this.beacon = null;
    } else {
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

}

function Station(MAC) {
    this.MAC = MAC;
    this.probe_requests = [];
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
                                //var STA = packet.payload.ieee802_11Frame.transmitter_address;
                                //console.log(sys.inspect(packet.payload.ieee802_11Frame));
                                break;
                            // probe response
                            case 0x0005:
                                //console.log(sys.inspect(packet.payload.ieee802_11Frame));
                                break;
                            //beacons
                            case 0x0008:
                                var BSSID = packet.payload.ieee802_11Frame.bssid.toString();
                                var accessPoint = new AccessPoint(BSSID, packet.payload.ieee802_11Frame);
                                if (accessPointsList.hasOwnProperty(BSSID)) {
                                    //if the AP was added based on a data frame (not from a beacon)
                                    if (accessPointsList[BSSID].beacon == null) {
                                        console.log("new");
                                        accessPointsList[BSSID] = accessPoint;
                                        app.io.sockets.emit('new_access_point', accessPointsList[BSSID]);
                                    }
                                    //TODO: refresh entry if beacon info changed
                                } else {
                                    accessPointsList[BSSID] = accessPoint;
                                    app.io.sockets.emit('new_access_point', accessPointsList[BSSID]);
                                }
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
                        }
                        break;
                    // management frames
                    case 0x0001:
                        break;
                    // data frames
                    case 0x0002:
                        BSSID = packet.payload.ieee802_11Frame.bssid.toString();
                        var STA = null;
                        if (!packet.payload.ieee802_11Frame.flags.fromDS && packet.payload.ieee802_11Frame.flags.toDS) {
                            STA = packet.payload.ieee802_11Frame.transmitter_address.toString();
                        } else if (packet.payload.ieee802_11Frame.flags.fromDS && !packet.payload.ieee802_11Frame.flags.toDS) {
                            STA = packet.payload.ieee802_11Frame.receiver_address.toString();
                        }
                        // remove specific MAC addresses
                        if (STA != null
                                // Broadcast address
                            && STA.toUpperCase().indexOf("FF:FF:FF:FF:FF:FF") != 0
                                // CDP address
                            && STA.toUpperCase().indexOf("01:00:0C:CC:CC:CC") != 0
                                // Spanning Tree address
                            && STA.toUpperCase().indexOf("01:80:C2:00:00:00") != 0
                                // IPv6 Multicast (starts with 33:33)
                            && STA.toUpperCase().indexOf("33:33") != 0
                                // IPv4 Multicast (starts with 01:00:5E)
                            && STA.toUpperCase().indexOf("01:00:5E") != 0
                                // HSRP (starts with 00:00:0c:07:ac:)
                            && STA.toUpperCase().indexOf("00:00:0c:07:ac:") != 0
                                // VRRP (starts with 00:00:5E:00:01:)
                            && STA.toUpperCase().indexOf("00:00:5E:00:01:") != 0
                        ) {
                            if (!accessPointsList.hasOwnProperty(BSSID)) {
                                accessPointsList[BSSID] = new AccessPoint(BSSID, null);
                            }
                            if (accessPointsList[BSSID].associated_STA.indexOf(STA) < 0) {
                                accessPointsList[BSSID].associated_STA.push(STA);
                                app.io.sockets.emit('update_access_point', accessPointsList[BSSID]);
                            }
                            switch (packet.payload.ieee802_11Frame.subType) {
                                //data
                                case 0x0000:
                                    break;
                                // NULL data
                                case 0x0004:
                                    break;
                                // QoS Data
                                case 0x0008:
                                    /*if (packet.payload.ieee802_11Frame.flags.encrypted){
                                     console.log('this is encreypted:');

                                     }else {
                                     console.log(sys.inspect(packet.payload.ieee802_11Frame.llc));
                                     }*/
                                    break;
                            }
                            break;
                        }
                }
            }
        )
        ;

    };

    this.get_access_points = function () {
        return accessPointsList;
    };


}


exports.Sentinelle = Sentinelle;

