let readout = document.getElementById('gloms'),
    glomButton = document.getElementById('glom-button'),
    statusCircle = document.getElementById('status-circle'),
    glombinations = document.getElementById('glombinations'),
    glomList = document.getElementById('glom-list'),
    circleTimerID,
    keyStack = [],
    glomNumber = 18;

function randint(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

let upload = {
  element: document.getElementById('upload'),
}

upload.process = function(wire) {
  let wordlist = wire.split('\n');

  for(let word of wordlist) {
    word = word.trim()
    if (!word) { continue }

    if (word.endsWith('-')) {
      prefarea.value += word.slice(0, -1) + '\n'
    } else if (word.startsWith('-')) {
      suffarea.value += word.slice(1) + '\n'
    } else {
      rootarea.value += word + '\n'
    }
  }
}

upload.handleFile = function() {
  glomster.clearAll()
  let reader = new FileReader();
  reader.readAsText(this.files[0]);
  reader.onload = function() {
    upload.process(reader.result);
    glomster.prefChange = glomster.rootChange = glomster.suffChange = true;
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
  prefChange: true,
  rootChange: true,
  suffChange: true
}

glomster.readNoms = function() {
  if (this.prefChange) {
    this.prefs = this.cleanUp(prefarea.value.split('\n'));
    if(this.prefs.length) { this.localStore('prefs'); }
    this.prefChange = false;
  }
  if (this.rootChange) {
    this.roots = this.cleanUp(rootarea.value.split('\n'));
    if(this.roots.length) { this.localStore('roots'); }
    this.rootChange = false;
  }
  if (this.suffChange) {
    this.suffs = this.cleanUp(suffarea.value.split('\n'));
    if(this.suffs.length) { this.localStore('suffs'); }
    this.suffChange = false;
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
    glomButton.active = true;
    glomButton.classList.replace('inactive', 'active');
  } else {
    glomButton.active = false;
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
      if(!this.prefChange) {this.prefChange = true;}
      break
    case rootarea:
      if(!this.rootChange) {this.rootChange = true;}
      break
    case suffarea:
      if(!this.suffChange) {this.suffChange = true;}
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
    circleTimerID = window.setTimeout(glomster.updateNoms, 1500);
  }
}

glomster.keyEvent = function(e) {
  if(!keyStack.length) {
    circleTimerID = window.setTimeout(glomster.updateNoms, 1500);
    statusCircle.classList.replace('complete', 'waiting');
  }
  glomster.changeSwitch(e);
  keyStack.push(e);
}

glomster.glom = function() {
  let prando = randint(0, this.headsize),
      srando = 0,
      rlen = this.roots.length,
      head = (prando < rlen) ? this.roots[prando] : this.prefs[prando - rlen],
      tail = head;

  while(head === tail) {
    srando = randint(0, this.tailsize);
    tail = (srando < rlen) ? this.roots[srando] : this.suffs[srando - rlen];
  }

  return [[head], [tail]]
}

glomster.glomList = function(n) {
  let gloms = []

  for(let i = 0; i < n; i++) {
    gloms.push(this.glom())
  }

  return gloms
}

glomster.displayGlomString = function() {
  if(!glomButton.active) { return }
  let gloms = this.glomList(glomNumber);

  for (let i = 0; i < glomNumber; i++) {
    let start = document.createElement('span'),
        end = document.createElement('span');

    start.classList.add('glom-start');
    end.classList.add('glom-end');

    start.textContent = gloms[i][0];
    end.textContent = gloms[i][1];

    glomList.children[i].innerHTML = start.outerHTML;
    glomList.children[i].appendChild(end);
  }
}

glomster.glombinations = function() {
  let prefs = this.prefs.length,
      roots = this.roots.length;

  return roots * (this.tailsize - 1) + (prefs * roots)
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
  glomster.displayGlomString();
});

upload.element.addEventListener("change", upload.handleFile);

document.getElementById('huh').addEventListener('click', () => {
  alert("About and FAQ to come! Upload button takes a .txt file where each nom is on it's own line. Hyphens identify prefixes and suffixes.")
});

document.getElementById('beware').addEventListener('click', () => {
  alert("There is no saving functionality yet. Noms should persist between sessions, but it's best to maintain a text file.");
});


window.addEventListener('load', () => {
   document.getElementById('beta').classList.replace('invisible', 'visible');
   document.getElementById('page-bar').classList.replace('invisible', 'visible');
   document.getElementById('torso').classList.replace('invisible', 'visible');
});

(function() {
  for(const nomType of ['prefs', 'roots', 'suffs']) {
    if(localStorage.hasOwnProperty(nomType) && localStorage[nomType]) {
      glomster.clearNoms(nomType);
      upload.process(localStorage.getItem(nomType));
    }
  }

  glomster.readNoms();

  for(let i = 0; i < glomNumber; i++) {
    glomList.append(document.createElement('li'));
    glomList.children[i].classList.add('glomli');
  }
}());
