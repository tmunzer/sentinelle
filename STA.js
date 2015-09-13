function STA(stationAddress, ieeeMAC) {
    this.mac = stationAddress;
    this.probeRequest = [];
    this.associatedBssid = null;
    this.oui = this.mac.replace(/:/g, '').substr(0, 6).toUpperCase();
    this.company = ieeeMAC[this.oui] || "Unknown";
    this.rssi = 0;
    this.rates = undefined;
    this.extended_rates = undefined;

}

STA.prototype.new_probe = function(payload) {
    var tags = payload.probe.tags;
    var updated = false;
    for (var tag in tags) {
        if (tags[tag].hasOwnProperty("typeId")) {
            switch (tags[tag].typeId) {
                //ssid
                case 0:
                    if (tags[tag].ssid != ""){
                        if (!this.probeRequest.hasOwnProperty(tags[tag].ssid)) {
                            this.probeRequest[tags[tag].ssid.toString()] = payload.probe.tags[tag].ssid;
                            console.log("probe " + tags[tag].ssid);
                            console.log(this);
                            updated = true;
                        }
                    }
                    break;
                //rates
                case 1:
                    //		    console.log(payload.beacon.tags[tag].value);
                    this.rates = tags[tag].rates;
                    updated = true;
                    break;
                //extended rates
                case 50:
                    //		    console.log(payload.beacon.tags[tag].value);
                    this.extended_rates = tags[tag].extended_rates;
                    updated = true;
                    break;

            }
        }
    }
    return updated;
};

module.exports = STA;