from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'django.contrib.staticfiles.views.serve', kwargs={'path': 'index.html'}),
    url(r'^api/list$', 'courses.views.list'),
    url(r'^admin/', include(admin.site.urls)),
)