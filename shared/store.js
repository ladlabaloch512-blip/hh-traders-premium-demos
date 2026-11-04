/* H.H Traders demos - shared store engine. One copy used by all 10 designs.
   State is namespaced per design: hh10_d<NN>_cart / _wish / _theme / _order */
(function () {
  "use strict";
  var D = (document.body && document.body.dataset.design) || "00";
  var K = { cart: "hh10_d" + D + "_cart", wish: "hh10_d" + D + "_wish", theme: "hh10_d" + D + "_theme", order: "hh10_d" + D + "_order" };
  var DATA = window.HH_DATA;
  var PRODUCTS = DATA.products;
  var CATS = {}; DATA.categories.forEach(function (c) { CATS[c.id] = c; });
  var fmt = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });
  function money(n) { return fmt.format(n); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function load(k, fb) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function byId(id) { for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i]; return PRODUCTS[0]; }
  function catImg(cat) { return CATS[cat].img; }
  function stars(r) { var f = Math.round(r); var s = ""; for (var i = 1; i <= 5; i++) s += i <= f ? "★" : '<span class="off">★</span>'; return '<span class="stars" aria-label="Rated ' + r + ' of 5">' + s + "</span>"; }
  var ICON_HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.7C6.4 17 3 13.6 3 9.9 3 7.2 5 5 7.6 5c1.7 0 3.4.9 4.4 2.4h0C13 5.9 14.7 5 16.4 5 19 5 21 7.2 21 9.9c0 3.7-3.4 7.1-9 10.8z"/></svg>';

  /* ---------- cart + wishlist state ---------- */
  var cart = load(K.cart, {});
  var wish = load(K.wish, []);
  function cartCount() { var n = 0; for (var k in cart) n += cart[k]; return n; }
  function cartSubtotal() { var s = 0; for (var k in cart) s += byId(+k).price * cart[k]; return s; }
  function shippingFor(sub) { return sub === 0 ? 0 : (sub >= 20000 ? 0 : 350); }
  function renderCounts(bump) {
    $$(".cartCount").forEach(function (el) { el.textContent = cartCount(); if (bump) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); } });
    $$(".wishCount").forEach(function (el) { el.textContent = wish.length; });
  }
  function syncWishButtons() { $$("[data-wish]").forEach(function (b) { var on = wish.indexOf(+b.dataset.wish) > -1; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); }); }

  /* ---------- toast ---------- */
  function toast(msg) {
    var box = $(".toasts"); if (!box) { box = document.createElement("div"); box.className = "toasts"; document.body.appendChild(box); }
    while (box.children.length >= 3) box.removeChild(box.firstChild);
    var t = document.createElement("div"); t.className = "toast"; t.textContent = msg; box.appendChild(t);
    setTimeout(function () { t.classList.add("bye"); setTimeout(function () { t.remove(); }, 320); }, 2400);
  }

  /* ---------- scroll lock (iOS-safe) ---------- */
  var lockedY = 0;
  function lockScroll() { lockedY = window.scrollY || 0; document.body.style.position = "fixed"; document.body.style.top = -lockedY + "px"; document.body.style.left = "0"; document.body.style.right = "0"; document.body.classList.add("locked"); }
  function unlockScroll() { document.body.style.position = ""; document.body.style.top = ""; document.body.style.left = ""; document.body.style.right = ""; document.body.classList.remove("locked"); window.scrollTo(0, lockedY); }

  /* ---------- drawers ---------- */
  function openDrawer(sel) { var d = $(sel); if (!d) return; $(".scrim").classList.add("on"); d.classList.add("on"); lockScroll(); if (sel === "#cartDrawer") renderDrawerCart(); }
  function closeDrawers() { $$(".drawer").forEach(function (d) { d.classList.remove("on"); }); var s = $(".scrim"); if (s) s.classList.remove("on"); if (document.body.classList.contains("locked")) unlockScroll(); }
  function renderDrawerCart() {
    var body = $("#cartItems"); if (!body) return;
    var ids = Object.keys(cart);
    if (!ids.length) { body.innerHTML = '<div class="emptyBox"><h3>Your cart is empty</h3><p>Add products from the shop to see them here.</p></div>'; }
    else body.innerHTML = ids.map(function (k) { var p = byId(+k); return cartRow(p, cart[k]); }).join("");
    var sub = cartSubtotal(), ship = shippingFor(sub);
    var foot = $("#cartTotals");
    if (foot) foot.innerHTML = '<div class="totrow"><span>Subtotal</span><span>' + money(sub) + '</span></div><div class="totrow"><span>Shipping</span><span>' + (ship === 0 && sub > 0 ? "Free" : money(ship)) + '</span></div><div class="totrow grand"><span>Total</span><span>' + money(sub + ship) + '</span></div>';
    var go = $("#drawerCheckout"); if (go) go.style.display = ids.length ? "" : "none";
  }
  function cartRow(p, q) {
    return '<div class="citem" data-row="' + p.id + '"><img src="' + catImg(p.cat) + '" alt=""><div class="ci-body"><h4>' + p.name + '</h4>' +
      '<div class="ci-row"><span class="qtyc"><button data-act="dec" data-id="' + p.id + '" aria-label="Decrease quantity">−</button><span class="qv">' + q + '</span><button data-act="inc" data-id="' + p.id + '" aria-label="Increase quantity">+</button></span>' +
      '<span class="ci-price">' + money(p.price * q) + '</span></div>' +
      '<button class="removeBtn" data-act="remove" data-id="' + p.id + '">Remove</button></div></div>';
  }

  /* ---------- add to cart + fly animation ---------- */
  function addToCart(id, qty, srcImg) {
    cart[id] = (cart[id] || 0) + (qty || 1); save(K.cart, cart);
    renderCounts(true); renderDrawerCart();
    var p = byId(id);
    if (srcImg) flyToCart(srcImg); else bumpBadge();
    toast(p.name + " added to cart");
  }
  function bumpBadge() { var b = $(".cartCount"); if (b) { b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); } }
  function flyToCart(img) {
    var target = $(".headtools .iconbtn[data-open-cart]") || $(".cartCount");
    if (!target || !img.getBoundingClientRect) { bumpBadge(); return; }
    var r1 = img.getBoundingClientRect(), r2 = target.getBoundingClientRect();
    if (r2.width === 0) { bumpBadge(); return; }
    var ghost = img.cloneNode(); ghost.className = "flyer";
    ghost.style.left = r1.left + "px"; ghost.style.top = r1.top + "px"; ghost.style.width = r1.width + "px"; ghost.style.height = r1.height + "px";
    document.body.appendChild(ghost);
    var dx = r2.left + r2.width / 2 - (r1.left + r1.width / 2), dy = r2.top + r2.height / 2 - (r1.top + r1.height / 2);
    var reduced = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
    if (reduced || !ghost.animate) { ghost.remove(); bumpBadge(); return; }
    var anim = ghost.animate([
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: "translate(" + dx * 0.5 + "px," + (dy - 90) + "px) scale(.45)", opacity: 1, offset: 0.55 },
      { transform: "translate(" + dx + "px," + dy + "px) scale(.08)", opacity: 0.5 }
    ], { duration: 700, easing: "cubic-bezier(.22,.9,.28,1)" });
    anim.onfinish = function () { ghost.remove(); bumpBadge(); };
  }

  /* ---------- product cards ---------- */
  function cardHTML(p, i) {
    return '<article class="card rv" style="--d:' + ((i % 8) * 0.045) + 's"><div class="cimg"><a href="product.html?id=' + p.id + '" aria-label="' + p.name + '"><img loading="lazy" width="640" height="480" src="' + catImg(p.cat) + '" alt="' + p.name + '"></a>' +
      '<button class="wishbtn" data-wish="' + p.id + '" aria-pressed="false" aria-label="Add to wishlist">' + ICON_HEART + '</button></div>' +
      '<div class="cbody"><span class="ccat">' + CATS[p.cat].name + '</span><h3><a href="product.html?id=' + p.id + '">' + p.name + '</a></h3>' + stars(p.rating) +
      '<div class="crow"><span class="price">' + money(p.price) + '</span><span><button class="qvBtn" data-qv="' + p.id + '">Quick view</button> <button class="addBtn" data-add="' + p.id + '">Add to Cart</button></span></div></div></article>';
  }
  function rowHTML(p, i) {
    return '<article class="rowcard rv" style="--d:' + ((i % 8) * 0.045) + 's"><div class="rimg"><a href="product.html?id=' + p.id + '"><img loading="lazy" width="300" height="224" src="' + catImg(p.cat) + '" alt="' + p.name + '"></a></div>' +
      '<div class="rbody"><span class="ccat">' + CATS[p.cat].name + '</span><h3><a href="product.html?id=' + p.id + '">' + p.name + '</a></h3>' + stars(p.rating) +
      '<p class="rblurb">' + p.blurb + '</p></div>' +
      '<div class="rside"><span class="rindex">ITEM ' + ("0" + p.id).slice(-2) + '</span><span class="price">' + money(p.price) + '</span>' +
      '<span><button class="qvBtn" data-qv="' + p.id + '">Quick view</button></span><button class="addBtn" data-add="' + p.id + '">Add to Cart</button></div></article>';
  }
  function renderInto(el, list) { el.innerHTML = list.length ? list.map(cardHTML).join("") : '<div class="emptyBox" style="grid-column:1/-1"><h3>No products found</h3><p>Try a different search or filter.</p></div>'; syncWishButtons(); observeReveals(el); }

  /* ---------- reveal on scroll ---------- */
  var io = null;
  function observeReveals(root) {
    var els = $$(".rv", root || document);
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    if (!io) {
      io = new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }); }, { threshold: 0.1, rootMargin: "0px 0px -10% 0px" });
      setTimeout(function () { $$(".rv").forEach(function (e) { e.classList.add("in"); }); if (io) { io.disconnect(); io = null; } }, 1800); /* failsafe: nothing stays hidden */
    }
    els.forEach(function (e) { if (!e.classList.contains("in")) io.observe(e); });
  }

  /* ---------- quick view modal ---------- */
  var lastFocus = null;
  function openQV(id) {
    var p = byId(id), m = $("#qvModal"); if (!m) return;
    lastFocus = document.activeElement;
    $("#qvImg").src = catImg(p.cat); $("#qvImg").alt = p.name;
    $("#qvCat").textContent = CATS[p.cat].name; $("#qvName").textContent = p.name;
    $("#qvStars").innerHTML = stars(p.rating); $("#qvBlurb").textContent = p.blurb;
    $("#qvPrice").textContent = money(p.price);
    $("#qvAdd").dataset.add = p.id; $("#qvView").href = "product.html?id=" + p.id;
    m.classList.add("open"); lockScroll();
    var close = $("#qvClose"); if (close) close.focus();
  }
  function closeQV() { var m = $("#qvModal"); if (!m) return; m.classList.remove("open"); if (document.body.classList.contains("locked")) unlockScroll(); if (lastFocus) lastFocus.focus(); }

  /* ---------- search suggestions ---------- */
  function initSearch() {
    $$(".searchInput").forEach(function (input) {
      var box = input.parentElement.querySelector(".suggest"); if (!box) return;
      var selIdx = -1, items = [];
      function close() { box.classList.remove("open"); selIdx = -1; }
      input.addEventListener("input", function () {
        var q = input.value.trim().toLowerCase();
        if (q.length < 2) { close(); return; }
        items = PRODUCTS.filter(function (p) { return p.name.toLowerCase().indexOf(q) > -1 || CATS[p.cat].name.toLowerCase().indexOf(q) > -1; }).slice(0, 6);
        box.innerHTML = items.length ? items.map(function (p) { return '<a href="product.html?id=' + p.id + '"><img src="' + catImg(p.cat) + '" alt=""><span>' + p.name + '</span><span class="sp">' + money(p.price) + '</span></a>'; }).join("") : '<div class="empty">No matches. Try "helmet", "drill" or "extinguisher".</div>';
        box.classList.add("open"); selIdx = -1;
      });
      input.addEventListener("keydown", function (e) {
        var links = $$("a", box);
        if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); if (!links.length) return; selIdx = e.key === "ArrowDown" ? Math.min(selIdx + 1, links.length - 1) : Math.max(selIdx - 1, 0); links.forEach(function (a, i) { a.classList.toggle("sel", i === selIdx); }); }
        else if (e.key === "Enter" && selIdx > -1 && links[selIdx]) { e.preventDefault(); window.location.href = links[selIdx].getAttribute("href"); }
        else if (e.key === "Escape") close();
      });
      document.addEventListener("click", function (e) { if (!box.contains(e.target) && e.target !== input) close(); });
    });
  }

  /* ---------- hero slider ---------- */
  function initSlider() {
    var s = $("[data-slider]"); if (!s) return;
    var track = $(".slides", s), slides = $$(".slide", s), dotsBox = $(".sldots", s), prog = $(".slprog", s);
    var idx = 0, timer = null; if (slides[0]) slides[0].classList.add("on");
    slides.forEach(function (_, i) { var d = document.createElement("button"); d.className = "sldot" + (i === 0 ? " on" : ""); d.setAttribute("aria-label", "Go to slide " + (i + 1)); d.addEventListener("click", function () { go(i); restart(); }); dotsBox.appendChild(d); });
    function go(i) { idx = (i + slides.length) % slides.length; slides.forEach(function (sl, j) { sl.classList.toggle("on", j === idx); }); track.style.transform = "translateX(-" + idx * 100 + "%)"; $$(".sldot", dotsBox).forEach(function (d, j) { d.classList.toggle("on", j === idx); }); runProg(); }
    function runProg() { if (!prog || !prog.animate) return; prog.getAnimations().forEach(function (a) { a.cancel(); }); prog.style.width = "0"; prog.animate([{ width: "0" }, { width: "100%" }], { duration: 5000, easing: "linear" }); }
    function restart() { if (timer) clearInterval(timer); timer = setInterval(function () { go(idx + 1); }, 5000); runProg(); }
    var prev = $(".slarrow.prev", s), next = $(".slarrow.next", s);
    if (prev) prev.addEventListener("click", function () { go(idx - 1); restart(); });
    if (next) next.addEventListener("click", function () { go(idx + 1); restart(); });
    if (window.matchMedia && window.matchMedia("(hover:hover) and (pointer:fine)").matches) { s.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); }); s.addEventListener("mouseleave", restart); }
    var sx = null;
    s.addEventListener("pointerdown", function (e) { sx = e.clientX; });
    s.addEventListener("pointerup", function (e) { if (sx === null) return; var dx = e.clientX - sx; if (Math.abs(dx) > 48) { go(idx + (dx < 0 ? 1 : -1)); restart(); } sx = null; });
    restart();
  }

  /* ---------- header hide/show ---------- */
  function initHeader() {
    var head = $(".sitehead"); if (!head) return;
    var lastY = 0, ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = Math.max(0, window.scrollY || 0), d = y - lastY;
        if (Math.abs(d) > 6 && !document.body.classList.contains("locked")) { if (y > 160 && d > 0) head.classList.add("hide"); else head.classList.remove("hide"); lastY = y; }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- color picker ---------- */
  function initPicker() {
    var sw = $$(".swatch"); if (!sw.length) return;
    var saved = load(K.theme, null);
    function apply(btn) { sw.forEach(function (b) { b.setAttribute("aria-checked", b === btn ? "true" : "false"); b.tabIndex = b === btn ? 0 : -1; }); document.documentElement.style.setProperty("--accent", btn.dataset.c); document.documentElement.style.setProperty("--on-accent", btn.dataset.on); save(K.theme, { c: btn.dataset.c, on: btn.dataset.on }); }
    var start = sw[0];
    if (saved) sw.forEach(function (b) { if (b.dataset.c === saved.c) start = b; });
    apply(start);
    sw.forEach(function (b, i) {
      b.addEventListener("click", function () { apply(b); toast("Accent color updated"); });
      b.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") n = sw[(i + 1) % sw.length];
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = sw[(i - 1 + sw.length) % sw.length];
        if (n) { e.preventDefault(); apply(n); n.focus(); }
      });
    });
  }

  /* ---------- global clicks (single delegated listener) ---------- */
  if (!window.__hhStoreBound) {
    window.__hhStoreBound = true;
    document.addEventListener("click", function (e) {
      var t = e.target;
      var add = t.closest("[data-add]");
      if (add) { var card = add.closest(".card"); var img = card ? $("img", card) : ($("#pdMain img.on") || $("#qvImg")); addToCart(+add.dataset.add, add.dataset.qty ? +add.dataset.qty : (window.__pdQty || 1), img); return; }
      var w = t.closest("[data-wish]");
      if (w) { var id = +w.dataset.wish; var ix = wish.indexOf(id); if (ix > -1) { wish.splice(ix, 1); toast("Removed from wishlist"); } else { wish.push(id); toast(byId(id).name + " saved to wishlist"); } save(K.wish, wish); renderCounts(false); syncWishButtons(); return; }
      var qv = t.closest("[data-qv]");
      if (qv) { openQV(+qv.dataset.qv); return; }
      if (t.closest("[data-open-cart]")) { e.preventDefault(); openDrawer("#cartDrawer"); return; }
      if (t.closest("[data-open-menu]")) { openDrawer("#menuDrawer"); return; }
      if (t.closest("[data-close-drawers]") || t.classList.contains("scrim")) { closeDrawers(); return; }
      if (t.closest("#qvClose") || t.classList.contains("mscrim")) { closeQV(); return; }
      var act = t.closest("[data-act]");
      if (act) {
        var pid = +act.dataset.id, a = act.dataset.act;
        if (a === "inc") cart[pid]++;
        if (a === "dec") { cart[pid]--; if (cart[pid] <= 0) delete cart[pid]; }
        if (a === "remove") {
          var row = act.closest(".citem");
          if (row) { row.style.opacity = "0"; row.style.height = row.offsetHeight + "px"; requestAnimationFrame(function () { row.style.height = "0"; row.style.paddingTop = "0"; row.style.paddingBottom = "0"; }); setTimeout(function () { delete cart[pid]; save(K.cart, cart); renderCounts(false); renderDrawerCart(); renderCartPage(); }, 300); toast("Removed from cart"); return; }
          delete cart[pid];
        }
        save(K.cart, cart); renderCounts(false); renderDrawerCart(); renderCartPage();
        return;
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeDrawers(); closeQV(); }
      if (e.key === "Tab") {
        var m = $("#qvModal");
        if (m && m.classList.contains("open")) {
          var f = $$("a[href],button:not([disabled])", m).filter(function (el) { return el.offsetParent !== null; });
          if (f.length) { var first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
        }
      }
    });
  }

  /* ---------- shop page ---------- */
  function initShop() {
    var grid = $("#shopGrid"); if (!grid) return;
    var state = { cat: "all", sort: "featured", max: 20000, minr: 0 };
    var q = new URLSearchParams(window.location.search); if (q.get("cat")) state.cat = q.get("cat");
    function current() {
      var list = PRODUCTS.filter(function (p) { return (state.cat === "all" || p.cat === state.cat) && p.price <= state.max && p.rating >= state.minr; });
      if (state.sort === "price-asc") list.sort(function (a, b) { return a.price - b.price; });
      if (state.sort === "price-desc") list.sort(function (a, b) { return b.price - a.price; });
      if (state.sort === "rating") list.sort(function (a, b) { return b.rating - a.rating; });
      if (state.sort === "name") list.sort(function (a, b) { return a.name.localeCompare(b.name); });
      return list;
    }
    var layout = document.body.dataset.shop || "grid";
    function draw() { grid.style.opacity = "0"; setTimeout(function () {
      var list = current();
      if (layout === "row") { grid.innerHTML = list.length ? list.map(rowHTML).join("") : '<div class="emptyBox"><h3>No products found</h3><p>Try a different filter.</p></div>'; syncWishButtons(); observeReveals(grid); }
      else renderInto(grid, list);
      var c = $("#resCount"); if (c) c.textContent = list.length + " products"; grid.style.transition = "opacity .3s"; grid.style.opacity = "1"; }, 160); }
    function setCat(cat) { state.cat = cat; $$("[data-catpick]").forEach(function (x) { x.classList.toggle("on", x.dataset.catpick === cat); }); var lbl = $("#catBtnLabel"); if (lbl) lbl.textContent = cat === "all" ? "All Products" : CATS[cat].name; draw(); }
    $$("[data-catpick]").forEach(function (ch) { ch.classList.toggle("on", ch.dataset.catpick === state.cat); ch.addEventListener("click", function () { setCat(ch.dataset.catpick); var dd = ch.closest(".catdrop"); if (dd) dd.classList.remove("open"); }); });
    var catBtn = $("#catBtn");
    if (catBtn) { catBtn.addEventListener("click", function () { var dd = catBtn.closest(".catdrop"); var open = dd.classList.toggle("open"); catBtn.setAttribute("aria-expanded", open); }); document.addEventListener("click", function (e) { var dd = catBtn.closest(".catdrop"); if (dd && !dd.contains(e.target)) dd.classList.remove("open"); }); }
    if (state.cat !== "all") { var lbl2 = $("#catBtnLabel"); if (lbl2) lbl2.textContent = CATS[state.cat].name; $$("[data-catpick]").forEach(function (x) { x.classList.toggle("on", x.dataset.catpick === state.cat); }); }
    var sort = $("#sortSel"); if (sort) sort.addEventListener("change", function () { state.sort = sort.value; draw(); });
    var rng = $("#priceRange"); if (rng) rng.addEventListener("input", function () { state.max = +rng.value; var l = $("#priceVal"); if (l) l.textContent = money(state.max); draw(); });
    var rt = $("#rateSel"); if (rt) rt.addEventListener("change", function () { state.minr = +rt.value; draw(); });
    grid.innerHTML = '<div class="skel"><div class="sk"></div><div class="skl"></div><div class="skl" style="width:60%"></div></div>'.repeat(6);
    setTimeout(draw, 320);
  }

  /* ---------- product page ---------- */
  function initProduct() {
    var main = $("#pdMain"); if (!main) return;
    var id = +(new URLSearchParams(window.location.search).get("id") || 1);
    var p = byId(id);
    document.title = p.name + " | H.H Traders";
    var gallery = [catImg(p.cat), "../shared/img/hero-warehouse.jpg", "../shared/img/hero-tools.jpg"];
    if (gallery[1] === gallery[0]) gallery[1] = "../shared/img/hero-fire.jpg";
    main.innerHTML = gallery.map(function (g, i) { return '<img src="' + g + '" alt="' + p.name + ' photo ' + (i + 1) + '"' + (i === 0 ? ' class="on"' : "") + '>'; }).join("");
    var thumbs = $("#pdThumbs");
    if (thumbs) thumbs.innerHTML = gallery.map(function (g, i) { return '<button data-th="' + i + '"' + (i === 0 ? ' class="on"' : "") + ' aria-label="Show photo ' + (i + 1) + '"><img src="' + g + '" alt=""></button>'; }).join("");
    function show(ix) { $$("#pdMain img").forEach(function (im, j) { im.classList.toggle("on", j === ix); }); $$("#pdThumbs button").forEach(function (b, j) { b.classList.toggle("on", j === ix); }); }
    var cur = 0;
    if (thumbs) thumbs.addEventListener("click", function (e) { var b = e.target.closest("[data-th]"); if (b) { cur = +b.dataset.th; show(cur); } });
    var gal = $(".gallery"); if (gal) { gal.tabIndex = 0; gal.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") { cur = (cur + 1) % 3; show(cur); } if (e.key === "ArrowLeft") { cur = (cur + 2) % 3; show(cur); } }); }
    $("#pdCat").textContent = CATS[p.cat].name; $("#pdName").textContent = p.name;
    $("#pdStars").innerHTML = stars(p.rating) + ' <span style="color:var(--muted)">' + p.rating.toFixed(1) + "</span>";
    $("#pdPrice").textContent = money(p.price); $("#pdBlurb").textContent = p.blurb;
    $("#pdSku").textContent = "HH-" + (1000 + p.id);
    var addBtn = $("#pdAdd"); if (addBtn) addBtn.dataset.add = p.id;
    var wishBtn = $("#pdWish"); if (wishBtn) { wishBtn.dataset.wish = p.id; syncWishButtons(); }
    window.__pdQty = 1;
    var qv = $("#pdQtyVal");
    $$("[data-pdq]").forEach(function (b) { b.addEventListener("click", function () { window.__pdQty = Math.max(1, Math.min(99, window.__pdQty + (+b.dataset.pdq))); if (qv) { qv.textContent = window.__pdQty; qv.classList.remove("pop"); void qv.offsetWidth; qv.classList.add("pop"); } if (addBtn) addBtn.dataset.qty = window.__pdQty; }); });
    var rel = $("#relatedGrid"); if (rel) renderInto(rel, PRODUCTS.filter(function (x) { return x.cat === p.cat && x.id !== p.id; }).concat(PRODUCTS.filter(function (x) { return x.cat !== p.cat; })).slice(0, 3));
  }

  /* ---------- cart page ---------- */
  function renderCartPage() {
    var body = $("#cartPageItems"); if (!body) return;
    var ids = Object.keys(cart);
    if (!ids.length) { body.innerHTML = '<div class="emptyBox"><h3>Your cart is empty</h3><p>Browse the shop and add what your site needs.</p><p style="margin-top:14px"><a class="btn" href="shop.html">Go to Shop</a></p></div>'; }
    else body.innerHTML = ids.map(function (k) { return cartRow(byId(+k), cart[k]); }).join("");
    var sub = cartSubtotal(), ship = shippingFor(sub);
    var t = $("#cartPageTotals");
    if (t) t.innerHTML = '<div class="totrow"><span>Subtotal</span><span>' + money(sub) + '</span></div><div class="totrow"><span>Shipping ' + (ship === 0 && sub > 0 ? "(free over Rs 20,000)" : "") + '</span><span>' + (sub === 0 ? money(0) : (ship === 0 ? "Free" : money(ship))) + '</span></div><div class="totrow grand"><span>Total</span><span>' + money(sub + ship) + '</span></div>';
    var co = $("#toCheckout"); if (co) co.style.display = ids.length ? "" : "none";
  }

  /* ---------- checkout + confirmation ---------- */
  function initCheckout() {
    var form = $("#coForm"); if (!form) return;
    var sum = $("#coSummary");
    var ids = Object.keys(cart);
    if (sum) sum.innerHTML = ids.map(function (k) { var p = byId(+k); return '<div class="totrow"><span>' + p.name + " × " + cart[k] + '</span><span>' + money(p.price * cart[k]) + "</span></div>"; }).join("") + '<div class="totrow"><span>Shipping</span><span>' + (shippingFor(cartSubtotal()) === 0 && ids.length ? "Free" : money(shippingFor(cartSubtotal()))) + '</span></div><div class="totrow grand"><span>Total</span><span>' + money(cartSubtotal() + shippingFor(cartSubtotal())) + "</span></div>";
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      function check(name, test, msg) { var f = form.querySelector('[name="' + name + '"]'); var wrap = f.closest(".field"); var valid = test(f.value.trim()); wrap.classList.toggle("invalid", !valid); var er = wrap.querySelector(".err"); if (er && msg) er.textContent = msg; if (!valid) ok = false; }
      check("name", function (v) { return v.length >= 3; }, "Please enter your full name.");
      check("phone", function (v) { return /^[0-9+\s-]{10,16}$/.test(v); }, "Enter a valid phone number.");
      check("address", function (v) { return v.length >= 8; }, "Please enter your complete address.");
      check("city", function (v) { return v.length >= 2; }, "Please enter your city.");
      if (!ok) { var firstBad = form.querySelector(".field.invalid input,.field.invalid textarea,.field.invalid select"); if (firstBad) firstBad.focus(); return; }
      var btn = $("#placeBtn");
      btn.disabled = true; btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Placing order...';
      setTimeout(function () {
        var order = { no: "HH-2026-" + (1000 + Math.floor(Math.random() * 9000)), items: ids.map(function (k) { var p = byId(+k); return { name: p.name, qty: cart[k], price: p.price }; }), total: cartSubtotal() + shippingFor(cartSubtotal()), name: form.querySelector('[name="name"]').value.trim(), city: form.querySelector('[name="city"]').value.trim(), pay: (form.querySelector('[name="pay"]:checked') || {}).value || "Cash on Delivery" };
        save(K.order, order); cart = {}; save(K.cart, cart); renderCounts(false);
        window.location.href = "confirmation.html";
      }, 950);
    });
  }
  function initConfirm() {
    var box = $("#confBox"); if (!box) return;
    var o = load(K.order, null);
    var svg = $(".checksvg"); if (svg) requestAnimationFrame(function () { svg.classList.add("play"); });
    if (!o) { $("#confItems").innerHTML = '<div class="totrow"><span>No recent order found in this design.</span></div>'; return; }
    $("#confNo").textContent = o.no; $("#confName").textContent = o.name; $("#confMeta").textContent = o.city + " | " + o.pay;
    $("#confItems").innerHTML = o.items.map(function (it) { return '<div class="totrow"><span>' + it.name + " × " + it.qty + '</span><span>' + money(it.price * it.qty) + "</span></div>"; }).join("") + '<div class="totrow grand"><span>Total</span><span>' + money(o.total) + "</span></div>";
  }

  /* ---------- boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    if (document.body.dataset.page === "home") {
      var fg = $("#featuredGrid"); if (fg) renderInto(fg, PRODUCTS.slice(0, 6));
      var cg = $("#catGrid"); if (cg) cg.innerHTML = DATA.categories.map(function (c) { return '<a class="cattile rv" href="shop.html?cat=' + c.id + '"><img loading="lazy" width="640" height="400" src="' + c.img + '" alt="' + c.name + '"><span class="ct-label">' + c.name + "</span></a>"; }).join("");
    }
    renderCounts(false); syncWishButtons();
    initPicker(); initSearch(); initSlider(); initHeader();
    initShop(); initProduct(); renderCartPage(); initCheckout(); initConfirm();
    observeReveals(document);
  });
  window.HH = { money: money, toast: toast, addToCart: addToCart };
})();
