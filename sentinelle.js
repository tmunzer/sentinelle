var EventEmitter = require("events").EventEmitter;
var pcap = require(__dirname + "/pcap");
var BSSID_template = require(__dirname + '/lib/BSSID');
var STA_template = require(__dirname + "/lib/STA");

var Dns = require(__dirname + "/lib/dns");

var ieeeMAC = require(__dirname + '/lib/ieeeMAC');
var ieeeMAC_list = null;
exports.ieeeMAC_list = ieeeMAC_list;

function SSID_template(ssid) {
    this.ssid = ssid || "Unknown";
    this.bssidList = [];
}

function Sentinelle(capture_interface) {
    this.capture_interface = capture_interface;
    this.pcap_session = null;
    this.messenger = new EventEmitter();
    this.current_status = "stopped";

    this.bssidList = [];
    this.stationList = [];
    this.ssidList = [];

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

}

Sentinelle.prototype.sentinelle_capture = function sentinelle_capture() {
    var that = this;
    that.pcap_session.on("packet", function (raw_packet) {

        var packet = pcap.decode.packet(raw_packet);
        //control frames
        switch (packet.payload.ieee802_11Frame.type) {
            // control frames
            case 0x0000:
                decode_mgmt(that, packet);
                break;
            // management frames
            case 0x0001:
                break;
            // data frames
            case 0x0002:
                decode_data(that, packet);
                break;
        }
        //console.log('finished');
        //console.log("-----------------------");
    });
};

function decode_mgmt(that, packet) {
    var station = undefined;
    var stationAddress = "";
    var bssidAddress = "";
    var bssid = undefined;

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
            //console.log("-----------------------");
            //console.log("probe");
            stationAddress = packet.payload.ieee802_11Frame.transmitter_address.toString();
            //console.log(stationAddress);
            if (that.stationList.hasOwnProperty(stationAddress)) {
                station = that.stationList[stationAddress];
            } else {
                that.stationList[stationAddress] = new STA_template(stationAddress, ieeeMAC_list);
                station = that.stationList[stationAddress];
                that.messenger.emit("STA", "new", station);
            }
            //console.log('station retrieved');
            station.rssi = packet.payload.signalStrength;
            if (station.new_probe(packet.payload.ieee802_11Frame)) {
                that.stationList[stationAddress] = station;
                that.messenger.emit("STA", "update", station);
            }
            //console.log("finished");
            //console.log("-----------------------");
            break;
        // probe response
        case 0x0005:
            //console.log(sys.inspect(packet.payload.ieee802_11Frame));
            break;
        //beacons
        case 0x0008:
            //console.log(packet.payload);
            bssidAddress = packet.payload.ieee802_11Frame.bssid.toString();
            bssid = new BSSID_template(bssidAddress, packet.payload.signalStrength
                , packet.payload.ieee802_11Frame, ieeeMAC_list);
            // if the BSSID is listed into the BSSID list
            if (that.bssidList.hasOwnProperty(bssidAddress)) {
                //if the BSSID was added based on a data frame (not from a beacon)
                if (that.bssidList[bssidAddress].beacon == undefined) {
                    that.bssidList[bssidAddress] = bssid;
                    that.messenger.emit('BSSID', 'new', that.bssidList[bssidAddress]);
                    if (that.ssidList.hasOwnProperty(bssid.ssid)) {
                        that.ssidList[bssid.ssid].bssidList.push(bssidAddress);
                        that.messenger.emit("SSID", 'update', that.ssidList[bssid.ssid]);
                    } else {
                        that.ssidList[bssid.ssid] = new SSID_template(bssid.ssid);
                        that.ssidList[bssid.ssid].bssidList.push(bssidAddress);
                        that.messenger.emit("SSID", 'new', that.ssidList[bssid.ssid]);
                    }
                }
                //TODO: refresh entry if beacon info changed
                //if it's the first time the BSSID is seen
            } else {
                that.bssidList[bssidAddress] = bssid;
                that.messenger.emit('BSSID', 'new', that.bssidList[bssidAddress]);
                if (that.ssidList.hasOwnProperty(bssid.ssid)) {
                    that.ssidList[bssid.ssid].bssidList.push(bssidAddress);
                    that.messenger.emit("SSID", 'update', that.ssidList[bssid.ssid]);
                } else {
                    that.ssidList[bssid.ssid] = new SSID_template(bssid.ssid);
                    that.ssidList[bssid.ssid].bssidList.push(bssidAddress);
                    that.messenger.emit("SSID", 'new', that.ssidList[bssid.ssid]);
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
}

function decode_data(that, packet) {
    var station = undefined;
    var stationAddress = "";
    var bssidAddress = "";
    var rssi = undefined;
    //console.log("-----------------------");
    //console.log("data frame");
    bssidAddress = packet.payload.ieee802_11Frame.bssid.toString();
    if (!packet.payload.ieee802_11Frame.flags.fromDS && packet.payload.ieee802_11Frame.flags.toDS) {
        stationAddress = packet.payload.ieee802_11Frame.transmitter_address.toString();
        rssi = packet.payload.signalStrength;
    } else if (packet.payload.ieee802_11Frame.flags.fromDS && !packet.payload.ieee802_11Frame.flags.toDS) {
        stationAddress = packet.payload.ieee802_11Frame.receiver_address.toString();
    }
    //console.log("test MAC Address " + stationAddress);
    // remove specific MAC addresses
    if (stationAddress != undefined
        && stationAddress != null
            // Broadcast address
        && stationAddress.toUpperCase().indexOf("FF:FF:FF:FF:FF:FF") != 0
            // CDP address
        && stationAddress.toUpperCase().indexOf("01:00:0C:CC:CC:CC") != 0
            // Spanning Tree address
        && stationAddress.toUpperCase().indexOf("01:80:C2:00:00:00") != 0
            // IPv6 Multicast (starts with 33:33)
        && stationAddress.toUpperCase().indexOf("33:33") != 0
            // IPv4 Multicast (starts with 01:00:5E)
        && stationAddress.toUpperCase().indexOf("01:00:5E") != 0
            // HSRP (starts with 00:00:0c:07:ac:)
        && stationAddress.toUpperCase().indexOf("00:00:0c:07:ac:") != 0
            // VRRP (starts with 00:00:5E:00:01:)
        && stationAddress.toUpperCase().indexOf("00:00:5E:00:01:") != 0
    ) {
        //console.log("looking for the station");
        // if the
        if (that.stationList.hasOwnProperty(stationAddress)) {
            station = that.stationList[stationAddress];
        } else {
            that.stationList[stationAddress] = new STA_template(stationAddress, ieeeMAC_list);
            station = that.stationList[stationAddress];
            that.messenger.emit("STA", "new", station);
        }
        //console.log("set RSSI");
        if (rssi != undefined) {
            station.rssi = rssi;
        }
        //console.log("looking for the BSSID");
        // if the bssidAddress is not in the list
        if (!that.bssidList.hasOwnProperty(bssidAddress)) {
            that.bssidList[bssidAddress] = new BSSID_template(bssidAddress, 0, null, ieeeMAC_list);
            that.messenger.emit("BSSID", "new", that.bssidList[bssidAddress])
        }
        //console.log("add the station to the BSSID");
        // if the station was not seen on this BSSID
        if (that.bssidList[bssidAddress].associatedStations.indexOf(stationAddress) < 0) {
            // if the station was already associated before
            if (station.associatedBssid != null) {
                var from_BSSID = station.associatedBssid;
                //remove it from the previous bssidAddress and send the update to the socket
                removeValueFromArray(that.bssidList[from_BSSID], stationAddress);
                that.messenger.emit('BSSID', 'update', that.bssidList[from_BSSID]);
            } else {
                that.stationList[stationAddress].associatedBssid = bssidAddress;
                that.messenger.emit("STA", "update", that.stationList[stationAddress]);
            }
            // add the station to this bssidAddress and send the update to the socket
            that.bssidList[bssidAddress].associatedStations.push(stationAddress);
            that.messenger.emit('BSSID', 'update', that.bssidList[bssidAddress]);
        }
        if (! packet.payload.ieee802_11Frame.flags.encrypted) {
            switch (packet.payload.ieee802_11Frame.subType) {
                //Data || QoS Data
                case 0x0000:
                    decode_llc(that, station, packet);
                    break;
                // NULL Data
                case 0x0004:
                    break;
                case 0x0008:
                    decode_llc(that, station, packet);
                    break;
            }
        }
    }
}

function decode_llc(that, station, packet){
    var ip_packet = packet.payload.ieee802_11Frame.llc.ipv4;
    if (ip_packet != undefined){
    switch (ip_packet.protocol){
        //ICMP
        case 1:
            break;
        //TCP
        case 6:
            break;
        //UDP
        case 17:
            if (ip_packet.udp.dport == 53){
                for (var req_id in ip_packet.udp.dns.question.rrs){
                    var dns_request = Dns.decode_dns(ip_packet.udp.dns.question.rrs[req_id]);
                    if (station.dnsRequest.indexOf(dns_request) < 0){
                        station.dnsRequest.push(dns_request);
                        console.log(dns_request);
                    }
                }
            //} else if (packet.payload.ieee802_11Frame.llc.ipv4.udp.sport == 53){
            //    console.log(packet.payload.ieee802_11Frame.llc.ipv4.udp.dns);
            }
            break;
    }
    }
}

// Find and remove item from an array
function removeValueFromArray(array, value) {
    var i = array.indexOf(value);
    if (i != -1) {
        array.splice(i, 1);
    }
}


module.exports = Sentinelle;
