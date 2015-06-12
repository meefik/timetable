from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'timetable.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    
    url(r'^$', 'django.contrib.staticfiles.views.serve', kwargs={'path': 'index.html'}),
    url(r'^api/list$', 'courses.views.list'),
    url(r'^api/history$', 'courses.views.history'),
    url(r'^api/task$', 'courses.views.task'),
    url(r'^api/task/create$', 'courses.views.task_create'),
    url(r'^api/task/update$', 'courses.views.task_update'),

    url(r'^admin/', include(admin.site.urls)),
)
