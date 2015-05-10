from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.core import serializers
from courses.models import Course

def index(request):
    return render_to_response('index.html')

def list(request):
    courses_list = Course.objects.all() #.order_by('courseStart')
    json_serializer = serializers.get_serializer("json")()
    response =  json_serializer.serialize(courses_list, ensure_ascii=False, indent=2, use_natural_keys=True)
    return HttpResponse(response, mimetype="application/json; charset=utf8")
