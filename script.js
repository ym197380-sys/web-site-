const PRODUCTS = {
  "off-white": {
    id: "off-white",
    name: "سويت شيرت Off-White أبيض",
    brand: "Off-White",
    color: "أبيض",
    fabric: "قطن إسفنجي",
    price: 650,
    image: "images/off-white.jpg",
    description:
      "سويت شيرت أبيض فاخر بتصميم Off-White المميز مع لوجو الأسهم البارز على الصدر والخطوط المائلة على الكم، من خامة قطن إسفنجي ناعمة وثابتة."
  },
  "britain-black": {
    id: "britain-black",
    name: "سويت شيرت بريطانيا أسود",
    brand: "بريطانيا",
    color: "أسود",
    fabric: "قطن إسفنجي",
    price: 450,
    image: "images/britain-black.jpg",
    description:
      "سويت شيرت أسود أنيق بتصميم علم بريطانيا المرصع بالكريستال اللامع عالي الثبات، مصنوع من خامة قطن إسفنجي تقيلة ومريحة للخروجات اليومية."
  }
};

const STORE_ADDRESS = "16 داير الناحية بجوار مقهى الزعبليطي أمام محمدين";
const WHATSAPP_NUMBERS = {
  "201152798726": "01152798726",
  "201130837894": "01130837894"
};
const STORAGE_KEY = "elshafei_store_cart_v1";

let cart = loadCart();
let activeQuickViewId = null;

// عناصر DOM
const cartCountEl = document.getElementById("cartCount");
const drawerItemCountEl = document.getElementById("drawerItemCount");
const cartItemsContainer = document.getElementById("cartItemsContainer");
const emptyCartState = document.getElementById("emptyCartState");
const cartFooter = document.getElementById("cartFooter");
const cartTotalEl = document.getElementById("cartTotal");

const cartDrawer = document.getElementById("cartDrawer");
const cartBackdrop = document.getElementById("cartBackdrop");
const openCartBtn = document.getElementById("openCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const clearCartBtn = document.getElementById("clearCartBtn");
const proceedCheckoutBtn = document.getElementById("proceedCheckoutBtn");

const quickViewModal = document.getElementById("quickViewModal");
const closeQuickViewBtn = document.getElementById("closeQuickViewBtn");
const qvImage = document.getElementById("qvImage");
const qvBrand = document.getElementById("qvBrand");
const qvTitle = document.getElementById("qvTitle");
const qvPrice = document.getElementById("qvPrice");
const qvFabric = document.getElementById("qvFabric");
const qvDesc = document.getElementById("qvDesc");
const qvSizes = document.getElementById("qvSizes");
const qvAddBtn = document.getElementById("qvAddBtn");

const checkoutModal = document.getElementById("checkoutModal");
const closeCheckoutBtn = document.getElementById("closeCheckoutBtn");
const checkoutForm = document.getElementById("checkoutForm");
const deliveryType = document.getElementById("deliveryType");
const deliveryAddressGroup = document.getElementById("deliveryAddressGroup");
const customerAddress = document.getElementById("customerAddress");
const whatsappTarget = document.getElementById("whatsappTarget");
const paymentMethod = document.getElementById("paymentMethod");
const instapayBox = document.getElementById("instapayBox");
const instapayAmount = document.getElementById("instapayAmount");
const instapayRef = document.getElementById("instapayRef");
const checkoutSummary = document.getElementById("checkoutSummary");
const orderSuccess = document.getElementById("orderSuccess");
const orderSuccessMsg = document.getElementById("orderSuccessMsg");
const whatsappFallbackLink = document.getElementById("whatsappFallbackLink");
const whatsappFallbackLink2 = document.getElementById("whatsappFallbackLink2");
const doneSuccessBtn = document.getElementById("doneSuccessBtn");

const copyAddressBtn = document.getElementById("copyAddressBtn");
const toastEl = document.getElementById("toast");

let toastTimer = null;

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // تجاهل أخطاء التخزين المحلي إذا كان معطلاً
  }
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2600);
}

function getSelectedSizeFromCard(productId) {
  const card = document.querySelector(`.product-card[data-product-id="${productId}"]`);
  const activeBtn = card ? card.querySelector(".size-btn.active") : null;
  return activeBtn ? activeBtn.dataset.size : "L";
}

function addToCart(productId, size) {
  const product = PRODUCTS[productId];
  if (!product) return;

  const existing = cart.find((item) => item.id === productId && item.size === size);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, size, qty: 1 });
  }

  saveCart();
  renderCart();
  showToast(`تمت إضافة "${product.name}" (مقاس ${size}) إلى السلة`);
}

function updateItemQty(productId, size, delta) {
  const index = cart.findIndex((item) => item.id === productId && item.size === size);
  if (index === -1) return;

  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  saveCart();
  renderCart();
}

function removeFromCart(productId, size) {
  cart = cart.filter((item) => !(item.id === productId && item.size === size));
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
  showToast("تم تفريغ السلة");
}

function getCartTotals() {
  return cart.reduce(
    (acc, item) => {
      const product = PRODUCTS[item.id];
      if (!product) return acc;
      acc.count += item.qty;
      acc.total += product.price * item.qty;
      return acc;
    },
    { count: 0, total: 0 }
  );
}

function renderCart() {
  const { count, total } = getCartTotals();
  cartCountEl.textContent = count;
  drawerItemCountEl.textContent = `(${count})`;
  cartTotalEl.textContent = `${total} ج.م`;

  // إزالة العناصر القديمة فقط مع إبقاء emptyCartState
  cartItemsContainer.querySelectorAll(".cart-item").forEach((el) => el.remove());

  if (cart.length === 0) {
    emptyCartState.hidden = false;
    cartFooter.hidden = true;
    return;
  }

  emptyCartState.hidden = true;
  cartFooter.hidden = false;

  cart.forEach((item) => {
    const product = PRODUCTS[item.id];
    if (!product) return;

    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";
    itemEl.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <div class="cart-item-info">
        <div class="cart-item-top">
          <div>
            <div class="cart-item-title">${product.name}</div>
            <div class="cart-item-meta">المقاس: ${item.size} • ${product.fabric}</div>
          </div>
          <button type="button" class="remove-item-btn" aria-label="حذف القطعة">حذف</button>
        </div>
        <div class="cart-item-bottom">
          <div class="qty-controls">
            <button type="button" class="qty-btn qty-plus" aria-label="زيادة الكمية">+</button>
            <span>${item.qty}</span>
            <button type="button" class="qty-btn qty-minus" aria-label="تقليل الكمية">−</button>
          </div>
          <span class="cart-item-subtotal">${product.price * item.qty} ج.م</span>
        </div>
      </div>
    `;

    itemEl.querySelector(".qty-plus").addEventListener("click", () => updateItemQty(item.id, item.size, 1));
    itemEl.querySelector(".qty-minus").addEventListener("click", () => updateItemQty(item.id, item.size, -1));
    itemEl.querySelector(".remove-item-btn").addEventListener("click", () => removeFromCart(item.id, item.size));

    cartItemsContainer.appendChild(itemEl);
  });
}

function openCart() {
  cartDrawer.classList.add("open");
  cartBackdrop.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartBackdrop.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

function openQuickView(productId) {
  const product = PRODUCTS[productId];
  if (!product) return;
  activeQuickViewId = productId;

  qvImage.src = product.image;
  qvImage.alt = product.name;
  qvBrand.textContent = `${product.brand} • ${product.color}`;
  qvTitle.textContent = product.name;
  qvPrice.textContent = `${product.price} جنيه`;
  qvFabric.textContent = `الخامة: ${product.fabric}`;
  qvDesc.textContent = product.description;

  const selected = getSelectedSizeFromCard(productId);
  qvSizes.querySelectorAll(".size-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.size === selected);
  });

  quickViewModal.classList.add("open");
  quickViewModal.setAttribute("aria-hidden", "false");
}

function closeQuickView() {
  quickViewModal.classList.remove("open");
  quickViewModal.setAttribute("aria-hidden", "true");
}

function openCheckout() {
  if (cart.length === 0) return;
  closeCart();

  orderSuccess.hidden = true;
  checkoutForm.hidden = false;
  instapayBox.hidden = paymentMethod.value !== "instapay";

  const { total } = getCartTotals();
  instapayAmount.textContent = `${total} جنيه`;
  const lines = cart
    .map((item) => {
      const p = PRODUCTS[item.id];
      return p ? `<div>• ${p.name} (مقاس ${item.size}) × ${item.qty} = <strong>${p.price * item.qty} ج.م</strong></div>` : "";
    })
    .join("");

  checkoutSummary.innerHTML = `
    <div style="margin-bottom:6px; font-weight:800; color:var(--orange);">ملخص طلبك:</div>
    ${lines}
    <div style="margin-top:8px; padding-top:8px; border-top:1px solid var(--border); font-weight:900;">
      الإجمالي الكلي: <span style="color:var(--orange);">${total} جنيه</span>
    </div>
  `;

  checkoutModal.classList.add("open");
  checkoutModal.setAttribute("aria-hidden", "false");
}

function closeCheckout() {
  checkoutModal.classList.remove("open");
  checkoutModal.setAttribute("aria-hidden", "true");
}

// أحداث اختيار المقاسات في البطاقات
document.querySelectorAll(".product-card .size-options").forEach((group) => {
  group.addEventListener("click", (e) => {
    const btn = e.target.closest(".size-btn");
    if (!btn) return;
    group.querySelectorAll(".size-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// أزرار الإضافة للسلة في البطاقات
document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const productId = btn.dataset.id;
    const size = getSelectedSizeFromCard(productId);
    addToCart(productId, size);
    openCart();
  });
});

// أزرار المعاينة السريعة
document.querySelectorAll("[data-quick-view]").forEach((btn) => {
  btn.addEventListener("click", () => {
    openQuickView(btn.dataset.quickView);
  });
});

// اختيار المقاس داخل المعاينة السريعة
qvSizes.addEventListener("click", (e) => {
  const btn = e.target.closest(".size-btn");
  if (!btn) return;
  qvSizes.querySelectorAll(".size-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
});

qvAddBtn.addEventListener("click", () => {
  if (!activeQuickViewId) return;
  const activeBtn = qvSizes.querySelector(".size-btn.active");
  const size = activeBtn ? activeBtn.dataset.size : "L";
  addToCart(activeQuickViewId, size);
  closeQuickView();
  openCart();
});

// أحداث السلة
openCartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);
clearCartBtn.addEventListener("click", clearCart);
proceedCheckoutBtn.addEventListener("click", openCheckout);

// إغلاق النوافذ المنبثقة
closeQuickViewBtn.addEventListener("click", closeQuickView);
quickViewModal.addEventListener("click", (e) => {
  if (e.target === quickViewModal) closeQuickView();
});

closeCheckoutBtn.addEventListener("click", closeCheckout);
checkoutModal.addEventListener("click", (e) => {
  if (e.target === checkoutModal) closeCheckout();
});

// تبديل طريقة الاستلام وطريقة الدفع
deliveryType.addEventListener("change", () => {
  const isDelivery = deliveryType.value === "delivery";
  deliveryAddressGroup.hidden = !isDelivery;
  customerAddress.required = isDelivery;
});

paymentMethod.addEventListener("change", () => {
  instapayBox.hidden = paymentMethod.value !== "instapay";
});

function buildWhatsAppOrderMessage({ name, phone, isPickup, address, isInstapay, ref, total }) {
  const itemsText = cart
    .map((item, idx) => {
      const p = PRODUCTS[item.id];
      if (!p) return "";
      return `${idx + 1}. ${p.name} (${p.brand} - ${p.fabric})\n   المقاس: ${item.size} | الكمية: ${item.qty} | السعر: ${p.price * item.qty} ج.م`;
    })
    .filter(Boolean)
    .join("\n");

  const deliveryText = isPickup
    ? `استلام من الفرع (${STORE_ADDRESS})`
    : `توصيل للمنزل — العنوان: ${address}`;

  const paymentText = isInstapay
    ? `إنستا باي (InstaPay)${ref ? ` — حساب/مرجع: ${ref}` : ""} — برجاء إرسال بيانات التحويل`
    : "الدفع كاش عند الاستلام";

  return [
    "🛍️ *طلب جديد من متجر الشافعي*",
    "━━━━━━━━━━━━━━",
    `👤 *الاسم:* ${name}`,
    `📞 *الهاتف:* ${phone}`,
    `📍 *الاستلام:* ${deliveryText}`,
    `💳 *الدفع:* ${paymentText}`,
    "",
    "👕 *القطع المطلوبة:*",
    itemsText,
    "━━━━━━━━━━━━━━",
    `💰 *الإجمالي الكلي:* ${total} جنيه`,
    isInstapay ? "\n💳 برجاء تزويدي برقم أو عنوان إنستا باي لإتمام التحويل." : ""
  ]
    .filter(Boolean)
    .join("\n");
}

async function copyTextWithToast(text, successMsg) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMsg);
  } catch {
    showToast(text);
  }
}

// إرسال نموذج الطلب
checkoutForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const address = customerAddress.value.trim();
  const isPickup = deliveryType.value === "pickup";
  const isInstapay = paymentMethod.value === "instapay";
  const ref = instapayRef.value.trim();
  const selectedWa = whatsappTarget.value;
  const selectedWaDisplay = WHATSAPP_NUMBERS[selectedWa] || "01152798726";
  const { total } = getCartTotals();

  const message = buildWhatsAppOrderMessage({
    name,
    phone,
    isPickup,
    address,
    isInstapay,
    ref,
    total
  });
  const encodedMsg = encodeURIComponent(message);
  const waUrlPrimary = `https://wa.me/201152798726?text=${encodedMsg}`;
  const waUrlSecondary = `https://wa.me/201130837894?text=${encodedMsg}`;
  const chosenUrl = `https://wa.me/${selectedWa}?text=${encodedMsg}`;

  whatsappFallbackLink.href = waUrlPrimary;
  whatsappFallbackLink2.href = waUrlSecondary;
  window.open(chosenUrl, "_blank", "noopener");

  checkoutForm.hidden = true;
  orderSuccess.hidden = false;

  orderSuccessMsg.textContent = isInstapay
    ? `تم تجهيز طلبك بقيمة ${total} جنيه لإرساله لواتساب الشافعي (${selectedWaDisplay}). اضغط على أحد الأرقام بالأسفل لو محوّلكش تلقائياً عشان نبعتلك بيانات إنستا باي وتأكد الطلب.`
    : `تم تجهيز طلبك بقيمة ${total} جنيه لإرساله لواتساب الشافعي (${selectedWaDisplay}). لو الصفحة مفتحتش تلقائياً، اختر الرقم المناسب بالأسفل.`;

  cart = [];
  saveCart();
  renderCart();
  checkoutForm.reset();
  deliveryAddressGroup.hidden = true;
  customerAddress.required = false;
  instapayBox.hidden = true;
});

doneSuccessBtn.addEventListener("click", closeCheckout);

// نسخ العنوان
copyAddressBtn.addEventListener("click", () => {
  copyTextWithToast(STORE_ADDRESS, "تم نسخ عنوان متجر الشافعي بنجاح");
});

// إغلاق بزر Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeCart();
    closeQuickView();
    closeCheckout();
  }
});

// تهيئة السلة عند التحميل
renderCart();
