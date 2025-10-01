all: xanz.hfstol xanz_gen.hfstol xanz_c.hfstol xanz_c_gen.hfstol

xanz_gen.hfstol: xanz.hfst
	hfst-fst2fst -O $< > $@

xanz.hfstol: xanz.hfst
	hfst-invert $< | hfst-fst2fst -O > $@

xanz_c_gen.hfstol: xanz_c.hfst
	hfst-fst2fst -O $< > $@

xanz_c.hfstol: xanz_c.hfst
	hfst-invert $< | hfst-fst2fst -O > $@

xanz.hfst: morph-phon.hfst reduce.hfst spell.hfst
	hfst-compose-intersect -1 morph-phon.hfst -2 reduce.hfst | hfst-compose -1 - -2 spell.hfst > $@

xanz_c.hfst: morph-phon.hfst dummy_vowel.hfst cuneiform.hfst
	hfst-compose -1 morph-phon.hfst -2 dummy_vowel.hfst | hfst-compose -1 - -2 cuneiform.hfst > $@

morph-phon.hfst: morph.hfst phon.hfst
	hfst-invert morph.hfst | hfst-compose-intersect -1 - -2 phon.hfst > $@

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

reduce.hfst: reduce.twol
	hfst-twolc $< > $@

spell.hfst: xanz.xfst
	hfst-regexp2fst -S $^ > $@

cuneiform.att: cuneiform.lexd
	lexd $^ > $@

cuneiform.hfst: cuneiform.att
	hfst-txt2fst $< > $@

dummy_vowel.hfst: dummy_vowel.xfst
	hfst-regexp2fst -S $^ > $@
