## This is the up-north vote collector app.

It's a flask app that can be loaded using blueprints. This was originally added as a module on apps.jsonline.com.

```python
app.register_blueprint(tally, url_prefix='/tally')
```
It exposes an api for votes and stores the data in a sqlite database.
