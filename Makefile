#
# Makefile
# sandvich, 2022-04-19 16:46
#

all: script.user.js

clean:
	rm script.user.js
	rm obj/*.js

script.user.js: src/headers.js obj/main.js
	cat $^ > script.user.js

obj/main.js: src/main.ts src/request.ts
	tsc src/main.ts --outfile obj/main.js

# vim:ft=make
#
