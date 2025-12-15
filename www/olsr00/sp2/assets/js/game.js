function swapView(oldId, newId) {
    const oldV = document.getElementById(oldId);
    const newV = document.getElementById(newId);
    if (!oldV || !newV) return;
    oldV.classList.add('hidden-view');
    oldV.classList.remove('active-view');
    newV.classList.remove('hidden-view');
    newV.classList.add('active-view');
}

document.addEventListener('DOMContentLoaded', function () {
    const startBtn = document.getElementById('start-game-btn');
    const mainBtn = document.getElementById('main-menu-btn');
    if (startBtn) startBtn.addEventListener('click', () => swapView('start-window', 'game-window'));
    if (mainBtn) mainBtn.addEventListener('click', () => swapView('game-window', 'start-window'));
});