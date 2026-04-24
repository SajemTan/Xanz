const patterns = {
    agentive: ['á', '', 'e'],
    intensive: ['a', 'a', ''],
    passive: ['á', 'e', ''],
    stative: ['a', 'i', ''],
    perfective: ['e', 'á', ''],
    patient: ['e', 'y', ''],
    middle: ['eu', 'eu', ''],
    witnessive: ['eu', 'éú', ''],
    instrument: ['ó', 'a', ''],
    active: ['u', 'í', ''],
    causative: ['y', 'o', '']
};
const verb_pref = {
    S1O1: 'alé',
    S1O2: 'ana',
    S1O3: 'áthi',
    S3IO3: 'le',
    SVC: 'ká',
};
const noun_affix = {
    nom: ['', ''],
    'away-nom': ['e', ''],
    'to-nom': ['á', ''],
    gen: ['', 'i'],
    'away-gen': ['e', 'i'],
    'to-gen': ['á', 'i'],
    loc: ['', 'en'],
    'loc-away': ['e', 'en'],
    'loc-to': ['á', 'en'],
};

var search_data = [];
var lexicon_flat_arr = lexicon.root.concat(lexicon.non_root);
function decodeHtml(html) {
    let txtel = document.createElement("textarea");
    txtel.innerHTML = html;
    return txtel.value;
}
function searchMatch(txt, queryString, isRegex) {
    let str = decodeHtml(txt);
    if (!isRegex) {
        return str.toLowerCase().includes(queryString.toLowerCase());
    } else {
        return str.match(queryString) != null;
    }
}
function doSearch() {
    let searchstr = decodeHtml(document.getElementById("search").value);
    let isRegex = document.getElementById("regex").checked;
    let mode = parseInt(document.getElementById('searchwhat').value);
    let matches = 0;
    search_data.forEach((ls) => {
	let m = searchMatch(ls[mode], searchstr, isRegex);
	ls[0].style.display = m ? "" : "none";
	if (m) matches++;
    });
    document.getElementById("matches").innerHTML = matches + " matches for " + searchstr;
}
function mkel(tag, html) {
    let ret = document.createElement(tag);
    ret.innerHTML = html;
    return ret;
}
function conjugate(prev, mode) {
    let pmode = prev[prev.length-1][0];
    let pform = prev[prev.length-1][1];
    if (patterns.hasOwnProperty(mode)) {
        let v = patterns[mode];
        let c = pform;
        return c[0] + v[0] + c[1] + v[1] + c[2] + v[2];
    } else if (mode == 'participle') {
        return pform + 'el';
    } else if (verb_pref.hasOwnProperty(mode)) {
        return verb_pref[mode] + pform;
    } else if (noun_affix.hasOwnProperty(mode)) {
        let na = noun_affix[mode];
        return na[0] + pform + na[1];
    } else if (mode == 'none') {
        return pform;
    }
    console.log(['TODO', pform, mode]);
    if (typeof pform == "string") {
        return pform + '-' + mode;
    } else {
        console.log(pform);
        return pform.join('_');
    }
}
function phono(ur) {
    const ph = /[mnñt]h|ng|[ie]u|[íé]ú|[pbtdszkg\'mnñfxwlj]|[aeiouyáéíóúý]/g;
    let pls = ur.match(ph);
    const nasal_vow = {
        á: 'a',
        é: 'e',
        í: 'i',
        ó: 'o',
        ú: 'u',
        ý: 'y',
        éú: 'eu',
    };
    const nasal_cons = {
        p: 'mh',
        b: 'm',
        t: 'nh',
        d: 'n',
        s: 'ñh',
        z: 'ñ',
        g: 'ng',
    };
    const vow = /[ie]u|[íé]ú|[aeiouyáéíóúý]/;
    let vidx = [];
    let denas = [];
    for (let i = 0; i < pls.length-1; i++) {
        let v = pls[i];
        if (vow.test(v)) {
            vidx.push(i);
        } else {
            continue;
        }
        let c = pls[i+1];
        if (nasal_vow.hasOwnProperty(v) && nasal_cons.hasOwnProperty(c)) {
            denas.push(i);
            pls[i+1] = nasal_cons[c];
            i++;
        }
    }
    if (vow.test(pls[pls.length-1])) {
        vidx.push(pls.length-1);
    }
    const unstress = /^[eoyéóý]$/;
    let stress = [];
    let del = [];
    for (let i = 0; i < vidx.length; i++) {
        if (i % 2 == 0) {
            stress.push(vidx[i]);
        } else if (unstress.test(pls[vidx[i]])) {
            del.push(vidx[i]);
        }
    }
    if (del.length && del[del.length-1] > stress[stress.length-1]) {
        del.pop();
    }
    const ipa = {
        p: 'p',
        mh: 'm̥',
        b: 'b',
        m: 'm',
	t: 't',
        nh: 'n̥',
        d: 'd',
        n: 'n',
	s: 's',
        ñh: 'ɲ̊',
        z: 'ʤ',
        ñ: 'ɲ',
	k: 'k',
        g: 'g',
        ng: 'ŋ',
	"'": 'ʔ',
        f: 'f',
	th: 'θ',
	x: 'x',
        w: 'w',
	l: 'l',
	j: 'j',
	i: 'i',
	y: 'ɨ',
        u: 'u',
        e: 'ɛ',
	o: 'ɔ',
        a: 'a',
        í: 'ĩ',
        á: 'ã',
        ó: 'ɔ̃',
        é: 'ɛ̃',
        ú: 'ũ',
        ý: 'ɨ̃',
        eu: 'ɛu',
        iu: 'iu',
        éú: 'ɛ̃ũ',
        íú: 'ĩũ',
    };
    const cuneiform = {
        p: ['𒁁', '𒁇', '𒄕', '𒋾', '𒉒'],
        mh: ['𒁁', '𒁇', '𒄕', '𒋾', '𒉒'],
        b: ['𒉼', '𒁇', '𒃲', '𒁴', '𒁷'],
        m: ['𒉿', '𒂟', '𒑗', '𒀽', '𒀽'],
        t: ['𒀺', '𒅎', '𒁑', '𒅆', '𒅆'],
        nh: ['𒀺', '𒅎', '𒁑', '𒅆', '𒅆'],
        d: ['𒆸', '𒅂', '𒁑', '𒄑', '𒅆'],
        n: ['𒍭', '𒁑', '𒁑', '𒀭', '𒅆'],
        s: ['𒁹', '𒀝', '𒀝', '𒇺', '𒇺'],
        ñh: ['𒁹', '𒀝', '𒀝', '𒇺', '𒇺'],
        z: ['𒌓', '𒀸', '𒄨', '𒒃', '𒒃'],
        ñ: ['𒍝', '𒍝', '𒄨', '𒋛', '𒋛'],
        k: ['𒑚', '𒇥', '𒈥', '𒈧', '𒑛'],
        g: ['𒌋', '𒇥', '𒈥', '𒉡', '𒉡'],
        ng: ['𒄰', '𒇥', '𒄥', '𒄬', '𒄬'],
        "'": ['𒋡', '𒄿', '𒆗', '𒈨', '𒈨'],
        '': ['𒋡', '𒄿', '𒆗', '𒈨', '𒈨'],
        f: ['𒆯', '𒆨', '𒆯', '𒉣', '𒉣'],
        th: ['𒁹', '𒆩', '𒆯', '𒊮', '𒊮'],
        x: ['𒁲', '𒂷', '𒆯', '𒁺', '𒁺'],
        w: ['𒉌', '𒉌', '𒆕', '𒉌', '𒆕'],
        l: ['𒁍', '𒆰', '𒈪', '𒁍', '𒁍'],
        j: ['𒉽', '𒄿', '𒆗', '𒄞', '𒃻'],
    };
    const vcol = {
        a: 0, á: 0,
        e: 1, é: 1, eu: 1, éú: 1,
        i: 2, í: 2, y: 2, ý: 2,
        o: 3, ó: 3,
        u: 4, ú: 4,
    };
    let ostr = '';
    let istr = '';
    let cstr = '';
    for (let i = 0; i < pls.length; i++) {
        if (cuneiform.hasOwnProperty(pls[i])) {
            let v = 'o';
            if (i + 1 < pls.length) {
		if (vcol.hasOwnProperty(pls[i+1])) v = pls[i+1];
		else v = 'a';
            }
            cstr += cuneiform[pls[i]][vcol[v]];
        } else if (i == 0) {
            cstr += cuneiform["'"][vcol[pls[i]]];
        }
        let d = del.indexOf(i);
        if (d != -1) continue;
        let n = denas.indexOf(i);
        if (n != -1) {
            ostr += nasal_vow[pls[i]];
        } else {
            ostr += pls[i];
        }
        istr += ipa[pls[i]];
        // TODO: figure out where the syllable boundary is
        // so we can add these properly
        //const primary_stress = 'ˈ';
        //const secondary_stress = 'ˌ';
        //let s = stress.indexOf(i);
    }
    return [ostr, istr, cstr];
}
function dispWord(conj, prev) {
    let ur = prev[prev.length-1][1];
    let f = phono(ur);
    return mkel('span', `${conj}: <b>${f[0]}</b> /${f[1]}/ ${f[2]}`)
}
function makeList(ls) {
    let ret = mkel('ul', '');
    ret.append(...ls.map((s) => mkel('li', s)))
    return ret;
}
function makeBox(conj, blob, prev) {
    let ret = mkel('div', '');
    ret.className = 'conjugation';
    let c = blob.form || conjugate(prev, conj);
    let pth = prev.concat([[conj, c]]);
    ret.appendChild(dispWord(conj, pth));
    ret.appendChild(makeList(blob.gloss));
    if (blob.note.length) {
        ret.appendChild(mkel('b', 'Notes:'));
        ret.appendChild(makeList(blob.note));
    }
    for (let k in blob) {
        if (k == 'gloss' || k == 'note' || k == 'form') {
            continue;
        }
        ret.appendChild(makeBox(k, blob[k], pth));
    }
    return ret;
}
function makeRow(blob) {
    let retel = document.createElement('tr');
    let prev = [];
    if (blob.hasOwnProperty('root')) {
        let stem = blob.root.join('-');
	retel.appendChild(mkel('td', `<b>${stem}</b><br/>${blob.gloss}`));
        retel.setAttribute('data-word', stem + ' ' + blob.root.join(''));
        prev.push(["root", blob.root]);
    } else {
	retel.appendChild(mkel('td', `<b>${blob.stem}</b><br/>${blob.gloss}`));
	retel.setAttribute('data-word', blob.stem);
	prev.push(['stem', blob.stem]);
    }
    retel.setAttribute('data-json', escape(JSON.stringify(blob)));
    let td = document.createElement('td');
    retel.appendChild(td);
    td.append(...Object.entries(blob.conj).map(
	([k, v]) => makeBox(k, v, prev)));
    if (blob.note.length) {
        td.appendChild(mkel('b', 'Notes:'));
        td.appendChild(makeList([blob.note]));
    }
    return retel;
}
function setup() {
    let defs = document.getElementById('defs');
    search_data = [];
    defs.replaceChildren(...lexicon_flat_arr.map((lex_ent) => {
	let row = makeRow(lex_ent);
	search_data.push(
	    [row, row.outerHTML, row.getAttribute('data-word'),
	     Array.from(row.getElementsByClassName('def')
		       ).map((d) => d.innerHMTL).join(' ')]);
	return row;
    }));
}
