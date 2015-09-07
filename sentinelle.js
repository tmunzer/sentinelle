var EventEmitter = require("events").EventEmitter;
var sys = require("sys");
var pcap = require("./pcap");
var BSSID_template = require('./BSSID');
var STA_template = require("./STA");

var ieeeMAC = require('./ieeeMAC');
var ieeeMAC_list = null;
exports.ieeeMAC_list = ieeeMAC_list;

function SSID_template(SSID){
    this.SSID = SSID || "Unknown";
    this.BSSIDs = [];
}

function Sentinelle(capture_interface) {
    this.capture_interface = capture_interface;
    this.pcap_session = null;
    this.messenger = new EventEmitter();
    this.current_status = "stopped";

    this.BSSIDList = [];
    this.STAList = [];
    this.SSIDList = [];

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
                                var BSSID_Address = packet.payload.ieee802_11Frame.bssid.toString();
                                var BSSID = new BSSID_template(BSSID_Address, packet.payload.ieee802_11Frame, ieeeMAC_list);
                                // if the BSSID is listed into the BSSID list
                                if (that.BSSIDList.hasOwnProperty(BSSID_Address)) {
                                    //if the BSSID was added based on a data frame (not from a beacon)
                                    if (that.BSSIDList[BSSID_Address].beacon == null) {
                                        that.BSSIDList[BSSID_Address] = BSSID;
                                        that.messenger.emit('BSSID', 'new', that.BSSIDList[BSSID_Address]);
                                        if (that.SSIDList.hasOwnProperty(BSSID.SSID)){
                                            that.SSIDList[BSSID.SSID].BSSIDs.push(BSSID_Address);
                                            that.messenger.emit("SSID", 'update', that.SSIDList[BSSID.SSID]);
                                        } else {
                                            that.SSIDList[BSSID.SSID] = new SSID_template(BSSID.SSID);
                                            that.SSIDList[BSSID.SSID].BSSIDs.push(BSSID_Address);
                                            that.messenger.emit("SSID", 'new', that.SSIDList[BSSID.SSID]);
                                        }
                                    }
                                    //TODO: refresh entry if beacon info changed
                                    //if it's the first time the BSSID is seen
                                } else {
                                    that.BSSIDList[BSSID_Address] = BSSID;
                                    that.messenger.emit('BSSID', 'new', that.BSSIDList[BSSID_Address]);
                                    if (that.SSIDList.hasOwnProperty(BSSID.SSID)){
                                        that.SSIDList[BSSID.SSID].BSSIDs.push(BSSID_Address);
                                        that.messenger.emit("SSID", 'update', that.SSIDList[BSSID.SSID]);
                                    } else {
                                        that.SSIDList[BSSID.SSID] = new SSID_template(BSSID.SSID);
                                        that.SSIDList[BSSID.SSID].BSSIDs.push(BSSID_Address);
                                        that.messenger.emit("SSID", 'new', that.SSIDList[BSSID.SSID]);
                                    }
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
                        var BSSID_Address = packet.payload.ieee802_11Frame.bssid.toString();
                        var STA_Address = null;
                        if (!packet.payload.ieee802_11Frame.flags.fromDS && packet.payload.ieee802_11Frame.flags.toDS) {
                            STA_Address = packet.payload.ieee802_11Frame.transmitter_address.toString();
                        } else if (packet.payload.ieee802_11Frame.flags.fromDS && !packet.payload.ieee802_11Frame.flags.toDS) {
                            STA_Address = packet.payload.ieee802_11Frame.receiver_address.toString();
                        }
                        // remove specific MAC addresses
                        if (STA_Address != null
                                // Broadcast address
                            && STA_Address.toUpperCase().indexOf("FF:FF:FF:FF:FF:FF") != 0
                                // CDP address
                            && STA_Address.toUpperCase().indexOf("01:00:0C:CC:CC:CC") != 0
                                // Spanning Tree address
                            && STA_Address.toUpperCase().indexOf("01:80:C2:00:00:00") != 0
                                // IPv6 Multicast (starts with 33:33)
                            && STA_Address.toUpperCase().indexOf("33:33") != 0
                                // IPv4 Multicast (starts with 01:00:5E)
                            && STA_Address.toUpperCase().indexOf("01:00:5E") != 0
                                // HSRP (starts with 00:00:0c:07:ac:)
                            && STA_Address.toUpperCase().indexOf("00:00:0c:07:ac:") != 0
                                // VRRP (starts with 00:00:5E:00:01:)
                            && STA_Address.toUpperCase().indexOf("00:00:5E:00:01:") != 0
                        ) {
                            // if the
                            var STA;
                            if (that.STAList.hasOwnProperty(STA_Address)) {
                                STA = that.STAList[STA_Address];
                            } else {
                                that.STAList[STA_Address] = new STA_template(STA_Address, ieeeMAC_list);
                                STA = that.STAList[STA_Address];
                                that.messenger.emit("STA", "new", STA);
                            }
                            // if the BSSID_Address is not in the list
                            if (!that.BSSIDList.hasOwnProperty(BSSID_Address)) {
                                that.BSSIDList[BSSID_Address] = new BSSID_template(BSSID_Address, null, ieeeMAC_list);
                                that.messenger.emit("BSSID", "new", that.BSSIDList[BSSID_Address])
                            }
                            // if the station was not seen on this BSSID
                            if (that.BSSIDList[BSSID_Address].associated_STA.indexOf(STA_Address) < 0) {
                                // if the station was already associated before
                                if (STA.associated_BSSID != null) {
                                    var from_BSSID = STA.associated_BSSID;
                                    //remove it from the previous BSSID_Address and send the update to the socket
                                    removeValueFromArray(that.BSSIDList[from_BSSID], STA_Address);
                                    that.messenger.emit('BSSID', 'update', that.BSSIDList[from_BSSID]);
                                } else {
                                    that.STAList[STA_Address].associated_BSSID = BSSID_Address;
                                    that.messenger.emit("STA", "update", that.STAList[STA_Address]);
                                }
                                // add the station to this BSSID_Address and send the update to the socket
                                that.BSSIDList[BSSID_Address].associated_STA.push(STA_Address);
                                that.messenger.emit('BSSID', 'update', that.BSSIDList[BSSID_Address]);
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
                        break;
                }
            }
        );

    };
}

// Find and remove item from an array
function removeValueFromArray(array, value) {
    var i = array.indexOf(value);
    if (i != -1) {
        array.splice(i, 1);
    }
}


module.exports = Sentinelle;
