function tab_sta() {
    var html = "<article id='sta_list' style='float:left'>";
    for (var station in stationList) {
        html += format_sta_list(stationList[station], true);
    }
    html += '</article>';
    return html;
}

// generate HTML code to display a new AP in the AP list
function format_sta_list(station, is_new_sta) {
    console.log(station);
    var bssid = bssidList[station.associatedBssid];
    var html_ap = '';
    var lock = "";
    var ssid = "";
    if (is_new_sta) {
        html_ap += "<div " +
            "class='ap_list' " +
            "id='" + station.mac + "' " +
            "data-mac='" + station.mac + "' " +
            "data-bssid='" + station.associatedBssid + "' " +
            "data-company='" + station.company + "' " +
            "data-rssi='" + station.rssi.toString() + "' " +
            ">";
    }
    if (station.associatedBssid == undefined) {
        lock = "fa-question";
    } else {
        if (bssid.beacon.capabilitiesInfo.privacy){
            lock = "fa-lock";
        } else {
            lock = "fa-unlock";
        }
    }
    if (bssid && bssid.ssid){
        ssid = bssid.ssid;
    }
    html_ap += "<span>" + ssid + " <i class='fa " + lock + "'></i></span><br/>"
        + "MAC Address: <a href='#' onclick='select_tab(\"sta_details\", \"" + station.mac + "\")'>"
        + station.mac + "</a><br>"
        + "Company: " + station.company + "<br>"
        + "RSSI: " + station.rssi + "dBm<br>"
        + "Configured SSIDs: " + station.probeRequest.length + "<br>"
        + "Last Update: " + station.last_update;
    if (is_new_sta) {
        html_ap += "</div>";
    }
    return html_ap;
}

function tab_sta_details(stationMac) {
    var station = stationList[stationMac];
    var bssid = bssidList[station.associatedBssid];
    console.log(station);
    $("#nav_display_ssid").addClass("nav_selected");
    var html = "<article id='sta_details' style='float: left'>" +
        "<h2><i class='fa fa-laptop fa-lg'>" + station.mac + " on " + bssid.ssid + "</i></h2>" +
        "<div style='float: left; width: 100%'>" +
        "<div style='float: left; width: 50%'>" +
        "Company: " + station.company + " (" + station.oui + ")<br>" +
        "<br>" +
        "RSSI: " + station.rssi + "<br>" +
        '</div>' +
        '<div>' +
        'Configured SSIDs: ' + "<span class='badge'>" + station.probeRequest.length + "</span>";
    for (var pr in station.probe_requests) {
        html += '<div>' + station.probe_requests[pr] +'</div>';
    }
    html += "</div>" +
        "</div>" +
        "<div style='float: left; width: 100%'><h3>Station Details</h3>" +
        "<div style='float: left; width: 50%'>";
    html += "</div></article>";
    return html;
}