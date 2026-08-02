/* =====================================================================
   shell-org.js — Layout del panel de ORGANIZACIÓN
   Sidebar claro según el mockup. No usa AdminLTE a propósito: ese tema
   queda reservado para /administrador, que es una herramienta interna.
   El panel de organización lo ve una ONG externa, así que sigue la
   identidad visual del sitio público.

   Uso:
   <div class="org-shell"><div id="contenido">…</div></div>
   <script src="../assets/js/shell-org.js" data-activo="dashboard"></script>
   ===================================================================== */
(function () {
    'use strict';

    const activo = document.currentScript.dataset.activo || '';

    const MENU = [
        { grupo: null, items: [
            { id: 'dashboard', texto: 'Inicio', icono: 'fa-house', url: 'dashboard.html' },
        ]},
        { grupo: 'Voluntariados', items: [
            { id: 'mis-oportunidades', texto: 'Mis oportunidades', icono: 'fa-rectangle-list', url: 'mis-oportunidades.html' },
            { id: 'crear', texto: 'Crear oportunidad', icono: 'fa-circle-plus', url: 'crear-oportunidad.html' },
        ]},
        { grupo: 'Operación', items: [
            { id: 'gestion', texto: 'Inscritos y asistencia', icono: 'fa-users', url: 'gestion.html' },
        ]},
        { grupo: 'Cuenta', items: [
            { id: 'perfil', texto: 'Mi organización', icono: 'fa-building', url: 'perfil-organizacion.html' },
        ]},
    ];

    const nav = MENU.map((g) => {
        const cab = g.grupo ? `<span class="separador">${g.grupo}</span>` : '';
        const enlaces = g.items.map((i) => `
            <a href="${i.url}" class="${i.id === activo ? 'activo' : ''}">
                <i class="fa-solid ${i.icono}"></i>${i.texto}
            </a>`).join('');
        return cab + enlaces;
    }).join('');

    const shell = `
<div class="org-backdrop" id="orgBackdrop"></div>
<aside class="org-sidebar" id="orgSidebar">
  <div class="org-marca">
    <span class="avatar" id="orgInicial"><i class="fa-solid fa-building"></i></span>
    <div>
      <div class="nombre" id="orgNombre">Mi organización</div>
      <div class="rol">Organización</div>
    </div>
  </div>
  <nav class="org-nav">${nav}</nav>
  <div class="org-salir">
    <button type="button" id="orgLogout"><i class="fa-solid fa-right-from-bracket"></i>Cerrar sesión</button>
  </div>
</aside>

<div class="org-main">
  <div class="org-topbar">
    <div class="d-flex align-items-center gap-2">
      <button class="org-burger" id="orgBurger" aria-label="Menú"><i class="fa-solid fa-bars"></i></button>
      <button class="yn-volver" id="orgVolver"><i class="fa-solid fa-arrow-left"></i> Volver</button>
    </div>
    <div class="d-flex align-items-center gap-3">
      <span class="badge-estado" id="orgEstado">—</span>
      <span class="small text-muted d-none d-md-inline" id="orgCorreo"></span>
    </div>
  </div>
  <div class="org-contenido" id="org-slot"></div>
</div>`;

    function montar() {
        const raiz = document.querySelector('.org-shell');
        if (!raiz) { console.error('[shell-org] Falta <div class="org-shell">'); return; }

        const contenido = document.getElementById('contenido');
        raiz.insertAdjacentHTML('afterbegin', shell);
        if (contenido) document.getElementById('org-slot').appendChild(contenido);

        document.getElementById('orgCorreo').textContent = localStorage.getItem('correo') || '';
        const guardado = localStorage.getItem('organizacionNombre');
        if (guardado) {
            document.getElementById('orgNombre').textContent = guardado;
            document.getElementById('orgInicial').textContent = guardado.charAt(0).toUpperCase();
        }

        document.getElementById('orgLogout').addEventListener('click', () =>
            YN.logout('../public-auth/login-organizacion.html'));
        document.getElementById('orgVolver').addEventListener('click', () =>
            YN.volver('dashboard.html'));

        const sidebar = document.getElementById('orgSidebar');
        const backdrop = document.getElementById('orgBackdrop');
        const alternar = () => {
            sidebar.classList.toggle('abierto');
            backdrop.classList.toggle('visible');
        };
        document.getElementById('orgBurger').addEventListener('click', alternar);
        backdrop.addEventListener('click', alternar);

        cargarCabecera();
        document.dispatchEvent(new CustomEvent('yn:shell-listo'));
    }

    /** Trae el nombre y el estado de validación una sola vez por carga. */
    async function cargarCabecera() {
        try {
            const datos = await YN.api('/perfiles/organizacion/me');
            const p = datos.data || datos.perfil || {};
            const nombre = p.nombre_ong || p.razon_social;
            if (nombre) {
                localStorage.setItem('organizacionNombre', nombre);
                document.getElementById('orgNombre').textContent = nombre;
                document.getElementById('orgInicial').textContent = nombre.charAt(0).toUpperCase();
            }
            const estado = p.estado_validacion || 'pendiente_validacion';
            const badge = document.getElementById('orgEstado');
            badge.className = `badge-estado ${estado}`;
            badge.textContent = estado.replace(/_/g, ' ');
            window.YN_ORG = p;
            document.dispatchEvent(new CustomEvent('yn:org-lista', { detail: p }));
        } catch (e) { /* el guardián ya maneja los 401 */ }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar);
    else montar();
})();