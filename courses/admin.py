from courses.models import Course, Note, Task, TaskHistory
from django.contrib import admin

class TaskHistoryInline(admin.StackedInline):
    model = TaskHistory
    extra = 1

class TaskAdmin(admin.ModelAdmin):
    list_display = ('id','taskName', 'course', 'weekNumber')
    search_fields = ['taskName', 'course']
    inlines = [TaskHistoryInline]
    
admin.site.register(Task, TaskAdmin)

class TaskInline(admin.StackedInline):
    model = Task
    extra = 1
    
class NoteInline(admin.StackedInline):
    model = Note
    extra = 1

class CourseAdmin(admin.ModelAdmin):
    list_display = ('id', 'courseName', 'shortName', 'enrollmentStart', 'courseStart', 'durationWeeks')
    list_filter = ['courseStart']
    search_fields = ['id', 'shortName']
    date_hierarchy = 'courseStart'
    inlines = [TaskInline, NoteInline]

admin.site.register(Course, CourseAdmin)

class TaskHistoryAdmin(admin.ModelAdmin):
    list_display = ('id','task', 'username', 'state', 'comment', 'timeStamp')
    list_filter = ['timeStamp']
    search_fields = ['task', 'username']
    date_hierarchy = 'timeStamp'
    
admin.site.register(TaskHistory, TaskHistoryAdmin)

class NoteAdmin(admin.ModelAdmin):
    list_display = ('id','course', 'username', 'comment', 'timeStamp')
    list_filter = ['timeStamp']
    search_fields = ['course', 'username']
    date_hierarchy = 'timeStamp'
    
admin.site.register(Note, NoteAdmin)
