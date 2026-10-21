import React, { useEffect, useRef, useState } from 'react';
import { useStore } from './store/useStore';
import { CartDrawer } from './components/CartDrawer';
import { AdminModal } from './components/AdminModal';
import { InstallButton } from './components/InstallButton';
import { flyToCart } from './utils/format';

export default function App() {
  const { menu, cart, bumpCount, toastMsg, addToCart, setCartOpen, setAdminOpen, lookupItem } = useStore();
  const [activeCatId, setActiveCatId] = useState<string>(menu.categories[0]?.id || 'beef');
  const cartBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onHashChange = () => { if (window.location.hash === '#admin') setAdminOpen(true); };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [setAdminOpen]);

  const currentCat = menu.categories.find((c) => c.id === activeCatId) || menu.categories[0];
  const categoryItems = menu.items.filter((i) => i.cat === currentCat.id);
  const totalCount = cart.filter((c) => lookupItem(c.k) !== null).reduce((sum, c) => sum + c.qty, 0);

  const handlePriceClick = (key: string, e: React.MouseEvent<HTMLButtonElement>) => {
    addToCart(key);
    flyToCart(e.currentTarget, cartBtnRef.current);
  };

  return (
    <div className="min-h-screen bg-[#1a0c0c] text-[#fff4e6] leading-[1.7]">
      <header className="bg-linear-to-b from-[#7a0f18] to-[#4a0a10] text-center pt-[34px] pb-[30px] px-[18px]">
        <img src="images/logo.jpg" alt="Burger Station" className="w-[110px] rounded-[14px] mx-auto" />
        <h1 className="mt-2.5 mb-0 text-[#ffc300] font-bold text-[clamp(2rem,8vw,3.2rem)]">Burger Station</h1>
        <p className="mt-1 mb-[18px]">أول مطعم برجر متخصص في كفر الدوار · ⭐ 4.8</p>
        <div>
          <a href="tel:01006446834" className="inline-block bg-[#ffc300] text-[#2a1414] font-bold no-underline py-[11px] px-[22px] rounded-full m-1">📞 01006446834</a>
          <a href="tel:01125540746" className="inline-block bg-[#ffc300] text-[#2a1414] font-bold no-underline py-[11px] px-[22px] rounded-full m-1">📞 01125540746</a>
        </div>
      </header>

      <main className="max-w-[820px] mx-auto px-[18px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3 my-[22px]">
          <img src="images/burger-1.jpg" alt="برجر" className="w-full h-[240px] object-cover rounded-[14px]" />
          <img src="images/burger-2.jpg" alt="تشيزي مشروم" className="w-full h-[240px] object-cover rounded-[14px]" />
        </div>

        <h2 className="flex justify-between items-baseline text-[#ffc300] text-2xl font-bold mt-7 mb-2.5">
          <span>المنيو</span><span dir="ltr">Menu</span>
        </h2>
        <p className="text-[#c9a99a] text-[0.9rem] mb-3">اضغط على السعر لإضافة الصنف للسلة 🛒</p>

        <div className="flex flex-wrap gap-2 mb-3">
          {menu.categories.map((cat) => (
            <button key={cat.id} onClick={() => setActiveCatId(cat.id)} className={`px-[18px] py-[9px] rounded-full border border-[#c1121f] text-[#fff4e6] cursor-pointer ${cat.id === currentCat.id ? 'bg-[#c1121f]' : 'bg-[#2a1414]'}`}>
              {cat.ar}
            </button>
          ))}
        </div>

        <div>
          {currentCat.sized && (
            <div className="grid grid-cols-[minmax(0,1fr)_116px_minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_128px_minmax(0,1fr)] items-center gap-1.5 px-3 pt-2 text-[#c9a99a] text-[0.9rem] mb-1.5">
              <span /><span className="flex justify-center gap-1.5"><b className="w-[52px] sm:w-[60px] text-center">Single</b><b className="w-[52px] sm:w-[60px] text-center">Double</b></span><span />
            </div>
          )}
          {categoryItems.map((item) => (
            <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_116px_minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_128px_minmax(0,1fr)] items-center gap-1.5 px-2 sm:px-3 py-2 bg-[#2a1414] rounded-[10px] mb-1.5 min-h-[44px]">
              <span className="flex items-center gap-2 text-right">
                {item.img && <img src={item.img} alt="" loading="lazy" className="w-[44px] h-[44px] rounded-lg object-cover shrink-0" />}
                <span>{item.ar}</span>
              </span>
              <span className="flex justify-center gap-1.5">
                <button onClick={(e) => handlePriceClick(`${item.id}|s`, e)} className="w-[52px] sm:w-[60px] text-center bg-transparent border border-[#ffc300] text-[#ffc300] rounded-lg py-1 font-bold cursor-pointer active:scale-90">{item.p1} +</button>
                {currentCat.sized && item.p2 != null && (
                  <button onClick={(e) => handlePriceClick(`${item.id}|d`, e)} className="w-[52px] sm:w-[60px] text-center bg-transparent border border-[#ffc300] text-[#ffc300] rounded-lg py-1 font-bold cursor-pointer active:scale-90">{item.p2} +</button>
                )}
              </span>
              <span dir="ltr" className="text-left text-[#c9a99a] text-[0.8rem] sm:text-[0.92rem]">{item.en}</span>
            </div>
          ))}
        </div>

        <h2 className="flex justify-between items-baseline text-[#ffc300] text-2xl font-bold mt-7 mb-2.5">
          <span>زورونا</span><span dir="ltr">Visit Us</span>
        </h2>
        <div className="bg-[#2a1414] rounded-[14px] p-4">
          <p className="my-1">📍 كفر الدوار، ش. الحدائق، أبراج الحلواني، أمام الكنيسة</p>
          <p className="my-1">🕚 من 11 صباحًا حتى 6 صباحًا · 🛵 توصيل · 🥡 سفري</p>
          <a href="https://www.google.com/maps/place/burger+station/@31.14526,30.1241231,18z" target="_blank" rel="noopener noreferrer" className="inline-block bg-[#ffc300] text-[#2a1414] font-bold no-underline py-[11px] px-[22px] rounded-full m-1 mt-2">📍 افتح اللوكيشن على خرائط جوجل</a>
        </div>
      </main>

      <footer className="text-center text-[#c9a99a] py-7 px-[18px] text-[0.9rem]">
        © Burger Station - كفر الدوار <a href="#admin" onClick={(e) => { e.preventDefault(); setAdminOpen(true); }} title="Admin" className="text-[#c9a99a] no-underline opacity-35 ms-2">⚙</a>
      </footer>

      <InstallButton />
      <button ref={cartBtnRef} onClick={() => setCartOpen(true)} aria-label="سلة التسوق" className="fixed top-[calc(12px+env(safe-area-inset-top,0px))] right-3 z-20 w-[52px] h-[52px] rounded-full border-0 bg-[#ffc300] text-[#2a1414] cursor-pointer shadow-lg flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7"><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 7H6" /></svg>
        <span className={`absolute -top-1 -left-1 min-w-[22px] h-[22px] rounded-[11px] bg-[#c1121f] text-white text-[0.8rem] font-bold flex items-center justify-center transition-transform ${bumpCount ? 'scale-130' : 'scale-100'}`}>{totalCount}</span>
      </button>

      <CartDrawer />
      <AdminModal />
      <div className={`fixed left-1/2 bottom-[calc(24px+env(safe-area-inset-bottom,0px))] bg-[#ffc300] text-[#2a1414] font-bold py-[11px] px-5 rounded-full z-[60] transition-transform duration-300 ${toastMsg ? '-translate-x-1/2 translate-y-0' : '-translate-x-1/2 translate-y-[120px]'}`}>{toastMsg}</div>
    </div>
  );
}
