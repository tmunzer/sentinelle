var EventEmitter = require("events").EventEmitter;
var sys = require("sys");
var pcap = require("./pcap");
var AccessPoint = require('./AccessPoint');

var ieeeMAC = require('./ieeeMAC');
var ieeeMAC_list = null;
exports.ieeeMAC_list = ieeeMAC_list;

function Station(MAC) {
    this.MAC = MAC;
    this.probe_requests = [];
    //this.company = ieeeMAC[this.MAC.replace(/:/g, '').substr(0, 6)]
}

function Sentinelle(capture_interface) {
    this.capture_interface = capture_interface;
    this.pcap_session = null;
    this.messenger = new EventEmitter();
    this.current_status = "stopped";

    this.accessPointsList = [];
    var stationsList = [];


    this.is_running = function () {
        if (this.pcap_session != null) {
            this.current_status = "running";
        } else if (ieeeMAC_list != null) {
            this.current_status = "waiting";
        } else {
            this.current_status = "loading";
        }
        this.messenger.emit("status", this.current_status);
    };

    this.init = function (start) {
        var that = this;
        this.is_running();
        ieeeMAC.init();
        ieeeMAC.messenger.on('done', function (ieee_list) {
            ieeeMAC_list = ieee_list;
            that.is_running();
            if (start) {
                that.s_start();
            }
        });

    };

    this.s_start = function () {
        if (this.current_status == "loading") {
            this.init(true);
        } else {
            this.pcap_session = pcap.createSession(this.capture_interface);
            this.sentinelle_capture();
            this.is_running();
        }
    };

    this.s_stop = function () {
        this.pcap_session.close();
        this.pcap_session = null;
        this.is_running();
    };


    this.sentinelle_capture = function () {
        var that = this;
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
                                var accessPoint = new AccessPoint(BSSID, packet.payload.ieee802_11Frame, ieeeMAC_list);
                                if (that.accessPointsList.hasOwnProperty(BSSID)) {
                                    //if the AP was added based on a data frame (not from a beacon)
                                    if (that.accessPointsList[BSSID].beacon == null) {
                                        console.log("new");
                                        that.accessPointsList[BSSID] = accessPoint;
                                        that.messenger.emit('new_access_point', that.accessPointsList[BSSID]);
                                    }
                                    //TODO: refresh entry if beacon info changed
                                } else {
                                    that.accessPointsList[BSSID] = accessPoint;
                                    that.messenger.emit('new_access_point', that.accessPointsList[BSSID]);
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
                            if (!that.accessPointsList.hasOwnProperty(BSSID)) {
                                that.accessPointsList[BSSID] = new AccessPoint(BSSID, null);
                            }
                            if (that.accessPointsList[BSSID].associated_STA.indexOf(STA) < 0) {
                                that.accessPointsList[BSSID].associated_STA.push(STA);
                                that.messenger.emit('update_access_point', that.accessPointsList[BSSID]);
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
                                    /*
                                    if (packet.payload.ieee802_11Frame.flags.encrypted) {
                                        console.log('this is encreypted:');

                                    } else {
                                        console.log(sys.inspect(packet.payload.ieee802_11Frame.llc));
                                    }
                                    ! */
                                    break;
                            }
                            break;
                        }
                }
            }
        );

    };

    this.get_access_points = function () {
        return this.accessPointsList;
    };


}


module.exports = Sentinelle;
