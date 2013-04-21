.PHONY: all manifest dist doc readme website

PREFIX?=/home/groups/jsgettext

all: doc manifest readme

readme:
	perldoc -t lib/Gettext.js > README

manifest:
	find . -type f ! -name '*.bak' ! -name '.cvsignore' | \
	  grep -v CVS | \
	  sed 's/^.\///' | \
	  grep -v '^website' | \
	  grep -v '^Gettext-.....tar.gz$$' | \
	  sort > MANIFEST

dist: doc readme manifest META.yml
	perl -e 'use YAML;';
	H=`pwd`; \
	N=`perl -MYAML -e 'print((YAML::LoadFile("META.yml"))->{name})'`; \
	V=`perl -MYAML -e 'print((YAML::LoadFile("META.yml"))->{version})'`; \
	D="$${N}-$${V}"; \
	rm -fr "/tmp/$$D" && \
	cat MANIFEST | cpio -dump "/tmp/$$D" && \
	cd /tmp; tar czvf "$${D}.tar.gz" $$D && \
	rm -r $$D && \
	cd $$H && \
	mv "/tmp/$${D}.tar.gz" ./

website:
	make -C website
	make -C website PREFIX=$(PREFIX) install

doc:
	make -C doc

