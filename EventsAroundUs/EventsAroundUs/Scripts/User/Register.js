/// <reference path="../_references.js" />

$(document).ready(function() {

    // Panel Rejestracji

    function addValidationToRegisterPanel() {
        $("#frmRegisterPanel").validate({
            focusInvalid: false,
            onkeyup: false, // tylko false, true jest domyślnie, jeśli wpiszemy true, to wyrzuci błąd
            onfocusout: false, // wywoływane TYLKO ręcznie
            onsubmit: false,
            errorElement: "div",
            success: function (label, element) {
                var isPending = $(element).validate().pendingRequest !== 0;
                if (isPending)
                    return;
                toggleIndividualValidator({
                    input: $(element),
                    option: "show",
                    validationName: "RegistrationValidation",
                    errorElement: label,
                    container: $(element).parent().parent().parent().find(".validation-indicator-container"),
                    inputBackgroundColor: "rgba(11, 115, 12, 0.97)", //#0b730c //#0b970d
                    inputBorderColor: "#0b970d",
                    validationMessageColor: "#0b970d",
                    validationImage: "url('" + siteroot + "Images/Correct.png')"
                });
            },
            errorPlacement: function (error, element) {
                var isPending = element.validate().pendingRequest !== 0;
                if (isPending)
                    return;
                toggleIndividualValidator({
                    input: element,
                    option: "show",
                    validationName: "RegistrationValidation",
                    errorElement: error,
                    container: $(element).parent().parent().parent().find(".validation-indicator-container"),
                    inputBackgroundColor: "rgba(245, 27, 52, 0.97)", //#f51b34 //#FF5468
                    inputBorderColor: "#FF5468",
                    validationMessageColor: "#FF5468",
                    validationImage: "url('" + siteroot + "Images/Incorrect.png')"
                });
            },
            rules: {
                "UserName": {
                    required: true,
                    rangelength: [3, 25],
                    regex: /^[a-zA-Z]+$/,
                    remote: {
                        url: siteroot + "User/IsUserNameAvailable",
                        dataFilter: function (data) {
                            var json = JSON.parse(data);
                            if (json.ResultString === "Success") {
                                return '"true"';
                            }
                            return "\"" + json.Message + "\"";
                        }
                    }
                },
                "Password": {
                    required: true,
                    regex: /(?=^.{6,25}$)(?=.*\d)(?=.*[A-Za-z])(?!.*\s).*$/
                },
                "ConfirmPassword": {
                    required: true,
                    equalTo: "#txtPassword"
                },
                "Email": {
                    required: true,
                    regex: /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i, // /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i,
                    remote: {
                        url: siteroot + "User/IsEmailAvailable",
                        dataFilter: function (data) {
                            var json = JSON.parse(data);
                            if (json.ResultString === "Success") {
                                return '"true"';
                            }
                            return "\"" + json.Message + "\"";
                        }
                    }
                }
            },
            messages: {
                "UserName": {
                    required: "Nazwa Użytkownika jest wymagana",
                    rangelength: "Nazwa Użytkownika musi mieć od 3 do 25 znaków",
                    regex: "Nazwa Użytkownika musi składać się wyłącznie z liter",
                    remote: "Nazwa Użytkownika jest już używana"
                },
                "Password": {
                    required: "Hasło jest wymagane",
                    regex: "Hasło musi zawierać 6-25 znaków, co najmniej jedną cyfrę i jedną literę"
                },
                "ConfirmPassword": {
                    required: "Powtórzenie Hasła jest wymagane",
                    equalTo: "Hasła muszą być takie same"
                },
                "Email": {
                    required: "Email jest wymagany",
                    regex: "To nie jest poprawny adres email",
                    remote: "Email jest już używany"
                }
            }
        });
    }

    function attachEventsToRegisterPanel() {
        $("#frmRegisterPanel input").not(":button").on("focusout", function (e) {
            var $this = $(e.target);
            if ($this.val()) {
                var loaderOptions = {
                    input: $this,
                    validationName: "RegistrationValidation",
                    option: "show",
                    loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                    container: $this.parent().parent().parent().find(".validation-indicator-container")
                };

                var $txtConfirmPassword = $("#txtConfirmPassword");
                var confirmPasswordLoaderOptions = {
                    input: $txtConfirmPassword,
                    validationName: "RegistrationValidation",
                    option: "show",
                    loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                    container: $txtConfirmPassword.parent().parent().parent().find(".validation-indicator-container")
                };

                var validator = $("#frmRegisterPanel").data("validator");

                $this.removeData("previousValue");
                toggleIndividualLoader(loaderOptions);
                validator.element($this);

                if ($this.attr("id") === "txtPassword" && $txtConfirmPassword.val()) {
                    $txtConfirmPassword.removeData("previousValue");
                    toggleIndividualLoader(confirmPasswordLoaderOptions);
                    validator.element($txtConfirmPassword);
                }

                $this.not(":button").off().on("keyup", function (evt) {
                    var excludedKeys = [ 16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225 ];

                    if (evt.which === 9 && !$this.val() || $.inArray(evt.keyCode, excludedKeys) !== -1) {
                        return;
                    }

                    $this.removeData("previousValue");
                    toggleIndividualLoader(loaderOptions);
                    validator.element($this);

                    if ($this.attr("id") === "txtPassword" && $txtConfirmPassword.val()) {
                        $txtConfirmPassword.removeData("previousValue");
                        toggleIndividualLoader(confirmPasswordLoaderOptions);
                        validator.element($txtConfirmPassword);
                    }
                });
            }
        });

        var registerPanelContent;
        var registerPanelContainerHeight;
        var validRegisterPendingTimeout;
        function registerUserAsync() {
            var validator = $("#frmRegisterPanel").data("validator"); // .validate();
            var isPending = validator.pendingRequest !== 0;
            var isValid = validator.checkForm();
            validator.submitted = {};

            var inputNamesArr = [];
            $("#frmRegisterPanel input").each(function (i, el) {
                if (!validator.pending[$(el).attr("name")])
                    inputNamesArr.push($(el).attr("name"));
            });
            inputNamesArr = inputNamesArr.filter(function (n) { return n !== undefined });

            $.each(inputNamesArr, function (i, val) {
                validator.element($("#frmRegisterPanel input[name=" + val + "]").first());
            });

            if (isPending) {
                if (typeof validRegisterPendingTimeout !== "undefined") {
                    clearTimeout(validRegisterPendingTimeout);
                }
                validRegisterPendingTimeout = setTimeout(function () {
                    registerUserAsync();
                }, 200);
                return;
            } else if (!isValid) {
                $("#btnRegister").prop("disabled", false);
                hideUniversalLoader({
                    $target: $("#divRegisterPanelContainer").find(".content-container").parent(),
                    callback: function () {
                        registerPanelContent.visuallyShow();
                    }
                });
                return;
            }

            var email = $("#txtEmail").val();

            $.ajax({
                async: true,
                url: siteroot + "User/RegisterUser",
                method: "post",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify({
                    UserName: $("#txtUserName").val(),
                    Password: $("#txtPassword").val(),
                    ConfirmPassword: $("#txtConfirmPassword").val(),
                    Email: email
                }),
                dataType: "json",
                success: function (data) {
                    hideUniversalLoader({
                        $target: $("#divRegisterPanelContainer").find(".content-container").parent(),
                        callback: function() {
                            var message = data.Message.toString();
                            var color = data.ResultString === "Success" ? "#0b970d" : "#FF5468";
                            //var colonOccurance = message.lastIndexOf(":");
                            //message = colonOccurance > -1 ? message.substring(0, colonOccurance + 2) + "<span class='linklike'>" + message.substring(colonOccurance + 2) + "</span>" : message;

                            if (message) {
                                if (data.ResultString === "Success") {
                                    showUniversalMessage({
                                        $target: $("#divRegisterPanelContainer").find(".content-container").parent(),
                                        containerHeight: registerPanelContainerHeight - 10,
                                        fadeout: false,
                                        fadetime: 500,
                                        message: message,
                                        messageColor: color,
                                        //css: { "margin-top": "5px", "margin-bottom": "5px" },
                                        callback: function() {
                                            $("#frmRegisterPanel input").off();
                                            displayActivateAccountPanel({
                                                overrideSession: true,
                                                fillEmailWith: email
                                            });
                                        }
                                    });
                                } else {
                                    showUniversalMessage({
                                        $target: $("#divRegisterPanelContainer").find(".content-container").parent(),
                                        containerHeight: registerPanelContainerHeight - 10,
                                        fadeout: true,
                                        fadetime: 500,
                                        length: 1000,
                                        message: message,
                                        messageColor: color,
                                        //css: { "margin-top": "5px", "margin-bottom": "5px" },
                                        callback: function() {
                                            registerPanelContent.visuallyShow();
                                            $("#btnRegister").prop("disabled", false);
                                        }
                                    });
                                }
                            } else {
                                if (data.ResultString === "Success") {
                                    $("#frmRegisterPanel input").off();
                                    displayActivateAccountPanel({
                                        overrideSession: true,
                                        fillEmailWith: email
                                    });
                                } else {
                                    registerPanelContent.visuallyShow();
                                    $("#btnRegister").prop("disabled", false);
                                }
                            }
                        }
                    });
                    
                },
                error: function (err) {
                    $("html").html(err.responseText);
                }
            });
        }

        $("#btnRegister").click(function (e) {
            $(e.target).prop("disabled", true);

            var $inputs = $("#frmRegisterPanel input").not(":button");
            var validator = $("#frmRegisterPanel").data("validator");

            $inputs.each(function (i, el) {
                var $this = $(el);

                $this.removeData("previousValue");

                var loaderOptions = {
                    input: $this,
                    validationName: "RegistrationValidation",
                    option: "show",
                    loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                    container: $this.parent().parent().parent().find(".validation-indicator-container")
                };

                var $txtConfirmPassword = $("#txtConfirmPassword");
                var confirmPasswordLoaderOptions = {
                    input: $txtConfirmPassword,
                    validationName: "RegistrationValidation",
                    option: "show",
                    loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                    container: $txtConfirmPassword.parent().parent().parent().find(".validation-indicator-container")
                };

                toggleIndividualLoader(loaderOptions);

                $this.off().on("keyup", function (evt) {
                    var excludedKeys = [16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225];

                    if (evt.which === 9 && !$this.val() || $.inArray(evt.keyCode, excludedKeys) !== -1) {
                        return;
                    }

                    $this.removeData("previousValue");
                    toggleIndividualLoader(loaderOptions);
                    validator.element($this);

                    if ($this.attr("id") === "txtPassword" && $txtConfirmPassword.val()) {
                        $txtConfirmPassword.removeData("previousValue");
                        toggleIndividualLoader(confirmPasswordLoaderOptions);
                        validator.element($txtConfirmPassword);
                    }
                });
            });

            registerPanelContainerHeight = $("#divRegisterPanelContainer").find(".content-container").parent().innerHeight();
            registerPanelContent = $("#divRegisterPanelContainer").find(".content-container").parent().contents();
            showUniversalLoader({
                $target: $("#divRegisterPanelContainer").find(".content-container").parent(),
                hideTargetContent: true,
                containerHeight: registerPanelContainerHeight - 10,
                loaderHeight: 64,
                loaderWidth: 64//,
                //css: { "margin-top": "5px", "margin-bottom": "5px" }
            });

            validator.checkForm();
            
            registerUserAsync();
        });
    }

    function displayRegisterPanel(args) {
        args = args || {};
        var overrideSession = args.overrideSession || false;

        var registerPanelContent = $("#divRegisterPanelContainer").contents();
        showUniversalLoader({
            $target: $("#divRegisterPanelContainer"),
            hideTargetContent: true,
            loaderWidth: 64,
            loaderHeight: 64,
            containerHeight: 84,
            css: { "margin-top": "5px", "margin-bottom": "5px" }
        });

        $.ajax({
            async: true,
            url: siteroot + "User/GetRegisterPanel",
            method: "post",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({ }),
            dataType: "json",
            success: function (data) {
                hideUniversalLoader({
                    $target: $("#divRegisterPanelContainer"),
                    callback: function() {
                        if (data.DisplayPanel === true || overrideSession === true) {
                            registerPanelContent.remove();
                            var sRegisterPanelView = data.PartialView.replace(/(\r\n|\n|\r)/gm, "");
                            var registerPanelView = $.parseHTML(sRegisterPanelView);
                            $(registerPanelView).appendTo($("#divRegisterPanelContainer"));
                            addValidationToRegisterPanel();
                            attachEventsToRegisterPanel();
                        } else {
                            registerPanelContent.visuallyShow();
                        }
                    }
                });
            },
            error: function (err) {
                $("html").html(err.responseText);
            }
        });
    }

    displayRegisterPanel();

    $(document).one("click", "#lnkbtnLoadRegisterPanel", function () {
        displayRegisterPanel({
            overrideSession: true
        });
    });
    
    // Panel Aktywacji

    function addValidationToActivateAccountPanel() {
        $("#frmActivateAccountPanel").validate({
            focusInvalid: false,
            onkeyup: false, // tylko false, true jest domyślnie, jeśli wpiszemy true, to wyrzuci błąd
            onfocusout: false, // wywoływane TYLKO ręcznie
            onsubmit: false,
            errorElement: "div",
            success: function (label, element) {
                var isElementPending = $(element).validate().pendingRequest !== 0; // walidator w zależności od aktuialnie walidowanego Panelui!

                if (isElementPending) {
                    return; 
                }

                toggleIndividualValidator({
                    input: $(element),
                    option: "show",
                    validationName: "ActivationValidation",
                    errorElement: label,
                    container: $(element).parent().parent().parent().find(".validation-indicator-container"),
                    inputBackgroundColor: "rgba(11, 115, 12, 0.97)", //#0b730c //#0b970d
                    inputBorderColor: "#0b970d",
                    validationMessageColor: "#0b970d",
                    validationImage: "url('" + siteroot + "Images/Correct.png')"
                });
            },
            errorPlacement: function (error, element) {
                var isElementPending = element.validate().pendingRequest !== 0; // walidator w zależności od aktuialnie walidowanego Panelui!

                if (isElementPending) {
                    return;
                }

                toggleIndividualValidator({
                    input: element,
                    option: "show",
                    validationName: "ActivationValidation",
                    errorElement: error,
                    container: $(element).parent().parent().parent().find(".validation-indicator-container"),
                    inputBackgroundColor: "rgba(245, 27, 52, 0.97)", //#f51b34 //#FF5468
                    inputBorderColor: "#FF5468",
                    validationMessageColor: "#FF5468",
                    validationImage: "url('" + siteroot + "Images/Incorrect.png')"
                });
            },
            rules: {
                "ActivationEmail": {
                    required: true,
                    regex: /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i, // /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i,
                    remote: {
                        url: siteroot + "User/IsEmailInDatabaseAjax",
                        //method: "post",
                        dataFilter: function (data) {
                            var json = JSON.parse(data);
                            if (json.ResultString === "Success") {
                                return '"true"';
                            }
                            return "\"" + json.Message + "\"";
                        }
                    }
                },
                "ActivationCode": {
                    required: true,
                    regex: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
                    remote: {
                        data: {
                            "activationEmail": function() {
                                return $("#txtActivationEmail").val();
                            }
                        },
                        url: siteroot + "User/IsActivationCodeValid",
                        //method: "post",
                        dataFilter: function (data) {
                            var json = JSON.parse(data);
                            if (json.ResultString === "Success") {
                                return '"true"';
                            }
                            return "\"" + json.Message + "\"";
                        }
                    }
                }
            },
            messages: {
                "ActivationEmail": {
                    required: "Email jest wymagany",
                    regex: "To nie jest poprawny adres Email",
                    remote: "Podany Email nie istnieje w Bazie Danych"
                },
                "ActivationCode": {
                    required: "Kod Aktywacyjny jest wymagany",
                    regex: "Kod Aktywacyjny ma niepoprawny Format",
                    remote: "Kod aktywacyjny dla podanego Emaila jest błędny"
                }
            }
        });
    }

    function attachEventsToActivateAccountPanel() {
        $("#frmActivateAccountPanel input").not(":button").on("focusout", function (e) {
            var $this = $(e.target);
            if ($this.val()) {
                var loaderOptions = {
                    input: $this,
                    validationName: "ActivationValidation",
                    option: "show",
                    loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                    container: $this.parent().parent().parent().find(".validation-indicator-container")
                };

                var validator =  $("#frmActivateAccountPanel").data("validator");

                $this.removeData("previousValue");
                toggleIndividualLoader(loaderOptions);
                validator.element($this);

                $this.not(":button").off().on("keyup", function (evt) {
                    var excludedKeys = [16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225];

                    if (evt.which === 9 && !$this.val() || $.inArray(evt.keyCode, excludedKeys) !== -1) {
                        return;
                    }

                    $this.removeData("previousValue");
                    toggleIndividualLoader(loaderOptions);
                    validator.element($this);
                });
            }
        });

        var activateAccountPanelContent;
        var activateAccountPanelContainerHeight;
        var validActivatePendingTimeout;
        function activateUserAsync() {
            var validator = $("#frmActivateAccountPanel").validate(); // .data("validator")
            var isPending = validator.pendingRequest !== 0;
            var isValid = validator.checkForm();
            validator.submitted = {};

            var inputNamesArr = [];
            $("#frmActivateAccountPanel input").each(function (i, el) {
                if (!validator.pending[$(el).attr("name")])
                    inputNamesArr.push($(el).attr("name"));
            });
            inputNamesArr = inputNamesArr.filter(function (n) { return n !== undefined });

            $.each(inputNamesArr, function (i, val) {
                validator.element($("#frmActivateAccountPanel input[name=" + val + "]").first());
            });

            if (isPending) {
                if (typeof validActivatePendingTimeout !== "undefined") {
                    clearTimeout(validActivatePendingTimeout);
                }
                validActivatePendingTimeout = setTimeout(function() {
                    activateUserAsync();
                }, 200);
                return;
            } else if (!isValid) {
                $("#btnActivateAccount").prop("disabled", false);
                hideUniversalLoader({
                    $target: $("#divActivateAccountPanelContainer").find(".content-container").parent(),
                    callback: function() {
                        activateAccountPanelContent.visuallyShow();
                    }
                });
                return;
            }

            $.ajax({
                async: true,
                url: siteroot + "User/ActivateUserAccount",
                method: "post",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify({
                    ActivationEmail: $("#txtActivationEmail").val(),
                    ActivationCode: $("#txtActivationCode").val()
                }),
                dataType: "json",
                success: function (data) {
                    hideUniversalLoader({
                        $target: $("#divActivateAccountPanelContainer").find(".content-container").parent(),
                        callback: function () {
                            var message = data.Message.toString();
                            var color = data.ResultString === "Success" ? "#0b970d" : "#FF5468";
                            //var colonOccurance = message.lastIndexOf(":");
                            //message = colonOccurance > -1 ? message.substring(0, colonOccurance + 2) + "<span class='linklike'>" + message.substring(colonOccurance + 2) + "</span>" : message;

                            if (message) {
                                if (data.ResultString === "Success") {
                                    showUniversalMessage({
                                        $target: $("#divActivateAccountPanelContainer").find(".content-container").parent(),
                                        containerHeight: activateAccountPanelContainerHeight - 10,
                                        fadeout: false,
                                        fadetime: 500,
                                        message: message,
                                        messageColor: color,
                                        //css: { "margin-top": "5px", "margin-bottom": "5px" },
                                        callback: function () {
                                            $("#frmActivateAccountPanel input").off();
                                        }
                                    });
                                } else {
                                    showUniversalMessage({
                                        $target: $("#divActivateAccountPanelContainer").find(".content-container").parent(),
                                        containerHeight: activateAccountPanelContainerHeight - 10,
                                        fadeout: true,
                                        fadetime: 500,
                                        length: 1000,
                                        message: message,
                                        messageColor: color,
                                        //css: { "margin-top": "5px", "margin-bottom": "5px" },
                                        callback: function () {
                                            activateAccountPanelContent.visuallyShow();
                                            $("#btnActivateAccount").prop("disabled", false);
                                        }
                                    });
                                }
                            } else {
                                if (data.ResultString === "Success") {
                                    $("#frmActivateAccountPanel input").off();
                                } else {
                                    activateAccountPanelContent.visuallyShow();
                                    $("#btnActivateAccount").prop("disabled", false);
                                }
                            }
                        }
                    });
                },
                error: function (err) {
                    $("html").html(err.responseText);
                }
            });
        }

        $("#btnActivateAccount").click(function (e) {
            $(e.target).prop("disabled", true);

            var $inputs = $("#frmActivateAccountPanel input").not(":button");
            var validator = $("#frmActivateAccountPanel").data("validator");

            $inputs.each(function (i, el) {
                var $this = $(el);

                $this.removeData("previousValue");

                var loaderOptions = {
                    input: $this,
                    validationName: "ActivationValidation",
                    option: "show",
                    loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                    container: $this.parent().parent().parent().find(".validation-indicator-container")
                };

                toggleIndividualLoader(loaderOptions);

                $this.off().on("keyup", function (evt) {
                    var excludedKeys = [16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225];

                    if (evt.which === 9 && !$this.val() || $.inArray(evt.keyCode, excludedKeys) !== -1) {
                        return;
                    }

                    $this.removeData("previousValue");
                    toggleIndividualLoader(loaderOptions);
                    validator.element($this);
                });
                
            });

            activateAccountPanelContainerHeight = $("#divActivateAccountPanelContainer").find(".content-container").parent().innerHeight();
            activateAccountPanelContent = $("#divActivateAccountPanelContainer").find(".content-container").parent().contents();
            showUniversalLoader({
                $target: $("#divActivateAccountPanelContainer").find(".content-container").parent(),
                hideTargetContent: true,
                containerHeight: activateAccountPanelContainerHeight - 10,
                loaderHeight: 64,
                loaderWidth: 64,
                //css: { "margin-top": "5px", "margin-bottom": "5px" }
            });

            validator.checkForm();

            activateUserAsync();
        });

        var validSendActivationPendingTimeout;
        function sendActivationCodeAsync() {
            var validator = $("#frmActivateAccountPanel").data("validator");
            var isPending = validator.pendingRequest !== 0;
            var isValid = validator.check($("#txtActivationEmail"));
            validator.submitted = {};

            var inputNamesArr = [];
            $("#frmActivateAccountPanel").find("#txtActivationEmail").each(function (i, el) {
                if (!validator.pending[$(el).attr("name")])
                    inputNamesArr.push($(el).attr("name"));
            });
            inputNamesArr = inputNamesArr.filter(function (n) { return n !== undefined });

            $.each(inputNamesArr, function (i, val) {
                validator.element($("#frmActivateAccountPanel input[name=" + val + "]").first());
            });

            if (isPending) {
                if (typeof validSendActivationPendingTimeout !== "undefined") {
                    clearTimeout(validSendActivationPendingTimeout);
                }
                validSendActivationPendingTimeout = setTimeout(function() {
                    sendActivationCodeAsync();
                }, 200);
                return;
            } else if (!isValid) {
                $("#lnkbtnSendActivationCodeAgain").removeClass("linklike_disabled").addClass("linklike");
                $("#btnActivateAccount").prop("disabled", false);
                hideUniversalLoader({
                    $target: $("#divActivateAccountPanelContainer").find(".content-container").parent(),
                    callback: function () {
                        activateAccountPanelContent.visuallyShow();
                    }
                });
                return;
            }

            $.ajax({
                async: true,
                url: siteroot + "User/SendActivationEmailAgain",
                method: "post",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify({
                    ActivationEmail: $("#txtActivationEmail").val()
                }),
                dataType: "json",
                success: function (data) {
                    hideUniversalLoader({
                        $target: $("#divActivateAccountPanelContainer").find(".content-container").parent(),
                        callback: function () {
                            var message = data.Message.toString();
                            var color = data.ResultString === "Success" ? "#0b970d" : "#FF5468";
                            //var colonOccurance = message.lastIndexOf(":");
                            //message = colonOccurance > -1 ? message.substring(0, colonOccurance + 2) + "<span class='linklike'>" + message.substring(colonOccurance + 2) + "</span>" : message;

                            if (message) {
                                if (data.ResultString === "Success") {
                                    showUniversalMessage({
                                        $target: $("#divActivateAccountPanelContainer").find(".content-container").parent(),
                                        containerHeight: activateAccountPanelContainerHeight - 10,
                                        fadeout: true,
                                        fadetime: 500,
                                        message: message,
                                        messageColor: color,
                                        //css: { "margin-top": "5px", "margin-bottom": "5px" },
                                        callback: function () {
                                            var $txtActivationCode = $("#txtActivationCode");
                                            $txtActivationCode.val("");
                                            emptyIndividualLoader({
                                                input: $txtActivationCode,
                                                validationName: "ActivationValidation"
                                            });
                                            activateAccountPanelContent.visuallyShow();
                                            //$("#lnkbtnSendActivationCodeAgain").prop("disabled", false);
                                            //$("#lnkbtnSendActivationCodeAgain").removeClass("linklike_disabled").addClass("linklike");
                                        }
                                    });
                                } else {
                                    showUniversalMessage({
                                        $target: $("#divActivateAccountPanelContainer").find(".content-container").parent(),
                                        containerHeight: activateAccountPanelContainerHeight - 10,
                                        fadeout: true,
                                        fadetime: 500,
                                        length: 1000,
                                        message: message,
                                        messageColor: color,
                                        //css: { "margin-top": "5px", "margin-bottom": "5px" },
                                        callback: function () {
                                            activateAccountPanelContent.visuallyShow();
                                            //$("#lnkbtnSendActivationCodeAgain").prop("disabled", false);
                                            $("#lnkbtnSendActivationCodeAgain").removeClass("linklike_disabled").addClass("linklike");
                                        }
                                    });
                                }
                            } else {
                                if (data.ResultString === "Success") {
                                    var $txtActivationCode = $("#txtActivationCode");
                                    $txtActivationCode.val("");
                                    emptyIndividualLoader({
                                        input: $txtActivationCode,
                                        validationName: "ActivationValidation"
                                    });

                                    activateAccountPanelContent.visuallyShow();
                                    //$("#lnkbtnSendActivationCodeAgain").prop("disabled", false);
                                    //$("#lnkbtnSendActivationCodeAgain").removeClass("linklike_disabled").addClass("linklike");
                                } else {
                                    activateAccountPanelContent.visuallyShow();
                                    //$("#lnkbtnSendActivationCodeAgain").prop("disabled", false);
                                    $("#lnkbtnSendActivationCodeAgain").removeClass("linklike_disabled").addClass("linklike");
                                }
                            }
                        }
                    });
                },
                error: function (err) {
                    $("html").html(err.responseText);
                }
            });
        };

        $("#lnkbtnSendActivationCodeAgain").click(function (e) {
            if (!$(e.target).hasClass("linklike"))
                return;

            $(e.target).removeClass("linklike").addClass("linklike_disabled");
            //$(e.target).prop("disabled", true);

            var validator = $("#frmActivateAccountPanel").data("validator");

            var $emailInput = $("#frmActivateAccountPanel").find("#txtActivationEmail").first();
            $emailInput.removeData("previousValue");

            var loaderOptions = {
                input: $emailInput,
                validationName: "ActivationValidation",
                option: "show",
                loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                container: $emailInput.parent().parent().parent().find(".validation-indicator-container")
            };

            $("#frmActivateAccountPanel").find("input.form-control").each(function (i, el) {
                if ($(el).attr("id") !== "txtActivationEmail") {
                    $(el).val("");
                }
                removeInputFormatting({
                    validationName: "ActivationValidation",
                    input: $(el),
                    container: $(el).parent().parent().parent().find(".validation-indicator-container")
                });
            });

            toggleIndividualLoader(loaderOptions);

            $emailInput.off().on("keyup", function (evt) {
                var excludedKeys = [16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225];

                if (evt.which === 9 && !$emailInput.val() || $.inArray(evt.keyCode, excludedKeys) !== -1) {
                    return;
                }

                $emailInput.removeData("previousValue");
                toggleIndividualLoader(loaderOptions);
                validator.element($emailInput);
            });

            activateAccountPanelContainerHeight = $("#divActivateAccountPanelContainer").find(".content-container").parent().innerHeight();
            activateAccountPanelContent = $("#divActivateAccountPanelContainer").find(".content-container").parent().contents();
            showUniversalLoader({
                $target: $("#divActivateAccountPanelContainer").find(".content-container").parent(),
                hideTargetContent: true,
                containerHeight: activateAccountPanelContainerHeight - 10,
                loaderHeight: 64,
                loaderWidth: 64,
                //css: { "margin-top": "5px", "margin-bottom": "5px" }
            });

            validator.check($emailInput);

            sendActivationCodeAsync();
        });
    }

    function displayActivateAccountPanel(args) {
        args = args || {};
        var overrideSession = args.overrideSession || false;
        var fillEmailWith = args.fillEmailWith || null;

        var activateAccountPanelContent = $("#divActivateAccountPanelContainer").contents();
        showUniversalLoader({
            $target: $("#divActivateAccountPanelContainer"),
            hideTargetContent: true,
            loaderWidth: 64,
            loaderHeight: 64,
            containerHeight: 84,
            css: { "margin-top": "5px", "margin-bottom": "5px" }
        });

        $.ajax({
            async: true,
            url: siteroot + "User/GetActivateAccountPanel",
            method: "post",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({ }),
            dataType: "json",
            success: function (data) {
                hideUniversalLoader({
                    $target: $("#divActivateAccountPanelContainer"),
                    callback: function () {
                        if (data.DisplayPanel === true || overrideSession === true) {
                            activateAccountPanelContent.remove();
                            var sActivateAccountPanelView = data.PartialView.replace(/(\r\n|\n|\r)/gm, "");
                            var activateAccountPanelView = $.parseHTML(sActivateAccountPanelView);
                            $(activateAccountPanelView).appendTo($("#divActivateAccountPanelContainer"));
                            addValidationToActivateAccountPanel();
                            attachEventsToActivateAccountPanel();

                            if (fillEmailWith) {
                                $("#frmActivateAccountPanel").find("#txtActivationEmail").val(fillEmailWith);
                            }
                        } else {
                            activateAccountPanelContent.visuallyShow();
                        }
                    }
                });
            },
            error: function (err) {
                $("html").html(err.responseText);
            }
        });
    }

    displayActivateAccountPanel();

    $(document).one("click", "#lnkbtnLoadActivateAccountPanel", function () {
        displayActivateAccountPanel({
            overrideSession: true
        });
    });

    // Panel Przypomnienia Hasła

    function addValidationToRemindPasswordPanel() {
        $("#frmRemindPasswordPanel").validate({
            focusInvalid: false,
            onkeyup: false, 
            onfocusout: false, 
            onsubmit: false,
            errorElement: "div",
            success: function (label, element) {
                var isElementPending = $(element).validate().pendingRequest !== 0;

                if (isElementPending) {
                    return;
                }

                toggleIndividualValidator({
                    input: $(element),
                    option: "show",
                    validationName: "RemindPasswordValidation",
                    errorElement: label,
                    container: $(element).parent().parent().parent().find(".validation-indicator-container"),
                    inputBackgroundColor: "rgba(11, 115, 12, 0.97)",
                    inputBorderColor: "#0b970d",
                    validationMessageColor: "#0b970d",
                    validationImage: "url('" + siteroot + "Images/Correct.png')"
                });
            },
            errorPlacement: function (error, element) {
                var isElementPending = element.validate().pendingRequest !== 0;

                if (isElementPending) {
                    return;
                }

                toggleIndividualValidator({
                    input: element,
                    option: "show",
                    validationName: "RemindPasswordValidation",
                    errorElement: error,
                    container: $(element).parent().parent().parent().find(".validation-indicator-container"),
                    inputBackgroundColor: "rgba(245, 27, 52, 0.97)",
                    inputBorderColor: "#FF5468",
                    validationMessageColor: "#FF5468",
                    validationImage: "url('" + siteroot + "Images/Incorrect.png')"
                });
            },
            rules: {
                "RemindPasswordEmail": {
                    required: true,
                    regex: /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i, // /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i,
                    remote: {
                        url: siteroot + "User/IsEmailInDatabaseAjax",
                        dataFilter: function (data) {
                            var json = JSON.parse(data);
                            if (json.ResultString === "Success") {
                                return '"true"';
                            }
                            return "\"" + json.Message + "\"";
                        }
                    }
                },
                "RemindPasswordCode": {
                    required: true,
                    regex: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
                    remote: {
                        data: {
                            "remindPasswordEmail": function () {
                                return $("#txtRemindPasswordEmail").val();
                            }
                        },
                        url: siteroot + "User/IsRemindPasswordCodeValid",
                        dataFilter: function (data) {
                            var json = JSON.parse(data);
                            if (json.ResultString === "Success") {
                                return '"true"';
                            }
                            return "\"" + json.Message + "\"";
                        }
                    }
                },
                //"RemindPasswordOldPassword": {
                //    required: true,
                //    regex: /(?=^.{6,25}$)(?=.*\d)(?=.*[A-Za-z])(?!.*\s).*$/,
                //    notEqualTo: "#txtRemindPasswordNewPassword",
                //    remote: {
                //        data: {
                //            "remindPasswordEmail": function () {
                //                return $("#txtRemindPasswordEmail").val();
                //            }
                //        },
                //        url: siteroot + "User/IsRemindPasswordOldPasswordValid",
                //        dataFilter: function (data) {
                //            var json = JSON.parse(data);
                //            if (json.ResultString === "Success") {
                //                return '"true"';
                //            }
                //            return "\"" + json.Message + "\"";
                //        }
                //    }
                //},
                "RemindPasswordNewPassword": {
                    required: true,
                    regex: /(?=^.{6,25}$)(?=.*\d)(?=.*[A-Za-z])(?!.*\s).*$/,
                    equalTo: "#txtRemindPasswordConfirmPassword",
                    notEqualTo: "#txtRemindPasswordOldPassword"
                },
                "RemindPasswordConfirmPassword": {
                    required: true,
                    equalTo: "#txtRemindPasswordNewPassword"
                }
            },
            messages: {
                "RemindPasswordEmail": {
                    required: "Email jest wymagany",
                    regex: "To nie jest poprawny adres Email",
                    remote: "Podany Email nie istnieje w Bazie Danych"
                },
                "RemindPasswordCode": {
                    required: "Kod Weryfikacyjny jest wymagany",
                    regex: "Kod Weryfikacyjny ma niepoprawny Format",
                    remote: "Kod Weryfikacyjny dla podanego Emaila jest błędny"
                },
                //"RemindPasswordOldPassword": {
                //    required: "Stare Hasło jest wymagane",
                //    regex: "Stare Hasło musi zawierać 6-25 znaków, co najmniej jedną cyfrę i jedną literę",
                //    notEqualTo: "Stare i Nowe Hasło muszą się różnić",
                //    remote: "Stare Hasło dla Użytkownika o podanym Emailu jest błędne"
                //},
                "RemindPasswordNewPassword": {
                    required: "Nowe Hasło jest wymagane",
                    regex: "Nowe Hasło musi zawierać 6-25 znaków, co najmniej jedną cyfrę i jedną literę",
                    equalTo: "Hasła muszą być takie same",
                    notEqualTo: "Stare i Nowe Hasło muszą się różnić"
                },
                "RemindPasswordConfirmPassword": {
                    required: "Powtórzenie Hasła jest wymagane",
                    equalTo: "Hasła muszą być takie same"
                }
            }
        });
    }

    function attachEventsToRemindPasswordPanel() {
        $("#frmRemindPasswordPanel input").not(":button").on("focusout", function (e) {
            var $this = $(e.target);
            if ($this.val()) {
                var loaderOptions = {
                    input: $this,
                    validationName: "RemindPasswordValidation",
                    option: "show",
                    loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                    container: $this.parent().parent().parent().find(".validation-indicator-container")
                };

                var validator = $("#frmRemindPasswordPanel").data("validator");

                $this.removeData("previousValue");
                toggleIndividualLoader(loaderOptions);
                validator.element($this);

                var pwdsArray = ["RemindPasswordNewPassword", "RemindPasswordConfirmPassword"];
                if ($.inArray($this.attr("name"), pwdsArray) !== -1) {
                    pwdsArray = $.grep(pwdsArray, function (value) {
                        return value !== $this.attr("name");
                    });
                    $.each(pwdsArray, function(i, v) {
                        var $v = $("#txt" + v);
                        $v.removeData("previousValue");
                        toggleIndividualLoader({
                            input: $v,
                            validationName: "RemindPasswordValidation",
                            option: "show",
                            loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                            container: $v.parent().parent().parent().find(".validation-indicator-container")
                        });
                        validator.element($v);
                    });
                }

                $this.not(":button").off().on("keyup", function (evt) {
                    var excludedKeys = [16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225];

                    if (evt.which === 9 && !$this.val() || $.inArray(evt.keyCode, excludedKeys) !== -1) {
                        return;
                    }

                    $this.removeData("previousValue");
                    toggleIndividualLoader(loaderOptions);
                    validator.element($this);

                    if ($.inArray($this.attr("name"), pwdsArray) !== -1) {
                        pwdsArray = $.grep(pwdsArray, function (value) {
                            return value !== $this.attr("name");
                        });
                        $.each(pwdsArray, function(i, v) {
                            var $v = $("#txt" + v);
                            $v.removeData("previousValue");
                            toggleIndividualLoader({
                                input: $v,
                                validationName: "RemindPasswordValidation",
                                option: "show",
                                loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                                container: $v.parent().parent().parent().find(".validation-indicator-container")
                            });
                            validator.element($v);
                        });
                    }
                });
            }
        });

        var remindPasswordPanelContent;
        var remindPasswordPanelContainerHeight;
        var validRemindPasswordPendingTimeout;
        function remindUserPasswordAsync() {
            var validator = $("#frmRemindPasswordPanel").validate(); // .data("validator")
            var isPending = validator.pendingRequest !== 0;
            var isValid = validator.checkForm();
            validator.submitted = {};

            var inputNamesArr = [];
            $("#frmRemindPasswordPanel input").each(function (i, el) {
                if (!validator.pending[$(el).attr("name")])
                    inputNamesArr.push($(el).attr("name"));
            });
            inputNamesArr = inputNamesArr.filter(function (n) { return n !== undefined });

            $.each(inputNamesArr, function (i, val) {
                validator.element($("#frmRemindPasswordPanel input[name=" + val + "]").first());
            });

            if (isPending) {
                if (typeof validRemindPasswordPendingTimeout !== "undefined") {
                    clearTimeout(validRemindPasswordPendingTimeout);
                }
                validRemindPasswordPendingTimeout = setTimeout(function () {
                    remindUserPasswordAsync();
                }, 200);
                return;
            } else if (!isValid) {
                $("#btnRemindPassword").prop("disabled", false);
                hideUniversalLoader({
                    $target: $("#divRemindPasswordPanelContainer").find(".content-container").parent(),
                    callback: function () {
                        remindPasswordPanelContent.visuallyShow();
                    }
                });
                return;
            }

            $.ajax({
                async: true,
                url: siteroot + "User/RemindUserPassword",
                method: "post",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify({
                    RemindPasswordEmail: $("#txtRemindPasswordEmail").val(),
                    RemindPasswordCode: $("#txtRemindPasswordCode").val(),
                    RemindPasswordOldPassword: $("#txtRemindPasswordOldPassword").val(),
                    RemindPasswordNewPassword: $("#txtRemindPasswordNewPassword").val(),
                    RemindPasswordConfirmPassword: $("#txtRemindPasswordConfirmPassword").val()
                }),
                dataType: "json",
                success: function (data) {
                    hideUniversalLoader({
                        $target: $("#divRemindPasswordPanelContainer").find(".content-container").parent(),
                        callback: function () {
                            var message = data.Message.toString();
                            var color = data.ResultString === "Success" ? "#0b970d" : "#FF5468";
                            //var colonOccurance = message.lastIndexOf(":");
                            //message = colonOccurance > -1 ? message.substring(0, colonOccurance + 2) + "<span class='linklike'>" + message.substring(colonOccurance + 2) + "</span>" : message;

                            if (message) {
                                if (data.ResultString === "Success") {
                                    showUniversalMessage({
                                        $target: $("#divRemindPasswordPanelContainer").find(".content-container").parent(),
                                        containerHeight: remindPasswordPanelContainerHeight - 10,
                                        fadeout: false,
                                        fadetime: 500,
                                        message: message,
                                        messageColor: color,
                                        //css: { "margin-top": "5px", "margin-bottom": "5px" },
                                        callback: function () {
                                            $("#frmRemindPasswordPanel input").off();
                                        }
                                    });
                                } else {
                                    showUniversalMessage({
                                        $target: $("#divRemindPasswordPanelContainer").find(".content-container").parent(),
                                        containerHeight: remindPasswordPanelContainerHeight - 10,
                                        fadeout: true,
                                        fadetime: 500,
                                        length: 1000,
                                        message: message,
                                        messageColor: color,
                                        //css: { "margin-top": "5px", "margin-bottom": "5px" },
                                        callback: function () {
                                            remindPasswordPanelContent.visuallyShow();
                                            $("#btnRemindPassword").prop("disabled", false);
                                        }
                                    });
                                }
                            } else {
                                if (data.ResultString === "Success") {
                                    $("#frmRemindPasswordPanel input").off();
                                } else {
                                    remindPasswordPanelContent.visuallyShow();
                                    $("#btnRemindPassword").prop("disabled", false);
                                }
                            }
                        }
                    });
                },
                error: function (err) {
                    $("html").html(err.responseText);
                }
            });
        }

        $("#btnRemindPassword").click(function (e) {
            $(e.target).prop("disabled", true);

            var $inputs = $("#frmRemindPasswordPanel input").not(":button");
            var validator = $("#frmRemindPasswordPanel").data("validator");

            $inputs.each(function (i, el) {
                var $this = $(el);

                $this.removeData("previousValue");

                var loaderOptions = {
                    input: $this,
                    validationName: "RemindPasswordValidation",
                    option: "show",
                    loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                    container: $this.parent().parent().parent().find(".validation-indicator-container")
                };

                toggleIndividualLoader(loaderOptions);

                $this.off().on("keyup", function (evt) {
                    var excludedKeys = [16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225];

                    if (evt.which === 9 && !$this.val() || $.inArray(evt.keyCode, excludedKeys) !== -1) {
                        return;
                    }

                    $this.removeData("previousValue");
                    toggleIndividualLoader(loaderOptions);
                    validator.element($this);

                    var pwdsArray = ["RemindPasswordNewPassword", "RemindPasswordConfirmPassword"];
                    if ($.inArray($this.attr("name"), pwdsArray) !== -1) {
                        pwdsArray = $.grep(pwdsArray, function (value) {
                            return value !== $this.attr("name");
                        });
                        $.each(pwdsArray, function(i, v) {
                            var $v = $("#txt" + v);
                            $v.removeData("previousValue");
                            toggleIndividualLoader({
                                input: $v,
                                validationName: "RemindPasswordValidation",
                                option: "show",
                                loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                                container: $v.parent().parent().parent().find(".validation-indicator-container")
                            });
                            validator.element($v);
                        });
                    }
                });

            });

            remindPasswordPanelContainerHeight = $("#divRemindPasswordPanelContainer").find(".content-container").parent().innerHeight();
            remindPasswordPanelContent = $("#divRemindPasswordPanelContainer").find(".content-container").parent().contents();
            showUniversalLoader({
                $target: $("#divRemindPasswordPanelContainer").find(".content-container").parent(),
                hideTargetContent: true,
                containerHeight: remindPasswordPanelContainerHeight - 10,
                loaderHeight: 64,
                loaderWidth: 64,
                //css: { "margin-top": "5px", "margin-bottom": "5px" }
            });

            validator.checkForm();

            remindUserPasswordAsync();
        });

        var validSendRemindPasswordRequestPendingTimeout;
        function sendRemindPasswordRequestAsync() {
            var validator = $("#frmRemindPasswordPanel").data("validator");
            var isPending = validator.pendingRequest !== 0;
            var isValid = validator.check($("#txtRemindPasswordEmail"));
            validator.submitted = {};

            var inputNamesArr = [];
            $("#frmRemindPasswordPanel").find("#txtRemindPasswordEmail").each(function (i, el) {
                if (!validator.pending[$(el).attr("name")])
                    inputNamesArr.push($(el).attr("name"));
            });
            inputNamesArr = inputNamesArr.filter(function (n) { return n !== undefined });

            $.each(inputNamesArr, function (i, val) {
                validator.element($("#frmRemindPasswordPanel input[name=" + val + "]").first());
            });

            if (isPending) {
                if (typeof validSendRemindPasswordRequestPendingTimeout !== "undefined") {
                    clearTimeout(validSendRemindPasswordRequestPendingTimeout);
                }
                validSendRemindPasswordRequestPendingTimeout = setTimeout(function () {
                    sendRemindPasswordRequestAsync();
                }, 200);
                return;
            } else if (!isValid) {
                $("#lnkbtnSendRemindPasswordRequest").removeClass("linklike_disabled").addClass("linklike");
                $("#btnRemindPassword").prop("disabled", false);
                hideUniversalLoader({
                    $target: $("#divRemindPasswordPanelContainer").find(".content-container").parent(),
                    callback: function () {
                        remindPasswordPanelContent.visuallyShow();
                    }
                });
                return;
            }

            $.ajax({
                async: true,
                url: siteroot + "User/SendRemindPasswordRequest",
                method: "post",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify({
                    RemindPasswordEmail: $("#txtRemindPasswordEmail").val()
                }),
                dataType: "json",
                success: function (data) {
                    hideUniversalLoader({
                        $target: $("#divRemindPasswordPanelContainer").find(".content-container").parent(),
                        callback: function () {
                            var message = data.Message.toString();
                            var color = data.ResultString === "Success" ? "#0b970d" : "#FF5468";
                            //var colonOccurance = message.lastIndexOf(":");
                            //message = colonOccurance > -1 ? message.substring(0, colonOccurance + 2) + "<span class='linklike'>" + message.substring(colonOccurance + 2) + "</span>" : message;

                            if (message) {
                                if (data.ResultString === "Success") {
                                    showUniversalMessage({
                                        $target: $("#divRemindPasswordPanelContainer").find(".content-container").parent(),
                                        containerHeight: remindPasswordPanelContainerHeight - 10,
                                        fadeout: true,
                                        fadetime: 500,
                                        message: message,
                                        messageColor: color,
                                        //css: { "margin-top": "5px", "margin-bottom": "5px" },
                                        callback: function () {
                                            var $txtActivationCode = $("#txtRemindPasswordCode");
                                            $txtActivationCode.val("");
                                            emptyIndividualLoader({
                                                input: $txtActivationCode,
                                                validationName: "RemindPasswordValidation"
                                            });
                                            remindPasswordPanelContent.visuallyShow();
                                            //$("#lnkbtnSendRemindPasswordRequest").prop("disabled", false);
                                            //$("#lnkbtnSendRemindPasswordRequest").removeClass("linklike_disabled").addClass("linklike");
                                        }
                                    });
                                } else {
                                    showUniversalMessage({
                                        $target: $("#divRemindPasswordPanelContainer").find(".content-container").parent(),
                                        containerHeight: remindPasswordPanelContainerHeight - 10,
                                        fadeout: true,
                                        fadetime: 500,
                                        length: 1000,
                                        message: message,
                                        messageColor: color,
                                        //css: { "margin-top": "5px", "margin-bottom": "5px" },
                                        callback: function () {
                                            remindPasswordPanelContent.visuallyShow();
                                            //$("#lnkbtnSendRemindPasswordRequest").prop("disabled", false);
                                            $("#lnkbtnSendRemindPasswordRequest").removeClass("linklike_disabled").addClass("linklike");
                                        }
                                    });
                                }
                            } else {
                                if (data.ResultString === "Success") {
                                    var $txtActivationCode = $("#txtRemindPasswordCode");
                                    $txtActivationCode.val("");
                                    emptyIndividualLoader({
                                        input: $txtActivationCode,
                                        validationName: "RemindPasswordValidation"
                                    });
                                    remindPasswordPanelContent.visuallyShow();
                                    //$("#lnkbtnSendRemindPasswordRequest").prop("disabled", false);
                                    //$("#lnkbtnSendRemindPasswordRequest").removeClass("linklike_disabled").addClass("linklike");
                                } else {
                                    remindPasswordPanelContent.visuallyShow();
                                    //$("#lnkbtnSendRemindPasswordRequest").prop("disabled", false);
                                    $("#lnkbtnSendRemindPasswordRequest").removeClass("linklike_disabled").addClass("linklike");
                                }
                            }
                        }
                    });
                },
                error: function (err) {
                    $("html").html(err.responseText);
                }
            });
        };

        $("#lnkbtnSendRemindPasswordRequest").click(function (e) {
            if (!$(e.target).hasClass("linklike"))
                return;

            $(e.target).removeClass("linklike").addClass("linklike_disabled");
            //$(e.target).prop("disabled", true);

            var validator = $("#frmRemindPasswordPanel").data("validator");

            var $emailInput = $("#frmRemindPasswordPanel").find("#txtRemindPasswordEmail").first();
            $emailInput.removeData("previousValue");

            var loaderOptions = {
                input: $emailInput,
                validationName: "RemindPasswordValidation",
                option: "show",
                loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                container: $emailInput.parent().parent().parent().find(".validation-indicator-container")
            };

            $("#frmRemindPasswordPanel").find("input.form-control").each(function (i, el) {
                if ($(el).attr("id") !== "txtRemindPasswordEmail") {
                    $(el).val("");
                }
                removeInputFormatting({
                    validationName: "RemindPasswordValidation",
                    input: $(el),
                    container: $(el).parent().parent().parent().find(".validation-indicator-container")
                });
            });

            toggleIndividualLoader(loaderOptions);

            $emailInput.off().on("keyup", function (evt) {
                var excludedKeys = [16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225];

                if (evt.which === 9 && !$emailInput.val() || $.inArray(evt.keyCode, excludedKeys) !== -1) {
                    return;
                }

                $emailInput.removeData("previousValue");
                toggleIndividualLoader(loaderOptions);
                validator.element($emailInput);
            });

            remindPasswordPanelContainerHeight = $("#divRemindPasswordPanelContainer").find(".content-container").parent().innerHeight();
            remindPasswordPanelContent = $("#divRemindPasswordPanelContainer").find(".content-container").parent().contents();
            showUniversalLoader({
                $target: $("#divRemindPasswordPanelContainer").find(".content-container").parent(),
                hideTargetContent: true,
                containerHeight: remindPasswordPanelContainerHeight - 10,
                loaderHeight: 64,
                loaderWidth: 64,
                //css: { "margin-top": "5px", "margin-bottom": "5px" }
            });

            validator.check($emailInput);

            sendRemindPasswordRequestAsync();
        });
    }

    function displayRemindPasswordPanel(args) {
        args = args || {};
        var overrideSession = args.overrideSession || false;

        var remindPasswordPanelContent = $("#divRemindPasswordPanelContainer").contents();
        showUniversalLoader({
            $target: $("#divRemindPasswordPanelContainer"),
            hideTargetContent: true,
            loaderWidth: 64,
            loaderHeight: 64,
            containerHeight: 84,
            css: { "margin-top": "5px", "margin-bottom": "5px" }
        });

        $.ajax({
            async: true,
            url: siteroot + "User/GetRemindPasswordPanel",
            method: "post",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({}),
            dataType: "json",
            success: function (data) {
                hideUniversalLoader({
                    $target: $("#divRemindPasswordPanelContainer"),
                    callback: function () {
                        if (data.DisplayPanel === true || overrideSession === true) {
                            remindPasswordPanelContent.remove();
                            var sRemindPasswordPanelView = data.PartialView.replace(/(\r\n|\n|\r)/gm, "");
                            var remindPasswordPanelView = $.parseHTML(sRemindPasswordPanelView);
                            $(remindPasswordPanelView).appendTo($("#divRemindPasswordPanelContainer"));
                            addValidationToRemindPasswordPanel();
                            attachEventsToRemindPasswordPanel();
                        } else {
                            remindPasswordPanelContent.visuallyShow();
                        }
                    }
                });
            },
            error: function (err) {
                $("html").html(err.responseText);
            }
        });
    }

    displayRemindPasswordPanel();

    $(document).one("click", "#lnkbtnLoadRemindPasswordPanel", function () {
        displayRemindPasswordPanel({
            overrideSession: true
        });
    });

});