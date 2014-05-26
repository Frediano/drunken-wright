var JSONP_scr;

SM_JSON = {
    CATAGORIES: {},


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
    }

}

$(function () {
    $("#CBCategorySelect").change(SM_JSON.BuildSubCategories);
    SM_JSON.BuildCategories(0);
});