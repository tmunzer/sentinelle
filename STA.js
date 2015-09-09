function STA(STA_Address, ieeeMAC) {
    this.MAC = STA_Address;
    this.probe_requests = [];
    this.associated_BSSID = null;
    this.OUI = this.MAC.replace(/:/g, '').substr(0, 6).toUpperCase();
    this.company = ieeeMAC[this.OUI] || "Unknown";
    this.RSSI = 0;
}


module.exports = STA;