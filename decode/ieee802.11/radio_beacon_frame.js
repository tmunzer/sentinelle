var radioUtils = require("./radio_utils");
function RadioBeaconFrame () {
    this.beaconInt = undefined;
    this.capabilitiesInfo = undefined;
    this.tags = [];
}

function CapabilitiesInfo(){
    this.ess = undefined;
    this.ibss = undefined;
    this.privacy = undefined;
    this.shortPreamble = undefined;
    this.pbcc = undefined;
    this.channelAgility = undefined;
    this.spectrumMgmt = undefined;
    this.shortSlotTime = undefined;
    this.apsd = undefined;
    this.radioMeasurement = undefined;
    this.dsssOfdm = undefined;
    this.delayedBlockAck = undefined;
    this.immediateBlockAck = undefined;
}

CapabilitiesInfo.prototype.decode = function decode(capa){
    this.ess = Boolean(capa & 0x0001);
    this.ibss = Boolean((capa >> 1) & 0x0001);
    this.pcf = Boolean((capa >> 2) & 0x0001);
    this.privacy = Boolean((capa >> 4) & 0x0001);
    this.shortPreamble = Boolean((capa >> 5) & 0x0001);
    this.pbcc = Boolean((capa >> 6) & 0x0001);
    this.channelAgility = Boolean((capa >> 7) & 0x0001);
    this.spectrumMgmt = Boolean((capa >> 8) & 0x0001);
    this.shortSlotTime = Boolean((capa >> 10) & 0x0001);
    this.apsd = Boolean((capa >> 11) & 0x0001);
    this.radioMeasurement = Boolean((capa >> 12) & 0x0001);
    this.dsssOfdm = Boolean((capa >> 13) & 0x0001);
    this.delayedBlockAck = Boolean((capa >> 14) & 0x0001);
    this.immediateBlockAck = Boolean((capa >> 15) & 0x0001);
    return this;
};

RadioBeaconFrame.prototype.decode = function decode(raw_packet, offset) {
//check if fixed parameters are present
    if (raw_packet.readInt8(offset) != 0x00) {
        //first 8 bytes a time stamp
        offset += 8;

        //2 bytes of defining the beacon interval
        this.beaconInt = raw_packet.readUInt16LE(offset);
        offset += 2;

        //2 bytes of misc compatibility info
        this.capabilitiesInfo = new CapabilitiesInfo().decode(raw_packet.readUInt16LE(offset));
        offset += 2;

        this.tags = radioUtils.parseTags(raw_packet, offset);
    }
    return this;

};

module.exports = RadioBeaconFrame;