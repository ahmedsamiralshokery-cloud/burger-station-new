export const CONFIG = {
  whatsapp: '201006446834',
  currency: 'ج.م',
  adminPassword: 'burger2026',
  menuKey: 'bs_menu',
  cartKey: 'bs_cart',
  custKey: 'bs_customer',
};

export const toArabicDigits = (val: string | number): string =>
  String(val).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

export const compressImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 600 / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas error'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const flyToCart = (sourceEl: HTMLElement, targetEl: HTMLElement | null) => {
  if (!targetEl) return;
  const r = sourceEl.getBoundingClientRect();
  const c = targetEl.getBoundingClientRect();
  const dot = document.createElement('div');
  dot.className = 'fixed w-4 h-4 rounded-full bg-[#ffc300] z-[70] pointer-events-none';
  dot.style.left = `${r.left + r.width / 2}px`;
  dot.style.top = `${r.top}px`;
  document.body.appendChild(dot);

  const anim = dot.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${c.left + 18 - r.left - r.width / 2}px, ${c.top + 18 - r.top}px) scale(0.3)`, opacity: 0.4 }
    ],
    { duration: 650, easing: 'ease-in' }
  );
  anim.onfinish = () => dot.remove();
};
