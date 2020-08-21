// #region === OGÓLNE ZMIENNE ===

// === OGÓLNE ZMIENNE ===
var debugMode = false;

// - Zmienne
var $divMain = $("#divMain");
var siteroot = $.url("");

// - kolory
var colorInformation = "white";
var colorValid = "#04B512";
var colorInvalid = "#FF5468";

// #endregion

// #region === OGÓLNE FUNKCJE ===

// === OGÓLNE FUNKCJE ===

// - Sortuj listę rozwijaną
function sortDdl(selectId) {
    var foption = $("#" + selectId + " option:first");
    var soptions = $("#" + selectId + " option:not(:first)").sort(function (a, b) {
        return a.text === b.text ? 0 : a.text < b.text ? -1 : 1;
    });
    $("#" + selectId).html(soptions).prepend(foption);
};

// - Sprawdź widoczność elementu na ekranie: "visible" sprawdza czy JQuery element $ jest widoczny na ekranie, "above" - sprawdza czy element jest na lub 'nad' ekranem
function checkVisible(elm, evalType) {
    evalType = evalType || "visible";

    var vpH = $(window).height(), // Viewport Height
        st = $(window).scrollTop(), // Scroll Top
        y = $(elm).offset().top,
        elementHeight = $(elm).height();

    if (evalType === "above")
        return ((y < (vpH + st)));

    // if (evalType === "visible")
    return ((y < (vpH + st)) && (y > (st - elementHeight)));
}

// - Funkcja losująca kolor i zwracająca jego kod HEX
function randomizeColor() {
    var myArray = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
    var rand = myArray[Math.round(Math.random() * (myArray.length - 1))];
    var rand1 = myArray[Math.round(Math.random() * (myArray.length - 1))];
    var rand2 = myArray[Math.round(Math.random() * (myArray.length - 1))];
    var rand3 = myArray[Math.round(Math.random() * (myArray.length - 1))];
    var rand4 = myArray[Math.round(Math.random() * (myArray.length - 1))];
    var rand5 = myArray[Math.round(Math.random() * (myArray.length - 1))];

    return "#" + rand + rand1 + rand2 + rand3 + rand4 + rand5;
}

// - funkcja przypisująca elementom z podanym selektorze losowy kolor
function visualiseElements($selectors) {
    $selectors.each(function (i, el) {
        $(el).css({
            "border-color": randomizeColor(),
            "border-width": "1px",
            "border-style": "dashed"
        });
    });
};

// - Usuń wszystkie puste pola z obiektu JSON
function removeJsonNulls(jsonObj) {
    $.each(jsonObj, function (key, val) {
        if (typeof (val) !== "function" && String.prototype.isNullOrEmpty(val)) {
            jsonObj[key] = "";
        }
    });

    return jsonObj;
}

//#endregion

// #region === WALIDACJA ===

// - dodaj regex do opcji walidacji
$.validator.addMethod("regex", function (value, element, regexp) {
    var re = new RegExp(regexp);
    return this.optional(element) || re.test(value);
}, "To nie jest poprawne Wyrażenie Regularne.");

// - dodaj nierówność do opcji walidacji
jQuery.validator.addMethod("notEqualTo", function (value, element, param) {
    return this.optional(element) || value !== $(param).val();
}, "Wartości nie mogą być sobie równe");

// - ustaw oipcję walidacji daty
$.validator.methods.date = function (value/*, element*/) {
    var mDate = moment(value, "DD-MM-YYYY");
    var d = mDate.toDate();
    var dRegEx = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;

    return dRegEx.test(value) && mDate && d;
};


// Ustaw format daty
$("input:text.date").datepicker({
    dateFormat: "dd-mm-yy"
});

// wyczyść formatowanie kontrolki
function removeInputFormatting(args) {
    args = args || {};
    var input = args.input || null;
    var validationName = args.validationName || null;
    var container = args.container || null;

    if (input === null || validationName === null) {
        return;
    }

    $("#div" + validationName + input.attr("id")).remove();
    $("#img" + validationName + input.attr("id")).remove();

    input.css({
        "background": "linear-gradient(to bottom, rgba(1, 1, 2, 0.97), rgba(78, 37, 0, 0.97))",
        "border": "1px solid #502f18"
    });

    if (container) container.empty();
}

// Pokaż/ukryj ładowanie dla pojedynczej kontrolki
function toggleIndividualLoader(args) {
    args = args || {};
    var input = args.input || null;
    var validationName = args.validationName || null;
    var option = args.option || null;
    var loaderImage = args.loaderImage || null;
    var container = args.container || null;

    if (input === null || validationName === null) {
        return;
    }

    if (option === "show" || option === "hide") {
        $("#div" + validationName + input.attr("id")).remove();
        $("#img" + validationName + input.attr("id")).remove();
    };

    if (option === "show") {
        var $divValidationImage = $("<div></div>");

        input.css({
            "background": "linear-gradient(to bottom, rgba(1, 1, 2, 0.97), rgba(78, 37, 0, 0.97))",
            "border": "1px solid #502f18"
        });

        $divValidationImage.appendTo(container)
            .css({
                "width": "34px",
                "height": "34px",
                "background-position": "center center",
                "background-repeat": "no-repeat",
                "background-image": loaderImage,
                "-ms-background-size": "contain",
                "background-size": "contain"
            })
            .addClass(validationName.toLowerCase() + "_image")
            .attr("id", "img" + validationName + input.attr("id"));
    }
}

// Pokaż/ukryj wynik walidacji dla poszczególnej kontrolki
function toggleIndividualValidator(args) {
    args = args || {};
    var input = args.input || null;
    var errorElement = args.errorElement || null;
    var validationName = args.validationName || null;
    var option = args.option || null;
    var inputBackgroundColor = args.inputBackgroundColor || null;
    var inputBorderColor = args.inputBorderColor || null;
    var validationMessageColor = args.validationMessageColor || null;
    var validationImage = args.validationImage || null;
    var container = args.container || null;

    if (input === null || validationName === null) {
        return;
    }

    if (option === "show" || option === "hide") {
        $("#div" + validationName + input.attr("id")).remove();
        $("#img" + validationName + input.attr("id")).remove();
        if (container) container.empty();
    };

    if (option === "show") {
        var $divValidationImage = $("<div></div>");

        input.css({
            "background": "linear-gradient(to bottom, rgba(1, 1, 2, 0.97), " + inputBackgroundColor + ")",
            "border": "1px solid " + inputBorderColor
        });

        $divValidationImage.appendTo(container)
            .css({
                "width": "34px",
                "height": "34px",
                "min-width": "34px",
                "background-position": "center center",
                "background-repeat": "no-repeat",
                "background-image": validationImage,
                "-ms-background-size": "contain",
                "background-size": "contain"
            })
            .addClass(validationName.toLowerCase() + "_image").attr("id", "img" + validationName + input.attr("id"));

        if (errorElement) {
            errorElement.appendTo(container)
                .css({
                    "color": validationMessageColor,
                    "padding-top": "7px",
                    "padding-left": "10px"
                })
                .addClass(validationName.toLowerCase() + "_message").attr("id", "div" + validationName + input.attr("id"));
        }
    }
}

// Wyczyść weryfikowaną przez walidator kontrolkę
function emptyIndividualLoader(args) {
    args = args || {};
    var input = args.input || null;
    var validationName = args.validationName || null;
    if (!input) { alert('[emptyIndividualLoader] Parametr "input" nie został podany'); return; }

    $("#div" + validationName + input.attr("id")).remove();
    $("#img" + validationName + input.attr("id")).remove();

    input.css({
        "background-color": "transparent",
        "border": "1px solid #darkgreen"
    });
}

// #endregion

// #region === WIADOMOŚCI UŻYTKOWNIKA ===

// === WIADOMOŚCI UŻYTKOWNIKA ===

// - pokaż okno ładowania dla elementu
function showUniversalLoader(args) {
    args = args || {};
    var $target = args.$target || null;
    var hideTargetContent = args.hideTargetContent || false;
    var containerWidth = args.containerWidth || null;
    var containerHeight = args.containerHeight || null;
    var loaderWidth = args.loaderWidth || null;
    var loaderHeight = args.loaderHeight || null;
    var classes = args.classes || null;
    var css = args.css || null;
    if (!$target) { alert('[showUniversalLoader] Parametr "$target" nie został podany'); return; }

    var targetId = $target.attr("id");
    var spinnerBgImage = "url('" + siteroot + "Images/Loading/loading3.gif')";

    if (hideTargetContent === true) { $target.contents().visuallyHide(); }
    hideUniversalMessage({ $target: $target, fadeTime: 0 });
    hideUniversalLoader({ $target: $target, fadeTime: 0 });

    var $divLoaderContainer = $("<div id='" + targetId + "UniversalLoaderContainer" + "'></div>");
    $divLoaderContainer.appendTo($target);
    $divLoaderContainer.css({
        "opacity": "0",
        "width": containerWidth ? containerWidth + "px" : "auto",
        "height": containerHeight ? containerHeight + "px" : "auto",
        "background-image": spinnerBgImage +
            ", linear-gradient(to bottom, rgba(1, 1, 2, 0.8), rgba(32, 32, 32, 0.8))",
        "background-size": loaderWidth && loaderHeight
            ? loaderWidth + "px " + loaderHeight + "px, cover"
            : "contain, cover",
        "background-repeat": "no-repeat"
    });
    if (classes) $divLoaderContainer.addClass(classes);
    if (css) $divLoaderContainer.css(css);
    $divLoaderContainer.stop(true, true).animate({ "opacity": "1" }, { queue: false, duration: 250 });
}

// - ukryj okno ładowania dla elementu
function hideUniversalLoader(args) {
    args = args || {};
    var $target = args.$target || null;
    var fadeTime = args.fadeTime || 250;
    var callback = args.callback || null;
    if (!$target) { alert('[hideUniversalLoader] Parametr "$target" nie został podany'); return; }

    var targetId = $target.attr("id");
    var $divLoaderContainer = $target.find("#" + targetId + "UniversalLoaderContainer");

    $divLoaderContainer
        .animate({ "opacity": "0" }, {
            queue: false,
            duration: fadeTime,
            complete: function () {
                $(this).remove();
                if (callback) { callback(); }
            }
    });
}

// - pokaż okno wiadomości dla elementu
function showUniversalMessage(args) {
    args = args || {};
    var $target = args.$target || null;
    var hideTargetContent = args.hideTargetContent || false;
    var containerWidth = args.containerWidth || null;
    var containerHeight = args.containerHeight || null;
    var forceHeight = args.forceHeight || false;
    var message = args.message || null;
    var messageColor = args.messageColor || "yellow";
    var fadeout = args.fadeout || null; // true / false - ukryj wiadomość
    var length = args.length || 1000; // czas w milisekundach
    var fadeTime = args.fadeTime || 1000; // czas animacji ukrywania
    var callback = args.callback || null;
    var classes = args.classes || null;
    var fontSize = args.fontSize || 26;
    var lineHeight = args.lineHeight || 1.4285;
    var css = args.css || null;
    if (!$target) { alert('[showUniversalMessage] Parametr "$target" nie został podany'); return; }
    if (!message) { alert('[showUniversalMessage] Parametr "message" nie został podany'); return; }

    var targetId = $target.attr("id");

    if (hideTargetContent === true) { $target.contents().visuallyHide(); }
    hideUniversalMessage({ $target: $target, fadeTime: 0 });
    hideUniversalLoader({ $target: $target, fadeTime: 0 });

    var $divMessageContainer = $("<div id='" + targetId + "UniversalMessageContainer" + "'></div>");
    var paddingVertical = (containerHeight - fontSize * lineHeight) / 2;
    $divMessageContainer.appendTo($target);
    $divMessageContainer.css({
        "opacity": "0",
        "width": containerWidth ? containerWidth + "px" : "auto",
        "min-height": containerHeight ? containerHeight + "px" : "auto",
        "background-image": "linear-gradient(to bottom, rgba(1, 1, 2, 0.8), rgba(32, 32, 32, 0.8))",
        "background-size": "cover",
        "background-repeat": "no-repeat",
        "color": messageColor,
        "font-size": fontSize + "px",
        "padding-top": paddingVertical + "px",
        "padding-bottom": paddingVertical + "px",
        "padding-left": "10px",
        "padding-right": "10px",
        "overflow": "auto"
    });
    if (forceHeight === true) $divMessageContainer.css({ "height": containerHeight + "px", "max-height": containerHeight + "px", "overflow": "hidden" });
    if (classes) $divMessageContainer.addClass(classes);
    if (css) $divMessageContainer.css(css);
    var $divMessage = $("<div>" + message + "</div>");
    $divMessage.css({
        "line-height": lineHeight,
        "text-align": "center"
    });
    $divMessageContainer.append($divMessage);

    $divMessageContainer.stop(true, true).animate({ "opacity": "1" }, {
        queue: true,
        duration: fadeTime
    });

    if (fadeout === true) {
        $divMessageContainer.delay(length).animate({ "opacity": "0" }, {
            queue: true,
            duration: fadeTime,
            complete: function () {
                $divMessageContainer.remove();
                if (callback) { callback(); }
            }
        });
    } else {
        if (callback) { callback(); }
    }
}

// - ukryj okno wiadomości dla elementu
function hideUniversalMessage(args) {
    args = args || {};
    var $target = args.$target || null;
    var fadeTime = args.fadeTime || 1000; // czas animacji ukrywania
    var callback = args.callback || null;
    if (!$target) { alert('[showUniversalMessage] Parametr "$target" nie został podany'); return; }

    var targetId = $target.attr("id");
    var $divMessageContainer = $target.find("#" + targetId + "UniversalMessageContainer");

    $divMessageContainer.animate({ "opacity": "0" }, {
        queue: true,
        duration: fadeTime,
        complete: function () {
            $divMessageContainer.remove();
            if (callback) { callback(); }
        }
    });
}

// - usuń wszystkie uniwersalne okna wiadomości
function removeUniversalMessages() {
    $("[id*='UniversalMessage']").stop(true, true).remove();
}

// - usuń wszystkie uniwersalne okna ładowania
function removeUniversalLoaders() {
    $("[id*='UniversalLoader']").stop(true, true).remove();
}

// Uzyskaj obiekty oznaczone przez JSON parser jako odniesienia
function resolveReferences(json) {
    if (typeof json === "string")
        json = JSON.parse(json);

    var byid = {}, // wszystkie obiekty względem Id
        refs = []; // odniesienia do obiektów, których nie można uzyskać
    json = (function recurse(obj, prop, parent) {
        if (typeof obj !== "object" || !obj) // wartość prymitywne
            return obj;
        if (Object.prototype.toString.call(obj) === "[object Array]") {
            for (var i = 0; i < obj.length; i++)
                // sprawdź czy element tablicy nie jest wartością prymitywną
                if (typeof obj[i] !== "object" || !obj[i]) // wartość prymitywna
                    continue;
                else if ("$ref" in obj[i])
                    obj[i] = recurse(obj[i], i, obj);
                else
                    obj[i] = recurse(obj[i], prop, obj);
            return obj;
        }
        if ("$ref" in obj) { // odniesienie
            var ref = obj.$ref;
            if (ref in byid)
                return byid[ref];
            // w przeciwnym razie wymuś opóżnione ładowanie:
            refs.push([parent, prop, ref]);
            return {};
        } else if ("$id" in obj) {
            var id = obj.$id;
            delete obj.$id;
            if ("$values" in obj) // tablica
                obj = obj.$values.map(recurse);
            else // prosty obiekt
                for (prop in obj)
                    if (obj.hasOwnProperty(prop))
                        obj[prop] = recurse(obj[prop], prop, obj);
            byid[id] = obj;
        }
        return obj;
    })(json); // wykonaj

    for (var i = 0; i < refs.length; i++) { // uzyskaj poprzednio nieznane referencje
        var ref = refs[i];
        ref[0][ref[1]] = byid[ref[2]];
        // Zwróci błąd jeżeli odniesienie jest na samym szczycie obiektu
    }
    return json;
}

// Sprawdź czy tablica zawiera obiekt
function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

// #endregion

// #region === FUNKCJE ROZSZERZEŃ JQUERY ===

(function ($) {

    $.fn.visuallyHide = function () {
        return this.addClass("visuallyhidden");
    };

    $.fn.visuallyShow = function () {
        return this.removeClass("visuallyhidden");
    };

    $.fn.centerByAddingDivs = function () {
        var $divOuter = $("<div></div>").css({
            "display": "table",
            "position": "absolute",
            "height": "100%",
            "width": "100%",
            "overflow": "hidden",
            "clear": "both",
            "box-sizing": "border-box",
            "background-color": "transparent"
        });

        var $divMiddle = $("<div></div>").css({
            "display": "table-cell",
            "vertical-align": "middle",
            "text-align": "center",
            "overflow": "hidden",
            "clear": "both",
            "box-sizing": "border-box",
            "background-color": "transparent"
        });

        var $divInner = $("<div></div>").css({
            "margin-left": "auto",
            "margin-right": "auto",
            "display": "inline-block",
            "overflow": "hidden",
            "clear": "both",
            "box-sizing": "border-box",
            "background-color": "transparent"
        });

        var $thisClone = this.clone();
        $divOuter.append($divMiddle);
        $divMiddle.append($divInner);
        $divInner.append($thisClone);

        return $divOuter;
    };

}(jQuery));

// #endregion

// #region === FUNKCJE ROZSZERZEŃ JAVASCRIPT ===

// - różnica tablic
if (typeof Array.prototype.diff !== "function") { // ReSharper disable once NativeTypePrototypeExtending
    Array.prototype.diff = function (a) { 
        return this.filter(function (i) { return a.indexOf(i) < 0; });
    };
}

// - utwórz ciąg składający się z określonej liczby powtórzeń podanego znaku
if (typeof String.prototype.repeat !== "function") { // ReSharper disable once NativeTypePrototypeExtending
    String.prototype.repeat = function(n){
        n = n || 1;
        return Array(n+1).join(this);
    }
}

// - znajdź ciąg rozpoczynający się od podanej frazy
if (typeof String.prototype.startsWith !== "function") { // ReSharper disable once NativeTypePrototypeExtending
    String.prototype.startsWith = function (prefix) {
        return this.slice(0, prefix.length) === prefix;
    };
}

// - znajdź ciąg kończący się podaną frazą
if (typeof String.prototype.endsWith !== "function") { // ReSharper disable once NativeTypePrototypeExtending
    String.prototype.endsWith = function (suffix) {
        return this.slice(-suffix.length) === suffix;
    };
}

// - sprawdź czy ciąg zawiera podaną frazę
if (typeof String.prototype.contains !== "function") { // ReSharper disable once NativeTypePrototypeExtending
    String.prototype.contains = function (substring) {
        return this.indexOf(substring) !== -1;
    };
}

// - sprawdź czy ciąg nie jest pusty
// - używać jako: String.prototype.isNullOrEmpty(string)
if (typeof String.prototype.isNullOrEmpty !== "function") { // ReSharper disable once NativeTypePrototypeExtending
    String.prototype.isNullOrEmpty = function (str) {
        return str === null || str === undefined || 0 === str.length;
    };
}

// - sprawdź czy ciąg nie zawiera samych spacji bądź nie jest pusty
// - używać jako: String.prototype.isNullOrWhiteSpace(string)
if (typeof String.prototype.isNullOrWhiteSpace !== "function") { // ReSharper disable once NativeTypePrototypeExtending
    String.prototype.isNullOrWhiteSpace = function (str) {
        return str === null || str === undefined || 0 === str.length || $.trim(str) === "";
    };
}

// - zwróć ciąg znajdujący się pomiędzy wskazanymi znakami (ostatnie wystąpienie)
if (typeof String.prototype.between !== "function") { // ReSharper disable once NativeTypePrototypeExtending
    String.prototype.between = function (before, after) {
        var str = this;
        return str.substring(str.lastIndexOf(before) + 1, str.lastIndexOf(after));
    }
}

// - konwertuj wszystkie klucze obiektu JSON to małych liter
var keysToLowerCase = function(obj) {
    var key, keys = Object.keys(obj);
    var n = keys.length;
    var newobj = {};
    while (n--) {
        key = keys[n];
        newobj[key.toLowerCase()] = obj[key];
    }
    return (newobj);
}

// - parsuj widok częściowy
var parsePartialView = function(rawPartialView) {
    var sPartialView = rawPartialView.replace(/(\r\n|\n|\r)/gm, "");
    var partialView = $.parseHTML(sPartialView);
    return partialView;
}

// #endregion

// #region === OKNO PRZEGLĄDARKI ===

// - ZDARZENIE zmiany rozmiaru okna
function window_Resize(e) {
    //removeUniversalMessages();

    var areAnyResultsDisplayed = $.Enumerable.From($("#divFriendsPanelContainer").find("div").toArray())
        .Any(function(div) { return $(div).text().replace(/\s/g, "").length > 0 });

    if (!areAnyResultsDisplayed) {
        removeFriendsPanel();
    }
}

// #endregion

// #region === PANEL LOGOWANIA ===

// - wyświetla panel logowania
function displayLoginPanel() {
    showUniversalLoader({
        $target: $("#divLoginPanelContainer"),
        containerHeight: 34,
        loaderHeight: 24,
        loaderWidth: 24,
        css: { "margin-top": "5px", "margin-bottom": "5px" }
    });

    $.ajax({
        async: true,
        url: siteroot + "Base/GetLoginPanel",
        method: "post",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({}),
        dataType: "json",
        success: function (data) {
            var sLoginPanelView = data.PartialView.replace(/(\r\n|\n|\r)/gm, "");
            var LoginPanelView = $.parseHTML(sLoginPanelView);

            hideUniversalLoader({
                $target: $("#divLoginPanelContainer"),
                callback: function () {
                    $(LoginPanelView).appendTo($("#divLoginPanelContainer"));
                    if ($("#divLoginPanelContainer").find("#lnkbtnLogout").length !== 1) {
                        if ($.controller === "User" && $.action === "Edit") {
                            removeEditPanel();
                            removeActiveFriendsPanel();
                            $(".body-container").hide();
                        }
                        $("#divToolbarRow").removeClass("reorder-xs");
                    } else {
                        $("#divToolbarRow").addClass("reorder-xs");
                    }
                }
            });
        },
        error: function (err) {
            $("html").html(err.responseText);
        }
    });
}

// - ZDARZENIE zalogowania
function btnLoginSubmit_Click(e) {
    $("#btnLoginSubmit").prop("disabled", true);

    var loginPanelHeight = $("#divLoginPanelContainer").addClass("clearfix").innerHeight();
    $("#divLoginPanelContainer").removeClass("clearfix");
    var loginPanelContent = $("#divLoginPanelContainer").contents();
    var userName = $("#txtLoginUserName").val();
    var password = $("#txtLoginPassword").val();
    var rememberMe = $("#cbLoginRememberMe").prop("checked");
    loginPanelContent.remove();

    showUniversalLoader({
        $target: $("#divLoginPanelContainer"),
        containerHeight: loginPanelHeight - 10,
        loaderHeight: 64,
        loaderWidth: 64,
        hideTargetContent: false,
        css: { "margin-top": "5px", "margin-bottom": "5px" }
    });

    $.ajax({
        async: true,
        url: siteroot + "Base/LoginUser",
        method: "post",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({
            UserName: userName,
            Password: password,
            RememberMe: rememberMe
        }),
        dataType: "json",
        success: function (data) {
            var message = data.LoginMessage;
            var sLoginPanelView = data.PartialView.replace(/(\r\n|\n|\r)/gm, ""); //.replace(" ", "&nbsp;") //|\s\s+
            var loginPanelView = $.parseHTML(sLoginPanelView);

            hideUniversalLoader({
                $target: $("#divLoginPanelContainer"),
                callback: function () {
                    if (message) {
                        showUniversalMessage({
                            $target: $("#divLoginPanelContainer"),
                            containerHeight: loginPanelHeight - 10,
                            fadeout: true,
                            fadeTime: 500,
                            length: 1000,
                            message: message,
                            messageColor: "#FF5468",
                            css: { "margin-top": "5px", "margin-bottom": "5px" },
                            callback: function () {
                                $(loginPanelView).appendTo($("#divLoginPanelContainer"));
                                removeSearchPanel();
                                removeNotificationsPanel();
                                if ($.controller === "User" && $.action === "Edit") {
                                    removeEditPanel();
                                    removeActiveFriendsPanel();
                                    $(".body-container").hide();
                                }
                                $("#btnLoginSubmit").prop("disabled", false);
                                $("#divToolbarRow").removeClass("reorder-xs");
                            }
                        });
                    } else {
                        $(loginPanelView).appendTo($("#divLoginPanelContainer"));
                        displaySearchPanel();
                        displayNotificationsPanel();
                        if ($.controller === "User" && $.action === "Edit") {
                            displayEditPanel();
                            displayActiveFriendsPanel();
                            $(".body-container").show();
                        }
                        $("#btnLoginSubmit").prop("disabled", false);
                        $("#divToolbarRow").addClass("reorder-xs");
                    }
                }
            });
        },
        error: function (err) {
            $("html").html(err.responseText);
        }
    });
}

// - ZDARZENIE zalogowania przy użyciu entera
function frmLoginPanel_input_KeyUp(e) {
    if (e.which !== 13)
        return;

    $("#btnLoginSubmit").click();
}

// - ZDARZENIE wylogowania
function lnkbtnLogout_Click(e) {
    var loginPanelHeight = $("#divLoginPanelContainer").innerHeight();
    $("#divLoginPanelContainer").empty();
    showUniversalLoader({
        $target: $("#divLoginPanelContainer"),
        containerHeight: 34,
        loaderHeight: 24,
        loaderWidth: 24,
        hideTargetContent: true,
        css: { "margin-top": "5px", "margin-bottom": "5px" }
    });
    showUniversalLoader({
        $target: $("#divSearchPanelContainer"),
        containerHeight: 34,
        loaderHeight: 24,
        loaderWidth: 24,
        hideTargetContent: true,
        css: { "margin-top": "5px", "margin-bottom": "5px" }
    });

    $.ajax({
        async: true,
        url: siteroot + "Base/Logout",
        method: "post",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({}),
        dataType: "json",
        success: function (data) {
            var sLoginPanelView = data.PartialView.replace(/(\r\n|\n|\r)/gm, "");
            var loginPanelView = $.parseHTML(sLoginPanelView);

            hideUniversalLoader({ $target: $("#divSearchPanelContainer") });
            hideUniversalLoader({
                $target: $("#divLoginPanelContainer"),
                callback: function () {
                    $("#divMain").find("div[requires-authentication='true']").hide();
                    $("#btnLoginSubmit").prop("disabled", false);
                    removeSearchPanel();
                    removeFriendsPanel();
                    removeNotificationsPanel();
                    if ($.controller === "User" && $.action === "Edit") {
                        removeEditPanel();
                        removeActiveFriendsPanel();
                        $(".body-container").hide();
                    }

                    $(loginPanelView).appendTo($("#divLoginPanelContainer"));
                    $("#divToolbarRow").removeClass("reorder-xs");
                }
            });
        },
        error: function (err) {
            $("html").html(err.responseText);
        }
    });
}

// #endregion

// #region === PANEL WYSZUKIWANIA ===

// - wyświetla panel wyszukiwania
function displaySearchPanel() {
    showUniversalLoader({
        $target: $("#divSearchPanelContainer"), 
        containerHeight: 34,
        loaderHeight: 24,
        loaderWidth: 24,
        css: { "margin-top": "5px", "margin-bottom": "5px" }
    });

    $.ajax({
        async: true,
        url: siteroot + "User/GetSearchPanel",
        method: "post",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({}),
        dataType: "json",
        success: function (data) {
            var sSearchPanelView = data.PartialView.replace(/(\r\n|\n|\r)/gm, "");
            var SearchPanelView = $.parseHTML(sSearchPanelView);

            hideUniversalLoader({
                $target: $("#divSearchPanelContainer"),
                callback: function () {
                    $(SearchPanelView).appendTo($("#divSearchPanelContainer"));
                }
            });
            //visualiseElements($(".vertical-gutter-10"));
        },
        error: function (err) {
            $("html").html(err.responseText);
        }
    });
}

// - usuwa panel wyszukiwania
function removeSearchPanel() {
    $("#divSearchPanelContainer").empty();
}

// - ZDARZENIE wpisywania w wyszukiwarkę
function txtSearch_KeyUp_Click(e) {
    displayFriendsPanel(e);
}

// - ZDARZENIE usunięcia wyników wyszukiwania
function divSearchValidationIndicatorContainer_Click(e) {
    var $this = $(e.target);
    var $validationContainer = $this.closest(".form-group").find(".validation-indicator-container");

    removeInputFormatting({
        validationName: "SearchValidation",
        input: $("#txtSearch"),
        container: $validationContainer
    });

    removeFriendsPanel();
}

// #endregion

// #region === PANEL POTENCJALNYCH ZNAJOMYCH ===

// - zatrzymaj ładowanie panelu potencjalnych znajomych
var xHrDisplayFriendsPanel;
function abortDisplayFriendsPanel() {
    if (xHrDisplayFriendsPanel) {
        xHrDisplayFriendsPanel.abort();
    }
    var $this = $("#txtSearch");
    var $validationContainer = $this.closest(".form-group").find(".validation-indicator-container");

    removeInputFormatting({
        validationName: "SearchValidation",
        input: $this,
        container: $validationContainer
    });

    removeFriendsPanel();
}

// - wyświetl panel potencjalnych znajomych
function displayFriendsPanel(e) {
    var $this = $(e.target);
    var $validationContainer = $this.closest(".form-group").find(".validation-indicator-container");

    abortDisplayFriendsPanel();

    toggleIndividualLoader({
        input: $this,
        validationName: "SearchValidation",
        option: "show",
        loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
        container: $validationContainer
    });

    var searchTerm = $("#txtSearch").val();

    xHrDisplayFriendsPanel = $.ajax({
        async: true,
        url: siteroot + "Base/GetFriendsPanel",
        method: "post",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({
            SearchTerm: searchTerm
        }),
        dataType: "json",
        success: function (data) {
            removeInputFormatting({
                validationName: "SearchValidation",
                input: $this,
                container: $validationContainer
            });

            if (data.Status === "ValidationError") {
                toggleIndividualLoader({
                    input: $this,
                    option: "hide",
                    validationName: "SearchValidation"
                });

                toggleIndividualValidator({
                    input: $this,
                    option: "show",
                    validationName: "SearchValidation",
                    container: $validationContainer,
                    inputBackgroundColor: "rgba(245, 27, 52, 0.97)", //#f51b34 //#FF5468
                    inputBorderColor: "#FF5468",
                    validationMessageColor: "#FF5468",
                    validationImage: "url('" + siteroot + "Images/Incorrect.png')"
                });

                showUniversalMessage({
                    $target: $("#divFriendsPanelContainer"),
                    hideTargetContent: true,
                    containerHeight: 100,
                    fadeout: false,
                    fadeTime: 500,
                    message: data.ValidationErrors[0].Message,
                    messageColor: "#FF5468",
                    css: { "margin-left": "10px", "margin-right": "10px", "margin-top": "10px", "margin-bottom": "10px" }
                });
            } else if (data.Status === "Success") {
                hideUniversalMessage({ $target: $("#divFriendsPanelContainer"), fadeTime: 0 });

                var sFriendsPanelView = data.PartialView.replace(/(\r\n|\n|\r)/gm, "");
                var FriendsPanelView = $.parseHTML(sFriendsPanelView);
                $("#divFriendsPanelContainer").empty();
                $(FriendsPanelView).appendTo($("#divFriendsPanelContainer"));

                toggleIndividualLoader({
                    input: $this,
                    option: "hide",
                    validationName: "SearchValidation"
                });

                if (!String.prototype.isNullOrWhiteSpace(searchTerm)) {
                    toggleIndividualValidator({
                        input: $this,
                        option: "show",
                        validationName: "SearchValidation",
                        container: $validationContainer,
                        inputBackgroundColor: "rgba(11, 115, 12, 0.97)", //#0b730c //#0b970d
                        inputBorderColor: "#0b970d",
                        validationMessageColor: "#0b970d",
                        validationImage: "url('" + siteroot + "Images/Correct.png')"
                    });
                } else {
                    var $validationContent = $("<div></div>").attr("id", "divSearchValidationIndicatorContent");
                    $validationContainer.append($validationContent);
                }

                if (data.ResultsCount === 0) {
                    showUniversalMessage({
                        $target: $("#divFriendsPanelContainer"),
                        hideTargetContent: true,
                        containerHeight: 100,
                        fadeout: false,
                        fadeTime: 500,
                        message: "Brak wyników",
                        messageColor: "#0b970d",
                        css: {
                            "margin-left": "10px",
                            "margin-right": "10px",
                            "margin-top": "10px",
                            "margin-bottom": "10px"
                        }
                    });
                }
            } else {
                showUniversalMessage({
                    $target: $("#divFriendsPanelContainer"),
                    hideTargetContent: true,
                    containerHeight: 100,
                    fadeout: false,
                    fadeTime: 500,
                    message: data.Message,
                    messageColor: "#FF5468",
                    css: { "margin-left": "10px", "margin-right": "10px", "margin-top": "10px", "margin-bottom": "10px" }
                });
            }
        },
        error: function (err) {
            $("html").html(err.responseText);
        }
    });
}

// - usuń panel potencjalnych znajomych
function removeFriendsPanel() {
    $("#divFriendsPanelContainer").empty();
}

// - ZDARZENIE dodania znajomego
function btnAddFriend_Click(e) {
    var $btnAddFriend = $(e.target);
    $btnAddFriend.prop("disabled", true);

    var $friendsItemRow = $btnAddFriend.closest(".friends-item-row");
    var friendsItemRowContent = $friendsItemRow.contents();
    var friendsItemRowHeight = $friendsItemRow.innerHeight();
    $friendsItemRow.removeClass("row-flex");
    showUniversalLoader({
        $target: $friendsItemRow,
        hideTargetContent: true,
        loaderWidth: 64,
        loaderHeight: 64,
        containerHeight: friendsItemRowHeight - 10,
        css: { "margin": "5px" }
    });

    $.ajax({
        async: true,
        url: siteroot + "User/AddFriend",
        method: "post",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({
            Id: $btnAddFriend.attr("user-id")
        }),
        dataType: "json",
        success: function (data) {
            hideUniversalLoader({
                $target: $friendsItemRow,
                callback: function () {
                    if (data.Status === "Success") {
                        showUniversalMessage({
                            $target: $friendsItemRow,
                            containerHeight: friendsItemRowHeight - 10,
                            fadeout: true,
                            fadetime: 500,
                            message: data.Message,
                            messageColor: "#0b970d",
                            css: { "margin": "5px", "max-height": friendsItemRowHeight - 10 + "px", "overflow": "hidden" },
                            callback: function() {
                                friendsItemRowContent.visuallyShow();
                                $btnAddFriend.prop("value", "Dodano");
                                $friendsItemRow.addClass("row-flex");
                                if ($.controller === "User" && $.action === "Edit") {
                                    displayActiveFriendsPanel();
                                }
                            }
                        });
                    } else {
                        showUniversalMessage({
                            $target: $friendsItemRow,
                            containerHeight: friendsItemRowHeight - 10,
                            fadeout: true,
                            fadetime: 500,
                            message: data.Message,
                            messageColor: "#FF5468",
                            css: { "margin": "5px", "max-height": friendsItemRowHeight - 10 + "px", "overflow": "hidden" },
                            callback: function() {
                                friendsItemRowContent.visuallyShow();
                                $btnAddFriend.prop("disabled", false);
                                $friendsItemRow.addClass("row-flex");
                            }
                        });
                    }
                }
            });
        },
        error: function (err) {
            $("html").html(err.responseText);
        }
    });
}

// #endregion

// #region === PANEL POWIADOMIEŃ ===

// - wyświetl panel powiadomień
function displayNotificationsPanel() {
    var notificationsPanelContent = $("#divNotificationsPanelContainer").contents();
    var notificationsPanelContainerHeight = $("#divNotificationsPanelContainer").find(".content-container").parent().innerHeight();
    showUniversalLoader({
        $target: $("#divNotificationsPanelContainer"),
        hideTargetContent: true,
        loaderWidth: 32,
        loaderHeight: 32,
        containerHeight: 42
    });

    $.ajax({
        async: true,
        url: siteroot + "Base/RenderNotificationsPanel",
        method: "post",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({}),
        dataType: "json",
        success: function (data) {
            hideUniversalLoader({
                $target: $("#divNotificationsPanelContainer"),
                callback: function() {
                    notificationsPanelContent.remove();

                    if (data.Status === "Success") {
                        $(parsePartialView(data.PartialView)).appendTo($("#divNotificationsPanelContainer"));
                        $(".txt-notification-content-readonly").val($.trim($(".txt-notification-content-readonly").val()));
                        $(".notifications-content-container").hide();
                        $(".notification-content-container").hide();
                    } else if (data.Status === "NoResults") {
                        $(parsePartialView(data.PartialView)).appendTo($("#divNotificationsPanelContainer"));
                        $(".txt-notification-content-readonly").val($.trim($(".txt-notification-content-readonly").val()));
                        $(".notifications-content-container").hide();

                        showUniversalMessage({
                            $target: $("#divNotificationsPanelContainer").find(".notifications-content-container").first(),
                            containerHeight: 84,
                            hideTargetContent: true,
                            fadeout: false,
                            fadetime: 500,
                            length: 1000,
                            message: data.Message,
                            messageColor: "#0b970d",
                            css: { "margin-top": "5px", "margin-bottom": "5px" }
                        });
                    }
                }
            });
        },
        error: function (err) {
            $("html").html(err.responseText);
        }
    });
}

// - usuń panel powiadomień
function removeNotificationsPanel() {
    $("#divNotificationsPanelContainer").empty();
}

// - ZDARZENIE kliknięcia nalistę powiadomień
function notificationsTitleConteiner_Click(e) {
    var $titleContainer = $(e.target).closest(".notifications-title-container");
    var $contentContainer = $(".notifications-content-container").first();
    if ($titleContainer.hasClass("notification-bar-shown")) {
        $contentContainer.stop(true, true).slideUp(500, function () {
            $titleContainer.removeClass("notification-bar-shown").addClass("notification-bar-hidden");
        });
    } else {
        $contentContainer.stop(true, true).slideDown(500, function () {
            $titleContainer.removeClass("notification-bar-hidden").addClass("notification-bar-shown");
        });
    }
}

// - ZDARZENIE kliknięcia na nagłówek pojedycznego powiadomienia
function notificationHeaderContainer_Click(e) {
    var $headerContainer = $(e.target).closest(".notification-header-container");
    var nId = $headerContainer.attr("notification-id");
    var $contentContainer = $headerContainer
        .closest(".notifications-content-container")
        .find(".notification-content-container[notification-id='" + nId + "']");
    var $textArea = $contentContainer.find("textarea");
    $textArea.val($textArea.text().trim()); // Fix for a very weird bug that prevents textarea value from being updated on setting its text
    if ($headerContainer.hasClass("notification-bar-shown")) {
        $contentContainer.stop(true, true).slideUp(500, function () {
            $headerContainer.removeClass("notification-bar-shown").addClass("notification-bar-hidden");
        });
    } else {
        $contentContainer.stop(true, true).slideDown(500, function () {
            $headerContainer.removeClass("notification-bar-hidden").addClass("notification-bar-shown");
        });
    }
}

// - ZDARZENIE usunięcia powiadomienia
function btnRemoveNotification_Click(e) {
    var nId = $(e.target).attr("notification-id");
    var $notificationContentContainer = $(e.target).closest(".notification-content-container[notification-id='" + nId + "']");
    var $notificationContent = $notificationContentContainer.contents();
    var $notificationContainerHeight = $notificationContentContainer.innerHeight();
    var $notificationHeaderContainer = $notificationContentContainer.closest(".notifications-content-container")
        .find(".notification-header-container[notification-id='" + nId + "']");

    showUniversalLoader({
        $target: $notificationContentContainer,
        hideTargetContent: true,
        loaderWidth: 64,
        loaderHeight: 64,
        containerHeight: $notificationContainerHeight - 20,
        css: { "margin-top": "5px", "margin-bottom": "5px" }
    });

    $.ajax({
        async: true,
        url: siteroot + "Base/RemoveNotification",
        method: "post",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({
            notifId: nId
        }),
        dataType: "json",
        success: function (data) {
            hideUniversalLoader({
                $target: $notificationContentContainer,
                callback: function () {
                    if (data.Status === "Success") {
                        showUniversalMessage({
                            $target: $notificationContentContainer,
                            containerHeight: $notificationContainerHeight - 20,
                            hideTargetContent: false,
                            fadeout: true,
                            fadetime: 500,
                            length: 1000,
                            message: data.Message,
                            messageColor: "#0b970d",
                            css: { "margin-top": "5px", "margin-bottom": "5px" },
                            callback: function() {
                                $notificationHeaderContainer.remove();
                                $notificationContentContainer.remove();
                                var title = $(".notifications-title-container").text();
                                var notificationsCount = parseFloat(title.between("(", ")"));
                                title = title.replace(/\(.+?\)/g, "(" + --notificationsCount + ")");
                                $(".notifications-title-container").text(title);

                                var $notificationsContentContainer = $("#divNotificationsPanelContainer")
                                    .find(".notifications-content-container")
                                    .first();

                                var notificationConatainersCount = $notificationsContentContainer
                                    .find(".notification-content-container")
                                    .length;

                                if (notificationConatainersCount <= 0) {
                                    showUniversalMessage({
                                        $target: $notificationsContentContainer,
                                        containerHeight: 84,
                                        hideTargetContent: true,
                                        fadeout: false,
                                        fadetime: 500,
                                        length: 1000,
                                        message: "Nie ma więcej wyników",
                                        messageColor: "#0b970d",
                                        css: { "margin-top": "5px", "margin-bottom": "5px" }
                                    });
                                }
                            }
                        });
                    } else {
                        showUniversalMessage({
                            $target: $notificationContentContainer,
                            containerHeight: $notificationContainerHeight - 20,
                            hideTargetContent: false,
                            fadeout: true,
                            fadetime: 500,
                            length: 1000,
                            message: data.Message,
                            messageColor: "#FF5468",
                            css: { "margin-top": "5px", "margin-bottom": "5px" },
                            callback: function() {
                                $notificationContent.visuallyShow();
                            }
                        });
                    }
                }
            });
        },
        error: function (err) {
            $("html").html(err.responseText);
        }
    });
}

// #endregion

// #region === NIEZAIMPLEMENTOWANE FUNKCJONALNOŚCI ===

// - zdarzenie kliknięcia niezaimplementowanego elementu
function unimplementedElement_Click(e) {
    var href = $(e.target).attr("href");
    if (!href.contains("Register") && !href.contains("Edit")) {
        e.preventDefault();
        var toolbarContent = $("#divToolbar").html();
        $("#divToolbar").empty();

        showUniversalMessage({
            $target: $("#divToolbar"),
            containerHeight: 34,
            forceHeight: true,
            fadeout: true,
            fadeTime: 500,
            length: 1000,
            message: "Funkcjonalność nie została jeszcze zaimplementowana",
            messageColor: "#0b970d",
            css: {
                "margin-top": "5px",
                "margin-bottom": "5px"
            },
            callback: function () {
                $("#divToolbar").append(toolbarContent);
            }
        });
    }
}

// #endregion

$(document).ready(function () {

    // #region === ANIMACJE ===

    //$(document).on("mouseenter", "input[type=button], input[type=submit]", function () { // żeby porzyciski ładowane dynamicznie również otrzymywały style
    ////$("input[type=button], input[type=submit]").on("mouseenter", function () {
    //    $(this).stop().animate({
    //        color: "white",
    //        backgroundColor: "#252525",
    //        borderColor: "white"
    //    }, 250);
    //});

    //$(document).on("mouseleave", "input[type=button], input[type=submit]", function () {
    ////$("input[type=button], input[type=submit]").on("mouseleave", function () {
    //    $(this).stop().animate({
    //        color: "yellow",
    //        backgroundColor: "transparent",
    //        borderColor: "#254117"
    //    }, 250);
    //});

    // #endregion
    
    // #region === OKNO PRZEGLĄDARKI ===

    $(window).resize(function (e) {
        window_Resize(e);
    });

    // #endregion

    // #region === PANEL LOGOWANIA ===

    displayLoginPanel();

    $(document).on("keyup", "#frmLoginPanel input", function (e) {
        frmLoginPanel_input_KeyUp(e);
    });

    $(document).on("click", "#btnLoginSubmit", function (e) {
        btnLoginSubmit_Click(e);
    });

    $(document).on("click", "#lnkbtnLogout", function (e) {
        lnkbtnLogout_Click(e);
    });

    // #endregion

    // #region === PANEL WYSZUKIWANIA ===

    $(document).on("keyup click", "#txtSearch", function (e) {
        txtSearch_KeyUp_Click(e);
    });

    $(document).on("click", "#divSearchValidationIndicatorContainer", function(e) {
        divSearchValidationIndicatorContainer_Click(e);
    });

    displaySearchPanel();

    // #endregion

    // #region === PANEL POTENCJALNYCH ZNAJOMYCH ===

    //$("#divFriendsPanelContainer").hide();

    $(document).on("click", ".btn-add-friend", function(e) {
        btnAddFriend_Click(e);
    });

    // #endregion

    // #region === PANEL POWIADOMIEŃ ===

    displayNotificationsPanel();

    $(document).on("click", ".notifications-title-container", function (e) {
        notificationsTitleConteiner_Click(e); //.notifications-content-container
    });

    $(document).on("click", ".notification-header-container", function (e) {
        notificationHeaderContainer_Click(e); //.notification-content-container
    });
    
    $(document).on("click", ".btn-remove-notification", function (e) {
        btnRemoveNotification_Click(e); 
    });


    // #endregion

    // #region === NIEZAIMPLEMENTOWANE FUNKCJONALNOŚCI ===

    $(document).on("click", "a[href*='User'], a[href*='ViewSwitcher'], a[href*='Home/About']", function (e) {
        unimplementedElement_Click(e);
    });

    // #endregion
});