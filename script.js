
const requiredclicks = 5;
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

      // start at level 1 and start timer
      currentlvl = 1;
      spotlightlevel(currentlvl);
      starttime = Date.now();
      initRoom();
    }, 600);
  }
});

window.addEventListener('resize', () => {
  const cRect = container.getBoundingClientRect();
  const bRect = fake.getBoundingClientRect();

  if (bRect.right > cRect.right || bRect.bottom > cRect.bottom) {
    fake.style.left = '50%';
    fake.style.top = '50%';
    fake.style.transform = 'translate(-50%,-50%)';
  }
});

let currentlvl = 1;
const maxlvl = 5;
const basespotlight = 85;
const spotlightshrinking = 12;
const baseobjects = 15;
const objectplu = 2;

// timer
let starttime = null;

function spotlightlevel(level) {
  const veil = document.getElementById('veil');
  if (!veil) return;
  const newradius = Math.max(12, basespotlight - (level - 1) * spotlightshrinking);
  veil.style.setProperty('--spotlight', `${newradius}px`);
}

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
    return { x: personx - box.left, y: persony - box.top, w: box.width, h: box.height };
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
    success.textContent = `Level ${currentlvl}: Use the spotlight to reveal items`;
  }

  // === FIX: remove only .obj and .key (do NOT move veil) ===
  const oldItems = Array.from(scene.querySelectorAll('.obj, .key'));
  oldItems.forEach(el => el.remove());

  // create objects; number increases each level
  const items = ['❤‍🔥','🤡','✈','👾','😻','💡','🧽','🔔','🎊','📀','🚀','🚖'];
  const totalobjects = baseobjects + (currentlvl - 1) * objectplu;

  // safe placement helper (relative to scene)
  function reqelement(elem, pad = 20) {
    const sRect = scene.getBoundingClientRect();
    if (sRect.width === 0 || sRect.height === 0) {
      requestAnimationFrame(() => reqelement(elem, pad));
      return;
    }
    const x = rand(pad, Math.max(pad, Math.floor(sRect.width - pad)));
    const y = rand(pad, Math.max(pad, Math.floor(sRect.height - pad)));
    elem.style.left = x + 'px';
    elem.style.top = y + 'px';
    elem.dataset.cx = x;
    elem.dataset.cy = y;
  }

  for (let i = 0; i < totalobjects; i++) {
    const obj = document.createElement('div');
    obj.className = 'obj';
    obj.textContent = items[Math.floor(Math.random() * items.length)];
    scene.appendChild(obj);
    requestAnimationFrame(() => reqelement(obj, 24));
  }

  // create the key
  const key = document.createElement('div');
  key.className = 'key';
  key.textContent = '🔑';
  scene.appendChild(key);
  requestAnimationFrame(() => reqelement(key, 36));

  // helper: get spotlight radius from CSS var
  function totalradius() {
    const raw = getComputedStyle(veil).getPropertyValue('--spotlight') || `${basespotlight}px`;
    return parseFloat(raw);
  }

  // check whether a point is inside spotlight (uses veil CSS vars)
  function insidelight(px, py) {
    const sRect = scene.getBoundingClientRect();
    const mx = parseFloat(getComputedStyle(veil).getPropertyValue('--mx')) || sRect.width / 2;
    const my = parseFloat(getComputedStyle(veil).getPropertyValue('--my')) || sRect.height / 2;
    const dx = px - mx;
    const dy = py - my;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist <= totalradius();
  }

  key.addEventListener('click', () => {
    const kx = parseFloat(key.dataset.cx || 0);
    const ky = parseFloat(key.dataset.cy || 0);
    if (!insidelight(kx, ky)) {
      key.animate(
        [
          { transform: 'translate(-50%,-50%) scale(0.98)' },
          { transform: 'translate(-50%,-50%) scale(1.08)' },
          { transform: 'translate(-50%,-50%) scale(0.98)' },
        ],
        { duration: 200, easing: 'ease-out' }
      );
      return;
    }

    key.classList.add('clicked');
    if (success) {
      success.textContent = 'You found the key!';
      success.classList.add('show');
    }

    scene.removeEventListener('mousemove', spotcursor.mouse);
    scene.removeEventListener('touchmove', spotcursor.touch);

    const nextlvl = currentlvl + 1;
    const feedbackele = document.getElementById('feedback');
    if (feedbackele) feedbackele.textContent = `Reached level ${nextlvl}`;

    setTimeout(() => {
      currentlvl++;
      if (currentlvl <= maxlvl) {
        spotlightlevel(currentlvl);
        if (feedbackele) feedbackele.textContent = `Level ${currentlvl} — good luck!`;
        setTimeout(() => initRoom(), 300);
      } else {
        // all levels complete -> show total time (if started)
        let totalTimeText = '';
        if (starttime) {
          const totalTime = ((Date.now() - starttime) / 1000).toFixed(1);
          totalTimeText = ` Time: ${totalTime}s`;
        }
        if (success) {
          success.textContent = `All levels complete - Lets GOOOO!!${totalTimeText}`;
          success.classList.add('show');
        }
        if (feedbackele) feedbackele.textContent = `You completed ${maxlvl} levels.${totalTimeText}`;

        const controls = document.querySelector('.controls');
        if (controls && !document.getElementById('restartlvls')) {
          const restartbutton = document.createElement('button');
          restartbutton.id = 'restartlvls';
          restartbutton.className = 'submit';
          restartbutton.textContent = 'Play again';
          restartbutton.addEventListener('click', () => location.reload());
          controls.appendChild(restartbutton);
        }
      }
    }, 700);
  }, 
  { once: true, passive: true });

  spotcursor.resize = function () {
    const children = Array.from(scene.querySelectorAll('.obj, .key'));
    children.forEach(child => {
      if (child.classList && (child.classList.contains('obj') || child.classList.contains('key'))) {
        reqelement(child, child.classList && child.classList.contains('key') ? 36 : 24);
      }
    });
    const r2 = scene.getBoundingClientRect();
    updatespotlight(Math.floor(r2.width / 2), Math.floor(r2.height / 2));
  };
  window.removeEventListener('resize', spotcursor.resize);
  window.addEventListener('resize', spotcursor.resize, { passive: true });
}
