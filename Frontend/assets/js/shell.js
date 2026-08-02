/* =====================================================================
   shell.js — Layout AdminLTE 4 generado por JS

   En vez de duplicar 80 líneas de <aside> en cada una de las 10
   pantallas de panel (y tener que editarlas todas cada vez que se
   agrega un ítem al menú), el sidebar + header se declaran UNA vez
   aquí y cada página solo dice quién es:

       <script src="../assets/js/shell.js" data-panel="admin" data-activo="organizaciones"></script>

   data-panel: "admin" | "organizacion"
   data-activo: id del ítem de menú que va resaltado

   La página escribe su contenido dentro de <div id="contenido">.
   ===================================================================== */
(function () {
    'use strict';

    const script = document.currentScript;
    const panel = script.dataset.panel || 'admin';
    const activo = script.dataset.activo || '';

    const MENUS = {
        admin: {
            titulo: 'Panel de administración',
            badge: 'Administrador',
            inicio: 'dashboard.html',
            loginUrl: '../public-auth/login-admin.html',
            grupos: [
                {
                    titulo: 'General',
                    items: [
                        { id: 'dashboard', texto: 'Inicio', icono: 'fa-gauge-high', url: 'dashboard.html' },
                    ],
                },
                {
                    titulo: 'Moderación',
                    items: [
                        { id: 'organizaciones', texto: 'Organizaciones', icono: 'fa-building-shield', url: 'organizaciones.html', badge: 'pendientesOrg' },
                        { id: 'moderacion', texto: 'Oportunidades', icono: 'fa-clipboard-check', url: 'moderacion.html', badge: 'pendientesOp' },
                    ],
                },
                {
                    titulo: 'Configuración (M12)',
                    items: [
                        { id: 'catalogos', texto: 'Catálogos', icono: 'fa-list-check', url: 'catalogos.html' },
                        { id: 'parametros', texto: 'Parámetros', icono: 'fa-sliders', url: 'parametros.html' },
                        { id: 'roles', texto: 'Roles y permisos', icono: 'fa-user-shield', url: 'roles-permisos.html', soloSuper: true },
                    ],
                },
            ],
        },
        organizacion: {
            titulo: 'Panel de organización',
            badge: 'Organización',
            inicio: 'dashboard.html',
            loginUrl: '../public-auth/login-organizacion.html',
            grupos: [
                {
                    titulo: 'General',
                    items: [
                        { id: 'dashboard', texto: 'Inicio', icono: 'fa-gauge-high', url: 'dashboard.html' },
                    ],
                },
                {
                    titulo: 'Voluntariados',
                    items: [
                        { id: 'mis-oportunidades', texto: 'Mis oportunidades', icono: 'fa-rectangle-list', url: 'mis-oportunidades.html' },
                        { id: 'crear', texto: 'Crear oportunidad', icono: 'fa-circle-plus', url: 'crear-oportunidad.html' },
                    ],
                },
            ],
        },
    };

    const cfg = MENUS[panel];
    const esSuper = (localStorage.getItem('rol') || '').toUpperCase() === 'SUPER_ADMINISTRADOR';

    function itemHTML(item) {
        if (item.soloSuper && !esSuper) return '';
        const act = item.id === activo ? ' active' : '';
        const badge = item.badge
            ? `<span class="badge text-bg-warning ms-auto d-none" data-contador="${item.badge}">0</span>`
            : '';
        return `
            <li class="nav-item">
                <a href="${item.url}" class="nav-link${act}">
                    <i class="nav-icon fa-solid ${item.icono}"></i>
                    <p>${item.texto}${badge}</p>
                </a>
            </li>`;
    }

    const menuHTML = cfg.grupos.map((g) => `
        <li class="nav-header">${g.titulo}</li>
        ${g.items.map(itemHTML).join('')}
    `).join('');

    const shell = `
<aside class="app-sidebar shadow" data-bs-theme="dark">
  <div class="sidebar-brand">
    <a href="${cfg.inicio}" class="brand-link text-decoration-none d-flex align-items-center gap-2 px-3 py-3">
      <span class="brand-mark d-inline-flex align-items-center justify-content-center"
            style="width:34px;height:34px;border-radius:11px;background:linear-gradient(135deg,#6D28D9,#FF1478);color:#fff;">
        <i class="fa-solid fa-hands-holding-circle"></i>
      </span>
      <span class="brand-text fw-bold text-white" style="letter-spacing:.06em;">YANANTIN</span>
    </a>
  </div>
  <div class="sidebar-wrapper">
    <nav class="mt-2">
      <ul class="nav sidebar-menu flex-column" data-lte-toggle="treeview" role="menu">
        ${menuHTML}
      </ul>
    </nav>
  </div>
</aside>

<main class="app-main">
  <nav class="app-header navbar navbar-expand bg-body">
    <div class="container-fluid">
      <ul class="navbar-nav align-items-center">
        <li class="nav-item">
          <a class="nav-link" data-lte-toggle="sidebar" href="#" role="button" aria-label="Menú">
            <i class="fa-solid fa-bars"></i>
          </a>
        </li>
        <li class="nav-item">
          <button type="button" class="yn-volver ms-2" id="btnVolverShell">
            <i class="fa-solid fa-arrow-left"></i> Volver
          </button>
        </li>
      </ul>
      <ul class="navbar-nav ms-auto align-items-center gap-2">
        <li class="nav-item d-none d-md-block">
          <span class="badge rounded-pill" style="background:#F1EBFE;color:#6D28D9;font-weight:600;">
            ${cfg.badge}
          </span>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link d-flex align-items-center gap-2" data-bs-toggle="dropdown" href="#">
            <span class="d-inline-flex align-items-center justify-content-center fw-bold text-white"
                  style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#6D28D9,#FF1478);font-size:.85rem;"
                  id="shellInicial">Y</span>
            <span class="d-none d-md-inline small text-muted" id="shellCorreo">—</span>
          </a>
          <ul class="dropdown-menu dropdown-menu-end shadow">
            <li><h6 class="dropdown-header" id="shellCorreoMenu">—</h6></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="${cfg.inicio}"><i class="fa-solid fa-gauge-high me-2 text-muted"></i>Ir al panel</a></li>
            <li><a class="dropdown-item text-danger" href="#" id="btnLogoutShell"><i class="fa-solid fa-right-from-bracket me-2"></i>Cerrar sesión</a></li>
          </ul>
        </li>
      </ul>
    </div>
  </nav>

  <div id="shell-slot"></div>

  <footer class="app-footer">
    <div class="float-end d-none d-sm-inline small text-muted">${cfg.titulo}</div>
    <strong>YANANTIN</strong> — Comunidad que impulsa el voluntariado universitario.
  </footer>
</main>`;

    function montar() {
        const wrapper = document.querySelector('.app-wrapper');
        if (!wrapper) {
            console.error('[shell.js] Falta <div class="app-wrapper"> en el body.');
            return;
        }

        // El contenido propio de la página se guarda y se reinserta dentro
        // del <main> que genera el shell.
        const contenido = document.getElementById('contenido');
        wrapper.insertAdjacentHTML('afterbegin', shell);
        if (contenido) document.getElementById('shell-slot').appendChild(contenido);

        const correo = localStorage.getItem('correo') || '';
        if (correo) {
            document.getElementById('shellCorreo').textContent = correo;
            document.getElementById('shellCorreoMenu').textContent = correo;
            document.getElementById('shellInicial').textContent = correo.charAt(0).toUpperCase();
        }

        document.getElementById('btnLogoutShell').addEventListener('click', function (e) {
            e.preventDefault();
            YN.logout(cfg.loginUrl);
        });

        document.getElementById('btnVolverShell').addEventListener('click', function () {
            YN.volver(cfg.inicio);
        });

        document.dispatchEvent(new CustomEvent('yn:shell-listo'));
    }

    // IMPORTANTE: shell.js debe cargarse ANTES que adminlte.min.js.
    // Así su listener de DOMContentLoaded se registra primero y el
    // <aside class="app-sidebar"> ya existe cuando AdminLTE se inicializa.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', montar);
    } else {
        montar();
    }

    // API para que el dashboard pinte los contadores del sidebar.
    window.shellContador = function (clave, valor) {
        document.querySelectorAll(`[data-contador="${clave}"]`).forEach((el) => {
            el.textContent = valor;
            el.classList.toggle('d-none', !valor);
        });
    };
})();