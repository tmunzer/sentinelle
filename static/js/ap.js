function tab_ap() {
    var html = "<article id='ap_list' style='float:left'>";
    for (var BSSID in BSSIDList) {
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
            "id='" + BSSID.BSSID_Address + "' " +
            "data-bssid='" + BSSID.BSSID_Address + "' " +
            "data-ssid='" + BSSID.SSID + "' " +
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

function tab_ap_details(BSSID_Address) {
    var BSSID = BSSIDList[BSSID_Address];
    console.log(BSSID);
    $("#nav_display_ssid").addClass("nav_selected");
    var html = "<article id='ap_details' style='float: left'>" +
        "<h2><i class='fa fa-wifi fa-lg'>" + BSSID.SSID + " - " + BSSID.BSSID_Address + "</i></h2>" +
        "<div style='float: left; width: 100%'>" +
            "<div style='float: left; width: 50%'>" +
            "Company: " + BSSID.company + " (" + BSSID.OUI + ")<br>" +
            "<br>" +
            "RSSI: " + BSSID.RSSI + "<br>" +
            'Channel: ' + BSSID.channel +
            '</div>' +
            '<div>' +
            'Associated Stations: ' + "<span class='badge'>" + BSSID.associated_STA.length + "</span>";
    for (var STA in BSSID.associated_STA) {
        var current_STA = BSSID.associated_STA[STA];
        html += '<div id="' + current_STA + '" style="padding-left:20px">' +
            current_STA + ' (' + STAList[current_STA].RSSI + ' dBm)</div>';
    }
    html += "</div>" +
        "</div>" +
        "<div style='float: left; width: 100%'><h3>Beacon Informations</h3>" +
            "<div style='float: left; width: 50%'>" +
            "<h4>Fixed Parameters</h4>" +
            "Beacon interval: " + BSSID.beacon.beaconInt + '<br>';
    for (var capa in BSSID.beacon.capabilitiesInfo) {
        html += "<div>" + capa + ": " + BSSID.beacon.capabilitiesInfo[capa] + "</div>";
    }
    html += "</div>" +
        "<div style='float: left; width: 50%'><h4>Tagged Parameters</h4>";
    html += display_tags(BSSID);
    html += "</div></div></article>";
    return html;
}

function display_tags(BSSID) {
    var html = '';
    for (var tag_index in BSSID.beacon.tags) {
        html += '<div>';
        var tag = BSSID.beacon.tags[tag_index];
        switch (tag.typeId) {
            case 0:
                html += "<span class='label label-default'>SSID parameter set </span><br>" +
                    "Tag Number: " + tag.typeId + "<br>" +
                    "SSID: " + tag.ssid + "<br>";
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
                "Pairwise Cipher Suite Count: " + pcs_count + "<br>";
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

