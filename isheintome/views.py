from django.shortcuts import render_to_response
from django.template import RequestContext
import urllib
import urllib2
import json

def index(request):
	return render_to_response('index.html', context_instance=RequestContext(request))

def sentiment(request):
	if request.method=='POST':
		url = 'http://text-processing.com/api/sentiment/'
		print(request.POST)
		values = {'text' : request.POST['text']}

		data = urllib.urlencode(values)
		req = urllib2.Request(url, data)
		response = urllib2.urlopen(req)
		sentiment = response.read()
		print(sentiment)
		sentiment = json.loads(sentiment)
		print(sentiment)
		posPct = round(sentiment['probability']['pos'] * 100)
		return HttpResponse(posPct)