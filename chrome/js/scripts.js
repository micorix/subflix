setupStorage();
const subflix = {
  storage: {
    active: [], // array of selected words indexes
    selected: [], // array of selected words
    currentLine: '',
    activeTranslation: '',
    definitions: {
      pearson: {},
      urban: {},
      google: {}
    },
    currentDefinition: {
      pearson: 0,
      urban: 0,
      google: 0
    }
  }
};
ready('.icon-player-play', el => {
  window.play = el.click();
});
ready('.playback-advisories-container-node', el => {
  el.remove();
});
ready('.player-timedtext', (el) => {
  setupUI();
  let wordsObserver = new MutationObserver(handleMutations);
  wordsObserver.observe(el, {
    attributes: true,
    childList: true,
    subtree: true
  });
});

function setupStorage(){
  if(!localStorage.subflix){
  localStorage.subflix = JSON.stringify({
    version: '0.1.0',
    history: []
  });
  }
}
function setupUI() {
  let settings = document.createElement('div');
  settings.className = 'subflix-settings';
  settings.innerHTML = `
  <div class="subflix-close-wrapper">
  <span class="subflix-close-setting">&times;</span>
  </div>
  <h1>Subflix settings</h1>
  <h2>History<h2>
  <ul class="subflix-history-entries"></ul>
  `;
  settings.querySelector('.subflix-close-setting').addEventListener("click", closeSettings);
  document.body.appendChild(settings);
  let settingsLink = document.createElement('div');
  settingsLink.className = 'subflix-settings-link';
  settingsLink.innerHTML = 'Subflix settings';
  settingsLink.addEventListener('click', openSettings);
  if(document.querySelector('.player-controls-wrapper')){
      document.querySelector('.player-controls-wrapper').appendChild(settingsLink);
  }else if(document.querySelector('.PlayerControls--button-control-row')){
    document.querySelector('.PlayerControls--button-control-row').appendChild(settingsLink);
  }else{
    console.log('Cannot place settings');
  }


  let definition = document.createElement('div');
  definition.className = 'subflix-definition';
  definition.innerHTML = `
  <div class="subflix-close-wrapper">
  <span class="subflix-close-definition">&times;</span>
  </div>
  <div class="subflix-phrase-tabs-wrapper">
  <h1 class="subflix-phrase"></h1>
  <ul class="subflix-tabs">
  <li class="subflix-tab-btn active" data-tab="pearson">Pearson</li>
  <li class="subflix-tab-btn" data-tab="urban">Urban</li>
    <li class="subflix-tab-btn" data-tab="google">Google</li>
  </ul>
  </div>
  <div class="subflix-tab">
  <p class="subflix-translation" data-translation="pearson"></p>
  <p class="subflix-translation"  data-translation="urban"></p>
  <p class="subflix-translation"  data-translation="google">Coming soon!</p>
  </div>
  <div class="subflix-bottom-bar">
  <span class="subflix-micorix">Made with &hearts; by <a href="http://micorix.me">micorix</a></span>
  <div class="subflix-switcher">
  <span class="subflix-prev"><</span>
  <span class="subflix-next">></span>
  </div>
  </div>
  `;
  definition.querySelector('.subflix-close-definition').addEventListener('click', closeDefinition)
definition.querySelector('.subflix-prev').addEventListener('click', prevDefinition)
definition.querySelector('.subflix-next').addEventListener('click', nextDefinition)
  definition.querySelectorAll('.subflix-tab-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      let translation = btn.dataset.tab;
      subflix.storage.activeTranslation = translation;
      console.log(translation);
      definition.querySelectorAll('.subflix-tab-btn').forEach(tabBtn => {
        if (tabBtn.classList.contains('active')) {
          tabBtn.classList.remove('active');
        }
      })
      definition.querySelectorAll('.subflix-translation').forEach(tab => {
        tab.style.display = 'none';
      })
      btn.classList.add('active');
      definition.querySelector(`[data-translation="${translation}"]`).style.display = 'block';
    })
  })

  document.body.appendChild(definition);
  subflix.video = document.querySelector('video');
  subflix.definition = document.querySelector('.subflix-definition');
  subflix.settings = document.querySelector('.subflix-settings');

  console.log("Subflix loaded");
}
function handleMutations(mutations) {
  mutations.forEach(mutation => {
    if (mutation.addedNodes.length == 1 && mutation.addedNodes[0].className == 'player-timedtext-text-container') {
      mutation.addedNodes[0].addEventListener('click', e => {
        if (e.target.className == 'subflix-word') {
          subflix.storage.active.push(parseInt(e.target.dataset.wordIndex));
          subflix.storage.selected.push(e.target.innerText.replace(/[^a-zA-Z0-9]/g, ''));
          let localSubflix = JSON.parse(localStorage.subflix);
          localSubflix.history.push({
            keyword: subflix.storage.selected.join(' '),
            date: Date.now()
          });
          localStorage.subflix = JSON.stringify(localSubflix);
          subflix.video.pause();
          showDefinition();
        }
      })
      subflix.storage.currentLine = mutation.addedNodes[0].innerText;
      createSpans(mutation.addedNodes[0].querySelectorAll('span'));
    }
  })
}
function createSpans(lines) {
  let wordIndex = 0;
  lines.forEach(line => {
    let words = line.innerText.split(' ');
    line.innerHTML = '';
    line.style.display = 'block';
    words.forEach((word) => {
      let span = document.createElement('span');
      span.innerHTML = word;
      span.className = 'subflix-word';
      console.log(subflix.storage.active);
      if (subflix.storage.active.includes(wordIndex)) {
        span.classList.add('active');
      }
      span.dataset.wordIndex = wordIndex;
      line.appendChild(span);
      line.innerHTML += ' ';
      wordIndex++;
    })
  });
}
function closeDefinition() {
  subflix.storage.active = [];
  subflix.storage.selected = [];
  subflix.definition.style.display = 'none';
  subflix.video.play();
}
function showDefinition() {
  let phrase = subflix.storage.selected.join(' ');
  subflix.definition.querySelector('.subflix-phrase').innerText = phrase;
  subflix.definition.style.display = 'block';
  loadDefinitions(phrase);
}
async function loadDefinitions(phrase) {
  subflix.definition.querySelector('[data-translation="urban"]').innerText = await loadUrbanDefinition(phrase);
  subflix.definition.querySelector('[data-translation="pearson"]').innerText = await loadPearsonDefinition(phrase);
}
function loadUrbanDefinition(phrase) {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.onreadystatechange = () => {
      if (request.readyState == 4 && request.status == 200) {
        subflix.storage.definitions.urban = JSON.parse(request.responseText);
        resolve(JSON.parse(request.responseText).list[0].definition);
      }
    };
    request.open("GET", `https://api.urbandictionary.com/v0/define?term=${phrase}`, true);
    request.send();
  });
}
function loadPearsonDefinition(phrase) {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.onreadystatechange = () => {
      if (request.readyState == 4 && request.status == 200) {
        subflix.storage.definitions.pearson = JSON.parse(request.responseText);
        resolve(JSON.parse(request.responseText).results[0].senses[0].definition);
      }
    };
    request.open("GET", `https://api.pearson.com/v2/dictionaries/entries?headword=${phrase}`, true);
    request.send();
  });
}
function nextDefinition(){
  switch (subflix.storage.activeTranslation) {
    case 'pearson':
      nextPearsonDefinition();
    break;
    case 'urban':
      nextUrbanDefinition();
    break;
  }
}
function nextUrbanDefinition() {
  let nextIndex = subflix.storage.currentDefinition.urban/1+1;
if(subflix.storage.definitions.urban.list[nextIndex]){
subflix.definition.querySelector('[data-translation="urban"]').innerText = subflix.storage.definitions.urban.list[nextIndex].definition;
subflix.storage.currentDefinition.urban++;
}
}
function nextPearsonDefinition() {
  let nextIndex = subflix.storage.currentDefinition.pearson/1+1;
if(subflix.storage.definitions.pearson.results[nextIndex]){
subflix.definition.querySelector('[data-translation="pearson"]').innerText = subflix.storage.definitions.pearson.results[nextIndex].senses[0].definition;
subflix.storage.currentDefinition.pearson++;
}
}
function prevDefinition(){
  switch (subflix.storage.activeTranslation) {
    case 'pearson':
      prevPearsonDefinition();
    break;
    case 'urban':
      prevUrbanDefinition();
    break;
  }
}
function prevUrbanDefinition() {
  let prevIndex = subflix.storage.currentDefinition.urban-1;
if(subflix.storage.definitions.urban.list[prevIndex] !== -1){
subflix.definition.querySelector('[data-translation="urban"]').innerText = subflix.storage.definitions.urban.list[prevIndex].definition;
subflix.storage.currentDefinition.urban--;
}
}
function prevPearsonDefinition() {
  let prevIndex = subflix.storage.currentDefinition.pearson-1;
if(subflix.storage.definitions.pearson.results[prevIndex] !== -1){
subflix.definition.querySelector('[data-translation="pearson"]').innerText = subflix.storage.definitions.pearson.results[prevIndex].senses[0].definition;
subflix.storage.currentDefinition.pearson--;
}
}
function openSettings(){
  closeDefinition();
  subflix.video.pause();
  subflix.settings.querySelector('.subflix-history-entries').innerHTML = '';
  JSON.parse(localStorage.subflix).history.forEach(entry => {
    subflix.settings.querySelector('.subflix-history-entries').innerHTML += `
    <li><span class="subflix-settings-keyword">${entry.keyword.charAt(0).toUpperCase()+entry.keyword.slice(1).toLowerCase()}</span>
    <span class="subflix-settings-date">${Date(entry.date).toString()}</span></li>`;
  })
  subflix.settings.style.display = 'block';
}
function closeSettings(){
  subflix.settings.style.display = 'none';
  subflix.video.play();
}
