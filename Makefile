
DISTS:= \
	dist/Boot.js \
	dist/Redir-2D.js \
	dist/Redir-3D.js

CSS:= \
	css/solarized.css \
	css/core.css \
	css/widgets.css

all: $(DISTS) dist/snmd.min.css cache.id

cache.id: $(DISTS) $(CSS)
	./gen-cache-id.js

dist/%.js: js/%.js
	uglifyjs \
	    --output $@ \
	    --source-map \
	    --compress \
	    --mangle \
	    --lint \
	    --stats \
	    -- $+

dist/snmd.min.css: $(CSS)
	uglifycss $+ > $@

clean:
	rm -f dist/*.js dist/*.map dist/snmd.min.css
