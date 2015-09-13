function tab_infra() {
    var html = "<article id='infra_list'><h4>Infra</h4>";
    for (var ssid in ssidList) {
        html += format_infrastructure(ssidList[ssid], true);
    }
    html += '</article>';
    return html;
}

function format_infrastructure(ssid, is_new) {
    var stationCount = 0;
    var bssidCount = ssid.bssidList.length;
    var ds = "";
    for (var bssid in ssid.bssidList) {
        var currentBssid = ssid.bssidList[bssid];
        ds += '<div id="' + currentBssid + '" style="background-color:#EEEEEE; padding-left:20px">' +
            "<a href='#' onclick='select_tab(\"ap_details\", \"" + currentBssid + "\")'>" + currentBssid + '</a>' +
            ' (' + bssidList[currentBssid].rssi + ' dBm)';
        for (var station in bssidList[currentBssid].associatedStations) {
            stationCount++;
            var currentStation = bssidList[currentBssid].associatedStations[station];
            ds += '<div id="' + currentStation + '" style="padding-left:20px">' +
                '<a href=# onclick="tab_sta_details(\'' + currentStation + '\')">' + currentStation + '</a> (' + stationList[currentStation].rssi + ' dBm)';
            ds += '</div>';
        }
        ds += '</div>';
    }

    ds = '<h4><span class="label label-primary"> ' + ssid["ssid"] + "</span>" +
        " <span class='badge'>" + bssidCount + " AP(s)</span> <span class='badge'>" + stationCount + " Station(s)</span></h4>" + ds;
    if (is_new) {
        ds = '<div data-ssid="' + ssid["ssid"] + '" id="' + ssid["ssid"] + '" class="infra_list">' + ds + '</div>';
    }
    return ds;
}
