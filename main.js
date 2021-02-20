const uploadElement = document.getElementById('upload');
let noms = [[],[],[]];

let processWire = function(wire) {
  let wordlist = wire.split('\n')

  console.log(wordlist)

  for(let word of wordlist) {
    word = word.trim()
    if (!word) { continue }

    if (word.endsWith('-')) {
      noms[0].push(word.slice(0, -1))
    } else if (word.startsWith('-')) {
      noms[2].push(word.slice(1))
    } else {
      noms[1].push(word)
    }
  }
  console.log(noms)
}

let handleFile = function() {
  let reader = new FileReader();
  reader.readAsText(this.files[0]);
  reader.onload = function() {
    processWire(reader.result)
  }
}

uploadElement.addEventListener("change", handleFile);
