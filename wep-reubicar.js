/* Reubicar producto — lógica interactiva del prototipo SubLPN */

(function () {
  'use strict';

  /* Catálogo opcional: si coincide, enriquece UI; cualquier localidad abierta se acepta. */

  var INVENTARIO = {
    'A-01-01': {
      'LPN-1001': {
        hasSubLpn: true,
        subLpns: {
          'SUB-1001-A': [
            {
              id: 'inv-1',
              producto: 'SKU-48001 — Caja cartón 40x30',
              sku: 'SKU-48001',
              cantidad: 24,
              lote: 'Lote-2026-031',
              serial: '—',
              attr1: 'Color: Café',
              attr2: 'Origen: MX',
              attr3: 'Clase: A',
              estatus: 'Disponible'
            },
            {
              id: 'inv-2',
              producto: 'SKU-48015 — Film stretch 500m',
              sku: 'SKU-48015',
              cantidad: 10,
              lote: 'Lote-2026-088',
              serial: 'SN-77821',
              attr1: 'Calibre: 20µ',
              attr2: 'Origen: US',
              attr3: 'Clase: B',
              estatus: 'Disponible'
            }
          ],
          'SUB-1001-B': [
            {
              id: 'inv-3',
              producto: 'SKU-49102 — Cinta adhesiva industrial',
              sku: 'SKU-49102',
              cantidad: 500,
              lote: 'Lote-2025-912',
              serial: '—',
              attr1: 'Ancho: 48mm',
              attr2: 'Origen: MX',
              attr3: 'Clase: A',
              estatus: 'En cuarentena'
            }
          ]
        }
      },
      'LPN-1002': {
        hasSubLpn: false,
        products: [
          {
            id: 'inv-4',
            producto: 'SKU-51020 — Pallet plástico HDPE',
            sku: 'SKU-51020',
            cantidad: 8,
            lote: 'Lote-2026-010',
            serial: 'PL-00441',
            attr1: 'Color: Negro',
            attr2: 'Origen: BR',
            attr3: 'Clase: A',
            estatus: 'Disponible'
          },
          {
            id: 'inv-5',
            producto: 'SKU-48001 — Caja cartón 40x30',
            sku: 'SKU-48001',
            cantidad: 12,
            lote: 'Lote-2026-044',
            serial: '—',
            attr1: 'Color: Café',
            attr2: 'Origen: MX',
            attr3: 'Clase: B',
            estatus: 'Disponible'
          }
        ]
      }
    },
    'A-01-02': {
      'LPN-2001': {
        hasSubLpn: true,
        subLpns: {
          'SUB-2001-X': [
            {
              id: 'inv-6',
              producto: 'SKU-60011 — Cinta embalaje 48mm',
              sku: 'SKU-60011',
              cantidad: 36,
              lote: 'Lote-2026-120',
              serial: '—',
              attr1: 'Ancho: 48mm',
              attr2: 'Origen: CN',
              attr3: 'Clase: C',
              estatus: 'Disponible'
            }
          ]
        }
      }
    },
    'A-02-01': {
      'LPN-3001': {
        hasSubLpn: false,
        products: [
          {
            id: 'inv-7',
            producto: 'SKU-70001 — Separador corrugado',
            sku: 'SKU-70001',
            cantidad: 40,
            lote: 'Lote-2026-001',
            serial: '—',
            attr1: 'Espesor: 3mm',
            attr2: 'Origen: MX',
            attr3: 'Clase: A',
            estatus: 'Bloqueado'
          }
        ]
      }
    }
  };

  var DESTINO_LPNS = {
    'B-02-01': {
      'LPN-9001': { hasSubLpn: true, subLpns: ['SUB-9001-A', 'SUB-9001-B'] },
      'LPN-9002': { hasSubLpn: false, subLpns: [] }
    },
    'B-02-02': {
      'LPN-9100': { hasSubLpn: false, subLpns: [] }
    },
    'C-01-01': {
      'LPN-9200': { hasSubLpn: true, subLpns: ['SUB-9200-1'] }
    }
  };

  /* Opciones siempre disponibles en dropdowns (cualquier localidad abierta se acepta). */
  var ALL_ORIGEN_LPNS = collectAllOrigenLpns();
  var ALL_DESTINO_LPNS = collectAllDestinoLpns();
  var ALL_PRODUCTOS = collectAllProductos();

  var TOAST_DURATION = 6000;
  var FORCE_ERROR_ONCE = false;

  function collectAllOrigenLpns() {
    var set = {};
    Object.keys(INVENTARIO).forEach(function (loc) {
      Object.keys(INVENTARIO[loc]).forEach(function (lpn) {
        set[lpn] = true;
      });
    });
    return Object.keys(set);
  }

  function collectAllDestinoLpns() {
    var set = {};
    Object.keys(DESTINO_LPNS).forEach(function (loc) {
      Object.keys(DESTINO_LPNS[loc]).forEach(function (lpn) {
        set[lpn] = true;
      });
    });
    return Object.keys(set);
  }

  function collectAllProductos() {
    var map = {};
    Object.keys(INVENTARIO).forEach(function (loc) {
      Object.keys(INVENTARIO[loc]).forEach(function (lpn) {
        var node = INVENTARIO[loc][lpn];
        var rows = [];
        if (node.hasSubLpn) {
          Object.keys(node.subLpns || {}).forEach(function (sub) {
            rows = rows.concat(node.subLpns[sub]);
          });
        } else {
          rows = node.products || [];
        }
        rows.forEach(function (r) {
          map[r.sku] = r.producto;
        });
      });
    });
    return Object.keys(map).map(function (sku) {
      return { value: sku, label: map[sku] };
    });
  }

  function $(id) {
    return document.getElementById(id);
  }

  function announce(msg) {
    var live = $('srLive');
    if (!live) return;
    live.textContent = '';
    window.setTimeout(function () {
      live.textContent = msg;
    }, 30);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showFieldError(fieldId, errId, message) {
    var field = $(fieldId);
    var err = $(errId);
    if (field) field.classList.add('is-invalid');
    if (err) {
      err.hidden = false;
      err.textContent = message;
    }
  }

  function clearFieldError(fieldId, errId) {
    var field = $(fieldId);
    var err = $(errId);
    if (field) field.classList.remove('is-invalid');
    if (err) {
      err.hidden = true;
      err.textContent = '';
    }
  }

  function setHidden(el, hidden) {
    if (!el) return;
    el.hidden = hidden;
    el.classList.toggle('is-hidden', hidden);
  }

  function fillSelect(select, options, placeholder) {
    if (!select) return;
    select.innerHTML = '';
    var empty = document.createElement('option');
    empty.value = '';
    empty.textContent = placeholder || 'Seleccione';
    select.appendChild(empty);
    (options || []).forEach(function (opt) {
      var o = document.createElement('option');
      o.value = typeof opt === 'string' ? opt : opt.value;
      o.textContent = typeof opt === 'string' ? opt : opt.label;
      select.appendChild(o);
    });
  }

  function ensureOption(select, value, label) {
    if (!value) return;
    var exists = Array.prototype.some.call(select.options, function (o) {
      return o.value === value;
    });
    if (!exists) {
      var o = document.createElement('option');
      o.value = value;
      o.textContent = label || value;
      select.appendChild(o);
    }
  }

  function fillDatalist(listEl, options) {
    if (!listEl) return;
    listEl.innerHTML = '';
    (options || []).forEach(function (opt) {
      var o = document.createElement('option');
      o.value = typeof opt === 'string' ? opt : opt.value;
      listEl.appendChild(o);
    });
  }

  function collectAllDestinoSubLpns() {
    var set = {};
    Object.keys(DESTINO_LPNS).forEach(function (loc) {
      Object.keys(DESTINO_LPNS[loc]).forEach(function (lpn) {
        (DESTINO_LPNS[loc][lpn].subLpns || []).forEach(function (sub) {
          set[sub] = true;
        });
      });
    });
    return Object.keys(set);
  }

  var ALL_DESTINO_SUBLPNS = collectAllDestinoSubLpns();

  function hasSubLpnSelectOptions() {
    var select = $('subLpnDestino');
    if (!select) return false;
    return Array.prototype.some.call(select.options, function (o) {
      return !!o.value;
    });
  }

  /**
   * Orden UI:
   * 1. Botón Crear SubLPN
   * 2. Campo abierto (solo si se creó / F3) — debajo del botón
   * 3. Dropdown SubLPN destino (siempre visible tras elegir LPN)
   *
   * Importante: no ocultar #subLpnDestinoSelectWrap (es el p-dropdown).
   * Solo se controla la visibilidad de #field-subLpnDestino.
   */
  function syncSubLpnDestinoControls() {
    var inputWrap = $('subLpnDestinoInputWrap');
    var field = $('field-subLpnDestino');
    var creating = state.destinoCreatingSub;
    var hasLpn = !!state.destinoLpn;

    setHidden(inputWrap, !creating);
    /* El dropdown se muestra siempre que haya LPN destino seleccionada */
    setHidden(field, !hasLpn);
  }

  function getSubLpnDestinoValue() {
    if (state.destinoCreatingSub) {
      return (($('subLpnDestinoInput') && $('subLpnDestinoInput').value) || '').trim();
    }
    return ($('subLpnDestino') && $('subLpnDestino').value) || '';
  }

  function focusSubLpnDestinoCreate() {
    var input = $('subLpnDestinoInput');
    if (input) {
      input.focus();
      input.select();
    }
  }

  function focusSubLpnDestino() {
    if (state.destinoCreatingSub) {
      focusSubLpnDestinoCreate();
      return;
    }
    var select = $('subLpnDestino');
    if (select && state.destinoLpn) select.focus();
  }

  function resolveDestinoSubLpnOptions() {
    var node = getDestinoNode();
    if (node && node.hasSubLpn && node.subLpns && node.subLpns.length) {
      return { options: node.subLpns.slice(), required: true };
    }
    /* Fallback: opciones demo para que el dropdown siempre se despliegue */
    return { options: ALL_DESTINO_SUBLPNS.slice(), required: false };
  }

  function showSubLpnDestinoField(options, hint) {
    var list = options && options.length ? options : ALL_DESTINO_SUBLPNS.slice();
    fillSelect($('subLpnDestino'), list, 'Seleccione');
    /* Forzar visible: evita que caché vieja / estados residuales dejen el campo oculto */
    setHidden($('field-subLpnDestino'), false);
    setHidden($('subLpnDestinoInputWrap'), !state.destinoCreatingSub);
    if (hint && $('subLpnDestinoHint')) $('subLpnDestinoHint').textContent = hint;
    if ($('btnCrearSubLpn')) {
      $('btnCrearSubLpn').disabled = false;
      $('btnCrearSubLpn').setAttribute('aria-disabled', 'false');
    }
  }

  var state = {
    origenLoc: '',
    origenLpn: '',
    origenHasSub: false,
    origenSubLpn: '',
    productoSku: '',
    inventoryRows: [],
    reubicarRows: [],
    selectedInvId: null,
    selectedReubicarId: null,
    qtyMax: 0,
    destinoLoc: '',
    destinoLpn: '',
    destinoHasSub: false,
    destinoCreatingSub: false,
    destinoSubLpn: ''
  };

  var toastTimer = null;

  function showToast(type, title, text) {
    var region = $('toastRegion');
    region.innerHTML = '';
    window.clearTimeout(toastTimer);

    var toast = document.createElement('div');
    toast.className = 'toast toast--' + type;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');

    var iconSvg =
      type === 'success'
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';

    toast.innerHTML =
      '<div class="toast__top">' +
        '<span class="toast__icon" aria-hidden="true">' + iconSvg + '</span>' +
        '<div class="toast__content">' +
          '<p class="toast__title">' + escapeHtml(title) + '</p>' +
          (text ? '<p class="toast__text">' + escapeHtml(text) + '</p>' : '') +
        '</div>' +
        '<button type="button" class="toast__close" aria-label="Cerrar notificación">' +
          '<i class="pi pi-times" aria-hidden="true"></i>' +
        '</button>' +
      '</div>' +
      '<span class="toast__progress" aria-hidden="true"></span>';

    var progress = toast.querySelector('.toast__progress');
    var remaining = TOAST_DURATION;
    var startedAt = Date.now();

    function dismiss() {
      window.clearTimeout(toastTimer);
      toast.remove();
    }

    function pause() {
      window.clearTimeout(toastTimer);
      remaining -= Date.now() - startedAt;
      if (progress) progress.style.animationPlayState = 'paused';
    }

    function resume() {
      if (remaining <= 0) return;
      startedAt = Date.now();
      if (progress) progress.style.animationPlayState = 'running';
      toastTimer = window.setTimeout(dismiss, remaining);
    }

    toast.querySelector('.toast__close').addEventListener('click', dismiss);
    toast.addEventListener('mouseenter', pause);
    toast.addEventListener('mouseleave', resume);
    toast.addEventListener('focusin', pause);
    toast.addEventListener('focusout', resume);

    region.appendChild(toast);
    toastTimer = window.setTimeout(dismiss, remaining);
    announce(title + (text ? '. ' + text : ''));
  }

  function findOrigenLpnNode(lpn) {
    var locs = Object.keys(INVENTARIO);
    for (var i = 0; i < locs.length; i++) {
      if (INVENTARIO[locs[i]][lpn]) return INVENTARIO[locs[i]][lpn];
    }
    return null;
  }

  function getOrigenLpnNode() {
    if (!state.origenLpn) return null;
    if (state.origenLoc && INVENTARIO[state.origenLoc] && INVENTARIO[state.origenLoc][state.origenLpn]) {
      return INVENTARIO[state.origenLoc][state.origenLpn];
    }
    return findOrigenLpnNode(state.origenLpn);
  }

  function findDestinoLpnNode(lpn) {
    var locs = Object.keys(DESTINO_LPNS);
    for (var i = 0; i < locs.length; i++) {
      if (DESTINO_LPNS[locs[i]][lpn]) return DESTINO_LPNS[locs[i]][lpn];
    }
    return null;
  }

  function getDestinoNode() {
    if (!state.destinoLpn) return null;
    if (state.destinoLoc && DESTINO_LPNS[state.destinoLoc] && DESTINO_LPNS[state.destinoLoc][state.destinoLpn]) {
      return DESTINO_LPNS[state.destinoLoc][state.destinoLpn];
    }
    return findDestinoLpnNode(state.destinoLpn);
  }

  function syntheticInventoryRow(productoLabel, sku) {
    return {
      id: 'inv-custom',
      producto: productoLabel,
      sku: sku || productoLabel,
      cantidad: 1,
      lote: '—',
      serial: '—',
      attr1: '—',
      attr2: '—',
      attr3: '—',
      estatus: 'Disponible'
    };
  }

  function clearProductoEstatus() {
    var wrap = $('productoEstatus');
    var value = $('productoEstatusValue');
    if (value) value.textContent = '';
    if (wrap) setHidden(wrap, true);
  }

  function showProductoEstatus() {
    var wrap = $('productoEstatus');
    var value = $('productoEstatusValue');
    if (!wrap || !value) return;
    value.textContent = 'Disponible';
    setHidden(wrap, false);
  }

  function resetProductoAndDetail() {
    state.productoSku = '';
    state.inventoryRows = [];
    state.reubicarRows = [];
    state.selectedInvId = null;
    state.selectedReubicarId = null;
    state.qtyMax = 0;
    state._allRowsForLpn = [];
    var producto = $('producto');
    fillSelect(producto, [], 'Seleccione');
    producto.disabled = true;
    producto.value = '';
    clearProductoEstatus();
    setHidden($('invDetail'), true);
    setHidden($('invReubicar'), true);
    renderReubicarTable([]);
    $('cantidadReubicar').value = '';
    clearFieldError('field-producto', 'err-producto');
    clearFieldError('field-cantidad', 'err-cantidad');
    updateReubicarButton();
  }

  function resetSubLpnOrigen() {
    state.origenHasSub = false;
    state.origenSubLpn = '';
    var field = $('field-subLpnOrigen');
    var select = $('subLpnOrigen');
    fillSelect(select, [], 'Opcional');
    select.value = '';
    setHidden(field, true);
    clearFieldError('field-subLpnOrigen', 'err-subLpnOrigen');
  }

  function onLocalidadOrigenChange() {
    var raw = $('locOrigen').value.trim();
    $('locOrigen').value = raw;
    clearFieldError('field-locOrigen', 'err-locOrigen');

    state.origenLoc = '';
    state.origenLpn = '';
    resetSubLpnOrigen();
    resetProductoAndDetail();

    var lpnSelect = $('lpnOrigen');
    fillSelect(lpnSelect, [], 'Seleccione');
    lpnSelect.disabled = true;
    lpnSelect.value = '';

    if (!raw) {
      updateReubicarButton();
      return;
    }

    state.origenLoc = raw;
    var lpns =
      INVENTARIO[raw] && Object.keys(INVENTARIO[raw]).length
        ? Object.keys(INVENTARIO[raw])
        : ALL_ORIGEN_LPNS;
    fillSelect(lpnSelect, lpns, 'Seleccione');
    lpnSelect.disabled = false;
    announce('Localidad origen capturada. Seleccione LPN.');
    updateReubicarButton();
  }

  function onLpnOrigenChange() {
    var lpn = $('lpnOrigen').value;
    clearFieldError('field-lpnOrigen', 'err-lpnOrigen');
    state.origenLpn = lpn;
    resetSubLpnOrigen();
    resetProductoAndDetail();

    if (!lpn) {
      updateReubicarButton();
      return;
    }

    var node = getOrigenLpnNode();
    if (node && node.hasSubLpn) {
      state.origenHasSub = true;
      fillSelect($('subLpnOrigen'), Object.keys(node.subLpns || {}), 'Opcional');
      setHidden($('field-subLpnOrigen'), false);
      enableProductoField();
      announce('La LPN contiene SubLPNs. Puede ingresar SubLPN u opcionalmente producto.');
    } else {
      state.origenHasSub = false;
      setHidden($('field-subLpnOrigen'), true);
      enableProductoField();
      announce('Seleccione producto.');
    }
    updateReubicarButton();
  }

  function onSubLpnOrigenChange() {
    var sub = $('subLpnOrigen').value;
    clearFieldError('field-subLpnOrigen', 'err-subLpnOrigen');
    state.origenSubLpn = sub;
    resetProductoAndDetail();
    enableProductoField();
    announce(sub ? 'SubLPN capturada. Seleccione producto.' : 'SubLPN opcional. Puede seleccionar producto.');
    updateReubicarButton();
  }

  function collectRowsFromOrigen() {
    var node = getOrigenLpnNode();
    if (!node) return [];

    if (node.hasSubLpn) {
      if (state.origenSubLpn && node.subLpns[state.origenSubLpn]) {
        return node.subLpns[state.origenSubLpn].slice();
      }
      var all = [];
      Object.keys(node.subLpns || {}).forEach(function (key) {
        all = all.concat(node.subLpns[key]);
      });
      return all;
    }

    return (node.products || []).slice();
  }

  function enableProductoField() {
    var rows = collectRowsFromOrigen();
    state._allRowsForLpn = rows;

    var options;
    if (rows.length) {
      var seen = {};
      options = [];
      rows.forEach(function (r) {
        if (!seen[r.sku]) {
          seen[r.sku] = true;
          options.push({ value: r.sku, label: r.producto });
        }
      });
    } else {
      options = ALL_PRODUCTOS.slice();
    }

    var producto = $('producto');
    fillSelect(producto, options, 'Seleccione');
    producto.disabled = false;
  }

  function onProductoChange() {
    var sku = $('producto').value;
    clearFieldError('field-producto', 'err-producto');
    state.productoSku = sku;
    state.selectedInvId = null;
    state.selectedReubicarId = null;
    state.qtyMax = 0;
    state.reubicarRows = [];
    $('cantidadReubicar').value = '';
    clearProductoEstatus();
    renderReubicarTable([]);
    setHidden($('invReubicar'), true);

    if (!sku) {
      setHidden($('invDetail'), true);
      updateReubicarButton();
      return;
    }

    var label =
      ($('producto').selectedOptions[0] && $('producto').selectedOptions[0].textContent) || sku;

    var rows = (state._allRowsForLpn || []).filter(function (r) {
      return r.sku === sku;
    });

    if (!rows.length) {
      rows = [syntheticInventoryRow(label, sku)];
    }

    state.inventoryRows = rows;
    renderInventoryTable(rows);
    setHidden($('invDetail'), false);
    $('invDetail').classList.remove('is-collapsed');
    $('btnToggleInv').setAttribute('aria-expanded', 'true');
    $('btnToggleInv').querySelector('i').className = 'pi pi-minus';

    if (rows.length === 1) {
      selectInventoryRow(rows[0].id);
    }

    announce('Detalle de inventario mostrado.');
    updateReubicarButton();
  }

  function renderInventoryTable(rows) {
    var tbody = $('invTableBody');
    var globalFilter = ($('filtroGlobal').value || '').trim().toLowerCase();
    var colFilters = {};
    document.querySelectorAll('#invTable .inv-col-filter').forEach(function (input) {
      colFilters[input.getAttribute('data-col')] = (input.value || '').trim().toLowerCase();
    });

    var filtered = rows.filter(function (r) {
      var blob = [
        r.producto, r.cantidad, r.lote, r.serial, r.attr1, r.attr2, r.attr3
      ].join(' ').toLowerCase();

      if (globalFilter && blob.indexOf(globalFilter) === -1) return false;
      if (colFilters.producto && r.producto.toLowerCase().indexOf(colFilters.producto) === -1) return false;
      if (colFilters.cantidad && String(r.cantidad).indexOf(colFilters.cantidad) === -1) return false;
      if (colFilters.lote && r.lote.toLowerCase().indexOf(colFilters.lote) === -1) return false;
      if (colFilters.serial && r.serial.toLowerCase().indexOf(colFilters.serial) === -1) return false;
      if (colFilters.attr1 && r.attr1.toLowerCase().indexOf(colFilters.attr1) === -1) return false;
      if (colFilters.attr2 && r.attr2.toLowerCase().indexOf(colFilters.attr2) === -1) return false;
      if (colFilters.attr3 && r.attr3.toLowerCase().indexOf(colFilters.attr3) === -1) return false;
      return true;
    });

    if (!filtered.length) {
      tbody.innerHTML =
        '<tr><td colspan="8" class="inv-empty">Sin registros que coincidan con el filtro.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered
      .map(function (r) {
        var selected = state.selectedInvId === r.id ? ' is-selected' : '';
        return (
          '<tr class="' +
          selected +
          '" data-id="' +
          escapeHtml(r.id) +
          '" tabindex="0" role="row" aria-selected="' +
          (state.selectedInvId === r.id ? 'true' : 'false') +
          '">' +
          '<td title="' + escapeHtml(r.producto) + '">' + escapeHtml(r.producto) + '</td>' +
          '<td>' + escapeHtml(r.cantidad) + '</td>' +
          '<td>' + escapeHtml(r.lote) + '</td>' +
          '<td>' + escapeHtml(r.serial) + '</td>' +
          '<td title="' + escapeHtml(r.attr1) + '">' + escapeHtml(r.attr1) + '</td>' +
          '<td title="' + escapeHtml(r.attr2) + '">' + escapeHtml(r.attr2) + '</td>' +
          '<td title="' + escapeHtml(r.attr3) + '">' + escapeHtml(r.attr3) + '</td>' +
          '<td class="inv-td-columns" aria-hidden="true"></td>' +
          '</tr>'
        );
      })
      .join('');
  }

  function syncReubicarFromSelection() {
    var row = state.inventoryRows.find(function (r) {
      return r.id === state.selectedInvId;
    });
    if (!row) {
      state.reubicarRows = [];
      state.selectedReubicarId = null;
      renderReubicarTable([]);
      setHidden($('invReubicar'), true);
      return;
    }

    var qty = Number($('cantidadReubicar').value) || row.cantidad;
    var entry = {
      id: row.id,
      producto: row.producto,
      sku: row.sku,
      cantidad: qty,
      lote: row.lote,
      serial: row.serial,
      attr1: row.attr1,
      attr2: row.attr2,
      attr3: row.attr3,
      estatus: row.estatus
    };

    state.reubicarRows = [entry];
    state.selectedReubicarId = entry.id;
    renderReubicarTable(state.reubicarRows);
    setHidden($('invReubicar'), false);
    $('invReubicar').classList.remove('is-collapsed');
    var toggle = $('btnToggleInvReubicar');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'true');
      var icon = toggle.querySelector('i');
      if (icon) icon.className = 'pi pi-minus';
    }
  }

  function renderReubicarTable(rows) {
    var tbody = $('invReubicarBodyTable');
    if (!tbody) return;

    var globalFilter = (($('filtroGlobalReubicar') && $('filtroGlobalReubicar').value) || '').trim().toLowerCase();
    var colFilters = {};
    document.querySelectorAll('.inv-col-filter--reubicar').forEach(function (input) {
      colFilters[input.getAttribute('data-col')] = (input.value || '').trim().toLowerCase();
    });

    var filtered = (rows || []).filter(function (r) {
      var blob = [
        r.producto, r.cantidad, r.lote, r.serial, r.attr1, r.attr2, r.attr3
      ].join(' ').toLowerCase();

      if (globalFilter && blob.indexOf(globalFilter) === -1) return false;
      if (colFilters.producto && r.producto.toLowerCase().indexOf(colFilters.producto) === -1) return false;
      if (colFilters.cantidad && String(r.cantidad).indexOf(colFilters.cantidad) === -1) return false;
      if (colFilters.lote && r.lote.toLowerCase().indexOf(colFilters.lote) === -1) return false;
      if (colFilters.serial && r.serial.toLowerCase().indexOf(colFilters.serial) === -1) return false;
      if (colFilters.attr1 && r.attr1.toLowerCase().indexOf(colFilters.attr1) === -1) return false;
      if (colFilters.attr2 && r.attr2.toLowerCase().indexOf(colFilters.attr2) === -1) return false;
      if (colFilters.attr3 && r.attr3.toLowerCase().indexOf(colFilters.attr3) === -1) return false;
      return true;
    });

    if (!filtered.length) {
      tbody.innerHTML =
        '<tr><td colspan="8" class="inv-empty">Sin inventario a reubicar.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered
      .map(function (r) {
        var selected = state.selectedReubicarId === r.id ? ' is-selected' : '';
        return (
          '<tr class="' +
          selected +
          '" data-id="' +
          escapeHtml(r.id) +
          '" tabindex="0" role="row">' +
          '<td title="' + escapeHtml(r.producto) + '">' + escapeHtml(r.producto) + '</td>' +
          '<td>' + escapeHtml(r.cantidad) + '</td>' +
          '<td>' + escapeHtml(r.lote) + '</td>' +
          '<td>' + escapeHtml(r.serial) + '</td>' +
          '<td title="' + escapeHtml(r.attr1) + '">' + escapeHtml(r.attr1) + '</td>' +
          '<td title="' + escapeHtml(r.attr2) + '">' + escapeHtml(r.attr2) + '</td>' +
          '<td title="' + escapeHtml(r.attr3) + '">' + escapeHtml(r.attr3) + '</td>' +
          '<td class="inv-td-actions">' +
            '<button type="button" class="inv-retirar-btn" data-retirar-id="' +
            escapeHtml(r.id) +
            '" aria-label="Retirar ' +
            escapeHtml(r.producto) +
            '">' +
              '<i class="pi pi-arrow-left" aria-hidden="true"></i>' +
            '</button>' +
          '</td>' +
          '</tr>'
        );
      })
      .join('');
  }

  function retirarReubicarRow(id) {
    state.reubicarRows = state.reubicarRows.filter(function (r) {
      return r.id !== id;
    });
    if (state.selectedReubicarId === id) state.selectedReubicarId = null;
    if (state.selectedInvId === id) {
      state.selectedInvId = null;
      clearProductoEstatus();
      $('cantidadReubicar').value = '';
      renderInventoryTable(state.inventoryRows);
    }
    renderReubicarTable(state.reubicarRows);
    if (!state.reubicarRows.length) {
      setHidden($('invReubicar'), true);
    }
    announce('Inventario retirado de la reubicación.');
    updateReubicarButton();
  }

  function selectInventoryRow(id) {
    var row = state.inventoryRows.find(function (r) {
      return r.id === id;
    });
    if (!row) return;

    state.selectedInvId = id;
    state.qtyMax = row.cantidad;
    $('cantidadReubicar').value = String(row.cantidad);
    $('cantidadReubicar').max = String(row.cantidad);
    clearFieldError('field-cantidad', 'err-cantidad');
    showProductoEstatus();
    renderInventoryTable(state.inventoryRows);
    syncReubicarFromSelection();
    updateReubicarButton();
  }

  function resetDestinoSubLpn(full) {
    if (full) {
      state.destinoCreatingSub = false;
    }
    state.destinoHasSub = false;
    state.destinoSubLpn = '';
    fillSelect($('subLpnDestino'), [], 'Seleccione');
    $('subLpnDestino').value = '';
    if ($('subLpnDestinoInput')) $('subLpnDestinoInput').value = '';
    syncSubLpnDestinoControls();
    setHidden($('field-subLpnDestino'), true);
    setHidden($('subLpnDestinoInputWrap'), true);
    clearFieldError('field-subLpnDestino', 'err-subLpnDestino');
    if ($('subLpnDestinoHint')) {
      $('subLpnDestinoHint').textContent = 'Selecciona una SubLPN existente del listado.';
    }
    $('btnCrearSubLpn').disabled = true;
    $('btnCrearSubLpn').setAttribute('aria-disabled', 'true');
  }

  function onLocalidadDestinoChange() {
    var raw = $('locDestino').value.trim();
    $('locDestino').value = raw;
    clearFieldError('field-locDestino', 'err-locDestino');

    state.destinoLoc = '';
    state.destinoLpn = '';
    resetDestinoSubLpn(true);

    var lpnSelect = $('lpnDestino');
    fillSelect(lpnSelect, [], 'Seleccione');
    lpnSelect.disabled = true;
    lpnSelect.value = '';

    if (!raw) {
      updateReubicarButton();
      return;
    }

    state.destinoLoc = raw;
    var lpns =
      DESTINO_LPNS[raw] && Object.keys(DESTINO_LPNS[raw]).length
        ? Object.keys(DESTINO_LPNS[raw])
        : ALL_DESTINO_LPNS;
    fillSelect(lpnSelect, lpns, 'Seleccione');
    lpnSelect.disabled = false;
    announce('Localidad destino capturada. Seleccione LPN destino.');
    updateReubicarButton();
  }

  function onLpnDestinoChange() {
    var lpn = $('lpnDestino').value;
    clearFieldError('field-lpnDestino', 'err-lpnDestino');
    state.destinoCreatingSub = false;
    state.destinoSubLpn = '';
    state.destinoHasSub = false;
    if ($('subLpnDestinoInput')) $('subLpnDestinoInput').value = '';
    setHidden($('subLpnDestinoInputWrap'), true);
    clearFieldError('field-subLpnDestino', 'err-subLpnDestino');

    state.destinoLpn = lpn;

    if (!lpn) {
      fillSelect($('subLpnDestino'), [], 'Seleccione');
      if ($('btnCrearSubLpn')) {
        $('btnCrearSubLpn').disabled = true;
        $('btnCrearSubLpn').setAttribute('aria-disabled', 'true');
      }
      setHidden($('field-subLpnDestino'), true);
      updateReubicarButton();
      return;
    }

    var resolved = resolveDestinoSubLpnOptions();
    state.destinoHasSub = resolved.required;
    showSubLpnDestinoField(
      resolved.options,
      'Selecciona una SubLPN existente del listado.'
    );
    announce('SubLPN destino disponible. Selecciona una o crea una nueva con el botón.');
    updateReubicarButton();
  }

  function activateCrearSubLpn() {
    if (!$('lpnDestino').value) {
      showFieldError('field-lpnDestino', 'err-lpnDestino', 'Seleccione primero la LPN destino.');
      $('lpnDestino').focus();
      return;
    }

    state.destinoCreatingSub = true;
    state.destinoLpn = $('lpnDestino').value;

    var resolved = resolveDestinoSubLpnOptions();
    if (resolved.required) state.destinoHasSub = true;

    if ($('subLpnDestino')) $('subLpnDestino').value = '';
    if ($('subLpnDestinoInput')) $('subLpnDestinoInput').value = '';
    state.destinoSubLpn = '';

    fillSelect($('subLpnDestino'), resolved.options.length ? resolved.options : ALL_DESTINO_SUBLPNS.slice(), 'Seleccione');
    setHidden($('field-subLpnDestino'), false);
    setHidden($('subLpnDestinoInputWrap'), false);
    if ($('btnCrearSubLpn')) {
      $('btnCrearSubLpn').disabled = false;
      $('btnCrearSubLpn').setAttribute('aria-disabled', 'false');
    }

    clearFieldError('field-subLpnDestino', 'err-subLpnDestino');
    focusSubLpnDestinoCreate();
    announce('Campo abierto debajo del botón para crear SubLPN.');
    updateReubicarButton();
  }

  function onSubLpnDestinoSelectChange() {
    clearFieldError('field-subLpnDestino', 'err-subLpnDestino');
    /* Al usar el dropdown, el campo abierto desaparece */
    state.destinoCreatingSub = false;
    if ($('subLpnDestinoInput')) $('subLpnDestinoInput').value = '';
    setHidden($('subLpnDestinoInputWrap'), true);
    state.destinoSubLpn = getSubLpnDestinoValue();
    updateReubicarButton();
  }

  function hideCreateSubLpnField() {
    if (!state.destinoCreatingSub) return;
    state.destinoCreatingSub = false;
    if ($('subLpnDestinoInput')) $('subLpnDestinoInput').value = '';
    setHidden($('subLpnDestinoInputWrap'), true);
    state.destinoSubLpn = getSubLpnDestinoValue();
    updateReubicarButton();
  }

  function onSubLpnDestinoInputChange() {
    clearFieldError('field-subLpnDestino', 'err-subLpnDestino');
    state.destinoCreatingSub = true;
    if ($('subLpnDestino')) $('subLpnDestino').value = '';
    state.destinoSubLpn = getSubLpnDestinoValue();
    updateReubicarButton();
  }

  function isOrigenComplete() {
    if (!state.origenLoc || !state.origenLpn) return false;
    if (!state.productoSku || !state.selectedInvId) return false;
    if (!state.reubicarRows.length) return false;

    var qty = Number($('cantidadReubicar').value);
    if (!qty || qty < 1) return false;
    return true;
  }

  function isDestinoComplete() {
    if (!state.destinoLoc || !state.destinoLpn) return false;

    var typed = (($('subLpnDestinoInput') && $('subLpnDestinoInput').value) || '').trim();
    var needsSub = state.destinoHasSub || state.destinoCreatingSub || !!typed;
    if (needsSub && !getSubLpnDestinoValue()) return false;

    return true;
  }

  function updateReubicarButton() {
    var btn = $('btnReubicar');
    var ok = isOrigenComplete() && isDestinoComplete();
    btn.disabled = !ok;
    btn.setAttribute('aria-disabled', ok ? 'false' : 'true');
  }

  function validateCantidad() {
    clearFieldError('field-cantidad', 'err-cantidad');
    var qty = Number($('cantidadReubicar').value);
    if (!state.selectedInvId) {
      showFieldError('field-cantidad', 'err-cantidad', 'Seleccione un registro de inventario.');
      return false;
    }
    if (!qty || qty < 1) {
      showFieldError('field-cantidad', 'err-cantidad', 'Indique una cantidad válida.');
      return false;
    }
    return true;
  }

  function confirmarReubicacion() {
    clearFieldError('field-locOrigen', 'err-locOrigen');
    clearFieldError('field-lpnOrigen', 'err-lpnOrigen');
    clearFieldError('field-subLpnOrigen', 'err-subLpnOrigen');
    clearFieldError('field-producto', 'err-producto');
    clearFieldError('field-locDestino', 'err-locDestino');
    clearFieldError('field-lpnDestino', 'err-lpnDestino');
    clearFieldError('field-subLpnDestino', 'err-subLpnDestino');

    if (!state.origenLoc) {
      showFieldError('field-locOrigen', 'err-locOrigen', 'Localidad origen requerida.');
      $('locOrigen').focus();
      return;
    }
    if (!state.origenLpn) {
      showFieldError('field-lpnOrigen', 'err-lpnOrigen', 'LPN origen requerida.');
      $('lpnOrigen').focus();
      return;
    }
    if (!state.productoSku || !state.selectedInvId) {
      showFieldError('field-producto', 'err-producto', 'Seleccione producto e inventario.');
      $('producto').focus();
      return;
    }
    if (!validateCantidad()) {
      $('cantidadReubicar').focus();
      return;
    }
    if (!state.destinoLoc) {
      showFieldError('field-locDestino', 'err-locDestino', 'Localidad destino requerida.');
      $('locDestino').focus();
      return;
    }
    if (!state.destinoLpn) {
      showFieldError('field-lpnDestino', 'err-lpnDestino', 'LPN destino requerida.');
      $('lpnDestino').focus();
      return;
    }
    if ((state.destinoHasSub || state.destinoCreatingSub) && !getSubLpnDestinoValue()) {
      showFieldError('field-subLpnDestino', 'err-subLpnDestino', 'SubLPN destino requerida.');
      focusSubLpnDestino();
      return;
    }

    state.destinoSubLpn = getSubLpnDestinoValue();

    if (FORCE_ERROR_ONCE) {
      FORCE_ERROR_ONCE = false;
      showToast('error', 'No fue posible realizar la reubicación.');
      return;
    }

    var movimiento = {
      tipo: 'REUBICACION_PRODUCTO',
      timestamp: new Date().toISOString(),
      origen: {
        localidad: state.origenLoc,
        lpn: state.origenLpn,
        subLpn: state.origenSubLpn || null
      },
      destino: {
        localidad: state.destinoLoc,
        lpn: state.destinoLpn,
        subLpn: state.destinoSubLpn || null,
        subLpnCreada:
          state.destinoCreatingSub &&
          !!(($('subLpnDestinoInput') && $('subLpnDestinoInput').value) || '').trim()
      },
      producto: state.productoSku,
      inventarioId: state.selectedInvId,
      cantidad: Number($('cantidadReubicar').value)
    };
    console.info('[Histórico de Movimientos]', movimiento);

    showToast('success', 'La reubicación se realizó correctamente.');
    window.setTimeout(resetForm, 1200);
  }

  function resetForm() {
    $('reubicarForm').reset();
    state = {
      origenLoc: '',
      origenLpn: '',
      origenHasSub: false,
      origenSubLpn: '',
      productoSku: '',
      inventoryRows: [],
      reubicarRows: [],
      selectedInvId: null,
      selectedReubicarId: null,
      qtyMax: 0,
      destinoLoc: '',
      destinoLpn: '',
      destinoHasSub: false,
      destinoCreatingSub: false,
      destinoSubLpn: ''
    };

    fillSelect($('lpnOrigen'), [], 'Seleccione');
    $('lpnOrigen').disabled = true;
    fillSelect($('producto'), [], 'Seleccione');
    $('producto').disabled = true;
    fillSelect($('lpnDestino'), [], 'Seleccione');
    $('lpnDestino').disabled = true;
    resetSubLpnOrigen();
    resetDestinoSubLpn(true);
    clearProductoEstatus();
    setHidden($('invDetail'), true);
    setHidden($('invReubicar'), true);
    renderReubicarTable([]);
    $('btnCrearSubLpn').disabled = true;
    $('btnCrearSubLpn').setAttribute('aria-disabled', 'true');
    updateReubicarButton();
    announce('Formulario reiniciado.');
  }

  function init() {
    $('locOrigen').addEventListener('change', onLocalidadOrigenChange);
    $('locOrigen').addEventListener('blur', onLocalidadOrigenChange);
    $('btnSearchLocOrigen').addEventListener('click', function () {
      onLocalidadOrigenChange();
      if (state.origenLoc) $('lpnOrigen').focus();
      else $('locOrigen').focus();
    });

    $('lpnOrigen').addEventListener('change', onLpnOrigenChange);
    $('subLpnOrigen').addEventListener('change', onSubLpnOrigenChange);
    $('producto').addEventListener('change', onProductoChange);

    $('locDestino').addEventListener('change', onLocalidadDestinoChange);
    $('locDestino').addEventListener('blur', onLocalidadDestinoChange);
    $('btnSearchLocDestino').addEventListener('click', function () {
      onLocalidadDestinoChange();
      if (state.destinoLoc) $('lpnDestino').focus();
      else $('locDestino').focus();
    });

    $('lpnDestino').addEventListener('change', onLpnDestinoChange);
    $('subLpnDestino').addEventListener('change', onSubLpnDestinoSelectChange);
    $('subLpnDestino').addEventListener('mousedown', hideCreateSubLpnField);
    $('subLpnDestino').addEventListener('focus', hideCreateSubLpnField);
    $('subLpnDestinoInput').addEventListener('input', onSubLpnDestinoInputChange);
    $('subLpnDestinoInput').addEventListener('change', onSubLpnDestinoInputChange);

    $('btnCrearSubLpn').addEventListener('click', activateCrearSubLpn);

    $('cantidadReubicar').addEventListener('input', function () {
      validateCantidad();
      if (state.selectedInvId) syncReubicarFromSelection();
      updateReubicarButton();
    });

    $('filtroGlobal').addEventListener('input', function () {
      renderInventoryTable(state.inventoryRows);
    });
    document.querySelectorAll('#invTable .inv-col-filter').forEach(function (input) {
      input.addEventListener('input', function () {
        renderInventoryTable(state.inventoryRows);
      });
    });

    if ($('filtroGlobalReubicar')) {
      $('filtroGlobalReubicar').addEventListener('input', function () {
        renderReubicarTable(state.reubicarRows);
      });
    }
    document.querySelectorAll('.inv-col-filter--reubicar').forEach(function (input) {
      input.addEventListener('input', function () {
        renderReubicarTable(state.reubicarRows);
      });
    });

    $('invTableBody').addEventListener('click', function (e) {
      var tr = e.target.closest('tr[data-id]');
      if (tr) selectInventoryRow(tr.getAttribute('data-id'));
    });
    $('invTableBody').addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var tr = e.target.closest('tr[data-id]');
      if (!tr) return;
      e.preventDefault();
      selectInventoryRow(tr.getAttribute('data-id'));
    });

    $('invReubicarBodyTable').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-retirar-id]');
      if (btn) {
        e.preventDefault();
        retirarReubicarRow(btn.getAttribute('data-retirar-id'));
        return;
      }
      var tr = e.target.closest('tr[data-id]');
      if (tr) {
        state.selectedReubicarId = tr.getAttribute('data-id');
        renderReubicarTable(state.reubicarRows);
      }
    });

    $('btnToggleInv').addEventListener('click', function () {
      var detail = $('invDetail');
      var collapsed = detail.classList.toggle('is-collapsed');
      $('btnToggleInv').setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      $('btnToggleInv').querySelector('i').className = collapsed ? 'pi pi-plus' : 'pi pi-minus';
    });

    if ($('btnToggleInvReubicar')) {
      $('btnToggleInvReubicar').addEventListener('click', function () {
        var detail = $('invReubicar');
        var collapsed = detail.classList.toggle('is-collapsed');
        $('btnToggleInvReubicar').setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        $('btnToggleInvReubicar').querySelector('i').className = collapsed ? 'pi pi-plus' : 'pi pi-minus';
      });
    }

    $('btnReubicar').addEventListener('click', function (e) {
      if (e.shiftKey) FORCE_ERROR_ONCE = true;
      confirmarReubicacion();
    });

    $('btnCancelar').addEventListener('click', function () {
      resetForm();
      $('locOrigen').focus();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'F3') return;
      e.preventDefault();
      if ($('btnCrearSubLpn').disabled) {
        showToast('error', 'Acción no disponible', 'Seleccione primero la LPN destino.');
        return;
      }
      activateCrearSubLpn();
    });

    updateReubicarButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
