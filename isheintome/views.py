from django.shortcuts import render_to_response
from django.template import RequestContext
import urllib
import urllib2

def index(request):
	return render_to_response('index.html', context_instance=RequestContext(request))

def sentiment(request):
	if request.method=='POST':
		url = 'http://text-processing.com/api/sentiment/'
		print(request.POST)
		values = {'text' : request.POST['data']}

		data = urllib.urlencode(values)
		req = urllib2.Request(url, data)
		response = urllib2.urlopen(req)
		the_page = response.read()
		print(the_page)
		return render_to_response(the_page, context_instance=RequestContext(request))