import json
import hashlib
from flask import Blueprint, jsonify, request
from flask_cors import CORS, cross_origin
from models import Votes

tally = Blueprint('tally',__name__)

@tally.route("/api/vote", methods=['POST'])
@cross_origin(origins=["https://projects.jsonline.com/*", "http://www.jsonline.com/*", "http://preview.jsonline.com/*"])
def vote():
	if ".jsonline.com" in request.environ['HTTP_ORIGIN']:
		form = json.loads(request.data)
		if 'v' in form and 'l' in form:
			if form['v'] and form['l']:
				# set vote
				Votes.insert(
					values=form['v'],
					location=form['l'],
					browser=hashlib.md5(request.remote_addr + request.headers.get('User-Agent')).hexdigest()
				).execute()
			return jsonify({ 'success': True })
		else:
			return jsonify({ 'success': False })
	else:
		return jsonify({ 'success': False })

@tally.route("/api/votes", methods=['GET'])
def get_votes():
	votes = []
	for vote in Votes.select():
		d = {
			'timestamp': vote.timestamp,
			'values': vote.values,
			'location': vote.location,
			'browser': vote.browser
		}
		votes.append(d)
	return jsonify(votes)
