
var searchByTagTextBox = document.getElementById('searchByTagText');

var selIndexi = 0,
    selIndexj = 0,
    goingDown = false,
    goingUp = false,
    module = {
        0: "ALL",
        1: "ANN",
        2: "RE",
        3: "FF",
        4: "DIG",
        5: "FAQ"
    };

$('#searchByTagText').focus(function () {
    $("#li_all").parent("ul").find("li").removeClass("search-selected");
    $("#li_all").parent("ul").find("li").eq(selIndexi).addClass("search-selected");
    $('.search-autocomplete-wrapper').css('display', 'block');
    var string = searchByTagTextBox.value.trim() != "" ? " in " : "";
    document.getElementById('li_all').innerHTML = searchByTagTextBox.value + string + "<a id = 'hrefAll' href='#'>" + "<span class=\"search-auto-text\">All</span>" + "<\a>";
    document.getElementById('li_ann').innerHTML = searchByTagTextBox.value + string + "<a href='#'>" + "<span class=\"search-auto-text\">Announcements</span>" + "<\a>";
    document.getElementById('li_re').innerHTML = searchByTagTextBox.value + string + "<a href='#'>" + "<span class=\"search-auto-text\">Recipes</span>" + "<\a>";
    document.getElementById('li_ff').innerHTML = searchByTagTextBox.value + string + "<a href='#'>" + "<span class=\"search-auto-text\">Fearless Flyer</span>" + "<\a>";
    document.getElementById('li_dig').innerHTML = searchByTagTextBox.value + string + "<a href='#'>" + "<span class=\"search-auto-text\">DIG IN</span>" + "<\a>";
    document.getElementById('li_faq').innerHTML = searchByTagTextBox.value + string + "<a href='#'>" + "<span class=\"search-auto-text\">FAQ</span>" + "<\a>";
    $(this).css('outline', '0');
});

$('#searchByTagText').blur(function () {
    setTimeout(function () {
        $('.search-autocomplete-wrapper').css('display', 'none');

    }, 800);
});


searchByTagTextBox.onkeyup = function (event) {
    var searchText = searchByTagTextBox.value.trim();
    if (searchText != "") {
        if (event.keyCode == 13) {
            $("#li_all").parent("ul").find("li").each(function (index) {
                if ($(this).hasClass("search-selected")) {
                    selIndexj = index;
                }
            })
            
            switch (selIndexj) {
                case 0:
                    {
                        //window.location.href = "/GlobalSearch/Search?key=" + searchByTagTextBox.value.trim().replace("&", "and") + "&module=" + module[selIndexj];
                        PostSearch(searchByTagTextBox.value.trim(), 'ALL');
                    }
                    break;
                case 1:
                    {
                        //window.location.href = "/announcements/Search/" + searchByTagTextBox.value.trim().replace("&", "and");
                        PostSearch(searchByTagTextBox.value.trim(), 'ANN');
                    }
                    break;
                case 2:
                    {
                        //window.location.href = "/Recipes/SearchResults/" + searchByTagTextBox.value.trim().replace("&", "and");
                        PostSearch(searchByTagTextBox.value.trim(), 'REC');
                    }
                    break;
                case 3:
                    {
                        //window.location.href = "/FearlessFlyer/FfSearch?q=" + searchByTagTextBox.value.trim().replace("&", "and") + "&module=" + module[selIndexj];
                        PostSearch(searchByTagTextBox.value.trim(), 'FF');
                    }
                    break;
                case 4:
                    {
                        //window.location.href = "/digin/Search/Search/Search?key=" + searchByTagTextBox.value.trim().replace("&", "and") + "&module=" + module[selIndexj];
                        PostSearch(searchByTagTextBox.value.trim(), 'DIG');
                    }
                    break;
                case 5:
                    {
                        //window.location.href = "/Faqs/Search?key=" + searchByTagTextBox.value.trim().replace("&", "and") + "&module=" + module[selIndexj];
                        PostSearch(searchByTagTextBox.value.trim(), 'FAQ');
                    }
                    break;
            }
            //window.location.href = "/GlobalSearch/Search?key=" + searchByTagTextBox.value + "&module=" + module[selIndexj];
        }
    }
    if (event.keyCode == 38) {
        if (selIndexi > 0) {
            selIndexi--;
            $("#li_all").parent("ul").find("li").removeClass("search-selected");
            $("#li_all").parent("ul").find("li").eq(selIndexi).addClass("search-selected");
        }
    }
    else if (event.keyCode == 40) {
        if (selIndexi < 5) {
            selIndexi++;
            $("#li_all").parent("ul").find("li").removeClass("search-selected");
            $("#li_all").parent("ul").find("li").eq(selIndexi).addClass("search-selected");
        }
    }

    var string = searchByTagTextBox.value.trim() != "" ? " in " : "";
    document.getElementById('li_all').innerHTML = searchByTagTextBox.value + string + "<a id = 'hrefAll' href='#'>" + "<span class=\"search-auto-text\">All</span>" + "<\a>";
    document.getElementById('li_ann').innerHTML = searchByTagTextBox.value + string + "<a href='#'>" + "<span class=\"search-auto-text\">Announcements</span>" + "<\a>";
    document.getElementById('li_re').innerHTML = searchByTagTextBox.value + string + "<a href='#'>" + "<span class=\"search-auto-text\">Recipes</span>" + "<\a>";
    document.getElementById('li_ff').innerHTML = searchByTagTextBox.value + string + "<a href='#'>" + "<span class=\"search-auto-text\">Fearless Flyer</span>" + "<\a>";
    document.getElementById('li_dig').innerHTML = searchByTagTextBox.value + string + "<a href='#'>" + "<span class=\"search-auto-text\">DIG IN</span>" + "<\a>";
    document.getElementById('li_faq').innerHTML = searchByTagTextBox.value + string + "<a href='#'>" + "<span class=\"search-auto-text\">FAQ</span>" + "<\a>";
}
/*Changed for search End*/
//\"/GlobalSearch/Search?key=" + searchByTagTextBox + "&module=ALL\"
function PostSearch(key, module) {
    var url = '';
    switch (module) {
        case 'ALL':
            url = '/global-search/search-results'
            break;
        case 'ANN':
            url = '/announcements/search-results';
            break;
        case 'REC':
            url = '/recipes/search-results';
            break;
        case 'FF':
            url = '/fearless-flyer/search-results';
            break;
        case 'DIG':
            url = '/digin/search-results';
            break;
        case 'FAQ':
            url = '/faq/search-results';
            break;

    }
    var keystr = searchByTagTextBox.value.replace("%", "[%]").trim();
    if (keystr != "") {
        var data = { key: keystr }
        $.ajax({
            url: '/GlobalSearch/LoadSearch',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            type: 'POST',
            cache: false,
            success: function (result) {
                window.location.href = url;
            }
        });
    }
}
$(document).ready(function () {
    $('#imgSearch').click(function (e) {
        var keystr = searchByTagTextBox.value.trim();
        if (keystr != "") {
            PostSearch(keystr, 'ALL');
        }
    });
    $('#li_all').click(function (e) {
        var keystr = searchByTagTextBox.value.trim();
        if (keystr != "") {
            PostSearch(keystr, 'ALL');
        }
    });
    $('#li_ann').click(function (e) {
        var keystr = searchByTagTextBox.value.trim();
        if (keystr != "") {
            PostSearch(keystr, 'ANN');
        }
    });
    $('#li_re').click(function (e) {
        var keystr = searchByTagTextBox.value.trim();
        if (keystr != "") {
            PostSearch(keystr, 'REC');
        }
    });
    $('#li_ff').click(function (e) {
        var keystr = searchByTagTextBox.value.trim();
        if (keystr != "") {
            PostSearch(keystr, 'FF');
        }
    });
    $('#li_dig').click(function (e) {
        var keystr = searchByTagTextBox.value.trim();
        if (keystr != "") {
            PostSearch(keystr, 'DIG');
        }
    });
    $('#li_faq').click(function (e) {
        var keystr = searchByTagTextBox.value.trim();
        if (keystr != "") {
            PostSearch(keystr, 'FAQ');
        }
    });
});

function GetRelativeRecipe(id)
{
    var data = { key: id }
    $.ajax({
        url: '/FearlessFlyer/GetRelativeRecipe',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        type: 'POST',
        cache: false,
        success: function (result) {
            window.location.href = '/Recipes/recipe/' + id;
        }
    });
}