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
		values = {'text' : request.POST['text']}

		data = urllib.urlencode(values)
		req = urllib2.Request(url, data)
		response = urllib2.urlopen(req)
		sentiment = response.read()
		sentiment = json.loads(sentiment)
		posPct = round(sentiment['probability']['pos'] * 100)
		return HttpResponse(posPct)