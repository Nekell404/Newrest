global.port = 3000;
global.auto_open_browser = false;
global.advertising_for_free_users = true;
global.chatgpt_free_mode = true;
global.max_sign_up = 3;
global.body_parser_urlencoded_extended = true;
global.json_spaces = 2;
global.password_admin = 'Nekellganteng';

// Connection database MySql
global.connection = {
  host: '51.222.194.40',
  user: 'arkun',
  password: 'arkun13370',
  database: 'tespanel'
};

// Email SMTP
global.email_smtp = {
  host: 'mail.nekellnotme.biz.id',
  port: 465,
  secure: true,
  auth: {
    user: 'nekell@nekellnotme.biz.id',
    pass: 'Memekpink'
  }
};

// Web settings
global.web_set = {
  author: 'Nekell Ganteng',
  ads: {
    verify: '-',
    ads_area: {
      banner: '-',
      native: '-'
    }
  },
  head: {
    title: 'Nekell API',
    description: 'Nekell API adalah mitra terpercaya yang menyediakan solusi API inovatif, dari layanan RESTful hingga integrasi interaktif dengan bot WhatsApp. Prioritas kami adalah kehandalan, kinerja, dan fleksibilitas. Bergabunglah dalam perjalanan teknologi kami untuk meraih potensi penuh teknologi Anda melalui layanan API terbaik yang dapat disesuaikan.',
    author: 'Nekell Ganteng.',
    keywords: 'REST API, Free REST API, Free REST API for WhatsApp bot, RESTful API, Free RESTful API, Free RESTful API for WhatsApp Bot',
    site_name: 'Nekell - RESTful API',
    domain: 'nekellishere.biz.id',
    favicon: 'https://telegra.ph/file/b1d1091887c4e4d38d3d1.jpg',
    image: 'https://cdn.danitechno.com/daniapi/img/banner.jpeg',
    image_type: 'image/jpg',
    image_width: 400,
    image_height: 300,
    image_alt: 'Nekell API'
  },
  body: {
    header: {
      name: 'Nekell API',
      chat_url: 'https://chat.whatsapp.com/FvF2ucrsjCiJHro8pCYQ0y'
    },
    plan: {
      payment_method: {
        qris: {
          image_url: '/assets/img/qris-all-payment.jpg'
        },
        dana: {
          number: '0896 9507 3357',
          image_url: '/assets/img/qr-code-dana.jpg'
        },
        gopay: {
          number: '0896 9507 3357',
          image_url: '/assets/img/qr-code-gopay.jpg'
        }
      },
      monthly: {
        basic: {
        price: 'Rp 10.000',
        price_code: 10000,
        payment_url: '/orders/plan'
        //payment_url: 'https://wa.me/+6289695073357?text=Permisi, mau upgrade akun (Account type: Free to Basic), seharga Rp 10.000 (10rb/10k), pembayaran nya bisa VIA apa saja?'
      },
      standard: {
        price: 'Rp 15.000',
        price_code: 15000,
        payment_url: '/orders/plan'
        //payment_url: 'https://wa.me/+6289695073357?text=Permisi, mau upgrade akun (Account type: Free to Standar), seharga Rp 15.000 (15rb/15k), pembayaran nya bisa VIA apa saja?'
      },
      premium: {
        price: 'Rp 25.000',
        price_code: 25000,
        payment_url: '/orders/plan'
        //payment_url: 'https://wa.me/+6289695073357?text=Permisi, mau upgrade akun (Account type: Free to Premium), seharga Rp 20.000 (20rb/20k), pembayaran nya bisa VIA apa saja?'
      },
      enterprise: {
        price: 'Rp 50.000',
        price_code: 50000,
        payment_url: '/orders/plan'
        //payment_url: 'https://wa.me/+6289695073357?text=Permisi, mau upgrade akun (Account type: Free to Enterprise), seharga Rp 50.000 (50rb/50k), pembayaran nya bisa VIA apa saja?'
      },
      custom: {
        price: 'Rp -',
        payment_url: '/orders/plan'
        //payment_url: 'https://wa.me/+6289695073357?text=Permisi, mau upgrade akun (Account type: Free to Custom), benefit yg saya mau: [jelaskan benefit yg anda mau], harganya jadi berapa, dan pembayaran nya bisa VIA apa saja?'
      }
      },
      yearly: {
        basic: {
        price: 'Rp 120.000',
        price_code: 120000,
        payment_url: '/orders/plan'
        //payment_url: 'https://wa.me/+6289695073357?text=Permisi, mau upgrade akun (Account type: Free to Basic), seharga Rp 60.000 (60rb/60k), pembayaran nya bisa VIA apa saja?'
      },
      standard: {
        price: 'Rp 180.000',
        price_code: 180000,
        payment_url: '/orders/plan'
        //payment_url: 'https://wa.me/+6289695073357?text=Permisi, mau upgrade akun (Account type: Free to Standar), seharga Rp 90.000 (90rb/90k), pembayaran nya bisa VIA apa saja?'
      },
      premium: {
        price: 'Rp 300.000',
        price_code: 300000,
        payment_url: '/orders/plan'
        //payment_url: 'https://wa.me/+6289695073357?text=Permisi, mau upgrade akun (Account type: Free to Premium), seharga Rp 120.000 (120rb/120k), pembayaran nya bisa VIA apa saja?'
      },
      enterprise: {
        price: 'Rp 600.000',
        price_code: 600000,
        payment_url: '/orders/plan'
        //payment_url: 'https://wa.me/+6289695073357?text=Permisi, mau upgrade akun (Account type: Free to Enterprise), seharga Rp 150.000 (150rb/150k), pembayaran nya bisa VIA apa saja?'
      },
      custom: {
        price: 'Rp -',
        payment_url: '/orders/plan'
        //payment_url: 'https://wa.me/+6289695073357?text=Permisi, mau upgrade akun (Account type: Free to Custom), benefit yg saya mau: [jelaskan benefit yg anda mau], harganya jadi berapa, dan pembayaran nya bisa VIA apa saja?'
      }
      }
    },
    contact_support: {
      email: 'admin@nekellnotme.biz.id',
      phone_number: '+62 896-9507-3357',
      live_chat: 'coming soon',
    },
    footer: {
      name: 'Nekell API',
      contact: {
        address: 'Dukuhsemar - Kecapi, Kota Cirebon, West Java 45142, Indonesia',
        phone_number: '+62 896-9507-3357',
        email_address: 'nekell@nekellnotme.biz.id'
      }
    }
  },
  query_params: {
    text: 'Nekell Ganteng.',
    url: '',
    image: 'https://telegra.ph/file/b1d1091887c4e4d38d3d1.jpg'
  }
};

// Cron job
global.cron_schedule = {
  timezone: 'Asia/Jakarta',
  usage_limit: '0 0 * * *',
  daily_requests: '0 0 * * *'
};

// Usage limit
global.usage_limit_amount = {
  free: 100,
  basic: 1000,
  standard: 5000,
  premium: 99999, // ∞/Unlimited
  enterprise: 99999 // ∞/Unlimited
};

// Max edit API key
global.max_edit_api_key = {
  free: 0,
  basic: 3,
  standard: 5,
  premium: 10,
  enterprise: Infinity
};

// Session
global.session = {
  secret: 'nekellganteng',
  resave: true,
  save_uninitialized: true,
  cookie: {
    max_age: 24 * 60 * 60 * 1000
  }
};

// Secret key
global.secret_key = {
  openai: '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',
  hf: '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',
  remove_bg: [
    "Y1qTFXsPAFvr3LzJEaRbeBgL"
  ],
  bitly: [
    "2243940c230ad0d748059aee58ddf126b65fd8e7","6cfc18e9bfa554714fadc10a1f6aff7555642348","c71b6658a1d271ddaf2a5077de3dcb9d67f68025","cddbceccdc2f1c9d11e4cdd0d2b1d1078e447c43", "7915c671fbd90eca96310e5c9442d761225a1080","e5dee46eb2d69fc9f4b0057266226a52a3555356","f09ab8db9cf778b37a1cf8bc406eee5063816dec","964080579f959c0cc3226b4b2053cd6520bb60ad","a4f429289bf8bf6291be4b1661df57dde5066525","3d48e2601f25800f375ba388c30266aad54544ae", "4854cb9fbad67724a2ef9c27a9d1a4e9ded62faa", "d375cf1fafb3dc17e711870524ef4589995c4f69","43f58e789d57247b2cf285d7d24ab755ba383a28","971f6c6c2efe6cb5d278b4164acef11c5f21b637", "ae128b3094c96bf5fd1a349e7ac03113e21d82c9", "e65f2948f584ffd4c568bf248705eee2714abdd2","08425cf957368db9136484145aa6771e1171e232","dc4bec42a64749b0f23f1a8f525a69184227e301","0f9eb729a7a08ff5e73fe1860c6dc587cc523035","037c5017712c8f5f154ebbe6f91db1f82793c375"
  ],
  cuttly: ["b21fd60e1270f003474834bf1b645888ab8c3"]
};
