// Отобразить список курсов
function showCourses() {

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
            var course = cdata[i];
            course.id = cdata[i].courseId;
            course.shortName = course.shortName;
            course.enrollmentStart = Date.parseExact(course.enrollmentStart, "yyyy-MM-dd");
            course.courseStart = Date.parseExact(course.courseStart, "yyyy-MM-dd");
            if (!isCourseInAction(course, from, to)) {
                var weeks = [];
                for (var j = 0; j < head.length; j++) {
                    weeks.push(getCourseEvent(course, Date.parseExact(head[j].monday, "dd.MM.yyyy")));
                }
                var course = {
                    id: course.id,
                    name: course.courseName,
                    shortName: course.shortName,
                    state: course.courseState,
                    weeksState: course.weeksState,
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

    function drawTable() {
        var table =  $('#courses-table').DataTable({
            paging: false,
            info: false,
            //filter: false,
            scrollX: true,
            columnDefs: [{
                orderable: false,
                searchable: false,
                targets: 'header-week'
            }],
            language: {
                zeroRecords: "Не найдено ни одной записи"
            }
        });
    }

    var url = 'course/list';
    $.getJSON(url).done(function(data) {
        show(data);
        drawTable();
    });
}

// Отобразить окно задач
function showTasks(courseId, weekNumber) {
    var modal = $('#modal-tasks');
    if (weekNumber > 0) {
        modal.find('.modal-title').html("Задачи курса " + courseId + " на " + weekNumber + " неделю");
        modal.find('.weeks-text').show();
    }
    else {
        modal.find('.modal-title').html("Задачи курса " + courseId);
        modal.find('.weeks-text').hide();
    }
    modal.find('.create-btn').on('click', function() {
        createTask(courseId, weekNumber);
    });
    modal.show();
    drawTasks(courseId, weekNumber);
}

// Скрыть окно задач
function hideTasks() {
    var modal = $('#modal-tasks');
    modal.find('.task-body').html("");
    modal.find('.task-history').html("");
    modal.find('.create-btn').off('click');
    modal.hide();
}

// Получить и отрисовать список задач
function drawTasks(courseId, weekNumber, callback) {
    $.ajax({
        url: 'task/list',
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
        var modal = $('#modal-tasks');
        modal.find('.task-body').html(_.template($('#tasks-tpl').text())(result));
        if (callback) callback();
    });
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
            url: 'task/update',
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
                url: 'task/update',
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
function createTask(courseId, weekNumber) {
    var modal = $('#modal-tasks');
    var input = modal.find('.input-text');
    var text = input.val();
    if (text) {
        var isAllWeeks = modal.find('.weeks-checkbox').is(':checked');
        $.ajax({
            url: 'task/create',
            data: {
                courseid: courseId,
                week: isAllWeeks ? 0 : weekNumber,
                taskname: text
            },
            type: "GET"
        }).done(function() {
            input.val('');
            drawTasks(courseId, weekNumber, function() {
                var tbody = modal.find('.tasks-table tbody');
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
        url: 'history/list',
        data: {
            taskid: taskId
        },
        type: "GET"
    }).done(function(data) {
        var result = {
            histories: data,
            taskId: taskId
        };
        var modal = $('#modal-tasks');
        modal.find('.task-history').html(_.template($("#history-tpl").text())(result));
    });
}

// Отобразить окно заметок курса
function showNotes(courseId) {
    var modal = $('#modal-notes');
    modal.find('.modal-title').html("Заметки курса " + courseId);
    modal.find('.create-btn').on('click', function() {
        createNote(courseId);
    });
    modal.show();
    drawNotes(courseId);
}

// Скрыть окно заметок
function hideNotes() {
    var modal = $('#modal-notes');
    modal.find('.note-body').html("");
    modal.find('.create-btn').off('click');
    modal.hide();
}

// Получить и отрисовать список заметок
function drawNotes(courseId, callback) {
    $.ajax({
        url: 'note/list',
        data: {
            courseid: courseId
        },
        type: "GET"
    }).done(function(data) {
        var result = {
            notes: data,
            courseId: courseId
        };
        var modal = $('#modal-notes');
        modal.find('.note-body').html(_.template($("#notes-tpl").text())(result));
        if (callback) callback();
    });
}

// Создать новую заметку
function createNote(courseId) {
    var modal = $('#modal-notes');
    var input = modal.find('.input-text');
    var text = input.val();
    if (text) {
        var isAllWeeks = modal.find('.weeks-checkbox').is(':checked');
        $.ajax({
            url: 'note/create',
            data: {
                courseid: courseId,
                comment: text
            },
            type: "GET"
        }).done(function() {
            input.val('');
            drawNotes(courseId);
        }).fail(function() {
            input.val('');
        });
    }
}

// Удалить заметку
function removeNote(obj, noteId) {
    $.ajax({
        url: 'note/remove',
        data: {
            noteid: noteId
        },
        type: "GET"
    }).done(function(data) {
        $(obj).parent().remove();
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
    
    var modal_tasks = $('#modal-tasks');
    modal_tasks.find('.input-text').keyup(function(e) {
        if (e.keyCode == 13) {
            modal_tasks.find('.create-btn').trigger('click');
        }
    });

    var modal_notes = $('#modal-notes');
    modal_notes.find('.input-text').keyup(function(e) {
        if (e.keyCode == 13) {
            modal_notes.find('.create-btn').trigger('click');
        }
    });
    
    var search = $('#dates-form .search');
    search.keyup(function(e) {
        if (e.keyCode != 13) {
            var text = $(this).val();
            $('#courses-table').DataTable().search(text).draw();
        }
    });

    _.templateSettings = {
        evaluate: /\{\{(.+?)\}\}/g,
        interpolate: /\{\{=(.+?)\}\}/g,
        escape: /\{\{-(.+?)\}\}/g
    };
    
    showCourses();
});