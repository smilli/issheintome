from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponse
from isheintome.utils import concatenateMsgs
import json
import urllib
import urllib2
from textblob import TextBlob
from textblob.sentiments import NaiveBayesAnalyzer

def index(request):
	return render_to_response('index.html', context_instance=RequestContext(request))

def sentiment(request):
	if request.method=='POST':
		# get messages from fb api
		access_token = request.POST['accessToken']
		romInterestId = request.POST['romInterest[id]']
		query = 'SELECT body FROM message WHERE thread_id IN (SELECT thread_id FROM thread WHERE folder_id=0) AND author_id=' + romInterestId
		data = {'q' : query, 'access_token' : access_token}
		data = urllib.urlencode(data)
		url = 'https://graph.facebook.com/fql?' + data
		req = urllib2.Request(url)
		response = json.loads(urllib2.urlopen(req).read())
		print(response)

		if not response or 'error' in response:
			error = "Sorry, Facebook says you've maxed out on your tries!  Try again in a few minutes."
			return HttpResponse(json.dumps({'error' : error}))
		
		msgs = response['data']
		# if no messages from user
		if len(msgs)==0:
			error = request.POST['romInterest[name]'] + " hasn't talked to you in forever!  Maybe you should do something about that.  Try picking someone else."
			return HttpResponse(json.dumps({'error' : error}))

		# assign a sentiment to msgs
		text = concatenateMsgs(msgs)
		print(text)
		blob = TextBlob(text, analyzer=NaiveBayesAnalyzer())
		sentiment = round(blob.sentiment[1] * 100)
		print(sentiment)

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
		elif 50 < sentiment <= 60:
			message = "You've got a chance!"
		elif 60 < sentiment <= 70:
			message = "Make a move already!"
		elif 70 < sentiment <= 80:
			message = "If you're not dating, you should be."
		elif 80 < sentiment <= 90:
			message = "I bet you're only doing this to make your friends jealous."
		elif 90 < sentiment:
			message = "Wtf just go get a room already"
		
		# return json encoded sentiment value and name of romantic interest
		return HttpResponse(json.dumps({'sentiment' : sentiment, 'name' : request.POST['romInterest[name]'], 'message' : message}))