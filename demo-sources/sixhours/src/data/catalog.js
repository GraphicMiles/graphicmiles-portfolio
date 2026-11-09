/** Sample merchandise. All prices and stock are illustrative. */
export const categories = [
  {
    "id": "all",
    "label": "All gadgets"
  },
  {
    "id": "phones",
    "label": "Phones"
  },
  {
    "id": "laptops",
    "label": "Laptops"
  },
  {
    "id": "audio",
    "label": "Audio"
  },
  {
    "id": "tablets",
    "label": "Tablets"
  },
  {
    "id": "accessories",
    "label": "Accessories"
  }
];

export const products = [
  {
    "id": "iphone-16",
    "name": "iPhone 16",
    "brand": "Apple",
    "category": "phones",
    "subtitle": "Ultramarine. An everyday upgrade.",
    "finish": "Ultramarine",
    "swatch": "#6775d4",
    "description": "A little more colour. A lot more possibility. Meet your new everyday companion for catching the moment, keeping in touch, and everything in between.",
    "images": [
      "images/products/iphone-16-0.webp",
      "images/products/iphone-16-1.webp"
    ],
    "variants": [
      {
        "id": "128gb",
        "label": "128GB",
        "price": 1120000
      },
      {
        "id": "256gb",
        "label": "256GB",
        "price": 1250000
      }
    ],
    "stock": {
      "lagos": 8,
      "abuja": 5
    },
    "featured": 1,
    "badge": "EVERYDAY PICK",
    "specs": [
      [
        "Display",
        "6.1-inch Super Retina XDR"
      ],
      [
        "Chip",
        "Apple A18"
      ],
      [
        "Camera",
        "48MP Fusion camera"
      ],
      [
        "Connection",
        "USB-C"
      ],
      [
        "Finish shown",
        "Ultramarine"
      ]
    ],
    "inBox": "iPhone 16 and USB-C charging cable. Power adapter sold separately.",
    "cardName": "iPhone 16 - 128GB, Ultramarine",
    "keywords": [
      "smartphone",
      "phone"
    ]
  },
  {
    "id": "macbook-air",
    "name": "MacBook Air 13″",
    "brand": "Apple",
    "category": "laptops",
    "subtitle": "M4. Light on your shoulders.",
    "finish": "Starlight",
    "swatch": "#ded5c2",
    "description": "For the café desk, the big idea, and the work that goes wherever you do. The light, capable MacBook Air makes a good everyday partner.",
    "images": [
      "images/products/macbook-air-0.webp",
      "images/products/macbook-air-1.webp"
    ],
    "variants": [
      {
        "id": "256gb",
        "label": "16GB / 256GB",
        "price": 1450000
      },
      {
        "id": "512gb",
        "label": "16GB / 512GB",
        "price": 1650000
      }
    ],
    "stock": {
      "lagos": 5,
      "abuja": 3
    },
    "featured": 2,
    "badge": "",
    "specs": [
      [
        "Display",
        "13.6-inch Liquid Retina"
      ],
      [
        "Chip",
        "Apple M4"
      ],
      [
        "Memory",
        "16GB unified memory"
      ],
      [
        "Keyboard",
        "Backlit Magic Keyboard"
      ],
      [
        "Finish shown",
        "Starlight"
      ]
    ],
    "inBox": "MacBook Air, USB-C power adapter, and USB-C to MagSafe 3 cable.",
    "cardName": "MacBook Air 13-inch - Starlight",
    "keywords": [
      "laptop",
      "computer"
    ]
  },
  {
    "id": "airpods-4",
    "name": "AirPods 4",
    "brand": "Apple",
    "category": "audio",
    "subtitle": "A little quiet. A lot of sound.",
    "finish": "White",
    "swatch": "#fafafa",
    "description": "Your commute, your playlist, your little pocket of quiet. The open-ear AirPods 4 with Active Noise Cancellation keep your everyday listening simple.",
    "images": [
      "images/products/airpods-4-0.webp",
      "images/products/airpods-4-1.webp"
    ],
    "variants": [
      {
        "id": "anc",
        "label": "With noise cancellation",
        "price": 310000
      }
    ],
    "stock": {
      "lagos": 9,
      "abuja": 5
    },
    "featured": 3,
    "badge": "",
    "specs": [
      [
        "Model",
        "AirPods 4 with Active Noise Cancellation"
      ],
      [
        "Chip",
        "Apple H2"
      ],
      [
        "Audio",
        "Personalised Spatial Audio"
      ],
      [
        "Case",
        "Wireless charging case with USB-C"
      ],
      [
        "Finish shown",
        "White"
      ]
    ],
    "inBox": "AirPods 4 and wireless charging case. Charging cable and power adapter sold separately.",
    "cardName": "AirPods 4 with Active Noise Cancellation",
    "keywords": [
      "wireless",
      "earbuds"
    ]
  },
  {
    "id": "galaxy-a17",
    "name": "Galaxy A17",
    "brand": "Samsung",
    "category": "phones",
    "subtitle": "Made for your every day.",
    "finish": "Blue",
    "swatch": "#273853",
    "description": "The calls, the catch-ups, the pictures worth keeping. A practical Android companion with a generous screen for all the little things in your day.",
    "images": [
      "images/products/galaxy-a17-0.webp"
    ],
    "variants": [
      {
        "id": "128gb",
        "label": "4GB / 128GB · 4G",
        "price": 245000
      }
    ],
    "stock": {
      "lagos": 7,
      "abuja": 4
    },
    "featured": 4,
    "badge": "",
    "specs": [
      [
        "Model",
        "Galaxy A17 4G"
      ],
      [
        "Memory",
        "4GB RAM"
      ],
      [
        "Storage",
        "128GB"
      ],
      [
        "System",
        "Android"
      ],
      [
        "Finish shown",
        "Blue"
      ]
    ],
    "inBox": "Galaxy A17 and charging cable. Confirm regional box contents before a real purchase.",
    "cardName": "Samsung Galaxy A17 - 128GB, 4G",
    "keywords": [
      "smartphone",
      "phone"
    ]
  },
  {
    "id": "beats-solo3",
    "name": "Beats Solo3 Wireless",
    "brand": "Beats",
    "category": "audio",
    "subtitle": "Your day. Your soundtrack.",
    "finish": "Black",
    "swatch": "#242424",
    "description": "Put your favourite playlist first. These foldable on-ear wireless headphones are an easy companion for listening at home, at work, and on the move.",
    "images": [
      "images/products/beats-solo3-0.webp",
      "images/products/beats-solo3-1.webp"
    ],
    "variants": [
      {
        "id": "black",
        "label": "Black",
        "price": 245000
      }
    ],
    "stock": {
      "lagos": 6,
      "abuja": 3
    },
    "featured": 5,
    "badge": "THE SOUND EDIT",
    "specs": [
      [
        "Type",
        "On-ear wireless headphones"
      ],
      [
        "Connection",
        "Bluetooth"
      ],
      [
        "Design",
        "Foldable"
      ],
      [
        "Chip",
        "Apple W1"
      ],
      [
        "Finish shown",
        "Black"
      ]
    ],
    "inBox": "Beats Solo3 Wireless headphones, carrying case, and charging cable.",
    "cardName": "Beats Solo3 Wireless Headphones - Black",
    "keywords": [
      "wireless",
      "headphones"
    ]
  },
  {
    "id": "jbl-flip-6",
    "name": "JBL Flip 6",
    "brand": "JBL",
    "category": "audio",
    "subtitle": "Good company. Better sound.",
    "finish": "Blue",
    "swatch": "#406887",
    "description": "From the kitchen counter to a weekend outside. Take the good sound with you in a portable, water-resistant speaker that fits into your day.",
    "images": [
      "images/products/jbl-flip-6-0.webp",
      "images/products/jbl-flip-6-1.webp"
    ],
    "variants": [
      {
        "id": "blue",
        "label": "Blue",
        "price": 165000
      }
    ],
    "stock": {
      "lagos": 8,
      "abuja": 4
    },
    "featured": 6,
    "badge": "",
    "specs": [
      [
        "Connection",
        "Bluetooth"
      ],
      [
        "Protection",
        "IP67 water and dust resistance"
      ],
      [
        "Type",
        "Portable speaker"
      ],
      [
        "Charging",
        "USB-C"
      ],
      [
        "Finish shown",
        "Blue"
      ]
    ],
    "inBox": "JBL Flip 6, USB-C charging cable, and quick-start guide.",
    "cardName": "JBL Flip 6 Portable Bluetooth Speaker - Blue",
    "keywords": [
      "wireless",
      "speaker",
      "portable"
    ]
  },
  {
    "id": "ipad-air",
    "name": "iPad Air 11″",
    "brand": "Apple",
    "category": "tablets",
    "subtitle": "More room for your ideas.",
    "finish": "Starlight",
    "swatch": "#ddd4c2",
    "description": "Sketch a thought, get into a good book, or take your work off the desk. A light, versatile tablet for whatever your day turns into.",
    "images": [
      "images/products/ipad-air-0.webp",
      "images/products/ipad-air-1.webp"
    ],
    "variants": [
      {
        "id": "128gb",
        "label": "M2 / Wi-Fi / 128GB",
        "price": 900000
      },
      {
        "id": "256gb",
        "label": "M2 / Wi-Fi / 256GB",
        "price": 1030000
      }
    ],
    "stock": {
      "lagos": 4,
      "abuja": 0
    },
    "featured": 7,
    "badge": "",
    "specs": [
      [
        "Display",
        "11-inch Liquid Retina"
      ],
      [
        "Chip",
        "Apple M2"
      ],
      [
        "Connectivity",
        "Wi-Fi"
      ],
      [
        "Connection",
        "USB-C"
      ],
      [
        "Finish shown",
        "Starlight"
      ]
    ],
    "inBox": "iPad Air and USB-C charging cable. Keyboard and Apple Pencil sold separately.",
    "cardName": "iPad Air 11-inch - 128GB Wi-Fi, Starlight",
    "keywords": [
      "tablet",
      "iPad"
    ]
  },
  {
    "id": "watch-series-10",
    "name": "Apple Watch Series 10",
    "brand": "Apple",
    "category": "accessories",
    "subtitle": "A little everyday motivation.",
    "finish": "Jet Black",
    "swatch": "#292929",
    "description": "A small companion for your daily rhythm. Keep an eye on your activity, glance at your messages, and make a little more room for movement.",
    "images": [
      "images/products/watch-series-10-0.webp",
      "images/products/watch-series-10-1.webp"
    ],
    "variants": [
      {
        "id": "42mm",
        "label": "42mm / Black Sport Band",
        "price": 550000
      }
    ],
    "stock": {
      "lagos": 5,
      "abuja": 3
    },
    "featured": 8,
    "badge": "",
    "specs": [
      [
        "Case",
        "42mm aluminium"
      ],
      [
        "Display",
        "Always-On Retina"
      ],
      [
        "Band",
        "Black Sport Band"
      ],
      [
        "Compatibility",
        "Requires a compatible iPhone"
      ],
      [
        "Finish shown",
        "Jet Black"
      ]
    ],
    "inBox": "Apple Watch, Sport Band, and magnetic charging cable. Power adapter sold separately.",
    "cardName": "Apple Watch Series 10 - 42mm, Jet Black",
    "keywords": [
      "smartwatch",
      "watch"
    ]
  },
  {
    "id": "belkin-powerbank",
    "name": "Belkin Magnetic Power Bank",
    "brand": "Belkin",
    "category": "accessories",
    "subtitle": "A little backup goes a long way.",
    "finish": "Black",
    "swatch": "#292929",
    "description": "A magnetic 5,000mAh power bank with a handy stand. Keep a little backup close by for the moments your day runs longer than your battery.",
    "images": [
      "images/products/belkin-powerbank-1.webp",
      "images/products/belkin-powerbank-0.webp"
    ],
    "variants": [
      {
        "id": "5k",
        "label": "5,000mAh / Black",
        "price": 68000
      }
    ],
    "stock": {
      "lagos": 9,
      "abuja": 5
    },
    "featured": 9,
    "badge": "",
    "specs": [
      [
        "Capacity",
        "5,000mAh"
      ],
      [
        "Type",
        "Magnetic wireless power bank"
      ],
      [
        "Stand",
        "Built-in stand"
      ],
      [
        "Compatibility",
        "Compatible magnetic charging phones"
      ],
      [
        "Finish shown",
        "Black"
      ]
    ],
    "inBox": "Belkin magnetic wireless power bank and charging cable.",
    "cardName": "Belkin Magnetic Power Bank - 5,000mAh",
    "keywords": [
      "powerbank",
      "battery",
      "charger"
    ]
  },
  {
    "id": "belkin-charger",
    "name": "Belkin Dual USB-C Charger",
    "brand": "Belkin",
    "category": "accessories",
    "subtitle": "One plug. Two everyday essentials.",
    "finish": "White",
    "swatch": "#fafafa",
    "description": "A tidy way to power your everyday kit. Two USB-C ports and a compact GaN design keep your desk or travel bag a little less cluttered.",
    "images": [
      "images/products/belkin-charger-0.webp",
      "images/products/belkin-charger-1.webp"
    ],
    "variants": [
      {
        "id": "45w",
        "label": "45W / Dual USB-C",
        "price": 65000
      }
    ],
    "stock": {
      "lagos": 9,
      "abuja": 6
    },
    "featured": 10,
    "badge": "",
    "specs": [
      [
        "Total output",
        "45W"
      ],
      [
        "Ports",
        "Two USB-C"
      ],
      [
        "Technology",
        "GaN"
      ],
      [
        "Finish shown",
        "White"
      ],
      [
        "Please note",
        "Charging cables sold separately"
      ]
    ],
    "inBox": "Belkin 45W dual USB-C wall charger.",
    "cardName": "Belkin Dual USB-C Fast Charger - 45W",
    "keywords": [
      "charger",
      "charging"
    ]
  },
  {
    "id": "apple-adapter",
    "name": "Apple USB-C Power Adapter",
    "brand": "Apple",
    "category": "accessories",
    "subtitle": "The little essential.",
    "finish": "White",
    "swatch": "#fafafa",
    "description": "The simple desk-drawer essential. Pair the 20W USB-C power adapter with a compatible cable to keep your iPhone or iPad ready for the day.",
    "images": [
      "images/products/apple-adapter-0.webp",
      "images/products/apple-adapter-1.webp"
    ],
    "variants": [
      {
        "id": "20w",
        "label": "20W / USB-C",
        "price": 35000
      }
    ],
    "stock": {
      "lagos": 9,
      "abuja": 6
    },
    "featured": 11,
    "badge": "",
    "specs": [
      [
        "Output",
        "20W"
      ],
      [
        "Port",
        "USB-C"
      ],
      [
        "Finish shown",
        "White"
      ],
      [
        "Compatibility",
        "USB-C charging devices"
      ],
      [
        "Please note",
        "Charging cable sold separately"
      ]
    ],
    "inBox": "Apple 20W USB-C power adapter.",
    "cardName": "Apple USB-C Power Adapter - 20W",
    "keywords": [
      "charger",
      "charging",
      "plug"
    ]
  },
  {
    "id": "magic-mouse",
    "name": "Magic Mouse",
    "brand": "Apple",
    "category": "accessories",
    "subtitle": "A smoother kind of workday.",
    "finish": "Black",
    "swatch": "#292929",
    "description": "A simple, rechargeable companion for your Mac. The smooth Multi-Touch surface gives your everyday scrolling and swiping a little more room.",
    "images": [
      "images/products/magic-mouse-0.webp",
      "images/products/magic-mouse-1.webp"
    ],
    "variants": [
      {
        "id": "black",
        "label": "Black Multi-Touch",
        "price": 145000
      }
    ],
    "stock": {
      "lagos": 5,
      "abuja": 2
    },
    "featured": 12,
    "badge": "",
    "specs": [
      [
        "Type",
        "Wireless Multi-Touch mouse"
      ],
      [
        "Connection",
        "Bluetooth"
      ],
      [
        "Power",
        "Rechargeable"
      ],
      [
        "Compatibility",
        "Compatible Mac models"
      ],
      [
        "Finish shown",
        "Black"
      ]
    ],
    "inBox": "Magic Mouse and charging cable. Confirm the connector version before a real purchase.",
    "cardName": "Magic Mouse - Black Multi-Touch Surface",
    "keywords": [
      "mouse",
      "computer accessory"
    ]
  },
  {
    "id": "apple-pencil-pro",
    "name": "Apple Pencil Pro",
    "brand": "Apple",
    "category": "accessories",
    "subtitle": "Made for your everyday.",
    "finish": "White",
    "swatch": "#dcdde0",
    "description": "An Apple stylus with squeeze, barrel roll and haptic feedback for compatible iPad models. Confirm your exact iPad model before choosing this accessory.",
    "images": [
      "images/products/apple-pencil-pro-0.webp",
      "images/products/apple-pencil-pro-1.webp"
    ],
    "variants": [
      {
        "id": "standard",
        "label": "White",
        "price": 180000
      }
    ],
    "stock": {
      "lagos": 6,
      "abuja": 4
    },
    "featured": 13,
    "badge": "NEW",
    "specs": [
      [
        "Compatibility",
        "Compatible iPad Pro and iPad Air models"
      ],
      [
        "Connection",
        "Magnetic pairing and charging"
      ],
      [
        "Finish shown",
        "White"
      ]
    ],
    "inBox": "Apple Pencil Pro. Check your exact iPad model before purchase.",
    "cardName": "Apple Pencil Pro for Compatible iPad Models",
    "keywords": [
      "stylus",
      "pencil"
    ]
  },
  {
    "id": "magic-keyboard",
    "name": "Magic Keyboard USB-C",
    "brand": "Apple",
    "category": "accessories",
    "subtitle": "Made for your everyday.",
    "finish": "White",
    "swatch": "#dcdde0",
    "description": "A compact, wireless US English keyboard with a rechargeable battery and USB-C charging. This standard model does not include Touch ID.",
    "images": [
      "images/products/magic-keyboard-0.webp",
      "images/products/magic-keyboard-1.webp"
    ],
    "variants": [
      {
        "id": "standard",
        "label": "White",
        "price": 210000
      }
    ],
    "stock": {
      "lagos": 6,
      "abuja": 4
    },
    "featured": 14,
    "badge": "",
    "specs": [
      [
        "Layout",
        "US English"
      ],
      [
        "Connection",
        "Bluetooth"
      ],
      [
        "Charging",
        "USB-C"
      ],
      [
        "Finish shown",
        "White"
      ]
    ],
    "inBox": "Magic Keyboard and USB-C charging cable.",
    "cardName": "Magic Keyboard USB-C - US English",
    "keywords": [
      "keyboard",
      "computer accessory"
    ]
  },
  {
    "id": "beats-studio-buds",
    "name": "Beats Studio Buds +",
    "brand": "Beats",
    "category": "audio",
    "subtitle": "Made for your everyday.",
    "finish": "Black / Gold",
    "swatch": "#252525",
    "description": "True wireless earbuds with Active Noise Cancelling, Transparency mode and a pocketable USB-C charging case. Black and Gold finish.",
    "images": [
      "images/products/beats-studio-buds-0.webp",
      "images/products/beats-studio-buds-1.webp"
    ],
    "variants": [
      {
        "id": "standard",
        "label": "Black / Gold",
        "price": 225000
      }
    ],
    "stock": {
      "lagos": 6,
      "abuja": 4
    },
    "featured": 15,
    "badge": "",
    "specs": [
      [
        "Type",
        "Wireless noise-cancelling earbuds"
      ],
      [
        "Case",
        "USB-C charging case"
      ],
      [
        "Finish shown",
        "Black / Gold"
      ]
    ],
    "inBox": "Beats Studio Buds +, charging case, ear tips and charging cable.",
    "cardName": "Beats Studio Buds + Wireless Earbuds - Black / Gold",
    "keywords": [
      "wireless",
      "earbuds"
    ]
  },
  {
    "id": "airpods-pro",
    "name": "AirPods Pro 2 USB-C",
    "brand": "Apple",
    "category": "audio",
    "subtitle": "Made for your everyday.",
    "finish": "White",
    "swatch": "#dcdde0",
    "description": "Second-generation AirPods Pro with Active Noise Cancellation, four sizes of ear tips and a MagSafe charging case with USB-C.",
    "images": [
      "images/products/airpods-pro-0.webp",
      "images/products/airpods-pro-1.webp"
    ],
    "variants": [
      {
        "id": "standard",
        "label": "White",
        "price": 385000
      }
    ],
    "stock": {
      "lagos": 6,
      "abuja": 4
    },
    "featured": 16,
    "badge": "",
    "specs": [
      [
        "Model",
        "2nd generation, USB-C case"
      ],
      [
        "Audio",
        "Active Noise Cancellation"
      ],
      [
        "Case",
        "MagSafe charging case"
      ],
      [
        "Finish shown",
        "White"
      ]
    ],
    "inBox": "AirPods Pro, charging case, ear tips and USB-C charging cable.",
    "cardName": "AirPods Pro 2 with MagSafe Charging Case, USB-C",
    "keywords": [
      "wireless",
      "earbuds"
    ]
  },
  {
    "id": "ipad-mini",
    "name": "iPad mini 512GB",
    "brand": "Apple",
    "category": "tablets",
    "subtitle": "Made for your everyday.",
    "finish": "Blue",
    "swatch": "#dcdde0",
    "description": "A compact iPad with A17 Pro, 512GB of storage and Wi-Fi connectivity. The Blue model shown supports Apple Pencil Pro, sold separately.",
    "images": [
      "images/products/ipad-mini-0.webp",
      "images/products/ipad-mini-1.webp"
    ],
    "variants": [
      {
        "id": "standard",
        "label": "Blue",
        "price": 1080000
      }
    ],
    "stock": {
      "lagos": 6,
      "abuja": 4
    },
    "featured": 17,
    "badge": "",
    "specs": [
      [
        "Chip",
        "A17 Pro"
      ],
      [
        "Storage",
        "512GB"
      ],
      [
        "Connectivity",
        "Wi-Fi"
      ],
      [
        "Finish shown",
        "Blue"
      ]
    ],
    "inBox": "iPad mini and USB-C charging cable. Accessories shown elsewhere sold separately.",
    "cardName": "iPad mini - 512GB Wi-Fi, Blue",
    "keywords": [
      "tablet",
      "iPad"
    ]
  },
  {
    "id": "airtag-pack",
    "name": "AirTag, pack of four",
    "brand": "Apple",
    "category": "accessories",
    "subtitle": "Made for your everyday.",
    "finish": "White / Silver",
    "swatch": "#dcdde0",
    "description": "Four Apple item trackers for Find My on compatible Apple devices. Key rings and holders are not included. These are item trackers, not personal safety devices.",
    "images": [
      "images/products/airtag-pack-0.webp",
      "images/products/airtag-pack-1.webp"
    ],
    "variants": [
      {
        "id": "standard",
        "label": "White / Silver",
        "price": 145000
      }
    ],
    "stock": {
      "lagos": 6,
      "abuja": 4
    },
    "featured": 18,
    "badge": "",
    "specs": [
      [
        "Quantity",
        "Four AirTag trackers"
      ],
      [
        "Compatibility",
        "Compatible Apple devices"
      ],
      [
        "Battery",
        "Replaceable CR2032"
      ],
      [
        "Finish shown",
        "White / Silver"
      ]
    ],
    "inBox": "Four AirTag trackers. Key rings sold separately.",
    "cardName": "AirTag Item Trackers - Pack of Four",
    "keywords": [
      "tracker",
      "tracking"
    ]
  },
  {
    "id": "magic-trackpad",
    "name": "Magic Trackpad",
    "brand": "Apple",
    "category": "accessories",
    "subtitle": "Made for your everyday.",
    "finish": "Black",
    "swatch": "#252525",
    "description": "A rechargeable Multi-Touch trackpad with Force Touch and a black glass surface for compatible Mac models. This sample listing is not labeled as the newer USB-C model.",
    "images": [
      "images/products/magic-trackpad-0.webp",
      "images/products/magic-trackpad-1.webp"
    ],
    "variants": [
      {
        "id": "standard",
        "label": "Black",
        "price": 290000
      }
    ],
    "stock": {
      "lagos": 6,
      "abuja": 4
    },
    "featured": 19,
    "badge": "",
    "specs": [
      [
        "Surface",
        "Multi-Touch"
      ],
      [
        "Connection",
        "Bluetooth"
      ],
      [
        "Compatibility",
        "Compatible Mac models"
      ],
      [
        "Finish shown",
        "Black"
      ]
    ],
    "inBox": "Magic Trackpad and charging cable. Confirm connector version before a real purchase.",
    "cardName": "Magic Trackpad - Black Multi-Touch Surface",
    "keywords": [
      "trackpad",
      "computer accessory"
    ]
  },
  {
    "id": "jbl-charge-5",
    "name": "JBL Charge 5",
    "brand": "JBL",
    "category": "audio",
    "subtitle": "Made for your everyday.",
    "finish": "Black",
    "swatch": "#252525",
    "description": "A portable Bluetooth speaker with IP67 water and dust protection, USB-C charging and a built-in power bank. Black finish.",
    "images": [
      "images/products/jbl-charge-5-0.webp",
      "images/products/jbl-charge-5-1.webp"
    ],
    "variants": [
      {
        "id": "standard",
        "label": "Black",
        "price": 230000
      }
    ],
    "stock": {
      "lagos": 6,
      "abuja": 4
    },
    "featured": 20,
    "badge": "",
    "specs": [
      [
        "Type",
        "Portable Bluetooth speaker"
      ],
      [
        "Protection",
        "IP67 water and dust resistance"
      ],
      [
        "Charging",
        "USB-C"
      ],
      [
        "Finish shown",
        "Black"
      ]
    ],
    "inBox": "JBL Charge 5, USB-C cable and quick-start guide.",
    "cardName": "JBL Charge 5 Bluetooth Speaker - Black",
    "keywords": [
      "wireless",
      "speaker",
      "portable"
    ]
  }
];
