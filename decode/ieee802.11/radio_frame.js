var EthernetAddr = require("../ethernet_addr");
var LogicalLinkControl = require("../llc_packet");
var RadioBeaconFrame = require("./radio_beacon_frame");
var RadioProbeFrame = require("./radio_probe_frame");

function RadioFrameFlags(emitter) {
    this.emitter = emitter;
    this.raw = undefined;
    this.moreFragments = undefined;
    this.isRetry = undefined;
    this.moreData = undefined;
    this.encrypted = undefined;
    this.ordered = undefined;
}

//flags should be a uint8LE
RadioFrameFlags.prototype.decode = function decode(flags) {
    this.raw = flags;
    this.toDS = Boolean((flags >> 0) & 0x0001);
    this.fromDS = Boolean((flags >> 1) & 0x0001);
    this.moreFragments = Boolean((flags >> 2) & 0x0001);
    this.isRetry = Boolean((flags >> 3) & 0x0001);
    this.pwrMgmt = Boolean((flags >> 4) & 0x0001);
    this.moreData = Boolean((flags >> 5) & 0x0001);
    this.encrypted = Boolean((flags >> 6) & 0x0001);
    this.ordered = Boolean((flags >> 7) & 0x0001);
    return this;
};

function RadioFrame(emitter) {
    this.emitter = emitter;
    this.frameControl = undefined;
    this.version = undefined;
    this.type = undefined;
    this.subType = undefined;
    this.flags = undefined;
    this.duration = undefined;
    this.receiver_address = undefined;
    this.destination_address = undefined;
    this.transmitter_address = undefined;
    this.source_address = undefined;
    this.bssid = undefined;
    this.fragSeq = undefined;
    this.beacon = undefined;
    this.llc = undefined;
}

RadioFrame.prototype.decode = function (raw_packet, offset) {
    //Check packet length once per decode to avoid having to check it
    //everytime one parses a single value out of th buffer.
    if (raw_packet.length - offset > 24) {
//        throw "Not enough of packet left to be a RadioFrame";
//    }

        this.frameControl = raw_packet.readUInt16LE(offset, true);
        offset += 2;
        this.version = this.frameControl & 0x0003;
        this.type = (this.frameControl >> 2) & 0x0003;
        this.subType = (this.frameControl >> 4) & 0x000f;
        this.flags = new RadioFrameFlags().decode((this.frameControl >> 8) & 0xff);
        this.duration = raw_packet.readUInt16BE(offset, true);
        offset += 2;
        if (!this.flags.fromDS && !this.flags.toDS) {
            this.receiver_address = new EthernetAddr(raw_packet, offset);
            this.destination_address = new EthernetAddr(raw_packet, offset);
            offset += 6;
            this.transmitter_address = new EthernetAddr(raw_packet, offset);
            this.source_address = new EthernetAddr(raw_packet, offset);
            offset += 6;
            this.bssid = new EthernetAddr(raw_packet, offset);
            offset += 6;
        } else if (this.flags.fromDS && !this.flags.toDS) {
            this.receiver_address = new EthernetAddr(raw_packet, offset);
            this.destination_address = new EthernetAddr(raw_packet, offset);
            offset += 6;
            this.transmitter_address = new EthernetAddr(raw_packet, offset);
            this.bssid = new EthernetAddr(raw_packet, offset);
            offset += 6;
            this.source_address = new EthernetAddr(raw_packet, offset);
            offset += 6;
        } else if (!this.flags.fromDS && this.flags.toDS) {
            this.receiver_address = new EthernetAddr(raw_packet, offset);
            this.bssid = new EthernetAddr(raw_packet, offset);
            offset += 6;
            this.transmitter_address = new EthernetAddr(raw_packet, offset);
            this.source_address = new EthernetAddr(raw_packet, offset);
            offset += 6;
            this.destination_address = new EthernetAddr(raw_packet, offset);
            offset += 6;
        } else if (this.flags.fromDS && this.flags.toDS) {
            this.receiver_address = new EthernetAddr(raw_packet, offset);
            offset += 6;
            this.transmitter_address = new EthernetAddr(raw_packet, offset);
            offset += 6;
            this.destination_address = new EthernetAddr(raw_packet, offset);
            offset += 6;
            this.source_address = new EthernetAddr(raw_packet, offset);
            offset += 6;
        }
        this.fragSeq = raw_packet.readUInt16BE(offset, true);
        offset += 2;

        switch (this.type) {
            case 0:
                switch (this.subType) {
                    case 4:
                        this.probe = new RadioProbeFrame().decode(raw_packet, offset);
                        break;
                    case 8: // Beacon
                        this.beacon = new RadioBeaconFrame().decode(raw_packet, offset);
                        break;
                }
                break;
            case 2:  // Data Frame
                if (!this.flags.encrypted){
                    if (this.subType == 8){
                        offset += 2;
                    }
                    if (this.subType == 0 || this.subType == 8) { // 0 = Data 8 = QoS Data
                        this.llc = new LogicalLinkControl(this.emitter).decode(raw_packet, offset);
                    }
                }
                break;
        }
    }

    if (this.emitter) {
        this.emitter.emit("radio-frame", this);
    }
    return this;
};

module.exports = RadioFrame;
