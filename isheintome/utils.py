import urllib
import urllib2

url = 'graph.facebook.com/fql?q=SELECT body FROM message WHERE thread_id IN (SELECT thread_id FROM thread WHERE folder_id=0)&access_token='