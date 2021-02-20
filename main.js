let upload = {
  element: document.getElementById('upload'),
  processed: []
}

upload.process = function(wire) {
  let wordlist = wire.split('\n')
  
  for(let word of wordlist) {
    word = word.trim()
    if (!word) { continue }
    this.processed.push(word)
  }
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
