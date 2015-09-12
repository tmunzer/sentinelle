function tab_infra() {
    var html = "<article id='infra_list' >";
    for (var SSID in SSIDList) {
        html += format_infrastructure(SSIDList[SSID], true);
    }
    html += '</article>';
    return html;
}

function format_infrastructure(SSID, is_new) {
    var STA_count = 0;
    var BSSID_count = SSID.BSSIDs.length;
    var ds = "";
    for (var BSSID in SSID.BSSIDs) {
        var current_BSSID = SSID.BSSIDs[BSSID];
        ds += '<div id="' + current_BSSID + '" style="background-color:#EEEEEE; padding-left:20px">' +
            "<a href='#' onclick='select_tab(\"ap_details\", \"" + current_BSSID + "\")'>" + current_BSSID + '</a>' +
            ' (' + BSSIDList[current_BSSID].RSSI + ' dBm)';
        for (var STA in BSSIDList[current_BSSID].associated_STA) {
            STA_count++;
            var current_STA = BSSIDList[current_BSSID].associated_STA[STA];
            ds += '<div id="' + current_STA + '" style="padding-left:20px">' +
                current_STA + ' (' + STAList[current_STA].RSSI + ' dBm)';
            ds += '</div>';
        }
        ds += '</div>';
    }

    ds = '<h4><span class="label label-primary"> ' + SSID["SSID"] + "</span>" +
        " <span class='badge'>" + BSSID_count + " AP(s)</span> <span class='badge'>" + STA_count + " Station(s)</span></h4>" + ds;
    if (is_new) {
        ds = '<div data-ssid="' + SSID["SSID"] + '" id="' + SSID["SSID"] + '" class="infra_list">' + ds + '</div>';
    }
    return ds;
}
