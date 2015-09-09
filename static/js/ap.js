function tab_ap() {
    var html = "<article id='ap_list' style='float:left'>";
    for (var BSSID in BSSIDList){
        html += format_ap_list(BSSIDList[BSSID], true);
    }
    html += '</article>';
    return html;
}

// generate HTML code to display a new AP in the AP list
function format_ap_list(BSSID, is_new_ap) {
    var html_ap = '';
    if (is_new_ap) {
        html_ap += "<div " +
            "class='ap_list' " +
            "id='ap_" + BSSID.BSSID_Address + "' " +
            "data-bssid='" + BSSID.BSSID_Address + "' " +
            "data-ssid='" + BSSID.ssid + "' " +
            "data-company='" + BSSID.company + "' " +
            "data-rssi='" + BSSID.RSSI.toString() + "' " +
            ">";
    }
    html_ap += "BSSID: <a href='#' onclick='select_tab(\"ap_details\", \"" + BSSID.BSSID_Address + "\")'>"
        + BSSID.BSSID_Address + "</a><br>"
        + "SSID: " + BSSID.SSID + "<br>"
        + "Company: " + BSSID.company + "<br>"
        + "Channel: " + BSSID.channel + "<br>"
        + "Country: " + BSSID.country + "<br>"
        + "RSSI: " + BSSID.RSSI + "dBm<br>"
        + "Rates: " + BSSID.rates + "<br>"
        + "Extended Rates: " + BSSID.extended_rates + "<br>"
        + "Connected Stations: " + BSSID.associated_STA.length + "<br>"
        + "Raw Data: " + BSSID.beacon + "<br>"
        + "Last Update: " + BSSID.last_update;
    if (is_new_ap) {
        html_ap += "</div>";
    }
    return html_ap;
}

function tab_ap_details(BSSID_Address){
    var BSSID = BSSIDList[BSSID_Address];
    $("#nav_display_ssid").addClass("nav_selected");
    $("[id^=sort-by]").prop('disabled', true);
    var html = "<article id='ap_details'><h3>"+BSSID.BSSID_Address+"</h3>" +
        "SSID: " + BSSID.SSID + '<br>' +
                "Company: " + BSSID.company + "<br>" +
            "RSSI: " + BSSID.RSSI + "<br>" +
            "Rates: " + BSSID.rates + "<br>" +
            "Extended Rates: " + BSSID.extended_rates + "<br>" +
            "Country: " + BSSID.country + '<br>' +
            'Channel: ' + BSSID.channel + '<br>';
    html += "</article>";
    return html;
}


