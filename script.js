const requiredclicks = 6;
let clicks = 0;
const fake = document.getElementById('fake');
const container = document.getElementById('container');
const landing = document.getElementById('landing');

const room = document.getElementById('room')
function rand(min, max) { return Math.round(Math.random() * (max - min) + min); }
function movingbutton() {
    const cRect = container.getBoundingClientRect();
    const bRect = fake.getBoundingClientRect();
    const pad = 12;
    const maxx = cRect.width - bRect.width - pad;
    const maxy = cRect.height - bRect.height - pad;
    const x = rand(pad, Math.max(pad, maxx));
    const y = rand(pad, Math.max(pad, maxy));
    fake.style.left = x + 'px'; fake.style.top = y + 'px'; fake.style.transform = 'translate(0,0) scale(1) rotate(' + rand(-10, 10) + 'deg)';
    setTimeout(() => { fake.style.transform = 'translate(0,0) scale(1) rotate(0deg)'; }, 260);
}
fake.addEventListener('click', (e) => {
    e.stopPropagation(); clicks++;
    if (clicks < requiredclicks) { movingbutton(); fake.textContent = ['Enter the room'][clicks] || 'Enter the room'; }
    else {
        fake.disabled = true;
        fake.style.left = '50%';
        fake.style.top = '50%';
        fake.style.transform = 'translate(-50%,-50%) scale(1)';
        fake.textContent = 'OK UNDERSTOOD'; setTimeout(() => {
            landing.classList.add('hidden');
            room.classList.remove('hidden');
            initRoom();
        }, 600);
    }
});
window.addEventListener('resize', () => {
    const cRect = container.getBoundingClientRect(); const bRect = fake.getBoundingClientRect();
    if (bRect.right > cRect.right || bRect.bottom > cRect.bottom) {
        fake.style.left = '50%'; fake.style.top = '50%'; fake.style.transform = 'translate(-50%,-50%)';
    }
});


