all: xanz.hfstol xanz_gen.hfstol

xanz_gen.hfstol: xanz.hfst
	hfst-invert $< | hfst-fst2fst -O > $@

xanz.hfstol: xanz.hfst
	hfst-fst2fst -O $< > $@

xanz.hfst: morph.hfst phon.hfst spell.hfst
	hfst-invert morph.hfst | hfst-compose-intersect -1 - -2 phon.hfst | hfst-compose -1 - -2 spell.hfst | hfst-invert > $@

morph.hfst: morph.att
	hfst-txt2fst $^ > $@

morph.att: xanz.lexd
	lexd $^ > $@

xanz.lexd: morph.lexd lexicon.lexd
	cat $^ > $@

lexicon.lexd: lexicon.yaml yaml2js.py
	python3 yaml2js.py

phon.hfst: xanz.twol
	hfst-twolc $< > $@

spell.hfst: xanz.xfst
	hfst-regexp2fst -S $^ > $@
