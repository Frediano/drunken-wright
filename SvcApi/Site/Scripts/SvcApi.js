var JSONP_scr;

SM_JSON = {
    CATAGORIES: {},
    IPAddress: "",
    encode_utf8 : function(s){
        return unescape(encodeURIComponent(s)); 
        }, 
    decode_utf8 : function(s) {
        return decodeURIComponent(escape(s)); 
        },

    searchHandler: function() {
        console.log("search...");
        var srchText = $("#BXSearch").val();
        console.log(SM_JSON.GenSearchURL(srchText));
        $.ajax({
            url: SM_JSON.GenSearchURL(srchText),
            crossDomain: true,
            type: 'get',
            dataType: 'json',
        }).done(function (data) {
            console.log("search done");
            SM_JSON.InjectSearchItems(data);
        }).error(function (foo) {
            console.log(foo);
        });
    },

    GetApiKeyTrackId: function () {
        return SM_SVCS.EBAY_CAT_SVC.url
            + "apiKey=" + SM_KEYS.EBAY.apiKey
            + "&trackingId=" + SM_KEYS.EBAY.trackingId;
    },
    GetCatagoriesURL: function (categoryId) {
        return SM_JSON.GetApiKeyTrackId()
           + "&categoryId=" + categoryId
           + (categoryId !== 0 ? "" : "&showAllDescendants=true");
    },
    GetIPAddress: function () {
        $.getJSON("http://jsonip.appspot.com?callback=?",
            function (data) {
                SM_JSON.IPAddress=data.ip;
            });       
    },
    CatSearchURL: function (categoryId) {
        var userAgent = navigator.userAgent;
        var IPAddress = SM_JSON.IPAddress;
        return SM_SVCS.EBAY_SRCH_CAT.url
            + "visitorUserAgent=" + encodeURIComponent(userAgent)
            + "&visitorIPAddress=" + encodeURIComponent(IPAddress)
            + "&apiKey=" + SM_KEYS.EBAY.apiKey
            + "&trackingId=" + SM_KEYS.EBAY.trackingId
            + "&categoryId=" + categoryId
            + "&numItems=25";
    },
    GenSearchURL: function (searchphrase) {
        var userAgent = navigator.userAgent;
        var IPAddress = SM_JSON.IPAddress;
        return SM_SVCS.EBAY_SRCH_CAT.url
            + "visitorUserAgent=" + encodeURIComponent(userAgent)
            + "&visitorIPAddress=" + encodeURIComponent(IPAddress)
            + "&apiKey=" + SM_KEYS.EBAY.apiKey
            + "&trackingId=" + SM_KEYS.EBAY.trackingId
            + "&keyword=" + encodeURIComponent(searchphrase)
            + "&numItems=25";
    },

    BuildCategories: function () {
        $.ajax({
            url: SM_JSON.GetCatagoriesURL(0),
            crossDomain: true,
            type: 'get',
            dataType: 'json',
        }).done(function (data) {
            console.log("done");
            console.log(data);
            SM_JSON.CATAGORIES = data; // buffer this, it is a list of subcategories, too... changes infrequently don't need refresh
            var newOptions = [];
            $(data.category.categories.category).each(function(index){
                newOptions.push([this.name, this.id]);
            });
            var $el = $("#CBCategorySelect");
            $el.empty(); // remove old options
            $.each(newOptions, function (key, value) {
                $el.append($("<option></option>")
                   .attr("value", this[1]).text(this[0]));
            });
            // select first item
            SM_JSON.BuildSubCategories();


        }).fail(function (jqXHR, textStatus) {
            alert("Request failed: " + textStatus);
        }).always(function () {
            console.log("alwaysed");
        })
    },
    BuildSubCategories: function () {
        // get the category code
        var theCategory = $('#CBCategorySelect option:selected').text();
        var theCategoryCode = $('#CBCategorySelect').val();
        console.log("BuildSubCategories = " + theCategory + " [" + theCategoryCode + "]");
        var bufdata = SM_JSON.CATAGORIES; // buffered is a list of subcategories, too... changes infrequently don't need refresh
        var newOptions = [];
        $(bufdata.category.categories.category).each(function (index) {
            if(this.name === theCategory){
                if (this.categories !== undefined) {
                    $(this.categories.category).each(function (index2) {
                        newOptions.push([this.name, this.id]);
                    });
                }
            }
        });
        var $el = $("#CBSubCatagorySelect");
        $el.empty(); // remove old options
        if (newOptions.length === 0) {
            $el.hide();
        }
        else {
            $.each(newOptions, function (key, value) {
                $el.append($("<option></option>")
                   .attr("value", this[1]).text(this[0]));
            });
            $el.show();
        }
    },
    pullAppropriateImageURL: function (data, wd, ht) {bestURL
        var bestURL;
        $(data.images.image).each(function (index) {
            if(this.available)
            {
                var w = parseInt(this.width, 10);
                var h = parseInt(this.height, 10);
                if(w <= wd && h <= ht)
                    bestURL=this.sourceURL;
            }
        });
        return bestURL;
        },
    InjectSearchItems: function (data) {
        var newItems = [];
        $(data.categories.category[0].items.item).each(function (index) {
            newItems.push([this.product]);
            });
        var $el = $("#itemsCntrlRgn");
        $el.empty(); // remove old options
        if (newItems.length !== 0) {
            $.each(newItems, function (key, value) {
                if (this[0] !== undefined)
                {
                    var imgURL = SM_JSON.pullAppropriateImageURL(this[0],200,200);
                    $el.append($("<img></img>")
                        .attr("src", imgURL)
                        .attr("width",150)
                        .attr("height", 150)
                        .attr("class","shopItem")
                        .text("image not available"));
                    console.log(imgURL);

                }
            });
            $el.show();
            $(".shopItem").draggable();
        }

        // kill any earlier search items.
        // build an ItemCarrier for every Item returned in JSON data.   Make it draggable.
    }

}

$(function () {
    SM_JSON.GetIPAddress();
    $("#CBCategorySelect").change(SM_JSON.BuildSubCategories);
    SM_JSON.BuildCategories(0);
});