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
            this.rates = this.decode_rates(this.value);
            break;
        case 3:
            this.type = "channel";
            this.channel = raw_packet[offset];
            break;
        case 5:
            this.type = "TIM"; //Traffic Indicator Map
            this.dtimPeriod = this.decode_DTIM(this.value);
            break;
        case 32:
            this.type = "power_constraint"; //802.11h
            break;
        case 33:
            this.type = "mobility_domain"; //802.11r
            break;
        case 42:
            this.type = "ERP"; //Extended Rates PHY
            break;
        case 48:
            this.type = "RSN"; //Robust Security Network
            this.capabilities = this.decode_capabilities(this.value);
            break;
        case 50:
            this.type = "extended_rates";
            this.extended_rates = this.decode_rates(this.value);
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
            this.country = this.decode_country(this.value);
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

RadioManagementFrameTag.prototype.decode_DTIM= function(raw_data) {
    var offset = 0;

    //skip DTIM count
    offset += 1;
    var dtimPeriod = parseInt(raw_data.slice(offset , offset + 1).toString('hex'));

    return dtimPeriod;
};

RadioManagementFrameTag.prototype.decode_capabilities = function(raw_data) {
    var offset = 0;
    var rsn_ver = parseInt(raw_data.slice(offset , offset + 1).toString('hex'));

    offset = offset + 2;
    var group_cipher_suite_type = raw_data.slice(offset , offset + 4).toString('hex');

    offset = offset + 4;
    var pairwise_cipher_suite_count = parseInt(raw_data.slice(offset, offset + 1).toString('hex'));

    offset = offset + 2;
    var pairwise_cipher_suite_list = [];
    for (var ii = 0; ii < pairwise_cipher_suite_count; ii++){
        pairwise_cipher_suite_list.push(raw_data.slice(offset, offset + 4 ).toString('hex'));
        offset = offset + 4;
    }
    var auth_key_mgmt_count = parseInt(raw_data.slice(offset, offset + 1).toString('hex'));

    offset = offset + 2;
    var auth_key_mgmt_list = [];
    for (var ii = 0; ii < auth_key_mgmt_count; ii++) {
        auth_key_mgmt_list.push(raw_data.slice(offset, offset + 4 ).toString('hex'));
        offset = offset + 4;
    }
    var rsn_capabilities = raw_data.slice(offset, offset + 2).toString('hex');
    return {'version':rsn_ver, 'group_cipher_suite_type': group_cipher_suite_type,
    'pairwise_cipher_suite_count': pairwise_cipher_suite_count, 'pairwise_cipher_suite_list': pairwise_cipher_suite_list,
    'auth_key_mgmt_count': auth_key_mgmt_count, 'auth_key_mgmt_list': auth_key_mgmt_list,
    'rsn_capabilities': rsn_capabilities};
};

RadioManagementFrameTag.prototype.decode_country = function(raw_data){
    //TODO
    //Improve this decode function to get the channels list and parameters
    var country = raw_data.slice(0, 2);
    return country.toString();
};

RadioManagementFrameTag.prototype.decode_htCapabilities = function(raw_data){
    var offset = 0;
    var htCapabilitiesInfo = undefined;
    var i = raw_data.readUInt16LE(offset);
    htCapabilitiesInfo.ldpcCodingCapabilities = Boolean(i & 0x0001);
    htCapabilitiesInfo.supportChannelWidth = Boolean((i >> 1) & 0x0001);
    htCapabilitiesInfo.smPowerSave = ((i >> 2) & 0x0011).toString(16);
    htCapabilitiesInfo.greenField = Boolean((i >> 4) & 0x0001);
    htCapabilitiesInfo.shortGI20 = Boolean((i >> 5) & 0x0001);
    htCapabilitiesInfo.shortGI40 = Boolean((i >> 6) & 0x0001);
    htCapabilitiesInfo.txStbc = Boolean((i >> 7) & 0x0001);
    htCapabilitiesInfo.rxStbc = ((i >> 8) & 0x0011).toString(16);
    htCapabilitiesInfo.delayedBlockAck = Boolean((i >> 10) & 0x0001);
    htCapabilitiesInfo.maxAmsduLength = Boolean((i >> 11) & 0x0001);
    htCapabilitiesInfo.dsssCCK = Boolean((i >> 12) & 0x0001);
    htCapabilitiesInfo.psmp = Boolean((i >> 13) & 0x0001);
    htCapabilitiesInfo.fortyMHzIntolerent = Boolean((i >> 14) & 0x0001);
    htCapabilitiesInfo.lSigTxopProtection = Boolean((i >> 715) & 0x0001);
    offset += 2;
    //TODO - currently skipping AMPDU parameters
    offset += 1;
    return htCapabilitiesInfo;
};


module.exports = RadioManagementFrameTag;