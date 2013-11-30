from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponse
import json
from textblob import TextBlob
from textblob.sentiments import NaiveBayesAnalyzer

def index(request):
	return render_to_response('index.html', context_instance=RequestContext(request))

def sentiment(request):
	if request.method=='POST':
		text = request.POST['text'].encode('ascii', 'ignore');
		values = {'text' : text}
		blob = TextBlob(text, analyzer=NaiveBayesAnalyzer())
		sentiment = round(blob.sentiment[1] * 100)

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
		return HttpResponse(json.dumps({'sentiment' : sentiment, 'name' : request.POST['name'], 'message' : message}))