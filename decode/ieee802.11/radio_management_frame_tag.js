function RadioManagementFrameTag () {
    this.type = undefined;
    this.typeId = undefined;
    this.length = undefined;
    this.value = undefined;
}

RadioManagementFrameTag.prototype.decode = function decode(raw_packet, offset) {
    //tag id
    this.typeId = raw_packet[offset++];

    //tag value length
    this.length = raw_packet[offset++];

    this.value = raw_packet.slice(offset, offset + this.length);

    switch(this.typeId) {
        case 0:
            this.type = "ssid";
            this.ssid = this.value.toString("utf8", 0, this.length);
            break;
        case 1:
            this.type = "rates";
            this.rates = this.decode_rates(raw_packet.slice(offset, offset + this.length));
            break;
        case 3:
            this.type = "channel";
            this.channel = raw_packet[offset];
            break;
        case 5:
            this.type = "TIM"; //Traffic Indicator Map
            break;
        case 42:
            this.type = "ERP"; //Extended Rates PHY
            break;
        case 48:
            this.type = "RSN"; //Robust Security Network
            break;
        case 50:
            this.type = "extended_rates";
            this.rates = this.decode_rates(raw_packet.slice(offset, offset + this.length));
            break;
        case 221:
            this.type = "vendor_specific";
            break;
        case 45:
            this.type = "HT_Capabilities";
            break;
        case 61:
            this.type = "HT_information";
            break;
        case 7:
            this.type = "Country";
            this.country = this.decode_country(raw_packet.slice(offset, offset + this.length));
            break;
        default:
            this.type = "unknown";
            break;
    }
    return this;
};

RadioManagementFrameTag.prototype.decode_rates = function(raw_data){
    var mask_basic = parseInt("10000000", 2);
    var mask_rate = parseInt("01111111", 2);

    var rate;
    var basic = "";
    var rates_list = [];

    for (var ii = 0; ii < raw_data.length; ii++){
        rate = raw_data.readUInt8(ii);
        //if BASIC bit set to "1"
        if (rate & mask_basic){
            basic = "(B)";
        } else {
            basic = "";
        }
        rate = (rate & mask_rate) * 0.5;
        rates_list.push(rate + basic);
    }
    return rates_list;
};

RadioManagementFrameTag.prototype.decode_country = function(raw_data){
    //TODO
    //Improve this decode function to get the channels list and parameters
    var country = raw_data.slice(0, 2);
    return country.toString("ascii", 0, country.length);
};


module.exports = RadioManagementFrameTag;