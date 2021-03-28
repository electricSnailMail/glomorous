let readout = document.getElementById('gloms'),
    glomButton = document.getElementById('glom-button'),
    statusCircle = document.getElementById('status-circle'),
    glombinations = document.getElementById('glombinations'),
    glomDisplay = document.getElementById('glom-display'),
    glomList = document.getElementById('glom-list'),
    favesPane = document.getElementById('faves-pane'),
    keyStack = [];

function randint(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

let nomster = {
  element: document.getElementById('upload'),
  prefChange: true,
  rootChange: true,
  suffChange: true
}

nomster.process = function(wire) {
  let wordlist = wire.split('\n');

  for(let word of wordlist) {
    word = word.trim()
    if (!word) { continue }

    if (word.endsWith('-')) {
      prefarea.value += word.slice(0, -1) + '\n';
      this.prefChange = true;
    } else if (word.startsWith('-')) {
      suffarea.value += word.slice(1) + '\n';
      this.suffChange = true;
    } else {
      rootarea.value += word + '\n';
      this.rootChange = true;
    }
  }
}

nomster.handleFile = function() {
  glomster.clearAll();
  let reader = new FileReader();
  reader.readAsText(this.files[0]);
  reader.onload = function() {
    nomster.process(reader.result);
    nomster.prefChange = nomster.rootChange = nomster.suffChange = true;
    glomster.readNoms();
    glomster.localStoreAll();
  }
}

let glomster = {
  prefs: [],
  roots: [],
  suffs:[],
  headsize: 0,
  tailsize: 0,
  commaNumber: new Intl.NumberFormat('en-US'),
  active: false,
  glomli: []
}

glomster.readNoms = function() {
  if (nomster.prefChange) {
    this.prefs = this.cleanUp(prefarea.value.split('\n'));
    this.localStore('prefs');
    nomster.prefChange = false;
  }
  if (nomster.rootChange) {
    this.roots = this.cleanUp(rootarea.value.split('\n'));
    this.localStore('roots');
    nomster.rootChange = false;
  }
  if (nomster.suffChange) {
    this.suffs = this.cleanUp(suffarea.value.split('\n'));
    this.localStore('suffs');
    nomster.suffChange = false;
  }

  glomster.checkActive();
  glomster.count();
  glombinations.innerText = this.glombinations();
}

glomster.cleanUp = function(list) {
  let clean = [];

  for (let word of list) {
    word = word.trim();

    if (word) {
      clean.push(word)
    }
  }

  return clean
}

glomster.checkActive = function() {
  let ready = this.roots.length > 1 ||
      (this.roots.length > 0 && this.suffs.length > 0);

  if (ready) {
    glomster.active = true;
    glomButton.classList.replace('inactive', 'active');
  } else {
    glomster.active = false;
    glomButton.classList.replace('active', 'inactive');
  }
}

glomster.count = function() {
  this.headsize = this.prefs.length + this.roots.length;
  this.tailsize = this.suffs.length + this.roots.length;
}

glomster.changeSwitch = function(e) {
  switch (e.srcElement) {
    case prefarea:
      if(!nomster.prefChange) {nomster.prefChange = true;}
      break
    case rootarea:
      if(!nomster.rootChange) {nomster.rootChange = true;}
      break
    case suffarea:
      if(!nomster.suffChange) {nomster.suffChange = true;}
      break
  }
}

glomster.updateNoms = function() {
  if (keyStack.length <= 1) {
    glomster.readNoms();
    statusCircle.classList.replace('waiting', 'complete');
    keyStack = [];
    console.log("Read the noms!")
  } else {
    keyStack = [keyStack[keyStack.length - 1]]
    window.setTimeout(glomster.updateNoms, 1500);
  }
}

glomster.keyEvent = function(e) {
  if(!keyStack.length) {
    window.setTimeout(glomster.updateNoms, 1500);
    statusCircle.classList.replace('complete', 'waiting');
  }
  glomster.changeSwitch(e);
  keyStack.push(e);
}

glomster.glomorize = function() {
  let prando = randint(0, this.headsize),
      rlen = this.roots.length,
      prefHead = (prando >= rlen) ? true : false,
      srando = 0,
      head = (prando < rlen) ? this.roots[prando] : this.prefs[prando - rlen],
      tail = head;

  while(head === tail) {
    srando = (!prefHead) ? randint(0, this.tailsize) : randint(0, rlen);
    tail = (srando < rlen) ? this.roots[srando] : this.suffs[srando - rlen];
  }

  return [head, tail]
}

glomster.displayGloms = function() {
  if(!glomster.active) { return }

  if(glomCount() >= this.glomli.length) {
    this.glomFusillade(glomCount());
  } else {
    this.glomFusillade(this.glomli.length);
  }
}

glomster.glomFusillade = function(n, top = n) {
  if(glomster.adjustGlomList(top - n)) {
    glomster.glomli[top - n].newGlom(glomster.glomorize());
  }

  if(n > 1) {
    setTimeout(glomster.glomFusillade, 12, n - 1, top);
 }
}

glomster.adjustGlomList = function(n) {
  if (n >= this.glomli.length) {
    this.glomli.push(new Glomli(n));
  } else if (n >= glomCount()) {
    this.glomli[n].element.remove();
    this.glomli[n].attached = false;
    return false
  }
  return true
}

glomster.glombinations = function() {
  let prefs = this.prefs.length,
      roots = this.roots.length;

  return this.commaNumber.format(roots * (this.tailsize - 1) + (prefs * roots))
}

glomster.localStore = function(nomType) {
   let nomString = '';

  if(nomType === 'prefs') {
    for(const pref of this.prefs) {
      nomString += pref + '-\n';
    }
  } else if (nomType === 'roots') {
    for(const root of this.roots) {
      nomString += root + '\n';
    }
  } else if (nomType === 'suffs') {
    for(const suff of this.suffs) {
      nomString += '-' + suff + '\n';
    }
  } else { return }
  window.localStorage.setItem(nomType, nomString);
}

glomster.localStoreAll = function() {
  glomster.localStore('prefs');
  glomster.localStore('roots');
  glomster.localStore('suffs');
}

glomster.clearNoms = function(nomType) {
  if(nomType === 'prefs') { prefarea.value = ''; }
  if(nomType === 'roots') {rootarea.value = ''; }
  if(nomType === 'suffs') { suffarea.value = ''; }
}

glomster.clearAll = function() {
  prefarea.value = '';
  rootarea.value = '';
  suffarea.value = '';
}

class Glomli {
  constructor(i) {
    this.index = i;
    this.start = '';
    this.end = '';
    this.glom = '';
    this.element = this.makeElement();
    this.startspan = this.element.children[0];
    this.endspan = this.element.children[1];
    this.glomspan = this.element.children[2];
    this.heart = this.element.children[3].children[0];
    this.attached = true;
  }

  makeElement() {
    let li = document.createElement('li');
    li.classList.add('glomli');

    for(let i = 0; i < 3; i++) {
      li.append(document.createElement('span'));
    }

    li.children[2].classList.add('glom-span');

    li.append(this.makeHeart());

    glomList.append(li);

    return li;
  }

  makeHeart() {
    let heartbox = document.createElement('span'),
        faveheart = document.createElement('i');

    heartbox.classList.add('relative', 'heart-box');

    faveheart.classList.add(
      'far', 'fa-heart', 'heart', 'fave-heart', 'absolute', 'transparent');
    faveheart.fave = false;

    heartbox.append(faveheart);

    faveheart.addEventListener('click', () => {
      faveheart.fave = !faveheart.fave;

      if(faveheart.fave) {
        this.heartToFave(faveheart);
        faveheart.classList.replace('far', 'fas');
      } else {
        this.revokeFave(faveheart);
        faveheart.classList.replace('fas', 'far');
      }

      faveheart.classList.toggle('transparent');
    });

    return heartbox
  }

  heartToFave(faveheart) {
    faves.addFave(this.glom);
    faves.storeFaves();
  }

  revokeFave(faveheart) {
    faves.removeFave(this.glom);
  }

  newGlom(glom) {
    this.glomspan.textContent = '';

    if(!this.attached) {
        glomList.append(this.element);
    }


    this.spanify(glom[0], 'start');
    this.spanify(glom[1], 'end');

    this.glom = this.start + this.end;
    this.heart.fave = false;
    this.heart.classList.replace('fas', 'far');
    this.heart.classList.add('transparent');

    this.startspan.addEventListener('animationend', () => {
      this.startspan.classList.remove('glom-root', 'glom-pref');
      this.endspan.classList.remove('glom-root', 'glom-suff');
    });

    this.startspan.addEventListener('transitionend', () => {
      this.spanSwitcheroo();
    });
  }

  spanify(nom, place) {
    let span = document.createElement('span'),
        affix = (place == 'start') ? 'pref' : 'suff',
        type = (glomster[affix + 's'].includes(nom))
                ? 'glom-' + affix : 'glom-root';

    span.classList.add('glom-' + place, type);
    span.textContent = nom;

    this[place] = nom;
    this[place + 'span'].replaceWith(span);
    this[place + 'span'] = span;
  }

  spanSwitcheroo() {
    this.startspan.textContent = '';
    this.endspan.textContent = '';
    this.glomspan.textContent = this.glom;
  }
}

let faves = {
  ul: document.getElementById('faves-list'),
  list: []
}

faves.addFave = function(favorite) {
  let favli = document.createElement('li'),
      favspan = document.createElement('span');

  favspan.textContent = favorite;
  favspan.classList.add('glom-span');

  favli.setAttribute('id', 'fave-' + favorite);
  favli.classList.add('favli');
  favli.append(favspan);
  favli.append(this.makeBrokenHeart(favorite));

  faves.ul.append(favli);
  faves.list.push(favorite);
}

faves.makeBrokenHeart = function(favorite) {
  let heartbox = document.createElement('span'),
      heartbroken = document.createElement('i');

  heartbox.classList.add('relative', 'heart-box');

  heartbroken.classList.add(
    'fas', 'fa-heart-broken', 'heart', 'broken-heart', 'absolute', 'transparent');

  heartbroken.glomFave = favorite;

  heartbox.append(heartbroken);

  heartbroken.addEventListener('click', () => {
    faves.checkHeartPartner(heartbroken.glomFave);
    faves.removeFave(heartbroken.glomFave);
  })

  return heartbox
}

faves.storeFaves = function() {
  let faveString = '';

  for (const fave of this.list) {
    faveString += fave + '\n';
  }

  localStorage.faves = faveString;
}

faves.loadStoredFaves = function() {
  let faveArray = localStorage['faves'].split('\n');

  for(const fave of faveArray) {
    if(fave) {
      this.addFave(fave);
    }
  }
}

faves.removeFave = function(entry) {
  let index = this.list.indexOf(entry);
  this.list.splice(index, 1);

  document.getElementById('fave-' + entry).remove();

  this.storeFaves();
}

faves.checkHeartPartner = function(entry) {
  for (const glomli of glomster.glomli) {
    if (glomli.glom === entry) {
      glomli.heart.classList.replace('fas', 'far');
      glomli.heart.classList.add('transparent');
      glomli.heart.fave = false;
      return
    };
  }
}

let glomCount = function(height = glomDisplay.offsetHeight, row = 28) {
  return Math.floor(height / row);
}

let inputInit = function() {
  let nomwindows = [],
      nomareas = document.getElementsByClassName('nom-area');

  for (let i = 0; i < nomareas.length; i++) {
    nomwindows.push(nomareas[i])
    nomwindows[i].autocomplete = false;
    nomwindows[i].autocorrect = false;
    nomwindows[i].spellcheck = false;

    nomwindows[i].addEventListener("input", e => {
      glomster.keyEvent(e);
    });
  }
  return nomwindows;
}

let nomwindows = inputInit(),
    prefarea = nomwindows[0],
    rootarea = nomwindows[1],
    suffarea = nomwindows[2];

glomButton.addEventListener('click', () => {
  glomster.displayGloms();
});

nomster.element.addEventListener("change", nomster.handleFile);

document.getElementById('huh').addEventListener('click', () => {
  alert("About and FAQ to come! Upload button takes a .txt file where each nom is on it's own line. Hyphens identify prefixes and suffixes.")
});

document.getElementById('beware').addEventListener('click', () => {
  alert("There is no saving functionality yet. Noms should persist between sessions, but it's best to maintain a text file.");
});


window.addEventListener('load', () => {
   document.getElementById('beta').classList.replace('transparent', 'opaque');
   document.getElementById('page-bar').classList.replace('transparent', 'opaque');
   document.querySelector('main').classList.replace('transparent', 'opaque');
});

document.getElementById('copy-nom-button').addEventListener('click', () => {
  navigator.clipboard.writeText(
    localStorage.prefs + localStorage.roots + localStorage.suffs
  );
});

let closeInitTip = function() {
  document.getElementById('init-tooltip').classList.replace('show', 'hide');
  setTimeout(() => {
      document.getElementById('classic-noms-tip').classList.replace('hide', 'tooltip');
  }, 1000);
}

document.getElementById('classic-noms-button').addEventListener('click', () => {
  glomster.clearAll();
  nomster.process(preSlices);
  glomster.readNoms();
  closeInitTip();
});

document.getElementById('init-tooltip-x').addEventListener('click', () => {
  closeInitTip();
});

document.getElementById('faves-tab').addEventListener('click', () => {
  if(favesPane.classList.contains('collapsed')) {
    favesPane.classList.replace('collapsed', 'expanded');
  } else {
    favesPane.classList.replace('expanded', 'collapsed');
  }
});

(function() {
  const nomTypes = ['prefs', 'roots', 'suffs'];

  for(const nomType of nomTypes) {
    if(localStorage.hasOwnProperty(nomType)) {
      if(localStorage[nomType]) {
        glomster.clearNoms(nomType);
        nomster.process(localStorage.getItem(nomType));
      }
    } else {
      localStorage.setItem(nomType, '');
    }
  }

  if(localStorage.hasOwnProperty('faves')) {
    faves.loadStoredFaves();
  } else {
    localStorage.setItem('faves', '');
  }

  glomster.readNoms();
  if(!glomster.active) {
    document.getElementById('init-tooltip').classList.replace('hide', 'show');
    document.getElementById('classic-noms-tip').classList.replace('tooltip', 'hide');
  }
}());
