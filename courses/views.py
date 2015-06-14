from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.core import serializers
from courses.models import Course, Note, Task, TaskHistory
from json import dumps

def date_handler(obj):
    return obj.isoformat() if hasattr(obj, 'isoformat') else obj

def index(request):
    return render_to_response('index.html')

def course_list(request):
    courses_list = Course.objects.all().order_by('courseStart')
    obj_arr = []
    for course in courses_list:
        course_state = None
        course_tasks = Task.objects.filter(course=course.id).count()
        if course_tasks > 0:
            course_state = Task.objects.filter(course=course.id,taskState=False).count() == 0 if True else False
        data = {
            "courseId": course.id,
            "courseName": course.courseName,
            "shortName": course.shortName,
            "enrollmentStart": course.enrollmentStart,
            "courseStart": course.courseStart,
            "durationWeeks": course.durationWeeks,
            "courseState": course_state,
            "weeksState": []
        }
        for week_number in range(1,course.durationWeeks+1):
            task_state = None
            week_tasks = Task.objects.filter(course=course.id,weekNumber=week_number).count()
            if week_tasks > 0:
                task_state = Task.objects.filter(course=course.id,weekNumber=week_number,taskState=False).count() == 0 if True else False
            data["weeksState"].append(task_state)
        obj_arr.append(data);
    response = dumps(obj_arr,ensure_ascii=False,indent=2,default=date_handler)
    #json_serializer = serializers.get_serializer('json')()
    #response = json_serializer.serialize(courses_list,ensure_ascii=False,indent=2,use_natural_keys=True)
    return HttpResponse(response,mimetype='application/json; charset=utf8')

def task_list(request):
    course_id = request.GET.get('courseid')
    week = request.GET.get('week')
    if course_id != None and week != None:
        week_number = int(week)
        task_list = Task.objects.filter(course=course_id,weekNumber=week_number)
        json_serializer = serializers.get_serializer('json')()
        response = json_serializer.serialize(task_list,ensure_ascii=False,indent=2,use_natural_keys=True)
        return HttpResponse(response,mimetype='application/json; charset=utf8')
    return HttpResponse(status=400)

def task_create(request):
    course_id = request.GET.get('courseid')
    task_name = request.GET.get('taskname')
    week = request.GET.get('week')
    if course_id != None and task_name != None and week != None:
        week_number = int(week)
        course = Course.objects.get(id=course_id)
        if week_number != 0:
            Task.objects.create(course=course,taskName=task_name,weekNumber=week_number)
        else:
            for w in range(1,course.durationWeeks+1):
                Task.objects.create(course=course,taskName=task_name,weekNumber=w)
        # Update course state
        course.courseState = False
        course.save()
        return HttpResponse(status=200)
    return HttpResponse(status=400)

def task_update(request):
    course_id = request.GET.get('courseid')
    task_id = request.GET.get('taskid')
    if course_id != None and task_id != None:
        task_state = request.GET.get('state') == '1' if True else False
        task_comment = request.GET.get('comment')
        if task_comment == None:
            task_comment = ''
        # Update task state
        task = Task.objects.get(id=task_id)
        task.taskState = task_state
        task.save()
        # Add history item
        user = 'admin' # username from edX
        TaskHistory.objects.create(task=task,username=user,state=task_state,comment=task_comment)
        return HttpResponse(status=200)
    return HttpResponse(status=400)
    
def history_list(request):
    task_id = request.GET.get('taskid')
    if task_id != None:
        history_list = TaskHistory.objects.filter(task=task_id).order_by('-timeStamp')
        json_serializer = serializers.get_serializer('json')()
        response = json_serializer.serialize(history_list,ensure_ascii=False,indent=2,use_natural_keys=True)
        return HttpResponse(response, mimetype='application/json; charset=utf8')
    return HttpResponse(status=400)

def note_list(request):
    course_id = request.GET.get('courseid')
    if course_id != None:
        note_list = Note.objects.filter(course=course_id).order_by('-timeStamp')
        json_serializer = serializers.get_serializer('json')()
        response = json_serializer.serialize(note_list,ensure_ascii=False,indent=2,use_natural_keys=True)
        return HttpResponse(response,mimetype='application/json; charset=utf8')
    return HttpResponse(status=400)

def note_create(request):
    course_id = request.GET.get('courseid')
    note_comment = request.GET.get('comment')
    if course_id != None and note_comment != None:
        course = Course.objects.get(id=course_id)
        user = 'admin' # username from edX
        Note.objects.create(course=course,username=user,comment=note_comment)
        return HttpResponse(status=200)
    return HttpResponse(status=400)
    
def note_remove(request):
    note_id = request.GET.get('noteid')
    if note_id != None:
        Note.objects.get(id=note_id).delete()
        return HttpResponse(status=200)
    return HttpResponse(status=400)
