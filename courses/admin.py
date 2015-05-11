from courses.models import Course, User, Checkitem, Checkitemstate, Course_checkitem
from django.contrib import admin

admin.site.register(User)
admin.site.register(Checkitem)

class Course_checkitemInline(admin.StackedInline):
    model = Course_checkitem
    extra = 1

class CourseAdmin(admin.ModelAdmin):
    list_display = ('id', 'shortName', 'enrollmentStart', 'courseStart', 'weeks')
    list_filter = ['courseStart']
    search_fields = ['id', 'shortName']
    date_hierarchy = 'courseStart'
    inlines = [Course_checkitemInline]

admin.site.register(Course, CourseAdmin)

class Course_checkitemAdmin(admin.ModelAdmin):
    list_display = ('checkitem', 'course')
    search_fields = ['checkitem', 'course']

admin.site.register(Course_checkitem, Course_checkitemAdmin)

class CheckitemstateAdmin(admin.ModelAdmin):
    list_display = ('checkitem','state', 'user', 'comment', 'datetime')
    list_filter = ['datetime']
    search_fields = ['checkitem', 'user']
    date_hierarchy = 'datetime'
    

admin.site.register(Checkitemstate, CheckitemstateAdmin)