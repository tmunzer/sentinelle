function tab_ap() {
    var html = "<article id='ap_list' style='float:left'>";
    for (var bssid in bssidList) {
        html += format_ap_list(bssidList[bssid], true);
    }
    html += '</article>';
    return html;
}

// generate HTML code to display a new AP in the AP list
function format_ap_list(bssid, is_new_ap) {
    //console.log(BSSID);
    var html_ap = '';
    var lock = "";
    if (is_new_ap) {
        html_ap += "<div " +
            "class='ap_list' " +
            "id='" + bssid.bssidAddress + "' " +
            "data-bssid='" + bssid.bssidAddress + "' " +
            "data-ssid='" + bssid.ssid + "' " +
            "data-company='" + bssid.company + "' " +
            "data-rssi='" + bssid.rssi.toString() + "' " +
            ">";
    }
    if (bssid.beacon.capabilitiesInfo.privacy){
         lock = "fa-lock";
    } else {
         lock = "fa-unlock";
    }
    html_ap += "<span>" + bssid.ssid + " <i class='fa " + lock + "'></i></span><br/>"
        + "BSSID: <a href='#' onclick='select_tab(\"ap_details\", \"" + bssid.bssidAddress + "\")'>"
        + bssid.bssidAddress + "</a><br>"
        + "Company: " + bssid.company + "<br>"
        + "Channel: " + bssid.channel + "<br>"
        + "Country: " + bssid.country + "<br>"
        + "RSSI: " + bssid.rssi + "dBm<br>"
        + "Rates: " + bssid.rates + "<br>"
        + "Extended Rates: " + bssid.extended_rates + "<br>"
        + "Connected Stations: " + bssid.associatedStations.length + "<br>"
        + "Last Update: " + bssid.last_update;
    if (is_new_ap) {
        html_ap += "</div>";
    }
    return html_ap;
}

function tab_ap_details(bssidAddress) {
    var bssid = bssidList[bssidAddress];
    //console.log(BSSID);
    var html = "<article id='ap_details' style='float: left'>" +
        "<h2><i class='fa fa-wifi fa-lg'>" + bssid.ssid + " on " + bssid.bssidAddress + "</i></h2>" +
        "<div style='float: left; width: 100%'>" +
            "<div style='float: left; width: 50%'>" +
            "Company: " + bssid.company + " (" + bssid.oui + ")<br>" +
            "<br>" +
            "RSSI: " + bssid.RSSI + "<br>" +
            'Channel: ' + bssid.channel +
            '</div>' +
            '<div>' +
            'Associated Stations: ' + "<span class='badge'>" + bssid.associatedStations.length + "</span>";
    for (var station in bssid.associatedStations) {
        var currentStation = bssid.associatedStations[station];
        html += '<div id="' + currentStation + '" style="padding-left:20px">' +
            "<a href='#' onclick='select_tab(\"sta_details\", \"" + currentStation + "\")'>" +
            currentStation + "</a>" +
            ' (' + stationList[currentStation].rssi + ' dBm)</div>';
    }
    html += "</div>" +
        "</div>" +
        "<div style='float: left; width: 100%'><h3>Beacon Informations</h3>" +
            "<div style='float: left; width: 50%'>" +
            "<h4>Fixed Parameters</h4>" +
            "Beacon interval: " + bssid.beacon.beaconInt + '<br>';
    for (var capa in bssid.beacon.capabilitiesInfo) {
        html += "<div>" + capa + ": " + bssid.beacon.capabilitiesInfo[capa] + "</div>";
    }
    html += "</div>" +
        "<div style='float: left; width: 50%'><h4>Tagged Parameters</h4>";
    html += display_tags(bssid);
    html += "</div></div></article>";
    return html;
}

function display_tags(bssid) {
    var html = '';
    for (var tag_index in bssid.beacon.tags) {
        html += '<div>';
        var tag = bssid.beacon.tags[tag_index];
        switch (tag.typeId) {
            case 0:
                html += "<span class='label label-default'>SSID parameter set </span><br>" +
                    "Tag Number: " + tag.typeId + "<br>" +
                    "ssid: " + tag.ssid + "<br>";
                break;
            case 1:
                html += "<span class='label label-default'>Supported Rates</span><br>" +
                    "Tag Number: " + tag.typeId + "<br>";
                for (var rate in tag.rates) {
                    html += "Supported Rates: " + tag.rates[rate] + "<br>";
                }
                break;
            case 3:
                html += "<span class='label label-default'>DS Parameter Set</span><br> " +
                    "Tag Number: " + tag.typeId + "<br>" +
                    "Current Channel: " + tag.channel + "<br>";
                break;
            case 5:
                html += "<span class='label label-default'>Traffic Indication Map (TIM)</span><br>" +
                    "Tag Number: " + tag.typeId + "<br>" +
                    "DTIM period: " + tag.dtimPeriod + "<br>";
                break;
            case 7:
                html += "<span class='label label-default'>Country Information</span><br>" +
                    "Tag Number: " + tag.typeId + "<br>" +
                    "Code: " + tag.country + "<br>";
                break;
            case 32:
                html += "<span class='label label-default'>Power Constraint</span><br>" +
                    "Tag Number: " + tag.typeId + "<br>";
                break;
            case 35:
                html += "<span class='label label-default'>TPC Report Transmit Power</span><br>" +
                    "Tag Number: " + tag.typeId + "<br>";
                break;
            case 42:
                html += "<span class='label label-default'>ERP Information</span><br>" +
                    "Tag Number: " + tag.typeId + "<br>";
                break;
            case 48:
                var gcs = CipherSuite(tag.capabilities.group_cipher_suite_type);
                html += "<span class='label label-default'>RSN Information</span><br>" +
                    "Tag Number: " + tag.typeId + "<br>" +
                    "RSN Version: " + tag.capabilities.version + "<br>" +
                    "Group Cipher Suite: <br> " +
                    'Group Cipher Suite OUI: ' + gcs.oui + '<br>' +
                    'Group Cipher Suite Type: ' + gcs.suite + '<br>';
                var pcs_count = tag.capabilities.pairwise_cipher_suite_count;
                html += "Pairwise Cipher Suite Count: " + pcs_count + "<br>";
                for (var i = 0; i < pcs_count; i++) {
                    var pcs = CipherSuite(tag.capabilities.pairwise_cipher_suite_list[i]);
                    html += "Pairwise Cipher Suite " + pcs_count + ": <br> " +
                        'Pairwise Cipher Suite OUI: ' + pcs.oui + '<br>' +
                        'Pairwise Cipher Suite Type: ' + pcs.suite + '<br>';
                }
                var akm_count = tag.capabilities.auth_key_mgmt_count;
                html += "Auth Key Management (AKM) Suite Count: " + akm_count + "<br>";
                for (var i = 0; i < akm_count; i++) {
                    var akm = AuthKeyMgmt(tag.capabilities.auth_key_mgmt_list[i]);
                    html += "Auth Key Management (AKM) OUI: " + akm.oui + "<br>" +
                        "Auth Key Management (AKM) Type: " + akm.suite + '<br>';
                }
                html += "RSN Capabilities: <br>";
                break;
        }
        html += "</div>";
    }
    return html;
}

function AuthKeyMgmt(ak) {
    var akmOui = ak.substring(0, ak.length - 2);
    var akmTypeValue = parseInt(ak.substring(ak.length - 1, ak.length));
    var akmType = "";
    if (akmOui.toLowerCase() == "000fac") {
        switch (akmTypeValue) {
            case 1:
                akmType = "802.1X or PMK Caching";
                break;
            case 2:
                akmType = "PSK";
                break;
        }
    } else {
        akmType = "Defined by vendor";
    }
    return {"oui": akmOui, "suite": akmType};
}

function CipherSuite(cs) {
    var cipherSuiteOUI = cs.substring(0, cs.length - 2);
    var cipherSuiteTypeValue = parseInt(cs.substring(cs.length - 1, cs.length));
    var cipherSuiteType = "";
    if (cipherSuiteOUI.toLowerCase() == "000fac") {
        switch (cipherSuiteTypeValue) {
            case 0:
                cipherSuiteType = "Use the group cipher suite";
                break;
            case 1:
                cipherSuiteType = "WEP-40";
                break;
            case 2:
                cipherSuiteType = "TKIP";
                break;
            case 3:
                cipherSuiteType = "Reserved";
                break;
            case 4:
                cipherSuiteType = "CCMP (AES)";
                break;
            case 5:
                cipherSuiteType = "WEP-104";
                break;
        }
    } else {
        cipherSuiteType = "Defined by vendor";
    }
    return {"oui": cipherSuiteOUI, "suite": cipherSuiteType};
}

