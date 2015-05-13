from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.core import serializers
from courses.models import Course, User, Task, TaskHistory

def index(request):
    return render_to_response('index.html')

def list(request):
    courses_list = Course.objects.all().order_by('courseStart')
    json_serializer = serializers.get_serializer("json")()
    response =  json_serializer.serialize(courses_list, ensure_ascii=False, indent=2, use_natural_keys=True)
    return HttpResponse(response, mimetype="application/json; charset=utf8")

def task(request):
    course_id = request.GET.get('courseid')
    if course_id != None:
        task_list = Task.objects.filter(courseId=course_id)
        json_serializer = serializers.get_serializer("json")()
        response =  json_serializer.serialize(task_list, ensure_ascii=False, indent=2, use_natural_keys=True)
        return HttpResponse(response, mimetype="application/json; charset=utf8")
    return HttpResponse(status=400)

def task_update(request):
    task_id = request.GET.get('taskid')
    if task_id != None:
        task_state = request.GET.get('state') == '1' if True else False
        Task.objects.filter(id=task_id).update(taskState=task_state);
        return HttpResponse(status=200)
    return HttpResponse(status=400)

def history(request):
    task_id = request.GET.get('taskid')
    if task_id != None:
        history_list = TaskHistory.objects.filter(taskId=task_id)
        json_serializer = serializers.get_serializer("json")()
        response =  json_serializer.serialize(history_list, ensure_ascii=False, indent=2, use_natural_keys=True)
        return HttpResponse(response, mimetype="application/json; charset=utf8")
    return HttpResponse(status=400)
