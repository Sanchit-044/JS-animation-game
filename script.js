const requiredclicks = 1;
let clicks = 0;

const fake = document.getElementById('fake');
const container = document.getElementById('container');
const landing = document.getElementById('landing');
const room = document.getElementById('room');

function rand(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function movingbutton() {
  const cRect = container.getBoundingClientRect();
  const bRect = fake.getBoundingClientRect();
  const pad = 12;
  const maxx = cRect.width - bRect.width - pad;
  const maxy = cRect.height - bRect.height - pad;
  const x = rand(pad, Math.max(pad, maxx));
  const y = rand(pad, Math.max(pad, maxy));

  fake.style.left = x + 'px';
  fake.style.top = y + 'px';
  fake.style.transform =
    'translate(0,0) scale(1) rotate(' + rand(-10, 10) + 'deg)';

  setTimeout(() => {
    fake.style.transform = 'translate(0,0) scale(1) rotate(0deg)';
  }, 260);
}

fake.addEventListener('click', (e) => {
  e.stopPropagation();
  clicks++;

  if (clicks < requiredclicks) {
    movingbutton();
    fake.textContent = ['Enter the room'][clicks] || 'Enter the room';
  } 
  
  else {
    fake.disabled = true;
    fake.style.left = '50%';
    fake.style.top = '50%';
    fake.style.transform = 'translate(-50%,-50%) scale(1)';
    fake.textContent = 'OK UNDERSTOOD';

    setTimeout(() => {
      landing.classList.add('hidden');
      room.classList.remove('hidden');
      initRoom();
    }, 600);
  }
}
);

window.addEventListener('resize', () => {
  const cRect = container.getBoundingClientRect();
  const bRect = fake.getBoundingClientRect();

  if (bRect.right > cRect.right || bRect.bottom > cRect.bottom) {
    fake.style.left = '50%';
    fake.style.top = '50%';
    fake.style.transform = 'translate(-50%,-50%)';
  }
}
);

//spotlight


let spotcursor = { mouse: null, touch: null, resize: null };

function initRoom() {
  const scene = document.getElementById('scene');
  const veil = document.getElementById('veil');
  const success = document.getElementById('success');

  if (!scene || !veil) return console.warn('scene or veil missing');

  if (spotcursor.mouse) scene.removeEventListener('mousemove', spotcursor.mouse);
  if (spotcursor.touch) scene.removeEventListener('touchmove', spotcursor.touch);
  if (spotcursor.resize) window.removeEventListener('resize', spotcursor.resize);

  function scenecoordination(personx, persony) {
    const box = scene.getBoundingClientRect();
    return { x: personx - box.left, y: persony - box.top };
  }

  function updatespotlight(personx, persony) {
    const box = scene.getBoundingClientRect();
    const changedx = Math.max(0, Math.min(box.width, personx));
    const changedy = Math.max(0, Math.min(box.height, persony));
    veil.style.setProperty('--mx', `${Math.round(changedx)}px`);
    veil.style.setProperty('--my', `${Math.round(changedy)}px`);
  }

  spotcursor.mouse = function (event) {
    const p = scenecoordination(event.clientX, event.clientY);
    updatespotlight(p.x, p.y);
  };

  spotcursor.touch = function (event) {
    if (!event.touches || event.touches.length === 0) return;
    const finger = event.touches[0];
    const p = scenecoordination(finger.clientX, finger.clientY);
    updatespotlight(p.x, p.y);
  };

  const box = scene.getBoundingClientRect();
  const cx = Math.floor(box.width / 2);
  const cy = Math.floor(box.height / 2);
  updatespotlight(cx, cy);

  scene.addEventListener('mousemove', spotcursor.mouse);
  scene.addEventListener('touchmove', spotcursor.touch, { passive: true });

  spotcursor.resize = function () {
    const r = scene.getBoundingClientRect();
    updatespotlight(Math.floor(r.width / 2), Math.floor(r.height / 2));
  };
  
  
  window.addEventListener('resize', spotcursor.resize, { passive: true });

  if (success) {
    success.classList.remove('show');
    success.textContent = 'Use the spotlight to reveal items';
  }

  scene.innerHTML = '';
  scene.appendChild(veil);

  const items = ['❤‍🔥','🤡','✈','👾','😻','💡','🧽','🔔','🎊','📀','🚀','🚖'];
  const numObjects = 15;

  for (let i = 0; i < numObjects; i++) {
    const obj = document.createElement('div');
    obj.className = 'obj';
    obj.textContent = items[Math.floor(Math.random() * items.length)];
    obj.style.left = rand(10, 1350) + 'px';
    obj.style.top = rand(20, 250) + 'px';
    scene.appendChild(obj);
  }

  const key = document.createElement('div');
  key.className = 'key';
  key.textContent = '🔑';
  key.style.left = rand(20, 1350) + 'px';
  key.style.top = rand(20, 200) + 'px';
  scene.appendChild(key);

  key.addEventListener('click', () => {
    key.classList.add('clicked');
    success.textContent = 'You found the key!';
    success.classList.add('show');
  });
}
