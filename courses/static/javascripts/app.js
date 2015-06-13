// Отобразить окно задач
function showTasks(courseId, weekNumber, callback) {
    if (weekNumber > 0)
        $("#modal-title").html("Задачи курса " + courseId + " на " + weekNumber + " неделю");
    else
        $("#modal-title").html("Задачи курса " + courseId);
    $("#modal-window").show();
    
    $.ajax({
        url: 'api/task',
        data: {
            courseid: courseId,
            week: weekNumber
        },
        type: "GET"
    }).done(function(data) {
        var result = {
            tasks: data,
            courseId: courseId,
            weekNumber: weekNumber
        };
        $("#modal-task-body").html(_.template($("#tasks-tpl").text())(result));
        $("#modal-window .input-task").keyup(function(e) {
            if (e.keyCode == 13) {
                $("#modal-window .create-btn").trigger('click');
            }
        });
        if (callback) callback();
    });
}

// Скрыть окно задач
function hideTasks() {
    $("#modal-task-body").html("");
    $("#modal-task-history").html("");
    $("#modal-window").hide();
}

// Обновить задачу
function updateTask(obj, courseId, taskId, weekNumber) {

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

    var obj = $(obj);
    var block = obj.parent().parent().find('td');
    if (obj.hasClass('state-checkbox')) {
        var checked = obj[0].checked ? 1 : 0;
        var text = obj.next('.state-text');
        // update task state
        $.ajax({
            url: 'api/task/update',
            data: {
                courseid: courseId,
                taskid: taskId,
                week: weekNumber,
                state: checked
            },
            type: "GET"
        }).done(function() {
            indicateAction(block, '#9bdd9b');
            if (checked) text.html('выполнено');
            else text.html('не выполнено');
            showHistory(null, taskId);
        }).fail(function() {
            indicateAction(block, '#dd9b9b');
            obj[0].checked = !checked;
        });
    }
    if (obj.hasClass('comment-btn')) {
        var currentBlock = obj.parent().parent();
        var nextBlock = currentBlock.next();
        var visible = nextBlock.is(":visible");
        if (visible) {
            var textarea = nextBlock.find('textarea');
            var checkbox = currentBlock.find('input[type="checkbox"]');
            var text = textarea.val();
            if (text.length === 0) {
                nextBlock.hide();
                obj.html('<span class="glyphicon glyphicon-comment"></span>&nbsp;&nbsp;Комментарий');
                textarea.val('');
                return;
            }
            var checked = checkbox.is(':checked') ? 1 : 0;
            // update task comment
            $.ajax({
                url: 'api/task/update',
                data: {
                    courseid: courseId,
                    taskid: taskId,
                    week: weekNumber,
                    state: checked,
                    comment: text
                },
                type: "GET"
            }).done(function() {
                indicateAction(block, '#9bdd9b');
                nextBlock.hide();
                obj.html('<span class="glyphicon glyphicon-comment"></span>&nbsp;&nbsp;Комментарий');
                textarea.val('');
                showHistory(null, taskId);
            }).fail(function() {
                indicateAction(block, '#dd9b9b');
            });
        }
        else {
            nextBlock.show();
            obj.html('<span class="glyphicon glyphicon-floppy-disk"></span>&nbsp;&nbsp;Сохранить');
        }
    }
}

// Создать новую задачу
function createTask(obj, courseId, weekNumber) {
    var obj = $(obj);
    var input = obj.parent().parent().find('input[type="text"]');
    var text = input.val();
    if (text) {
        var isAllWeeks = $('#modal-task-body .weeks-checkbox').is(':checked');
        $.ajax({
            url: 'api/task/create',
            data: {
                courseid: courseId,
                week: isAllWeeks ? 0 : weekNumber,
                taskname: text
            },
            type: "GET"
        }).done(function() {
            showTasks(courseId, weekNumber, function() {
                var tbody = $('#modal-window .tasks-table tbody');
                tbody.scrollTop(tbody.get(0).scrollHeight);
            });
        }).fail(function() {
            input.val('');
        });
    }
}

// Отобразить историю изменения задачи
function showHistory(obj, taskId) {
    if (obj) {
        $(obj).parent().parent().parent().children().removeClass("active");
        $(obj).parent().parent().addClass("active");
    }
    $.ajax({
        url: 'api/history',
        data: {
            taskid: taskId
        },
        type: "GET"
    }).done(function(data) {
        var result = {
            histories: data,
            taskId: taskId
        };
        $("#modal-task-history").html(_.template($("#history-tpl").text())(result));
    });
}

// Получить список курсов и отрисовать
function getCourses() {

    function getCourseEvent(course, dateOfMonday) {
        var oneWeek = {};
        var enrollmentStart = course.enrollmentStart;
        var courseStart = course.courseStart;
        var durationWeeks = course.durationWeeks;
        //Идут недели
        var startPlusNWeeks = courseStart.clone();
        startPlusNWeeks.addWeeks(durationWeeks);
        if (courseStart <= dateOfMonday && startPlusNWeeks > dateOfMonday) {
            //Расчет номера недель
            var numberOfWeek = ((dateOfMonday - courseStart) / (7 * 24 * 60 * 60 * 1000)) + 1;
            oneWeek.weekNumber = numberOfWeek.toString();
        }
        //Регистрация открыта
        var startPlus2Weeks = courseStart.clone();
        startPlus2Weeks.addWeeks(2);
        if (enrollmentStart <= dateOfMonday && dateOfMonday < startPlus2Weeks) {
            oneWeek.enrollment = true;
        }
        //Продление, открытие, сертификат
        var startProlongation = courseStart.clone();
        startProlongation.addWeeks(durationWeeks);
        var mondayOfCertificate = startProlongation.clone();
        mondayOfCertificate.addWeeks(2);
        if (startProlongation <= dateOfMonday && dateOfMonday < mondayOfCertificate) {
            oneWeek.prolongation = true;
        }
        var sunday = mondayOfCertificate.clone();
        sunday.moveToDayOfWeek(0, -1);
        var currentSunday = dateOfMonday.clone();
        currentSunday.moveToDayOfWeek(0);
        if (sunday.equals(currentSunday)) {
            oneWeek.open = true;
        }
        if (dateOfMonday.equals(mondayOfCertificate)) {
            oneWeek.certificate = true;
        }
        currentSunday.set({
            millisecond: 99,
            second: 59,
            minute: 59,
            hour: 23
        });
        var now = new Date();
        if (now.between(dateOfMonday, currentSunday)) {
            oneWeek.current = true;
        }
        return oneWeek;
    }

    function isCourseInAction(course, from, to) {
        function check(staticBegin, staticEnd, dynamicBegin, dynamicEnd) {
            if (staticBegin >= staticEnd || dynamicBegin >= dynamicEnd) {
                return false;
            }
            if (staticEnd <= dynamicBegin || staticEnd >= dynamicBegin && staticBegin >= dynamicEnd) {
                return true;
            }
            return false;
        }
        var firstDate = course.enrollmentStart;
        var secondDate = course.courseStart.clone();
        var durationWeeks = course.durationWeeks;
        secondDate.addWeeks(durationWeeks + 2);
        return check(from, to, firstDate, secondDate);
    }

    function getHead(from, to) {
        var cur = from.clone();
        var dates = new Array();
        while (cur < to) {
            var curSunday = cur.clone();
            curSunday.moveToDayOfWeek(0);
            var date = cur.toString("dd.MM") + "-" + curSunday.toString("dd.MM");
            var year = "";
            if (cur.toString("yyyy") !== curSunday.toString("yyyy")) {
                year = cur.toString("yyyy") + "-" + curSunday.toString("yyyy");
            }
            else {
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
            if (today.between(cur, curSunday)) {
                current = true;
            }
            dates.push({
                date: date,
                current: current,
                year: year,
                monday: cur.toString("dd.MM.yyyy")
            });
            cur.addWeeks(1);
        }
        return dates;
    }

    function show(cdata) {
        var from = Date.parseExact($("#from").val(), "dd.MM.yyyy");
        var to = Date.parseExact($("#to").val(), "dd.MM.yyyy");
        if (from.getDay() !== 1) from.moveToDayOfWeek(1, -1);
        if (to.getDay() !== 0) to.moveToDayOfWeek(0);
        var head = getHead(from, to);
        var courses = new Array();
        for (var i = 0; i < cdata.length; i++) {
            var courseRaw = cdata[i].fields;
            courseRaw.id = cdata[i].pk;
            courseRaw.shortName = courseRaw.shortName;
            courseRaw.enrollmentStart = Date.parseExact(courseRaw.enrollmentStart, "yyyy-MM-dd");
            courseRaw.courseStart = Date.parseExact(courseRaw.courseStart, "yyyy-MM-dd");
            //courseRaw.state = 1;
            if (!isCourseInAction(courseRaw, from, to)) {
                var weeks = [];
                for (var j = 0; j < head.length; j++) {
                    weeks.push(getCourseEvent(courseRaw, Date.parseExact(head[j].monday, "dd.MM.yyyy")));
                }
                var course = {
                    id: courseRaw.id,
                    name: courseRaw.courseName,
                    shortName: courseRaw.shortName,
                    state: courseRaw.courseState,
                    weeks: weeks
                };
                courses.push(course);
            }
        }
        var result = {
            headers: head,
            courses: courses
        };
        $("#courses-block").html(_.template($("#courses-tpl").text())(result));
    }

    //var url = 'static/data/list.json';
    var url = 'api/list';
    $.getJSON(url).done(function(data) {
        show(data);
    });
}

// Инициализация
$(document).ready(function() {

    function setDefaultDates() {
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

    setDefaultDates();

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