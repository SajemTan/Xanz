all: morph.xanz.hfstol gen.xanz.hfstol morph.xanz_c.hfstol gen.xanz_c.hfstol r2c.hfstol c2r.hfstol

%.xfst.hfst: %.xfst
	hfst-regexp2fst -S $< > $@

%.lexd.att: %.lexd
	lexd $< > $@

%.lexd.hfst: %.lexd.att
	hfst-txt2fst $< > $@

%.twol.hfst: %.twol
	hfst-twolc $< > $@

morph.%.hfst: gen.%.hfst
	hfst-invert $< > $@

%.hfstol: %.hfst
	hfst-fst2fst -O $< > $@

gen.xanz.hfst: morph-phon.hfst reduce.twol.hfst xanz.xfst.hfst
	hfst-compose-intersect -1 morph-phon.hfst -2 reduce.twol.hfst | hfst-compose -1 - -2 xanz.xfst.hfst > $@

gen.xanz_c.hfst: morph-phon.hfst dummy_vowel.xfst.hfst cuneiform.lexd.hfst
	hfst-compose -1 morph-phon.hfst -2 dummy_vowel.xfst.hfst | hfst-compose -1 - -2 cuneiform.lexd.hfst > $@

morph-phon.hfst: xanz.lexd.hfst xanz.twol.hfst
	hfst-invert xanz.lexd.hfst | hfst-compose-intersect -1 - -2 xanz.twol.hfst > $@

xanz.lexd: morph.lexd lexicon.lexd
	cat $^ > $@

lexicon.lexd: lexicon.yaml yaml2js.py
	python3 yaml2js.py

r2c.hfst: morph.xanz.hfst gen.xanz_c.hfst
	hfst-compose -1 morph.xanz.hfst -2 gen.xanz_c.hfst > $@

c2r.hfst: r2c.hfst
	hfst-invert $< > $@

clean:
	rm -f lexicon.lexd xanz.lexd *.hfst *.att *.hfstol *~
