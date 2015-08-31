var pcap = require("./pcap"),
pcap_session = pcap.createSession("wlan0mon");
var sys = require("sys");

pcap_session.on("packet", function(raw_packet){
    var packet = pcap.decode.packet(raw_packet);
    //control frames
    if (packet.payload.ieee802_11Frame.type == 0){
	//beacons
	if (packet.payload.ieee802_11Frame.subType == 8){
	    access_point(packet.payload.ieee802_11Frame);
	}
    }
    else if (packet.payload.ieee802_11Frame.type == 2){
//    console.log(sys.inspect(packet));
	console.log(sys.inspect(packet.payload.ieee802_11Frame.llc));
    }

});

var accessPointsList = [];

function AccessPoint (BSSID){
    this.BSSID = BSSID;
    this.SSID = "";
    this.rates = "";
    this.channel = "";
    this.extended_rates = "";
    this.TIM = "";
    this.ERP = "";
    this.country = "";
    this.HT_capa = "";
    this.HT_info = "";
}

AccessPoint.prototype.set_SSID = function(SSID){
    this.SSID = SSID;
}
AccessPoint.prototype.set_rates = function(rates){
	var mask_basic = parseInt("10000000", 2);
	var mask_rate = parseInt("01111111", 2);

	var rate;
	var basic = "";
	var rates_list = [];

	for (var ii = 0; ii < rates.length; ii++){
		rate = rates.readUInt8(ii);
		//if BASIC bit set to "1"
		if (rate & mask_basic){
			basic = "(B)";
		} else {
			basic = "";
		}
		rate = (rate & mask_rate) * 0.5;
		rates_list.push(rate + basic);
	}
    this.rates = rates_list;
}
AccessPoint.prototype.set_channel = function(channel){
    this.channel = channel;
}
AccessPoint.prototype.set_extended_rates = function(erates){
	var mask_basic = parseInt("10000000", 2);
	var mask_rate = parseInt("01111111", 2);

	var erate;
	var basic = "";
	var erates_list = [];

	for (var ii = 0; ii < erates.length; ii++){
		erate = erates.readUInt8(ii);
		//if BASIC bit set to "1"
		if (erate & mask_basic){
			basic = "(B)";
		} else {
			basic = "";
		}
		erate = (erate & mask_rate) * 0.5;
		erates_list.push(erate + basic);
	}

    this.extended_rates = erates;
}
AccessPoint.prototype.set_TIM = function(TIM){
    this.TIM = TIM;
}
AccessPoint.prototype.set_ERP = function(ERP){
    this.ERP = ERP;
}
AccessPoint.prototype.set_country = function(country){
    this.country = country;
}
AccessPoint.prototype.set_HT_capa = function(HT_capa){
    this.HT_capa = HT_capa;
}
AccessPoint.prototype.set_HT_info = function(HT_info){
    this.HT_info = HT_info;
}

access_point = function(payload){
    var BSSID = payload.shost.addr;
    if (!accessPointsList.hasOwnProperty(BSSID)){
		var accessPoint = new AccessPoint(BSSID);
		console.log(payload.beacon.tags[1]);
	/*	for (var tag in payload.beacon.tags){
			if (payload.beacon.tags[tag].hasOwnProperty("type")){
			//SSID
			if (payload.beacon.tags[tag].typeId == 0){
	//		    console.log(payload.beacon.tags[tag].ssid);
				accessPoint.set_SSID(payload.beacon.tags[tag].ssid);
				//rates
			} else if (payload.beacon.tags[tag].typeId == 1){
	//		    console.log(payload.beacon.tags[tag].value);
				accessPoint.set_rates(payload.beacon.tags[tag].value);
				//channel
			} else if (payload.beacon.tags[tag].typeId == 3){
	//		    console.log(payload.beacon.tags[tag].channel);
				accessPoint.set_channel(payload.beacon.tags[tag].channel);
				//extended rates
			} else if (payload.beacon.tags[tag].typeId == 50){
	//		    console.log(payload.beacon.tags[tag].value);
				accessPoint.set_extended_rates(payload.beacon.tags[tag].value);
				//TIM
			} else if (payload.beacon.tags[tag].typeId == 5){
	//		    console.log(payload.beacon.tags[tag].value);
				accessPoint.set_TIM(payload.beacon.tags[tag].value);
				//Country information
			} else if (payload.beacon.tags[tag].typeId == 7){
	//		    console.log(payload.beacon.tags[tag].value);
				accessPoint.set_country(payload.beacon.tags[tag].value);
				//ERP
			} else if (payload.beacon.tags[tag].typeId == 42){
	//		    console.log(payload.beacon.tags[tag].value);
				accessPoint.set_ERP(payload.beacon.tags[tag].value);
				//HT Capabilities
			} else if (payload.beacon.tags[tag].typeId == 45){
	//		    console.log(payload.beacon.tags[tag].value);
				accessPoint.set_HT_capa(payload.beacon.tags[tag].value);
				//HT Information
			} else if (payload.beacon.tags[tag].typeId == 61){
	//		    console.log(payload.beacon.tags[tag].value);
				accessPoint.set_HT_info(payload.beacon.tags[tag].value);
			}
	    }
	}
	accessPointsList[BSSID]=accessPoint;
	console.log(accessPoint);*/
    }
}
