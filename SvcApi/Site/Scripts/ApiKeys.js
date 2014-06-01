var SM_KEYS = {
    EBAY: { apiKey: "78b0db8a-0ee1-4939-a2f9-d3cd95ec0fcc", trackingId: "7000610" }  // developer versions
};

var SM_URLS = {
    EBAY: { url: "http://sandbox.api.shopping.com" }
};


var SM_SVCS = {
    EBAY_CAT_SVC: { url: SM_URLS.EBAY.url + "/publisher/3.0/json/CategoryTree?" },
    EBAY_SRCH_CAT: { url: SM_URLS.EBAY.url + "/publisher/3.0/json/GeneralSearch?" },
    EBAY_SRCH_KEY: { url: SM_URLS.EBAY.url + "/publisher/3.0/json/CategoryTree?" }
};
