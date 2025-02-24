document.addEventListener("DOMContentLoaded", function () {
    const buttonList = document.getElementById("button-list");
    const addButton = document.getElementById("add-button");
    const menuBtn = document.getElementById("menu-btn");
    const menu = document.getElementById("menu");
    const overlay = document.getElementById("overlay");
    const logoutBtn = document.getElementById("logout-btn"); // Seleciona o botão "Sair"

    // Função para criar botões de redirecionamento
    function createButton(name, link) {
        const container = document.createElement("div");
        container.classList.add("redirect-btn");

        const btn = document.createElement("button");
        btn.textContent = name;
        btn.setAttribute("data-link", link);
        btn.style.flexGrow = "1";
        btn.addEventListener("click", function () {
            window.location.href = link;
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "X";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.addEventListener("click", function () {
            if (confirm("Tem certeza que deseja deletar?")) {
                buttonList.removeChild(container);
            }
        });

        container.appendChild(btn);
        container.appendChild(deleteBtn);
        buttonList.appendChild(container);
    }

    // Adicionar novo botão
    addButton.addEventListener("click", function () {
        const name = prompt("Digite o nome do novo condomínio:");
        const link = prompt("Digite o link de redirecionamento:");
        if (name && link) {
            createButton(name, link);
        } else {
            alert("Nome e link são obrigatórios!");
        }
    });

    // Abrir e fechar o menu
    menuBtn.addEventListener("click", function () {
        menu.classList.toggle("menu-visible");
        overlay.classList.toggle("overlay-visible");
    });

    // Fechar o menu ao clicar no overlay
    overlay.addEventListener("click", function () {
        menu.classList.remove("menu-visible");
        overlay.classList.remove("overlay-visible");
    });

    // Redirecionar para index.html ao clicar em "Sair"
    logoutBtn.addEventListener("click", function () {
        window.location.href = "index.html"; // Redireciona para index.html
    });

    // Exemplos de botões
    createButton("Cond. Maria Augusta", "cond1.html");
    createButton("Cond. Luciana", "cond2.html");
    createButton("Cond. Manuel Bandeira", "cond3.html");
    createButton("Cond. Serra Azul", "cond4.html");
});