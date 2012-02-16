.PHONY: all clean

SOURCE=../lib/Gettext.js
PO2JSONSOURCE=../bin/po2json

all: pod/Gettext.pod html/Gettext.html text/Gettext.text \
	 pod/po2json.pod html/po2json.html text/po2json.text

pod/Gettext.pod: $(SOURCE) pod
	perldoc -u $< > $@

html/Gettext.html: pod/Gettext.pod html
	pod2html $< > $@
	rm pod2htm*.tmp

text/Gettext.text: pod/Gettext.pod text
	pod2text $< > $@

pod/po2json.pod: $(PO2JSONSOURCE) pod
	perldoc -u $< > $@

html/po2json.html: pod/po2json.pod html
	pod2html $< > $@
	rm pod2htm*.tmp

text/po2json.text: pod/po2json.pod text
	pod2text $< > $@

html text pod:
	mkdir -p $@

clean:
	rm -fr html text pod
