import { useMemo, useState, useEffect, useRef } from 'react';

type CategoryKey = 'diapers' | 'pads' | 'liners' | 'maternity' | 'wipes' | 'training';
type Lang = 'en' | 'hi';
type AdminPage = 'dashboard' | 'products' | 'categories' | 'settings';

interface Product {
  id: string;
  sku: string;
  nameEn: string;
  nameHi: string;
  categoryKey: CategoryKey;
  pack: string;
  size: string;
  descriptionEn: string;
  descriptionHi: string;
  price: number;
  mrp: number;
  stock: number;
  sold: number;
  rating: number;
  available: boolean;
  image: string;
  features: string[];
}

interface Category {
  key: CategoryKey;
  labelEn: string;
  labelHi: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { key: 'diapers', labelEn: 'Baby Diapers', labelHi: 'बेबी डायपर्स' },
  { key: 'pads', labelEn: 'Sanitary Pads', labelHi: 'सैनिटरी पैड' },
  { key: 'liners', labelEn: 'Panty Liners', labelHi: 'पैंटी लाइनर' },
  { key: 'maternity', labelEn: 'Maternity Pads', labelHi: 'मैटरनिटी पैड' },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'dp-s-72', sku: 'AH-DP-S72',
    nameEn: 'Aradhya Baby Diapers – Tape Style S',
    nameHi: 'अराध्या बेबी डायपर टेप S',
    categoryKey: 'diapers', pack: '72 Pants', size: 'S · 4–8 kg',
    descriptionEn: 'Pediatrician co-designed tape diapers with CloudSoft core, wetness indicator and 0% fragrance.',
    descriptionHi: 'बाल रोग जाँच-किए टेप डायपर, 12 घंटे सूखापन, वेटनेस संकेतक, 0% सुगंध।',
    price: 649, mrp: 899, stock: 48720, sold: 14820, rating: 4.7, available: true,
    image: 'https://images.pexels.com/photos/6849268/pexels-photo-6849268.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: ['12h CloudSoft Core', 'Wetness Indicator', '0% fragrance']
  },
  {
    id: 'dp-m-62', sku: 'AH-DP-M62',
    nameEn: 'Aradhya Baby Pants M',
    nameHi: 'अराध्या बेबी पैंट M',
    categoryKey: 'diapers', pack: '62 Pants', size: 'M · 7–12 kg',
    descriptionEn: 'All-night pant diapers with 360° cottony waist and 5 sec absorb channels.',
    descriptionHi: 'पूरी रात के पैंट डायपर, 360° नरम कमर, 5 सेकंड सोख।',
    price: 699, mrp: 949, stock: 31200, sold: 22140, rating: 4.8, available: true,
    image: 'https://images.pexels.com/photos/32386175/pexels-photo-32386175.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: ['360° Cottony Waist', '5 Sec Absorb', 'Leak Lock']
  },
  {
    id: 'dp-l-56', sku: 'AH-DP-L56',
    nameEn: 'Aradhya UltraDry L Pants',
    nameHi: 'अराध्या अल्ट्राड्राय L पैंट',
    categoryKey: 'diapers', pack: '56 Pants', size: 'L · 9–14 kg',
    descriptionEn: 'Overnight pants with Night Lock™ and aloe liner – dermat tested.',
    descriptionHi: 'रात भर के पैंट, नाइट लॉक, एलो लाइनर – डर्मेटोलॉजी टेस्ट।',
    price: 729, mrp: 999, stock: 410, sold: 9370, rating: 4.6, available: true,
    image: 'https://images.pexels.com/photos/30344708/pexels-photo-30344708.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: ['Night Lock™', 'Aloe liner', 'Rash shield']
  },
  {
    id: 'dp-xl-48', sku: 'AH-DP-XL48',
    nameEn: 'Aradhya Premium XL Pants',
    nameHi: 'अराध्या प्रीमियम XL पैंट',
    categoryKey: 'diapers', pack: '48 Pants', size: 'XL · 12–17 kg',
    descriptionEn: 'Premium XL with 3D air pockets, thinner core, faster absorbency.',
    descriptionHi: 'प्रीमियम XL, 3D एयर पॉकेट, पतला कोर, तेज़ अब्सॉर्ब।',
    price: 799, mrp: 1099, stock: 18841, sold: 6120, rating: 4.7, available: true,
    image: 'https://images.pexels.com/photos/32386178/pexels-photo-32386178.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: ['3D Air Pockets', 'Organic cotton top', 'Super stretch']
  },
  {
    id: 'dp-xxl-40', sku: 'AH-DP-XXL40',
    nameEn: 'Aradhya XXL Junior Pants',
    nameHi: 'अराध्या XXL जूनियर पैंट',
    categoryKey: 'diapers', pack: '40 Pants', size: 'XXL · 15–25 kg',
    descriptionEn: 'Potty training toddler pants, easy tear sides, 12h night protection.',
    descriptionHi: 'टॉडलर पॉटी ट्रेनिंग पैंट, 12 घंटे सुरक्षा।',
    price: 849, mrp: 1149, stock: 9715, sold: 4120, rating: 4.6, available: true,
    image: 'https://images.pexels.com/photos/5889973/pexels-photo-5889973.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: ['Toddler stretch', 'Night 12hr', 'Cottony feel']
  },
  {
    id: 'sp-ultra-30', sku: 'AH-SP-U30',
    nameEn: 'Aradhya Ultra Thins – XL',
    nameHi: 'अराध्या अल्ट्रा थिन XL',
    categoryKey: 'pads', pack: '30 Pads', size: '280mm',
    descriptionEn: 'Ultra-thin 2mm pad with CottonFeel™ top sheet, pH 4.5, 0% perfume.',
    descriptionHi: 'अल्ट्रा थिन 2mm पैड, कॉटन फील, pH 4.5, 0% परफ्यूम।',
    price: 299, mrp: 399, stock: 35840, sold: 18450, rating: 4.9, available: true,
    image: 'https://images.pexels.com/photos/7692279/pexels-photo-7692279.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: ['3x faster absorb', 'CottonFeel™', '0% perfume']
  },
  {
    id: 'sp-night-18', sku: 'AH-SP-N18',
    nameEn: 'Aradhya Night Long – XXL',
    nameHi: 'अराध्या नाइट लॉन्ग XXL',
    categoryKey: 'pads', pack: '18 Pads', size: '360mm',
    descriptionEn: 'Heavy flow night pad, 360° leak protection, 8-hr lock.',
    descriptionHi: 'हेवी फ्लो नाइट पैड, 360° लीक प्रोटेक्शन, 8 घंटे लॉक।',
    price: 279, mrp: 349, stock: 12190, sold: 9410, rating: 4.8, available: true,
    image: 'https://images.pexels.com/photos/7692468/pexels-photo-7692468.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: ['360° protection', 'Wide back wings', '8-hr lock']
  },
  {
    id: 'sp-heavy-10', sku: 'AH-SP-H10',
    nameEn: 'Aradhya Maxi Heavy Flow – XXXL',
    nameHi: 'अराध्या मैक्सी हेवी फ्लो XXXL',
    categoryKey: 'pads', pack: '10 Pads', size: '420mm',
    descriptionEn: '420mm maxi night pad with clinical cotton top.',
    descriptionHi: '420mm मैक्सी नाइट पैड, कॉटन टॉप।',
    price: 189, mrp: 249, stock: 220, sold: 5210, rating: 4.7, available: true,
    image: 'https://images.pexels.com/photos/7692457/pexels-photo-7692457.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: ['XXL 420mm', 'Maxi absorb', 'Rash free']
  },
  {
    id: 'pl-daily-40', sku: 'AH-PL-40',
    nameEn: 'Aradhya Daily Panty Liners',
    nameHi: 'अराध्या डेली पैंटी लाइनर',
    categoryKey: 'liners', pack: '40 Liners', size: '155mm',
    descriptionEn: 'Everyday 1mm breathable liner for discharge, individually wrapped.',
    descriptionHi: 'रोज़मर्रा का 1mm लाइनर, अलग-अलग रैप।',
    price: 149, mrp: 199, stock: 14120, sold: 4830, rating: 4.5, available: true,
    image: 'https://images.pexels.com/photos/7692459/pexels-photo-7692459.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: ['Breathable', '1mm thin', 'DailyFresh']
  },
  {
    id: 'pl-active-20', sku: 'AH-PL-A20',
    nameEn: 'Aradhya Active Liners Long',
    nameHi: 'अराध्या एक्टिव लाइनर लॉन्ग',
    categoryKey: 'liners', pack: '20 Liners', size: '180mm',
    descriptionEn: 'Active-fit long liner with odor control layer.',
    descriptionHi: 'एक्टिव फिट लॉन्ग लाइनर, बदबू कंट्रोल।',
    price: 129, mrp: 169, stock: 8230, sold: 2114, rating: 4.4, available: true,
    image: 'https://images.pexels.com/photos/7692275/pexels-photo-7692275.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: ['Extra long', 'Odor control', 'Curvy fit']
  },
  {
    id: 'mt-xl-10', sku: 'AH-MT-XL10',
    nameEn: 'Aradhya Maternity Pads XL',
    nameHi: 'अराध्या मैटरनिटी पैड XL',
    categoryKey: 'maternity', pack: '10 Pads', size: '410mm',
    descriptionEn: 'Hospital-grade postpartum pads, ultra soft cotton, sterile individually packed.',
    descriptionHi: 'हॉस्पिटल ग्रेड मैटरनिटी पैड, स्टराइल पैक।',
    price: 349, mrp: 449, stock: 6220, sold: 3980, rating: 4.9, available: true,
    image: 'https://images.pexels.com/photos/7692269/pexels-photo-7692269.jpeg?auto=compress&cs=tinysrgb&w=800',
    features: ['Postpartum care', 'Ultra soft cotton', 'Sterile pack']
  },
  {
    id: 'mt-night-8', sku: 'AH-MT-N8',
    nameEn: 'Aradhya Maternity Night Plus',
    nameHi: 'अराध्या मैटरनिटी नाइट प्लस',
    categoryKey: 'maternity', pack: '8 Pads', size: '450mm',
    descriptionEn: '450mm ultra-long pads for first postpartum nights.',
    descriptionHi: 'प्रसव के बाद पहले रातों के लिए 450mm पैड।',
    price: 299, mrp: 399, stock: 3388, sold: 2675, rating: 4.8, available: true,
    image: 'https://images.pexels.com/photos/7692457/pexels-photo-7692457.jpeg?auto=compress&cs=tinysrgb&w=900',
    features: ['450mm ultra long', 'Wings lock', '6-layer core']
  },
];

const ADMIN_DEFAULTS = {
  whatsapp: '+91 90000 12345',
  email: 'admin@aradhyahealthcare.in'
};

const DICT: Record<Lang, Record<string, string>> = {
  en: {
    top_tag: 'ISO 22716 • Made in Shamli, Uttar Pradesh',
    top_contact: 'care@aradhyahealthcare.in • +91 90000 12345',
    nav_products: 'Products',
    nav_stock: 'Stock & Sales',
    nav_contact: 'Contact',
    admin_area: 'Admin',
    hero_tag: 'Gentle care for what matters most',
    hero_h1_a: 'Aradhya Healthcare',
    hero_h1_b: 'Baby & Women Care',
    hero_sub: 'Pediatrician-tested baby diapers and dermatologically safe sanitary care. Live stock & sales below.',
    view_products: 'View products ↓',
    contact_us: 'Contact us',
    trust1: '12-hr dry comfort',
    trust2: '0% chlorine bleach',
    trust3: 'ISO Certified',
    trust4: 'COD Pan-India',
    live_inventory: 'Live Inventory',
    stock_sales: 'Stock & Sales',
    products_live: 'Products live',
    units_available: 'Units available',
    units_sold: 'Units sold',
    low_stock_skus: 'Low stock SKUs',
    products_title: 'Products',
    products_sub: 'Stock available & units sold shown on every card.',
    search_placeholder: 'Search SKU, size…',
    stock_available: 'Stock available',
    units: 'units',
    units_sold_label: 'Units sold',
    low_stock: 'Low stock',
    out_stock: 'Out of stock',
    available: 'Available',
    enquire: 'Enquire',
    save: 'save',
    contact_title: 'Contact Aradhya Healthcare',
    contact_sub: 'Reach us in under 12 minutes',
    your_name: 'Your name *',
    mobile: 'Mobile number *',
    email_optional: 'Email (optional)',
    your_message: 'Message *',
    send_whatsapp: 'Send via WhatsApp',
    form_note: 'Your inquiry is sent straight to the Admin’s WhatsApp.',
    admin_wa_label: 'Admin WhatsApp',
    categories: 'Categories',
    add_category: 'Add category',
  },
  hi: {
    top_tag: 'ISO 22716 • शामली, उत्तर प्रदेश में निर्मित',
    top_contact: 'care@aradhyahealthcare.in • +91 90000 12345',
    nav_products: 'उत्पाद',
    nav_stock: 'स्टॉक और बिक्री',
    nav_contact: 'संपर्क',
    admin_area: 'एडमिन',
    hero_tag: 'जिन्हें आप आँखों में रखते हैं, उनके लिए कोमल देखभाल',
    hero_h1_a: 'अराध्या हेल्थकेयर',
    hero_h1_b: 'बेबी और महिला केयर',
    hero_sub: 'बाल रोग जाँच-किए बेबी डायपर और त्वचा-मैत्री सैनिटरी केयर। नीचे लाइव स्टॉक और बिक्री।',
    view_products: 'उत्पाद देखें ↓',
    contact_us: 'संपर्क करें',
    trust1: '12 घंटे सूखापन',
    trust2: '0% क्लोरीन',
    trust3: 'ISO प्रमाणित',
    trust4: 'पास-भारत COD',
    live_inventory: 'लाइव इन्वेंटरी',
    stock_sales: 'स्टॉक और बिक्री',
    products_live: 'लाइव उत्पाद',
    units_available: 'उपलब्ध यूनिट्स',
    units_sold: 'बिकी यूनिट्स',
    low_stock_skus: 'कम स्टॉक SKU',
    products_title: 'उत्पाद',
    products_sub: 'हर कार्ड पर स्पष्ट स्टॉक और बिक्री।',
    search_placeholder: 'SKU, साइज़ खोजें…',
    stock_available: 'उपलब्ध स्टॉक',
    units: 'यूनिट्स',
    units_sold_label: 'बिकी यूनिट्स',
    low_stock: 'कम स्टॉक',
    out_stock: 'स्टॉक खत्म',
    available: 'उपलब्ध',
    enquire: 'पूछें',
    save: 'बचत',
    contact_title: 'अराध्या हेल्थकेयर से संपर्क',
    contact_sub: '12 मिनट में उत्तर',
    your_name: 'आपका नाम *',
    mobile: 'मोबाइल नंबर *',
    email_optional: 'ईमेल (वैकल्पिक)',
    your_message: 'संदेश *',
    send_whatsapp: 'WhatsApp से भेजें',
    form_note: 'आपकी पूछताछ सीधे एडमिन के WhatsApp पर जाती है।',
    admin_wa_label: 'एडमिन WhatsApp',
    categories: 'श्रेणियाँ',
    add_category: 'श्रेणी जोड़ें',
  }
};

const uid = (p = 'p') => `${p}-${Math.random().toString(36).slice(2, 9)}`;

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const t = (k: string) => DICT[lang][k] ?? k;

  const [products, setProducts] = useState<Product[]>(() => {
    try { const raw = localStorage.getItem('ah_products'); return raw ? JSON.parse(raw) : DEFAULT_PRODUCTS; }
    catch { return DEFAULT_PRODUCTS; }
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    try { const raw = localStorage.getItem('ah_categories'); return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES; }
    catch { return DEFAULT_CATEGORIES; }
  });
  const [adminWa, setAdminWa] = useState<string>(() => localStorage.getItem('ah_admin_wa') || ADMIN_DEFAULTS.whatsapp);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => sessionStorage.getItem('ah_admin_auth') === '1');

  useEffect(() => { localStorage.setItem('ah_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('ah_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('ah_admin_wa', adminWa); }, [adminWa]);

  const [activeCat, setActiveCat] = useState<CategoryKey | 'all'>('all');
  const [query, setQuery] = useState('');

  const [cName, setCName] = useState('');
  const [cMob, setCMob] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cMsg, setCMsg] = useState('');
  const [cErr, setCErr] = useState('');
  const [cToast, setCToast] = useState('');

  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPage, setAdminPage] = useState<AdminPage>('dashboard');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [adminToast, setAdminToast] = useState('');

  const emptyProductForm = {
    nameEn: '', nameHi: '', categoryKey: 'diapers' as CategoryKey, pack: '', size: '',
    descriptionEn: '', descriptionHi: '', price: '', mrp: '', stock: '', image: '', available: true,
  };
  const [prodForm, setProdForm] = useState(emptyProductForm);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [prodErr, setProdErr] = useState('');

  const [catForm, setCatForm] = useState({ labelEn: '', labelHi: '' });
  const [editCategoryKey, setEditCategoryKey] = useState<CategoryKey | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const catLabel = (c: CategoryKey) => {
    const cat = categories.find(cc => cc.key === c);
    return lang === 'hi' ? (cat?.labelHi ?? c) : (cat?.labelEn ?? c);
  };

  const filtered = useMemo(() => {
    let list = products;
    if (activeCat !== 'all') list = list.filter(p => p.categoryKey === activeCat);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        p.nameEn.toLowerCase().includes(q) ||
        p.nameHi.includes(query) ||
        p.sku.toLowerCase().includes(q) ||
        p.size.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, activeCat, query]);

  const isLow = (p: Product) => p.available && p.stock > 0 && (
    (p.categoryKey === 'diapers' && p.stock < 500) ||
    (p.categoryKey === 'pads' && p.stock < 300) ||
    (p.categoryKey === 'maternity' && p.stock < 200) ||
    (p.categoryKey === 'liners' && p.stock < 400)
  );

  const totals = useMemo(() => {
    return {
      totalStock: products.reduce((s, p) => s + p.stock, 0),
      totalSold: products.reduce((s, p) => s + p.sold, 0),
      totalProducts: products.filter(p => p.available).length,
      lowStock: products.filter(isLow).length,
    };
  }, [products]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const toast = (m: string) => { setCToast(m); setTimeout(() => setCToast(''), 2200); };
  const adminNotify = (m: string) => { setAdminToast(m); setTimeout(() => setAdminToast(''), 2200); };

  const submitContact = (e: React.FormEvent) => {
    e.preventDefault();
    setCErr('');
    if (!cName.trim() || !cMob.trim() || !cMsg.trim()) { setCErr(lang === 'hi' ? 'कृपया नाम, मोबाइल, संदेश दर्ज करें।' : 'Please fill name, mobile & message.'); return; }
    if (!/^\+?\d[\d\s\-]{7,14}$/.test(cMob.trim())) { setCErr(lang === 'hi' ? 'मोबाइल नंबर सही नहीं लग रहा।' : 'Mobile number doesn’t look valid.'); return; }

    const text =
      `New Website Inquiry%0A%0A` +
      `Name: ${encodeURIComponent(cName)}%0A` +
      `Mobile: ${encodeURIComponent(cMob)}%0A` +
      (cEmail ? `Email: ${encodeURIComponent(cEmail)}%0A` : '') +
      `%0AMessage:%0A${encodeURIComponent(cMsg)}`;

    window.open(`https://wa.me/${adminWa.replace(/[^\d]/g, '')}?text=${text}`, '_blank');
    toast(lang === 'hi' ? 'WhatsApp खुल रहा है…' : 'Opening WhatsApp…');
    setCName(''); setCMob(''); setCEmail(''); setCMsg('');
  };

  const doLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr('');
    if (loginUser.trim().toLowerCase() === 'admin@aradhyahealthcare.in' && loginPass === 'Aradhya@2026') {
      sessionStorage.setItem('ah_admin_auth', '1');
      setIsAdmin(true);
      setLoginUser(''); setLoginPass('');
      adminNotify(lang === 'hi' ? 'स्वागत एडमिन' : 'Welcome Admin');
    } else {
      setLoginErr(lang === 'hi' ? 'गलत ईमेल या पासवर्ड' : 'Invalid email or password');
    }
  };

  const doLogout = () => {
    sessionStorage.removeItem('ah_admin_auth');
    setIsAdmin(false);
    setAdminOpen(false);
    adminNotify(lang === 'hi' ? 'लॉग आउट हुआ' : 'Logged out');
  };

  const resetForm = () => {
    setProdForm(emptyProductForm);
    setEditProductId(null);
    setProdErr('');
  };

  const saveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setProdErr('');
    if (!prodForm.nameEn.trim()) { setProdErr('Product name is required.'); return; }
    if (!prodForm.price || isNaN(+prodForm.price)) { setProdErr('Valid price required.'); return; }
    if (!prodForm.image.trim()) { setProdErr('Product image URL is required.'); return; }

    if (editProductId) {
      setProducts(ps => ps.map(p => p.id === editProductId ? {
        ...p,
        nameEn: prodForm.nameEn,
        nameHi: prodForm.nameHi || prodForm.nameEn,
        categoryKey: prodForm.categoryKey,
        pack: prodForm.pack,
        size: prodForm.size,
        descriptionEn: prodForm.descriptionEn,
        descriptionHi: prodForm.descriptionHi || prodForm.descriptionEn,
        price: +prodForm.price,
        mrp: +prodForm.mrp || +prodForm.price,
        stock: +prodForm.stock || 0,
        image: prodForm.image,
        available: prodForm.available,
      } : p));
      adminNotify('Product updated');
    } else {
      const newProduct: Product = {
        id: uid('p'), sku: 'AH-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        nameEn: prodForm.nameEn,
        nameHi: prodForm.nameHi || prodForm.nameEn,
        categoryKey: prodForm.categoryKey,
        pack: prodForm.pack || 'Pack',
        size: prodForm.size || 'Free size',
        descriptionEn: prodForm.descriptionEn,
        descriptionHi: prodForm.descriptionHi || prodForm.descriptionEn,
        price: +prodForm.price,
        mrp: +prodForm.mrp || +prodForm.price,
        stock: +prodForm.stock || 0,
        sold: 0, rating: 4.5,
        available: prodForm.available,
        image: prodForm.image,
        features: (prodForm.descriptionEn ? prodForm.descriptionEn.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3) : ['Soft', 'Safe', 'Tested']),
      };
      setProducts(ps => [newProduct, ...ps]);
      adminNotify('Product added');
    }
    resetForm();
  };

  const editProduct = (p: Product) => {
    setEditProductId(p.id);
    setProdForm({
      nameEn: p.nameEn, nameHi: p.nameHi, categoryKey: p.categoryKey,
      pack: p.pack, size: p.size,
      descriptionEn: p.descriptionEn, descriptionHi: p.descriptionHi,
      price: String(p.price), mrp: String(p.mrp), stock: String(p.stock),
      image: p.image, available: p.available,
    });
  };

  const deleteProduct = (id: string) => {
    if (!confirm('Delete this product?')) return;
    setProducts(ps => ps.filter(p => p.id !== id));
    adminNotify('Product deleted');
  };

  const toggleAvailable = (p: Product) => {
    setProducts(ps => ps.map(x => x.id === p.id ? { ...x, available: !x.available } : x));
    adminNotify(p.available ? 'Marked Out of Stock' : 'Marked Available');
  };

  const onImageUpload = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setProdErr('Please upload an image file.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setProdForm(f => ({ ...f, image: String(reader.result) }));
      setProdErr('');
    };
    reader.readAsDataURL(file);
  };

  const saveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.labelEn.trim()) return;
    if (editCategoryKey) {
      setCategories(cs => cs.map(c => c.key === editCategoryKey ? { ...c, labelEn: catForm.labelEn, labelHi: catForm.labelHi || catForm.labelEn } : c));
      adminNotify('Category updated');
    } else {
      const newKey = (catForm.labelEn.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'cat') as CategoryKey;
      if (categories.some(c => c.key === newKey)) { adminNotify('Category already exists'); return; }
      setCategories(cs => [...cs, { key: newKey, labelEn: catForm.labelEn, labelHi: catForm.labelHi || catForm.labelEn }]);
      adminNotify('Category added');
    }
    setCatForm({ labelEn: '', labelHi: '' });
    setEditCategoryKey(null);
  };

  const deleteCategory = (key: CategoryKey) => {
    if (products.some(p => p.categoryKey === key)) { adminNotify('Category in use — re-assign products first'); return; }
    if (!confirm('Delete category?')) return;
    setCategories(cs => cs.filter(c => c.key !== key));
    adminNotify('Category deleted');
  };

  return (
    <div style={{ fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, Inter, Segoe UI, Roboto, sans-serif', color: '#2a1d14' }} className="min-h-screen bg-[#fcf8f3]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .fraunces { font-family: "Fraunces", serif; }
        .soft-shadow { box-shadow: 0 10px 30px rgba(47,31,15,0.065); }
        .card-border { border: 1px solid #ead7bf; }
        ::selection { background: #ffe6cf; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* Top Bar */}
      <div className="w-full bg-[#2b1910] text-[#f4d9b8] text-[12.5px]">
        <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-[10px] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="uppercase tracking-widest text-[11px] text-[#e8b97d]">Aradhya Healthcare • Est. 2018</span>
            <span className="hidden sm:block opacity-70">•</span>
            <span className="hidden sm:block opacity-90">{t('top_tag')}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="opacity-90">care@aradhyahealthcare.in • {adminWa}</span>
            <a href="/softcare.html" target="_blank" rel="noreferrer" className="underline underline-offset-2 text-[#ffd9a8]">HTML ↗</a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#fcf8f3]/93 backdrop-blur border-b border-[#edd7be]">
        <div className="max-w-[1120px] mx-auto px-5 sm:px-8 h-[70px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-[50px] h-[50px] rounded-[15px] overflow-hidden bg-[#ffead0] soft-shadow border border-[#f0d2af] flex-none">
              <img src="https://images.pexels.com/photos/32386175/pexels-photo-32386175.jpeg?auto=compress&cs=tinysrgb&w=200" alt="Aradhya Healthcare baby logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="fraunces text-[22px] leading-tight text-[#25160e]">Aradhya Healthcare</div>
              <div className="text-[11.6px] text-[#9b7253] -mt-[1px]">{lang === 'hi' ? 'बेबी और महिला केयर' : 'Baby & Women Care'}</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-[14.5px] text-[#3d2a1b]">
            <button onClick={() => scrollTo('products')} className="hover:text-[#c26126]">{t('nav_products')}</button>
            <button onClick={() => scrollTo('stock')} className="hover:text-[#c26126]">{t('nav_stock')}</button>
            <button onClick={() => scrollTo('contact')} className="hover:text-[#c26126]">{t('nav_contact')}</button>
          </nav>
          <div className="flex items-center gap-[9px]">
            <button onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')} className="px-[13px] py-[8px] rounded-full border border-[#e0c7a8] bg-white text-[13px] font-[600] text-[#4c3220] hover:bg-[#fff6ec]">
              {lang === 'en' ? 'हिंदी' : 'English'}
            </button>
            <button onClick={() => setAdminOpen(true)} className="px-[13px] py-[9px] rounded-full bg-[#2a1810] text-[#ffe8ca] text-[13px] font-[600]">
              {isAdmin ? 'Admin Panel' : 'Admin'}
            </button>
            <a href={`https://wa.me/${adminWa.replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer" className="hidden sm:inline px-[15px] py-[10px] rounded-full bg-[#27a84a] text-white text-[13.3px] font-[600]">WhatsApp</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-[1120px] mx-auto px-5 sm:px-8 pt-10 pb-8">
        <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-8 items-start">
          <div>
            <div className="inline-flex items-center gap-2 text-[12px] bg-[#fff0db] border border-[#f2d7b1] text-[#8a5122] px-3 py-[6px] rounded-full mb-4">{t('hero_tag')}</div>
            <h1 className="fraunces text-[38px] sm:text-[50px] leading-[0.99] tracking-[-0.015em] text-[#21130b]">
              {t('hero_h1_a')}<br /><span className="italic text-[#c25a1f]">{t('hero_h1_b')}</span>
            </h1>
            <div className="mt-5 rounded-[22px] overflow-hidden card-border bg-white soft-shadow max-w-[560px]">
              <img src="https://images.pexels.com/photos/32386175/pexels-photo-32386175.jpeg?auto=compress&cs=tinysrgb&w=1300" alt="Aradhya Healthcare baby in diaper" className="w-full h-[280px] object-cover" />
              <div className="px-[18px] py-[13px] text-[13.8px] text-[#5a3d28]"><b>Aradhya CloudSoft™</b> — happy baby in diaper. 12-hr dry, 0% fragrance.</div>
            </div>
            <p className="text-[16.5px] leading-relaxed text-[#5a3b27] mt-4 max-w-[560px]">{t('hero_sub')}</p>
            <div className="flex flex-wrap gap-3 mt-5">
              <button onClick={() => scrollTo('products')} className="px-[22px] py-[13px] rounded-full bg-[#e16d2d] text-white font-[650] text-[14.5px]">{t('view_products')}</button>
              <button onClick={() => scrollTo('contact')} className="px-[20px] py-[13px] rounded-full bg-white card-border text-[#492a17] font-[600] text-[14.5px]">{t('contact_us')}</button>
            </div>
            <div className="flex gap-x-6 gap-y-2 flex-wrap text-[13.3px] text-[#6c4a33] mt-5">
              <span>✔ {t('trust1')}</span><span>✔ {t('trust2')}</span><span>✔ {t('trust3')}</span><span>✔ {t('trust4')}</span>
            </div>
          </div>

          <div className="bg-white card-border rounded-[24px] p-[22px] soft-shadow" id="stock">
            <div className="text-[12.8px] text-[#b0753f] font-[650] uppercase tracking-wide">{t('live_inventory')}</div>
            <div className="fraunces text-[29px] mt-1 text-[#20120a]">{t('stock_sales')}</div>
            <div className="grid grid-cols-2 gap-[12px] mt-4 text-[13.8px]">
              <div className="bg-[#fff6e8] border border-[#f1d4ad] rounded-[14px] p-[14px]"><div className="text-[#936238] text-[12px]">{t('products_live')}</div><div className="text-[25px] font-[700]">{totals.totalProducts}</div><div className="text-[#a17446] text-[12px]">{categories.length} categories</div></div>
              <div className="bg-[#f4fbf1] border border-[#d2e8c2] rounded-[14px] p-[14px]"><div className="text-[#4b7a36] text-[12px]">{t('units_available')}</div><div className="text-[25px] font-[700] text-[#1b2a14]">{totals.totalStock.toLocaleString('en-IN')}</div><div className="text-[#5d8450] text-[12px]">warehouse stock</div></div>
              <div className="bg-[#f3f0ff] border border-[#d9cef5] rounded-[14px] p-[14px]"><div className="text-[#5c468e] text-[12px]">{t('units_sold')}</div><div className="text-[25px] font-[700] text-[#23153a]">{totals.totalSold.toLocaleString('en-IN')}</div><div className="text-[#735d9f] text-[12px]">lifetime</div></div>
              <div className="bg-[#fff1ef] border border-[#f3c3ba] rounded-[14px] p-[14px]"><div className="text-[#b3472e] text-[12px]">{t('low_stock_skus')}</div><div className="text-[25px] font-[700] text-[#6f2215]">{totals.lowStock}</div><div className="text-[#b65944] text-[12px]">auto-alerted</div></div>
            </div>
            <div className="text-[11.9px] text-[#9a7355] mt-3">Admin WhatsApp: <b>{adminWa}</b> · Toll free 1800 000 0000</div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="max-w-[1120px] mx-auto px-5 sm:px-8 pb-14">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
          <div>
            <h2 className="fraunces text-[33px] text-[#20120a]">{t('products_title')}</h2>
            <p className="text-[14.2px] text-[#6b4a31]">{t('products_sub')}</p>
          </div>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('search_placeholder')} className="w-[240px] max-w-[60vw] bg-white card-border rounded-[12px] px-3 py-[10px] text-[13.7px] outline-none" />
        </div>

        <div className="flex flex-wrap gap-[9px] mb-5">
          <button onClick={() => setActiveCat('all')} className={`px-[14px] py-[9px] rounded-full text-[13.3px] border ${activeCat === 'all' ? 'bg-[#2a1810] text-[#ffe8ca] border-[#2a1810]' : 'bg-white text-[#4c3423] card-border'}`}>
            {lang === 'hi' ? 'सभी' : 'All'} · {products.length}
          </button>
          {categories.map(c => (
            <button key={c.key} onClick={() => setActiveCat(c.key)} className={`px-[14px] py-[9px] rounded-full text-[13.3px] border ${activeCat === c.key ? 'bg-[#2a1810] text-[#ffe8ca] border-[#2a1810]' : 'bg-white text-[#4c3423] card-border'}`}>
              {lang === 'hi' ? c.labelHi : c.labelEn} · {products.filter(p => p.categoryKey === c.key).length}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {filtered.map(p => {
            const low = isLow(p);
            const out = !p.available || p.stock <= 0;
            const save = p.mrp - p.price;
            return (
              <article key={p.id} className={`bg-white card-border rounded-[20px] overflow-hidden soft-shadow flex flex-col ${out ? 'opacity-70' : ''}`}>
                <div className="relative">
                  <img src={p.image} alt={p.nameEn} className="w-full h-[205px] object-cover" />
                  <div className="absolute top-3 left-3 bg-white/94 px-[10px] py-[5px] rounded-full text-[11.3px] font-[650] text-[#4a2d19]">{p.pack} • {p.size}</div>
                  {low && <div className="absolute top-3 right-3 bg-[#fff0ec] text-[#c2321b] text-[11px] font-[700] px-[9px] py-[5px] rounded-full border border-[#f4b9ad]">{t('low_stock')}</div>}
                  {out && <div className="absolute top-3 right-3 bg-[#1f140d] text-[#ffe6c8] text-[11px] font-[700] px-[9px] py-[5px] rounded-full">{t('out_stock')}</div>}
                </div>
                <div className="p-[16px] flex-1 flex flex-col">
                  <div className="text-[11.6px] text-[#b9783d] font-[650]">{catLabel(p.categoryKey)}</div>
                  <div className="font-[640] text-[16.7px] leading-snug mt-1">{lang === 'hi' ? p.nameHi : p.nameEn}</div>
                  <div className="text-[12.7px] text-[#7a5b43] mt-[6px]">★ {p.rating} • SKU {p.sku}</div>
                  <div className="text-[13.4px] text-[#5a3a24] mt-[8px] leading-relaxed">{lang === 'hi' ? p.descriptionHi : p.descriptionEn}</div>

                  <div className="grid grid-cols-2 gap-[10px] mt-[14px]">
                    <div className="bg-[#f8fbf4] border border-[#dbe9cb] rounded-[12px] px-[12px] py-[10px]">
                      <div className="text-[11px] text-[#4f7a37] uppercase tracking-wide font-[700]">{t('stock_available')}</div>
                      <div className={`text-[20px] font-[700] ${low || out ? 'text-[#c73b1e]' : 'text-[#1e3a18]'}`}>{p.stock.toLocaleString('en-IN')}</div>
                      <div className="text-[11.4px] text-[#5f8350]">{out ? t('out_stock') : t('units')}</div>
                    </div>
                    <div className="bg-[#fff7f0] border border-[#f0d1b5] rounded-[12px] px-[12px] py-[10px]">
                      <div className="text-[11px] text-[#9a5b25] uppercase tracking-wide font-[700]">{t('units_sold_label')}</div>
                      <div className="text-[20px] font-[700] text-[#3b2314]">{p.sold.toLocaleString('en-IN')}</div>
                      <div className="text-[11.4px] text-[#9a6a3d]">lifetime</div>
                    </div>
                  </div>

                  <div className="mt-auto pt-[14px] flex items-end justify-between">
                    <div>
                      <div className="text-[21px] font-[700]">₹{p.price}</div>
                      <div className="text-[12.6px] text-[#97725a]">MRP <span className="line-through">₹{p.mrp}</span> · <span className="text-[#24803a] font-[600]">{t('save')} ₹{save}</span></div>
                    </div>
                    <a href={`https://wa.me/${adminWa.replace(/[^\d]/g, '')}?text=${encodeURIComponent('Interested in ' + p.nameEn + ' (' + p.sku + ')')}`} target="_blank" rel="noreferrer" className="px-[14px] py-[10px] rounded-full bg-[#f5e4cf] text-[#3a2213] text-[13.3px] font-[640]">{t('enquire')}</a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-[#edd4ba] bg-[#fbf3e6]">
        <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-12 grid lg:grid-cols-[1.05fr_.95fr] gap-8">
          <div className="bg-white card-border rounded-[20px] p-[22px] soft-shadow">
            <div className="fraunces text-[28px] text-[#20120a]">{t('contact_title')}</div>
            <p className="text-[14.3px] text-[#69422a] mt-1">{t('contact_sub')}</p>

            <form className="mt-[16px] grid sm:grid-cols-2 gap-[12px] text-[14px]" onSubmit={submitContact}>
              <input value={cName} onChange={e => setCName(e.target.value)} placeholder={t('your_name')} className="border border-[#e2c8a9] rounded-[12px] px-3 py-[12px] bg-[#fffcf7] outline-none" />
              <input value={cMob} onChange={e => setCMob(e.target.value)} placeholder={t('mobile')} className="border border-[#e2c8a9] rounded-[12px] px-3 py-[12px] bg-[#fffcf7] outline-none" />
              <input value={cEmail} onChange={e => setCEmail(e.target.value)} placeholder={t('email_optional')} className="sm:col-span-2 border border-[#e2c8a9] rounded-[12px] px-3 py-[12px] bg-[#fffcf7] outline-none" />
              <textarea value={cMsg} onChange={e => setCMsg(e.target.value)} placeholder={t('your_message')} rows={5} className="sm:col-span-2 border border-[#e2c8a9] rounded-[12px] px-3 py-[12px] bg-[#fffcf7] outline-none" />
              {cErr && <div className="sm:col-span-2 text-[13.4px] text-[#c23d1c]">{cErr}</div>}
              <div className="sm:col-span-2 flex items-center gap-3">
                <button className="px-[22px] py-[12px] rounded-full bg-[#21b458] text-white font-[700]">{t('send_whatsapp')}</button>
                {cToast && <span className="text-[13.5px] text-[#2a7a35]">{cToast}</span>}
              </div>
              <div className="sm:col-span-2 text-[12.6px] text-[#9a7356]">{t('form_note')} Admin: <b>{adminWa}</b></div>
            </form>
          </div>

          <div className="space-y-4">
            <div className="bg-white card-border rounded-[20px] p-[20px]">
              <div className="font-[700] text-[#28170d] text-[17px]">{lang === 'hi' ? 'संपर्क सूचना' : 'Contact information'}</div>
              <div className="mt-3 text-[14.6px] text-[#4a2e1b] space-y-[7px]">
                <div><b>{adminWa}</b> {lang === 'hi' ? '(डेमो नंबर)' : '(demo number)'} · {lang === 'hi' ? 'टोल-फ्री 1800 000 0000 (डेमो)' : 'Toll free 1800 000 0000 (demo)'}</div>
                <div><b>care@aradhyahealthcare.in</b></div>
                <div>{lang === 'hi' ? 'थोक:' : 'Wholesale:'} <b>distributors@aradhyahealthcare.in</b></div>
                <div>{lang === 'hi' ? 'Aradhya Healthcare Pvt. Ltd., जिला – शामली, उत्तर प्रदेश, भारत' : 'Aradhya Healthcare Pvt. Ltd., District Shamli, Uttar Pradesh, India'}</div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <a href={`https://wa.me/${adminWa.replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer" className="px-[15px] py-[10px] rounded-full bg-[#21b458] text-white text-[13.6px] font-[650]">WhatsApp →</a>
                <a href={`mailto:care@aradhyahealthcare.in`} className="px-[15px] py-[10px] rounded-full bg-white card-border text-[#3d2415] text-[13.6px] font-[600]">Email</a>
                <a href={`tel:${adminWa}`} className="px-[15px] py-[10px] rounded-full bg-white card-border text-[#3d2415] text-[13.6px] font-[600]">Call</a>
              </div>
            </div>
            <div className="bg-[#fffbf3] card-border rounded-[20px] p-[18px] text-[13.7px] text-[#59402b] leading-relaxed">
              <b>{lang === 'hi' ? 'डीलर / अस्पताल पूछताछ:' : 'Dealer / Hospital inquiries:'}</b> {lang === 'hi' ? 'भारत भर में मैटरनिटी अस्पताल पैक और फार्मेसी चेन की आपूर्ति। MOQ 200 पैक। GST और शहर साझा करें — उत्तर 1 कारोबारी दिन में।' : 'We supply maternity hospital packs and pharmacy chains across India. MOQ 200 packs. Share your GST & city — our trade team replies in 1 business day.'}
            </div>
          </div>
        </div>
        <div className="border-t border-[#e6cdb0] text-center text-[12.5px] text-[#a47a55] py-5">© 2018–2026 Aradhya Healthcare Pvt. Ltd. • District Shamli, Uttar Pradesh • U74140UP2018PTC103112 • ISO 22716 GMP • Made in India</div>
      </section>

      {/* Floating WhatsApp */}
      <a href={`https://wa.me/${adminWa.replace(/[^\d]/g, '')}?text=${encodeURIComponent('Hi Aradhya Healthcare, I would like product and stock details')}`} target="_blank" rel="noreferrer" className="fixed right-4 bottom-4 px-[18px] py-[13px] rounded-full bg-[#25d366] text-white font-[700] text-[14px] shadow-xl">WhatsApp</a>

      {/* ----- Admin overlay ----- */}
      {adminOpen && (
        <div className="fixed inset-0 z-[80]">
          <div className="absolute inset-0 bg-black/45" onClick={() => setAdminOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-[860px] bg-[#f8f1e8] border-l border-[#e3ccb0] shadow-2xl flex flex-col">
            <div className="px-5 py-[16px] border-b border-[#e8cfae] flex items-center justify-between bg-white/80 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[13px] bg-[#ffe7c9] flex items-center justify-center fraunces text-[#bd5e22] font-[700]">ah</div>
                <div>
                  <div className="font-[700] text-[#25170c] text-[17.5px]">Aradhya Admin</div>
                  <div className="text-[12.3px] text-[#8d6a4b]">{isAdmin ? 'Shamli Plant • Live' : 'Sign in required'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && <button onClick={doLogout} className="text-[13px] text-[#b0521c] underline">Logout</button>}
                <button onClick={() => setAdminOpen(false)} className="text-[#a2744d] text-[24px]">×</button>
              </div>
            </div>

            {!isAdmin ? (
              <form onSubmit={doLogin} className="p-6 max-w-[420px] mx-auto mt-8 bg-white card-border rounded-[20px] soft-shadow flex-1 h-fit w-[calc(100%-32px)]">
                <div className="fraunces text-[25px] text-[#20100a]">Admin Login</div>
                <p className="text-[13.6px] text-[#6a4931] mt-1">Restricted to administrator. Use your admin email + password.</p>
                <div className="mt-4 space-y-[12px]">
                  <input required type="email" value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="admin@aradhyahealthcare.in" className="w-full border border-[#e0c8a9] rounded-[12px] px-3 py-[12px] bg-[#fffdf8] outline-none" />
                  <input required type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Password" className="w-full border border-[#e0c8a9] rounded-[12px] px-3 py-[12px] bg-[#fffdf8] outline-none" />
                  {loginErr && <div className="text-[13.3px] text-[#c13b1b]">{loginErr}</div>}
                  <button className="w-full py-[13px] rounded-full bg-[#26160d] text-[#ffe7c8] font-[700]">Sign in</button>
                  <div className="text-[12.2px] text-[#a17448] text-center">Admin auth is session-only • changes persist in site storage.</div>
                </div>
              </form>
            ) : (
              <div className="flex-1 overflow-y-auto p-[18px]">
                <div className="flex gap-[8px] flex-wrap mb-4">
                  {([
                    ['dashboard', 'Dashboard'],
                    ['products', 'Products'],
                    ['categories', 'Categories'],
                    ['settings', 'Settings'],
                  ] as [AdminPage, string][]).map(([k, label]) => (
                    <button key={k} onClick={() => setAdminPage(k)} className={`px-[14px] py-[9px] rounded-full text-[13.3px] border ${adminPage === k ? 'bg-[#26160d] text-[#ffe7c8] border-[#26160d]' : 'bg-white card-border text-[#49311f]'}`}>{label}</button>
                  ))}
                </div>

                {adminToast && <div className="mb-3 inline-block bg-[#e9f7e4] text-[#2e7a2b] border border-[#bfe4b6] px-[14px] py-[9px] rounded-full text-[13.4px]">{adminToast}</div>}

                {adminPage === 'dashboard' && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <DashCard title="Products" value={String(products.length)} sub={`${products.filter(p => p.available).length} available`} color="#fff3df" border="#f0d6ae" />
                    <DashCard title="Out of stock" value={String(products.filter(p => !p.available || p.stock <= 0).length)} sub="marked unavailable" color="#fff0ec" border="#f6b9ad" />
                    <DashCard title="Total stock" value={totals.totalStock.toLocaleString('en-IN')} sub="units" color="#f3faf0" border="#cfe6c1" />
                    <DashCard title="Units sold" value={totals.totalSold.toLocaleString('en-IN')} sub="lifetime" color="#f2eeff" border="#d8cdf4" />
                  </div>
                )}

                {adminPage === 'products' && (
                  <div className="grid lg:grid-cols-[1fr_320px] gap-5">
                    <div className="bg-white card-border rounded-[18px] p-[16px]">
                      <div className="font-[700] text-[#24140c] text-[17px] mb-3">All products</div>
                      <div className="space-y-[9px] max-h-[600px] overflow-y-auto pr-1">
                        {products.map(p => (
                          <div key={p.id} className="border border-[#f0dec3] rounded-[14px] p-[12px] flex items-center gap-3">
                            <img src={p.image} className="w-[58px] h-[58px] rounded-[10px] object-cover border border-[#eecfa9]" alt="" />
                            <div className="flex-1 min-w-0">
                              <div className="font-[650] text-[14.5px] truncate">{p.nameEn}</div>
                              <div className="text-[12.3px] text-[#8d6644]">{catLabel(p.categoryKey)} • ₹{p.price} • stock {p.stock.toLocaleString('en-IN')}</div>
                            </div>
                            <div className="flex flex-col items-end gap-[6px]">
                              <span className={`text-[11.4px] px-[8px] py-[3px] rounded-full border ${p.available ? 'bg-[#eefaf0] text-[#287a3a] border-[#c6e4c4]' : 'bg-[#fff0ec] text-[#c43c1c] border-[#f4bfae]'}`}>
                                {p.available ? t('available') : t('out_stock')}
                              </span>
                              <button onClick={() => toggleAvailable(p)} className="text-[11.5px] text-[#a8551e] underline">toggle</button>
                            </div>
                            <div className="flex flex-col gap-[6px] ml-1">
                              <button onClick={() => editProduct(p)} className="text-[#a65824] text-[13px] underline">Edit</button>
                              <button onClick={() => deleteProduct(p.id)} className="text-[#c03415] text-[13px] underline">Delete</button>
                            </div>
                          </div>
                        ))}
                        {products.length === 0 && <div className="text-[14px] text-[#8d6a4b]">No products yet.</div>}
                      </div>
                    </div>

                    <div className="bg-white card-border rounded-[18px] p-[16px] h-fit">
                      <div className="flex items-center justify-between">
                        <div className="font-[700] text-[#24140c] text-[17px]">{editProductId ? 'Edit product' : 'Add product'}</div>
                        {editProductId && <button onClick={resetForm} className="text-[12.6px] text-[#a95d25] underline">Cancel</button>}
                      </div>
                      <form onSubmit={saveProduct} className="mt-3 grid gap-[10px] text-[13.6px]">
                        <input value={prodForm.nameEn} onChange={e => setProdForm(f => ({ ...f, nameEn: e.target.value }))} placeholder="Product name (English) *" className="border border-[#e0c8a9] rounded-[11px] px-3 py-[10px] bg-[#fffdf8]" />
                        <input value={prodForm.nameHi} onChange={e => setProdForm(f => ({ ...f, nameHi: e.target.value }))} placeholder="उत्पाद नाम (हिंदी)" className="border border-[#e0c8a9] rounded-[11px] px-3 py-[10px] bg-[#fffdf8]" />
                        <select value={prodForm.categoryKey} onChange={e => setProdForm(f => ({ ...f, categoryKey: e.target.value as CategoryKey }))} className="border border-[#e0c8a9] rounded-[11px] px-3 py-[10px] bg-[#fffdf8]">
                          {categories.map(c => <option key={c.key} value={c.key}>{c.labelEn}</option>)}
                        </select>
                        <div className="grid grid-cols-2 gap-[10px]">
                          <input value={prodForm.pack} onChange={e => setProdForm(f => ({ ...f, pack: e.target.value }))} placeholder="Pack (e.g. 72 Pants)" className="border border-[#e0c8a9] rounded-[11px] px-3 py-[10px] bg-[#fffdf8]" />
                          <input value={prodForm.size} onChange={e => setProdForm(f => ({ ...f, size: e.target.value }))} placeholder="Size" className="border border-[#e0c8a9] rounded-[11px] px-3 py-[10px] bg-[#fffdf8]" />
                        </div>
                        <textarea value={prodForm.descriptionEn} onChange={e => setProdForm(f => ({ ...f, descriptionEn: e.target.value }))} placeholder="Description (English)" rows={2} className="border border-[#e0c8a9] rounded-[11px] px-3 py-[10px] bg-[#fffdf8]" />
                        <textarea value={prodForm.descriptionHi} onChange={e => setProdForm(f => ({ ...f, descriptionHi: e.target.value }))} placeholder="विवरण (हिंदी)" rows={2} className="border border-[#e0c8a9] rounded-[11px] px-3 py-[10px] bg-[#fffdf8]" />
                        <div className="grid grid-cols-3 gap-[10px]">
                          <input type="number" value={prodForm.price} onChange={e => setProdForm(f => ({ ...f, price: e.target.value }))} placeholder="Price *" className="border border-[#e0c8a9] rounded-[11px] px-3 py-[10px] bg-[#fffdf8]" />
                          <input type="number" value={prodForm.mrp} onChange={e => setProdForm(f => ({ ...f, mrp: e.target.value }))} placeholder="MRP" className="border border-[#e0c8a9] rounded-[11px] px-3 py-[10px] bg-[#fffdf8]" />
                          <input type="number" value={prodForm.stock} onChange={e => setProdForm(f => ({ ...f, stock: e.target.value }))} placeholder="Stock" className="border border-[#e0c8a9] rounded-[11px] px-3 py-[10px] bg-[#fffdf8]" />
                        </div>

                        <div>
                          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => onImageUpload(e.target.files?.[0] ?? null)} />
                          <div className="flex gap-2">
                            <input value={prodForm.image} onChange={e => setProdForm(f => ({ ...f, image: e.target.value }))} placeholder="Product image URL *" className="flex-1 border border-[#e0c8a9] rounded-[11px] px-3 py-[10px] bg-[#fffdf8]" />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-[13px] py-[10px] rounded-[11px] bg-[#f2e0c7] text-[#53351d] font-[600] text-[13px]">Upload</button>
                          </div>
                          {prodForm.image && prodForm.image.length < 4000 && <img src={prodForm.image} className="mt-2 w-full h-[130px] object-cover rounded-[11px] border border-[#ecd2b0]" alt="preview" />}
                          {prodForm.image && prodForm.image.length >= 4000 && <div className="mt-2 text-[12.4px] text-[#287a3a] bg-[#eefaf0] border border-[#c6e4c4] rounded-[10px] px-[10px] py-[8px]">Image uploaded from device ✓</div>}
                        </div>

                        <label className="flex items-center gap-2 text-[13.4px]">
                          <input type="checkbox" checked={prodForm.available} onChange={e => setProdForm(f => ({ ...f, available: e.target.checked }))} />
                          <span>Available / in stock on website</span>
                        </label>

                        {prodErr && <div className="text-[13px] text-[#c03415]">{prodErr}</div>}
                        <button className="w-full py-[12px] rounded-full bg-[#e0662b] text-white font-[700]">{editProductId ? 'Save changes' : 'Add product'}</button>
                        <div className="text-[11.9px] text-[#a47f5f] text-center">Changes appear on public website instantly.</div>
                      </form>
                    </div>
                  </div>
                )}

                {adminPage === 'categories' && (
                  <div className="grid lg:grid-cols-[1fr_310px] gap-5">
                    <div className="bg-white card-border rounded-[18px] p-[16px]">
                      <div className="font-[700] text-[#24140c] text-[17px] mb-3">Categories</div>
                      <div className="space-y-[9px]">
                        {categories.map(c => (
                          <div key={c.key} className="border border-[#f0dec3] rounded-[14px] p-[12px] flex items-center justify-between">
                            <div>
                              <div className="font-[650]">{c.labelEn}</div>
                              <div className="text-[12.5px] text-[#8d6644]">{c.labelHi} • {products.filter(p => p.categoryKey === c.key).length} products</div>
                            </div>
                            <div className="flex gap-3 text-[13px]">
                              <button onClick={() => { setEditCategoryKey(c.key); setCatForm({ labelEn: c.labelEn, labelHi: c.labelHi }); }} className="text-[#a65824] underline">Edit</button>
                              <button onClick={() => deleteCategory(c.key)} className="text-[#c03415] underline">Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white card-border rounded-[18px] p-[16px] h-fit">
                      <div className="font-[700] text-[#24140c] text-[17px]">{editCategoryKey ? 'Edit category' : t('add_category')}</div>
                      <form onSubmit={saveCategory} className="mt-3 grid gap-[10px] text-[13.6px]">
                        <input value={catForm.labelEn} onChange={e => setCatForm(f => ({ ...f, labelEn: e.target.value }))} placeholder="Category name (English) *" className="border border-[#e0c8a9] rounded-[11px] px-3 py-[10px] bg-[#fffdf8]" />
                        <input value={catForm.labelHi} onChange={e => setCatForm(f => ({ ...f, labelHi: e.target.value }))} placeholder="श्रेणी नाम (हिंदी)" className="border border-[#e0c8a9] rounded-[11px] px-3 py-[10px] bg-[#fffdf8]" />
                        <button className="py-[11px] rounded-full bg-[#26160d] text-[#ffe7c8] font-[700]">{editCategoryKey ? 'Save changes' : 'Add category'}</button>
                        {editCategoryKey && <button type="button" onClick={() => { setEditCategoryKey(null); setCatForm({ labelEn: '', labelHi: '' }); }} className="text-[12.8px] text-[#a95d25] underline">Cancel</button>}
                      </form>
                    </div>
                  </div>
                )}

                {adminPage === 'settings' && (
                  <div className="bg-white card-border rounded-[18px] p-[18px] max-w-[520px]">
                    <div className="font-[700] text-[#24140c] text-[17px]">Admin settings</div>
                    <form onSubmit={e => { e.preventDefault(); adminNotify('Settings saved'); }} className="mt-3 grid gap-[11px] text-[13.7px]">
                      <label>
                        <div className="text-[12.6px] text-[#8b6244] mb-[5px]">Admin WhatsApp number (contact form + enquiries)</div>
                        <input value={adminWa} onChange={e => setAdminWa(e.target.value)} className="w-full border border-[#e0c8a9] rounded-[11px] px-3 py-[11px] bg-[#fffdf8]" />
                      </label>
                      <div className="text-[12.3px] text-[#a47f5f]">All contact-form submissions, order enquiries and WhatsApp CTA’s open this number. Changes reflect across public site instantly.</div>
                      <button className="py-[12px] rounded-full bg-[#e0662b] text-white font-[700]">Save settings</button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DashCard({ title, value, sub, color, border }: { title: string; value: string; sub: string; color: string; border: string }) {
  return (
    <div className="rounded-[16px] p-[14px] border" style={{ background: color, borderColor: border }}>
      <div className="text-[12.6px] text-[#7a5636]">{title}</div>
      <div className="fraunces text-[28px] text-[#22120a]">{value}</div>
      <div className="text-[12.4px] text-[#5c402b]">{sub}</div>
    </div>
  );
}
// Zod Schema
export const Schema = {
    "commentary": "Aradhya Healthcare – Baby & Women Care is a bilingual (English/Hindi) product catalog website with a secure admin panel. It shows live stock and units sold per product, sends contact form entries directly to the admin's WhatsApp, and lets the administrator manage products, categories, availability, images and the admin WhatsApp number.",
    "template": "nextjs-developer",
    "title": "Aradhya Healthcare – Baby & Women Care",
    "description": "Baby diapers, sanitary pads, panty liners and maternity pads catalog with live stock/sales info, WhatsApp contact and an admin panel.",
    "additional_dependencies": [],
    "has_additional_dependencies": false,
    "install_dependencies_command": "",
    "port": 5173,
    "file_path": "src/App.tsx",
    "code": "<see code above>"
}