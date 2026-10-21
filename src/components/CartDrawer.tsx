import React, { useRef } from 'react';
import { useStore } from '../store/useStore';
import { CONFIG, toArabicDigits } from '../utils/format';

export const CartDrawer: React.FC = () => {
  const { cart, customer, isCartOpen, setCartOpen, updateCartQty, removeFromCart, setCustomer, lookupItem, showToast } = useStore();
  const phoneRef = useRef<HTMLInputElement>(null);
  const addrRef = useRef<HTMLTextAreaElement>(null);

  const resolvedItems = cart.map((c) => { const info = lookupItem(c.k); return info ? { ...c, ...info } : null; }).filter((x): x is NonNullable<typeof x> => x !== null);
  const totalAmount = resolvedItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const sendOrder = () => {
    if (!resolvedItems.length) return;
    const name = customer.name.trim(), phone = customer.phone.trim(), addr = customer.addr.trim();
    if (!phone || !addr) {
      showToast('من فضلك اكتب التليفون والعنوان');
      if (!phone) phoneRef.current?.focus(); else addrRef.current?.focus();
      return;
    }
    const lines = resolvedItems.map((item, idx) => `${toArabicDigits(idx + 1)}. ${item.name} × ${toArabicDigits(item.qty)} = ${toArabicDigits(item.price * item.qty)} ${CONFIG.currency}`);
    const msg = ['🍔 *طلب جديد - Burger Station*', '', ...(name ? [`👤 الاسم: ${name}`] : []), `📞 الهاتف: ${toArabicDigits(phone)}`, `📍 العنوان: ${addr}`, '', '🧾 *تفاصيل الطلب:*', ...lines, '', `💰 *الإجمالي: ${toArabicDigits(totalAmount)} ${CONFIG.currency}*`].join('\n');
    const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
    if (!window.open(url, '_blank')) window.location.href = url;
  };

  return (
    <>
      <div onClick={() => setCartOpen(false)} className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-250 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} />
      <aside aria-label="سلة الطلبات" className={`fixed top-0 right-0 bottom-0 w-[min(420px,100%)] bg-[#241010] text-[#fff4e6] z-40 flex flex-col pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-[105%]'}`}>
        <div className="flex justify-between items-center px-[18px] py-[14px] border-b border-[#4a2a2a]">
          <h2 className="m-0 text-[#ffc300] text-xl font-bold">🛒 سلة الطلبات</h2>
          <button onClick={() => setCartOpen(false)} aria-label="إغلاق" className="bg-transparent border-0 text-[#fff4e6] text-[1.7rem] cursor-pointer leading-none">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto px-[18px] py-[10px]">
          {resolvedItems.length === 0 ? (
            <p className="text-[#c9a99a] text-center mt-10">السلة فاضية</p>
          ) : (
            resolvedItems.map((item) => (
              <div key={item.k} className="grid grid-cols-[52px_1fr] gap-3 py-3 border-b border-[#4a2a2a]">
                {item.img ? <img src={item.img} alt="" className="w-[52px] h-[52px] rounded-xl object-cover" /> : <div className="text-[2rem] bg-[#2a1414] rounded-xl flex items-center justify-center h-[52px]">{item.emoji}</div>}
                <div>
                  <h4 className="m-0 font-bold">{item.name}</h4>
                  <small className="text-[#c9a99a]">{toArabicDigits(item.price)} {CONFIG.currency}</small>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <button onClick={() => updateCartQty(item.k, -1)} className="w-[30px] h-[30px] rounded-lg border border-[#6a3a3a] bg-transparent text-[#fff4e6] cursor-pointer">&minus;</button>
                    <b className="min-w-[20px] text-center">{toArabicDigits(item.qty)}</b>
                    <button onClick={() => updateCartQty(item.k, 1)} className="w-[30px] h-[30px] rounded-lg border border-[#6a3a3a] bg-transparent text-[#fff4e6] cursor-pointer">+</button>
                    <b className="text-[#ffc300] ms-auto">{toArabicDigits(item.price * item.qty)} {CONFIG.currency}</b>
                    <button onClick={() => removeFromCart(item.k)} className="h-[30px] px-2.5 rounded-lg border border-[#ff7b7b] text-[#ff7b7b] text-xs cursor-pointer bg-transparent">حذف</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="px-[18px] pt-2.5 border-t border-[#4a2a2a]">
          <input value={customer.name} onChange={(e) => setCustomer({ name: e.target.value })} placeholder="الاسم (اختياري)" className="w-full p-2.5 rounded-lg border border-[#6a3a3a] bg-[#1a0c0c] text-[#fff4e6] my-1 mb-2" />
          <input ref={phoneRef} type="tel" value={customer.phone} onChange={(e) => setCustomer({ phone: e.target.value })} placeholder="رقم التليفون" className="w-full p-2.5 rounded-lg border border-[#6a3a3a] bg-[#1a0c0c] text-[#fff4e6] my-1 mb-2" />
          <textarea ref={addrRef} rows={2} value={customer.addr} onChange={(e) => setCustomer({ addr: e.target.value })} placeholder="العنوان بالتفصيل" className="w-full p-2.5 rounded-lg border border-[#6a3a3a] bg-[#1a0c0c] text-[#fff4e6] my-1 mb-2" />
        </div>
        <div className="px-[18px] py-4 border-t border-[#4a2a2a]">
          <div className="flex justify-between text-[1.2rem] font-extrabold mb-3 text-[#ffc300]">
            <span>الإجمالي</span>
            <span>{toArabicDigits(totalAmount)} {CONFIG.currency}</span>
          </div>
          <button onClick={sendOrder} disabled={resolvedItems.length === 0} className="w-full bg-[#25d366] text-[#052e16] font-extrabold border-0 rounded-[10px] p-[13px] cursor-pointer disabled:opacity-40">إرسال الطلب</button>
        </div>
      </aside>
    </>
  );
};
