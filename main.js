let upload = {
  element: document.getElementById('upload'),
}

upload.process = function(wire) {
  let wordlist = wire.split('\n')

  for(let word of wordlist) {
    word = word.trim()
    if (!word) { continue }

    if (word.endsWith('-')) {
      glomster.prefixes.push(word.slice(0, -1))
    } else if (word.startsWith('-')) {
      glomster.suffixes.push(word.slice(1))
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
  prefixes: [],
  roots: [],
  suffixes:[],
  headsize: 0,
  tailsize: 0
}

glomster.count = function() {
  this.headsize = this.prefixes.length + this.roots.length
  this.tailsize = this.suffixes.length + this.roots.length
}
