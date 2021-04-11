let readout = document.getElementById('gloms'),
    glomButton = document.getElementById('glom-button'),
    statusCircle = document.getElementById('status-circle'),
    glombinations = document.getElementById('glombinations'),
    glomDisplay = document.getElementById('glom-display'),
    glomList = document.getElementById('glom-list'),
    favesPane = document.getElementById('faves-pane'),
    keyStack = [],
    infoScreen = document.getElementById('info-screen'),
    mainShow = document.querySelector('main');

function randint(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function coinToss() {
  return Math.round(Math.random());
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
  lenRoot: 0,
  lenHead: 0,
  lenTail: 0,
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
  this.lenRoot = this.roots.length;
  this.lenHead = this.prefs.length + this.roots.length;
  this.lenTail = this.suffs.length + this.roots.length;
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
  let randos = this.seeds(),
      head, tail, pref = suff = 'root';

  if (randos[0] < this.lenRoot) {
    head = this.roots[randos[0]];
  } else {
    head = this.prefs[randos[0] - this.lenRoot];
    pref = 'pref';
  }

  if (randos[1] < this.lenRoot) {
    tail = this.roots[randos[1]];
  } else {
    tail = this.suffs[randos[1] - this.lenRoot];
    suff = 'suff';
  }

  return [new Nom(head, 'start', pref), new Nom(tail, 'end', suff)]
}

glomster.seeds = function() {
  let prando = srando = 0;

  while(prando === srando) {
    prando = randint(0, this.lenHead);
    srando = randint(0, this.lenTail);
  }

  if (prando >= this.lenRoot && srando >= this.lenRoot) {
    if(coinToss()) {
      srando = randint(0, this.lenRoot);
    } else {
      prando = randint(0, this.lenRoot);
    }
  } else if (prando < this.lenRoot && srando < this.lenRoot) {
    if(coinToss()) {
      prando = randint(this.lenRoot, this.lenHead - this.lenRoot);
    } else {
      srando = randint(this.lenRoot, this.lenTail - this.lenRoot);
    }
  }

  return [prando, srando];
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
    this.glomli.push(new Glomli());
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

  return this.commaNumber.format(roots * (this.lenTail - 1) + (prefs * roots))
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

let Nom = function(nom, position, affix) {
  this.nom = nom;
  this.position = position;
  this.affix = affix;
}

class Glomion {
  constructor() {
    this.start = '';
    this.end = '';
    this.startaffix = '';
    this.endaffix = '';
    this.glom = '';
    this.element = this.makeElement();
    this.glomspan = this.element.getElementsByClassName('glom-span')[0];
    this.startspan = this.glomspan.children[0];
    this.endspan = this.glomspan.children[1];
    this.heartbox = this.element.getElementsByClassName('heart-box')[0];
    this.heart = this.heartbox.children[0];
  }

  makeElement() {
    let li = document.createElement('li');

    li.append(document.createElement('span'));
    li.children[0].append(document.createElement('span'));
    li.children[0].append(document.createElement('span'));
    li.children[0].classList.add('glom-span', 'tip-area');
    li.children[0].addEventListener('click', () => {
      navigator.clipboard.writeText(this.glom);

      this.copyTip();
    });

    li.classList.add('glomion');
    li.append(this.makeHeart());

    return li;
  }

  makeHeart() {
    let heartbox = document.createElement('span'),
        heartShape = document.createElement('i');

    heartbox.classList.add('relative', 'heart-box');
    heartbox.append(heartShape);

    return heartbox;
  }

  copyTip() {
    let tip = document.createElement('span'),
        arrow = document.createElement('span');
    tip.classList.add('tip', 'tip-style', 'tip-left', 'click-tip');
    tip.textContent = 'copied!';

    arrow.classList.add('tip-arrow');
    tip.append(arrow);

    tip.addEventListener('animationend', () => {
      tip.remove();
    });

    this.glomspan.append(tip);

    return tip
  }
}

class Glomli extends Glomion {
  constructor() {
    super();
    this.attached = false;
    this.startlaunch = this.element.children[0];
    this.endlaunch = this.element.children[1];
    this.favorite = null;
  }

  makeElement() {
    let li = super.makeElement();

    li.prepend(document.createElement('span'));
    li.prepend(document.createElement('span'));

    return li
  }

  makeHeart() {
    let heartbox = super.makeHeart(),
        faveheart = heartbox.children[0];

    faveheart.classList.add(
      'far', 'fa-heart', 'heart', 'fave-heart', 'absolute', 'transparent');
    faveheart.fave = false;

    faveheart.addEventListener('click', () => {
    faveheart.fave = !faveheart.fave;

      if(faveheart.fave) {
        this.heartToFave();
        faveheart.classList.replace('far', 'fas');
      } else {
        faves.removeFave(this.favorite);
        faveheart.classList.replace('fas', 'far');
      }

      faveheart.classList.toggle('transparent');
    });

    return heartbox
  }

  newGlom(glom) {
    this.startspan.textContent = '';
    this.endspan.textContent = '';
    this.startspan.classList.remove(this.startaffix + '-fade', 'nom-fade');
    this.endspan.classList.remove(this.endaffix + '-fade', 'nom-fade');

    if(!this.attached) {
        glomList.append(this.element);
        this.attached = true;
    }

    this.spanify(glom[0]);
    this.spanify(glom[1]);

    this.glom = this.start + this.end;
    this.heart.fave = false;
    this.heart.classList.replace('fas', 'far');
    this.heart.classList.add('transparent');

    this.startlaunch.addEventListener('animationend', () => {
      this.startlaunch.classList.remove('glom-' + this.startaffix, 'glom-start');
      this.endlaunch.classList.remove('glom-'+ this.endaffix, 'glom-end');
      this.spanSwitcheroo();
    });
  }

  spanify(nom) {
    let span = this[nom.position + 'launch'];

    span.classList.add('glom-' + nom.position, 'glom-' + nom.affix);
    span.textContent = nom.nom;

    this[nom.position + 'affix'] = nom.affix;
    this[nom.position] = nom.nom;
  }

  spanSwitcheroo() {
    this.startlaunch.textContent = '';
    this.endlaunch.textContent = '';

    this.startspan.classList.add(this.startaffix + '-fade', 'nom-fade');
    this.endspan.classList.add(this.endaffix + '-fade', 'nom-fade');

    this.startspan.textContent = this.start;
    this.endspan.textContent = this.end;
  }

  heartToFave(){
    faves.addFave(this);
    faves.storeFaves();
  }
}

class Favli extends Glomion {
  constructor(favorite) {
    super();

    if (typeof favorite === 'object') {
      this.fromGlomli(favorite);
    } else {
      this.fromStorage(favorite);
    }


    this.startspan.classList.add(this.startaffix + '-fade');
    this.endspan.classList.add(this.endaffix + '-fade');
    this.startspan.textContent = this.start;
    this.endspan.textContent = this.end;
  }

  fromGlomli(glomli) {
    this.start = glomli.start;
    this.end = glomli.end;
    this.startaffix = glomli.startaffix;
    this.endaffix = glomli.endaffix;
    this.glom = glomli.glom;
  }

  fromStorage(storeString) {
    let glomSplit = '';
    this.startaffix = this.endaffix = 'root';

    if (storeString.includes('<')) {
      this.startaffix = 'pref';
      glomSplit = storeString.split('<');
    } else if (storeString.includes('>')) {
      this.endaffix = 'suff';
      glomSplit = storeString.split('>');
    } else {
      glomSplit = storeString.split('–');
    }

    this.start = glomSplit[0];
    this.end = glomSplit[1];
    this.glom = this.start + this.end;
  }

  makeElement() {
    let li = super.makeElement();

    li.classList.add('favli', 'fave-in');

    return li
  }

  makeHeart() {
    let heartbox = super.makeHeart(),
        brokenheart = heartbox.children[0];

    brokenheart.classList.add(
      'fas', 'fa-heart-broken', 'heart', 'broken-heart', 'absolute', 'transparent');

    brokenheart.addEventListener('click', () => {
      faves.checkHeartPartner(this);
      faves.removeFave(this);
    });

    return heartbox
  }

  copyTip() {
    let tip = super.copyTip();

    tip.classList.add('favli-tip');
  }
}

let faves = {
  ul: document.getElementById('faves-list'),
  list: []
}

faves.addFave = function(glomli) {
  let favli = new Favli(glomli);
  faves.ul.append(favli.element);
  faves.list.push(favli);
  glomli.favorite = favli;
}

faves.storeFaves = function() {
  let faveString = '',
      delimiter = '';

  for (const favli of this.list) {
    delimiter = '–';
    if(favli.startaffix === 'pref') {
      delimiter = '<';
    } else if (favli.endaffix === 'suff') {
      delimiter = '>';
    }

    faveString += favli.start + delimiter + favli.end + '\n';
  }

  localStorage.faves = faveString;
}

faves.loadStoredFaves = function() {
  let storeArray = localStorage['faves'].split('\n');
      storeArray.pop();

  for(const stored of storeArray) {
    this.addFave(new Favli(stored));
  }
}

faves.removeFave = function(favli) {
  let index = this.list.indexOf(favli);
  favli.element.classList.replace('fave-in', 'fave-out');

  this.list.splice(index, 1);

  favli.element.addEventListener('animationend', () => {
    favli.element.remove();
  });

  this.storeFaves();
}

faves.checkHeartPartner = function(jilted) {
  for (const glomli of glomster.glomli) {
    if (glomli.glom === jilted.glom) {
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

class InfoButton {
  constructor(id) {
    this['el'] = document.getElementById(id);
    this['open'] = false;
    this['text'] = null;

    this['el'].addEventListener('click', () => {
      console.log(this);
      shoji.infoClick(this);
    });
  }
}

let shoji = {
  open: false,
  buttons: {
    huh: new InfoButton('huh'),
    beware: new InfoButton('beware'),
    tips: new InfoButton('tips'),
  },
  closer: document.getElementById('info-down-arrow')
}

shoji.expand = function() {
    infoScreen.classList.replace('info-collapsed', 'info-expanded');
}

shoji.collapse = function() {
    infoScreen.classList.replace('info-expanded', 'info-collapsed');
}

shoji.switchIn = function(info) {
  if(!info.text) {
    //fetch function
  }

  //div.replaceWith

  for(const button of Object.values(this.buttons)) {
    if(button.open) {
      button.open = false;
      console.log(button + " closed!")
    }

    info.open = true;
  }
}

shoji.infoClick = function(selected) {
  if (!this.open) {
    if (!selected.open) { this.switchIn(selected); }
    this.expand();
    this.open = true;
  } else {
    if (selected.open) {
      this.collapse();
      this.open = false;
    } else {
      this.switchIn(selected);
    }
  }
}

glomButton.addEventListener('click', () => {
  glomster.displayGloms();
});

nomster.element.addEventListener("change", nomster.handleFile);

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
  document.getElementById('init-tip').classList.replace('show', 'hide');
  setTimeout(() => {
      document.getElementById('classic-noms-tip').classList.replace('hide', 'tip-hover');
  }, 1000);
}

document.getElementById('classic-noms-button').addEventListener('click', () => {
  glomster.clearAll();
  nomster.process(preSlices);
  glomster.readNoms();
  closeInitTip();
});

document.getElementById('init-tip-x').addEventListener('click', () => {
  closeInitTip();
});

document.getElementById('faves-tab').addEventListener('click', () => {
  if(favesPane.classList.contains('width-collapsed')) {
    favesPane.classList.replace('width-collapsed', 'width-expanded');
  } else {
    favesPane.classList.replace('width-expanded', 'width-collapsed');
  }
});

let testdiv = document.createElement('div');
let fetchHTML = function(doc, appendee) {
  fetch(doc)
    .then((response) => response.text())
    .then((text) => {
      let parser = new DOMParser();
      let docNodes = parser.parseFromString(text, 'text/html').body.childNodes;
      for(const node of docNodes) {
        if (node.nodeType !== 3) { appendee.append(node); }
      }
    }
  );
}

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
    document.getElementById('init-tip').classList.replace('hide', 'show');
    document.getElementById('classic-noms-tip').classList.replace('tip-hover', 'hide');
  }
}());
