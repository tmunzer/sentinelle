var RadioFrame = require("./radio_frame");

function PresentFieldFlags() {
    this.tsft = undefined;
    this.flags = undefined;
    this.rate = undefined;
    this.channel = undefined;
    this.fhss = undefined;
    this.signalStrength = undefined;
    this.signalNoise = undefined;
    this.lockQuality = undefined;
    this.txAttenuation = undefined;
    this.dbTxAttenuation = undefined;
    this.dbmTxPower = undefined;
    this.antenna = undefined;
    this.dbAntennaSignal = undefined;
    this.dbAntennaNoise = undefined;
    this.rxFlags = undefined;
    this.channelPlus = undefined;
    this.htInformation = undefined;
    this.ampdu = undefined;
    this.vhtInformation = undefined;
}

//flags should be a UInt32LE
PresentFieldFlags.prototype.decode = function decode (flags) {
    var r = flags;
    this.tsft = Boolean(r & 0x0001);
    this.flags = Boolean((r >> 1) & 0x0001);
    this.rate = Boolean((r >> 2) & 0x0001);
    this.channel = Boolean((r >> 3) & 0x0001);
    this.fhss = Boolean((r >> 4) & 0x0001);
    this.signalStrength = Boolean((r >> 5) & 0x0001);
    this.signalNoise = Boolean((r >> 6) & 0x0001);
    this.lockQuality = Boolean((r >> 7) & 0x0001);
    this.txAttenuation = Boolean((r >> 8) & 0x0001);
    this.dbTxAttenuation = Boolean((r >> 9) & 0x0001);
    this.dbmTxPower = Boolean((r >> 10) & 0x0001);
    this.antenna = Boolean((r >> 11) & 0x0001);
    this.dbAntennaSignal = Boolean((r >> 12) & 0x0001);
    this.dbAntennaNoise = Boolean((r >> 13) & 0x0001);
    this.rxFlags = Boolean((r >> 14) & 0x0001);
    this.channelPlus = Boolean((r >> 18) & 0x0001) ;
    this.htInformation = Boolean((r >> 19) & 0x0001);
    this.ampdu = Boolean((r >> 20) & 0x0001);
    this.vhtInformation = Boolean((r >> 21) & 0x0001);
    return this;
};

function RadioPacket(emitter) {
    this.emitter = emitter;
    this.headerRevision = undefined;
    this.headerPad = undefined;
    this.headerLength = undefined;
    this.signalStrength = undefined;
    this.frequency = undefined;
    this.antenna = undefined;
    this.ieee802_11Frame = undefined;
    this.presentFields = undefined;
    this.signalNoise = undefined;
}

RadioPacket.prototype.decode = function (raw_packet, offset) {
    var original_offset = offset;

    this.headerRevision = raw_packet[offset++];
    this.headerPad = raw_packet[offset++];
    this.headerLength = raw_packet.readUInt16LE(offset); offset += 2;

    //Present Flags
    this.presentFields = new PresentFieldFlags().decode(
        raw_packet.readUInt32LE(offset));
    offset += 4;

    //alias presentFields as it will be used a lot
    var p = this.presentFields;

    //MAC timestamp
    if(p.tsft) { offset += 8; }

    //Flags
    if(p.flags) {
    //TODO can't read flags... Always at 00
        this.headerFlags = raw_packet.readInt8(offset, true).toString(2);
        offset += 1;
    }

    if(p.rate) { offset += 1; }

    if(p.channel) {
        //Frequency
        this.frequency = raw_packet.readUInt16LE(offset);
        offset += 2;
        //channel flags are the 2 bytes after channel freq
        offset +=2;
    }

    if(p.fhss) { offset += 2; }

    if(p.signalStrength) { //in dbm
        this.signalStrength = raw_packet.readInt8(offset++);
    }

    if(p.signalNoise) { //in dbm
        this.signalNoise = raw_packet.readInt8(offset++);
    }
    if(p.lockQuality) { offset += 2; }
    if(p.txAttenuation) { offset++; }
    if(p.dbTxAttenuation) { offset += 2; }
    if(p.dbmTxPower) { offset++; }
    if(p.antenna) { 
        this.antenna = raw_packet[offset++];
    }
    if(p.dbAntennaSignal) { offset++; }
    if(p.dbAntennaNoise) { offset++; }
    if(p.rxFlags) { offset += 2; }

    offset = original_offset + this.headerLength;

    this.ieee802_11Frame = new RadioFrame(this.emitter).decode(raw_packet, offset);

    if(this.emitter) { this.emitter.emit("radio-packet", this); }
    return this;
};

module.exports = RadioPacket;
