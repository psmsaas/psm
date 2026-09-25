/*!
 * PSM Guard — control de suscripción para sitios de clientes.
 * Uso (pegar antes de </body> en el sitio del cliente):
 *   <script src="https://psmsaas.pages.dev/psm-guard.js" data-cliente="ID_DEL_CLIENTE" defer></script>
 * Si la fecha de vencimiento del cliente ya pasó, el sitio queda cubierto por el aviso de suspensión.
 * Si no se puede leer el estado (sin internet, error), el sitio sigue funcionando normalmente.
 */
(function () {
    var script = document.currentScript || document.querySelector('script[data-cliente]');
    if (!script) return;
    var clienteId = script.getAttribute('data-cliente');
    var base = script.src.replace(/psm-guard\.js.*$/, '');
    var WHATSAPP = '543454956044';

    fetch(base + 'clientes.json?t=' + Date.now(), { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
            if (!data || !data.clientes) return;
            var c = data.clientes.find(function (x) { return x.id === clienteId; });
            if (!c || !c.vence) return;
            if (Date.now() >= new Date(c.vence).getTime()) suspender(c);
        })
        .catch(function () { /* ante cualquier error, no se bloquea el sitio */ });

    function suspender(c) {
        var msg = encodeURIComponent('Hola PSM, quiero reactivar el sitio "' + c.nombre + '".');
        var css =
            '#psm-suspendido{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:16px;' +
            'background:radial-gradient(ellipse at top,#2c2530 0%,#202225 55%,#000 100%);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#fff;overflow:auto}' +
            '#psm-suspendido *{box-sizing:border-box;margin:0}' +
            '#psm-suspendido .psm-card{width:100%;max-width:440px;background:#fff;color:#202225;border-radius:24px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.5);text-align:center;animation:psmIn .5s cubic-bezier(.2,.8,.2,1)}' +
            '#psm-suspendido .psm-bar{height:6px;background:#a85ca1}' +
            '#psm-suspendido .psm-body{padding:36px 28px 28px}' +
            '#psm-suspendido .psm-logo{width:84px;height:84px;margin:0 auto 20px;border-radius:50%;border:3px solid #a85ca1;padding:12px;background:#fff;box-shadow:0 0 0 8px rgba(168,92,161,.12)}' +
            '#psm-suspendido .psm-logo img{width:100%;height:100%;object-fit:contain}' +
            '#psm-suspendido .psm-tag{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#a85ca1;background:rgba(168,92,161,.1);padding:6px 12px;border-radius:999px;margin-bottom:14px}' +
            '#psm-suspendido .psm-dot{width:7px;height:7px;border-radius:50%;background:#a85ca1;animation:psmPulse 1.6s infinite}' +
            '#psm-suspendido h1{font-size:24px;line-height:1.25;font-weight:700;margin-bottom:10px;color:#202225}' +
            '#psm-suspendido p{font-size:15px;line-height:1.6;color:#555a61}' +
            '#psm-suspendido .psm-site{font-weight:600;color:#202225}' +
            '#psm-suspendido .psm-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:24px;padding:14px;border-radius:14px;background:#000;color:#fff;font-weight:600;font-size:15px;text-decoration:none;transition:background .2s}' +
            '#psm-suspendido .psm-btn:hover{background:#a85ca1}' +
            '#psm-suspendido .psm-foot{padding:14px;border-top:1px solid #eee;font-size:12px;color:#8a8f96;background:#fafafa}' +
            '#psm-suspendido .psm-foot a{color:#a85ca1;font-weight:600;text-decoration:none}' +
            '@keyframes psmIn{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}' +
            '@keyframes psmPulse{0%,100%{opacity:1}50%{opacity:.3}}';

        var style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);

        var el = document.createElement('div');
        el.id = 'psm-suspendido';
        el.setAttribute('role', 'alertdialog');
        el.setAttribute('aria-modal', 'true');
        el.innerHTML =
            '<div class="psm-card"><div class="psm-bar"></div><div class="psm-body">' +
            '<div class="psm-logo"><img src="' + base + 'psm.png" alt="PSM"></div>' +
            '<span class="psm-tag"><span class="psm-dot"></span>Sitio en pausa</span>' +
            '<h1>Este sitio está temporalmente fuera de servicio</h1>' +
            '<p>El servicio de <span class="psm-site"></span> se encuentra pausado por renovación pendiente del plan. ' +
            'Si sos el titular, escribinos y lo reactivamos en el momento.</p>' +
            '<a class="psm-btn" target="_blank" rel="noopener" href="https://wa.me/' + WHATSAPP + '?text=' + msg + '">Reactivar por WhatsApp</a>' +
            '</div><div class="psm-foot">Sitio desarrollado y gestionado por <a href="https://psmsaas.pages.dev/" target="_blank" rel="noopener">PSM</a></div></div>';
        el.querySelector('.psm-site').textContent = c.nombre;

        var montar = function () {
            document.body.appendChild(el);
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
        };
        if (document.body) montar(); else document.addEventListener('DOMContentLoaded', montar);
    }
})();
