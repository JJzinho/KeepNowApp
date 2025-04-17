 // Scripts permanecem iguais
 const navbarToggle = document.getElementById('navbar-toggle');
 const navbarDropdown = document.getElementById('navbar-dropdown');
 
 navbarToggle.addEventListener('click', (e) => {
     e.stopPropagation();
     navbarDropdown.classList.toggle('show');
 });

 document.addEventListener('click', () => {
     navbarDropdown.classList.remove('show');
 });

 function confirmDeleteAccount() {
     if (confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível!')) {
         alert('Conta excluída (simulação)');
         window.location.href = '/';
     }
 }