
DISTS:= \
	dist/Boot.js \
	dist/Redir-2D.js \
	dist/Redir-3D.js


all: $(DISTS)

dist/%.js: js/%.js
	uglifyjs \
	    --output $@ \
	    --source-map $(subst .js,.map,$@) \
	    --compress \
	    --mangle \
	    --lint \
	    --stats \
	    -- $+

clean:
	rm -f dist/*.js dist/*.map
