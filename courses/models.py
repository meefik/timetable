from django.db import models

class Course(models.Model):
    id = models.CharField(primary_key=True, max_length=20)
    courseName = models.CharField(max_length=255)
    shortName = models.CharField(max_length=50)
    enrollmentStart = models.DateField()
    courseStart = models.DateField()
    durationWeeks = models.IntegerField()
    courseState = models.NullBooleanField(null=True)

class Note(models.Model):
    id = models.AutoField(primary_key=True)
    courseId = models.ForeignKey(Course)
    username = models.CharField(max_length=255)
    comment = models.TextField(blank=True)
    timeStamp = models.DateTimeField(auto_now=True)

class Task(models.Model):
    id = models.AutoField(primary_key=True)
    courseId = models.ForeignKey(Course)
    taskName = models.CharField(max_length=255)
    weekNumber = models.IntegerField(default=-1)
    taskState = models.BooleanField(default=False)

class TaskHistory(models.Model):
    id = models.AutoField(primary_key=True)
    taskId = models.ForeignKey(Task)
    username = models.CharField(max_length=255)
    comment = models.TextField(blank=True)
    state = models.BooleanField(default=False)
    timeStamp = models.DateTimeField(auto_now=True)