from courses.models import Course, User, Task, TaskHistory
from django.contrib import admin

admin.site.register(User)

class TaskHistoryInline(admin.StackedInline):
    model = TaskHistory
    extra = 1

class TaskAdmin(admin.ModelAdmin):
    list_display = ('id','taskName', 'courseId', 'weekNumber')
    search_fields = ['taskName', 'courseId']
    inlines = [TaskHistoryInline]
    
admin.site.register(Task, TaskAdmin)

class TaskInline(admin.StackedInline):
    model = Task
    extra = 1

class CourseAdmin(admin.ModelAdmin):
    list_display = ('id', 'shortName', 'enrollmentStart', 'courseStart', 'durationWeeks')
    list_filter = ['courseStart']
    search_fields = ['id', 'shortName']
    date_hierarchy = 'courseStart'
    inlines = [TaskInline]

admin.site.register(Course, CourseAdmin)

class TaskHistoryAdmin(admin.ModelAdmin):
    list_display = ('id','taskId', 'userId', 'state', 'comment', 'timeStamp')
    list_filter = ['timeStamp']
    search_fields = ['taskId', 'userId']
    date_hierarchy = 'timeStamp'
    
admin.site.register(TaskHistory, TaskHistoryAdmin)