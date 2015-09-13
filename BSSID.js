function BSSID(bssidAddress, rssi, payload, ieeeMAC) {
    this.bssidAddress = bssidAddress;
    this.associatedStations = [];
    this.oui = this.bssidAddress.replace(/:/g, '').substr(0, 6).toUpperCase();
    this.company = ieeeMAC[this.oui] || "Unknown";
    this.rssi = rssi;

    this.beaconInt = payload.beacon.beaconInt;
    this.capabilitiesInfo = payload.beacon.capabilitiesInfo;


    this.ssid = undefined;
    this.rates = undefined;
    this.channel = undefined;
    this.extended_rates = undefined;
    this.country = undefined;

    if (payload == null) {
        this.beacon = null;
    } else {

        this.beacon = payload.beacon;
        for (var tag in payload.beacon.tags) {
            if (payload.beacon.tags[tag].hasOwnProperty("type")) {
                switch (payload.beacon.tags[tag].typeId) {
                    //ssid
                    case 0:
                        //		    console.log(payload.beacon.tags[tag].ssid);
                        this.ssid = payload.beacon.tags[tag].ssid;
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
                    //TIM
                    case 5:
                        this.dtimPeriod = payload.beacon.tags[tag].dtimPeriod;
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

module.exports = BSSID;