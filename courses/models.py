from django.db import models

class Course(models.Model):
    id = models.CharField(primary_key=True, max_length=20)
    courseName = models.CharField(max_length=255)
    shortName = models.CharField(max_length=50)
    enrollmentStart = models.DateField()
    courseStart = models.DateField()
    durationWeeks = models.IntegerField()
    courseState = models.BooleanField(default=False)
    def __unicode__(self):
        return self.id

class User(models.Model):
    id = models.AutoField(primary_key=True)
    login = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    def __unicode__(self):
        return self.login

class Task(models.Model):
    id = models.AutoField(primary_key=True)
    courseId = models.ForeignKey(Course)
    taskName = models.CharField(max_length=255)
    weekNumber = models.IntegerField(null=True, blank=True)
    taskState = models.BooleanField(default=False)
    def __unicode__(self):
        return self.taskName
    
class TaskHistory(models.Model):
    id = models.AutoField(primary_key=True)
    taskId = models.ForeignKey(Task)
    userId = models.ForeignKey(User)
    comment = models.TextField(blank=True)
    state = models.BooleanField(default=False)
    timeStamp = models.DateTimeField(auto_now=True)