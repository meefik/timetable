Timetable
=========

## Starting from the Terminal

In case you want to run your Django application from the terminal just run:

1) Install requirements

    $ pip install -r requirements.txt

2) Run syncdb command to sync models to database and create Django's default superuser and auth system

    $ python manage.py syncdb

3) Run Django

    $ python manage.py runserver $IP:$PORT
