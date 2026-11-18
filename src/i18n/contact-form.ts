import type { Locale } from "@/i18n/locales";

export type ContactFormCopy = {
  eyebrow: string;
  title: string;
  description: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  searchInterests: string;
  message: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  phonePlaceholder: string;
  messagePlaceholder: string;
  send: string;
  sending: string;
  whatsapp: string;
  saving: string;
  sendingAs: string;
  receivedTitle: string;
  receivedBody: string;
  savedTitle: string;
  savedBody: string;
  openWhatsapp: string;
  checkFields: string;
  interests: {
    tour: string;
    hotel: string;
    car: string;
    bike: string;
    bus: string;
    general: string;
  };
  errors: {
    name: string;
    nameLong: string;
    email: string;
    phone: string;
    phoneLong: string;
    phoneFormat: string;
    phoneShort: string;
    message: string;
    messageLong: string;
    interest: string;
  };
};

export const contactFormCopy: Record<Locale, ContactFormCopy> = {
  en: {
    eyebrow: "Contact",
    title: "Tell us what you want to book",
    description: "Tours, hotels, visas, and rentals start as an enquiry. We quote the price before you pay.",
    name: "Name",
    email: "Email",
    phone: "Phone",
    interest: "Interest",
    searchInterests: "Search interests",
    message: "Message",
    namePlaceholder: "Priya Sharma",
    emailPlaceholder: "you@example.com",
    phonePlaceholder: "9876543210",
    messagePlaceholder: "Dates, number of travellers, and the trip you have in mind.",
    send: "Send enquiry",
    sending: "Sending",
    whatsapp: "Send on WhatsApp",
    saving: "Saving…",
    sendingAs: "Sending as {name} ({email}). This request will appear in your account.",
    receivedTitle: "Enquiry received.",
    receivedBody: "The team will reply by email. Create an account next time to track your requests online.",
    savedTitle: "Enquiry saved.",
    savedBody: "Reference {reference}. The desk already has this message. Send it on WhatsApp so they have the same details there.",
    openWhatsapp: "Open WhatsApp",
    checkFields: "Check the highlighted fields.",
    interests: {
      tour: "Tour or trek",
      hotel: "Hotel",
      car: "Car rental",
      bike: "Bike rental",
      bus: "Bus",
      general: "Something else",
    },
    errors: {
      name: "Enter your name",
      nameLong: "That name is too long",
      email: "Enter a valid email",
      phone: "Enter a phone number",
      phoneLong: "That phone number is too long",
      phoneFormat: "Use digits, spaces, and + for the country code",
      phoneShort: "Enter a phone number with the country code",
      message: "Tell us a little more",
      messageLong: "Keep the message under 2000 characters",
      interest: "Choose what you want to book",
    },
  },
  fr: {
    eyebrow: "Contact",
    title: "Dites-nous ce que vous voulez réserver",
    description: "Circuits, hôtels, visas et locations commencent par une demande. Nous indiquons le prix avant le paiement.",
    name: "Nom",
    email: "E-mail",
    phone: "Téléphone",
    interest: "Sujet",
    searchInterests: "Rechercher un sujet",
    message: "Message",
    namePlaceholder: "Camille Martin",
    emailPlaceholder: "vous@exemple.fr",
    phonePlaceholder: "612345678",
    messagePlaceholder: "Dates, nombre de voyageurs et le voyage que vous avez en tête.",
    send: "Envoyer la demande",
    sending: "Envoi",
    whatsapp: "Envoyer sur WhatsApp",
    saving: "Enregistrement…",
    sendingAs: "Envoi en tant que {name} ({email}). Cette demande apparaîtra dans votre compte.",
    receivedTitle: "Demande reçue.",
    receivedBody: "L’équipe répondra par e-mail. Créez un compte la prochaine fois pour suivre vos demandes.",
    savedTitle: "Demande enregistrée.",
    savedBody: "Référence {reference}. Le bureau a déjà ce message. Envoyez-le sur WhatsApp pour qu’il y figure aussi.",
    openWhatsapp: "Ouvrir WhatsApp",
    checkFields: "Vérifiez les champs signalés.",
    interests: {
      tour: "Circuit ou trek",
      hotel: "Hôtel",
      car: "Location de voiture",
      bike: "Location de moto",
      bus: "Bus",
      general: "Autre chose",
    },
    errors: {
      name: "Indiquez votre nom",
      nameLong: "Ce nom est trop long",
      email: "Indiquez un e-mail valide",
      phone: "Indiquez un numéro de téléphone",
      phoneLong: "Ce numéro est trop long",
      phoneFormat: "Utilisez des chiffres, des espaces et + pour l’indicatif",
      phoneShort: "Indiquez un numéro avec l’indicatif du pays",
      message: "Donnez-nous un peu plus de détails",
      messageLong: "Le message doit rester sous 2 000 caractères",
      interest: "Choisissez ce que vous voulez réserver",
    },
  },
  hi: {
    eyebrow: "संपर्क",
    title: "बताएं कि आप क्या बुक करना चाहते हैं",
    description: "टूर, होटल, वीज़ा और किराया पूछताछ से शुरू होते हैं। भुगतान से पहले हम कीमत बताते हैं।",
    name: "नाम",
    email: "ईमेल",
    phone: "फ़ोन",
    interest: "रुचि",
    searchInterests: "रुचि खोजें",
    message: "संदेश",
    namePlaceholder: "प्रिया शर्मा",
    emailPlaceholder: "you@example.com",
    phonePlaceholder: "9876543210",
    messagePlaceholder: "तारीखें, यात्रियों की संख्या और जो यात्रा आप चाहते हैं।",
    send: "पूछताछ भेजें",
    sending: "भेजा जा रहा है",
    whatsapp: "WhatsApp पर भेजें",
    saving: "सहेजा जा रहा है…",
    sendingAs: "{name} ({email}) के रूप में भेजा जा रहा है। यह अनुरोध आपके खाते में दिखेगा।",
    receivedTitle: "पूछताछ मिल गई।",
    receivedBody: "टीम ईमेल से जवाब देगी। अगली बार अनुरोध ट्रैक करने के लिए खाता बनाएं।",
    savedTitle: "पूछताछ सहेज ली गई।",
    savedBody: "संदर्भ {reference}। डेस्क के पास यह संदेश पहले से है। वही विवरण WhatsApp पर भेजें।",
    openWhatsapp: "WhatsApp खोलें",
    checkFields: "चिह्नित फ़ील्ड जाँचें।",
    interests: {
      tour: "टूर या ट्रेक",
      hotel: "होटल",
      car: "कार किराया",
      bike: "बाइक किराया",
      bus: "बस",
      general: "कुछ और",
    },
    errors: {
      name: "अपना नाम लिखें",
      nameLong: "यह नाम बहुत लंबा है",
      email: "मान्य ईमेल लिखें",
      phone: "फ़ोन नंबर लिखें",
      phoneLong: "यह फ़ोन नंबर बहुत लंबा है",
      phoneFormat: "देश कोड के लिए अंक, स्पेस और + का उपयोग करें",
      phoneShort: "देश कोड के साथ फ़ोन नंबर लिखें",
      message: "थोड़ा और बताएं",
      messageLong: "संदेश 2000 अक्षरों से कम रखें",
      interest: "चुनें कि आप क्या बुक करना चाहते हैं",
    },
  },
  he: {
    eyebrow: "יצירת קשר",
    title: "ספרו לנו מה תרצו להזמין",
    description: "טיולים, מלונות, ויזות והשכרות מתחילים בפנייה. נציין את המחיר לפני התשלום.",
    name: "שם",
    email: "דוא״ל",
    phone: "טלפון",
    interest: "נושא",
    searchInterests: "חיפוש נושא",
    message: "הודעה",
    namePlaceholder: "מאיה כהן",
    emailPlaceholder: "you@example.com",
    phonePlaceholder: "501234567",
    messagePlaceholder: "תאריכים, מספר נוסעים והטיול שחשבתם עליו.",
    send: "שליחת פנייה",
    sending: "שולח",
    whatsapp: "שליחה ב-WhatsApp",
    saving: "שומר…",
    sendingAs: "נשלח בשם {name} ({email}). הבקשה תופיע בחשבון שלך.",
    receivedTitle: "הפנייה התקבלה.",
    receivedBody: "הצוות ישיב בדוא״ל. בפעם הבאה צרו חשבון כדי לעקוב אחרי הבקשות.",
    savedTitle: "הפנייה נשמרה.",
    savedBody: "אסמכתה {reference}. לדסק כבר יש את ההודעה. שלחו אותה גם ב-WhatsApp.",
    openWhatsapp: "פתיחת WhatsApp",
    checkFields: "בדקו את השדות המסומנים.",
    interests: {
      tour: "טיול או טרק",
      hotel: "מלון",
      car: "השכרת רכב",
      bike: "השכרת אופנוע",
      bus: "אוטובוס",
      general: "משהו אחר",
    },
    errors: {
      name: "הזינו את שמכם",
      nameLong: "השם ארוך מדי",
      email: "הזינו דוא״ל תקין",
      phone: "הזינו מספר טלפון",
      phoneLong: "מספר הטלפון ארוך מדי",
      phoneFormat: "השתמשו בספרות, ברווחים וב-+ לקידומת",
      phoneShort: "הזינו מספר עם קידומת מדינה",
      message: "ספרו לנו קצת יותר",
      messageLong: "ההודעה צריכה להישאר מתחת ל-2000 תווים",
      interest: "בחרו מה תרצו להזמין",
    },
  },
  ar: {
    eyebrow: "تواصل",
    title: "أخبرنا بما تريد حجزه",
    description: "الجولات والفنادق والتأشيرات والإيجارات تبدأ باستفسار. نذكر السعر قبل الدفع.",
    name: "الاسم",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    interest: "الاهتمام",
    searchInterests: "ابحث في الاهتمامات",
    message: "الرسالة",
    namePlaceholder: "سارة أحمد",
    emailPlaceholder: "you@example.com",
    phonePlaceholder: "501234567",
    messagePlaceholder: "التواريخ وعدد المسافرين والرحلة التي تريدها.",
    send: "إرسال الاستفسار",
    sending: "جارٍ الإرسال",
    whatsapp: "إرسال عبر واتساب",
    saving: "جارٍ الحفظ…",
    sendingAs: "الإرسال باسم {name} ({email}). سيظهر هذا الطلب في حسابك.",
    receivedTitle: "تم استلام الاستفسار.",
    receivedBody: "سيرد الفريق بالبريد الإلكتروني. أنشئ حساباً في المرة القادمة لمتابعة طلباتك.",
    savedTitle: "تم حفظ الاستفسار.",
    savedBody: "المرجع {reference}. المكتب لديه هذه الرسالة. أرسلها على واتساب ليكون لديهم التفاصيل نفسها.",
    openWhatsapp: "فتح واتساب",
    checkFields: "راجع الحقول المظللة.",
    interests: {
      tour: "جولة أو رحلة مشي",
      hotel: "فندق",
      car: "تأجير سيارة",
      bike: "تأجير دراجة",
      bus: "حافلة",
      general: "شيء آخر",
    },
    errors: {
      name: "أدخل اسمك",
      nameLong: "هذا الاسم طويل جداً",
      email: "أدخل بريداً إلكترونياً صالحاً",
      phone: "أدخل رقم هاتف",
      phoneLong: "رقم الهاتف طويل جداً",
      phoneFormat: "استخدم الأرقام والمسافات و + لرمز الدولة",
      phoneShort: "أدخل رقماً مع رمز الدولة",
      message: "أخبرنا المزيد",
      messageLong: "أبقِ الرسالة أقل من 2000 حرف",
      interest: "اختر ما تريد حجزه",
    },
  },
  ur: {
    eyebrow: "رابطہ",
    title: "بتائیں آپ کیا بک کرنا چاہتے ہیں",
    description: "ٹور، ہوٹل، ویزا اور کرایہ استفسار سے شروع ہوتے ہیں۔ ادائیگی سے پہلے ہم قیمت بتاتے ہیں۔",
    name: "نام",
    email: "ای میل",
    phone: "فون",
    interest: "دلچسپی",
    searchInterests: "دلچسپی تلاش کریں",
    message: "پیغام",
    namePlaceholder: "عائشہ خان",
    emailPlaceholder: "you@example.com",
    phonePlaceholder: "3001234567",
    messagePlaceholder: "تاریخیں، مسافروں کی تعداد، اور جو سفر آپ چاہتے ہیں۔",
    send: "استفسار بھیجیں",
    sending: "بھیجا جا رہا ہے",
    whatsapp: "واٹس ایپ پر بھیجیں",
    saving: "محفوظ ہو رہا ہے…",
    sendingAs: "{name} ({email}) کے طور پر بھیجا جا رہا ہے۔ یہ درخواست آپ کے اکاؤنٹ میں نظر آئے گی۔",
    receivedTitle: "استفسار موصول ہو گیا۔",
    receivedBody: "ٹیم ای میل سے جواب دے گی۔ اگلی بار درخواستوں کو ٹریک کرنے کے لیے اکاؤنٹ بنائیں۔",
    savedTitle: "استفسار محفوظ ہو گیا۔",
    savedBody: "حوالہ {reference}۔ ڈیسک کے پاس یہ پیغام پہلے سے ہے۔ وہی تفصیل واٹس ایپ پر بھیجیں۔",
    openWhatsapp: "واٹس ایپ کھولیں",
    checkFields: "نشان زد خانے چیک کریں۔",
    interests: {
      tour: "ٹور یا ٹریک",
      hotel: "ہوٹل",
      car: "کار کرایہ",
      bike: "بائیک کرایہ",
      bus: "بس",
      general: "کچھ اور",
    },
    errors: {
      name: "اپنا نام لکھیں",
      nameLong: "یہ نام بہت لمبا ہے",
      email: "درست ای میل لکھیں",
      phone: "فون نمبر لکھیں",
      phoneLong: "یہ فون نمبر بہت لمبا ہے",
      phoneFormat: "ملک کے کوڈ کے لیے ہندسے، خالی جگہ اور + استعمال کریں",
      phoneShort: "ملک کے کوڈ کے ساتھ فون نمبر لکھیں",
      message: "تھوڑا اور بتائیں",
      messageLong: "پیغام 2000 حروف سے کم رکھیں",
      interest: "چنیں کہ آپ کیا بک کرنا چاہتے ہیں",
    },
  },
};
