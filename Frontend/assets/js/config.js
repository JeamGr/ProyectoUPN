/* =====================================================================
   config.js — Configuración global del frontend YANANTIN
   Se carga ANTES que cualquier otro script en TODAS las páginas.

   Cambiar la URL del backend en UN solo lugar (aquí) en vez de en 20
   archivos HTML con `const API_BASE_URL = ...` repetido.
   ===================================================================== */
(function (global) {
    'use strict';

    const API_BASE_URL = 'http://localhost:3003';

    // Claves de almacenamiento. Se agrupan para poder limpiarlas todas
    // de golpe en el logout y no dejar restos de la sesión anterior.
    const CLAVES = ['token', 'rol', 'usuarioId', 'correo', 'nombre', 'organizacionNombre'];

    const YN = {
        API_BASE_URL,
        CLAVES,

        token() {
            return localStorage.getItem('token');
        },

        rol() {
            return localStorage.getItem('rol');
        },

        guardarSesion(token, usuario) {
            localStorage.setItem('token', token);
            localStorage.setItem('rol', usuario.rol);
            if (usuario.id) localStorage.setItem('usuarioId', usuario.id);
            if (usuario.correo) localStorage.setItem('correo', usuario.correo);
        },

        limpiarSesion() {
            CLAVES.forEach((k) => localStorage.removeItem(k));
            try { sessionStorage.clear(); } catch (e) { /* modo privado */ }
        },

        headers(json) {
            const h = { Authorization: `Bearer ${YN.token()}` };
            if (json) h['Content-Type'] = 'application/json';
            return h;
        },

        /**
         * Wrapper de fetch para endpoints protegidos.
         * Si el backend responde 401 (token expirado, revocado por logout
         * o firma inválida) se corta la sesión LOCAL de inmediato. Sin
         * esto, un token muerto se queda en localStorage y la página
         * sigue "pareciendo" logueada aunque ninguna petición funcione.
         */
        async api(ruta, opciones = {}) {
            const config = { ...opciones };
            config.headers = { ...(opciones.headers || {}) };
            if (YN.token()) config.headers.Authorization = `Bearer ${YN.token()}`;
            if (opciones.body && !(opciones.body instanceof FormData)) {
                config.headers['Content-Type'] = 'application/json';
            }
            // Nunca servir respuestas de API desde la caché del navegador.
            config.cache = 'no-store';

            const resp = await fetch(`${API_BASE_URL}${ruta}`, config);

            if (resp.status === 401) {
                YN.limpiarSesion();
                const login = (global.YN_LOGIN_URL || '/index.html');
                location.replace(login + '?sesion=expirada');
                throw new Error('Sesión expirada');
            }

            let datos = null;
            try { datos = await resp.json(); } catch (e) { datos = { ok: false, mensaje: 'Respuesta inválida del servidor' }; }
            return datos;
        },

        /** Cierra sesión: revoca el token en el servidor y limpia el cliente. */
        async logout(urlDestino) {
            const token = YN.token();
            if (token) {
                try {
                    await fetch(`${API_BASE_URL}/auth/logout`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                    });
                } catch (e) { /* aunque falle la red, limpiamos igual */ }
            }
            YN.limpiarSesion();
            // replace() y no href: así la página protegida NO queda en el
            // historial y el botón "Atrás" no puede devolverte a ella.
            location.replace(urlDestino || '/index.html');
        },

        /** Escapa texto antes de meterlo en innerHTML (evita XSS almacenado). */
        esc(valor) {
            if (valor === null || valor === undefined) return '';
            return String(valor)
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        },

        fecha(valor) {
            if (!valor) return '—';
            const d = new Date(valor);
            return isNaN(d) ? '—' : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
        },

        /** Botón "Volver" que respeta el historial pero nunca sale del sitio. */
        volver(fallback) {
            if (history.length > 1 && document.referrer && document.referrer.includes(location.host)) {
                history.back();
            } else {
                location.href = fallback || '/index.html';
            }
        },

        toast(mensaje, tipo) {
            const cont = document.getElementById('yn-toasts') || (function () {
                const d = document.createElement('div');
                d.id = 'yn-toasts';
                d.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:.5rem;';
                document.body.appendChild(d);
                return d;
            })();
            const t = document.createElement('div');
            t.className = `alert alert-${tipo || 'success'} shadow`;
            t.style.cssText = 'min-width:280px;margin:0;';
            t.textContent = mensaje;
            cont.appendChild(t);
            setTimeout(() => t.remove(), 4000);
        },
    };

    global.YN = YN;
    global.API_BASE_URL = API_BASE_URL; // compatibilidad con páginas antiguas
})(window);