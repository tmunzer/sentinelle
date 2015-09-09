function BSSID(BSSID_Address, RSSI, payload, ieeeMAC) {
    this.BSSID_Address = BSSID_Address;
    this.associated_STA = [];
    this.OUI = this.BSSID_Address.replace(/:/g, '').substr(0, 6).toUpperCase();
    this.company = ieeeMAC[this.OUI] || "Unknown";
    this.RSSI = RSSI;

    if (payload == null) {
        this.beacon = null;
    } else {

        this.beacon = payload.beacon;
        for (var tag in payload.beacon.tags) {
            if (payload.beacon.tags[tag].hasOwnProperty("type")) {
                switch (payload.beacon.tags[tag].typeId) {
                    //SSID
                    case 0:
                        //		    console.log(payload.beacon.tags[tag].ssid);
                        this.SSID = payload.beacon.tags[tag].ssid;
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