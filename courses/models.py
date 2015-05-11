from django.db import models

# Create your models here.
class Course(models.Model):
    id = models.CharField(primary_key=True, max_length=20)
    name = models.CharField(max_length=255)
    shortName = models.CharField(max_length=50)
    enrollmentStart = models.DateField()
    courseStart = models.DateField()
    weeks = models.IntegerField()
    def __unicode__(self):
        return self.id

class Checkitem(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    def __unicode__(self):
        return self.name

class User(models.Model):
    id = models.AutoField(primary_key=True)
    login = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    def __unicode__(self):
        return self.login

class Checkitemstate(models.Model):
    id = models.AutoField(primary_key=True)
    checkitem = models.ForeignKey(Checkitem)
    state = models.BooleanField()
    user = models.ForeignKey(User)
    comment = models.TextField(blank=True)
    datetime = models.DateTimeField(auto_now_add=True)

class Course_checkitem(models.Model):
    course = models.ForeignKey(Course)
    checkitem = models.ForeignKey(Checkitem)

#class Weekcheckitem(models.Model):
#    course = models.ForeignKey(Course)
#    checkitem = models.ForeignKey(Checkitem)
#    number = models.IntegerField()

#class Concreteweekcheckitem(models.Model):
#    course = models.ForeignKey(Course)
#    checkitem = models.ForeignKey(Checkitem)
#    number = models.IntegerField()
