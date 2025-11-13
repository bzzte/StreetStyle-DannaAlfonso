/* =========================
   CONFIGURACIÓN
   ========================= */
const MONEDA_DISPLAY = "COP";        // Moneda para mostrar precios
const LOCALE   = "es-CO";
const TAX_RATE = 0.00;               // IVA si aplica (0.19 ejemplo)

// Conversión COP→USD para PayPal si tu cuenta no acepta COP.
const MONEDA_PAGO = "USD";
const COP_TO_USD = 0.00025;

// Cupones demo (porcentaje)
const CUPONES = { STREET10: 10, URBAN15: 15, JUAN20: 20 };

/* =========================
   DATASET StreetStyle (tus imágenes)
   ========================= */
const productos = [
  // Hoodies
  {
    id: 1,
    nombre: "Hoodie “Black Street”",
    categoria: "Hoodies",
    precio: 120000,
    img: "https://i.pinimg.com/1200x/bb/96/8c/bb968c3bd4fb64af9f1db5fdfa7c04c9.jpg",
    tallas: ["XS","S","M","L","XL"],
    descripcion: "Hoodie negro acolchado estilo urbano, ideal para noches frías en la ciudad."
  },
  {
    id: 2,
    nombre: "Hoodie “Retro Gray”",
    categoria: "Hoodies",
    precio: 115000,
    img: "https://i.pinimg.com/736x/48/e2/f3/48e2f320c6a07b906dc33f068b07a15f.jpg",
    tallas: ["XS","S","M","L","XL"],
    descripcion: "Hoodie gris retro con corte relajado y capota amplia."
  },
  // Pantalones
  {
    id: 3,
    nombre: "Pantalón Cargo “Shadow”",
    categoria: "Pantalones",
    precio: 110000,
    img: "https://i.pinimg.com/736x/de/e6/ba/dee6ba6ef3891462ff8f43bc65316847.jpg",
    tallas: ["28","30","32","34","36"],
    descripcion: "Cargo ancho con bolsillos profundos, perfecto para el streetwear diario."
  },
  {
    id: 4,
    nombre: "Pantalón Loose “Skater”",
    categoria: "Pantalones",
    precio: 115000,
    img: "https://i.pinimg.com/736x/1e/fb/1c/1efb1cb759b863ce96fe6d5f6f4acdfe.jpg",
    tallas: ["28","30","32","34","36"],
    descripcion: "Pantalón loose fit estilo skater, tiro medio y caída relajada."
  },
  // Camisetas
  {
    id: 5,
    nombre: "Camiseta “StreetStorm”",
    categoria: "Camisetas",
    precio: 65000,
    img: "https://i.pinimg.com/736x/b0/bc/e0/b0bce0bfb32a6526a625d9e9bb893bf8.jpg",
    tallas: ["XS","S","M","L","XL"],
    descripcion: "Camiseta oversize con gráfico frontal StreetStorm en alto contraste."
  },
  {
    id: 6,
    nombre: "Camiseta “Skyline Neon”",
    categoria: "Camisetas",
    precio: 69000,
    img: "https://i.pinimg.com/736x/72/bd/d2/72bdd2a1bd34ee18a923d950ffc20e51.jpg",
    tallas: ["XS","S","M","L","XL"],
    descripcion: "Camiseta con print de ciudad nocturna y acentos neón."
  },
  // Gorras
  {
    id: 7,
    nombre: "Gorra “NYC Flat”",
    categoria: "Gorras",
    precio: 75000,
    img: "https://i.pinimg.com/1200x/da/41/27/da4127ca9988720c8b862d9bc4aacf92.jpg",
    tallas: ["Única"],
    descripcion: "Gorra plana estilo NYC, visera rígida y ajuste trasero."
  },
  {
    id: 8,
    nombre: "Gorra “Classic White”",
    categoria: "Gorras",
    precio: 70000,
    img: "https://i.pinimg.com/1200x/06/be/cd/06becdffa7c3d6a8bbf55f3870b170b3.jpg",
    tallas: ["Única"],
    descripcion: "Gorra blanca minimal, ideal para combinar con cualquier outfit."
  }
];

/* =========================
   ESTADO + SELECTORES
   ========================= */
let carrito = new Map();             // key: "id-talla"
let cuponActivo = null;              // { code, percent }

// estado modal
let productoSeleccionado = null;
let tallaSeleccionada = null;
let cantidadSeleccionada = 1;

const el = {
  contProds:  document.getElementById("productos"),
  lista:      document.getElementById("lista-carrito"),
  subtotal:   document.getElementById("subtotal-text"),
  impuestos:  document.getElementById("impuestos-text"),
  descuento:  document.getElementById("descuento-text"),
  total:      document.getElementById("total-text"),
  cantidad:   document.getElementById("cantidad-carrito"),
  btnVaciar:  document.getElementById("btn-vaciar"),
  btnFinal:   document.getElementById("btn-finalizar"),
  paypal:     document.getElementById("paypal-button-container"),
  hints:      document.getElementById("hints-vacios"),
  cuponForm:  document.getElementById("cupon-form"),
  cuponInput: document.getElementById("cupon-input"),
  cuponPill:  document.getElementById("cupon-aplicado"),
  calTitle:   document.getElementById("cal-title"),
  calGrid:    document.getElementById("cal-grid"),
  // modal
  modal:      document.getElementById("product-modal"),
  modalImg:   document.getElementById("modal-img-main"),
  modalTitle: document.getElementById("modal-title"),
  modalPrice: document.getElementById("modal-price"),
  modalDesc:  document.getElementById("modal-desc"),
  modalSizes: document.getElementById("modal-sizes"),
  modalQty:   document.getElementById("modal-qty")
};

const money = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: MONEDA_DISPLAY
});

/* =========================
   RENDER DE PRODUCTOS
   ========================= */
function renderProductos(lista){
  el.contProds.setAttribute("aria-busy","true");
  el.contProds.innerHTML = "";

  if (!Array.isArray(lista) || lista.length === 0){
    el.hints.style.display = "block";
    el.hints.innerHTML =
      "👋 Aún no has agregado productos. Edita el array <code>productos</code> y añade ítems con categoría, nombre, precio e imagen.";
    el.contProds.setAttribute("aria-busy","false");
    return;
  } else {
    el.hints.style.display = "none";
  }

  lista.forEach(p=>{
    const card = document.createElement("article");
    card.className = "producto";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <p class="price">${money.format(Number(p.precio)||0)}</p>
      <div class="actions-card">
        <button class="button" data-add="${p.id}">Agregar</button>
        <button class="button button--ghost" data-open-product="${p.id}">Ver detalle</button>
      </div>
    `;
    const img = card.querySelector("img");
    img.addEventListener("error", ()=>{
      img.src = "https://via.placeholder.com/400x600?text=Producto";
      img.alt = p.nombre + " (imagen no disponible)";
    });
    el.contProds.appendChild(card);
  });

  el.contProds.setAttribute("aria-busy","false");
}

/* =========================
   FILTRO POR CATEGORÍA (tabs)
   ========================= */
function setCategoria(cat){
  const data = cat === "todos"
    ? productos
    : productos.filter(p => String(p.categoria) === cat);

  renderProductos(data);
  localStorage.setItem("filtro_categoria", cat);

  document.querySelectorAll("[data-cat]").forEach(btn=>{
    btn.classList.toggle("cat-tab--active", btn.dataset.cat === cat);
  });
}

function initCategoria(){
  const saved = localStorage.getItem("filtro_categoria") || "todos";
  setCategoria(saved);
}

/* =========================
   CARRITO + TOTALES + CUPONES
   ========================= */
function persist(){
  localStorage.setItem("carrito", JSON.stringify(Array.from(carrito.entries())));
}

function load(){
  const data = localStorage.getItem("carrito");
  if (data){
    carrito = new Map(JSON.parse(data));
  }
  const c = localStorage.getItem("cupon_activo");
  if (c){
    cuponActivo = JSON.parse(c);
    pintarCupon();
  }
}

function totales(){
  const subtotal = [...carrito.values()]
    .reduce((a,i)=> a + Number(i.precio||0)*Number(i.cantidad||0), 0);
  const discPct = cuponActivo && cuponActivo.percent
    ? (cuponActivo.percent/100)
    : 0;
  const descuento = +(subtotal * discPct).toFixed(2);
  const base = subtotal - descuento;
  const impuestos = +(base * TAX_RATE).toFixed(2);
  const total = +(base + impuestos).toFixed(2);
  const cantidad = [...carrito.values()]
    .reduce((a,i)=> a + Number(i.cantidad||0), 0);
  return { subtotal, descuento, impuestos, total, cantidad };
}

function pintarCarrito(){
  el.lista.innerHTML = "";
  for (const [key, it] of carrito.entries()){
    const li = document.createElement("li");
    const nombreTalla = it.talla
      ? `${it.nombre} — Talla ${it.talla}`
      : it.nombre;
    li.innerHTML = `
      <span>${nombreTalla} — ${money.format(it.precio)} x ${it.cantidad}</span>
      <div class="qty">
        <button aria-label="Disminuir" data-dec="${key}">−</button>
        <span>${it.cantidad}</span>
        <button aria-label="Aumentar" data-inc="${key}">+</button>
        <button class="remove" aria-label="Eliminar" data-del="${key}">❌</button>
      </div>`;
    el.lista.appendChild(li);
  }

  const {subtotal,descuento,impuestos,total,cantidad} = totales();
  el.subtotal.textContent  = money.format(subtotal);
  el.descuento.textContent = money.format(descuento);
  el.impuestos.textContent = money.format(impuestos);
  el.total.textContent     = money.format(total);
  el.cantidad.textContent  = cantidad;

  el.paypal.style.display = total > 0 ? "block" : "none";
  renderPayPal(total);
}

/* clave compuesta: id + talla */
function keyFor(producto, talla){
  return String(producto.id) + (talla ? "-" + talla : "");
}

function addWithOptions(producto, talla, cantidad){
  const key = keyFor(producto, talla);
  const it = carrito.get(key);
  if (it){
    it.cantidad += cantidad;
  } else {
    carrito.set(key, {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      talla: talla || null,
      cantidad: cantidad
    });
  }
  persist();
  pintarCarrito();
}

function addById(id){
  const p = productos.find(x=> x.id === id);
  if(!p){
    alert("Producto no encontrado.");
    return;
  }
  addWithOptions(p, null, 1);   // desde la grilla sin elegir talla
}

function dec(key){
  const it = carrito.get(key);
  if(!it) return;
  it.cantidad--;
  if (it.cantidad<=0) carrito.delete(key);
  persist();
  pintarCarrito();
}

function delItem(key){
  carrito.delete(key);
  persist();
  pintarCarrito();
}

/* =========================
   CUPONES
   ========================= */
function aplicarCupon(code){
  const c = (code || "").trim().toUpperCase();
  if (!c) return;
  const pct = CUPONES[c];
  if (!pct){
    alert("Cupón no válido.");
    return;
  }
  cuponActivo = { code:c, percent:pct };
  localStorage.setItem("cupon_activo", JSON.stringify(cuponActivo));
  pintarCupon();
  pintarCarrito();
}

function quitarCupon(){
  cuponActivo = null;
  localStorage.removeItem("cupon_activo");
  pintarCupon();
  pintarCarrito();
}

function pintarCupon(){
  if(!cuponActivo){
    el.cuponPill.style.display = "none";
    el.cuponPill.innerHTML = "";
    return;
  }
  el.cuponPill.style.display = "inline-flex";
  el.cuponPill.innerHTML = `
    Cupón aplicado: <strong>${cuponActivo.code}</strong>
    (${cuponActivo.percent}% off)
    <button aria-label="Quitar cupón" data-remove-coupon>✕</button>
  `;
}

/* =========================
   PAYPAL (sandbox) con conversión COP→USD
   ========================= */
let paypalRenderedKey = null; // evita re-render innecesario

function renderPayPal(totalCOP){
  if(typeof window.paypal === "undefined") return;
  if(totalCOP <= 0){
    paypalRenderedKey = null;
    el.paypal.innerHTML = "";
    return;
  }
  const totalUSD = Math.max(0.01, +(totalCOP * COP_TO_USD).toFixed(2));
  const key = totalUSD + "-" + MONEDA_PAGO;
  if(paypalRenderedKey === key && el.paypal.childElementCount > 0) return;

  paypalRenderedKey = key;
  el.paypal.innerHTML = "";
  window.paypal.Buttons({
    style:{ layout:"vertical", shape:"rect" },
    createOrder:(data,actions)=>actions.order.create({
      purchase_units:[{
        amount:{ value: totalUSD.toFixed(2), currency_code: MONEDA_PAGO }
      }]
    }),
    onApprove:(data,actions)=>actions.order.capture().then(d=>{
      alert(`¡Gracias ${d && d.payer && d.payer.name ? d.payer.name.given_name : "cliente"}! Pago aprobado.`);
      carrito.clear();
      persist();
      pintarCarrito();
      quitarCupon();
    }),
    onError:(err)=>{
      console.error(err);
      alert("Error con el pago. Reintenta.");
    }
  }).render("#paypal-button-container");
}

/* =========================
   MODAL PRODUCTO (tipo KOAJ)
   ========================= */
function openProducto(id){
  const p = productos.find(x=> x.id === id);
  if(!p) return;

  productoSeleccionado = p;
  const tallas = p.tallas && p.tallas.length ? p.tallas : ["Única"];
  tallaSeleccionada = tallas[0];
  cantidadSeleccionada = 1;

  el.modalImg.src = p.img;
  el.modalImg.alt = p.nombre;
  el.modalTitle.textContent = p.nombre;
  el.modalPrice.textContent = money.format(p.precio);
  el.modalDesc.textContent = p.descripcion || "Prenda urbana StreetStyle.";
  el.modalQty.textContent = cantidadSeleccionada;

  el.modalSizes.innerHTML = "";
  tallas.forEach(t=>{
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = t;
    btn.className = "size-btn" + (t === tallaSeleccionada ? " size-btn--active" : "");
    btn.dataset.size = t;
    el.modalSizes.appendChild(btn);
  });

  el.modal.classList.add("is-open");
  el.modal.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}

function closeModal(){
  el.modal.classList.remove("is-open");
  el.modal.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
  productoSeleccionado = null;
}

/* =========================
   CALENDARIO DE OFERTAS
   ========================= */
function buildCalendar(){
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11
  const monthName = now.toLocaleString("es-CO", { month:"long", year:"numeric" });
  el.calTitle.textContent = "Ofertas — " +
    monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const startDay = (first.getDay() + 6) % 7; // lunes=0

  const grid = el.calGrid;
  grid.innerHTML = "";

  const weekdays = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
  weekdays.forEach(d=>{
    const h = document.createElement("div");
    h.className = "muted";
    h.style.fontWeight = "700";
    h.textContent = d;
    grid.appendChild(h);
  });

  for(let i=0;i<startDay;i++){
    const e = document.createElement("div");
    e.className = "muted";
    grid.appendChild(e);
  }

  const deals = new Set();
  for(let d=1; d<=last.getDate(); d++){
    const date = new Date(year, month, d);
    if(date.getDay() === 6) deals.add(d); // sábados
  }

  for(let d=1; d<=last.getDate(); d++){
    const cell = document.createElement("div");
    cell.innerHTML = `<strong>${d}</strong>`;
    if(deals.has(d)){
      cell.classList.add("deal");
      const small = document.createElement("small");
      small.textContent = "Promo -10%";
      cell.appendChild(small);
      cell.addEventListener("click", ()=>{
        aplicarCupon("STREET10");
        window.scrollTo({top:0, behavior:"smooth"});
      });
    }
    grid.appendChild(cell);
  }
}

/* =========================
   EVENTOS (delegados)
   ========================= */
document.addEventListener("click", e=>{
  // tabs de categoría
  const tab = e.target.closest("[data-cat]");
  if(tab){
    setCategoria(tab.dataset.cat);
    return;
  }

  // añadir desde grilla
  const addBtn = e.target.closest("[data-add]");
  if(addBtn){
    addById(+addBtn.dataset.add);
    return;
  }

  // ver detalle (modal)
  const openProd = e.target.closest("[data-open-product]");
  if(openProd){
    openProducto(+openProd.dataset.openProduct);
    return;
  }

  // carrito +/-
  const incBtn = e.target.closest("[data-inc]");
  if(incBtn){
    addOrIncFromKey(incBtn.dataset.inc);
    return;
  }

  const decBtn = e.target.closest("[data-dec]");
  if(decBtn){
    dec(decBtn.dataset.dec);
    return;
  }

  const delBtn = e.target.closest("[data-del]");
  if(delBtn){
    delItem(delBtn.dataset.del);
    return;
  }

  // quitar cupón
  const removeCouponBtn = e.target.closest("[data-remove-coupon]");
  if(removeCouponBtn){
    quitarCupon();
    return;
  }

  // modal: cerrar
  if(e.target.closest("[data-modal-close]")){
    closeModal();
    return;
  }

  // modal: seleccionar talla
  const sizeBtn = e.target.closest("[data-size]");
  if(sizeBtn && el.modal.contains(sizeBtn)){
    tallaSeleccionada = sizeBtn.dataset.size;
    document.querySelectorAll(".size-btn").forEach(b=>{
      b.classList.toggle("size-btn--active", b === sizeBtn);
    });
    return;
  }

  // modal: cantidad
  if(e.target.closest("[data-modal-inc]")){
    cantidadSeleccionada++;
    el.modalQty.textContent = cantidadSeleccionada;
    return;
  }
  if(e.target.closest("[data-modal-dec]")){
    if(cantidadSeleccionada > 1){
      cantidadSeleccionada--;
      el.modalQty.textContent = cantidadSeleccionada;
    }
    return;
  }

  // modal: añadir al carrito con talla y cantidad
  if(e.target.closest("[data-modal-add]")){
    if(!productoSeleccionado) return;
    addWithOptions(productoSeleccionado, tallaSeleccionada, cantidadSeleccionada);
    closeModal();
    return;
  }
});

// aumentar desde carrito (usa misma key)
function addOrIncFromKey(key){
  const it = carrito.get(key);
  if(!it) return;
  it.cantidad++;
  persist();
  pintarCarrito();
}

el.btnVaciar.addEventListener("click", ()=>{
  if(confirm("¿Vaciar carrito?")){
    carrito.clear();
    persist();
    pintarCarrito();
    quitarCupon();
  }
});

el.btnFinal.addEventListener("click", ()=>{
  if(carrito.size === 0){
    alert("Carrito vacío.");
    return;
  }
  alert("Pedido confirmado (simulado).");
  carrito.clear();
  persist();
  pintarCarrito();
  quitarCupon();
});

el.cuponForm.addEventListener("submit", e=>{
  e.preventDefault();
  aplicarCupon(el.cuponInput.value);
  el.cuponInput.value = "";
});

/* =========================
   INIT
   ========================= */
(function init(){
  initCategoria();      // carga filtro desde localStorage y renderiza productos
  load();               // carga carrito y cupón
  pintarCarrito();
  buildCalendar();
  const main = document.getElementById("main");
  if(main && main.focus){
    try { main.focus({preventScroll:true}); } catch(_) {}
  }
})();
