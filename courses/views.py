from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.core import serializers
from courses.models import Course, User, Task, TaskHistory

def index(request):
    return render_to_response('index.html')

def list(request):
    courses_list = Course.objects.all().order_by('courseStart')
    json_serializer = serializers.get_serializer('json')()
    response =  json_serializer.serialize(courses_list, ensure_ascii=False, indent=2, use_natural_keys=True)
    return HttpResponse(response, mimetype='application/json; charset=utf8')

def task(request):
    course_id = request.GET.get('courseid')
    week_number = request.GET.get('week')
    if course_id != None:
        task_list = Task.objects.filter(courseId=course_id,weekNumber=week_number)
        json_serializer = serializers.get_serializer('json')()
        response =  json_serializer.serialize(task_list, ensure_ascii=False, indent=2, use_natural_keys=True)
        return HttpResponse(response, mimetype='application/json; charset=utf8')
    return HttpResponse(status=400)

def task_create(request):
    course_id = request.GET.get('courseid')
    task_name = request.GET.get('taskname')
    week = request.GET.get('week')
    week_number = None if None else int(week)
    if course_id != None and task_name != None:
        course = Course.objects.get(id=course_id)
        if week_number == None:
            Task.objects.create(courseId=course,taskName=task_name)
        if week_number > 0:
            Task.objects.create(courseId=course,taskName=task_name,weekNumber=week_number)
        if week_number == 0:
            for w in range(1,course.durationWeeks+1):
                Task.objects.create(courseId=course,taskName=task_name,weekNumber=w)
        # Update course state
        course = Course.objects.get(id=course_id)
        course.courseState = False
        course.save()
        return HttpResponse(status=200)
    return HttpResponse(status=200)

def task_update(request):
    course_id = request.GET.get('courseid')
    task_id = request.GET.get('taskid')
    if course_id != None and task_id != None:
        task_state = request.GET.get('state') == '1' if True else False
        task_comment = request.GET.get('comment')
        if task_comment == None:
            task_comment = ''
        try:
            # Update task state
            task = Task.objects.get(id=task_id)
            task.taskState = task_state
            task.save()
            # Add history item
            user = User.objects.get(id=1)
            TaskHistory.objects.create(taskId=task,userId=user,state=task_state,comment=task_comment)
            # Update course state
            course_state = Task.objects.filter(courseId=course_id,taskState=False).count() == 0 if True else False
            course = Course.objects.get(id=course_id)
            course.courseState = course_state
            course.save()
        except Exception as e:
            print '%s (%s)' % (e.message, type(e))
        return HttpResponse(status=200)
    return HttpResponse(status=400)
    
def history(request):
    task_id = request.GET.get('taskid')
    if task_id != None:
        history_list = TaskHistory.objects.filter(taskId=task_id).order_by('-timeStamp')
        json_serializer = serializers.get_serializer('json')()
        response = json_serializer.serialize(history_list, ensure_ascii=False, indent=2, use_natural_keys=True)
        return HttpResponse(response, mimetype='application/json; charset=utf8')
    return HttpResponse(status=400)
