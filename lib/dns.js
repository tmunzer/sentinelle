
function decode_dns(dnsRequest){
    return dnsRequest.name + " " + RRClass(dnsRequest.class) + " " + RRType(dnsRequest.type);
}

/**
 * @return {string}
 */
function RRClass(rrClassId){
    var rrClass = "";
    switch (rrClassId) {
        case 0x000:
            rrClass = "";
            break;
        case 0x0001:
            rrClass = "IN";
            break;
        case 0x0002:
            rrClass = "";
            break;
        case 0x0003:
            rrClass = "CH";
            break;
        case 0x0004:
            rrClass = "HS";
            break;
        case 0x00FE:
            rrClass = "QCLASS None";
            break;
        case 0x00FF:
            rrClass = "QCLASS Any";
            break;
    }
    return rrClass;
}

/**
 * @return {string}
 */
function RRType(rrTypeId){
    var rrType = "";
    switch (rrTypeId){
        case 1:
            rrType = "A";
            break;
        case 28:
            rrType = "AAAA";
            break;
        case 18:
            rrType = "AFSDB";
            break;
        case 42:
            rrType = "APL";
            break;
        case 257:
            rrType = "CAA";
            break;
        case 60:
            rrType = "CDNSKEY";
            break;
        case 59:
            rrType = "CDS";
            break;
        case 37:
            rrType = "CERT";
            break;
        case 5:
            rrType = "CNAME";
            break;
        case 49:
            rrType = "DHCID";
            break;
        case 32769:
            rrType = "DLV";
            break;
        case 39:
            rrType = "DNAME";
            break;
        case 48:
            rrType = "DNSKEY";
            break;
        case 43:
            rrType = "DS";
            break;
        case 55:
            rrType = "HIP";
            break;
        case 45:
            rrType = "IPSECKEY";
            break;
        case 25:
            rrType = "KEY";
            break;
        case 36:
            rrType = "KX";
            break;
        case 29:
            rrType = "LOC";
            break;
        case 15:
            rrType = "MX";
            break;
        case 35:
            rrType = "NAPTR";
            break;
        case 2:
            rrType = "NS";
            break;
        case 47:
            rrType = "NSEC";
            break;
        case 50:
            rrType = "NSEC3";
            break;
        case 51:
            rrType = "NSEC3PARAM";
            break;
        case 12:
            rrType = "PTR";
            break;
        case 46:
            rrType = "RRSIG";
            break;
        case 17:
            rrType = "RP";
            break;
        case 24:
            rrType = "SIG";
            break;
        case 6:
            rrType = "SOA";
            break;
        case 33:
            rrType = "SRV";
            break;
        case 44:
            rrType = "SSHFP";
            break;
        case 249:
            rrType = "TKEY";
            break;
        case 52:
            rrType = "TLSA";
            break;
        case 250:
            rrType = "TSIG";
            break;
        case 16:
            rrType = "TXT";
            break;
    }
    return rrType;
}

exports.decode_dns = decode_dns;