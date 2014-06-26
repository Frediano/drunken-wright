var JSONP_scr;

SM_JSON = {
    CATAGORIES: {},
    PuntFlag: 0,
    IPAddress: "",
    InitCat: undefined,
    InitSubCat: undefined,
    InitSrch:undefined,
    setCookie: function (cname, cat, subcat, srch, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+d.toGMTString();
        document.cookie = "ID=" + cname + ";";
        document.cookie = "CAT=" + cat + ";";
        document.cookie = "SUBCAT=" + subcat + ";";
        document.cookie = "SRCH=" + srch + ";";
        document.cookie = expires;
        },

    getCookie: function(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
            }
            return "";
    },
    saveGuiState: function() {
        var srchText = $("#BXSearch").val();
        var theCategoryCode = $('#CBCategorySelect').val();
        var theSubCategoryCode = $('#CBSubCategorySelect option:selected').val();
        SM_JSON.setCookie("TESTUSER",theCategoryCode,theSubCategoryCode,srchText,10);
    },
    getGuiState: function() {
        var srchText = SM_JSON.getCookie("SRCH");
        var theCategoryCode = SM_JSON.getCookie("CAT");
        var theSubCategoryCode = SM_JSON.getCookie("SUBCAT");
        if (theCategoryCode === undefined) return;
        SM_JSON.InitCat = theCategoryCode;
        SM_JSON.InitSubCat = theSubCategoryCode;
        SM_JSON.InitSrch = srchText;
        if (SM_JSON.InitSrch.length !== 0)
        {
            SM_JSON.PuntFlag=0;
            $("#BXSearch").val(SM_JSON.InitSrch);
        }
        SM_JSON.PuntFlag=0;
    },
    searchHandler: function() {
        if(SM_JSON.PuntFlag===1)return;
        console.log("search...");
        var srchText = $("#BXSearch").val();
        if (srchText.length === 0) return;
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
        SM_JSON.saveGuiState();
    },
    CatSearchHandler: function(categoryId) {
        if(SM_JSON.PuntFlag===1)return;
        $("#BXSearch").val("");
        console.log("catSearch...");
        $.ajax({
            url: SM_JSON.CatItemSearchURL(categoryId),
            crossDomain: true,
            type: 'get',
            dataType: 'json',
        }).done(function (data) {
            console.log("catSearchDone");
            SM_JSON.InjectSearchItems(data);
        }).error(function (foo) {
            console.log(foo);
        });
        SM_JSON.saveGuiState();
    },
    SubCatQueryHandler: function() {
        $("#BXSearch").val("");
        var theCategory = $('#CBSubCategorySelect option:selected').text();
        var theCategoryCode = $('#CBSubCategorySelect option:selected').val();
        SM_JSON.CatSearchHandler(theCategoryCode);
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
            + "&numItems=50";
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
            + "&numItems=50";
    },
    CatItemSearchURL: function (category) {
        var userAgent = navigator.userAgent;
        var IPAddress = SM_JSON.IPAddress;
        return SM_SVCS.EBAY_SRCH_CAT.url
            + "visitorUserAgent=" + encodeURIComponent(userAgent)
            + "&visitorIPAddress=" + encodeURIComponent(IPAddress)
            + "&apiKey=" + SM_KEYS.EBAY.apiKey
            + "&trackingId=" + SM_KEYS.EBAY.trackingId
            + "&categoryId=" + category
            + "&numItems=50";
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
            if (SM_JSON.InitCat !== undefined) {
                $('#CBCategorySelect').val(SM_JSON.InitCat);
                SM_JSON.InitCat = undefined;
            }
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
            if (this.name === theCategory) {
                if (this.categories !== undefined) {
                    $(this.categories.category).each(function (index2) {
                        newOptions.push([this.name, this.id]);
                    });
                }
            }
        });
        var $el = $("#CBSubCategorySelect");
        $el.empty(); // remove old options
        if (newOptions.length === 0) {
            $el.hide();
            SM_JSON.CatSearchHandler(theCategoryCode);
        }
        else {
            $.each(newOptions, function (key, value) {
                $el.append($("<option></option>")
                   .attr("value", this[1]).text(this[0]));
            });
            $el.show();
            if (SM_JSON.InitSubCat !== undefined)
            {
                $('#CBSubCategorySelect').val(SM_JSON.InitSubCat);
                SM_JSON.InitSubCat=undefined;
            }
            SM_JSON.SubCatQueryHandler();
        }
    },
    pullAppropriateImageURL: function (data, wd, ht) {
        var bestURL;
        if (data.images !== undefined)
        {
            $(data.images.image).each(function (index) {
                if (this.available) {
                    var w = parseInt(this.width, 10);
                    var h = parseInt(this.height, 10);
                    if (w <= wd && h <= ht)
                        bestURL = this.sourceURL;
                }
            });
        }
        if (bestURL !== undefined) return bestURL;
        if(data.imageList!==undefined){
            $(data.imageList.image).each(function (index) {
                if (this.available) {
                    var w = parseInt(this.width, 10);
                    var h = parseInt(this.height, 10);
                    if (w <= wd && h <= ht)
                        bestURL = this.sourceURL;
                }
            });
        }
        return bestURL;
        },
    InjectSearchItems: function (data) {
        var newItems = [];
        $(data.categories.category[0].items.item).each(function (index) {
            if (this.product != undefined) newItems.push([this.product]);
            else if (this.offer != undefined) newItems.push(this.offer);
            });
        var $el = $("#itemsCntrlRgn");
        $el.empty(); // remove old options
        if (newItems.length !== 0) {
            $.each(newItems, function (key, value) {
                if (this[0] !== undefined)
                {
                    var imgURL = SM_JSON.pullAppropriateImageURL(this[0], 200, 200);
                    var $thisDiv =$('<div></div>')
                            .attr('class', 'itemDiv')
                            .attr('title', this[0].name)
                            .attr('id', this[0].id);

                    var itemLnk = "";
                    if (this[0].offerURL !== undefined) itemLnk = this[0].offerURL;
                    if (this[0].productOffersURL !== undefined) itemLnk = this[0].productOffersURL;
                    var $thisA = $('<a></a>')
                                .attr('href', itemLnk);

                    var $thisImg = $("<img></img>")
                                    .attr("src", imgURL)
                                    .attr("width", 150)
                                    .attr("height", 150)
                                    .attr("class", "shopItem")
                                    .text("image not available");
                   
                    var bPrice = '???';
                    if (this[0].basePrice !== undefined) bPrice = this[0].basePrice.value;
                    else if (this[0].minPrice !== undefined) bPrice = this[0].minPrice.value;
                    var $thisSpan = $('<span></span>')
                                .attr('class', 'itemPrice')
                                .text('from ' + bPrice);

                    if ($thisA !== undefined) {
                        $thisA.append($thisImg);
                        $thisDiv.append($thisA);
                        $thisDiv.append($thisSpan);

                    }
                    else {
                        $thisDiv.append($thisImg);
                        $thisDiv.append($thisSpan);
                    }
                    $el.append($thisDiv);
                    $('.itemDiv').draggable();

                }
                else if(this != undefined)
                {
                    var imgURL = SM_JSON.pullAppropriateImageURL(this, 200, 200);
                    var $thisDiv =$('<div></div>')
                            .attr('class', 'itemDiv')
                            .attr('title', this.name)
                            .attr('id', this.id);

                    var itemLnk = "";
                    if (this.offerURL !== undefined) itemLnk = this.offerURL;
                    if (this.productOffersURL !== undefined) itemLnk = this.productOffersURL;
                    var $thisA = $('<a></a>')
                                .attr('href', itemLnk);

                    var $thisImg = $("<img></img>")
                                    .attr("src", imgURL)
                                    .attr("width", 150)
                                    .attr("height", 150)
                                    .attr("class", "shopItem")
                                    .text("image not available");
                   
                    var bPrice = '???';
                    if (this.basePrice !== undefined) bPrice = this.basePrice.value;
                    else if (this.minPrice !== undefined) bPrice = this.minPrice.value;
                    var $thisSpan = $('<span></span>')
                                .attr('class', 'itemPrice')
                                .text('from ' + bPrice);
                    if ($thisA !== undefined)
                    {
                        $thisA.append($thisImg);
                        $thisDiv.append($thisA);
                        $thisDiv.append($thisSpan);

                    }
                    else
                    {
                        $thisDiv.append($thisImg);
                        $thisDiv.append($thisSpan);
                    }
                    $el.append($thisDiv);

                    $('.itemDiv').draggable();
                }
                
            });
            $el.show();
            //$(".shopItem").draggable();
        }

        /*
        <div class="itemDiv" id="akjdhfaksjhf" title="This should be a tool tip" >
            <a href="TestSvcApi.html">
                <img src="img/mustang.jpg" width="150" height="150" class="itemImg" />
            </a>
            <p class="itemPrice">$699.99</p>
        </div>
        */


        // kill any earlier search items.
        // build an ItemCarrier for every Item returned in JSON data.   Make it draggable.
    }

}

$(function () {
    SM_JSON.GetIPAddress();
    SM_JSON.getGuiState();
    $("#CBCategorySelect").change(SM_JSON.BuildSubCategories);
    $("#CBSubCategorySelect").change(SM_JSON.SubCatQueryHandler);
    SM_JSON.BuildCategories(0);
});