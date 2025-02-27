 // JavaScript para abrir/fechar o menu lateral
const menuBtn = document.getElementById('menu-btn');
const menu = document.getElementById('menu');
const overlay = document.getElementById('overlay');

// Abrir/fechar o menu ao clicar no botão ☰
menuBtn.addEventListener('click', () => {
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';  // Alterna entre abrir e fechar
    overlay.style.display = menu.style.display === 'block' ? 'block' : 'none';  // Alterna o overlay
});

// Fechar o menu ao clicar no overlay (área escura fora do menu)
overlay.addEventListener('click', () => {
    menu.style.display = 'none';  // Fecha o menu
    overlay.style.display = 'none';  // Fecha o overlay
});
