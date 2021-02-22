let readout = document.getElementById('mainleft'),
    noms = document.getElementById('nom-inputs'),
    timeoutID;

noms.keyStack = [];

function randint(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

let upload = {
  element: document.getElementById('upload'),
}

upload.process = function(wire) {
  let wordlist = wire.split('\n')

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
  let reader = new FileReader();
  reader.readAsText(this.files[0]);
  reader.onload = function() {
    upload.process(reader.result);
    glomster.readNoms();
  }
}

upload.element.addEventListener("change", upload.handleFile);

let glomster = {
  prefs: [],
  roots: [],
  suffs:[],
  headsize: 0,
  tailsize: 0
}

glomster.readNoms = function() {
  glomster.prefs = prefarea.value.split('\n');
  glomster.roots = rootarea.value.split('\n');
  glomster.suffs = suffarea.value.split('\n');

  glomster.count();
}

glomster.count = function() {
  this.headsize = this.prefs.length + this.roots.length;
  this.tailsize = this.suffs.length + this.roots.length;
}

glomster.updateNoms = function() {
  if (noms.keyStack.length <= 1) {
    glomster.readNoms()
    noms.keyStack = [];
    console.log("Read the noms!")
  } else {
    noms.keyStack = [noms.keyStack[noms.keyStack.length - 1]]
    timeoutID = window.setTimeout(glomster.updateNoms, 1500);
  }
}

glomster.keyEvent = function(e) {
  if(!noms.keyStack.length) {
    timeoutID = window.setTimeout(glomster.updateNoms, 1500);
  }
  noms.keyStack.push(e);

  console.log(noms.keyStack)
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

  return head + tail
}

glomster.glomList = function(n) {
  let gloms = []

  for(let i = 0; i < n; i++) {
    gloms.push(this.glom())
  }

  return gloms
}

glomster.displayGlomString = function() {
  readout.innerText = this.glomList(45).join('\n')
}

let inputInit = function() {
  let nomwindows = []
  for (let i = 0; i < noms.children.length; i++) {
    nomwindows.push(noms.children[i])
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
