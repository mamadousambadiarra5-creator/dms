const currentUser = localStorage.getItem("currentUser");

if (!currentUser) {
    const pathname = window.location.pathname;
    if (pathname.includes("/pages/") || pathname.includes("/page/")) {
        window.location.href = "../auth/login.html";
    } else {
        window.location.href = "auth/login.html";
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    const pathname = window.location.pathname;
    if (pathname.includes("/pages/") || pathname.includes("/page/")) {
        window.location.href = "../auth/login.html";
    } else {
        window.location.href = "auth/login.html";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // 1. Charger les infos de l'utilisateur connecté dans la sidebar
    if (currentUser) {
        const user = JSON.parse(currentUser);
        const sidebarName = document.getElementById("sidebarUserName");
        const avatar = document.querySelector(".profile-avatar");
        
        if (sidebarName && user.name) {
            sidebarName.textContent = user.name;
        }
        if (avatar && user.name) {
            avatar.textContent = user.name.charAt(0).toUpperCase();
        }
    }

    // 2. Activer l'élément courant de la sidebar
    const pathname = window.location.pathname;
    const links = document.querySelectorAll(".sidebar ul li a");
    
    links.forEach(link => {
        const href = link.getAttribute("href");
        if (href) {
            const fileFromHref = href.substring(href.lastIndexOf("/") + 1);
            const fileFromPath = pathname.substring(pathname.lastIndexOf("/") + 1);
            
            if (fileFromHref === fileFromPath) {
                link.classList.add("active");
            } else if (fileFromPath === "" && fileFromHref === "dashboard.html") {
                link.classList.add("active");
            }
        }
    });

    // 3. Configurer le menu hamburger mobile
    setupMobileMenu();
});

function setupMobileMenu() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    // Créer le conteneur du header mobile
    const mobileHeader = document.createElement("div");
    mobileHeader.className = "mobile-header";
    
    const isSubdir = window.location.pathname.includes("/pages/") || window.location.pathname.includes("/page/");
    const logoPath = isSubdir ? "../assets/logo.png" : "assets/logo.png";
    
    mobileHeader.innerHTML = `
        <button class="hamburger-btn" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
        </button>
        <div class="mobile-logo">
            <img src="${logoPath}" width="30" alt="Logo">
            <span>SAMINA</span>
        </div>
    `;
    
    // Créer l'overlay pour le menu
    const overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    
    // Insérer dans le body
    document.body.insertBefore(mobileHeader, document.body.firstChild);
    document.body.appendChild(overlay);
    
    const hamburgerBtn = mobileHeader.querySelector(".hamburger-btn");
    
    // Toggle menu
    hamburgerBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        sidebar.classList.toggle("open");
        overlay.classList.toggle("active");
        hamburgerBtn.classList.toggle("active");
    });
    
    // Fermer si clic sur l'overlay
    overlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
        hamburgerBtn.classList.remove("active");
    });
    
    // Fermer si clic sur un lien du menu
    sidebar.addEventListener("click", (e) => {
        if (e.target.tagName === "A" || e.target.closest("a")) {
            sidebar.classList.remove("open");
            overlay.classList.remove("active");
            hamburgerBtn.classList.remove("active");
        }
    });
}