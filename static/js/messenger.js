var socket = io.connect('http://10.0.10.3:80');

// Socket: Rx
socket.on("clear_all", function () {
    bssidList = [];
    ssidList = [];
    stationList = [];
    $("#section_display").empty();
})
    .on('sentinelle_status', function (status) {
        sentinelle_status = status;
        if (sentinelle_status == "running") {
            $("#sentinelle_status_text").text(sentinelle_status);
            document.getElementById("sentinelle_status_icon").className = "fa fa-spinner fa-pulse";
            document.getElementById("sentinelle_action").className = "fa fa-toggle-on fa-lg";
            document.getElementById("sentinelle_status_btn").className = "label label-success";
        } else {
            $("#sentinelle_status_text").text(sentinelle_status);
            document.getElementById("sentinelle_status_icon").className = "fa fa-spinner";
            document.getElementById("sentinelle_action").className = "fa fa-toggle-off fa-lg";
            document.getElementById("sentinelle_status_btn").className = "label label-warning";
        }
    })
    .on('SSID', function (action, ssid) {
        //console.log(ssid);
        //console.log(ssid.bssidList);
        ssid.last_update = new Date().toLocaleString();
        ssidList[ssid.ssid] = ssid;
        if (document.getElementById('infra_list') != null) {
            if (document.getElementById(ssid.ssid) != null) {
                document.getElementById(ssid.ssid).innerHTML = format_infrastructure(ssid, false);
            } else {
                $("#infra_list").append(format_infrastructure(ssid, true));
            }
            sortDiv();
        }
    })
    .on('BSSID', function (action, bssid) {
        //console.log(bssid);
        bssid.last_update = new Date().toLocaleString();
        bssidList[bssid.bssidAddress] = bssid;
        if (document.getElementById('infra_list') != null) {
            if (ssidList[bssid.ssid] != null) {
                if (document.getElementById(bssid.ssid) != null) {
                    document.getElementById(bssid.ssid).innerHTML = format_infrastructure(ssidList[bssid.ssid], false);
                } else {
                    $("#infra_list").append(format_infrastructure(ssidList[bssid.ssid], true));
                }
            }
            sortDiv();
        } else if (document.getElementById('ap_list') != null) {
            if (document.getElementById(bssid.bssidAddress) != null) {
                document.getElementById(bssid.bssidAddress).innerHTML = format_ap_list(bssid, false);
            } else {
                $("#ap_list").append(format_ap_list(bssid, true));
            }
            sortDiv();
        }
    })
    .on("STA", function (action, station) {
        station['last_update'] = new Date().toLocaleString();
        stationList[station.mac] = station;
        //console.log(action);
        //console.log(STA);
        if (document.getElementById('sta_list') != null) {
            if (document.getElementById(station.mac) != null) {
                document.getElementById(station.mac).innerHTML = format_sta_list(station, false);
            } else {
                $("#sta_list").append(format_sta_list(station, true));
            }
            //sortDiv();
        }
    })
    .on("test", function (test) {
        console.log(test);
    });

// Control the sensor
function start_stop() {
    if (sentinelle_status == "running") {
        socket.emit("stop");
    } else {
        socket.emit("start");
    }
}