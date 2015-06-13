from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'timetable.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    
    url(r'^$', 'django.contrib.staticfiles.views.serve', kwargs={'path': 'index.html'}),
    url(r'^course/list$', 'courses.views.course_list'),
    url(r'^note/list$', 'courses.views.note_list'),
    url(r'^note/create$', 'courses.views.note_create'),
    url(r'^note/remove$', 'courses.views.note_remove'),
    url(r'^task/list$', 'courses.views.task_list'),
    url(r'^task/create$', 'courses.views.task_create'),
    url(r'^task/update$', 'courses.views.task_update'),
    url(r'^history/list$', 'courses.views.history_list'),

    url(r'^admin/', include(admin.site.urls)),
)
