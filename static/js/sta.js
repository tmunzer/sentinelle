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
    var bssid = bssidList[station.associatedBssid];
    var html_ap = '';
    var lock = "";
    var ssid_html = "";
    var bssid_html = "";
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
        bssid_html = "<a href=# onclick='select_tab(\"ap_details\", \"" + bssid.bssidAddress + "\")'>" +
            bssid.bssidAddress + "</a>";
    }
    if (bssid && bssid.ssid){
        ssid_html = bssid.ssid;
    }
    html_ap += '<a href=# onclick="select_tab(\'sta_details\', \'' + station.mac + '\')">'
        + "<i class='fa fa-laptop'></i> " + station.mac + "</a><br/>"
        + "Company: " + station.company + "<br/>"
        + "RSSI: " + station.rssi + "dBm<br/>"
        + "Configured SSIDs: " + station.probeRequest.length + "<br/>"
        + "SSID: <span>" + ssid_html + " <i class='fa " + lock + "'></i></span><br/>"
        + "Associated with: " + bssid_html + "<br/>"
        + "Last Update: " + station.last_update;
    if (is_new_sta) {
        html_ap += "</div>";
    }
    return html_ap;
}

function tab_sta_details(stationMac) {
    var station = stationList[stationMac];
    var ssid_html = " is not connected";
    if (station.associatedBssid != undefined){
        var bssid = bssidList[station.associatedBssid];
        ssid_html = " is connected on " + bssid.ssid
    }
    console.log(station);
    $("#nav_display_ssid").addClass("nav_selected");
    var html = "<article id='sta_details' style='float: left'>" +
        "<h2><i class='fa fa-laptop fa-lg'>" + station.mac + ssid_html + "</i></h2>" +
        "<div style='float: left; width: 100%'>" +
        "<div style='float: left; width: 50%'>" +
        "Company: " + station.company + " (" + station.oui + ")<br/>" +
        "<br/>" +
        "RSSI: " + station.rssi + "<br/>" +
        '</div>' +
        '<div>' +
        'Configured SSIDs: ' + "<span class='badge'>" + station.probeRequest.length + "</span>";
    for (var pr in station.probeRequest) {
        html += '<div>' + station.probeRequest[pr] +'</div>';
    }
    html += "</div>" +
        "</div>" +
        "<div style='float: left; width: 100%'><h3>Station Details</h3>" +
        "<div style='float: left; width: 50%'>";
    html += "</div></article>";
    return html;
}