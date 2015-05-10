function setDefaultDatas() {
    var from = new Date().set({
        millisecond: 0,
        second: 0,
        minute: 0,
        hour: 0
    });
    (from.getDay() !== 1) ? (from.moveToDayOfWeek(1, -1)) : (void(0));
    from.addWeeks(-2);
    var to = new Date().set({
        millisecond: 0,
        second: 0,
        minute: 0,
        hour: 0
    });
    (to.getDay() !== 0) ? (to.moveToDayOfWeek(0)) : (void(0));
    to.addWeeks(12);
    $("#from").val(from.toString("dd.MM.yyyy"));
    $("#to").val(to.toString("dd.MM.yyyy"));
}

function processInputChange(eInput, type) {
    var date = Date.parseExact(eInput.value, "dd.MM.yyyy");
    switch(type) {
        case "from":
            {
                (date.getDay() !== 1) ? (date.moveToDayOfWeek(1, -1)) : (void(0));
                break;
            }
        case "to":
            {
                (date.getDay() !== 0) ? (date.moveToDayOfWeek(0)) : (void(0));
                break;
            }
    }
    eInput.value = date.toString("dd.MM.yyyy");
}

function show(cdata) {
    var from = Date.parseExact($("#from").val(), "dd.MM.yyyy");
    var to = Date.parseExact($("#to").val(), "dd.MM.yyyy");
    var head = getHead(from, to);
    var courses = new Array();
    for(var i = 0; i < cdata.length; i++) {
        var courseRaw = cdata[i];
        if(!ifCourseInAction(courseRaw, from, to)) {
            var cName = courseRaw.ShortName.replace("\ ", "&nbsp;") + "&nbsp;";
            var weeks = [];
            for(var j = 0; j < head.length; j++) {
                weeks.push(getCourseEvent(courseRaw, Date.parseExact(head[j].monday, "dd.MM.yyyy")));
            }
            var course = {
                "ID": courseRaw.ID,
                "Name": courseRaw.Name,
                "ShortName": cName,
                "State": courseRaw.State,
                "Weeks": weeks
            };
            courses.push(course);
        }
    }
    var result = {
        "headers": head,
        "courses": courses
    };
    $("#data").html(_.template($("#table-main").text())(result));
}

function showModalBody(courseId) {
    var checkItems = JSON.parse($.ajax({
        async: false,
        url: "courseCheckItems",
        data: {
            "courseId": courseId
        },
        type: "GET"
    }).responseText);
    var result = {
        "checkitems": checkItems,
        "courseId": courseId
    };
    $("#modal-body-body").html(_.template($("#checkitem-main").text())(result));
}

function updateCheckitem(type, checkitemID, state) {
    var urla = "";
    var dataa = {};
    if(type === "update") {
        urla = "updateCheckItem";
        dataa = {
            "id": checkitemID,
            "state": state
        }
    } else if(type === "duplicate") {
        urla = "duplicateLastHistory";
        dataa = {
            "id": checkitemID
        };
    }
    var result = JSON.parse($.ajax({
        async: false,
        url: urla,
        data: dataa,
        type: "GET"
    }).responseText);
    if(result.Result) {
        var elem = $("<div />", {
            "class": "alert alert-success",
            "text": "Обновлено"
        });
        window.setTimeout(function() {
            elem.remove();
        }, 1000);
        elem.appendTo("#modal-body-head");
        $("#modal-history").html("");
        showModalBody($("#currentCourse").val());
    }
}

function processCheckitemDuplicate(checkitemID) {
    updateCheckitem("duplicate", checkitemID, null);
}

function processCheckitemChange(eCheckbox, checkitemID) {
    updateCheckitem("update", checkitemID, eCheckbox.checked ? 1 : 0);
}

function showModalCourse(courseId) {
    $("#modal-title").html("Чек-лист курса " + courseId);
    document.getElementById("modal-body-head").innerHTML = "";
    showModalBody(courseId);
    $("#modal-window").show();
}

function showCheckItemHistory(eButton, checkItemId) {
    if(eButton) {
        $(eButton).parent().parent().parent().children().removeClass("active");
        $(eButton).parent().parent().addClass("active");
    }
    var result = JSON.parse($.ajax({
        async: false,
        url: "checkItemHistory",
        data: {
            "id": checkItemId
        },
        type: "GET"
    }).responseText);
    result = {
        "checkitemHistorys": result,
        "checkItemId": checkItemId
    };
    $("#modal-history").html(_.template($("#checkitem-history-table").text())(result));
}

function hideModal() {
    $("#modal-body-body").html("");
    $("#modal-body-head").html("");
    $("#modal-history").html("");
    $("#modal-window").hide();
}

function toggleHistoryComment(eTd) {
    var td = $(eTd).parent().parent().children(":nth-child(4)");
    if(td.children("span.history-comment-edit").css("display") === "none") {
        showHistoryComment(eTd);
    } else {
        cancelHistoryComment(eTd);
    }
}

function showHistoryComment(eTd) {
    var td = $(eTd).parent().parent().children(":nth-child(4)");
    td.children("span.history-comment-txt").hide();
    td.children("span.history-comment-edit").show();
}

function cancelHistoryComment(eTd) {
    var td = $(eTd).parent().parent().children(":nth-child(4)");
    td.children("span.history-comment-txt").show();
    td.children("span.history-comment-edit").hide();
}

function saveHistoryComment(eButton, historyID) {
    var comment = $(eButton).parent().children("textarea").val();
    var result = JSON.parse($.ajax({
        async: false,
        url: "updateCheckItemHistory",
        data: {
            "id": historyID,
            "comment": comment
        },
        type: "GET"
    }).responseText);
    if(result.Result) {
        var elem = $("<div />", {
            "class": "alert alert-success",
            "text": "Обновлено"
        });
        window.setTimeout(function() {
            elem.remove();
        }, 1000);
        elem.appendTo("#modal-body-head");
        showCheckItemHistory(null, $("#currentCheckItem").val());
    }
    console.log("");
}

function getHead(from, to) {
    var cur = from.clone();
    var dates = new Array();
    while(cur < to) {
        var curSunday = cur.clone();
        curSunday.moveToDayOfWeek(0);
        var date = cur.toString("dd.MM") + "&#8209;" + curSunday.toString("dd.MM");
        var year = "";
        if(cur.toString("yyyy") !== curSunday.toString("yyyy")) {
            year = cur.toString("yyyy") + "-" + curSunday.toString("yyyy");
        } else {
            year = cur.toString("yyyy");
        }
        var today = new Date();
        var current = false;
        curSunday.set({
            millisecond: 99,
            second: 59,
            minute: 59,
            hour: 23
        });
        if(today.between(cur, curSunday)) {
            current = true;
        }
        dates.push({
            "date": date,
            "current": current,
            "year": year,
            "monday": cur.toString("dd.MM.yyyy")
        });
        cur.addWeeks(1);
    }
    return dates;
}

function ifCourseInAction(course, from, to) {
    var firstDate = Date.parseExact(course.EnrollmentStart, "dd.MM.yyyy");
    var secondDate = Date.parseExact(course.CourseStart, "dd.MM.yyyy");
    secondDate.addWeeks(course.Weeks + 2);
    return check(from, to, firstDate, secondDate);
}

function getCourseEvent(course, dateOfMonday) {
    var oneWeek = {};
    var enrollmentStart = Date.parseExact(course.EnrollmentStart, "dd.MM.yyyy");
    var courseStart = Date.parseExact(course.CourseStart, "dd.MM.yyyy");
    //Идут недели
    var startPlusNWeeks = courseStart.clone();
    startPlusNWeeks.addWeeks(course.Weeks);
    if(courseStart <= dateOfMonday && startPlusNWeeks > dateOfMonday) {
        //Расчет номера недель
        var numberOfWeek = ((dateOfMonday - courseStart) / (7 * 24 * 60 * 60 * 1000)) + 1;
        oneWeek.weekNumber = numberOfWeek.toString();
    }
    //Регистрация открыта
    var startPlus2Weeks = courseStart.clone();
    startPlus2Weeks.addWeeks(2);
    if(enrollmentStart <= dateOfMonday && dateOfMonday < startPlus2Weeks) {
        oneWeek.enrollment = true;
    }
    //Продление, открытие, сертификат
    var startProlongation = courseStart.clone();
    startProlongation.addWeeks(course.Weeks);
    var mondayOfCertificate = startProlongation.clone();
    mondayOfCertificate.addWeeks(2);
    if(startProlongation <= dateOfMonday && dateOfMonday < mondayOfCertificate) {
        oneWeek.prolongation = true;
    }
    var sunday = mondayOfCertificate.clone();
    sunday.moveToDayOfWeek(0, -1);
    var currentSunday = dateOfMonday.clone();
    currentSunday.moveToDayOfWeek(0);
    if(sunday.equals(currentSunday)) {
        oneWeek.open = true;
    }
    if(dateOfMonday.equals(mondayOfCertificate)) {
        oneWeek.certificate = true;
    }
    currentSunday.set({
        millisecond: 99,
        second: 59,
        minute: 59,
        hour: 23
    });
    var now = new Date();
    if(now.between(dateOfMonday, currentSunday)) {
        oneWeek.current = true;
    }
    return oneWeek;
}

function check(staticBegin, staticEnd, dynamicBegin, dynamicEnd) {
    if(staticBegin >= staticEnd || dynamicBegin >= dynamicEnd) {
        return false;
    }
    if(staticEnd <= dynamicBegin || staticEnd >= dynamicBegin && staticBegin >= dynamicEnd) {
        return true;
    }
    return false;
}

function getCoursesData() {
    $.getJSON('static/data.json').done(function(data) {
        show(data);
    });
}
// start
$(document).ready(function() {
    setDefaultDatas();
    /*
    $("#from").datepicker({
        "dateFormat": "dd.mm.yy",
        "changeMonth": true,
        "changeYear": true
    });
    $("#to").datepicker({
        "dateFormat": "dd.mm.yy",
        "changeMonth": true,
        "changeYear": true
    });
    */
    _.templateSettings = {
        evaluate: /\{\{(.+?)\}\}/g,
        interpolate: /\{\{=(.+?)\}\}/g,
        escape: /\{\{-(.+?)\}\}/g
    };
});