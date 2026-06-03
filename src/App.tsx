import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Menu as MenuIcon,
  Moon,
  Minus,
  Phone,
  Plus,
  Send,
  ShoppingCart,
  Star,
  Sun,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { MENU_ITEMS } from "./constants";
import { CartItem, ComboInfo, ComboItem, MenuItem } from "./types";
import { cn } from "./lib/utils";

const COMBO_PONUKY = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQer8aeMT5jYlxJ5GemQjl6C0oo7Noedqe0pC41a6FqobbXmc7wzckVddCMs6rOrTjamqa9O0Y0TVc3/pub?gid=0&single=true&output=csv";
const COMBO_INFO = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQer8aeMT5jYlxJ5GemQjl6C0oo7Noedqe0pC41a6FqobbXmc7wzckVddCMs6rOrTjamqa9O0Y0TVc3/pub?gid=117799646&single=true&output=csv";

type OrderItemInput = MenuItem | {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: MenuItem["category"];
  weight?: string;
  allergens?: string;
};

type Lang = "sk" | "en";
type ThemeMode = "dark" | "light";

const navItems = [
  { id: "obedové-menu", label: { sk: "Obedové menu", en: "Lunch menu" } },
  { id: "menu", label: { sk: "Menu", en: "Menu" } },
  { id: "prečo-my", label: { sk: "Prečo my", en: "Why us" } },
  { id: "kde-sme", label: { sk: "Kde sme", en: "Find us" } },
  { id: "kontakt", label: { sk: "Kontakt", en: "Contact" } },
];

const categoryIds: MenuItem["category"][] = ["burgers", "pizza", "salads", "soups"];

const translations = {
  sk: {
    langLabel: "Jazyk",
    themeLabel: "Režim",
    darkMode: "Tmavý",
    lightMode: "Svetlý",
    cartOpen: "Otvoriť košík",
    callShort: "Zavolať",
    callPhone: "Zavolať 0902 669 123",
    heroBadge: "Trenčín — Východná ulica",
    heroKicker: "Pizza & Burgers",
    heroLine1: "POCTIVÉ",
    heroAccent: "BURGRE",
    heroLine2: "& TALIANSKA",
    heroLine3: "PIZZA",
    heroText: "Smash burgre z čerstvého hovädzieho, pizza z vlastného cesta a šaláty. Na sídlisku Juh s parkovaním pri dverách.",
    viewMenu: "Pozrieť menu",
    callToOrder: "Objednať telefonicky",
    opening1: "Po – So: 12:00 – 22:00",
    opening2: "Ne: 12:00 – 21:00",
    featureCards: [
      { title: "Smash Burgre", label: "Špeciality" },
      { title: "Pizza", label: "Talianska" },
      { title: "Šaláty & Poké", label: "Zdravo & čerstvo" },
    ],
    lunchKicker: "Denné menu",
    lunchTitle: "OBEDOVÉ",
    lunchAccent: "COMBO",
    lunchText: "Rýchle obedové combo načítané priamo z aktuálnej ponuky.",
    price: "Cena",
    monday: "Pondelok",
    comboPrefix: "Obedové combo",
    add: "Pridať",
    comboLoadError: "Obedové menu sa nepodarilo načítať.",
    menuKicker: "Naše menu",
    menuTitle: "ČO U NÁS DOSTANETE",
    menuText: "Všetky burgre podávame s domácimi hranolkami. Alergény sú označené číslami pri každej položke.",
    allergens: "Alergény",
    categories: { burgers: "Burgre", pizza: "Pizza", salads: "Šaláty & Poké", soups: "Polievky" },
    whyKicker: "Prečo my",
    whyTitle: "JEDLO BEZ DIVADLA",
    whyText: "Jednoduché veci treba robiť poctivo. Zvyšok je marketingový dymostroj pre ľudí, ktorí predávajú suchú žemľu ako zážitok.",
    benefits: [
      { title: "Čerstvé suroviny", text: "Hovädzie, vlastné cesto a veci, ktoré majú chuť." },
      { title: "Jasné menu", text: "Vieš, čo objednávaš. Žiadna kuchárska poézia bez obsahu." },
      { title: "Parkovanie pri dverách", text: "Sídlisko Juh, Východná ulica. Praktické, ako má byť." },
      { title: "Dlhé otváracie hodiny", text: "Po–So do 22:00, nedeľa do 21:00." },
    ],
    locationKicker: "Kde sme",
    locationTitle: "TRENČÍN — JUH",
    locationText: "Východná 2425/1, Trenčín. Keď nájdeš parkovanie, už si skoro vyhral. Tu ho máš pri dverách.",
    navigate: "Navigovať",
    contactKicker: "Kontakt",
    contactTitle: "OBJEDNAJ ALEBO NAPÍŠ",
    phone: "Telefón",
    cart: "KOŠÍK",
    cartFloating: "Košík",
    cartItems: "položiek",
    cartEmpty: "Košík je prázdny.",
    total: "Celkom",
    placeholders: { name: "Meno *", phone: "Telefón *", email: "Email", address: "Adresa alebo osobný odber", note: "Poznámka" },
    success: "Objednávka bola odoslaná.",
    error: "Chyba pri odosielaní. Skús WhatsApp.",
    sending: "Odosielam...",
    send: "Odoslať",
    validation: "Prosím vyplňte meno a telefón.",
    waGreeting: "Dobrý deň, objednávka:",
    orderSubject: "Nová objednávka",
    formLabels: { name: "Meno", phone: "Telefón", address: "Adresa", pickup: "osobný odber", note: "Poznámka", total: "Celkom" },
  },
  en: {
    langLabel: "Language",
    themeLabel: "Theme",
    darkMode: "Dark",
    lightMode: "Light",
    cartOpen: "Open cart",
    callShort: "Call",
    callPhone: "Call 0902 669 123",
    heroBadge: "Trenčín — Východná Street",
    heroKicker: "Pizza & Burgers",
    heroLine1: "CRAFT",
    heroAccent: "BURGERS",
    heroLine2: "& ITALIAN",
    heroLine3: "PIZZA",
    heroText: "Smash burgers made with fresh beef, pizza from house-made dough, and fresh salads. Located in Trenčín with easy parking right by the entrance.",
    viewMenu: "View menu",
    callToOrder: "Call to order",
    opening1: "Mon – Sat: 12:00 – 22:00",
    opening2: "Sun: 12:00 – 21:00",
    featureCards: [
      { title: "Smash Burgers", label: "Specialities" },
      { title: "Pizza", label: "Italian" },
      { title: "Salads & Poké", label: "Fresh & light" },
    ],
    lunchKicker: "Daily menu",
    lunchTitle: "LUNCH",
    lunchAccent: "COMBO",
    lunchText: "A quick lunch combo loaded directly from the current daily offer.",
    price: "Price",
    monday: "Monday",
    comboPrefix: "Lunch combo",
    add: "Add",
    comboLoadError: "The lunch menu could not be loaded.",
    menuKicker: "Our menu",
    menuTitle: "WHAT WE SERVE",
    menuText: "All burgers are served with house fries. Allergens are listed by number for each item.",
    allergens: "Allergens",
    categories: { burgers: "Burgers", pizza: "Pizza", salads: "Salads & Poké", soups: "Soups" },
    whyKicker: "Why us",
    whyTitle: "NO-NONSENSE FOOD",
    whyText: "Simple food needs to be done properly. Fresh ingredients, clear flavours, and no fake theatre around the plate.",
    benefits: [
      { title: "Fresh ingredients", text: "Beef, house-made dough, and food that actually tastes like something." },
      { title: "Clear menu", text: "You know exactly what you are ordering. No culinary poetry hiding an empty plate." },
      { title: "Parking by the entrance", text: "Východná Street, Trenčín — Juh. Practical, fast, easy." },
      { title: "Long opening hours", text: "Mon–Sat until 22:00, Sunday until 21:00." },
    ],
    locationKicker: "Find us",
    locationTitle: "TRENČÍN — JUH",
    locationText: "Východná 2425/1, Trenčín. Easy to find, easy to park, and dangerously easy to come back again.",
    navigate: "Navigate",
    contactKicker: "Contact",
    contactTitle: "ORDER OR MESSAGE US",
    phone: "Phone",
    cart: "CART",
    cartFloating: "Cart",
    cartItems: "items",
    cartEmpty: "Your cart is empty.",
    total: "Total",
    placeholders: { name: "Name *", phone: "Phone *", email: "Email", address: "Address or pickup", note: "Note" },
    success: "Your order has been sent.",
    error: "Something went wrong. Try WhatsApp.",
    sending: "Sending...",
    send: "Send",
    validation: "Please fill in your name and phone number.",
    waGreeting: "Hello, I would like to place an order:",
    orderSubject: "New order",
    formLabels: { name: "Name", phone: "Phone", address: "Address", pickup: "pickup", note: "Note", total: "Total" },
  },
} as const;

const menuTranslations: Record<string, { en: { name: string; description: string } }> = {
  "alcatraz-burger": { en: { name: "Alcatraz Burger", description: "130g ground beef, mayo, lettuce, grilled bacon, cheddar, egg, grilled onion" } },
  "hot-chilli-smash": { en: { name: "Hot Chilli Smash Burger", description: "130g beef in two patties, mayo, grilled bacon, cheddar, fresh onion, jalapeños" } },
  "chicken-burger": { en: { name: "Chicken Burger", description: "130g grilled chicken breast, mayo, lettuce, mozzarella, grilled bacon, cheddar, tomato" } },
  "ultimate-burger": { en: { name: "Ultimate Burger", description: "130g ground beef, mayo, lettuce, cheddar, grilled bacon, BBQ sauce, red onion, pickles" } },
  "bacon-smash": { en: { name: "Bacon Smash Burger", description: "130g beef in two patties, mayo, lettuce, cheddar, grilled bacon, fresh onion" } },
  "cheese-smash": { en: { name: "Cheese Smash Burger", description: "130g beef in two patties, mayo, lettuce, double cheddar, grilled bacon, grilled melting cheese" } },
  "pulled-duck": { en: { name: "Pulled Duck Leg Burger", description: "150g confit duck leg, onion chutney, house pâté" } },
  "veggie-burger": { en: { name: "Veggie Burger", description: "Grilled smoked cheese, grilled zucchini and mushrooms, arugula, cranberry mayo, crispy Viennese onion" } },
  "pizza-stangle": { en: { name: "Pizza Sticks", description: "Crispy pizza sticks" } },
  "margherita": { en: { name: "Margherita", description: "Tomato sauce, mozzarella, fresh cherry tomatoes" } },
  "prosciutto": { en: { name: "Prosciutto", description: "Tomato sauce, mozzarella, ham" } },
  "prosciutto-e-funghi": { en: { name: "Prosciutto e Funghi", description: "Tomato sauce, mozzarella, ham, mushrooms" } },
  "cinque-formaggi": { en: { name: "Cinque Formaggi", description: "Tomato sauce, gouda, mozzarella, blue cheese, smoked cheese, parmesan" } },
  "quattro-stagioni": { en: { name: "Quattro Stagioni", description: "Tomato sauce, mozzarella, ham, artichokes, capers, olives, mushrooms" } },
  "quattro-carne": { en: { name: "Quattro Carne", description: "Tomato sauce, mozzarella, ham, Italian salami, bacon, sausage" } },
  "toto": { en: { name: "Toto", description: "Tomato sauce, mozzarella, Italian salami, mushrooms, jalapeños, red onion" } },
  "fatoria": { en: { name: "Fatoria", description: "Tomato sauce, mozzarella, ham, blue cheese, olives, chicken" } },
  "prosciutto-crudo-rucola": { en: { name: "Prosciutto Crudo Rucola", description: "Tomato sauce, mozzarella, prosciutto crudo, cherry tomatoes, fresh arugula" } },
  "hercules": { en: { name: "Hercules", description: "Tomato sauce, mozzarella, salami, corn, jalapeños, pepper, gorgonzola" } },
  "hawaii": { en: { name: "Hawaii", description: "Tomato sauce, cheese, ham, pineapple" } },
  "alcatraz-pizza": { en: { name: "Alcatraz Pizza", description: "BBQ base, cheese, 150g beef, egg, jalapeños, red onion, garlic" } },
  "goat-cheese-salad": { en: { name: "Goat Cheese Salad", description: "Mixed leaf salad, caramelised pear, fresh grapes, grilled goat cheese, walnuts, figs, maple syrup" } },
  "double-cheese-salad": { en: { name: "Double Cheese Salad", description: "Mixed leaf salad, cherry tomatoes, cucumber, radish, grilled blue cheese, chicken, parmesan" } },
  "chicken-poke": { en: { name: "Chicken Poké", description: "Jasmine rice, grilled teriyaki chicken, edamame, wakame, avocado, carrot, cucumber, radish, pomegranate, cashews, sesame. Japanese mayo and sriracha." } },
  "beef-broth": { en: { name: "Homemade Beef Broth", description: "With noodles and vegetables" } },
  "soup-of-the-day": { en: { name: "Soup of the Day", description: "According to the daily offer" } },
};

function parseCSV(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQ = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === "\"" && text[i + 1] === "\"") {
        field += "\"";
        i++;
      } else if (c === "\"") {
        inQ = false;
      } else {
        field += c;
      }
    } else {
      if (c === "\"") inQ = true;
      else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (c !== "\r") {
        field += c;
      }
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((x) => x && x.trim()));
}

function csvToObjects<T>(text: string): T[] {
  const rows = parseCSV(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase());

  return rows.slice(1).map((r) => {
    const o: Record<string, string> = {};
    headers.forEach((h, i) => {
      o[h] = (r[i] || "").trim();
    });
    return o as T;
  });
}

function priceFromCombo(value?: string) {
  return parseFloat(value?.replace(/[^\d.,]/g, "").replace(",", ".") || "0");
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "sk";
    const savedLang = window.localStorage.getItem("alcatraz-lang");
    return savedLang === "en" ? "en" : "sk";
  });
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    const savedTheme = window.localStorage.getItem("alcatraz-theme");
    return savedTheme === "light" ? "light" : "dark";
  });
  const t = translations[lang];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MenuItem["category"]>("burgers");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [comboItems, setComboItems] = useState<ComboItem[]>([]);
  const [comboInfo, setComboInfo] = useState<ComboInfo | null>(null);
  const [isLoadingCombo, setIsLoadingCombo] = useState(true);
  const [orderStatus, setOrderStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  });

  useEffect(() => {
    window.localStorage.setItem("alcatraz-lang", lang);
  }, [lang]);

  useEffect(() => {
    window.localStorage.setItem("alcatraz-theme", theme);
    document.documentElement.classList.toggle("theme-light", theme === "light");
    document.documentElement.classList.toggle("theme-dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function fetchCombo() {
      try {
        const [ponukyRes, infoRes] = await Promise.all([
          fetch(COMBO_PONUKY, { cache: "no-store" }),
          fetch(COMBO_INFO, { cache: "no-store" }),
        ]);

        if (!ponukyRes.ok || !infoRes.ok) throw new Error("Fetch failed");

        const [ponukyTxt, infoTxt] = await Promise.all([
          ponukyRes.text(),
          infoRes.text(),
        ]);

        setComboItems(csvToObjects<ComboItem>(ponukyTxt));

        const infoRows = csvToObjects<{ kluc: string; hodnota: string }>(infoTxt);
        const info: Record<string, string> = {};
        infoRows.forEach((r) => {
          if (r.kluc) info[r.kluc.toLowerCase()] = r.hodnota;
        });
        setComboInfo(info as unknown as ComboInfo);
      } catch (err) {
        console.error("Error loading combo:", err);
      } finally {
        setIsLoadingCombo(false);
      }
    }

    fetchCombo();
  }, []);

  const addToCart = (item: OrderItemInput) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }

      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          description: item.description || "",
          price: item.price,
          category: item.category || "burgers",
          weight: item.weight,
          allergens: item.allergens,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const filteredItems = useMemo(
    () => MENU_ITEMS.filter((item) => item.category === activeCategory),
    [activeCategory]
  );

  const displayItems = useMemo(
    () => filteredItems.map((item) => {
      if (lang === "en") {
        const translated = menuTranslations[item.id]?.en;
        if (translated) return { ...item, ...translated };
      }
      return item;
    }),
    [filteredItems, lang]
  );

  const categories = useMemo(
    () => categoryIds.map((id) => ({ id, label: t.categories[id] })),
    [t]
  );

  const handleOrderWhatsApp = () => {
    if (!form.name || !form.phone) {
      alert(t.validation);
      return;
    }

    const itemsText = cart
      .map((i) => `• ${i.name} x${i.quantity} — ${(i.price * i.quantity).toFixed(2)}€`)
      .join("\n");

    const msg = `${t.waGreeting}\n\n${t.formLabels.name}: ${form.name}\n${t.formLabels.phone}: ${form.phone}\n${t.formLabels.address}: ${form.address || t.formLabels.pickup}\n${t.formLabels.note}: ${form.note}\n\n${itemsText}\n\n${t.formLabels.total}: ${cartTotal.toFixed(2)}€`;
    window.open(`https://wa.me/421902669123?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleOrderEmail = async () => {
    if (!form.name || !form.phone) {
      alert(t.validation);
      return;
    }

    setOrderStatus("sending");

    const itemsText = cart
      .map((i) => `${i.name} x${i.quantity} — ${(i.price * i.quantity).toFixed(2)}€`)
      .join("\n");

    const payload = {
      _subject: `${t.orderSubject} — ${form.name}`,
      meno: form.name,
      telefon: form.phone,
      email: form.email,
      adresa: form.address || t.formLabels.pickup,
      poznamka: form.note,
      polozky: itemsText,
      celkom: `${cartTotal.toFixed(2)}€`,
    };

    try {
      const res = await fetch("https://formspree.io/f/maqlvjkg", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOrderStatus("success");
        setCart([]);
        setForm({ name: "", phone: "", email: "", address: "", note: "" });
        setTimeout(() => {
          setOrderStatus("idle");
          setIsCartOpen(false);
        }, 2500);
      } else {
        setOrderStatus("error");
      }
    } catch (err) {
      setOrderStatus("error");
    }
  };

  return (
    <div className={cn("min-h-screen overflow-x-hidden selection:bg-brand-accent selection:text-brand-bg transition-colors duration-300", theme === "light" ? "theme-light" : "theme-dark")}>
      <nav
        className={cn(
          "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
          isScrolled ? "bg-brand-bg/92 shadow-xl backdrop-blur-xl border-b border-white/10" : "bg-brand-bg/82 backdrop-blur-xl border-b border-white/5"
        )}
      >
        <div className="container flex h-16 items-center justify-between gap-3 sm:h-20">
          <a href="#" className="flex items-center gap-3 shrink-0" aria-label="Alcatraz domov">
            <img src="logo.png" alt="Alcatraz Pizza and Burgers" className="h-11 w-auto sm:h-14" />
            <span className="hidden font-display text-3xl tracking-wider text-white sm:block">ALCATRAZ</span>
          </a>

          <div className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-xs font-bold uppercase tracking-[0.18em] text-brand-text-muted transition-colors hover:text-brand-accent"
              >
                {item.label[lang]}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1 text-[11px] font-black uppercase tracking-[0.08em] sm:rounded-2xl" aria-label={t.langLabel}>
              <button
                type="button"
                onClick={() => setLang("sk")}
                className={cn("rounded-lg px-2.5 py-1.5 transition-colors", lang === "sk" ? "bg-brand-accent text-brand-bg" : "text-brand-text-muted hover:text-white")}
              >
                SK
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={cn("rounded-lg px-2.5 py-1.5 transition-colors", lang === "en" ? "bg-brand-accent text-brand-bg" : "text-brand-text-muted hover:text-white")}
              >
                EN
              </button>
            </div>

            <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1 text-[11px] font-black uppercase tracking-[0.08em] sm:rounded-2xl" aria-label={t.themeLabel}>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={cn("flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition-colors", theme === "dark" ? "bg-brand-accent text-brand-bg" : "text-brand-text-muted hover:text-white")}
                aria-label={t.darkMode}
                title={t.darkMode}
              >
                <Moon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.darkMode}</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={cn("flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition-colors", theme === "light" ? "bg-brand-accent text-brand-bg" : "text-brand-text-muted hover:text-white")}
                aria-label={t.lightMode}
                title={t.lightMode}
              >
                <Sun className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.lightMode}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-colors hover:border-brand-accent/40 hover:text-brand-accent sm:h-11 sm:w-11 sm:rounded-2xl"
              aria-label={t.cartOpen}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-accent px-1 text-[10px] font-black text-brand-bg">
                  {cartCount}
                </span>
              )}
            </button>

            <a
              href="tel:+421902669123"
              className="hidden items-center gap-2 rounded-2xl bg-brand-accent px-5 py-3 text-sm font-black text-brand-bg transition-colors hover:bg-brand-accent-hover lg:flex"
            >
              <Phone className="h-4 w-4" />
              0902 669 123
            </a>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white sm:h-11 sm:w-11 sm:rounded-2xl md:hidden"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-brand-bg/96 px-4 pt-24 backdrop-blur-xl md:hidden"
          >
            <div className="mx-auto flex max-w-sm flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-4 font-display text-3xl tracking-wide text-white transition-colors hover:text-brand-accent"
                >
                  {item.label[lang]}
                </a>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-3xl border border-white/10 bg-white/[0.03] p-2 text-sm font-black uppercase tracking-[0.12em]">
                <button type="button" onClick={() => setLang("sk")} className={cn("rounded-2xl px-4 py-3", lang === "sk" ? "bg-brand-accent text-brand-bg" : "text-brand-text-muted")}>SK</button>
                <button type="button" onClick={() => setLang("en")} className={cn("rounded-2xl px-4 py-3", lang === "en" ? "bg-brand-accent text-brand-bg" : "text-brand-text-muted")}>EN</button>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-3xl border border-white/10 bg-white/[0.03] p-2 text-sm font-black uppercase tracking-[0.12em]">
                <button type="button" onClick={() => setTheme("dark")} className={cn("flex items-center justify-center gap-2 rounded-2xl px-4 py-3", theme === "dark" ? "bg-brand-accent text-brand-bg" : "text-brand-text-muted")}>
                  <Moon className="h-4 w-4" />
                  {t.darkMode}
                </button>
                <button type="button" onClick={() => setTheme("light")} className={cn("flex items-center justify-center gap-2 rounded-2xl px-4 py-3", theme === "light" ? "bg-brand-accent text-brand-bg" : "text-brand-text-muted")}>
                  <Sun className="h-4 w-4" />
                  {t.lightMode}
                </button>
              </div>
              <a
                href="tel:+421902669123"
                className="mt-3 flex items-center justify-center gap-3 rounded-3xl bg-brand-accent px-5 py-4 text-base font-black text-brand-bg"
              >
                <Phone className="h-5 w-5" />
                {t.callPhone}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="relative overflow-hidden pt-24 pb-12 sm:pt-32 sm:pb-16 lg:min-h-screen lg:pt-36">
        <div className="absolute inset-0 -z-10">
          <img src="hero_pozadie.webp" alt="Burger Alcatraz" className="h-full w-full object-cover object-[62%_center] opacity-45 sm:opacity-55" />
          <div className="hero-overlay absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(178,201,193,0.16),transparent_34%),linear-gradient(90deg,rgba(26,26,26,0.98),rgba(26,26,26,0.80)_42%,rgba(26,26,26,0.54)),linear-gradient(180deg,rgba(26,26,26,0.35),#1a1a1a_96%)]" />
        </div>

        <div className="container flex min-h-[calc(100svh-8.5rem)] items-center pb-4 sm:min-h-[calc(92svh-8rem)] lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="w-full max-w-2xl"
          >
            <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-brand-gold/25 bg-brand-bg-lighter/70 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-brand-gold backdrop-blur sm:mb-5 sm:px-4 sm:text-xs sm:tracking-[0.18em]">
              <Star className="h-3.5 w-3.5 fill-brand-gold" />
              {t.heroBadge}
            </div>

            <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-brand-accent sm:text-sm sm:tracking-[0.32em]">{t.heroKicker}</p>
            <h1 className="max-w-[10.5ch] font-display text-[clamp(2.85rem,13.2vw,4.35rem)] leading-[0.9] tracking-wide text-white sm:max-w-[12ch] sm:text-[clamp(5rem,10vw,8.4rem)] sm:leading-[0.86] lg:max-w-[10.5ch]">
              <span className="block">{t.heroLine1} <span className="text-brand-accent">{t.heroAccent}</span></span>
              <span className="block">{t.heroLine2}</span>
              <span className="block">{t.heroLine3}</span>
            </h1>

            <p className="mt-5 max-w-[34rem] text-[15px] leading-7 text-brand-text-muted sm:mt-6 sm:text-lg sm:leading-8">
              {t.heroText}
            </p>

            <div className="mt-7 flex w-full flex-col gap-3 sm:mt-8 sm:max-w-none sm:flex-row">
              <a href="#menu" className="inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-2xl bg-brand-accent px-5 py-4 text-base font-black text-brand-bg shadow-xl shadow-brand-accent/15 transition-colors hover:bg-brand-accent-hover sm:w-auto sm:min-h-14 sm:px-6">
                {t.viewMenu}
                <ChevronRight className="ml-2 h-5 w-5" />
              </a>
              <a href="tel:+421902669123" className="inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-2xl border border-white/15 bg-white/[0.03] px-5 py-4 text-base font-black text-white backdrop-blur transition-colors hover:border-brand-gold/50 hover:text-brand-gold sm:w-auto sm:min-h-14 sm:px-6">
                {t.callToOrder}
              </a>
            </div>

            <div className="mt-7 grid max-w-md grid-cols-1 gap-3 text-[13px] text-brand-text-muted sm:mt-8 sm:grid-cols-2 sm:text-sm">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <Clock className="h-4 w-4 text-brand-accent" />
                {t.opening1}
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <Clock className="h-4 w-4 text-brand-accent" />
                {t.opening2}
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <div className="hidden">
        <div className="container grid grid-cols-3 gap-2 py-3 text-xs font-black uppercase tracking-[0.12em]">
          <a href="tel:+421902669123" className="rounded-2xl border border-white/10 px-3 py-3 text-center text-brand-text">{t.callShort}</a>
          <button type="button" onClick={() => setIsCartOpen(true)} className="rounded-2xl bg-brand-accent px-3 py-3 text-center text-brand-bg">{t.cartFloating} {cartCount > 0 ? `(${cartCount})` : ""}</button>
          <a href="#menu" className="rounded-2xl border border-white/10 px-3 py-3 text-center text-brand-text">Menu</a>
        </div>
      </div>

      <section className="section bg-brand-bg-lighter">
        <div className="container grid gap-5 md:grid-cols-3">
          {[
            { ...t.featureCards[0], img: "burger.webp", cat: "burgers" },
            { ...t.featureCards[1], img: "Pizza.webp", cat: "pizza" },
            { ...t.featureCards[2], img: "Poké.webp", cat: "salads" },
          ].map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => {
                setActiveCategory(item.cat as MenuItem["category"]);
                document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group relative aspect-[1.35/1] overflow-hidden rounded-[2rem] border border-white/10 bg-brand-bg text-left shadow-2xl md:aspect-[4/3]"
            >
              <img src={item.img} alt={item.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/35 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                <div className="mb-2 text-[11px] font-black uppercase tracking-[0.25em] text-brand-accent">{item.label}</div>
                <h2 className="text-4xl text-white sm:text-5xl">{item.title}</h2>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section id="obedové-menu" className="section overflow-hidden">
        <div className="container">
          <div className="mb-9 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="section-kicker">{t.lunchKicker}</div>
              <h2 className="section-title">{t.lunchTitle} <span className="text-brand-gold">{t.lunchAccent}</span></h2>
              <p className="mt-4 max-w-2xl text-brand-text-muted">{t.lunchText}</p>
            </div>

            {comboInfo && (
              <div className="rounded-[1.5rem] border border-brand-gold/20 bg-brand-bg-lighter p-5 text-left sm:rounded-[2rem] lg:min-w-80">
                <div className="text-[11px] font-black uppercase tracking-[0.25em] text-brand-text-muted">{t.price}</div>
                <div className="mt-1 font-display text-5xl leading-none text-brand-gold sm:text-6xl">{comboInfo.cena}</div>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-brand-text-muted">
                  <Clock className="h-4 w-4" />
                  {comboInfo.cas}
                </div>
                {comboInfo.pondelok && <div className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-brand-accent">{t.monday} — {comboInfo.pondelok}</div>}
              </div>
            )}
          </div>

          {isLoadingCombo ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-44 animate-pulse rounded-[2rem] bg-brand-bg-lighter" />)}
            </div>
          ) : comboItems.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {comboItems.map((item, idx) => (
                <article key={`${item.cislo}-${idx}`} className="card flex flex-col gap-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-gold/10 font-display text-2xl text-brand-gold">{item.cislo || "•"}</div>
                    <div>
                      <h3 className="text-2xl leading-tight text-white">{item.nazov}</h3>
                      <p className="mt-2 text-sm leading-6 text-brand-text-muted">{item.popis}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToCart({
                      id: `combo-${idx}`,
                      name: `${t.comboPrefix} — ${item.nazov}`,
                      price: priceFromCombo(comboInfo?.cena),
                      description: item.popis,
                      category: "burgers",
                    })}
                    className="mt-auto inline-flex min-h-12 items-center justify-center rounded-2xl border border-brand-accent/25 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-brand-accent transition-colors hover:bg-brand-accent hover:text-brand-bg"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t.add}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-white/10 bg-brand-bg-lighter p-6 text-brand-text-muted">{t.comboLoadError}</div>
          )}
        </div>
      </section>

      <section id="menu" className="section bg-brand-bg-lighter">
        <div className="container">
          <div className="mb-8 max-w-3xl">
            <div className="section-kicker">{t.menuKicker}</div>
            <h2 className="section-title">{t.menuTitle}</h2>
            <p className="mt-4 text-brand-text-muted">{t.menuText}</p>
          </div>

          <div className="mb-7 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "min-h-12 rounded-2xl border px-3 py-3 text-center text-[12px] font-black uppercase tracking-[0.11em] transition-colors sm:px-5 sm:text-sm sm:tracking-[0.13em]",
                  activeCategory === cat.id
                    ? "border-brand-accent bg-brand-accent text-brand-bg"
                    : "border-white/10 bg-brand-bg text-brand-text-muted hover:text-white"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {displayItems.map((item) => (
              <article key={item.id} className="menu-card">
                <div className="min-w-0">
                  <h3 className="text-2xl leading-tight text-white sm:text-3xl">{item.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-brand-text-muted">{item.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-brand-text-muted">
                    {item.weight && <span className="rounded-full bg-white/5 px-3 py-1.5">{item.weight}</span>}
                    {item.allergens && <span className="rounded-full bg-white/5 px-3 py-1.5">{t.allergens}: {item.allergens}</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                  <div className="font-display text-4xl leading-none text-brand-gold">{item.price.toFixed(2)}€</div>
                  <button
                    type="button"
                    onClick={() => addToCart(item)}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-accent text-brand-bg transition-colors hover:bg-brand-accent-hover"
                    aria-label={`${t.add} ${item.name}`}
                  >
                    <Plus className="h-6 w-6" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="prečo-my" className="section">
        <div className="container">
          <div className="mb-9 max-w-3xl">
            <div className="section-kicker">{t.whyKicker}</div>
            <h2 className="section-title">{t.whyTitle}</h2>
            <p className="mt-4 text-brand-text-muted">{t.whyText}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: UtensilsCrossed, ...t.benefits[0] },
              { icon: CheckCircle2, ...t.benefits[1] },
              { icon: MapPin, ...t.benefits[2] },
              { icon: Clock, ...t.benefits[3] },
            ].map((item) => (
              <article key={item.title} className="card">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-brand-text-muted">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="kde-sme" className="section bg-brand-bg-lighter">
        <div className="container grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div className="card flex flex-col justify-between gap-8">
            <div>
              <div className="section-kicker">{t.locationKicker}</div>
              <h2 className="section-title">{t.locationTitle}</h2>
              <p className="mt-4 text-brand-text-muted">{t.locationText}</p>
            </div>

            <div className="space-y-3">
              <a href="https://www.google.com/maps/search/?api=1&query=V%C3%BDchodn%C3%A1+2425%2F1%2C+Tren%C4%8D%C3%ADn" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-2xl bg-brand-accent px-5 py-4 font-black text-brand-bg">
                {t.navigate}
                <ChevronRight className="h-5 w-5" />
              </a>
              <a href="tel:+421902669123" className="flex items-center justify-between rounded-2xl border border-white/10 px-5 py-4 font-black text-white">
                0902 669 123
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="min-h-[320px] overflow-hidden rounded-[2rem] border border-white/10 bg-brand-bg shadow-2xl sm:min-h-[440px]">
            <iframe
              title="Alcatraz mapa"
              src="https://www.google.com/maps?q=V%C3%BDchodn%C3%A1%202425%2F1%2C%20Tren%C4%8D%C3%ADn&output=embed"
              className="h-full min-h-[320px] w-full sm:min-h-[440px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section id="kontakt" className="section">
        <div className="container">
          <div className="mb-9 max-w-3xl">
            <div className="section-kicker">{t.contactKicker}</div>
            <h2 className="section-title">{t.contactTitle}</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: t.phone, val: "0902 669 123", href: "tel:+421902669123", icon: Phone },
              { label: "Email", val: "alcatraz@alcatraz.sk", href: "mailto:alcatraz@alcatraz.sk", icon: Mail },
              { label: "Facebook", val: "@alcatrazbistro", href: "https://www.facebook.com/alcatrazbistro/", icon: Facebook },
              { label: "Instagram", val: "@alcatraztn", href: "https://www.instagram.com/alcatraztn/", icon: Instagram },
            ].map((item) => (
              <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="card group">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent transition-transform group-hover:scale-105">
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-brand-text-muted">{item.label}</div>
                <div className="mt-2 break-words text-lg font-bold text-white group-hover:text-brand-accent">{item.val}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10">
        <div className="container flex flex-col gap-5 text-sm text-brand-text-muted md:flex-row md:items-center md:justify-between">
          <div>© 2026 Alcatraz Pizza & Burgers · Východná 2425/1, Trenčín</div>
          <div className="flex gap-3">
            <a href="https://www.facebook.com/alcatrazbistro/" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 hover:text-brand-accent"><Facebook className="h-5 w-5" /></a>
            <a href="https://www.instagram.com/alcatraztn/" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 hover:text-brand-accent"><Instagram className="h-5 w-5" /></a>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {cartCount > 0 && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 12 }}
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-5 right-5 z-40 hidden items-center gap-3 rounded-3xl bg-brand-accent px-5 py-4 font-black text-brand-bg shadow-2xl shadow-brand-accent/20 md:flex"
          >
            <ShoppingCart className="h-5 w-5" />
            {t.cartFloating}
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-bg px-1 text-xs text-brand-accent">{cartCount}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-sm"
            />

            <motion.aside
              initial={{ y: "100%", x: 0 }}
              animate={{ y: 0, x: 0 }}
              exit={{ y: "100%", x: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[94svh] flex-col rounded-t-[1.5rem] border-t border-white/10 bg-brand-bg-lighter shadow-2xl sm:rounded-t-[2rem] md:inset-x-auto md:bottom-0 md:right-0 md:top-0 md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none md:border-l md:border-t-0"
            >
              <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6">
                <div>
                  <h3 className="text-4xl text-white">{t.cart}</h3>
                  <p className="text-sm text-brand-text-muted">{cartCount} {t.cartItems}</p>
                </div>
                <button type="button" onClick={() => setIsCartOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                {cart.length === 0 ? (
                  <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center text-brand-text-muted">
                    <ShoppingCart className="h-14 w-14 opacity-30" />
                    <p>{t.cartEmpty}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="rounded-3xl border border-white/10 bg-brand-bg p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-bold leading-snug text-white">{item.name}</h4>
                            <div className="mt-1 font-display text-2xl text-brand-gold">{(item.price * item.quantity).toFixed(2)}€</div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-brand-bg-lighter p-1">
                            <button type="button" onClick={() => removeFromCart(item.id)} className="flex h-9 w-9 items-center justify-center rounded-xl hover:text-brand-accent"><Minus className="h-4 w-4" /></button>
                            <span className="w-6 text-center font-black">{item.quantity}</span>
                            <button type="button" onClick={() => addToCart(item)} className="flex h-9 w-9 items-center justify-center rounded-xl hover:text-brand-accent"><Plus className="h-4 w-4" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="space-y-5 border-t border-white/10 bg-brand-bg p-5 sm:p-6">
                  <div className="flex items-end justify-between gap-4">
                    <span className="text-xs font-black uppercase tracking-[0.22em] text-brand-text-muted">{t.total}</span>
                    <span className="font-display text-5xl leading-none text-brand-gold">{cartTotal.toFixed(2)}€</span>
                  </div>

                  <div className="grid gap-3">
                    <input type="text" placeholder={t.placeholders.name} className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <input type="tel" placeholder={t.placeholders.phone} className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    <input type="email" placeholder={t.placeholders.email} className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <input type="text" placeholder={t.placeholders.address} className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                    <textarea placeholder={t.placeholders.note} className="input min-h-20 resize-none" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                  </div>

                  {orderStatus === "success" && <div className="rounded-2xl bg-green-500/15 p-3 text-center text-sm font-bold text-green-300">{t.success}</div>}
                  {orderStatus === "error" && <div className="rounded-2xl bg-red-500/15 p-3 text-center text-sm font-bold text-red-300">{t.error}</div>}

                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={handleOrderWhatsApp} className="min-h-14 rounded-2xl bg-[#25D366] px-4 py-3 font-black text-white">WhatsApp</button>
                    <button type="button" onClick={handleOrderEmail} disabled={orderStatus === "sending"} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-brand-accent px-4 py-3 font-black text-brand-bg disabled:opacity-60">
                      {orderStatus === "sending" ? t.sending : <><Send className="h-4 w-4" />{t.send}</>}
                    </button>
                  </div>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
