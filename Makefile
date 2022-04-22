#
# Makefile
# sandvich, 2022-04-19 16:46
#

all: script.user.js

release: script.user.js
	cp script.user.js script-release/
	cd script-release && git add script.user.js && git commit -m "update" && git push

clean:
	rm script.user.js
	rm obj/*.js

script.user.js: src/headers.js obj/main.js
	cat $^ > script.user.js

obj/main.js: src/main.ts src/request.ts
	mkdir -p obj
	tsc src/main.ts --outfile obj/main.js

# vim:ft=make
#
