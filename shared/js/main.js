class getTemplate{
    settingsLink(){
  let settingsLink = document.createElement('div');
  settingsLink.className = 'subflix-settings-link';
  settingsLink.innerHTML = 'Subflix settings';
  settingsLink.addEventListener('click', events.openSettings);
        return settingsLink;
    }
}
class events{
    openSettings(){
        alert('open settings');
    }
}
class createElement{
    settingsLink(){
        document.querySelector('.PlayerControls--bottom-controls').appendChild(getTemplate.settingsLink());
    }
}