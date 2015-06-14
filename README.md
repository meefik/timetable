Timetable
=========

Licensed under the [GPL version 3](http://www.gnu.org/licenses/) or later.

The application for planning and development online courses (e.g. edX Platform).

## Starting from terminal

In case you want to run the application from terminal just run:

1) Install requirements

    $ pip install -r requirements.txt

2) Run syncdb command to sync models to database and create Django's default superuser and auth system

    $ python manage.py syncdb

3) Import database

    $ cat db.sql | sqlite3 db.sqlite3

4) Install bower components

    $ cd courses/static
    $ bower install

5) Run Django

    $ python manage.py runserver $IP:$PORT
