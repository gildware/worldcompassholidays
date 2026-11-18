import { contactFormCopy, type ContactFormCopy } from "@/i18n/contact-form";
import type { Locale } from "@/i18n/locales";

export type Messages = {
  nav: {
    home: string;
    destinations: string;
    tours: string;
    hotels: string;
    cars: string;
    bikes: string;
    buses: string;
    visa: string;
    meet: string;
    contact: string;
  };
  tabs: {
    home: string;
    stays: string;
    tours: string;
    bikes: string;
    cars: string;
    more: string;
  };
  more: {
    buses: string;
    bookings: string;
    visa: string;
    meet: string;
    about: string;
    help: string;
    contact: string;
    pages: string;
  };
  footer: {
    tagline: string;
    explore: string;
    services: string;
    yourTrip: string;
    company: string;
    policies: string;
    signIn: string;
    bookings: string;
    findHotel: string;
    requestBus: string;
    contact: string;
  };
  company: {
    about: string;
    why: string;
    help: string;
    pages: string;
    terms: string;
    privacy: string;
    cancellation: string;
  };
  policy: {
    terms: string;
    privacy: string;
    cancellation: string;
  };
  header: {
    signIn: string;
    bookings: string;
    admin: string;
    search: string;
    closeSearch: string;
    account: string;
    openMenu: string;
    closeMenu: string;
    close: string;
    language: string;
  };
  contactForm: ContactFormCopy;
};

export const messages: Record<Locale, Messages> = {
  en: {
    nav: {
      home: "Home",
      destinations: "Destinations",
      tours: "Plan a tour",
      hotels: "Find a stay",
      cars: "Rent a car",
      bikes: "Rent a bike",
      buses: "Find a bus",
      visa: "Apply for a visa",
      meet: "Request a greeter",
      contact: "Send an enquiry",
    },
    tabs: { home: "Home", stays: "Stays", tours: "Tours", bikes: "Bikes", cars: "Cars", more: "More" },
    more: {
      buses: "Find a bus",
      bookings: "See your bookings",
      visa: "Apply for a visa",
      meet: "Request a greeter",
      about: "Read about us",
      help: "Get help",
      contact: "Send an enquiry",
      pages: "See all pages",
    },
    footer: {
      tagline: "Tours, treks, stays, and rides across the mountains and the coast.",
      explore: "Explore",
      services: "Services",
      yourTrip: "Your trip",
      company: "Company",
      policies: "Policies",
      signIn: "Sign in",
      bookings: "See your bookings",
      findHotel: "Find a hotel",
      requestBus: "Request a bus",
      contact: "Send an enquiry",
    },
    company: {
      about: "Read about us",
      why: "Why book with us",
      help: "Get help",
      pages: "See all pages",
      terms: "Terms and conditions",
      privacy: "Privacy policy",
      cancellation: "Cancellation and refunds",
    },
    policy: { terms: "Terms", privacy: "Privacy", cancellation: "Cancellation" },
    header: {
      signIn: "Sign in",
      bookings: "See your bookings",
      admin: "Admin",
      search: "Search",
      closeSearch: "Close search",
      account: "Account",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      close: "Close",
      language: "Language",
    },
    contactForm: contactFormCopy.en,
  },
  fr: {
    nav: {
      home: "Accueil",
      destinations: "Destinations",
      tours: "Organiser un circuit",
      hotels: "Trouver un séjour",
      cars: "Louer une voiture",
      bikes: "Louer une moto",
      buses: "Trouver un bus",
      visa: "Demander un visa",
      meet: "Demander un accueil",
      contact: "Envoyer une demande",
    },
    tabs: { home: "Accueil", stays: "Séjours", tours: "Circuits", bikes: "Motos", cars: "Voitures", more: "Plus" },
    more: {
      buses: "Trouver un bus",
      bookings: "Vos réservations",
      visa: "Demander un visa",
      meet: "Demander un accueil",
      about: "À propos",
      help: "Aide",
      contact: "Envoyer une demande",
      pages: "Toutes les pages",
    },
    footer: {
      tagline: "Circuits, randonnées, hébergements et trajets, des montagnes jusqu’à la côte.",
      explore: "Explorer",
      services: "Services",
      yourTrip: "Votre voyage",
      company: "Société",
      policies: "Politiques",
      signIn: "Connexion",
      bookings: "Vos réservations",
      findHotel: "Trouver un hôtel",
      requestBus: "Demander un bus",
      contact: "Envoyer une demande",
    },
    company: {
      about: "À propos",
      why: "Pourquoi réserver ici",
      help: "Aide",
      pages: "Toutes les pages",
      terms: "Conditions générales",
      privacy: "Politique de confidentialité",
      cancellation: "Annulation et remboursements",
    },
    policy: { terms: "Conditions", privacy: "Confidentialité", cancellation: "Annulation" },
    header: {
      signIn: "Connexion",
      bookings: "Vos réservations",
      admin: "Admin",
      search: "Rechercher",
      closeSearch: "Fermer la recherche",
      account: "Compte",
      openMenu: "Ouvrir le menu",
      closeMenu: "Fermer le menu",
      close: "Fermer",
      language: "Langue",
    },
    contactForm: contactFormCopy.fr,
  },
  hi: {
    nav: {
      home: "होम",
      destinations: "गंतव्य",
      tours: "टूर प्लान करें",
      hotels: "ठहरने की जगह",
      cars: "कार किराए पर लें",
      bikes: "बाइक किराए पर लें",
      buses: "बस खोजें",
      visa: "वीज़ा आवेदन",
      meet: "स्वागत सहायक",
      contact: "पूछताछ भेजें",
    },
    tabs: { home: "होम", stays: "होटल", tours: "टूर", bikes: "बाइक", cars: "कार", more: "और" },
    more: {
      buses: "बस खोजें",
      bookings: "आपकी बुकिंग",
      visa: "वीज़ा आवेदन",
      meet: "स्वागत सहायक",
      about: "हमारे बारे में",
      help: "मदद",
      contact: "पूछताछ भेजें",
      pages: "सभी पेज",
    },
    footer: {
      tagline: "पहाड़ों और समुद्र तट पर टूर, ट्रेक, ठहराव और सवारी।",
      explore: "देखें",
      services: "सेवाएँ",
      yourTrip: "आपकी यात्रा",
      company: "कंपनी",
      policies: "नीतियाँ",
      signIn: "साइन इन",
      bookings: "आपकी बुकिंग",
      findHotel: "होटल खोजें",
      requestBus: "बस का अनुरोध",
      contact: "पूछताछ भेजें",
    },
    company: {
      about: "हमारे बारे में",
      why: "हमसे क्यों बुक करें",
      help: "मदद",
      pages: "सभी पेज",
      terms: "नियम और शर्तें",
      privacy: "गोपनीयता नीति",
      cancellation: "रद्दीकरण और रिफंड",
    },
    policy: { terms: "शर्तें", privacy: "गोपनीयता", cancellation: "रद्दीकरण" },
    header: {
      signIn: "साइन इन",
      bookings: "आपकी बुकिंग",
      admin: "Admin",
      search: "खोजें",
      closeSearch: "खोज बंद करें",
      account: "खाता",
      openMenu: "मेनू खोलें",
      closeMenu: "मेनू बंद करें",
      close: "बंद करें",
      language: "भाषा",
    },
    contactForm: contactFormCopy.hi,
  },
  he: {
    nav: {
      home: "בית",
      destinations: "יעדים",
      tours: "תכנון טיול",
      hotels: "מציאת לינה",
      cars: "השכרת רכב",
      bikes: "השכרת אופנוע",
      buses: "מציאת אוטובוס",
      visa: "בקשת ויזה",
      meet: "בקשת מקבל פנים",
      contact: "שליחת פנייה",
    },
    tabs: { home: "בית", stays: "לינה", tours: "טיולים", bikes: "אופנוע", cars: "רכב", more: "עוד" },
    more: {
      buses: "מציאת אוטובוס",
      bookings: "ההזמנות שלכם",
      visa: "בקשת ויזה",
      meet: "בקשת מקבל פנים",
      about: "אודות",
      help: "עזרה",
      contact: "שליחת פנייה",
      pages: "כל הדפים",
    },
    footer: {
      tagline: "טיולים, מסלולי הליכה, לינה ונסיעות בין ההרים לחוף.",
      explore: "גלו",
      services: "שירותים",
      yourTrip: "הטיול שלכם",
      company: "החברה",
      policies: "מדיניות",
      signIn: "כניסה",
      bookings: "ההזמנות שלכם",
      findHotel: "מציאת מלון",
      requestBus: "בקשת אוטובוס",
      contact: "שליחת פנייה",
    },
    company: {
      about: "אודות",
      why: "למה להזמין אצלנו",
      help: "עזרה",
      pages: "כל הדפים",
      terms: "תנאים והגבלות",
      privacy: "מדיניות פרטיות",
      cancellation: "ביטול והחזרים",
    },
    policy: { terms: "תנאים", privacy: "פרטיות", cancellation: "ביטולים" },
    header: {
      signIn: "כניסה",
      bookings: "ההזמנות שלכם",
      admin: "Admin",
      search: "חיפוש",
      closeSearch: "סגירת חיפוש",
      account: "חשבון",
      openMenu: "פתיחת תפריט",
      closeMenu: "סגירת תפריט",
      close: "סגירה",
      language: "שפה",
    },
    contactForm: contactFormCopy.he,
  },
  ar: {
    nav: {
      home: "الرئيسية",
      destinations: "الوجهات",
      tours: "خطط لجولة",
      hotels: "ابحث عن إقامة",
      cars: "استئجار سيارة",
      bikes: "استئجار دراجة",
      buses: "ابحث عن حافلة",
      visa: "قدّم لطلب تأشيرة",
      meet: "اطلب مستقبلاً",
      contact: "أرسل استفساراً",
    },
    tabs: { home: "الرئيسية", stays: "إقامة", tours: "جولات", bikes: "دراجات", cars: "سيارات", more: "المزيد" },
    more: {
      buses: "ابحث عن حافلة",
      bookings: "حجوزاتك",
      visa: "قدّم لطلب تأشيرة",
      meet: "اطلب مستقبلاً",
      about: "من نحن",
      help: "المساعدة",
      contact: "أرسل استفساراً",
      pages: "كل الصفحات",
    },
    footer: {
      tagline: "جولات ومسارات إقامة وتنقلات بين الجبال والساحل.",
      explore: "استكشف",
      services: "الخدمات",
      yourTrip: "رحلتك",
      company: "الشركة",
      policies: "السياسات",
      signIn: "تسجيل الدخول",
      bookings: "حجوزاتك",
      findHotel: "ابحث عن فندق",
      requestBus: "اطلب حافلة",
      contact: "أرسل استفساراً",
    },
    company: {
      about: "من نحن",
      why: "لماذا تحجز معنا",
      help: "المساعدة",
      pages: "كل الصفحات",
      terms: "الشروط والأحكام",
      privacy: "سياسة الخصوصية",
      cancellation: "الإلغاء والاسترداد",
    },
    policy: { terms: "الشروط", privacy: "الخصوصية", cancellation: "الإلغاء" },
    header: {
      signIn: "تسجيل الدخول",
      bookings: "حجوزاتك",
      admin: "Admin",
      search: "بحث",
      closeSearch: "إغلاق البحث",
      account: "الحساب",
      openMenu: "فتح القائمة",
      closeMenu: "إغلاق القائمة",
      close: "إغلاق",
      language: "اللغة",
    },
    contactForm: contactFormCopy.ar,
  },
  ur: {
    nav: {
      home: "ہوم",
      destinations: "مقامات",
      tours: "ٹور پلان کریں",
      hotels: "قیام تلاش کریں",
      cars: "کار کرایے پر لیں",
      bikes: "بائیک کرایے پر لیں",
      buses: "بس تلاش کریں",
      visa: "ویزا کی درخواست",
      meet: "استقبال کی درخواست",
      contact: "استفسار بھیجیں",
    },
    tabs: { home: "ہوم", stays: "قیام", tours: "ٹور", bikes: "بائیک", cars: "کار", more: "مزید" },
    more: {
      buses: "بس تلاش کریں",
      bookings: "آپ کی بکنگ",
      visa: "ویزا کی درخواست",
      meet: "استقبال کی درخواست",
      about: "ہمارے بارے میں",
      help: "مدد",
      contact: "استفسار بھیجیں",
      pages: "تمام صفحات",
    },
    footer: {
      tagline: "پہاڑوں اور ساحل پر ٹور، ٹریک، قیام اور سواری۔",
      explore: "دریافت",
      services: "خدمات",
      yourTrip: "آپ کا سفر",
      company: "کمپنی",
      policies: "پالیسیاں",
      signIn: "سائن ان",
      bookings: "آپ کی بکنگ",
      findHotel: "ہوٹل تلاش کریں",
      requestBus: "بس کی درخواست",
      contact: "استفسار بھیجیں",
    },
    company: {
      about: "ہمارے بارے میں",
      why: "ہم سے کیوں بک کریں",
      help: "مدد",
      pages: "تمام صفحات",
      terms: "شرائط و ضوابط",
      privacy: "رازداری کی پالیسی",
      cancellation: "منسوخی اور رقم کی واپسی",
    },
    policy: { terms: "شرائط", privacy: "رازداری", cancellation: "منسوخی" },
    header: {
      signIn: "سائن ان",
      bookings: "آپ کی بکنگ",
      admin: "Admin",
      search: "تلاش",
      closeSearch: "تلاش بند کریں",
      account: "اکاؤنٹ",
      openMenu: "مینو کھولیں",
      closeMenu: "مینو بند کریں",
      close: "بند کریں",
      language: "زبان",
    },
    contactForm: contactFormCopy.ur,
  },
};
