// #region === PANEL EDYCJI DANYCH ===

function btnSaveChanges_Click(e) {
    $("#divAvatar, #divDeleteAvatar, #btnSaveChanges, #txtEmail").prop("disabled", true);

    var editPanelContainerHeight = $("#divEditPanelContainer").find(".content-container").parent().innerHeight();
    var editPanelContent = $("#divEditPanelContainer").find(".content-container").parent().contents();
    showUniversalLoader({
        $target: $("#divEditPanelContainer").find(".content-container").parent(),
        hideTargetContent: true,
        containerHeight: editPanelContainerHeight - 10,
        loaderHeight: 64,
        loaderWidth: 64
    });

    $.ajax({
        async: true,
        url: siteroot + "User/SaveChanges",
        method: "post",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({
            Email: $("#txtEmail").val()
        }),
        dataType: "json",
        success: function (data) {
            hideUniversalLoader({
                $target: $("#divEditPanelContainer").find(".content-container").parent(),
                callback: function () {
                    if (data.Status === "ValidationError") {
                        var errors = $.Enumerable.From(data.ValidationErrors)
                            .GroupBy(function (err) { return err.PropertyName })
                            .Select(function (g) { return g.First() })
                            .ToArray();
                        $.each(errors, function (i, v) {
                            toggleIndividualValidator({
                                input: $("#divEditPanelContainer").find("[id$='" + v.PropertyName + "']").first(),
                                option: "show",
                                validationName: "EditValidation",
                                errorElement: $("<div>" + v.Message + "</div>"),
                                container: $("#divEditPanelContainer").find("[id$='" + v.PropertyName + "']").first().closest(".form-group").find(".validation-indicator-container"),
                                inputBackgroundColor: "rgba(245, 27, 52, 0.97)",
                                inputBorderColor: "#FF5468",
                                validationMessageColor: "#FF5468",
                                validationImage: "url('" + siteroot + "Images/Incorrect.png')"
                            });
                        });
                        $.each(data.ValidProperties, function (i, propertyName) {
                            toggleIndividualValidator({
                                input: $("#divEditPanelContainer").find("[id$='" + propertyName + "']").first(),
                                option: "show",
                                validationName: "EditValidation",
                                errorElement: $("<div></div>"),
                                container: $("#divEditPanelContainer").find("[id$='" + propertyName + "']").first().closest(".form-group").find(".validation-indicator-container"),
                                inputBackgroundColor: "rgba(11, 115, 12, 0.97)",
                                inputBorderColor: "#0b970d",
                                validationMessageColor: "#0b970d",
                                validationImage: "url('" + siteroot + "Images/Correct.png')"
                            });
                        });
                        editPanelContent.visuallyShow();
                        $("#divAvatar, #divDeleteAvatar, #btnSaveChanges, #txtEmail").prop("disabled", false);
                    } else if (data.Status === "Success") {
                        showUniversalMessage({
                            $target: $("#divEditPanelContainer").find(".content-container").parent(),
                            containerHeight: editPanelContainerHeight - 10,
                            hideTargetContent: true,
                            fadeout: true,
                            fadetime: 500,
                            length: 1000,
                            message: data.Message,
                            messageColor: "#0b970d",
                            callback: function () {
                                $.each(data.ValidProperties, function (i, propertyName) {
                                    toggleIndividualValidator({
                                        input: $("#divEditPanelContainer").find("[id$='" + propertyName + "']").first(),
                                        option: "show",
                                        validationName: "EditValidation",
                                        errorElement: $("<div>Zmiany zostały zapisane poprawnie</div>"),
                                        container: $("#divEditPanelContainer").find("[id$='" + propertyName + "']").first().closest(".form-group").find(".validation-indicator-container"),
                                        inputBackgroundColor: "rgba(11, 115, 12, 0.97)",
                                        inputBorderColor: "#0b970d",
                                        validationMessageColor: "#0b970d",
                                        validationImage: "url('" + siteroot + "Images/Correct.png')"
                                    });
                                });
                                $("#divUploadAvatarStatusInfo").empty();
                                editPanelContent.visuallyShow();
                                $("#divAvatar, #divDeleteAvatar, #btnSaveChanges, #txtEmail").prop("disabled", false);
                            }
                        });
                    } else {
                        showUniversalMessage({
                            $target: $("#divEditPanelContainer").find(".content-container").parent(),
                            containerHeight: editPanelContainerHeight - 10,
                            hideTargetContent: true,
                            fadeout: true,
                            fadetime: 500,
                            length: 1000,
                            message: data.Message,
                            messageColor: "#FF5468",
                            callback: function () {
                                removeInputFormatting({
                                    validationName: "EditValidation",
                                    input: $("#divAvatar"),
                                    container: $("#divAvatar").closest(".form-group").find(".validation-indicator-container")
                                });
                                editPanelContent.visuallyShow();
                                $("#divAvatar, #divDeleteAvatar, #btnSaveChanges, #txtEmail").prop("disabled", false);
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

function document_Drop(e) {
    e.stopPropagation();
    e.preventDefault();
}

function document_DragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    $("#divAvatar").css("border", "2px dotted #502f18");
}

function document_DragEnter(e) {
    e.stopPropagation();
    e.preventDefault();
}

function divDeleteAvatar_Click(e) {
    $("#divAvatar, #divDeleteAvatar").prop("disabled", true);

    toggleIndividualLoader({
        input: $("#divAvatar"),
        validationName: "EditValidation",
        option: "show",
        loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
        container: $("#divAvatar").closest(".form-group").find(".validation-indicator-container")
    });

    $.ajax({
        async: true,
        url: siteroot + "User/DeleteAvatar",
        method: "post",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({ }),
        dataType: "json",
        success: function (data) {
            if (data.Status === "Success") {
                toggleIndividualValidator({
                    input: $("#divAvatar"),
                    option: "show",
                    validationName: "EditValidation",
                    errorElement: $("<div>" + data.Message + "</div>"),
                    container: $("#divAvatar").closest(".form-group").find(".validation-indicator-container"),
                    inputBackgroundColor: "rgba(11, 115, 12, 0.97)",
                    inputBorderColor: "#0b970d",
                    validationMessageColor: "#0b970d",
                    validationImage: "url('" + siteroot + "Images/Correct.png')"
                });
                var d = new Date();
                $("#divAvatarDisplay").css({
                    "background-image": "url('" + data.Path + "?" + d.getTime() + "')"
                });
                $("#divDeleteAvatar").hide();
                $("#divAvatar, #divDeleteAvatar").prop("disabled", false);
            } else {
                var editPanelContainerHeight = $("#divEditPanelContainer").find(".content-container").parent().innerHeight();
                var editPanelContent = $("#divEditPanelContainer").find(".content-container").parent().contents();

                showUniversalMessage({
                    $target: $("#divEditPanelContainer").find(".content-container").parent(),
                    containerHeight: editPanelContainerHeight - 10,
                    hideTargetContent: true,
                    fadeout: true,
                    fadetime: 500,
                    length: 1000,
                    message: data.Message,
                    messageColor: "#FF5468",
                    callback: function () {
                        removeInputFormatting({
                            validationName: "EditValidation",
                            input: $("#divAvatar"),
                            container: $("#divAvatar").closest(".form-group").find(".validation-indicator-container")
                        });
                        editPanelContent.visuallyShow();
                        $("#divAvatar, #divDeleteAvatar").prop("disabled", false);
                    }
                });
            }
        },
        error: function (err) {
            $("html").html(err.responseText);
        }
    });
}

function divDeleteAvatar_MouseEnter(e) {
    $(e.target).css({ "cursor": "pointer" }).stop(true, true).animate({
        "opacity": 1
    }, 250);
    $(e.target).parent().stop(true, true).animate({
        "background-color": "rgb(120, 0, 0)"
    }, 250);
}

function divDeleteAvatar_MouseLeave(e) {
    $(e.target).css({ "cursor": "default" }).stop(true, true).animate({
        "opacity": 0.4
    }, 250);
    $(e.target).parent().stop(true, true).animate({
        "background-color": "transparent"
    }, 250);
}

function divAvatar_DragEnter(e) {
    e.stopPropagation();
    e.preventDefault();
    $(e.target).css("border", "2px solid #0B85A1");
}

function divAvatar_DragOver(e) {
    e.stopPropagation();
    e.preventDefault();
}

function divAvatar_Drop(e) {
    $(e.target).css("border", "2px dotted #502f18");
    e.preventDefault();
    var file = e.originalEvent.dataTransfer.files[0];

    var fd = new FormData();
    fd.append("file", file);

    var statusBar = new Statusbar($("#divUploadAvatarStatusInfo")); // Ten obiekt pozwoli ustawić postęp wysyłania
    statusBar.setFileNameSize(file.name, file.size);
    sendFileToServer(fd, statusBar);
}

function Statusbar($divUploadAvatarStatusInfo) {
    this.progressBar = $("<div class='progressbar'></div>");
    this.progress = $("<div class='progress'></div>").appendTo(this.progressBar);
    this.percentage = $("<div class='percentage'></div>").appendTo(this.progressBar);
    this.abortContainer = $("<div class='abort'></div>");
    this.abort = $("<input value='Anuluj' type='button' class='btn btn-primary' />").appendTo(this.abortContainer);
    this.filename = $("<div class='filename'></div>");
    this.size = $("<div class='filesize'></div>");
    this.statusbar = $("" +
        "<div class='statusbar'>" +
            "<div class='row row-cols-gutter-10 row-flex'>" +
                "<div class='col-fixed-rest-1 vertical-gutter-10'>" +
                "</div>" +
                "<div class='col-fixed-100 vertical-gutter-10'>" +
                "</div>" +
            "</div>" +
            "<div class='row row-cols-gutter-10 row-flex'>" +
                "<div class='col-fixed-rest-1 vertical-gutter-10'>" +
                "</div>" +
                "<div class='col-fixed-100 vertical-gutter-10'>" +
                "</div>" +
            "</div>" +
        "</div>"
    );
    this.progressBar.appendTo(this.statusbar.find(".row").first().children("[class^='col']").first());
    this.abortContainer.appendTo(this.statusbar.find(".row").first().children("[class^='col']").last());
    this.filename.appendTo(this.statusbar.find(".row").last().children("[class^='col']").first());
    this.size.appendTo(this.statusbar.find(".row").last().children("[class^='col']").last());

    $divUploadAvatarStatusInfo.html(this.statusbar);
    
    this.setFileNameSize = function (name, size) {
        var sizeStr = "";
        var sizeKb = size / 1024;
        if (parseInt(sizeKb) > 1024) {
            var sizeMb = sizeKb / 1024;
            sizeStr = sizeMb.toFixed(2) + " MB";
        }
        else {
            sizeStr = sizeKb.toFixed(2) + " KB";
        }

        this.filename.html(name);
        this.size.html(sizeStr);
    }

    this.setProgress = function (progress) {
        this.progressBar.show();
        var progressBarWidth = progress * this.progressBar.width() / 100;
        this.progress.stop(true, true).animate({ width: parseInt(progress) >= 100 ? "100%" : progressBarWidth }, 10);
        this.percentage.html(progress + "%");
        if (parseInt(progress) >= 100) {
            this.abort.prop("disabled", true);
        }
    }

    this.setAbort = function (jqxhr) {
        var sb = this.statusbar;
        var perc = this.percentage;
        this.abort.off().click(function () {
            jqxhr.abort();
            sb.remove();
            perc.remove();
            removeInputFormatting({
                validationName: "EditValidation",
                input: $("#divAvatar"),
                container: $("#divAvatar").closest(".form-group").find(".validation-indicator-container")
            });
        });
    }
}

function sendFileToServer(formData, statusBar) {

    $("#divAvatar, #divDeleteAvatar").prop("disabled", true);

    toggleIndividualLoader({
        input: $("#divAvatar"),
        validationName: "EditValidation",
        option: "show",
        loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
        container: $("#divAvatar").closest(".form-group").find(".validation-indicator-container")
    });

    var jqXhr = $.ajax({
        xhr: function () {
            var xhrobj = $.ajaxSettings.xhr();
            if (xhrobj.upload) {
                xhrobj.upload.addEventListener("progress", function (event) {
                    var percent = 0;
                    var position = event.loaded || event.position;
                    var total = event.total;
                    if (event.lengthComputable) {
                        percent = Math.ceil(position / total * 100);
                    }
                    statusBar.setProgress(percent);
                }, false);
            }
            return xhrobj;
        },
        url: siteroot + "User/UploadAvatar",
        type: "POST",
        contentType: false,
        processData: false,
        cache: false,
        data: formData,
        dataType: "json",
        success: function (data) {
            statusBar.setProgress(100);

            if (data.Status === "ValidationError") {
                var errors = $.Enumerable.From(data.ValidationErrors)
                    .GroupBy(function(err) { return err.PropertyName })
                    .Select(function(g) { return g.First() })
                    .ToArray();
                $.each(errors, function(i, v) {
                    toggleIndividualValidator({
                        input: $("#divEditPanelContainer").find("[id$='" + v.PropertyName + "']").first(),
                        option: "show",
                        validationName: "EditValidation",
                        errorElement: $("<div>" + v.Message + "</div>"),
                        container: $("#divEditPanelContainer").find("[id$='" + v.PropertyName + "']").first().closest(".form-group").find(".validation-indicator-container"),
                        inputBackgroundColor: "rgba(245, 27, 52, 0.97)",
                        inputBorderColor: "#FF5468",
                        validationMessageColor: "#FF5468",
                        validationImage: "url('" + siteroot + "Images/Incorrect.png')"
                    });
                });
                $("#divAvatar, #divDeleteAvatar").prop("disabled", false);
            } else if (data.Status === "Success") {
                toggleIndividualValidator({
                    input: $("#divAvatar"),
                    option: "show",
                    validationName: "EditValidation",
                    errorElement: $("<div>" + data.Message + "</div>"),
                    container: $("#divAvatar").closest(".form-group").find(".validation-indicator-container"),
                    inputBackgroundColor: "rgba(11, 115, 12, 0.97)",
                    inputBorderColor: "#0b970d",
                    validationMessageColor: "#0b970d",
                    validationImage: "url('" + siteroot + "Images/Correct.png')"
                });
                var d = new Date();
                $("#divAvatarDisplay").css({
                    "background-image": "url('" + data.Path + "?" + d.getTime() + "')"
                });
                $("#divDeleteAvatar").show();
                $("#divAvatar, #divDeleteAvatar").prop("disabled", false);
            } else {
                var editPanelContainerHeight = $("#divEditPanelContainer").find(".content-container").parent().innerHeight();
                var editPanelContent = $("#divEditPanelContainer").find(".content-container").parent().contents();

                showUniversalMessage({
                    $target: $("#divEditPanelContainer").find(".content-container").parent(),
                    containerHeight: editPanelContainerHeight - 10,
                    hideTargetContent: true,
                    fadeout: true,
                    fadetime: 500,
                    length: 1000,
                    message: data.Message,
                    messageColor: "#FF5468",
                    callback: function () {
                        removeInputFormatting({
                            validationName: "EditValidation",
                            input: $("#divAvatar"),
                            container: $("#divAvatar").closest(".form-group").find(".validation-indicator-container")
                        });
                        editPanelContent.visuallyShow();
                        $("#divAvatar, #divDeleteAvatar").prop("disabled", false);
                    }
                });
            }
        }
    });

    statusBar.setAbort(jqXhr);
}

function displayEditPanel() {
    var editPanelContent = $("#divEditPanelContainer").contents();
    var editPanelContainerHeight = $("#divEditPanelContainer").find(".content-container").parent().innerHeight();
    showUniversalLoader({
        $target: $("#divEditPanelContainer"),
        hideTargetContent: true,
        loaderWidth: 64,
        loaderHeight: 64,
        containerHeight: 84,
        css: { "margin-top": "5px", "margin-bottom": "5px" }
    });

    $.ajax({
        async: true,
        url: siteroot + "User/RenderEditPanel",
        method: "post",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({}),
        dataType: "json",
        success: function (data) {
            hideUniversalLoader({
                $target: $("#divEditPanelContainer"),
                callback: function () {
                    editPanelContent.remove();

                    if (data.Status === "Success") {
                        var seditPanelView = data.PartialView.replace(/(\r\n|\n|\r)/gm, "");
                        var editPanelView = $.parseHTML(seditPanelView);
                        $(editPanelView).appendTo($("#divEditPanelContainer"));
                    } else {
                        showUniversalMessage({
                            $target: $("#divEditPanelContainer"),
                            containerHeight: 84,
                            fadeout: false,
                            fadetime: 500,
                            message: data.Message,
                            messageColor: "#FF5468",
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

function removeEditPanel() {
    $("#divEditPanelContainer").empty();
}

var txtEmailjqXhr;
function txtEmail_KeyUp(e) {
    toggleIndividualLoader({
        input: $("#txtEmail"),
        validationName: "EditValidation",
        option: "show",
        loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
        container: $("#txtEmail").closest(".form-group").find(".validation-indicator-container")
    });

    if (txtEmailjqXhr) {
        txtEmailjqXhr.abort();
    }

    txtEmailjqXhr = $.ajax({
        async: true,
        url: siteroot + "User/ValidateUserToEditProperty",
        method: "post",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({
            Email: $("#txtEmail").val() //tu skończyłem !!!!!!!!!!!!!!
        }),
        dataType: "json",
        success: function (data) {
            if (data.Status === "ValidationError") {
                var errors = $.Enumerable.From(data.ValidationErrors)
                    .GroupBy(function (err) { return err.PropertyName })
                    .Select(function (g) { return g.First() })
                    .ToArray();
                $.each(errors, function (i, v) {
                    toggleIndividualValidator({
                        input: $("#divEditPanelContainer").find("[id$='" + v.PropertyName + "']").first(),
                        option: "show",
                        validationName: "EditValidation",
                        errorElement: $("<div>" + v.Message + "</div>"),
                        container: $("#divEditPanelContainer").find("[id$='" + v.PropertyName + "']").first().closest(".form-group").find(".validation-indicator-container"),
                        inputBackgroundColor: "rgba(245, 27, 52, 0.97)",
                        inputBorderColor: "#FF5468",
                        validationMessageColor: "#FF5468",
                        validationImage: "url('" + siteroot + "Images/Incorrect.png')"
                    });
                });
            } else if (data.Status === "Success") {
                toggleIndividualValidator({
                    input: $("#txtEmail"),
                    option: "show",
                    validationName: "EditValidation",
                    errorElement: $("<div>" + data.Message + "</div>"),
                    container: $("#txtEmail").closest(".form-group").find(".validation-indicator-container"),
                    inputBackgroundColor: "rgba(11, 115, 12, 0.97)",
                    inputBorderColor: "#0b970d",
                    validationMessageColor: "#0b970d",
                    validationImage: "url('" + siteroot + "Images/Correct.png')"
                });
            } else {
                var editPanelContainerHeight = $("#divEditPanelContainer").find(".content-container").parent().innerHeight();
                var editPanelContent = $("#divEditPanelContainer").find(".content-container").parent().contents();

                showUniversalMessage({
                    $target: $("#divEditPanelContainer").find(".content-container").parent(),
                    containerHeight: editPanelContainerHeight - 10,
                    hideTargetContent: true,
                    fadeout: true,
                    fadetime: 500,
                    length: 1000,
                    message: data.Message,
                    messageColor: "#FF5468",
                    callback: function () {
                        removeInputFormatting({
                            validationName: "EditValidation",
                            input: $("#txtEmail"),
                            container: $("#txtEmail").closest(".form-group").find(".validation-indicator-container")
                        });
                        editPanelContent.visuallyShow();
                    }
                });
            }
        }
    });
}

// #endregion

// #region === PANEL AKTYWNYCH ZNAJOMYCH ===

// - zatrzymaj ładowanie panelu aktywnych znajomych
var xHrDisplayActiveFriendsPanel;
function abortDisplayActiveFriendsPanel() {
    if (xHrDisplayActiveFriendsPanel) {
        xHrDisplayActiveFriendsPanel.abort();
    }

    removeActiveFriendsPanel();
}

// - wyświetl panel aktywnych znajomych
function displayActiveFriendsPanel() {
    var activeFriendsPanelContent = $("#divActiveFriendsPanelContainer").contents();
    var activeFriendsPanelContainerHeight = $("#divActiveFriendsPanelContainer").find(".content-container").parent().innerHeight();

    abortDisplayActiveFriendsPanel();

    showUniversalLoader({
        $target: $("#divActiveFriendsPanelContainer"),
        hideTargetContent: true,
        loaderWidth: 64,
        loaderHeight: 64,
        containerHeight: 84,
        css: { "margin-top": "5px", "margin-bottom": "5px" }
    });

    $.ajax({
        async: true,
        url: siteroot + "User/RenderActiveFriendsPanel",
        method: "post",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({}),
        dataType: "json",
        success: function (data) {
            hideUniversalLoader({
                $target: $("#divActiveFriendsPanelContainer"),
                callback: function () {
                    activeFriendsPanelContent.remove();

                    if (data.Status === "Success") {
                        var sActiveFriendsPanelView = data.PartialView.replace(/(\r\n|\n|\r)/gm, "");
                        var activeFriendsPanelView = $.parseHTML(sActiveFriendsPanelView);
                        $(activeFriendsPanelView).appendTo($("#divActiveFriendsPanelContainer"));

                        if (data.ResultsCount === 0) {
                            showUniversalMessage({
                                $target: $("#divActiveFriendsPanelContainer").find(".content-container").first().parent(),
                                containerHeight: 84,
                                hideTargetContent: true,
                                fadeout: false,
                                fadetime: 500,
                                length: 1000,
                                message: data.Message,
                                messageColor: "#0b970d"
                            });
                        }
                    } else {
                        showUniversalMessage({
                            $target: $("#divActiveFriendsPanelContainer"),
                            containerHeight: 84,
                            fadeout: false,
                            fadetime: 500,
                            message: data.Message,
                            messageColor: "#FF5468",
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

function removeActiveFriendsPanel() {
    $("#divActiveFriendsPanelContainer").empty();
}

function btnRemoveFriend_Click(e) {
    var $btnRemoveFriend = $(e.target);
    $btnRemoveFriend.prop("disabled", true);

    var $activeFriendsItemRow = $btnRemoveFriend.closest(".active-friends-item-row");
    var activeFriendsItemRowContent = $activeFriendsItemRow.contents();
    var activeFriendsItemRowHeight = $activeFriendsItemRow.innerHeight();
    $activeFriendsItemRow.removeClass("row-flex");
    showUniversalLoader({
        $target: $activeFriendsItemRow,
        hideTargetContent: true,
        loaderWidth: 48,
        loaderHeight: 48,
        containerHeight: activeFriendsItemRowHeight - 10,
        css: { "margin": "5px" }
    });

    $.ajax({
        async: true,
        url: siteroot + "User/RemoveFriend",
        method: "post",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({
            Id: $btnRemoveFriend.attr("user-id")
        }),
        dataType: "json",
        success: function (data) {
            hideUniversalLoader({
                $target: $activeFriendsItemRow,
                callback: function () {
                    if (data.Status === "Success") {
                        showUniversalMessage({
                            $target: $activeFriendsItemRow,
                            containerHeight: activeFriendsItemRowHeight - 10,
                            fadeout: true,
                            fadetime: 500,
                            message: data.Message,
                            messageColor: "#0b970d",
                            css: { "margin": "5px", "max-height": activeFriendsItemRowHeight - 10 + "px", "overflow": "hidden" },
                            callback: function () {
                                displayActiveFriendsPanel();
                                removeFriendsPanel();
                            }
                        });
                    } else {
                        showUniversalMessage({
                            $target: $activeFriendsItemRow,
                            containerHeight: activeFriendsItemRowHeight - 10,
                            fadeout: true,
                            fadetime: 500,
                            message: data.Message,
                            messageColor: "#FF5468",
                            css: { "margin": "5px", "max-height": activeFriendsItemRowHeight - 10 + "px", "overflow": "hidden" },
                            callback: function () {
                                activeFriendsItemRowContent.visuallyShow();
                                $btnRemoveFriend.prop("disabled", false);
                                $activeFriendsItemRow.addClass("row-flex");
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

function btnCancelFriendInvitation_Click(e) {
    var $btnCancelFriendInvitation = $(e.target);
    $btnCancelFriendInvitation.prop("disabled", true);

    var $activeFriendsItemRow = $btnCancelFriendInvitation.closest(".active-friends-item-row");
    var activeFriendsItemRowContent = $activeFriendsItemRow.contents();
    var activeFriendsItemRowHeight = $activeFriendsItemRow.innerHeight();
    $activeFriendsItemRow.removeClass("row-flex");
    showUniversalLoader({
        $target: $activeFriendsItemRow,
        hideTargetContent: true,
        loaderWidth: 48,
        loaderHeight: 48,
        containerHeight: activeFriendsItemRowHeight - 10,
        css: { "margin": "5px" }
    });

    $.ajax({
        async: true,
        url: siteroot + "User/CancelFriendInvitation",
        method: "post",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({
            Id: $btnCancelFriendInvitation.attr("user-id")
        }),
        dataType: "json",
        success: function (data) {
            hideUniversalLoader({
                $target: $activeFriendsItemRow,
                callback: function () {
                    if (data.Status === "Success") {
                        showUniversalMessage({
                            $target: $activeFriendsItemRow,
                            containerHeight: activeFriendsItemRowHeight - 10,
                            fadeout: true,
                            fadetime: 500,
                            message: data.Message,
                            messageColor: "#0b970d",
                            css: { "margin": "5px", "max-height": activeFriendsItemRowHeight - 10 + "px", "overflow": "hidden" },
                            callback: function () {
                                displayActiveFriendsPanel();
                                removeFriendsPanel();
                            }
                        });
                    } else {
                        showUniversalMessage({
                            $target: $activeFriendsItemRow,
                            containerHeight: activeFriendsItemRowHeight - 10,
                            fadeout: true,
                            fadetime: 500,
                            message: data.Message,
                            messageColor: "#FF5468",
                            css: { "margin": "5px", "max-height": activeFriendsItemRowHeight - 10 + "px", "overflow": "hidden" },
                            callback: function () {
                                activeFriendsItemRowContent.visuallyShow();
                                $btnCancelFriendInvitation.prop("disabled", false);
                                $activeFriendsItemRow.addClass("row-flex");
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

function btnAcceptFriendInvite_Click(e) {
    var $btnAcceptFriendInvite = $(e.target);
    $btnAcceptFriendInvite.prop("disabled", true);

    var $activeFriendsItemRow = $btnAcceptFriendInvite.closest(".active-friends-item-row");
    var activeFriendsItemRowContent = $activeFriendsItemRow.contents();
    var activeFriendsItemRowHeight = $activeFriendsItemRow.innerHeight();
    $activeFriendsItemRow.removeClass("row-flex");
    showUniversalLoader({
        $target: $activeFriendsItemRow,
        hideTargetContent: true,
        loaderWidth: 48,
        loaderHeight: 48,
        containerHeight: activeFriendsItemRowHeight - 10,
        css: { "margin": "5px" }
    });

    $.ajax({
        async: true,
        url: siteroot + "User/AcceptFriendInvite",
        method: "post",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({
            Id: $btnAcceptFriendInvite.attr("user-id")
        }),
        dataType: "json",
        success: function (data) {
            hideUniversalLoader({
                $target: $activeFriendsItemRow,
                callback: function () {
                    if (data.Status === "Success") {
                        showUniversalMessage({
                            $target: $activeFriendsItemRow,
                            containerHeight: activeFriendsItemRowHeight - 10,
                            fadeout: true,
                            fadetime: 500,
                            message: data.Message,
                            messageColor: "#0b970d",
                            css: { "margin": "5px", "max-height": activeFriendsItemRowHeight - 10 + "px", "overflow": "hidden" },
                            callback: function () {
                                displayActiveFriendsPanel();
                                removeFriendsPanel();
                            }
                        });
                    } else {
                        showUniversalMessage({
                            $target: $activeFriendsItemRow,
                            containerHeight: activeFriendsItemRowHeight - 10,
                            fadeout: true,
                            fadetime: 500,
                            message: data.Message,
                            messageColor: "#FF5468",
                            css: { "margin": "5px", "max-height": activeFriendsItemRowHeight - 10 + "px", "overflow": "hidden" },
                            callback: function () {
                                activeFriendsItemRowContent.visuallyShow();
                                $btnAcceptFriendInvite.prop("disabled", false);
                                $activeFriendsItemRow.addClass("row-flex");
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

function btnDeclineFriendInvite_Click(e) {
    var $btnDeclineFriendInvite = $(e.target);
    $btnDeclineFriendInvite.prop("disabled", true);

    var $activeFriendsItemRow = $btnDeclineFriendInvite.closest(".active-friends-item-row");
    var activeFriendsItemRowContent = $activeFriendsItemRow.contents();
    var activeFriendsItemRowHeight = $activeFriendsItemRow.innerHeight();
    $activeFriendsItemRow.removeClass("row-flex");
    showUniversalLoader({
        $target: $activeFriendsItemRow,
        hideTargetContent: true,
        loaderWidth: 48,
        loaderHeight: 48,
        containerHeight: activeFriendsItemRowHeight - 10,
        css: { "margin": "5px" }
    });

    $.ajax({
        async: true,
        url: siteroot + "User/DeclineFriendInvite",
        method: "post",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({
            Id: $btnDeclineFriendInvite.attr("user-id")
        }),
        dataType: "json",
        success: function (data) {
            hideUniversalLoader({
                $target: $activeFriendsItemRow,
                callback: function () {
                    if (data.Status === "Success") {
                        showUniversalMessage({
                            $target: $activeFriendsItemRow,
                            containerHeight: activeFriendsItemRowHeight - 10,
                            fadeout: true,
                            fadetime: 500,
                            message: data.Message,
                            messageColor: "#0b970d",
                            css: { "margin": "5px", "max-height": activeFriendsItemRowHeight - 10 + "px", "overflow": "hidden" },
                            callback: function () {
                                displayActiveFriendsPanel();
                                removeFriendsPanel();
                            }
                        });
                    } else {
                        showUniversalMessage({
                            $target: $activeFriendsItemRow,
                            containerHeight: activeFriendsItemRowHeight - 10,
                            fadeout: true,
                            fadetime: 500,
                            message: data.Message,
                            messageColor: "#FF5468",
                            css: { "margin": "5px", "max-height": activeFriendsItemRowHeight - 10 + "px", "overflow": "hidden" },
                            callback: function () {
                                activeFriendsItemRowContent.visuallyShow();
                                $btnDeclineFriendInvite.prop("disabled", false);
                                $activeFriendsItemRow.addClass("row-flex");
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

function btnSendNotification_Click(e, where) {
    var $btnSendNotification = $(e.target);

    var sendNotificationPanelContainer = $btnSendNotification.closest(".content-container").parent();
    var sendNotificationPanelContent = sendNotificationPanelContainer.contents();
    var sendNotificationPanelContentHeight = sendNotificationPanelContainer.innerHeight();

    sendNotificationPanelContainer.find("input[type='button']").prop("disabled", true);

    showUniversalLoader({
        $target: sendNotificationPanelContainer,
        hideTargetContent: true,
        containerHeight: sendNotificationPanelContentHeight - 10,
        loaderHeight: 64,
        loaderWidth: 64
    });

    var givenDistance = parseFloat($("#txtNotificationDistance").val());

    if (where === "ByDistance" && !givenDistance) {
        hideUniversalLoader({
            $target: sendNotificationPanelContainer,
            callback: function() {
                showUniversalMessage({
                    $target: sendNotificationPanelContainer,
                    containerHeight: sendNotificationPanelContentHeight - 10,
                    fadeout: true,
                    fadetime: 500,
                    message: "Dystans jest niepoprawną wartością",
                    messageColor: "#FF5468",
                    callback: function() {
                        sendNotificationPanelContent.visuallyShow();
                        sendNotificationPanelContainer.find("input[type='button']").prop("disabled", false);
                    }
                });
            }
        });
        return;
    }

    var selectedIds = [];

    if (where === "ToSelected") {
        $("#divActiveFriendsPanelContainer").find("input[type='checkbox']:checked").each(function (i, el) {
            selectedIds.push($(el).attr("user-id"));
        });
    } else if (where === "ToAll") {
        $("#divActiveFriendsPanelContainer").find("input[type='checkbox']").each(function (i, el) {
            selectedIds.push($(el).attr("user-id"));
        });
    } else if (where === "ByDistance") {
        $("#divActiveFriendsPanelContainer").find("input[type='checkbox']").each(function (i, el) {
            var strDistance = $(el)
                .closest(".active-friends-item-row")
                .find(".active-friend-username-container")
                .text().between("(", " km");
            var distance = parseFloat($.trim(strDistance));
            if (distance <= givenDistance) {
                selectedIds.push($(el).attr("user-id"));
            }
        });
    } else { alert("[btnSendNotification_Click(e, where)]: Niepoprawny parametr [where]"); return; }

    $.ajax({
        async: true,
        url: siteroot + "User/SendNotification",
        method: "post",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({
            selectedIds: selectedIds,
            notificationTitle: $("#txtNotificationTitle").val(),
            notificationContent: $("#txtNotificationContent").val()
        }),
        dataType: "json",
        success: function (data) {
            hideUniversalLoader({
                $target: sendNotificationPanelContainer,
                callback: function () {
                    if (data.Status === "Success") {
                        showUniversalMessage({
                            $target: sendNotificationPanelContainer,
                            containerHeight: sendNotificationPanelContentHeight - 10,
                            fadeout: true,
                            fadetime: 500,
                            message: data.Message,
                            messageColor: "#0b970d",
                            callback: function () {
                                sendNotificationPanelContent.visuallyShow();
                                sendNotificationPanelContainer.find("input[type='button']").prop("disabled", false);
                            }
                        });
                    } else {
                        showUniversalMessage({
                            $target: sendNotificationPanelContainer,
                            containerHeight: sendNotificationPanelContentHeight - 10,
                            fadeout: true,
                            fadetime: 500,
                            message: data.Message,
                            messageColor: "#FF5468",
                            callback: function () {
                                sendNotificationPanelContent.visuallyShow();
                                sendNotificationPanelContainer.find("input[type='button']").prop("disabled", false);
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

$(document).ready(function () {

    // #region === PANEL EDYCJI DANYCH ===

    displayEditPanel();

    $(document).on("dragenter", function (e) {
        document_DragEnter(e);
    });

    $(document).on("dragover", function (e) {
        document_DragOver(e);
    });

    $(document).on("drop", function (e) {
        document_Drop(e);
    });

    $(document).on("dragenter", "#divAvatar", function (e) {
        divAvatar_DragEnter(e);
    });

    $(document).on("dragover", "#divAvatar", function (e) {
        divAvatar_DragOver(e);
    });

    $(document).on("drop", "#divAvatar", function (e) {
        divAvatar_Drop(e);
    });

    $(document).off("click mouseenter mouseleave", "#divDeleteAvatar");
    $(document).on("click", "#divDeleteAvatar", function (e) {
        divDeleteAvatar_Click(e);
        divDeleteAvatar_MouseLeave(e);
    });

    $(document).on("mouseenter", "#divDeleteAvatar", function (e) {
        divDeleteAvatar_MouseEnter(e);
    });

    $(document).on("mouseleave", "#divDeleteAvatar", function (e) {
        divDeleteAvatar_MouseLeave(e);
    });

    $(document).on("keyup", "#txtEmail", function(e) {
        txtEmail_KeyUp(e);
    });

    $(document).on("click", "#btnSaveChanges", function (e) {
        btnSaveChanges_Click(e);
    });

    // #endregion

    // #region === PANEL AKTYWNYCH ZNAJOMYCH ===

    displayActiveFriendsPanel();

    $(document).on("click", ".btn-remove-friend", function(e) {
        btnRemoveFriend_Click(e);
    });

    $(document).on("click", ".btn-cancel-invitation", function (e) {
        btnCancelFriendInvitation_Click(e);
    });

    $(document).on("click", ".btn-accept-friend-invite", function (e) {
        btnAcceptFriendInvite_Click(e);
    });

    $(document).on("click", ".btn-decline-friend-invite", function (e) {
        btnDeclineFriendInvite_Click(e);
    });

    $(document).on("click", ".btn-send-notification-to-selected", function (e) {
        btnSendNotification_Click(e, "ToSelected");
    });

    $(document).on("click", ".btn-send-notification-by-distance", function (e) {
        btnSendNotification_Click(e, "ByDistance");
    });

    $(document).on("click", ".btn-send-notification-to-all", function (e) {
        btnSendNotification_Click(e, "ToAll");
    });

    // #endregion
});