/* =====================================================================
   config.js — Configuración global del frontend YANANTIN
   Se carga ANTES que cualquier otro script en TODAS las páginas.
   ===================================================================== */
(function (global) {
    'use strict';

    const API_BASE_URL = 'http://localhost:3003';

    const CLAVES = ['token', 'rol', 'usuarioId', 'correo', 'nombre', 'organizacionNombre'];

    const YN = {
        API_BASE_URL,
        CLAVES,

        token() { return localStorage.getItem('token'); },
        rol() { return localStorage.getItem('rol'); },

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
         * BUG QUE RESUELVE: el backend guarda las rutas de archivo como
         * RELATIVAS ("/uploads/oportunidades/171.jpg"). Si se pintan tal cual
         * en un <img src>, el navegador las resuelve contra el origen del
         * FRONTEND (puerto 3000) y da 404. Hay que anteponerles la URL de la
         * API. Esta función lo centraliza y además tolera:
         *   - null/undefined  -> devuelve el placeholder
         *   - URLs absolutas  -> las deja intactas (Unsplash, avatares, etc.)
         *   - data:base64     -> las deja intactas (previews locales)
         */
        img(ruta, placeholder) {
            const vacio = placeholder || '';
            if (!ruta) return vacio;
            const valor = String(ruta).trim();
            if (!valor) return vacio;
            if (/^(https?:)?\/\//i.test(valor) || valor.startsWith('data:')) return valor;
            return `${API_BASE_URL}${valor.startsWith('/') ? '' : '/'}${valor}`;
        },

        async api(ruta, opciones = {}) {
            const config = { ...opciones };
            config.headers = { ...(opciones.headers || {}) };
            if (YN.token()) config.headers.Authorization = `Bearer ${YN.token()}`;
            if (opciones.body && !(opciones.body instanceof FormData)) {
                config.headers['Content-Type'] = 'application/json';
            }
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
            location.replace(urlDestino || '/index.html');
        },

        esc(valor) {
            if (valor === null || valor === undefined) return '';
            return String(valor)
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        },

        fecha(valor, largo) {
            if (!valor) return '—';
            const d = new Date(valor);
            if (isNaN(d)) return '—';
            return d.toLocaleDateString('es-PE', largo
                ? { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }
                : { day: '2-digit', month: 'short', year: 'numeric' });
        },

        hora(valor) {
            if (!valor) return '—';
            const d = new Date(valor);
            return isNaN(d) ? '—' : d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
        },

        volver(fallback) {
            if (history.length > 1 && document.referrer && document.referrer.includes(location.host)) {
                history.back();
            } else {
                location.href = fallback || '/index.html';
            }
        },

        // -----------------------------------------------------------------
        // DIÁLOGOS PROPIOS
        // Reemplazan alert() / confirm(). Los del navegador rompen la
        // identidad visual, bloquean el hilo y en móvil aparecen pegados a
        // la barra de direcciones con el dominio en crudo, que es justo el
        // "estrés visual" que hay que evitar.
        // -----------------------------------------------------------------
        _capa() {
            let capa = document.getElementById('yn-capa-modal');
            if (!capa) {
                capa = document.createElement('div');
                capa.id = 'yn-capa-modal';
                capa.className = 'yn-overlay';
                document.body.appendChild(capa);
            }
            return capa;
        },

        /**
         * Modal genérico. Devuelve una promesa que resuelve con true si el
         * usuario confirma y false si cancela o cierra.
         *
         * YN.modal({
         *   tipo: 'exito' | 'error' | 'aviso' | 'pregunta',
         *   titulo, mensaje, detalle (HTML opcional),
         *   textoConfirmar, textoCancelar (omitir para ocultar el botón)
         * })
         */
        modal(opciones) {
            const o = opciones || {};
            const tipo = o.tipo || 'aviso';
            const iconos = {
                exito: 'fa-circle-check', error: 'fa-circle-exclamation',
                aviso: 'fa-circle-info', pregunta: 'fa-circle-question',
            };

            return new Promise((resolver) => {
                const capa = YN._capa();
                capa.innerHTML = `
                    <div class="yn-modal" role="dialog" aria-modal="true">
                      <div class="yn-modal-icono ${tipo}">
                        <i class="fa-solid ${iconos[tipo] || iconos.aviso}"></i>
                      </div>
                      <h3 class="yn-modal-titulo">${YN.esc(o.titulo || '')}</h3>
                      ${o.mensaje ? `<p class="yn-modal-texto">${YN.esc(o.mensaje)}</p>` : ''}
                      ${o.detalle ? `<div class="yn-modal-detalle">${o.detalle}</div>` : ''}
                      <div class="yn-modal-acciones">
                        ${o.textoCancelar ? `<button class="btn btn-brand-outline" data-yn="cancelar">${YN.esc(o.textoCancelar)}</button>` : ''}
                        <button class="btn btn-brand-primary" data-yn="confirmar">${YN.esc(o.textoConfirmar || 'Entendido')}</button>
                      </div>
                    </div>`;
                capa.classList.add('visible');

                const cerrar = (valor) => {
                    capa.classList.remove('visible');
                    document.removeEventListener('keydown', alTeclado);
                    setTimeout(() => { capa.innerHTML = ''; }, 180);
                    resolver(valor);
                };
                const alTeclado = (e) => { if (e.key === 'Escape') cerrar(false); };

                capa.querySelector('[data-yn="confirmar"]').addEventListener('click', () => cerrar(true));
                const btnCancelar = capa.querySelector('[data-yn="cancelar"]');
                if (btnCancelar) btnCancelar.addEventListener('click', () => cerrar(false));
                capa.addEventListener('click', (e) => { if (e.target === capa) cerrar(false); });
                document.addEventListener('keydown', alTeclado);

                capa.querySelector('[data-yn="confirmar"]').focus();
            });
        },

        alerta(titulo, mensaje, tipo) {
            return YN.modal({ tipo: tipo || 'aviso', titulo, mensaje });
        },

        confirmar(titulo, mensaje, textoConfirmar) {
            return YN.modal({
                tipo: 'pregunta', titulo, mensaje,
                textoConfirmar: textoConfirmar || 'Sí, continuar',
                textoCancelar: 'Cancelar',
            });
        },

        toast(mensaje, tipo) {
            const cont = document.getElementById('yn-toasts') || (function () {
                const d = document.createElement('div');
                d.id = 'yn-toasts';
                document.body.appendChild(d);
                return d;
            })();
            const iconos = { success: 'fa-circle-check', danger: 'fa-circle-exclamation', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
            const t = document.createElement('div');
            t.className = `yn-toast ${tipo || 'success'}`;
            t.innerHTML = `<i class="fa-solid ${iconos[tipo || 'success'] || iconos.success}"></i><span>${YN.esc(mensaje)}</span>`;
            cont.appendChild(t);
            setTimeout(() => { t.classList.add('saliendo'); setTimeout(() => t.remove(), 250); }, 3600);
        },
    };

    global.YN = YN;
    global.API_BASE_URL = API_BASE_URL; // compatibilidad con páginas antiguas
})(window);