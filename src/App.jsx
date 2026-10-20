import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  ArrowRight, BadgeCheck, Clock3, Minus, Plus, Search, ShoppingBag,
  Smartphone, Sparkles, Truck, X,
} from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)?.trim();
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const initialMenu = [
  { id: 'm1', name: 'Butternut Cinnamon Roll', description: 'Two soft, spiced rolls for sharing', price: 145, category: 'Sweet stuff', image: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=1000&q=85', tag: '2 FOR KSH 145', available: true },
  { id: 'm2', name: 'Uncooked Samosa', description: 'Ready to cook at home · KSh 25 each', price: 25, category: 'Sides', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=85', tag: 'KSH 25 EACH', available: true },
  { id: 'm7', name: 'Cinnamon Roll', description: 'Classic freshly baked cinnamon roll · one piece', price: 65, category: 'Sweet stuff', image: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=1000&q=85', tag: '', available: true },
  { id: 'm3', name: 'Loaded Street Fries', description: 'Golden fries, cheese sauce, spring onion', price: 420, category: 'Sides', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1000&q=85', tag: 'COMING SOON', available: false },
  { id: 'm4', name: 'Smoky BBQ Wings', description: 'Eight slow-glazed wings, cool ranch dip', price: 590, category: 'Sides', image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=1000&q=85', tag: 'COMING SOON', available: false },
  { id: 'm5', name: 'Choco Cookie Skillet', description: 'Warm chocolate cookie, vanilla scoop', price: 460, category: 'Sweet stuff', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1000&q=85', tag: 'COMING SOON', available: false },
  { id: 'm6', name: 'Mango Lime Fizz', description: 'Fresh mango, lime, bubbles. 400 ml', price: 240, category: 'Drinks', image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=1000&q=85', tag: 'COMING SOON', available: false },
];
const categories = ['Everything', 'Burgers', 'Sides', 'Sweet stuff', 'Drinks'];
const KEYS = { menu: 'munchies-menu' };
const readStorage = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const loadMenu = () => {
  const storedMenu = readStorage(KEYS.menu, null);
  if (!Array.isArray(storedMenu)) return initialMenu;
  const currentItems = new Map(initialMenu.map((item) => [item.id, item]));
  const migratedMenu = storedMenu.map((item) => {
    if (currentItems.has(item.id)) {
      const currentItem = currentItems.get(item.id);
      currentItems.delete(item.id);
      return currentItem;
    }
    if (['m3', 'm4', 'm5', 'm6'].includes(item.id)) {
      return { ...item, tag: 'COMING SOON', available: false };
    }
    return item;
  });
  return [...currentItems.values(), ...migratedMenu];
};
const money = (value) => `KSh ${Number(value).toLocaleString('en-KE')}`;

function App() {
  const [customerUser, setCustomerUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(supabase));
  const [menu, setMenu] = useState(loadMenu);
  const [cart, setCart] = useState({});
  const [activeCategory, setActiveCategory] = useState('Everything');
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerAuthOpen, setCustomerAuthOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === KEYS.menu) setMenu(readStorage(KEYS.menu, initialMenu));
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setToast(error.message);
      setCustomerUser(data.session?.user ?? null);
      setAuthLoading(false);
    }).catch((error) => {
      if (!active) return;
      setToast(error.message);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCustomerUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  useEffect(() => { localStorage.setItem(KEYS.menu, JSON.stringify(menu)); }, [menu]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const visibleMenu = menu.filter((item) => (activeCategory === 'Everything' || item.category === activeCategory)
    && `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase()));
  const cartItems = menu.filter((item) => cart[item.id]).map((item) => ({ ...item, quantity: cart[item.id] }));
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = 0;
  const updateQuantity = (id, amount) => setCart((current) => {
    const nextQuantity = (current[id] || 0) + amount;
    const next = { ...current };
    if (nextQuantity <= 0) delete next[id]; else next[id] = nextQuantity;
    return next;
  });

  const placeOrder = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const customer = form.get('customer').trim();
    const email = form.get('email').trim();
    const phone = form.get('phone').trim();
    const address = form.get('address').trim();
    const note = form.get('note').trim();
    const itemLines = cartItems.map(({ name, price, quantity }) => `- ${quantity} x ${name}: ${money(price * quantity)}`).join('\n');
    const message = [
      'Hello Munchies Corner! I would like to place this order:',
      '',
      itemLines,
      '',
      `Total: ${money(subtotal + delivery)}`,
      'Delivery: FREE',
      '',
      `Name: ${customer}`,
      email ? `Email: ${email}` : '',
      `Phone: ${phone}`,
      `Delivery location: ${address}`,
      note ? `Kitchen note: ${note}` : '',
      '',
      'Please confirm my order. I will pay after delivery using Safaricom Lipa na Pochi la Biashara to 0794800487.',
    ].filter(Boolean).join('\n');
    window.location.assign(`https://wa.me/254794800487?text=${encodeURIComponent(message)}`);
  };

  const toggleCustomerAuth = async () => {
    if (!customerUser) {
      setCustomerAuthOpen(true);
      return;
    }
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setToast(error.message);
  };

  return (
    <div className="app-shell">
      <Header signedIn={Boolean(customerUser)} authLoading={authLoading} cartCount={cartCount} onCart={() => setCartOpen(true)} onCustomerAuth={toggleCustomerAuth} />
      <main>
          <aside className="updates-banner wrap" aria-label="Coming soon announcement">
            <span className="updates-banner-icon"><Sparkles size={22} /></span>
            <div className="updates-banner-copy">
              <span className="updates-banner-label">A LITTLE SOMETHING IS COOKING</span>
              <h2>Big updates are coming soon!</h2>
              <p>Fresh new things are on the way. Stay tuned, food lovers.</p>
            </div>
            <a className="updates-banner-link" href="#menu">Explore the menu <ArrowRight size={17} /></a>
          </aside>
          <section className="hero wrap">
            <div className="hero-copy">
              <span className="eyebrow"><span className="live-dot" /> YOUR NEW FAVOURITE CORNER</span>
              <h1>Good food.<br /><em>Good mood.</em></h1>
              <p>Big flavour, no fuss. Fresh corner classics delivered to your door, always on us.</p>
              <a className="button button-dark hero-cta" href="#menu">Order something good <ArrowRight size={18} /></a>
              <div className="hero-meta"><span><Clock3 size={15} /> 25–40 min</span><i /> <span><Truck size={15} /> Always free delivery</span></div>
            </div>
            <div className="hero-image" role="img" aria-label="Freshly made stacked burger and fries">
              <div className="hero-image-label"><span>MADE FOR THE MOMENT</span><strong>Take a bite<br />out of today.</strong></div>
              <span className="hero-stamp">MC<br /><small>EST. 2024</small></span>
            </div>
            <div className="hero-index">01 <span /> 03</div>
          </section>

          <section className="menu-section wrap" id="menu">
            <div className="section-heading">
              <div><span className="eyebrow">THE GOOD STUFF</span><h2>What sounds good?</h2></div>
              <label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find your favourite" aria-label="Search menu" />{search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button>}</label>
            </div>
            <div className="category-row" role="tablist" aria-label="Menu categories">
              {categories.map((category) => <button key={category} className={`category-tab ${activeCategory === category ? 'active' : ''}`} onClick={() => setActiveCategory(category)} role="tab" aria-selected={activeCategory === category}>{category}</button>)}
            </div>
            {visibleMenu.length ? <div className="menu-grid">{visibleMenu.map((item) => <MenuCard key={item.id} item={item} onAdd={() => { updateQuantity(item.id, 1); setToast(`${item.name} added`); }} />)}</div> : <div className="empty-menu"><Search size={22} /><p>No bites found. Try another search.</p></div>}
          </section>

          <section className="delivery-band">
            <div className="wrap delivery-inner"><div className="delivery-icon"><Truck size={22} /></div><div><span className="eyebrow">DELIVERY IS ALWAYS ON US</span><h2>Fresh from our kitchen to your door.</h2></div><a href="#menu" className="text-link">Explore the menu <ArrowRight size={17} /></a></div>
          </section>
      </main>
      <Footer />
      {cartOpen && <CartDrawer items={cartItems} subtotal={subtotal} delivery={delivery} onClose={() => setCartOpen(false)} onQuantity={updateQuantity} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />}
      {checkoutOpen && <CheckoutModal total={subtotal + delivery} customerEmail={customerUser?.email || ''} onClose={() => setCheckoutOpen(false)} onSubmit={placeOrder} />}
      {customerAuthOpen && <CustomerEmailAuthModal client={supabase} onClose={() => setCustomerAuthOpen(false)} />}
      {toast && <div className="toast"><BadgeCheck size={16} /> {toast}</div>}
    </div>
  );
}

function Header({ signedIn, authLoading, cartCount, onCart, onCustomerAuth }) {
  return <header className="site-header"><div className="wrap header-inner"><a href="#" className="brand" aria-label="MUNCHIES CORNER home"><span className="brand-mark">M<span>.</span></span><span className="brand-name">MUNCHIES<br />CORNER</span></a><nav className="main-nav"><a className="selected" href="#">Order food</a><a href="#menu">Our menu</a></nav><div className="header-actions"><span className="open-status"><i /> OPEN NOW</span><button className="customer-auth-button" onClick={onCustomerAuth} disabled={authLoading}>{authLoading ? 'Checking…' : signedIn ? 'Sign out' : 'Sign in'}</button><button className="cart-button" onClick={onCart} aria-label={`Open cart, ${cartCount} items`}><ShoppingBag size={18} /><span>Bag</span><b>{cartCount}</b></button></div></div></header>;
}

function CustomerEmailAuthModal({ client, onClose }) {
  const [email, setEmail] = useState('');
  const [linkSent, setLinkSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const sendSignInLink = async (event) => {
    event.preventDefault();
    setError('');
    if (!client) {
      setError('Email sign-in is not configured yet. Please try again later.');
      return;
    }
    setBusy(true);
    try {
      const { error: requestError } = await client.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin },
      });
      if (requestError) setError(requestError.message);
      else setLinkSent(true);
    } catch (requestError) {
      setError(requestError.message || 'Could not send the sign-in link. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="checkout-modal customer-auth-modal" role="dialog" aria-modal="true" aria-labelledby="customer-auth-title">
      <button className="icon-button modal-close" onClick={onClose} aria-label="Close sign-in"><X size={19} /></button>
      <span className="eyebrow">MUNCHIES CORNER · CUSTOMER</span>
      <h2 id="customer-auth-title">{linkSent ? 'Check your email.' : 'Sign in with your email.'}</h2>
      <p className="modal-intro">{linkSent ? `We sent a sign-in link to ${email.trim()}. Open it to finish signing in.` : 'We’ll email you a one-time sign-in link. Signing in is optional; you can still order as a guest.'}</p>
      {!linkSent && <form onSubmit={sendSignInLink} className="checkout-form">
        <label>Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label>
        <button className="button button-dark checkout-button" type="submit" disabled={busy}>{busy ? 'Sending link…' : 'Email me a sign-in link'} <ArrowRight size={18} /></button>
      </form>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </section>
  </div>;
}

function MenuCard({ item, onAdd }) {
  return <article className={`menu-card ${item.available === false ? 'unavailable' : ''}`}><div className="menu-photo">{item.mediaType === 'video' ? <video src={item.image} muted playsInline loop autoPlay /> : <img src={item.image} alt={item.name} loading="lazy" />}{item.tag && <span className="menu-tag">{item.tag}</span>}<button className="add-button" onClick={onAdd} disabled={item.available === false} aria-label={item.available === false ? `${item.name} coming soon` : `Add ${item.name} to bag`}>{item.available === false ? <Clock3 size={17} /> : <Plus size={19} />}</button></div><div className="menu-card-copy"><div><span className="menu-category">{item.category}</span><h3>{item.name}</h3><p>{item.description}</p></div><strong>{money(item.price)}</strong></div></article>;
}

function CartDrawer({ items, subtotal, delivery, onClose, onQuantity, onCheckout }) {
  return <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="cart-drawer"><div className="drawer-heading"><div><span className="eyebrow">YOUR ORDER</span><h2>Good choices.</h2></div><button className="icon-button" onClick={onClose} aria-label="Close cart"><X size={20} /></button></div>{items.length ? <><div className="cart-lines">{items.map((item) => <div className="cart-line" key={item.id}><img src={item.image} alt="" /><div className="cart-line-copy"><strong>{item.name}</strong><span>{money(item.price)}</span><div className="quantity-control"><button onClick={() => onQuantity(item.id, -1)} aria-label={`Remove one ${item.name}`}><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => onQuantity(item.id, 1)} aria-label={`Add one ${item.name}`}><Plus size={13} /></button></div></div></div>)}</div><div className="cart-totals"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Delivery</span><strong className="free-delivery">FREE</strong></div><div className="total-line"><span>Total</span><strong>{money(subtotal + delivery)}</strong></div><button className="button button-dark checkout-button" onClick={onCheckout}>Continue to checkout <ArrowRight size={18} /></button><p className="pay-note"><Smartphone size={15} /> Your order opens in WhatsApp · Pay after delivery via Lipa na Pochi la Biashara to <b>0794800487</b></p></div></> : <div className="cart-empty"><span className="empty-bag"><ShoppingBag size={25} /></span><h3>Your bag is taking a break.</h3><p>Add something delicious and it will show up here.</p><button className="button button-dark" onClick={onClose}>Browse the menu <ArrowRight size={17} /></button></div>}</aside></div>;
}

function CheckoutModal({ total, customerEmail, onClose, onSubmit }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="checkout-modal"><button className="icon-button modal-close" onClick={onClose} aria-label="Close checkout"><X size={19} /></button><span className="eyebrow">ONE LAST THING</span><h2>Where should we find you?</h2><p className="modal-intro">Delivery is always free. WhatsApp opens with your order drafted; tap <strong>Send</strong> there to place it.</p><form onSubmit={onSubmit} className="checkout-form"><label>Your name<input name="customer" required autoComplete="name" placeholder="e.g. Wanjiku" /></label><label>Your email <span className="optional">OPTIONAL</span><input name="email" type="email" autoComplete="email" defaultValue={customerEmail} placeholder="you@example.com" /></label><div className="form-split"><label>Phone number<input name="phone" required type="tel" autoComplete="tel" placeholder="07xx xxx xxx" /></label><label>Delivery area<input name="address" required autoComplete="street-address" placeholder="Estate, street or landmark" /></label></div><label>Kitchen note <span className="optional">OPTIONAL</span><textarea name="note" rows="2" placeholder="Anything we should know?" /></label><div className="payment-callout"><Smartphone size={19} /><span><strong>Pay after delivery</strong><small>Safaricom Lipa na Pochi la Biashara to 0794800487 when your order arrives.</small></span></div><button className="button button-dark checkout-button" type="submit">Open WhatsApp · {money(total)} <ArrowRight size={18} /></button></form></div></div>;
}

function Footer() { return <footer className="site-footer"><div className="wrap footer-inner"><a className="brand footer-brand" href="#"><span className="brand-mark">M<span>.</span></span><span className="brand-name">MUNCHIES<br />CORNER</span></a><span>Good food finds its way.</span><div className="footer-contact"><a href="mailto:bungeygarethh@gmail.com">Email us</a><a href="https://wa.me/254794800487" target="_blank" rel="noreferrer">WhatsApp · 0794800487</a></div><span className="copyright">© 2026 Munchies Corner</span></div></footer>; }

export default App;
