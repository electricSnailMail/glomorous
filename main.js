let readout = document.getElementById('gloms'),
    glomButton = document.getElementById('glom-button'),
    statusCircle = document.getElementById('status-circle'),
    glombinations = document.getElementById('glombinations'),
    glomList = document.getElementById('glom-list'),
    keyStack = [],
    glomNumber = 18;

function randint(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

let nomster = {
  element: document.getElementById('upload')
}

nomster.process = function(wire) {
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

nomster.handleFile = function() {
  glomster.clearAll()
  let reader = new FileReader();
  reader.readAsText(this.files[0]);
  reader.onload = function() {
    nomster.process(reader.result);
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
  suffChange: true,
  commaNumber: new Intl.NumberFormat('en-US')
}

glomster.readNoms = function() {
  if (this.prefChange) {
    this.prefs = this.cleanUp(prefarea.value.split('\n'));
    this.localStore('prefs');
    this.prefChange = false;
  }
  if (this.rootChange) {
    this.roots = this.cleanUp(rootarea.value.split('\n'));
    this.localStore('roots');
    this.rootChange = false;
  }
  if (this.suffChange) {
    this.suffs = this.cleanUp(suffarea.value.split('\n'));
    this.localStore('suffs');
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

glomster.glom = function() {
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
  if(!glomButton.active) { return }

  this.glomFusillade(glomNumber);
}

glomster.glomFusillade = function(n, top = n) {
  glomster.glomSpan(top - n);

  if(n > 1) {
    setTimeout(glomster.glomFusillade, 12, n - 1, top);
 }
}

glomster.glomSpan = function(n) {
  let glom = this.glom();
      start = document.createElement('span'),
      end = document.createElement('span'),
      startType = (glomster.prefs.includes(glom[0])) ? 'glom-pref' : 'glom-root',
      endType = (glomster.suffs.includes(glom[1])) ? 'glom-suff' : 'glom-root';

  start.classList.add('glom-start', startType);
  end.classList.add('glom-end', endType);

  start.textContent = glom[0];
  end.textContent = glom[1];

  let glomli = glomList.children[n];
  glomli.innerHTML = '';
  glomli.appendChild(start);
  glomli.appendChild(end);

  start.addEventListener('animationend', () => {
    glomli.children[0].classList.remove('glom-root', 'glom-pref');
  });
  end.addEventListener('animationend', () => {
    glomli.children[1].classList.remove('glom-root', 'glom-suff');
  });
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
   document.getElementById('beta').classList.replace('invisible', 'visible');
   document.getElementById('page-bar').classList.replace('invisible', 'visible');
   document.getElementById('torso').classList.replace('invisible', 'visible');
});

document.getElementById('copy-nom-button').addEventListener('click', () => {
  navigator.clipboard.writeText(
    localStorage.prefs + localStorage.roots + localStorage.suffs
  );
});

(function() {
  for(const nomType of ['prefs', 'roots', 'suffs']) {
    if(localStorage.hasOwnProperty(nomType)) {
      if(localStorage[nomType]) {
        glomster.clearNoms(nomType);
        nomster.process(localStorage.getItem(nomType));
      }
    } else {
      localStorage.setItem(nomType, '');
    }
  }

  glomster.readNoms();

  for(let i = 0; i < glomNumber; i++) {
    glomList.append(document.createElement('li'));
    glomList.children[i].classList.add('glomli');
  }
}());
