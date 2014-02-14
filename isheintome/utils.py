def concatenateMsgs(msgs):
	text = ''
	for msg in msgs:
		text += msg['body'] + ' '
	return text