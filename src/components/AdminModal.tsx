import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { MenuItem } from '../data/menuData';
import { compressImage, CONFIG } from '../utils/format';

export const AdminModal: React.FC = () => {
  const { menu, isAdminOpen, setAdminOpen, setMenu, resetMenu, showToast } = useStore();
  const [authed, setAuthed] = useState<boolean>(() => { try { return sessionStorage.getItem('bs_admin') === '1'; } catch { return false; } });
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [catId, setCatId] = useState(menu.categories[0].id);
  const [ar, setAr] = useState('');
  const [en, setEn] = useState('');
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [img, setImg] = useState('');
  const [uploadedDataUrl, setUploadedDataUrl] = useState('');

  if (!isAdminOpen) return null;

  const handleLogin = () => {
    if (password === CONFIG.adminPassword) {
      try { sessionStorage.setItem('bs_admin', '1'); } catch {}
      setAuthed(true); setLoginErr('');
    } else setLoginErr('كلمة السر غلط');
  };

  const openAddForm = () => {
    setEditingItem(null); setCatId(menu.categories[0].id); setAr(''); setEn(''); setP1(''); setP2(''); setImg(''); setUploadedDataUrl(''); setIsFormOpen(true);
  };

  const openEditForm = (item: MenuItem) => {
    setEditingItem(item); setCatId(item.cat); setAr(item.ar); setEn(item.en); setP1(String(item.p1)); setP2(item.p2 != null ? String(item.p2) : ''); setImg(item.img || ''); setUploadedDataUrl(''); setIsFormOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { const compressed = await compressImage(file); setUploadedDataUrl(compressed); showToast('تم رفع الصورة'); } catch { alert('حدث خطأ أثناء ضغط الصورة'); }
  };

  const handleSaveItem = () => {
    const numP1 = parseFloat(p1);
    if (!ar.trim() || isNaN(numP1)) { alert('اكتب الاسم والسعر'); return; }
    const category = menu.categories.find((c) => c.id === catId) || menu.categories[0];
    const newItem: MenuItem = {
      id: editingItem ? editingItem.id : 'x' + Date.now().toString(36),
      cat: category.id, ar: ar.trim(), en: en.trim(), p1: numP1,
      p2: category.sized && p2.trim() !== '' ? parseFloat(p2) : null,
      img: uploadedDataUrl || img.trim(),
    };
    const nextMenu = structuredClone(menu);
    const idx = nextMenu.items.findIndex((i) => i.id === newItem.id);
    if (idx >= 0) nextMenu.items[idx] = newItem; else nextMenu.items.push(newItem);
    if (!setMenu(nextMenu)) { alert('المساحة ممتلئة: استخدم صور أصغر أو مسار images/'); return; }
    setIsFormOpen(false); setEditingItem(null); showToast('تم الحفظ ✓');
  };

  const handleDeleteItem = (id: string) => {
    if (!confirm('تحذف الصنف ده؟')) return;
    setMenu({ ...menu, items: menu.items.filter((i) => i.id !== id) });
  };

  const handleExport = () => {
    const txt = 'const DEFAULT_MENU = ' + JSON.stringify(menu, null, 1) + ';\n';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/javascript' }));
    a.download = 'menu-data.js'; a.click();
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-[80] flex justify-center items-start overflow-auto p-5">
      <div className="bg-[#241010] rounded-[14px] p-[18px] w-[min(720px,100%)]">
        {!authed ? (
          <div>
            <h2 className="text-[#ffc300] text-xl font-bold mt-2 mb-3">🔒 لوحة الإدارة</h2>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="كلمة السر" autoFocus className="w-full p-2.5 rounded-lg border border-[#6a3a3a] bg-[#1a0c0c] text-[#fff4e6] my-1 mb-3" />
            <div className="flex gap-2">
              <button onClick={handleLogin} className="px-3.5 py-1.5 rounded-lg border border-[#ffc300] text-[#ffc300] cursor-pointer">دخول</button>
              <button onClick={() => setAdminOpen(false)} className="px-3.5 py-1.5 rounded-lg border border-[#ffc300] text-[#ffc300] cursor-pointer">إغلاق</button>
            </div>
            {loginErr && <p className="text-[#c9a99a] text-sm mt-2">{loginErr}</p>}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-[#4a2a2a]">
              <h2 className="m-0 text-[#ffc300] text-xl font-bold">⚙️ إدارة المنيو</h2>
              <button onClick={() => setAdminOpen(false)} className="bg-transparent border-0 text-[#fff4e6] text-[1.7rem] cursor-pointer">&times;</button>
            </div>
            <div className="flex flex-wrap gap-2 my-3">
              <button onClick={openAddForm} className="px-3.5 py-1.5 rounded-lg border border-[#ffc300] text-[#ffc300] cursor-pointer">＋ إضافة صنف</button>
              <button onClick={handleExport} className="px-3.5 py-1.5 rounded-lg border border-[#ffc300] text-[#ffc300] cursor-pointer">⬇ تصدير menu-data.js</button>
              <button onClick={() => confirm('ترجع المنيو الأصلي وتمسح تعديلاتك؟') && resetMenu()} className="px-3.5 py-1.5 rounded-lg border border-[#ff7b7b] text-[#ff7b7b] cursor-pointer">استرجاع الافتراضي</button>
            </div>
            {isFormOpen && (
              <div className="bg-[#2a1414] rounded-xl p-3.5 mb-3.5">
                <label className="text-[0.85rem] text-[#c9a99a]">القسم</label>
                <select value={catId} onChange={(e) => setCatId(e.target.value)} className="w-full p-2.5 rounded-lg border border-[#6a3a3a] bg-[#1a0c0c] text-[#fff4e6] my-1 mb-2">
                  {menu.categories.map((c) => <option key={c.id} value={c.id}>{c.ar}</option>)}
                </select>
                <label className="text-[0.85rem] text-[#c9a99a]">الاسم بالعربي</label>
                <input value={ar} onChange={(e) => setAr(e.target.value)} className="w-full p-2.5 rounded-lg border border-[#6a3a3a] bg-[#1a0c0c] text-[#fff4e6] my-1 mb-2" />
                <label className="text-[0.85rem] text-[#c9a99a]">English name</label>
                <input dir="ltr" value={en} onChange={(e) => setEn(e.target.value)} className="w-full p-2.5 rounded-lg border border-[#6a3a3a] bg-[#1a0c0c] text-[#fff4e6] my-1 mb-2" />
                <label className="text-[0.85rem] text-[#c9a99a]">السعر (Single / العادي)</label>
                <input type="number" min="0" value={p1} onChange={(e) => setP1(e.target.value)} className="w-full p-2.5 rounded-lg border border-[#6a3a3a] bg-[#1a0c0c] text-[#fff4e6] my-1 mb-2" />
                <label className="text-[0.85rem] text-[#c9a99a]">سعر Double (اختياري)</label>
                <input type="number" min="0" value={p2} onChange={(e) => setP2(e.target.value)} className="w-full p-2.5 rounded-lg border border-[#6a3a3a] bg-[#1a0c0c] text-[#fff4e6] my-1 mb-2" />
                <label className="text-[0.85rem] text-[#c9a99a]">الصورة (مسار أو رفع ملف)</label>
                <input dir="ltr" value={img} onChange={(e) => setImg(e.target.value)} placeholder="images/..." className="w-full p-2.5 rounded-lg border border-[#6a3a3a] bg-[#1a0c0c] text-[#fff4e6] my-1 mb-2" />
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-2.5 rounded-lg border border-[#6a3a3a] bg-[#1a0c0c] text-[#fff4e6] my-1 mb-3" />
                <div className="flex gap-2">
                  <button onClick={handleSaveItem} className="px-3.5 py-1.5 rounded-lg border border-[#ffc300] text-[#ffc300] cursor-pointer">💾 حفظ</button>
                  <button onClick={() => setIsFormOpen(false)} className="px-3.5 py-1.5 rounded-lg border border-[#ffc300] text-[#ffc300] cursor-pointer">إلغاء</button>
                </div>
              </div>
            )}
            {menu.categories.map((cat) => (
              <div key={cat.id}>
                <div className="text-[#ffc300] mt-[18px] mb-1.5 font-bold">{cat.ar} · {cat.en}</div>
                {menu.items.filter((i) => i.cat === cat.id).map((item) => (
                  <div key={item.id} className="flex gap-2 items-center p-2 bg-[#2a1414] rounded-lg mb-1.5">
                    {item.img && <img src={item.img} alt="" className="w-[44px] h-[44px] rounded-lg object-cover shrink-0" />}
                    <span className="flex-1 text-sm">{item.ar} <small className="text-[#c9a99a]">{item.en}</small><br /><b className="text-[#ffc300]">{item.p1}{item.p2 != null ? ` / ${item.p2}` : ''} ج.م</b></span>
                    <button onClick={() => openEditForm(item)} className="px-3.5 py-1.5 rounded-lg border border-[#ffc300] text-[#ffc300] text-sm cursor-pointer">تعديل</button>
                    <button onClick={() => handleDeleteItem(item.id)} className="px-3.5 py-1.5 rounded-lg border border-[#ff7b7b] text-[#ff7b7b] text-sm cursor-pointer">حذف</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
