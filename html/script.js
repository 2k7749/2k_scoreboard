var lasttimeout, mygroup = "admin",
    mouseX, mouseY, mysteamid;
Number.prototype.map = function(in_min, in_max, out_min, out_max) {
    return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function hexidtodec(sid) {
    return BigInt("0x" + sid.replace("steam:", "")).toString(10);
}

function selectPageButton(page) {
    $(".navbtn").removeClass("selected");
    $(Config.navbar_buttons).each(function(k, v) {
        if (v.page == page) {
            $($(".navbtn")[k]).addClass("selected");
            return;
        }
    });
}

function changePage(page) {
    $(".main-content").html(Config.navbar_pages[page]);
}

function toggleMenu(state, peeking = false) {
    if (state) {
        if (peeking) {
            changePage("list");
            selectPageButton("list");
        }
        $(".main").show();
    } else {
        $(".main,.player-context,#input-form").hide();
        if (Config.navbar_pages.default !== null) {
            changePage(Config.navbar_pages.default);
            selectPageButton(Config.navbar_pages.default);
        }
    }
}

function pingColor(ping) {
    return [ping.map(0, 150, 0, 255), ping.map(0, 150, 255, 0)];
}

function getInput(description, placeholder = "", cb) {
    $(".input-description").text(description);
    $("#input-content").prop("placeholder", placeholder);
    $("#input-content").val();
    $("#input-form").fadeIn();
    $(".input-close").click(function() {
        cb(null);
        $("#input-form").fadeOut();
        $(".input-close").off("click");
        $("#input-form").off("submit");
    });
    $("#input-form").submit(function(e) {
        e.preventDefault();
        cb($("#input-content").val());
        $("#input-form").fadeOut();
        $(".input-close").off("click");
        $("#input-form").off("submit");
    });
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds)
            break;
    }
}

function copyText(text, callbackText, callbackFadeTime) {
    clearTimeout(lasttimeout);
    var temp = $("<input>");
    $("body").append(temp);
    temp.val(text).select();
    document.execCommand("copy");
    temp.remove();
    $(".copied").text(callbackText);
    $(".copied").fadeIn();
    lasttimeout = setTimeout(function() {
        $(".copied").fadeOut();
    }, callbackFadeTime);
}

function isAdmin() {
    return mygroup !== undefined && Config.admin_groups.includes(mygroup);
}

$(function() {
    if (Config.el_bwh_installed) {
        // $('<div class="pl-ctx-btn" style="color:red;" data-action="ban">Ban</div>').insertBefore($(".pl-ctx-btn")[0]); // coming soon :)
        // $('<div class="pl-ctx-btn" style="color:orange;" data-action="warn">Warn</div>').insertAfter($(".pl-ctx-btn")[0]);
        Config.admin_context_menu.push({ label: "Warn", action: "warn", style: "color:orange;", args: { description: "Warn player", placeholder: "Warn message" } });
    }
    $(Config.admin_context_menu).each(function(k, v) {
        $(".player-context").append("<div class='pl-ctx-btn' style='" + v.style + "' data-id='" + k.toString() + "'>" + v.label + "</div>");
    });
    $(Config.navbar_buttons).each(function(k, v) {
        $(".navbar").append("<div class='navbtn' data-id='" + k.toString() + "'>" + v.label + "</div>");
    });
    selectPageButton(Config.navbar_pages.default);
    changePage(Config.navbar_pages.default !== null ? Config.navbar_pages.default : Object.keys(Config.navbar_pages)[1]);
    $(document).on("click", "#player", function() {
        copyText("https://steamcommunity.com/profiles/" + hexidtodec($(this).data("steamid")), "Đã copy Link Steam profile", 1500);
    });
    $(".navbtn").click(function() {
        var btn = Config.navbar_buttons[$(this).data("id")];
        if (btn.page !== undefined) {
            changePage(btn.page);
            $(".navbtn").removeClass("selected");
            $(this).addClass("selected");
        } else {
            btn.action();
        }
    });
    $(document).on("contextmenu", "#player", function() {
        if (isAdmin()) {
            $(".player-context").data("sid", $(this).data("sid"));
            $(".player-context").data("steamid", $(this).data("steamid"));
            $(".player-context").css("top", mouseY);
            $(".player-context").css("left", mouseX);
            $(".player-context").fadeIn();
        }
    });
    $(".pl-ctx-btn").click(function() {
        if (isAdmin()) {
            var receiver = $($(this).parent()).data("sid");
            var btn = Config.admin_context_menu[$(this).data("id")];
            if (btn.args !== undefined) {
                getInput(btn.args.description, btn.args.placeholder, function(args) {
                    if (args === null)
                        return;
                    if (typeof btn.action == "function")
                        btn.action(receiver, args);
                    else
                        $.post("http://el_scoreboard/admin-ctx", JSON.stringify({ action: btn.action, target: receiver, args: args }));
                });
            } else {
                if (typeof btn.action == "function")
                    btn.action(receiver);
                else
                    $.post("http://el_scoreboard/admin-ctx", JSON.stringify({ action: btn.action, target: receiver, args: null }));
            }
        }
    });
    $(document).on("click", function() {
        if ($(".player-context").css("display") != "none") {
            $(".player-context").fadeOut();
        }
    });
});

window.addEventListener('message', function(event) {
    switch (event.data.type) {
        case "toggle":
            toggleMenu(event.data.state, event.data.peeking);
            break;
        case "setup":
            $(".pname").text(event.data.pn);
            $(".servername").text(event.data.sn);
            mysteamid = event.data.sid;
            if (Config.steam_api_key.includes("http://") || Config.steam_api_key.includes("https://")) {
                $(".pfp").prop("src", Config.steam_api_key);
            } else {
                $.get("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + Config.steam_api_key + "&steamids=" + hexidtodec(event.data.sid), function(data) {
                    $(".pfp").prop("src", data.response.players[0].avatarfull);
                });
            }
            break;
        case "update":
            if (mygroup !== event.data.mygroup)
                $(".pgroup").html(Config.group_labels[event.data.mygroup] != null ? Config.group_labels[event.data.mygroup] : event.data.mygroup);
            mygroup = event.data.mygroup;
            var page = Config.navbar_buttons[$(".navbtn.selected").data("id")].page;
            if (["list", "con", "disc"].includes(page)) {
                var newtable = "";
                switch (page) {
                    case "list":
                        $(event.data.data.pd).each(function(k, v) {
                            var pc = pingColor(v.ping);
                            newtable +=
                                "<tr id='player' data-steamid='" + v.stid + "' data-sid='" + v.sid.toString() + "'>" +
                                "<td>" + v.sid.toString() + "</td>" +
                                "<td" + (v.stid == mysteamid ? " style='color:gold;'" : "") + ">" + v.name + (v.stid == mysteamid ? " (you)" : "") + "</td>" +
                                "<td>" + (Config.group_labels[v.group] != null ? Config.group_labels[v.group] : v.group) + "</td>" +
                                "<td>" + v.job + "</td>" +
                                "<td><span style='color:rgb(" + pc[0] + "," + pc[1] + ",0);'>" + v.ping.toString() + "</span> ms</td>" +
                                "</tr>";
                        });
                        break;
                    case "con":
                        $(event.data.data.con).each(function(k, v) {
                            var time = new Date(v.time * 1000);
                            newtable +=
                                "<tr>" +
                                "<td>" + v.name + "</td>" +
                                "<td>" + (time.toLocaleDateString() + " " + time.toLocaleTimeString()) + "</td>" +
                                "</tr>";
                        });
                        break;
                    case "disc":
                        $(event.data.data.con).each(function(k, v) {
                            var time = new Date(v.time * 1000);
                            newtable +=
                                "<tr>" +
                                "<td>" + v.name + "</td>" +
                                "<td>" + (v.reason === undefined ? "Disconnected" : v.reason) + "</td>" +
                                "<td>" + (time.toLocaleDateString() + " " + time.toLocaleTimeString()) + "</td>" +
                                "</tr>";
                        });
                        break;
                }
                $(".lcd-body").html(newtable);
                break;
            }
        default:
            console.log("el_scoreboard: unknown event type");
            break;
    }
});

$(document).mousemove(function(e) {
    mouseX = e.pageX;
    mouseY = e.pageY;
}).mouseover();

document.onkeydown = function(data) {
    if (data.which == 27 || data.which == 120) {
        if (data.which == 27 && $("#input-form").css("display") != "none") {
            $("#input-close").click();
        } else {
            toggleMenu(false);
            $.post("http://el_scoreboard/toggle", JSON.stringify(false));
        }
    }
};