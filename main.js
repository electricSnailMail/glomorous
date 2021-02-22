let readout = document.getElementById('mainleft'),
    noms = document.getElementById('nom-inputs');

let inputInit = function() {
  let nomwindows = []
  for (let i = 0; i < noms.children.length; i++) {
    nomwindows.push(noms.children[i])
    nomwindows[i].autocomplete = false;
    nomwindows[i].autocorrect = false;
    nomwindows[i].spellcheck = false;
  }
  return nomwindows;
}

let nomwindows = inputInit(),
    prefinput = nomwindows[0],
    rootinput = nomwindows[1],
    suffinput = nomwindows[2];


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
      glomster.prefs.push(word.slice(0, -1))
    } else if (word.startsWith('-')) {
      glomster.suffs.push(word.slice(1))
    } else {
      glomster.roots.push(word)
    }
  }

  glomster.count()
}

upload.handleFile = function() {
  let reader = new FileReader();
  reader.readAsText(this.files[0]);
  reader.onload = function() {
    upload.process(reader.result)
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

glomster.count = function() {
  this.headsize = this.prefs.length + this.roots.length;
  this.tailsize = this.suffs.length + this.roots.length;
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
