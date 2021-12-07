#!/usr/bin/env python3

import yaml
import json

class Word:
    def __init__(self):
        self.headword = ''
        self.headtrans = ''
        self.root = []
        self.notes = []
        self.conjugations = {}
    def to_json(self):
        if self.root:
            return {
                'root': self.root,
                'gloss': self.headtrans,
                'note': self.notes,
                'conj': self.conjugations
            }
        else:
            return {
                'stem': self.headword,
                'gloss': self.headtrans,
                'note': self.notes,
                'conj': self.conjugations
            }
def conj_from_yaml(blob):
    dct = {'gloss': [], 'note': []}
    for b in blob:
        if isinstance(b, str):
            dct['gloss'].append(b)
        else:
            for k in b:
                if k == 'note':
                    dct['note'] += b[k]
                elif k == 'form':
                    dct['form'] = b[k]
                elif k == 'date':
                    continue
                else:
                    dct[k] = conj_from_yaml(b[k])
    return dct
def from_yaml(root, blob):
    ret = Word()
    ret.headword = root
    if blob.get('root', True):
        for c in root:
            if c == 'h':
                ret.root[-1] += c
            else:
                ret.root.append(c)
    for k in blob:
        if k in ['date', 'root']:
            continue
        elif k == 'head':
            ret.headtrans = blob[k]
        elif k == 'note':
            ret.notes = blob[k]
        else:
            ret.conjugations[k] = conj_from_yaml(blob[k])
    return ret

with open('lexicon.yaml') as fin:
    blob = yaml.safe_load(fin)
    js = {'root': [], 'non_root': []}
    for k in sorted(blob.keys()):
        w = from_yaml(k, blob[k])
        if w.root:
            js['root'].append(w.to_json())
        else:
            js['non_root'].append(w.to_json())
    with open('lexicon.js', 'w') as fout:
        s = json.dumps(js, sort_keys=True)
        fout.write(f'var lexicon = {s};\n')
