from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponse
import urllib
import urllib2
import json

def index(request):
	return render_to_response('index.html', context_instance=RequestContext(request))

def sentiment(request):
	if request.method=='POST':
		url = 'http://text-processing.com/api/sentiment/'
		text = request.POST['text']
		# sentiment analysis api limits to 10000 characters, 9900 to be safe
		if len(text) >= 9900:
			text = text[:9900]
		values = {'text' : text}
		data = urllib.urlencode(values)
		req = urllib2.Request(url, data)
		response = urllib2.urlopen(req)
		sentiment = json.loads(response.read())
		sentiment = round(sentiment['probability']['pos'] * 100)

		if sentiment <= 10:
			message = "Wow.. forever alone"
		elif 10 < sentiment <= 20:
			message = "Basically, you're hated"
		elif 20 < sentiment <= 30:
			message = "Friend-zoned"
		elif 30 < sentiment <= 40:
			message = "Uhh good luck?"
		elif 40 < sentiment < 50:
			message = "So close, but so far."
		elif sentiment == 50:
			message = "Love-hate relationship?"
		elif 50 < sentiment < 60:
			message = "You've got a chance!"
		elif 60 < sentiment < 70:
			message = "Make a move already!"
		elif 70 < sentiment < 80:
			message = "If you're not dating, you should be."
		elif 80 < sentiment < 90:
			message = "I bet you're only doing this to make your friends jealous."
		elif 90 < sentiment:
			message = "Wtf just go get a room already"
		
		# return json encoded sentiment value and name of romantic interest
		return HttpResponse(json.dumps({'sentiment' : sentiment, 'name' : request.POST['name'], 'message' : message}))