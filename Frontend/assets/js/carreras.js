/* =====================================================================
   carreras.js — Catálogo oficial de carreras de pregrado UPN
   Se declara aquí (y no en la BD) porque es una lista cerrada que solo
   cambia cuando la universidad abre una carrera nueva. Al ser un <select>
   cerrado, se elimina el problema de que cada usuario escriba su carrera
   de una forma distinta ("Ing. Sistemas", "ingenieria de sistemas"...),
   que rompía cualquier reporte agrupado por carrera.
   ===================================================================== */
(function (global) {
    'use strict';

    const CARRERAS_UPN = {
        'Negocios': [
            'Administración',
            'Administración Bancaria y Financiera',
            'Administración y Gestión Empresarial',
            'Administración y Marketing',
            'Administración y Negocios Internacionales',
            'Administración y Servicios Turísticos',
            'Contabilidad y Finanzas',
            'Economía',
            'Economía y Negocios Internacionales',
            'Gastronomía y Gestión de Restaurantes',
            'Marketing Internacional',
            'Negocios Internacionales',
        ],
        'Ingeniería': [
            'Ingeniería Agroindustrial',
            'Ingeniería Ambiental',
            'Ingeniería Biomédica',
            'Ingeniería Civil',
            'Ingeniería de Minas',
            'Ingeniería de Sistemas Computacionales',
            'Ingeniería de Sistemas y Redes',
            'Ingeniería de Software',
            'Ingeniería Electrónica',
            'Ingeniería Empresarial',
            'Ingeniería Geológica',
            'Ingeniería Industrial',
            'Ingeniería Mecatrónica',
        ],
        'Comunicaciones': [
            'Comunicación',
            'Comunicación Audiovisual en Medios Digitales',
            'Comunicación y Diseño Gráfico',
            'Comunicación y Marketing Digital',
            'Comunicación y Periodismo',
            'Comunicación y Publicidad',
        ],
        'Salud': [
            'Enfermería',
            'Farmacia y Bioquímica',
            'Medicina Humana',
            'Nutrición y Dietética',
            'Obstetricia',
            'Psicología',
            'Terapia Física y Rehabilitación',
        ],
        'Arquitectura y Diseño': [
            'Arquitectura y Diseño de Interiores',
            'Arquitectura y Urbanismo',
            'Diseño Industrial',
        ],
        'Derecho': [
            'Derecho',
        ],
    };

    /** Lista plana, útil para validar. */
    const CARRERAS_LISTA = Object.values(CARRERAS_UPN).flat();

    /**
     * Rellena un <select> agrupando por facultad con <optgroup>.
     * Con 41 opciones, agruparlas reduce mucho el tiempo de búsqueda
     * frente a una lista alfabética plana.
     */
    function llenarSelectCarreras(select, valorSeleccionado) {
        const el = typeof select === 'string' ? document.getElementById(select) : select;
        if (!el) return;

        el.innerHTML = '<option value="" disabled>Selecciona tu carrera</option>';
        Object.entries(CARRERAS_UPN).forEach(([facultad, carreras]) => {
            const grupo = document.createElement('optgroup');
            grupo.label = facultad;
            carreras.forEach((c) => {
                const opt = document.createElement('option');
                opt.value = c;
                opt.textContent = c;
                if (c === valorSeleccionado) opt.selected = true;
                grupo.appendChild(opt);
            });
            el.appendChild(grupo);
        });

        // Si el perfil tenía una carrera escrita a mano que no está en el
        // catálogo, se conserva como opción para no perder el dato.
        if (valorSeleccionado && !CARRERAS_LISTA.includes(valorSeleccionado)) {
            const grupo = document.createElement('optgroup');
            grupo.label = 'Registrada anteriormente';
            const opt = document.createElement('option');
            opt.value = valorSeleccionado;
            opt.textContent = valorSeleccionado;
            opt.selected = true;
            grupo.appendChild(opt);
            el.appendChild(grupo);
        }

        if (!valorSeleccionado) el.value = '';
    }

    global.CARRERAS_UPN = CARRERAS_UPN;
    global.CARRERAS_LISTA = CARRERAS_LISTA;
    global.llenarSelectCarreras = llenarSelectCarreras;
})(window);