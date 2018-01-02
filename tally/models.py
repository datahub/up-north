import datetime
from peewee import *

db = SqliteDatabase('tally/tally.db')

class BaseModel(Model):
    class Meta:
        database = db

class Votes(BaseModel):
	_id = IntegerField(primary_key=True)
	timestamp = DateTimeField(default=datetime.datetime.now)
	values = CharField(null=True,default=None,max_length=128)
	location = CharField(null=True,default=None,max_length=256)
	browser = CharField(null=True,default=None,max_length=32)

## run once
def create_database():
	db.connect()
	db.create_tables([Votes])
