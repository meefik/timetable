function setDefaultDatas() {
    var from = new Date().set({
        millisecond: 0,
        second: 0,
        minute: 0,
        hour: 0
    });
    (from.getDay() !== 1) ? (from.moveToDayOfWeek(1, -1)) : (void(0));
    //from.addWeeks(-2);
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

function show(cdata) {
    var from = Date.parseExact($("#from").val(), "dd.MM.yyyy");
    var to = Date.parseExact($("#to").val(), "dd.MM.yyyy");
    if(from.getDay() !== 1) from.moveToDayOfWeek(1, -1);
    if(to.getDay() !== 0) to.moveToDayOfWeek(0);
    var head = getHead(from, to);
    var courses = new Array();
    for(var i = 0; i < cdata.length; i++) {
        var courseRaw = cdata[i].fields;
        courseRaw.id = cdata[i].pk;
        courseRaw.shortName = courseRaw.shortName;
        courseRaw.enrollmentStart = Date.parseExact(courseRaw.enrollmentStart, "yyyy-MM-dd");
        courseRaw.courseStart = Date.parseExact(courseRaw.courseStart, "yyyy-MM-dd");
        //courseRaw.state = 1;
        if(!ifCourseInAction(courseRaw, from, to)) {
            var weeks = [];
            for(var j = 0; j < head.length; j++) {
                weeks.push(getCourseEvent(courseRaw, Date.parseExact(head[j].monday, "dd.MM.yyyy")));
            }
            var course = {
                "ID": courseRaw.id,
                "Name": courseRaw.courseName,
                "ShortName": courseRaw.shortName,
                "State": courseRaw.courseState,
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
    $.ajax({
        url: 'api/task',
        data: {
            "courseid": courseId
        },
        type: "GET"
    }).done(function(data) {
        var result = {
            "checkitems": data,
            "courseId": courseId
        };
        $("#modal-body-body").html(_.template($("#checkitem-main").text())(result));
    });
}

function indicateAction(jq, color) {
    var c = jq.css('backgroundColor');
    jq.animate({
        backgroundColor: color
    }, 200, "linear", function() {
        jq.animate({
            backgroundColor: c
        }, 800, "linear", function() {
            jq.css('backgroundColor', '');
        });
    });
}

function doTaskUpdate(obj, taskId) {
    var obj = $(obj);
    var trBlock = obj.parent().parent().find('td');
    if(obj.hasClass('state-checkbox')) {
        var checked = obj[0].checked ? 1 : 0;
        var text = obj.next('.state-text');
        // update task state
        $.ajax({
            url: 'api/task/update',
            data: {
                taskid: taskId,
                state: checked
            },
            type: "GET"
        }).done(function() {
            indicateAction(trBlock, '#9bdd9b');
            if(checked) text.html('выполнено');
            else text.html('не выполнено');
        }).fail(function() {
            indicateAction(trBlock, '#dd9b9b');
            obj[0].checked = !checked;
        });
    }
    if(obj.hasClass('comment-btn')) {
        var nextTrBlock = obj.parent().parent().next();
        var visible = nextTrBlock.is(":visible");
        if(visible) {
            var textarea = nextTrBlock.find('textarea');
            var text = textarea.val();
            // update task comment
            $.ajax({
                url: 'api/task/update',
                data: {
                    taskid: taskId,
                    comment: text
                },
                type: "GET"
            }).done(function() {
                indicateAction(trBlock, '#9bdd9b');
                nextTrBlock.hide();
                obj.html('<span class="glyphicon glyphicon-comment"></span>&nbsp;&nbsp;Комментарий');
                textarea.val('');
            }).fail(function() {
                indicateAction(trBlock, '#dd9b9b');
            });
        } else {
            nextTrBlock.show();
            obj.html('<span class="glyphicon glyphicon-floppy-disk"></span>&nbsp;&nbsp;Сохранить');
        }
    }
}

function processCheckitemChange(eCheckbox, checkitemID) {
    updateCheckitem("update", checkitemID, eCheckbox.checked ? 1 : 0);
}

function showModalCourse(courseId) {
    $("#modal-title").html("Задачи курса " + courseId);
    document.getElementById("modal-body-head").innerHTML = "";
    showModalBody(courseId);
    $("#modal-window").show();
}

function showCheckItemHistory(eButton, checkItemId) {
    if(eButton) {
        $(eButton).parent().parent().parent().children().removeClass("active");
        $(eButton).parent().parent().addClass("active");
    }
    $.ajax({
        url: 'api/history',
        data: {
            "taskid": checkItemId
        },
        type: "GET"
    }).done(function(data) {
        var result = {
            "checkitemHistorys": data,
            "checkItemId": checkItemId
        };
        $("#modal-history").html(_.template($("#checkitem-history-table").text())(result));
    });
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
    $.ajax({
        url: "api/history/update",
        data: {
            "historyid": historyID,
            "comment": comment
        },
        type: "GET"
    }).done(function() {
        var elem = $("<div />", {
            "class": "alert alert-success",
            "text": "Обновлено"
        });
        window.setTimeout(function() {
            elem.remove();
        }, 1000);
        elem.appendTo("#modal-body-head");
        showCheckItemHistory(null, $("#currentCheckItem").val());
    });
}

function getHead(from, to) {
    var cur = from.clone();
    var dates = new Array();
    while(cur < to) {
        var curSunday = cur.clone();
        curSunday.moveToDayOfWeek(0);
        var date = cur.toString("dd.MM") + "-" + curSunday.toString("dd.MM");
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
    var firstDate = course.enrollmentStart;
    var secondDate = course.courseStart.clone();
    var durationWeeks = course.durationWeeks;
    secondDate.addWeeks(durationWeeks + 2);
    return check(from, to, firstDate, secondDate);
}

function getCourseEvent(course, dateOfMonday) {
    var oneWeek = {};
    var enrollmentStart = course.enrollmentStart;
    var courseStart = course.courseStart;
    var durationWeeks = course.durationWeeks;
    //Идут недели
    var startPlusNWeeks = courseStart.clone();
    startPlusNWeeks.addWeeks(durationWeeks);
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
    startProlongation.addWeeks(durationWeeks);
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
    //var url = 'static/data/list.json';
    var url = 'api/list';
    $.getJSON(url).done(function(data) {
        show(data);
    });
}
// start
$(document).ready(function() {
    setDefaultDatas();
    $('.input-daterange').datepicker({
        format: "dd.mm.yyyy",
        todayBtn: true,
        language: "ru",
        autoclose: true,
        todayHighlight: true,
        calendarWeeks: true
    });
    _.templateSettings = {
        evaluate: /\{\{(.+?)\}\}/g,
        interpolate: /\{\{=(.+?)\}\}/g,
        escape: /\{\{-(.+?)\}\}/g
    };
});