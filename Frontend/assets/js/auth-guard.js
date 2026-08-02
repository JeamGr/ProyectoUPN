/* =====================================================================
   auth-guard.js — Guardián de sesión (REESCRITO)

   PROBLEMA QUE RESUELVE
   ---------------------
   Antes, cada página protegida hacía únicamente:

       const token = localStorage.getItem('token');
       if (!token) window.location.href = '../public-auth/login.html';

   Eso falla en tres escenarios reales, y los tres los reportaste:

   1. Cierras sesión como voluntario, entras como ORGANIZACIÓN y pulsas
      "Atrás": el dashboard del voluntario vuelve a aparecer. El token
      SÍ existe (es el de la organización), así que el `if (!token)`
      pasa. Nadie comprobaba el ROL.

   2. Recargas y sigue igual, por lo mismo: hay token, aunque sea de
      otra cuenta y de otro rol.

   3. El token puede estar expirado o REVOCADO por /auth/logout
      (tabla tokens_invalidados) y el navegador no tiene forma de
      saberlo mirando solo localStorage. La única fuente de verdad es
      el servidor.

   CÓMO LO RESUELVE
   ----------------
   a) Oculta el documento hasta que la sesión esté verificada (evita el
      "flash" de contenido protegido).
   b) Comprueba que exista token Y que el rol guardado sea uno de los
      permitidos por la página (atributo data-rol).
   c) Valida el token CONTRA EL BACKEND en GET /auth/me, que pasa por
      authHandler: verifica firma, expiración y lista de revocados.
   d) Re-valida en el evento `pageshow` con event.persisted === true,
      que es exactamente el caso del botón "Atrás" con bfcache.
   e) Escucha `storage` para reaccionar a un logout hecho en otra pestaña.
   f) Usa location.replace(), nunca href, para no dejar la página
      protegida en el historial.

   USO
   ---
   <script src="../assets/js/config.js"></script>
   <script src="../assets/js/auth-guard.js"
           data-rol="VOLUNTARIO"
           data-login="../public-auth/login-voluntario.html"></script>

   data-rol admite varios separados por coma:
       data-rol="ADMINISTRADOR,SUPER_ADMINISTRADOR"
   ===================================================================== */
(function () {
    'use strict';

    const script = document.currentScript;
    const rolesPermitidos = (script.dataset.rol || '')
        .split(',').map((r) => r.trim().toUpperCase()).filter(Boolean);
    const loginUrl = script.dataset.login || '../index.html';

    // Expuesto para que config.js sepa a dónde mandar en un 401.
    window.YN_LOGIN_URL = loginUrl;

    // ---- (a) Cortina anti-flash --------------------------------------
    // Se inyecta inmediatamente, antes de que pinte nada del <body>.
    const cortina = document.createElement('style');
    cortina.id = 'yn-cortina';
    cortina.textContent = 'html{visibility:hidden!important}';
    (document.head || document.documentElement).appendChild(cortina);

    function levantarCortina() {
        const el = document.getElementById('yn-cortina');
        if (el) el.remove();
    }

    function expulsar(motivo) {
        if (window.YN) YN.limpiarSesion();
        else ['token', 'rol', 'usuarioId', 'correo', 'nombre'].forEach((k) => localStorage.removeItem(k));
        location.replace(`${loginUrl}?motivo=${encodeURIComponent(motivo)}`);
    }

    // ---- (b) Comprobación local, instantánea --------------------------
    function comprobacionLocal() {
        const token = localStorage.getItem('token');
        const rol = (localStorage.getItem('rol') || '').toUpperCase();

        if (!token) return { ok: false, motivo: 'sin-sesion' };
        if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(rol)) {
            // Este es el caso del botón "Atrás": hay token, pero de otro rol.
            return { ok: false, motivo: 'rol-incorrecto' };
        }
        return { ok: true };
    }

    // ---- (c) Verificación real contra el backend ----------------------
    async function verificarEnServidor() {
        const base = (window.YN && YN.API_BASE_URL) || 'http://localhost:3003';
        try {
            const resp = await fetch(`${base}/auth/me`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                cache: 'no-store',
            });

            if (!resp.ok) return { ok: false, motivo: 'sesion-expirada' };

            const datos = await resp.json();
            if (!datos.ok) return { ok: false, motivo: 'sesion-expirada' };

            const rolReal = String(datos.usuario.rol || '').toUpperCase();

            // El rol que manda es el que dice el SERVIDOR, no el que hay
            // en localStorage (que el usuario puede editar a mano).
            if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(rolReal)) {
                return { ok: false, motivo: 'rol-incorrecto' };
            }

            // Se resincroniza por si localStorage estaba manipulado o viejo.
            localStorage.setItem('rol', rolReal);
            localStorage.setItem('usuarioId', datos.usuario.id);
            localStorage.setItem('correo', datos.usuario.correo);
            window.YN_USUARIO = datos.usuario;
            return { ok: true };
        } catch (error) {
            // El backend está caído: no se expulsa al usuario (sería
            // hostil), pero tampoco se le da por verificado en silencio.
            console.warn('[auth-guard] No se pudo verificar la sesión con el servidor.', error);
            return { ok: true, degradado: true };
        }
    }

    async function proteger() {
        const local = comprobacionLocal();
        if (!local.ok) { expulsar(local.motivo); return; }

        const servidor = await verificarEnServidor();
        if (!servidor.ok) { expulsar(servidor.motivo); return; }

        levantarCortina();
        document.dispatchEvent(new CustomEvent('yn:sesion-lista', { detail: window.YN_USUARIO || null }));
    }

    proteger();

    // ---- (d) Botón Atrás / Adelante con bfcache -----------------------
    // El navegador restaura la página desde memoria SIN re-ejecutar los
    // scripts. Sin este listener, la página protegida se queda visible.
    window.addEventListener('pageshow', function (event) {
        if (!event.persisted) return;
        const local = comprobacionLocal();
        if (!local.ok) { expulsar(local.motivo); return; }
        verificarEnServidor().then((r) => { if (!r.ok) expulsar(r.motivo); });
    });

    // ---- (e) Logout en otra pestaña -----------------------------------
    window.addEventListener('storage', function (e) {
        if (e.key === 'token' && !e.newValue) expulsar('sesion-cerrada');
        if (e.key === 'rol' && e.newValue && rolesPermitidos.length > 0
            && !rolesPermitidos.includes(String(e.newValue).toUpperCase())) {
            expulsar('rol-incorrecto');
        }
    });

    // Red de seguridad: si algo falla y la cortina se queda puesta,
    // se levanta a los 6 s para no dejar la pantalla en blanco.
    setTimeout(levantarCortina, 6000);
})();