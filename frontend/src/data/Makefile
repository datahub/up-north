
GENERATED_FILES = topo.json

all: $(GENERATED_FILES)

shp/ne_10m_admin_1_states_provinces_lakes.shp:
	mkdir -p $(dir $@)
	unzip -d $(dir $@) zip/ne_10m_admin_1_states_provinces_lakes.zip
	touch $@

shp/ne_10m_roads_north_america.shp:
	mkdir -p $(dir $@)
	unzip -d $(dir $@) zip/ne_10m_roads_north_america.zip
	touch $@

shp/ne_10m_populated_places.shp:
	mkdir -p $(dir $@)
	unzip -d $(dir $@) zip/ne_10m_populated_places.zip
	touch $@

shp/ne_10m_lakes.shp:
	mkdir -p $(dir $@)
	unzip -d $(dir $@) zip/ne_10m_lakes.zip
	touch $@

geojson/winnebago.json: shp/ne_10m_lakes.shp 
	mkdir -p $(dir $@)
	mapshaper \
		-i $< \
		-filter 'name === "Lake Winnebago"' \
		-o $@ format=geojson force

geojson/states.json: shp/ne_10m_admin_1_states_provinces_lakes.shp geojson/winnebago.json
	mkdir -p $(dir $@)
	mapshaper \
		-i $< \
		-filter '["Wisconsin", "Michigan", "Minnesota", "Illinois", "Iowa", "Indiana"].indexOf(name) !== -1' \
		-erase geojson/winnebago.json \
		-o $@ format=geojson force

geojson/wisconsin.json: shp/ne_10m_admin_1_states_provinces_lakes.shp geojson/winnebago.json
	mkdir -p $(dir $@)
	mapshaper \
		-i $< \
		-filter 'name === "Wisconsin"'\
		-erase geojson/winnebago.json \
		-o $@ format=geojson force

HIGHWAYS = [2, 8, 10, 33, 18, 29, 64]

geojson/highways.json: shp/ne_10m_roads_north_america.shp
	mkdir -p $(dir $@)
	mapshaper \
		-i $< \
		-filter 'state === "Wisconsin" && $(HIGHWAYS).indexOf(+number) !== -1' \
		-o $@ format=geojson force

KEEPER_CITIES = [\
	"Milwaukee", \
	"Madison", \
	"Green Bay", \
	"Eau Claire", \
	"Wausau", \
	"La Crosse", \
	"Rhinelander", \
	"Superior" \
]

geojson/cities.json: shp/ne_10m_populated_places.shp
	mkdir -p $(dir $@)
	mapshaper \
		-i $< \
		-filter 'ADM1NAME === "Wisconsin" && $(KEEPER_CITIES).indexOf(NAME) !== -1' \
		-o $@ format=geojson force

LAYERS = \
	geojson/wisconsin.json \
	geojson/highways.json \
	geojson/cities.json \
	geojson/states.json

topo.json: $(LAYERS)
	mapshaper \
		-i $^ combine-files \
		-simplify 35% \
		-o $@ format=topojson force

gz/countyp010g.shp_nt00934.tar.gz:
	mkdir -p $(dir $@)
	curl -o $@.download 'https://prd-tnm.s3.amazonaws.com/StagedProducts/Small-scale/data/Boundaries/countyp010g.shp_nt00934.tar.gz'
	mv $@.download $@

shp/countyp010g.shp: gz/countyp010g.shp_nt00934.tar.gz
	mkdir -p $(dir $@)
	tar -xzm -C $(dir $@) -f $<

geojson/counties.json: shp/countyp010g.shp
	mkdir -p $(dir $@)
	mapshaper \
		-i $< \
		-filter 'STATE === "WI" && ADMIN_NAME !== ""' \
		-o $@ format=geojson force

csv/counties.csv: geojson/counties.json
	mkdir -p $(dir $@)
	jq < $< '[.features[].properties | { name: .ADMIN_NAME }]' | json2csv > $@
