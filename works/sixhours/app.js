(() => {
  // src/data/catalog.js
  var categories = [
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
  var products = [
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
          "price": 112e4
        },
        {
          "id": "256gb",
          "label": "256GB",
          "price": 125e4
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
      "name": "MacBook Air 13\u2033",
      "brand": "Apple",
      "category": "laptops",
      "subtitle": "M4. Light on your shoulders.",
      "finish": "Starlight",
      "swatch": "#ded5c2",
      "description": "For the caf\xE9 desk, the big idea, and the work that goes wherever you do. The light, capable MacBook Air makes a good everyday partner.",
      "images": [
        "images/products/macbook-air-0.webp",
        "images/products/macbook-air-1.webp"
      ],
      "variants": [
        {
          "id": "256gb",
          "label": "16GB / 256GB",
          "price": 145e4
        },
        {
          "id": "512gb",
          "label": "16GB / 512GB",
          "price": 165e4
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
          "price": 31e4
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
          "label": "4GB / 128GB \xB7 4G",
          "price": 245e3
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
          "price": 245e3
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
          "price": 165e3
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
      "name": "iPad Air 11\u2033",
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
          "price": 9e5
        },
        {
          "id": "256gb",
          "label": "M2 / Wi-Fi / 256GB",
          "price": 103e4
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
          "price": 55e4
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
          "price": 68e3
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
          "price": 65e3
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
          "price": 35e3
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
          "price": 145e3
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
          "price": 18e4
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
          "price": 21e4
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
          "price": 225e3
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
          "price": 385e3
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
          "price": 108e4
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
          "price": 145e3
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
          "price": 29e4
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
          "price": 23e4
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

  // src/domain/catalog.js
  var getProduct = (id) => products.find((product2) => product2.id === id);
  var getVariant = (product2, id) => product2?.variants.find((variant) => variant.id === id);
  var minPrice = (product2) => Math.min(...product2.variants.map((variant) => variant.price));
  function findProducts({ category = "all", query = "", sort = "featured", maxPrice = Infinity } = {}) {
    const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const matches = products.filter((product2) => (category === "all" || product2.category === category) && minPrice(product2) <= maxPrice && words.every((word) => `${product2.name} ${product2.cardName || ""} ${product2.brand} ${product2.category} ${product2.subtitle} ${product2.finish} ${product2.description} ${(product2.keywords || []).join(" ")}`.toLocaleLowerCase().includes(word)));
    const comparators = {
      featured: (a, b) => a.featured - b.featured,
      "price-asc": (a, b) => minPrice(a) - minPrice(b),
      "price-desc": (a, b) => minPrice(b) - minPrice(a),
      name: (a, b) => a.name.localeCompare(b.name)
    };
    return matches.sort(comparators[sort] || comparators.featured);
  }

  // src/domain/cart.js
  var MAX_QUANTITY = 9;
  var lineKey = (productId, variantId) => `${productId}:${variantId}`;
  function sanitizeCart(value) {
    if (!Array.isArray(value)) return [];
    const combined = /* @__PURE__ */ new Map();
    for (const raw of value.slice(0, 100)) {
      if (!raw || typeof raw !== "object") continue;
      const product2 = getProduct(raw.productId);
      if (!getVariant(product2, raw.variantId) || !Number.isInteger(raw.quantity) || raw.quantity < 1) continue;
      const key = lineKey(raw.productId, raw.variantId);
      const existing = combined.get(key);
      const otherQty = [...combined.values()].filter((line) => line.productId === product2.id && line.variantId !== raw.variantId).reduce((sum, line) => sum + line.quantity, 0);
      const quantity = Math.min(MAX_QUANTITY - otherQty, (existing?.quantity || 0) + raw.quantity);
      if (quantity > 0) combined.set(key, { productId: product2.id, variantId: raw.variantId, quantity });
    }
    return [...combined.values()];
  }
  function hydrateCart(lines) {
    return sanitizeCart(lines).map((line) => {
      const product2 = getProduct(line.productId);
      const variant = getVariant(product2, line.variantId);
      return { ...line, key: lineKey(line.productId, line.variantId), product: product2, variant, unitPrice: variant.price, lineTotal: variant.price * line.quantity };
    });
  }
  function cartTotals(lines) {
    const items = hydrateCart(lines);
    return { items, count: items.reduce((sum, item) => sum + item.quantity, 0), subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0) };
  }
  function productQuantity(lines, productId) {
    return lines.filter((line) => line.productId === productId).reduce((sum, line) => sum + line.quantity, 0);
  }
  function productAvailability(lines, productId, city = null) {
    const product2 = getProduct(productId);
    const limit = !product2 ? 0 : city && city in product2.stock ? Math.min(MAX_QUANTITY, product2.stock[city]) : MAX_QUANTITY;
    const inBag = productQuantity(lines, productId);
    const remaining = Math.max(0, limit - inBag);
    return { limit, inBag, remaining, reason: !product2 ? "unknown" : limit === 0 ? "city" : remaining === 0 ? "bag" : null };
  }
  function changeQuantity(lines, key, quantity, city = null) {
    const current = lines.find((line) => lineKey(line.productId, line.variantId) === key);
    if (!current) return { ok: false, message: "That item is no longer in your bag." };
    if (!Number.isInteger(quantity) || quantity < 0) return { ok: false, message: "Please choose a whole quantity." };
    if (quantity === 0) return { ok: true, lines: lines.filter((line) => line !== current) };
    const product2 = getProduct(current.productId);
    const { limit } = productAvailability(lines, product2.id, city);
    const others = productQuantity(lines, product2.id) - current.quantity;
    if (quantity + others > limit && quantity >= current.quantity) return { ok: false, message: limit === 0 ? "This item is unavailable in your selected city in the preview." : `The preview allows up to ${limit} of this product${city ? " in your selected city" : ""}.` };
    return { ok: true, lines: lines.map((line) => line === current ? { ...line, quantity } : line) };
  }
  function addToCart(lines, productId, variantId, quantity = 1, city = null) {
    const product2 = getProduct(productId);
    if (!product2 || !getVariant(product2, variantId)) return { ok: false, message: "Please choose an available product option." };
    if (!Number.isInteger(quantity) || quantity < 1) return { ok: false, message: "Please choose a valid quantity." };
    const key = lineKey(productId, variantId);
    const current = lines.find((line) => lineKey(line.productId, line.variantId) === key);
    const working = current ? lines : [...lines, { productId, variantId, quantity: 0 }];
    return changeQuantity(working, key, (current?.quantity || 0) + quantity, city);
  }

  // src/domain/delivery.js
  var DELIVERY_POLICY = {
    timezone: "Africa/Lagos",
    utcOffsetMinutes: 60,
    startHour: 9,
    cutoffHour: 15,
    hours: 6,
    cities: [
      { id: "lagos", label: "Lagos", fee: 3500, areas: [
        ["victoria-island", "Victoria Island"],
        ["ikoyi", "Ikoyi"],
        ["lekki-phase-1", "Lekki Phase 1"],
        ["oniru", "Oniru"],
        ["ajah", "Ajah"],
        ["marina", "Marina"],
        ["yaba", "Yaba"],
        ["surulere", "Surulere"],
        ["ikeja", "Ikeja"],
        ["maryland", "Maryland"],
        ["gbagada", "Gbagada"],
        ["magodo", "Magodo"]
      ].map(([id, label]) => ({ id, label })) },
      { id: "abuja", label: "Abuja", fee: 4500, areas: [
        ["maitama", "Maitama"],
        ["wuse", "Wuse"],
        ["wuse-2", "Wuse 2"],
        ["garki", "Garki"],
        ["asokoro", "Asokoro"],
        ["jabi", "Jabi"],
        ["utako", "Utako"],
        ["gwarinpa", "Gwarinpa"]
      ].map(([id, label]) => ({ id, label })) }
    ]
  };
  var hourLabel = (hour) => `${hour % 12 || 12} ${hour >= 12 ? "pm" : "am"}`;
  var policyLabels = Object.freeze({
    startTime: hourLabel(DELIVERY_POLICY.startHour),
    cutoffTime: hourLabel(DELIVERY_POLICY.cutoffHour),
    orderWindow: `${hourLabel(DELIVERY_POLICY.startHour)} to ${hourLabel(DELIVERY_POLICY.cutoffHour)} WAT`,
    betweenWindow: `${hourLabel(DELIVERY_POLICY.startHour)} and ${hourLabel(DELIVERY_POLICY.cutoffHour)} WAT`,
    deliveryRange: `${hourLabel(DELIVERY_POLICY.startHour)} to ${hourLabel(DELIVERY_POLICY.startHour + DELIVERY_POLICY.hours)}`
  });
  var getCity = (id) => DELIVERY_POLICY.cities.find((city) => city.id === id);
  var getArea = (cityId, areaId) => getCity(cityId)?.areas.find((area) => area.id === areaId);
  var validLocation = (value) => Boolean(value && getArea(value.city, value.area));
  var locationLabel = (value) => validLocation(value) ? `${getArea(value.city, value.area).label}, ${getCity(value.city).label}` : "Choose your area";
  var formatWatTime = (date) => new Intl.DateTimeFormat("en-NG", { timeZone: DELIVERY_POLICY.timezone, hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(date)).replaceAll("AM", "am").replaceAll("PM", "pm");
  function deliveryWindow(now = /* @__PURE__ */ new Date()) {
    const date = new Date(now);
    if (!Number.isFinite(date.getTime())) throw new TypeError("A valid date is required.");
    const wat = new Date(date.getTime() + DELIVERY_POLICY.utcOffsetMinutes * 6e4);
    const hour = wat.getUTCHours();
    const kind = hour >= DELIVERY_POLICY.startHour && hour < DELIVERY_POLICY.cutoffHour ? "express" : "scheduled";
    const nextDay = hour >= DELIVERY_POLICY.cutoffHour ? 1 : 0;
    const startAt = kind === "express" ? date : new Date(Date.UTC(wat.getUTCFullYear(), wat.getUTCMonth(), wat.getUTCDate() + nextDay, DELIVERY_POLICY.startHour - DELIVERY_POLICY.utcOffsetMinutes / 60));
    const deadlineAt = new Date(startAt.getTime() + DELIVERY_POLICY.hours * 36e5);
    return {
      kind,
      startAt: startAt.toISOString(),
      deadlineAt: deadlineAt.toISOString(),
      headline: kind === "express" ? `Within ${DELIVERY_POLICY.hours} hours, by ${formatWatTime(deadlineAt)}` : `Next window: ${nextDay ? "tomorrow" : "today"}, ${policyLabels.deliveryRange}`,
      detail: kind === "express" ? `For eligible items confirmed in the ${policyLabels.orderWindow} order window.` : `The order window is daily, ${policyLabels.orderWindow}. After cutoff, the six-hour clock starts at ${policyLabels.startTime} next day.`
    };
  }
  function quoteDelivery(location2, lines = [], now = /* @__PURE__ */ new Date()) {
    if (!validLocation(location2)) return { eligible: false, fee: null, kind: "unsupported", headline: "Let\u2019s check your doorstep.", detail: "Choose a supported city and area. Outside the listed areas, six-hour delivery is not available in this preview.", stockIssues: [] };
    const city = getCity(location2.city);
    const stockIssues = [];
    const seen = /* @__PURE__ */ new Set();
    for (const { product: product2 } of cartTotals(lines).items) {
      if (seen.has(product2.id)) continue;
      seen.add(product2.id);
      const requested = productQuantity(lines, product2.id);
      if (requested > product2.stock[city.id]) stockIssues.push({ productId: product2.id, name: product2.name, available: product2.stock[city.id], requested });
    }
    if (stockIssues.length) return { eligible: false, fee: city.fee, kind: "stock", headline: "A little change to your bag.", detail: `${stockIssues.map((issue) => issue.name).join(", ")} exceeds the illustrative stock for ${city.label}. Remove the item or reduce its quantity to continue.`, stockIssues };
    return { eligible: true, fee: city.fee, ...deliveryWindow(now), stockIssues: [] };
  }

  // src/state/store.js
  var STORAGE_KEY = "six-preview:v1";
  function createStorage(provider = () => globalThis.localStorage) {
    let available = true;
    return {
      read() {
        try {
          return JSON.parse(provider().getItem(STORAGE_KEY) || "null");
        } catch {
          available = false;
          return null;
        }
      },
      write(value) {
        try {
          provider().setItem(STORAGE_KEY, JSON.stringify(value));
          available = true;
          return true;
        } catch {
          available = false;
          return false;
        }
      },
      get available() {
        return available;
      }
    };
  }
  function sanitizeSummary(value) {
    if (!value || value.demo !== true || !/^SIX-DEMO-[A-Z0-9]{6,16}$/.test(value.id) || !Array.isArray(value.items) || !value.items.length || !validLocation(value.location)) return null;
    if (![value.subtotal, value.fee, value.total].every((number) => Number.isSafeInteger(number) && number >= 0)) return null;
    if (value.subtotal + value.fee !== value.total || !value.delivery || !["express", "scheduled"].includes(value.delivery.kind)) return null;
    if (!value.items.every((item) => typeof item.name === "string" && typeof item.option === "string" && Number.isSafeInteger(item.quantity) && item.quantity > 0 && Number.isSafeInteger(item.lineTotal) && item.lineTotal >= 0)) return null;
    return value;
  }
  function createStore(storage = createStorage()) {
    const saved = storage.read();
    let state = {
      cart: sanitizeCart(saved?.cart),
      location: validLocation(saved?.location) ? { city: saved.location.city, area: saved.location.area } : null,
      lastDemo: sanitizeSummary(saved?.lastDemo),
      storageAvailable: storage.available
    };
    const listeners = /* @__PURE__ */ new Set();
    const publish = (patch) => {
      state = { ...state, ...patch };
      state.storageAvailable = storage.write({ version: 1, cart: state.cart, location: state.location, lastDemo: state.lastDemo });
      listeners.forEach((listener) => listener(state));
      return state;
    };
    return {
      getState: () => state,
      subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      setCart(lines) {
        return publish({ cart: sanitizeCart(lines) });
      },
      setLocation(location2) {
        return publish({ location: validLocation(location2) ? { city: location2.city, area: location2.area } : null });
      },
      completeDemo(summary) {
        const valid = sanitizeSummary(summary);
        if (!valid) throw new Error("Invalid demo summary.");
        return publish({ lastDemo: valid, cart: [] });
      }
    };
  }

  // src/data/bundles.js
  var bundles = [
    {
      "id": "workday-edit",
      "name": "The Workday Edit",
      "items": [
        {
          "productId": "macbook-air",
          "variantId": "256gb",
          "quantity": 1
        },
        {
          "productId": "magic-mouse",
          "variantId": "black",
          "quantity": 1
        }
      ],
      "image": "images/bundles/workday-edit.webp",
      "description": "A considered pair of everyday essentials. See the exact products and configurations before adding the set.",
      "sampleStars": false
    },
    {
      "id": "everyday-essentials",
      "name": "Everyday Essentials",
      "items": [
        {
          "productId": "iphone-16",
          "variantId": "128gb",
          "quantity": 1
        },
        {
          "productId": "apple-adapter",
          "variantId": "20w",
          "quantity": 1
        }
      ],
      "image": "images/bundles/everyday-essentials.webp",
      "description": "A considered pair of everyday essentials. See the exact products and configurations before adding the set.",
      "sampleStars": false
    },
    {
      "id": "sound-companions",
      "name": "Sound Companions",
      "items": [
        {
          "productId": "airpods-4",
          "variantId": "anc",
          "quantity": 1
        },
        {
          "productId": "belkin-powerbank",
          "variantId": "5k",
          "quantity": 1
        }
      ],
      "image": "images/bundles/sound-companions.webp",
      "description": "A considered pair of everyday essentials. See the exact products and configurations before adding the set.",
      "sampleStars": false
    },
    {
      "id": "desk-setup",
      "name": "The Desk Setup",
      "items": [
        {
          "productId": "magic-keyboard",
          "variantId": "standard",
          "quantity": 1
        },
        {
          "productId": "magic-trackpad",
          "variantId": "standard",
          "quantity": 1
        }
      ],
      "image": "images/bundles/desk-setup.webp",
      "description": "A considered pair of everyday essentials. See the exact products and configurations before adding the set.",
      "sampleStars": false
    },
    {
      "id": "travel-light",
      "name": "Travel Light",
      "items": [
        {
          "productId": "ipad-mini",
          "variantId": "standard",
          "quantity": 1
        },
        {
          "productId": "beats-studio-buds",
          "variantId": "standard",
          "quantity": 1
        }
      ],
      "image": "images/bundles/travel-light.webp",
      "description": "A considered pair of everyday essentials. See the exact products and configurations before adding the set.",
      "sampleStars": true
    },
    {
      "id": "weekend-sound",
      "name": "Weekend Sound",
      "items": [
        {
          "productId": "jbl-flip-6",
          "variantId": "blue",
          "quantity": 1
        },
        {
          "productId": "belkin-charger",
          "variantId": "45w",
          "quantity": 1
        }
      ],
      "image": "images/bundles/weekend-sound.webp",
      "description": "A considered pair of everyday essentials. See the exact products and configurations before adding the set.",
      "sampleStars": true
    },
    {
      "id": "creative-kit",
      "name": "The Creative Kit",
      "items": [
        {
          "productId": "ipad-air",
          "variantId": "128gb",
          "quantity": 1
        },
        {
          "productId": "apple-pencil-pro",
          "variantId": "standard",
          "quantity": 1
        }
      ],
      "image": "images/bundles/creative-kit.webp",
      "description": "A considered pair of everyday essentials. See the exact products and configurations before adding the set.",
      "sampleStars": true
    },
    {
      "id": "stay-connected",
      "name": "Stay Connected",
      "items": [
        {
          "productId": "galaxy-a17",
          "variantId": "128gb",
          "quantity": 1
        },
        {
          "productId": "belkin-charger",
          "variantId": "45w",
          "quantity": 1
        }
      ],
      "image": "images/bundles/stay-connected.webp",
      "description": "A considered pair of everyday essentials. See the exact products and configurations before adding the set.",
      "sampleStars": true
    }
  ];

  // src/domain/bundles.js
  var getBundle = (id) => bundles.find((bundle) => bundle.id === id);
  function bundleItems(bundle) {
    return bundle.items.map((item) => {
      const product2 = getProduct(item.productId);
      const variant = getVariant(product2, item.variantId);
      return { ...item, product: product2, variant, lineTotal: variant.price * item.quantity };
    });
  }
  var bundlePrice = (bundle) => bundleItems(bundle).reduce((total, item) => total + item.lineTotal, 0);
  function addBundleToCart(lines, bundleId, city = null) {
    const bundle = getBundle(bundleId);
    if (!bundle) return { ok: false, message: "That set is not available." };
    let next = lines;
    for (const item of bundle.items) {
      const result = addToCart(next, item.productId, item.variantId, item.quantity, city);
      if (!result.ok) return { ...result, productId: item.productId };
      next = result.lines;
    }
    return { ok: true, lines: next };
  }
  function bundleAvailability(lines, bundleId, city = null) {
    const bundle = getBundle(bundleId);
    const result = addBundleToCart(lines, bundleId, city);
    const cityUnavailable = bundle && city && bundleItems(bundle).some((item) => item.product.stock[city] < item.quantity);
    const name = getProduct(result.productId)?.name;
    return { available: result.ok, reason: result.ok ? null : !bundle ? "unknown" : cityUnavailable ? "city" : "bag", message: result.ok ? "" : `${name ? `${name}: ` : ""}${result.message}` };
  }

  // src/ui/overlay.js
  function createOverlay() {
    const dialog = document.querySelector("#overlay");
    const surface = dialog.querySelector(".overlay-surface");
    const body = dialog.querySelector("#overlay-content");
    const title = dialog.querySelector("#overlay-title");
    const closeButton = dialog.querySelector("[data-close-overlay]");
    let cleanup = null;
    let previousFocus = null;
    let closeTimer = null;
    let closePromise = null;
    let finishClose = null;
    let closeRestoreFocus = true;
    let focusFrame = null;
    let revision = 0;
    function cancelFocus() {
      cancelAnimationFrame(focusFrame);
      focusFrame = null;
      revision++;
    }
    function setTitle(heading) {
      title.textContent = heading;
      closeButton.setAttribute("aria-label", `Close ${heading.toLowerCase()}`);
    }
    function restorePreviousFocus() {
      const usable = (element) => element?.isConnected && !element.matches(":disabled") && element.getClientRects().length && !element.closest("[hidden], [inert]");
      let target = previousFocus;
      if (!usable(target)) {
        const scope = previousFocus?.closest("form, article, [data-focus-scope]");
        target = [...scope?.querySelectorAll("input:checked, button:not(:disabled), a[href]") || []].find(usable);
      }
      if (usable(target)) target.focus({ preventScroll: true });
    }
    function close({ immediate = false, restoreFocus = true } = {}) {
      if (!dialog.open) return Promise.resolve();
      cancelFocus();
      if (closePromise) {
        const pending2 = closePromise;
        closeRestoreFocus && (closeRestoreFocus = restoreFocus);
        if (immediate) finishClose();
        return pending2;
      }
      closeRestoreFocus = restoreFocus;
      dialog.classList.remove("is-open");
      let resolveClose;
      closePromise = new Promise((resolve) => {
        resolveClose = resolve;
      });
      const pending = closePromise;
      finishClose = () => {
        clearTimeout(closeTimer);
        closeTimer = null;
        finishClose = null;
        cleanup?.();
        cleanup = null;
        dialog.close();
        body.replaceChildren();
        document.documentElement.classList.remove("overlay-open");
        dialog.dispatchEvent(new Event("overlaychange"));
        if (closeRestoreFocus) restorePreviousFocus();
        closePromise = null;
        resolveClose();
      };
      if (immediate || matchMedia("(prefers-reduced-motion: reduce)").matches) finishClose();
      else closeTimer = setTimeout(finishClose, 500);
      return pending;
    }
    function open({ title: heading, content, kind = "drawer", onMount, onClose, opener = document.activeElement }) {
      dialog.dispatchEvent(new Event("overlaywillopen"));
      cancelFocus();
      const wasClosing = Boolean(finishClose);
      if (wasClosing) {
        closeRestoreFocus = false;
        finishClose();
      }
      const fresh = !dialog.open;
      if (fresh && !wasClosing) previousFocus = opener;
      cleanup?.();
      cleanup = null;
      const enter = fresh || dialog.dataset.kind !== kind;
      if (enter) {
        surface.style.transition = "none";
        dialog.classList.remove("is-open");
      }
      setTitle(heading);
      dialog.dataset.kind = kind;
      body.innerHTML = content;
      if (fresh) {
        dialog.showModal();
        document.documentElement.classList.add("overlay-open");
      }
      const unmount = onMount?.(body);
      cleanup = () => {
        unmount?.();
        onClose?.();
      };
      body.scrollTop = 0;
      surface.scrollTop = 0;
      dialog.scrollTop = 0;
      if (enter) {
        surface.getBoundingClientRect();
        surface.style.removeProperty("transition");
        surface.getBoundingClientRect();
      }
      dialog.classList.add("is-open");
      dialog.dispatchEvent(new Event("overlaychange"));
      const currentRevision = revision;
      focusFrame = requestAnimationFrame(() => {
        focusFrame = null;
        if (revision !== currentRevision || !dialog.open || !dialog.classList.contains("is-open")) return;
        (body.querySelector("[data-initial-focus]") || closeButton).focus({ preventScroll: true });
      });
    }
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog || event.target.closest("[data-close-overlay]")) close();
    });
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      close();
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const focusable = [...dialog.querySelectorAll('a[href], button:not(:disabled), input:not([type="hidden"]):not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter((element) => element.getClientRects().length && getComputedStyle(element).visibility !== "hidden" && !element.closest("[hidden], [inert]"));
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first) {
        event.preventDefault();
        return;
      }
      const outside = !dialog.contains(document.activeElement);
      if (event.shiftKey && (document.activeElement === first || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    });
    return { open, close, setTitle, body, get isOpen() {
      return dialog.open;
    } };
  }

  // src/ui/navigation-state.js
  var STATE_KEY = "sixhoursEntry";
  function createNavigationState() {
    const entries = /* @__PURE__ */ new Map();
    const fallbackKeys = /* @__PURE__ */ new Map();
    let serial2 = 0;
    let persistentKeys = false;
    let currentKey = null;
    let currentHash = location.hash;
    let pendingKey = null;
    const newKey = () => `${Date.now().toString(36)}-${++serial2}`;
    const readKey = () => history.state?.[STATE_KEY];
    const writeKey = (key) => {
      try {
        history.replaceState({ ...history.state, [STATE_KEY]: key }, "");
        persistentKeys = true;
      } catch {
      }
    };
    try {
      history.scrollRestoration = "manual";
    } catch {
    }
    function focusLocator(element) {
      if (!(element instanceof Element) || element === document.body) return null;
      if (element.id) return { id: element.id };
      const link = element.closest("a[href]");
      return link ? { href: link.getAttribute("href"), text: link.textContent.trim() } : null;
    }
    function capture({ focus = true } = {}) {
      if (!currentKey) return;
      if (readKey() === currentKey) currentHash = location.hash;
      const previous = entries.get(currentKey);
      entries.set(currentKey, { x: scrollX, y: scrollY, focus: focus && focusLocator(document.activeElement) || previous?.focus || null });
      fallbackKeys.set(currentHash, currentKey);
    }
    function arrive() {
      capture();
      const key = pendingKey || readKey() || !persistentKeys && fallbackKeys.get(location.hash) || newKey();
      pendingKey = null;
      const snapshot = key !== currentKey ? entries.get(key) : null;
      currentKey = key;
      currentHash = location.hash;
      writeKey(key);
      return snapshot || null;
    }
    function push(hash) {
      capture();
      const key = newKey();
      try {
        const url = new URL(location.href);
        url.hash = hash;
        history.pushState({ ...history.state, [STATE_KEY]: key }, "", url.href);
        return true;
      } catch {
        pendingKey = key;
        location.hash = hash;
        return false;
      }
    }
    function restore(root, snapshot) {
      if (!snapshot) return false;
      scrollTo({ left: snapshot.x, top: snapshot.y, behavior: "instant" });
      const visible = (element) => {
        if (!element || element.closest("[hidden], [inert]") || element.matches(":disabled")) return false;
        const box = element.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < innerHeight;
      };
      const locator = snapshot.focus;
      let target = locator?.id ? document.getElementById(locator.id) : null;
      if (!target && locator?.href) target = [...root.querySelectorAll("a[href]")].find((link) => link.getAttribute("href") === locator.href && link.textContent.trim() === locator.text && visible(link));
      if (!visible(target)) target = [...root.querySelectorAll('a[href], button:not(:disabled), input:not([type="hidden"])')].find(visible);
      target?.focus({ preventScroll: true });
      return true;
    }
    window.addEventListener("scroll", () => capture({ focus: false }), { passive: true });
    return { arrive, capture, push, restore };
  }

  // node_modules/lucide/dist/esm/defaultAttributes.mjs
  var defaultAttributes = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": 2,
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  };

  // node_modules/lucide/dist/esm/createElement.mjs
  var createSVGElement = ([tag, attrs, children]) => {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs).forEach((name) => {
      element.setAttribute(name, String(attrs[name]));
    });
    if (children?.length) {
      children.forEach((child) => {
        const childElement = createSVGElement(child);
        element.appendChild(childElement);
      });
    }
    return element;
  };
  var createElement = (iconNode, customAttrs = {}) => {
    const tag = "svg";
    const attrs = {
      ...defaultAttributes,
      ...customAttrs
    };
    return createSVGElement([tag, attrs, iconNode]);
  };

  // node_modules/lucide/dist/esm/icons/arrow-left.mjs
  var ArrowLeft = [
    ["path", { d: "m12 19-7-7 7-7" }],
    ["path", { d: "M19 12H5" }]
  ];

  // node_modules/lucide/dist/esm/icons/arrow-right.mjs
  var ArrowRight = [
    ["path", { d: "M5 12h14" }],
    ["path", { d: "m12 5 7 7-7 7" }]
  ];

  // node_modules/lucide/dist/esm/icons/arrow-up-right.mjs
  var ArrowUpRight = [
    ["path", { d: "M7 7h10v10" }],
    ["path", { d: "M7 17 17 7" }]
  ];

  // node_modules/lucide/dist/esm/icons/arrow-up.mjs
  var ArrowUp = [
    ["path", { d: "m5 12 7-7 7 7" }],
    ["path", { d: "M12 19V5" }]
  ];

  // node_modules/lucide/dist/esm/icons/check.mjs
  var Check = [["path", { d: "M20 6 9 17l-5-5" }]];

  // node_modules/lucide/dist/esm/icons/chevron-down.mjs
  var ChevronDown = [["path", { d: "m6 9 6 6 6-6" }]];

  // node_modules/lucide/dist/esm/icons/chevron-left.mjs
  var ChevronLeft = [["path", { d: "m15 18-6-6 6-6" }]];

  // node_modules/lucide/dist/esm/icons/chevron-right.mjs
  var ChevronRight = [["path", { d: "m9 18 6-6-6-6" }]];

  // node_modules/lucide/dist/esm/icons/circle-check.mjs
  var CircleCheck = [
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["path", { d: "m16 9-5.5 5.5L8 12" }]
  ];

  // node_modules/lucide/dist/esm/icons/circle-exclamation-point.mjs
  var CircleExclamationPoint = [
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["line", { x1: "12", x2: "12", y1: "8", y2: "12" }],
    ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16" }]
  ];

  // node_modules/lucide/dist/esm/icons/clock-3.mjs
  var Clock3 = [
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["path", { d: "M12 6v6h4" }]
  ];

  // node_modules/lucide/dist/esm/icons/copy.mjs
  var Copy = [
    ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }],
    ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }]
  ];

  // node_modules/lucide/dist/esm/icons/eye.mjs
  var Eye = [
    [
      "path",
      {
        d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
      }
    ],
    ["circle", { cx: "12", cy: "12", r: "3" }]
  ];

  // node_modules/lucide/dist/esm/icons/map-pin.mjs
  var MapPin = [
    [
      "path",
      {
        d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
      }
    ],
    ["circle", { cx: "12", cy: "10", r: "3" }]
  ];

  // node_modules/lucide/dist/esm/icons/menu.mjs
  var Menu = [
    ["path", { d: "M4 5h16" }],
    ["path", { d: "M4 12h16" }],
    ["path", { d: "M4 19h16" }]
  ];

  // node_modules/lucide/dist/esm/icons/message-circle.mjs
  var MessageCircle = [
    [
      "path",
      {
        d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"
      }
    ]
  ];

  // node_modules/lucide/dist/esm/icons/minus.mjs
  var Minus = [["path", { d: "M5 12h14" }]];

  // node_modules/lucide/dist/esm/icons/package-check.mjs
  var PackageCheck = [
    ["path", { d: "M12 22V12" }],
    ["path", { d: "m16 17 2 2 4-4" }],
    [
      "path",
      {
        d: "M21 11.127V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l1.32-.753"
      }
    ],
    ["path", { d: "M3.29 7 12 12l8.71-5" }],
    ["path", { d: "m7.5 4.27 8.997 5.148" }]
  ];

  // node_modules/lucide/dist/esm/icons/plus.mjs
  var Plus = [
    ["path", { d: "M5 12h14" }],
    ["path", { d: "M12 5v14" }]
  ];

  // node_modules/lucide/dist/esm/icons/rotate-ccw.mjs
  var RotateCcw = [
    ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }],
    ["path", { d: "M3 3v5h5" }]
  ];

  // node_modules/lucide/dist/esm/icons/search.mjs
  var Search = [
    ["path", { d: "m21 21-4.34-4.34" }],
    ["circle", { cx: "11", cy: "11", r: "8" }]
  ];

  // node_modules/lucide/dist/esm/icons/shield-check.mjs
  var ShieldCheck = [
    [
      "path",
      {
        d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
      }
    ],
    ["path", { d: "m9 12 2 2 4-4" }]
  ];

  // node_modules/lucide/dist/esm/icons/shopping-bag.mjs
  var ShoppingBag = [
    ["path", { d: "M16 10a4 4 0 0 1-8 0" }],
    ["path", { d: "M3.103 6.034h17.794" }],
    [
      "path",
      {
        d: "M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"
      }
    ]
  ];

  // node_modules/lucide/dist/esm/icons/sliders-horizontal.mjs
  var SlidersHorizontal = [
    ["path", { d: "M10 5H3" }],
    ["path", { d: "M12 19H3" }],
    ["path", { d: "M14 3v4" }],
    ["path", { d: "M16 17v4" }],
    ["path", { d: "M21 12h-9" }],
    ["path", { d: "M21 19h-5" }],
    ["path", { d: "M21 5h-7" }],
    ["path", { d: "M8 10v4" }],
    ["path", { d: "M8 12H3" }]
  ];

  // node_modules/lucide/dist/esm/icons/star.mjs
  var Star = [
    [
      "path",
      {
        d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
      }
    ]
  ];

  // node_modules/lucide/dist/esm/icons/trash.mjs
  var Trash = [
    ["path", { d: "M10 11v6" }],
    ["path", { d: "M14 11v6" }],
    ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" }],
    ["path", { d: "M3 6h18" }],
    ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }]
  ];

  // node_modules/lucide/dist/esm/icons/truck.mjs
  var Truck = [
    ["path", { d: "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" }],
    ["path", { d: "M15 18H9" }],
    [
      "path",
      { d: "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" }
    ],
    ["circle", { cx: "17", cy: "18", r: "2" }],
    ["circle", { cx: "7", cy: "18", r: "2" }]
  ];

  // node_modules/lucide/dist/esm/icons/x.mjs
  var X = [
    ["path", { d: "M18 6 6 18" }],
    ["path", { d: "m6 6 12 12" }]
  ];

  // src/ui/icons.js
  var icons = { "arrow-right": ArrowRight, "arrow-left": ArrowLeft, "arrow-up": ArrowUp, "arrow-up-right": ArrowUpRight, search: Search, bag: ShoppingBag, x: X, menu: Menu, pin: MapPin, "chevron-down": ChevronDown, "chevron-left": ChevronLeft, "chevron-right": ChevronRight, check: Check, clock: Clock3, truck: Truck, shield: ShieldCheck, package: PackageCheck, plus: Plus, minus: Minus, filter: SlidersHorizontal, alert: CircleExclamationPoint, success: CircleCheck, eye: Eye, reset: RotateCcw, help: MessageCircle, trash: Trash, copy: Copy, star: Star };
  function icon(name, size = 20) {
    if (!icons[name]) return "";
    return createElement(icons[name], { width: size, height: size, "stroke-width": 1.6, "aria-hidden": "true", class: "icon" }).outerHTML;
  }
  function hydrateIcons(root = document) {
    root.querySelectorAll("[data-icon]").forEach((element) => {
      element.innerHTML = icon(element.dataset.icon, Number(element.dataset.size) || 20);
    });
  }

  // src/ui/utils.js
  var money = (value) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
  var escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  var plural = (count, singular, multiple = `${singular}s`) => `${count} ${count === 1 ? singular : multiple}`;
  var serial = 0;
  var uniqueId = (prefix) => `${prefix}-${++serial}`;
  function focusHeading(root) {
    const target = root.querySelector("h1");
    if (target) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  }
  function imageMarkup(src, alt, className = "", eager = false) {
    return `<img src="${escapeHTML(src)}" alt="${escapeHTML(alt)}" class="${className}" loading="${eager ? "eager" : "lazy"}" decoding="async" width="800" height="900">`;
  }

  // src/ui/toast.js
  function createToast() {
    const root = document.querySelector("#toast");
    const dialog = document.querySelector("#overlay");
    let timer;
    const clear = () => {
      clearTimeout(timer);
      root.hidden = true;
    };
    const syncHost = () => {
      (dialog.open ? dialog : document.body).append(root);
    };
    dialog.addEventListener("overlaychange", syncHost);
    dialog.addEventListener("overlaywillopen", clear);
    const notify = (message, type = "success") => {
      clearTimeout(timer);
      syncHost();
      root.setAttribute("role", type === "error" ? "alert" : "status");
      root.innerHTML = `${icon(type === "error" ? "alert" : "check", 19)}<span>${escapeHTML(message)}</span><button type="button" aria-label="Dismiss notification">${icon("x", 16)}</button>`;
      root.hidden = false;
      root.querySelector("button").onclick = clear;
      timer = setTimeout(() => {
        if (!root.contains(document.activeElement)) root.hidden = true;
      }, type === "error" ? 6500 : 4200);
    };
    notify.clear = clear;
    return notify;
  }

  // src/ui/rating.js
  function sampleRating({ large = false } = {}) {
    return `<span class="sample-rating${large ? " is-large" : ""}"><span class="rating-stars" aria-hidden="true">${Array.from({ length: 5 }, () => icon("star", large ? 24 : 15)).join("")}</span><span class="sample-rating-label">Sample</span><span class="sr-only">Illustrative stars only, not a verified rating</span></span>`;
  }

  // src/ui/product-card.js
  function purchaseState(product2, lines, city) {
    const stock = productAvailability(lines, product2.id, city);
    return { disabled: stock.remaining === 0, label: stock.reason === "city" ? "Unavailable" : stock.reason === "bag" ? "Bag limit reached" : product2.variants.length > 1 ? "Select options" : "Add to bag", message: stock.reason === "city" ? "No sample stock in your selected city." : stock.reason === "bag" ? `Your bag has reached the preview limit of ${stock.limit} for this product.` : "" };
  }
  function productCard(product2, { city = null, lines = [] } = {}) {
    const purchase = purchaseState(product2, lines, city);
    const options = product2.variants.length > 1;
    return `<article class="product-card" data-product-card="${product2.id}">
    <div class="product-media">
      <a class="product-photo ${product2.images.length > 1 ? "has-alternate" : ""}" href="#product/${product2.id}" aria-label="View ${escapeHTML(product2.name)}">
        ${imageMarkup(product2.images[0], `${product2.name} in ${product2.finish}`, "product-primary")}
        ${product2.images[1] ? imageMarkup(product2.images[1], "", "product-alternate") : ""}
      </a>
      ${product2.badge ? `<span class="product-badge">${escapeHTML(product2.badge)}</span>` : ""}
      <button type="button" class="quick-view icon-button" data-action="open-quickview" data-product="${product2.id}" aria-label="Quick view ${escapeHTML(product2.name)}">${icon("eye", 19)}</button>
    </div>
    <div class="product-info"><h3><a href="#product/${product2.id}">${escapeHTML(product2.cardName || product2.name)}</a></h3>${sampleRating()}<p class="product-price">${options ? '<span class="from-label">From </span>' : ""}${money(minPrice(product2))}</p></div>
    <button type="button" class="card-add" data-action="${options ? "open-quickview" : "quick-add"}" data-product="${product2.id}" title="${escapeHTML(purchase.message)}" ${purchase.disabled ? "disabled" : ""}>${purchase.label}</button>
  </article>`;
  }
  function updateProductCards(root, state) {
    root.querySelectorAll("[data-product-card]").forEach((card2) => {
      const product2 = getProduct(card2.dataset.productCard);
      if (!product2) return;
      const purchase = purchaseState(product2, state.cart, state.location?.city);
      const button = card2.querySelector(".card-add");
      button.disabled = purchase.disabled;
      button.textContent = purchase.label;
      button.title = purchase.message;
    });
  }

  // src/ui/select.js
  var active = null;
  document.addEventListener("pointerdown", (event) => {
    if (active && !active.root.contains(event.target) && !active.list.contains(event.target)) active.close();
  });
  function mountSelect(root, config) {
    const id = config.id || uniqueId("select");
    const listId = `${id}-list`;
    let options = config.options || [];
    let value = config.value || "";
    let highlighted = -1;
    let opened = false;
    let typeahead = "";
    let lastKeyTime = 0;
    root.classList.add("custom-select");
    root.innerHTML = `<input type="hidden" name="${escapeHTML(config.name || "")}"><button type="button" id="${id}" class="select-trigger" role="combobox" aria-label="${escapeHTML(config.label || "Choose an option")}" aria-haspopup="listbox" aria-controls="${listId}" aria-expanded="false"><span></span>${icon("chevron-down", 16)}</button><ul id="${listId}" class="select-options" popover="manual" role="listbox" aria-label="${escapeHTML(config.label || "Options")}" hidden></ul>`;
    const button = root.querySelector("button");
    const input = root.querySelector("input");
    const label = button.querySelector("span");
    const list = root.querySelector("ul");
    const nativePopover = typeof list.showPopover === "function";
    if (!nativePopover) list.removeAttribute("popover");
    const fallbackHost = root.closest("dialog") || document.body;
    const minWidth = Number.parseFloat(getComputedStyle(list).getPropertyValue("--select-min-width")) || 0;
    const alignEnd = getComputedStyle(list).getPropertyValue("--select-align").trim() === "end";
    function bounds() {
      const viewport = window.visualViewport;
      const left = (viewport?.offsetLeft || 0) + 8;
      const top = (viewport?.offsetTop || 0) + 8;
      return { left, top, right: left + (viewport?.width || innerWidth) - 16, bottom: top + (viewport?.height || innerHeight) - 16 };
    }
    function positionList(event) {
      if (!opened || event?.target === list) return;
      const rect = button.getBoundingClientRect();
      const clip = bounds();
      for (let parent = root.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(parent).overflowY)) {
          const box = parent.getBoundingClientRect();
          clip.top = Math.max(clip.top, box.top);
          clip.bottom = Math.min(clip.bottom, box.bottom);
        }
      }
      if (rect.bottom <= clip.top || rect.top >= clip.bottom || rect.right <= clip.left || rect.left >= clip.right) {
        close();
        return;
      }
      const width = Math.min(Math.max(rect.width, minWidth), clip.right - clip.left);
      list.style.width = `${width}px`;
      const below = Math.max(0, clip.bottom - rect.bottom - 5);
      const above = Math.max(0, rect.top - clip.top - 5);
      const desired = Math.min(240, list.scrollHeight + 2);
      const upward = below < desired && above > below;
      list.style.maxHeight = `${Math.min(240, upward ? above : below)}px`;
      const height = list.getBoundingClientRect().height;
      const x = Math.min(Math.max(alignEnd ? rect.right - width : rect.left, clip.left), clip.right - width);
      list.style.left = `${x}px`;
      list.style.top = `${upward ? rect.top - 5 - height : rect.bottom + 5}px`;
      list.dataset.placement = upward ? "above" : "below";
    }
    function revealHighlight() {
      if (!opened || highlighted < 0) return;
      const option = list.children[highlighted];
      if (!option) return;
      const top = option.offsetTop;
      const bottom = top + option.offsetHeight;
      if (top < list.scrollTop + 5) list.scrollTop = Math.max(0, top - 5);
      else if (bottom > list.scrollTop + list.clientHeight - 5) list.scrollTop = bottom - list.clientHeight + 5;
    }
    function render() {
      input.value = value;
      label.textContent = options.find((option) => option.value === value)?.label || config.placeholder || "Choose an option";
      button.classList.toggle("is-placeholder", !value);
      list.innerHTML = options.map((option, index) => `<li id="${listId}-${index}" role="option" data-option="${index}" aria-selected="${option.value === value}" class="${index === highlighted ? "is-highlighted" : ""}">${escapeHTML(option.label)}${option.value === value ? icon("check", 15) : ""}</li>`).join("");
      if (opened && highlighted >= 0) {
        button.setAttribute("aria-activedescendant", `${listId}-${highlighted}`);
        positionList();
        revealHighlight();
      } else button.removeAttribute("aria-activedescendant");
    }
    function listen(enabled) {
      const method = enabled ? "addEventListener" : "removeEventListener";
      document[method]("scroll", positionList, true);
      window[method]("resize", positionList);
      window.visualViewport?.[method]("resize", positionList);
      window.visualViewport?.[method]("scroll", positionList);
    }
    function close() {
      if (nativePopover && list.matches(":popover-open")) list.hidePopover();
      opened = false;
      list.hidden = true;
      if (!nativePopover && list.parentElement !== root) root.append(list);
      button.setAttribute("aria-expanded", "false");
      button.removeAttribute("aria-activedescendant");
      root.classList.remove("is-open");
      listen(false);
      if (active?.root === root) active = null;
    }
    function open() {
      if (button.disabled || !options.length) return;
      if (active?.root !== root) active?.close();
      active = { root, list, close };
      opened = true;
      list.hidden = false;
      if (nativePopover) list.showPopover();
      else fallbackHost.append(list);
      button.setAttribute("aria-expanded", "true");
      root.classList.add("is-open");
      highlighted = Math.max(0, options.findIndex((option) => option.value === value));
      render();
      listen(true);
    }
    function choose(index) {
      const option = options[index];
      if (!option) return;
      value = option.value;
      close();
      render();
      button.focus({ preventScroll: true });
      config.onChange?.(value);
    }
    const onTrigger = (event) => {
      if (event.target.closest(".select-trigger")) opened ? close() : open();
    };
    const onOption = (event) => {
      const option = event.target.closest("[data-option]");
      if (option) choose(Number(option.dataset.option));
    };
    function onKey(event) {
      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        if (!opened) open();
        else if (event.key === "ArrowDown") highlighted = Math.min(options.length - 1, highlighted + 1);
        else if (event.key === "ArrowUp") highlighted = Math.max(0, highlighted - 1);
        if (event.key === "Home") highlighted = 0;
        if (event.key === "End") highlighted = options.length - 1;
        render();
      } else if ((event.key === "Enter" || event.key === " ") && opened) {
        event.preventDefault();
        choose(highlighted);
      } else if (event.key === "Escape" && opened) {
        event.preventDefault();
        event.stopPropagation();
        close();
      } else if (event.key === "Tab") close();
      else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && event.key !== " ") {
        const now = Date.now();
        typeahead = now - lastKeyTime < 600 ? typeahead + event.key : event.key;
        lastKeyTime = now;
        const index = options.findIndex((option) => option.label.toLowerCase().startsWith(typeahead.toLowerCase()));
        if (index >= 0) {
          event.preventDefault();
          if (!opened) open();
          highlighted = index;
          render();
        }
      }
    }
    root.addEventListener("click", onTrigger);
    list.addEventListener("click", onOption);
    button.addEventListener("keydown", onKey);
    render();
    return {
      get value() {
        return value;
      },
      button,
      setOptions(next, nextValue = "") {
        options = next;
        value = nextValue;
        highlighted = -1;
        close();
        render();
      },
      setValue(next) {
        value = next;
        render();
      },
      destroy() {
        close();
        root.removeEventListener("click", onTrigger);
        list.removeEventListener("click", onOption);
        button.removeEventListener("keydown", onKey);
      }
    };
  }

  // src/features/catalog.js
  function createCatalogFeature({ store: store2 }) {
    function renderHome() {
      const products2 = findProducts();
      document.querySelector("#home-products").innerHTML = products2.map((product2) => productCard(product2, { city: store2.getState().location?.city, lines: store2.getState().cart })).join("");
      document.querySelector("#home-results-status").textContent = `${plural(products2.length, "gadget")} shown. Prices, stock and stars are illustrative.`;
    }
    store2.subscribe((state) => updateProductCards(document.querySelector("#home-products"), state));
    function mountShop(root, route) {
      let category = categories.some((item) => item.id === route.category) ? route.category : "all";
      let query = route.query || "";
      let sort = ["featured", "price-asc", "price-desc", "name"].includes(route.sort) ? route.sort : "featured";
      let maxPrice = ["100000", "300000", "1000000"].includes(String(route.maxPrice)) ? Number(route.maxPrice) : Infinity;
      root.innerHTML = `<section class="shop-intro"><div class="container"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="#home">Home</a>${icon("chevron-right", 13)}<span>The collection</span></nav><h1>All gadgets</h1><p>Everyday tech, thoughtfully chosen. All prices and stock are illustrative.</p></div></section><section class="shop-section container" aria-label="Gadget collection"><div class="shop-toolbar"><div class="collection-tabs" role="group" aria-label="Product categories">${categories.map((item) => `<button type="button" data-shop-category="${item.id}" aria-pressed="${item.id === category}">${escapeHTML(item.label)}</button>`).join("")}</div></div><div class="shop-filter-row"><p class="results-count" aria-live="polite"></p><div class="shop-filters"><button type="button" class="filter-toggle" data-filter-toggle aria-expanded="false" aria-controls="collection-filter-panel">Filter ${icon("filter", 18)}</button><div data-sort-select></div></div></div><div class="collection-filter-panel" id="collection-filter-panel" hidden><form class="shop-search" role="search"><label class="sr-only" for="shop-search-input">Search this collection</label>${icon("search", 20)}<input id="shop-search-input" type="search" value="${escapeHTML(query)}" placeholder="Search the collection" autocomplete="off" maxlength="100"><button class="inline-link" type="submit">Search ${icon("arrow-right", 17)}</button></form><div data-price-select></div></div><h2 class="sr-only">Products in this collection</h2><div class="product-grid" data-shop-grid></div></section>`;
      const title = root.querySelector("h1");
      const grid = root.querySelector("[data-shop-grid]");
      const input = root.querySelector("input");
      const toggle = root.querySelector("[data-filter-toggle]");
      const panel = root.querySelector(".collection-filter-panel");
      function render() {
        const matches = findProducts({ category, query, sort, maxPrice });
        title.textContent = category === "all" ? "All gadgets" : categories.find((item) => item.id === category).label;
        root.querySelector(".results-count").textContent = `${plural(matches.length, "gadget")}${query ? ` for \u201C${query}\u201D` : ""}`;
        root.querySelectorAll("[data-shop-category]").forEach((button) => {
          const selected = button.dataset.shopCategory === category;
          button.classList.toggle("is-active", selected);
          button.setAttribute("aria-pressed", String(selected));
        });
        grid.innerHTML = matches.length ? matches.map((product2) => productCard(product2, { city: store2.getState().location?.city, lines: store2.getState().cart })).join("") : `<div class="empty-state">${icon("search", 32)}<h2>No matches, just yet.</h2><p>Try a different search or give your filters a little room.</p><button class="button button-dark" type="button" data-reset-shop>Reset search &amp; filters ${icon("reset", 17)}</button></div>`;
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (sort !== "featured") params.set("sort", sort);
        if (maxPrice !== Infinity) params.set("maxPrice", String(maxPrice));
        const hash = `#shop${category !== "all" ? `/${category}` : ""}${params.size ? `?${params}` : ""}`;
        if (location.hash !== hash) {
          try {
            history.replaceState(history.state, "", hash);
          } catch {
          }
        }
      }
      const priceSelect = mountSelect(root.querySelector("[data-price-select]"), { label: "Filter by price", value: maxPrice === Infinity ? "all" : String(maxPrice), options: [{ value: "all", label: "All prices" }, { value: "100000", label: "Up to \u20A6100,000" }, { value: "300000", label: "Up to \u20A6300,000" }, { value: "1000000", label: "Up to \u20A61,000,000" }], onChange: (value) => {
        maxPrice = value === "all" ? Infinity : Number(value);
        render();
      } });
      const sortSelect = mountSelect(root.querySelector("[data-sort-select]"), { label: "Sort products", value: sort, options: [{ value: "featured", label: "Default sorting" }, { value: "price-asc", label: "Price: low to high" }, { value: "price-desc", label: "Price: high to low" }, { value: "name", label: "Name: A to Z" }], onChange: (value) => {
        sort = value;
        render();
      } });
      const onInput = () => {
        query = input.value.slice(0, 100);
        render();
      };
      const onSubmit = (event) => {
        event.preventDefault();
        onInput();
      };
      const onClick = (event) => {
        const categoryButton = event.target.closest("[data-shop-category]");
        if (categoryButton) {
          category = categoryButton.dataset.shopCategory;
          render();
        }
        if (event.target.closest("[data-filter-toggle]")) {
          panel.hidden = !panel.hidden;
          toggle.setAttribute("aria-expanded", String(!panel.hidden));
        }
        if (event.target.closest("[data-reset-shop]")) {
          category = "all";
          query = "";
          input.value = "";
          maxPrice = Infinity;
          sort = "featured";
          priceSelect.setValue("all");
          sortSelect.setValue("featured");
          panel.hidden = false;
          toggle.setAttribute("aria-expanded", "true");
          render();
          input.focus();
        }
      };
      root.querySelector("form").addEventListener("submit", onSubmit);
      input.addEventListener("input", onInput);
      root.addEventListener("click", onClick);
      const unsubscribe = store2.subscribe((state) => updateProductCards(grid, state));
      render();
      return () => {
        unsubscribe();
        priceSelect.destroy();
        sortSelect.destroy();
        root.removeEventListener("click", onClick);
        input.removeEventListener("input", onInput);
        root.querySelector("form")?.removeEventListener("submit", onSubmit);
      };
    }
    return { renderHome, mountShop, actions: {} };
  }

  // src/features/search.js
  function createSearchFeature({ overlay: overlay2, navigate: navigate2 }) {
    function openSearch() {
      overlay2.open({ title: "Find your everyday favourite.", kind: "search", content: `<form class="drawer-search-form" role="search"><label for="drawer-search" class="sr-only">Search all gadgets</label><div class="search-input-wrap">${icon("search", 21)}<input id="drawer-search" name="query" type="search" maxlength="100" placeholder="What are you looking for?" autocomplete="off" data-initial-focus><button type="submit" class="icon-button" aria-label="See all search results">${icon("arrow-right", 21)}</button></div></form><div class="search-suggestions"><p class="eyebrow">A few good places to start</p><div class="suggestion-chips"><button type="button" data-suggestion="iPhone">iPhone</button><button type="button" data-suggestion="MacBook">MacBook</button><button type="button" data-suggestion="AirPods">AirPods</button><button type="button" data-suggestion="Belkin">Belkin</button></div></div><p class="search-status fine-print" aria-live="polite"></p><div class="search-results"></div>`, onMount: (root) => {
        const input = root.querySelector("input");
        const results = root.querySelector(".search-results");
        const status = root.querySelector(".search-status");
        const render = () => {
          const query = input.value.trim();
          const matches = findProducts({ query });
          status.textContent = query ? `${plural(matches.length, "match", "matches")}${matches.length > 6 ? ", showing the first 6" : ""}` : "A few everyday favourites";
          results.innerHTML = matches.length ? matches.slice(0, 6).map((product2) => `<a class="search-result" href="#product/${product2.id}"><span class="search-result-image">${imageMarkup(product2.images[0], product2.name)}</span><span><span class="product-brand">${escapeHTML(product2.brand)}</span><strong>${escapeHTML(product2.name)}</strong><span class="fine-print">${product2.variants.length > 1 ? "From " : ""}${money(minPrice(product2))}</span></span>${icon("arrow-up-right", 17)}</a>`).join("") : `<div class="empty-state compact">${icon("search", 28)}<h3>Nothing here just yet.</h3><p>Try \u201CSamsung\u201D, \u201Caudio\u201D, or \u201Ccharger\u201D.</p><button class="text-link" type="button" data-clear-search>Clear search</button></div>`;
        };
        const submit = (event) => {
          event.preventDefault();
          navigate2(`#shop${input.value.trim() ? `?q=${encodeURIComponent(input.value.trim())}` : ""}`);
        };
        const click = (event) => {
          const suggestion = event.target.closest("[data-suggestion]");
          if (suggestion) {
            input.value = suggestion.dataset.suggestion;
            render();
            input.focus();
          }
          if (event.target.closest("[data-clear-search]")) {
            input.value = "";
            render();
            input.focus();
          }
        };
        input.addEventListener("input", render);
        root.querySelector("form").addEventListener("submit", submit);
        root.addEventListener("click", click);
        render();
        return () => {
          input.removeEventListener("input", render);
          root.removeEventListener("click", click);
        };
      } });
    }
    return { openSearch, actions: { "open-search": openSearch } };
  }

  // src/features/cart.js
  function createCartFeature(context2) {
    const { store: store2, overlay: overlay2, toast: toast2, navigate: navigate2 } = context2;
    function markup() {
      const state = store2.getState();
      const totals = cartTotals(state.cart);
      if (!totals.count) return `<div class="empty-state empty-bag">${icon("bag", 40)}<p class="eyebrow">A little room for good tech</p><h3>Something good<br>belongs in here.</h3><p>Your bag is taking a breather.<br>Let\u2019s find your next everyday favourite.</p><a class="button button-dark" href="#shop">Explore the collection ${icon("arrow-right", 18)}</a></div>`;
      const quote = quoteDelivery(state.location, state.cart);
      return `<div class="cart-body"><p class="cart-intro">Good choices. One step closer.</p><div class="cart-items">${totals.items.map((item) => `<article class="cart-item" data-cart-line="${item.key}"><a class="cart-item-image" href="#product/${item.product.id}">${imageMarkup(item.product.images[0], item.product.name)}</a><div class="cart-item-info"><p class="product-brand">${escapeHTML(item.product.brand)}</p><h3><a href="#product/${item.product.id}">${escapeHTML(item.product.name)}</a></h3><p class="fine-print">${escapeHTML(item.variant.label)} \xB7 ${escapeHTML(item.product.finish)}</p><strong>${money(item.unitPrice)}</strong><div class="cart-item-controls"><div class="quantity-control"><button type="button" data-action="cart-minus" data-key="${item.key}" aria-label="Decrease ${escapeHTML(item.product.name)} quantity" ${item.quantity <= 1 ? "disabled" : ""}>${icon("minus", 14)}</button><span aria-label="Quantity ${item.quantity}">${item.quantity}</span><button type="button" data-action="cart-plus" data-key="${item.key}" aria-label="Increase ${escapeHTML(item.product.name)} quantity" ${productAvailability(state.cart, item.product.id, state.location?.city).remaining === 0 ? "disabled" : ""}>${icon("plus", 14)}</button></div><button type="button" class="remove-item" data-action="cart-remove" data-key="${item.key}">Remove<span class="sr-only"> ${escapeHTML(item.product.name)}</span></button></div></div></article>`).join("")}</div><div class="cart-delivery"><span>${icon("truck", 19)}</span><div><p>${state.location ? escapeHTML(locationLabel(state.location)) : "Good tech is getting closer."}</p><p class="fine-print">${escapeHTML(quote.eligible ? quote.headline : quote.kind === "stock" ? quote.detail : "Choose your area to see the delivery window and fee.")}</p><button class="text-link" type="button" data-action="open-delivery">${state.location ? "Change area" : "Check your area"}</button></div></div><div class="cart-summary"><div><span>Subtotal</span><strong>${money(totals.subtotal)}</strong></div><div><span>Delivery</span><span>${quote.fee !== null ? money(quote.fee) : "Calculated by area"}</span></div>${quote.fee !== null ? `<div class="cart-total"><span>Preview total</span><strong>${money(totals.subtotal + quote.fee)}</strong></div>` : ""}<button class="button button-dark full-width" type="button" data-action="begin-checkout" ${quote.kind === "stock" ? "disabled" : ""}>Try demo checkout ${icon("arrow-right", 18)}</button><p class="fine-print text-center">No payment. No dispatch. Just a preview.</p><button class="text-link continue-shopping" type="button" data-close-overlay>Keep exploring</button></div></div>`;
    }
    function openCart(opener = document.activeElement) {
      overlay2.open({ title: `Your bag (${cartTotals(store2.getState().cart).count})`, kind: "cart", content: markup(), opener, onMount: (root) => {
        const unsubscribe = store2.subscribe(() => {
          const active2 = root.contains(document.activeElement) ? document.activeElement : null;
          const line = active2?.closest("[data-cart-line]");
          const previousKeys = [...root.querySelectorAll("[data-cart-line]")].map((item) => item.dataset.cartLine);
          const focused = active2 ? { action: active2.dataset.action, key: line?.dataset.cartLine, href: active2.getAttribute("href"), index: previousKeys.indexOf(line?.dataset.cartLine) } : null;
          const scrollTop = root.scrollTop;
          root.innerHTML = markup();
          overlay2.setTitle(`Your bag (${cartTotals(store2.getState().cart).count})`);
          root.scrollTop = scrollTop;
          if (!focused) return;
          const enabled = (element) => !element.disabled;
          const controls = [...root.querySelectorAll("[data-action]")];
          let target = controls.find((button) => enabled(button) && button.dataset.action === focused.action && button.dataset.key === focused.key);
          if (!target && focused.href) target = [...root.querySelectorAll("a[href]")].find((link) => link.getAttribute("href") === focused.href);
          const rows = [...root.querySelectorAll("[data-cart-line]")];
          const currentRow = rows.find((item) => item.dataset.cartLine === focused.key);
          if (!target && currentRow) target = [...currentRow.querySelectorAll("button")].find(enabled);
          if (!target && focused.key && rows.length) target = rows[Math.min(Math.max(0, focused.index), rows.length - 1)].querySelector('[data-action="cart-remove"]');
          target || (target = root.querySelector(".empty-bag .button") || root.querySelector("button:not(:disabled), a[href]"));
          target?.focus({ preventScroll: true });
        });
        return unsubscribe;
      } });
    }
    function add(productId, variantId, quantity = 1) {
      const state = store2.getState();
      const result = addToCart(state.cart, productId, variantId, quantity, state.location?.city);
      if (!result.ok) {
        toast2(result.message, "error");
        return false;
      }
      const opener = document.activeElement;
      store2.setCart(result.lines);
      openCart(opener);
      toast2(`${getProduct(productId).name} added to your bag.`);
      return true;
    }
    function update(button, delta) {
      const state = store2.getState();
      const item = cartTotals(state.cart).items.find((item2) => item2.key === button.dataset.key);
      if (!item) return;
      const result = changeQuantity(state.cart, item.key, item.quantity + delta, state.location?.city);
      if (!result.ok) toast2(result.message, "error");
      else store2.setCart(result.lines);
    }
    function remove(button) {
      const result = changeQuantity(store2.getState().cart, button.dataset.key, 0);
      if (result.ok) {
        store2.setCart(result.lines);
        toast2("Item removed from your bag.");
      }
    }
    return { openCart, add, actions: {
      "open-cart": openCart,
      "quick-add": (button) => {
        const product2 = getProduct(button.dataset.product);
        if (product2) add(product2.id, product2.variants[0].id);
      },
      "cart-plus": (button) => update(button, 1),
      "cart-minus": (button) => update(button, -1),
      "cart-remove": remove,
      "begin-checkout": () => {
        if (cartTotals(store2.getState().cart).count) navigate2("#checkout");
      }
    } };
  }

  // src/features/gallery.js
  function createGalleryFeature({ overlay: overlay2 }) {
    function open(product2, initialIndex = 0) {
      let index = Math.max(0, Math.min(initialIndex, product2.images.length - 1));
      const multiple = product2.images.length > 1;
      overlay2.open({ title: `${product2.name}: product photographs`, kind: "gallery", content: `<div class="gallery-lightbox">${multiple ? `<button type="button" class="gallery-arrow gallery-previous icon-button" data-gallery-step="-1" aria-label="Previous photograph">${icon("chevron-left", 30)}</button>` : ""}${imageMarkup(product2.images[index], `${product2.name}, view ${index + 1}`, "gallery-enlarged", true)}${multiple ? `<button type="button" class="gallery-arrow gallery-next icon-button" data-gallery-step="1" aria-label="Next photograph">${icon("chevron-right", 30)}</button>` : ""}<p class="gallery-counter" aria-live="polite">${index + 1} / ${product2.images.length}</p></div>`, onMount: (root) => {
        function step(delta) {
          if (!multiple) return;
          index = (index + delta + product2.images.length) % product2.images.length;
          const image = root.querySelector("img");
          image.src = product2.images[index];
          image.alt = `${product2.name}, view ${index + 1}`;
          root.querySelector(".gallery-counter").textContent = `${index + 1} / ${product2.images.length}`;
        }
        const click = (event) => {
          const button = event.target.closest("[data-gallery-step]");
          if (button) step(Number(button.dataset.galleryStep));
        };
        const key = (event) => {
          if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
            step(event.key === "ArrowLeft" ? -1 : 1);
          }
        };
        root.addEventListener("click", click);
        root.closest("dialog").addEventListener("keydown", key);
        return () => {
          root.removeEventListener("click", click);
          root.closest("dialog")?.removeEventListener("keydown", key);
        };
      } });
    }
    return { open };
  }

  // src/features/product.js
  function createProductFeature(context2) {
    const { store: store2, overlay: overlay2 } = context2;
    const gallery = createGalleryFeature(context2);
    function detailsMarkup(product2, quick = false) {
      const heading = quick ? "h2" : "h1";
      return `<form class="product-config" data-product-config="${product2.id}"><${heading}>${escapeHTML(product2.name)}</${heading}><p class="detail-price" data-price>${money(product2.variants[0].price)}</p><p class="fine-print price-note">Illustrative price. Not a live offer.</p><p class="product-description">${escapeHTML(product2.description)}</p><div class="finish-row"><span>Finish</span><span class="finish-swatch" style="--swatch:${product2.swatch}"></span><strong>${escapeHTML(product2.finish)}</strong></div><fieldset class="variant-fieldset"><legend>${product2.variants.length > 1 ? "Choose your configuration" : "Configuration"}</legend><div class="variant-options">${product2.variants.map((variant, index) => `<label class="variant-chip"><input class="sr-only" type="radio" name="variant" value="${variant.id}" ${index === 0 ? "checked" : ""}><span>${escapeHTML(variant.label)}</span></label>`).join("")}</div></fieldset><div class="product-purchase-row"><div class="quantity-control"><button type="button" data-product-step="-1" aria-label="Decrease quantity" disabled>${icon("minus", 16)}</button><output data-product-quantity aria-live="polite">1</output><button type="button" data-product-step="1" aria-label="Increase quantity">${icon("plus", 16)}</button></div><button type="submit" class="button button-dark" data-product-add>Add to bag ${icon("plus", 19)}</button></div><p class="fine-print product-stock-note" data-product-stock role="status"></p><div class="product-delivery-note">${icon("truck", 19)}<div><p data-product-window>Choose your area for a delivery window.</p><button type="button" class="text-link" data-action="open-delivery">Check or change your area</button></div></div><p class="fine-print detail-preview-note">Working preview. No real orders, payment, or delivery.</p>${quick ? `<a class="inline-link full-details-link" href="#product/${product2.id}">A closer look at the details ${icon("arrow-right", 17)}</a>` : ""}</form>`;
    }
    function mountConfig(root, product2) {
      let variant = product2.variants[0];
      let quantity = 1;
      const form = root.querySelector("form");
      function update() {
        const state = store2.getState();
        const stock = productAvailability(state.cart, product2.id, state.location?.city);
        quantity = Math.min(quantity, Math.max(1, stock.remaining));
        form.querySelector("[data-price]").textContent = money(variant.price);
        form.querySelector("[data-product-quantity]").textContent = quantity;
        form.querySelector('[data-product-step="-1"]').disabled = quantity <= 1;
        form.querySelector('[data-product-step="1"]').disabled = quantity >= stock.remaining;
        const add = form.querySelector("[data-product-add]");
        add.disabled = stock.remaining === 0;
        add.innerHTML = stock.reason === "city" ? "Unavailable" : stock.reason === "bag" ? "Bag at limit" : `Add to bag ${icon("plus", 19)}`;
        const quote = quoteDelivery(state.location, state.cart);
        form.querySelector("[data-product-window]").textContent = stock.reason === "city" ? `No demo stock in ${getCity(state.location.city).label}.` : stock.reason === "bag" ? `Your bag already contains ${stock.inBag}; the preview limit is ${stock.limit}${state.location ? " in this city" : ""}.` : quote.kind === "stock" ? "Adjust your bag to match the sample city stock." : quote.eligible ? quote.headline : "Choose your area for a delivery window.";
        form.querySelector("[data-product-stock]").textContent = stock.inBag && stock.remaining ? `${stock.remaining} more can be added; ${stock.inBag} already in your bag.` : "";
      }
      const change = (event) => {
        if (event.target.name === "variant") {
          variant = product2.variants.find((option) => option.id === event.target.value) || product2.variants[0];
          update();
        }
      };
      const click = (event) => {
        const step = event.target.closest("[data-product-step]");
        if (step) {
          quantity = Math.min(MAX_QUANTITY, Math.max(1, quantity + Number(step.dataset.productStep)));
          update();
        }
      };
      const submit = (event) => {
        event.preventDefault();
        if (!form.querySelector("[data-product-add]").disabled) context2.cart.add(product2.id, variant.id, quantity);
      };
      form.addEventListener("change", change);
      form.addEventListener("click", click);
      form.addEventListener("submit", submit);
      const unsubscribe = store2.subscribe(update);
      update();
      return () => {
        unsubscribe();
        form.removeEventListener("change", change);
        form.removeEventListener("click", click);
        form.removeEventListener("submit", submit);
      };
    }
    function openQuickview(button) {
      const product2 = getProduct(button.dataset.product);
      if (!product2) return;
      overlay2.open({ title: "A closer look.", kind: "quickview", content: `<div class="quickview-layout"><a class="quickview-image" href="#product/${product2.id}" aria-label="View full ${escapeHTML(product2.name)} details">${imageMarkup(product2.images[0], `${product2.name} in ${product2.finish}`, "", true)}</a><div class="quickview-details">${detailsMarkup(product2, true)}</div></div>`, onMount: (root) => mountConfig(root, product2) });
    }
    function mountProduct(root, id) {
      const product2 = getProduct(id);
      if (!product2) return null;
      const related = products.filter((item) => item.category === product2.category && item.id !== product2.id);
      const suggestions = [...related, ...products.filter((item) => item.id !== product2.id && !related.includes(item))].slice(0, 4);
      root.innerHTML = `<section class="container product-page"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="#home">Home</a>${icon("chevron-right", 13)}<a href="#shop/${product2.category}">${escapeHTML(categories.find((category) => category.id === product2.category)?.label)}</a>${icon("chevron-right", 13)}<span>${escapeHTML(product2.name)}</span></nav><div class="product-layout"><div class="product-gallery"><button type="button" class="product-main-image" data-gallery-open aria-label="Enlarge ${escapeHTML(product2.name)} photograph">${imageMarkup(product2.images[0], `${product2.name} in ${product2.finish}`, "", true)}</button><div class="product-thumbnails" role="group" aria-label="Product images">${product2.images.map((src, index) => `<button type="button" data-gallery-index="${index}" aria-label="Show product view ${index + 1}" aria-pressed="${index === 0}" class="${index === 0 ? "is-active" : ""}">${imageMarkup(src, "")}</button>`).join("")}</div><p class="fine-print gallery-caption">Product photography. Lifestyle photographs elsewhere are illustrative.</p></div><div class="product-detail-column">${detailsMarkup(product2)}<div class="product-accordions faq-list"><details open><summary>A little more detail ${icon("plus", 17)}</summary><dl class="spec-list">${product2.specs.map(([label, value]) => `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`).join("")}</dl></details><details><summary>What\u2019s in the box? ${icon("plus", 17)}</summary><p>${escapeHTML(product2.inBox)}</p></details><details><summary>Delivery, returns & the preview ${icon("plus", 17)}</summary><p>Supported Lagos and Abuja areas only. Confirmations between ${policyLabels.betweenWindow} are eligible for a six-hour window, subject to illustrative stock. This is not a live store. <button class="text-link" type="button" data-action="open-promise">Read the delivery conditions.</button></p><p>No actual warranty or returns service is attached to this demo. <button class="text-link" type="button" data-action="open-returns">Read the preview policy.</button></p></details></div></div></div></section><section class="container related-section"><div class="section-heading"><div><p class="eyebrow">Good things go together</p><h2>A little more to love.</h2></div><a class="inline-link" href="#shop">Explore all gadgets ${icon("arrow-right", 18)}</a></div><div class="product-grid">${suggestions.map((item) => productCard(item, { city: store2.getState().location?.city, lines: store2.getState().cart })).join("")}</div></section>`;
      const cleanup = mountConfig(root.querySelector(".product-detail-column"), product2);
      const unsubscribeCards = store2.subscribe((state) => updateProductCards(root.querySelector(".related-section"), state));
      let timer;
      let currentImage = 0;
      const click = (event) => {
        if (event.target.closest("[data-gallery-open]")) {
          gallery.open(product2, currentImage);
          return;
        }
        const button = event.target.closest("[data-gallery-index]");
        if (!button) return;
        const index = Number(button.dataset.galleryIndex);
        currentImage = index;
        const image = root.querySelector(".product-main-image img");
        root.querySelectorAll("[data-gallery-index]").forEach((item) => {
          const active2 = item === button;
          item.classList.toggle("is-active", active2);
          item.setAttribute("aria-pressed", String(active2));
        });
        clearTimeout(timer);
        const replace = () => {
          image.src = product2.images[index];
          image.alt = `${product2.name}, view ${index + 1}, ${product2.finish}`;
          image.classList.remove("is-changing");
        };
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) replace();
        else {
          image.classList.add("is-changing");
          timer = setTimeout(replace, 180);
        }
      };
      root.addEventListener("click", click);
      return () => {
        cleanup();
        unsubscribeCards();
        clearTimeout(timer);
        root.removeEventListener("click", click);
      };
    }
    return { mountProduct, openQuickview, actions: { "open-quickview": openQuickview } };
  }

  // src/features/delivery.js
  var cityOptions = () => DELIVERY_POLICY.cities.map((city) => ({ value: city.id, label: city.label }));
  var areaOptions = (city) => [...(getCity(city)?.areas || []).map((area) => ({ value: area.id, label: area.label })), { value: "outside", label: "Outside the listed areas" }];
  function createDeliveryFeature(context2) {
    const { store: store2, overlay: overlay2, toast: toast2 } = context2;
    function openDelivery() {
      const returnToBag = overlay2.isOpen && document.querySelector("#overlay").dataset.kind === "cart";
      let draft = { ...store2.getState().location || { city: "", area: "" } };
      overlay2.open({ title: "Let\u2019s check your doorstep.", kind: "delivery", content: `<div class="delivery-intro">${icon("pin", 27)}<p class="serif panel-intro">Good tech.<br>Closer than you think.</p><p>Find your area, your sample delivery fee, and your next six-hour window.</p></div><form class="delivery-form" novalidate><div class="field"><label for="delivery-city">Your city</label><div data-city-select></div></div><div class="field"><label for="delivery-area">Your area</label><div data-area-select></div></div><p class="field-error" data-delivery-error role="alert"></p><button class="button button-dark full-width" type="submit">Check my area ${icon("arrow-right", 18)}</button></form><div class="delivery-result" role="region" aria-label="Delivery check result" tabindex="-1" aria-live="polite" hidden></div><div class="panel-note">${icon("clock", 18)}<p>Daily order window: <strong>${policyLabels.orderWindow}.</strong><br>After cutoff, the next six-hour window starts at ${policyLabels.startTime}.</p></div><p class="fine-print demo-footnote">Preview coverage and fees only. This does not check a live courier service or arrange a delivery.</p>`, onMount: (root) => {
        const result = root.querySelector(".delivery-result");
        const error = root.querySelector("[data-delivery-error]");
        let areaSelect;
        function clearResult() {
          result.hidden = true;
          result.innerHTML = "";
          error.textContent = "";
        }
        const citySelect = mountSelect(root.querySelector("[data-city-select]"), { id: "delivery-city", label: "Your city", name: "city", placeholder: "Choose your city", value: draft.city, options: [...cityOptions(), { value: "other", label: "Another city" }], onChange: (value) => {
          draft.city = value;
          draft.area = "";
          areaSelect.setOptions(areaOptions(value));
          areaSelect.button.disabled = false;
          clearResult();
        } });
        areaSelect = mountSelect(root.querySelector("[data-area-select]"), { id: "delivery-area", label: "Your area", name: "area", placeholder: "Choose your area", value: draft.area, options: areaOptions(draft.city), onChange: (value) => {
          draft.area = value;
          clearResult();
        } });
        areaSelect.button.disabled = !draft.city;
        const submit = (event) => {
          event.preventDefault();
          if (!draft.city || !draft.area) {
            error.textContent = "Choose your city and area to continue.";
            (!draft.city ? citySelect.button : areaSelect.button).focus();
            return;
          }
          const quote = quoteDelivery(draft, store2.getState().cart);
          const supported = validLocation(draft);
          result.classList.toggle("is-unsupported", !supported || !quote.eligible);
          result.hidden = false;
          result.innerHTML = `${icon(supported && quote.eligible ? "success" : "alert", 23)}<div><p class="eyebrow">${supported ? escapeHTML(locationLabel(draft)) : "A little further than our preview"}</p><h3>${escapeHTML(quote.headline)}</h3><p>${escapeHTML(quote.detail)}</p>${supported ? `<p class="delivery-fee">Sample delivery fee <strong>${money(quote.fee)}</strong></p><button type="button" class="button button-dark full-width" data-use-area>Use this area ${icon("check", 18)}</button>` : '<p class="fine-print">Try another area. No six-hour promise or checkout is available for an unsupported address.</p>'}</div>`;
          root.scrollTop += result.getBoundingClientRect().top - root.getBoundingClientRect().top - 18;
          result.focus({ preventScroll: true });
        };
        const click = (event) => {
          if (event.target.closest("[data-use-area]") && validLocation(draft)) {
            store2.setLocation(draft);
            if (returnToBag) context2.cart.openCart();
            else overlay2.close();
            toast2(`Your area is set to ${locationLabel(draft)}.`);
          }
        };
        root.querySelector("form").addEventListener("submit", submit);
        root.addEventListener("click", click);
        return () => {
          citySelect.destroy();
          areaSelect.destroy();
          root.removeEventListener("click", click);
        };
      } });
    }
    return { openDelivery, actions: { "open-delivery": openDelivery } };
  }

  // src/domain/checkout.js
  function validateCheckout({ customer = {}, location: location2, lines = [], now = /* @__PURE__ */ new Date() }) {
    const errors = {};
    const clean = Object.fromEntries(["name", "email", "phone", "address", "note"].map((key) => [key, String(customer[key] || "").trim()]));
    if (clean.name.length < 2 || clean.name.length > 80) errors.name = "Enter your full name, between 2 and 80 characters.";
    if (clean.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) errors.email = "Enter a valid email address.";
    const phone = clean.phone.replace(/[\s()\-]/g, "");
    if (!/^(?:\+234|234|0)[789]\d{9}$/.test(phone)) errors.phone = "Use a Nigerian mobile number, such as 08012345678.";
    if (clean.address.length < 10 || clean.address.length > 200) errors.address = "Enter a street address with a house number or landmark, between 10 and 200 characters.";
    if (clean.note.length > 250) errors.note = "Keep your delivery note under 250 characters.";
    if (!cartTotals(lines).count) errors.cart = "Your bag is empty. Add a gadget before checking out.";
    const quote = quoteDelivery(location2, lines, now);
    if (!quote.eligible) errors.location = quote.detail;
    return { valid: Object.keys(errors).length === 0, errors, customer: clean, quote };
  }
  function createDemoSummary({ lines, location: location2, now = /* @__PURE__ */ new Date(), id }) {
    const totals = cartTotals(lines);
    const quote = quoteDelivery(location2, lines, now);
    if (!totals.count || !quote.eligible) throw new Error("A valid bag and delivery area are required.");
    return {
      id,
      createdAt: now.toISOString(),
      location: { city: location2.city, area: location2.area },
      items: totals.items.map((item) => ({ productId: item.productId, variantId: item.variantId, name: item.product.name, option: item.variant.label, quantity: item.quantity, unitPrice: item.unitPrice, lineTotal: item.lineTotal })),
      subtotal: totals.subtotal,
      fee: quote.fee,
      total: totals.subtotal + quote.fee,
      delivery: { kind: quote.kind, headline: quote.headline, startAt: quote.startAt, deadlineAt: quote.deadlineAt },
      demo: true
    };
  }

  // src/features/checkout.js
  var sampleCustomer = { name: "Ada Example", email: "ada@example.com", phone: "08012345678", address: "12 Example Street, near the main gate", note: "" };
  var textField = (name, label, type, value, placeholder, max = 100) => `<div class="field"><label for="checkout-${name}">${label}</label><input id="checkout-${name}" name="${name}" type="${type}" value="${escapeHTML(value || "")}" placeholder="${placeholder}" maxlength="${max}" ${name === "phone" ? 'inputmode="tel"' : ""} aria-describedby="checkout-${name}-error"><p class="field-error" id="checkout-${name}-error"></p></div>`;
  function createCheckoutFeature({ store: store2, navigate: navigate2, toast: toast2 }) {
    function summaryMarkup(location2) {
      const state = store2.getState();
      const totals = cartTotals(state.cart);
      const quote = quoteDelivery(location2, state.cart);
      return `<div class="checkout-summary-header"><h2>Your good choices.</h2><button type="button" class="text-link" data-action="open-cart">Edit bag</button></div>${totals.count ? `<div class="checkout-items">${totals.items.map((item) => `<div class="checkout-item"><div class="checkout-item-image">${imageMarkup(item.product.images[0], item.product.name)}</div><div><h3>${escapeHTML(item.product.name)}</h3><p>${escapeHTML(item.variant.label)} \xB7 Qty ${item.quantity}</p><strong>${money(item.lineTotal)}</strong></div></div>`).join("")}</div>` : `<div class="empty-state compact"><p>Your bag is empty.</p><a class="text-link" href="#shop">Find your everyday favourite</a></div>`}<div class="checkout-totals"><div><span>Subtotal</span><span>${money(totals.subtotal)}</span></div><div><span>Sample delivery</span><span>${quote.fee === null ? "Choose an area" : money(quote.fee)}</span></div><div class="checkout-grand-total"><span>Preview total</span><strong>${money(totals.subtotal + (quote.fee || 0))}</strong></div></div><div class="checkout-window">${icon(quote.eligible ? "truck" : "pin", 20)}<div><strong>${escapeHTML(quote.headline)}</strong><p>${escapeHTML(quote.detail)}</p></div></div><p class="fine-print">All amounts are NGN. Prices, stock, fees, and delivery windows are illustrative. No money will be taken.</p>`;
    }
    function mountCheckout(root) {
      if (!cartTotals(store2.getState().cart).count) {
        root.innerHTML = `<section class="container checkout-empty empty-state">${icon("bag", 42)}<p class="eyebrow">First, a little good tech</p><h1>Your bag is taking a breather.</h1><p>Add an everyday favourite before trying demo checkout.</p><a class="button button-dark" href="#shop">Explore the collection ${icon("arrow-right", 18)}</a></section>`;
        return () => {
        };
      }
      let stage = "delivery";
      let customer = {};
      let locationDraft = { ...store2.getState().location || { city: "", area: "" } };
      let selectCleanup = () => {
      };
      let citySelect;
      let areaSelect;
      let submitting = false;
      let reviewedKind = null;
      let lastLocation = JSON.stringify(store2.getState().location);
      let notice = "";
      let errorsShown = false;
      let errorSignature = "";
      function render() {
        selectCleanup();
        citySelect = null;
        areaSelect = null;
        errorsShown = false;
        errorSignature = "";
        const isReview = stage === "review";
        root.innerHTML = `<section class="container checkout-page"><a class="back-link" href="#shop">${icon("arrow-left", 17)} Back to the good stuff</a><div class="checkout-heading"><p class="eyebrow">A little closer to yours</p><h1>${isReview ? "One last look." : "Your doorstep, please."}</h1><ol class="checkout-progress" aria-label="Demo checkout progress"><li ${!isReview ? 'aria-current="step"' : ""}><span>${isReview ? icon("check", 13) : "01"}</span> Delivery</li><li ${isReview ? 'aria-current="step"' : ""}><span>02</span> Review</li><li><span>03</span> Demo complete</li></ol></div><div class="demo-banner">${icon("alert", 20)}<p><strong>This is a demo checkout.</strong> Use example details. No payment is collected, no real order is placed, and no delivery is arranged.</p></div><p class="checkout-notice" role="status">${escapeHTML(notice)}</p><div class="checkout-layout"><div class="checkout-form-column"><div class="error-summary" role="alert" tabindex="-1" hidden></div>${isReview ? reviewMarkup() : formMarkup()}</div><aside class="checkout-summary" aria-label="Preview order summary" data-checkout-summary>${summaryMarkup(locationDraft)}</aside></div></section>`;
        if (!isReview) mountFormSelects();
        updateSummary();
      }
      function formMarkup() {
        return `<form class="checkout-form" autocomplete="off" novalidate><div class="form-heading"><h2>A few details.</h2><button class="text-link" type="button" data-sample-details>Use example details</button></div><p class="form-description">These stay in this tab and are not included in the saved demo summary.</p>${textField("name", "Full name", "text", customer.name, "Ada Example", 80)}<div class="field-row">${textField("email", "Email address", "email", customer.email, "ada@example.com", 254)}${textField("phone", "Nigerian mobile number", "tel", customer.phone, "08012345678", 20)}</div><h2 class="form-subheading">Where\u2019s it headed?</h2><div class="field-row"><div class="field"><label for="checkout-city">City</label><div data-checkout-city></div></div><div class="field"><label for="checkout-area">Area</label><div data-checkout-area></div></div></div><p class="field-error" id="checkout-location-error"></p>${textField("address", "Street address & landmark", "text", customer.address, "12 Example Street, near the main gate", 200)}<div class="field"><label for="checkout-note">A note for delivery <span class="optional">(optional)</span></label><textarea id="checkout-note" name="note" maxlength="250" rows="3" placeholder="Anything helpful to know?" aria-describedby="checkout-note-error">${escapeHTML(customer.note || "")}</textarea><p class="field-error" id="checkout-note-error"></p></div><button class="button button-dark full-width" type="submit" data-review-order>Review demo order ${icon("arrow-right", 18)}</button><p class="fine-print checkout-form-note">By continuing, you\u2019re trying a local preview, not making a purchase.</p></form>`;
      }
      function reviewMarkup() {
        const quote = quoteDelivery(locationDraft, store2.getState().cart);
        reviewedKind = quote.kind;
        return `<div class="review-details"><div class="form-heading"><h2>Headed to your doorstep.</h2><button type="button" class="text-link" data-edit-delivery>Edit details</button></div><div class="review-address"><strong>${escapeHTML(customer.name)}</strong><p>${escapeHTML(customer.address)}</p><p>${escapeHTML(locationLabel(locationDraft))}</p><p>${escapeHTML(customer.email)}<br>${escapeHTML(customer.phone)}</p>${customer.note ? `<p class="review-note">Note: ${escapeHTML(customer.note)}</p>` : ""}</div><div class="review-payment">${icon("shield", 22)}<div><h3>No payment in this preview.</h3><p>No card details, transfer, or payment provider. The next button creates a demo summary in your browser only.</p></div></div><div class="review-window"><p class="eyebrow">Your illustrative delivery window</p><strong>${escapeHTML(quote.headline)}</strong><p>${escapeHTML(quote.detail)}</p></div><button class="button button-dark full-width" type="button" data-confirm-demo>Confirm demo summary ${icon("check", 18)}</button><p class="fine-print checkout-form-note">Not a real order. Nothing will be charged or dispatched.</p><button class="text-link review-back" type="button" data-edit-delivery>${icon("arrow-left", 15)} Back to delivery details</button></div>`;
      }
      function mountFormSelects() {
        citySelect = mountSelect(root.querySelector("[data-checkout-city]"), { id: "checkout-city", label: "Delivery city", name: "city", placeholder: "Choose city", value: locationDraft.city, options: cityOptions(), onChange: (value) => {
          locationDraft = { city: value, area: "" };
          areaSelect.setOptions(areaOptions(value));
          areaSelect.button.disabled = false;
          updateSummary();
          refreshErrors();
        } });
        areaSelect = mountSelect(root.querySelector("[data-checkout-area]"), { id: "checkout-area", label: "Delivery area", name: "area", placeholder: "Choose area", value: locationDraft.area, options: areaOptions(locationDraft.city), onChange: (value) => {
          locationDraft.area = value;
          if (validLocation(locationDraft)) store2.setLocation(locationDraft);
          updateSummary();
          refreshErrors();
        } });
        areaSelect.button.disabled = !locationDraft.city;
        [citySelect.button, areaSelect.button].forEach((button) => button.setAttribute("aria-describedby", "checkout-location-error"));
        selectCleanup = () => {
          citySelect?.destroy();
          areaSelect?.destroy();
        };
      }
      function updateSummary() {
        const target = root.querySelector("[data-checkout-summary]");
        if (!target) return;
        target.innerHTML = summaryMarkup(locationDraft);
        const state = store2.getState();
        const quote = quoteDelivery(locationDraft, state.cart);
        const count = cartTotals(state.cart).count;
        const confirm = root.querySelector("[data-confirm-demo]");
        if (confirm) confirm.disabled = submitting || !quote.eligible || !count;
        const review = root.querySelector("[data-review-order]");
        if (review) review.disabled = !count;
        const reviewWindow = root.querySelector(".review-window");
        if (reviewWindow) reviewWindow.innerHTML = `<p class="eyebrow">Your illustrative delivery window</p><strong>${escapeHTML(quote.headline)}</strong><p>${escapeHTML(quote.detail)}</p>`;
      }
      function showErrors(errors, focus = true) {
        const signature = JSON.stringify(errors);
        if (!focus && signature === errorSignature) return;
        errorSignature = signature;
        errorsShown = true;
        root.querySelectorAll("[aria-invalid]").forEach((element) => element.removeAttribute("aria-invalid"));
        root.querySelectorAll(".field-error").forEach((element) => {
          element.textContent = "";
        });
        for (const [key, message] of Object.entries(errors)) {
          const field = root.querySelector(`#checkout-${key}`);
          field?.setAttribute("aria-invalid", "true");
          const error = root.querySelector(`#checkout-${key}-error`);
          if (error) error.textContent = message;
          if (key === "location") {
            citySelect?.button.setAttribute("aria-invalid", "true");
            areaSelect?.button.setAttribute("aria-invalid", "true");
          }
        }
        const summary = root.querySelector(".error-summary");
        if (!Object.keys(errors).length) {
          summary.hidden = true;
          summary.replaceChildren();
          return;
        }
        summary.hidden = false;
        summary.innerHTML = `<h2>A few details need a second look.</h2><ul>${Object.entries(errors).map(([key, message]) => `<li><button class="text-link" type="button" data-error-field="${key}">${escapeHTML(message)}</button></li>`).join("")}</ul>`;
        if (focus) summary.focus();
      }
      function refreshErrors() {
        const form = root.querySelector(".checkout-form");
        if (!errorsShown || !form) return;
        const result = validateCheckout({ customer: Object.fromEntries(new FormData(form)), location: locationDraft, lines: store2.getState().cart });
        showErrors(result.errors, false);
      }
      function onSubmit(event) {
        if (!event.target.matches(".checkout-form")) return;
        event.preventDefault();
        customer = Object.fromEntries(new FormData(event.target));
        const result = validateCheckout({ customer, location: locationDraft, lines: store2.getState().cart });
        if (!result.valid) {
          showErrors(result.errors);
          return;
        }
        customer = result.customer;
        store2.setLocation(locationDraft);
        stage = "review";
        notice = "";
        render();
        focusHeading(root);
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      function confirmDemo() {
        if (submitting) return;
        const now = /* @__PURE__ */ new Date();
        const state = store2.getState();
        const validation = validateCheckout({ customer, location: locationDraft, lines: state.cart, now });
        if (!validation.valid) {
          stage = "delivery";
          render();
          showErrors(validation.errors);
          return;
        }
        if (reviewedKind !== validation.quote.kind) {
          notice = "The order window has changed. Please review the updated delivery window and confirm again.";
          render();
          focusHeading(root);
          return;
        }
        submitting = true;
        updateSummary();
        try {
          const suffix = `${Date.now().toString(36).slice(-6)}${Math.random().toString(36).slice(2, 5)}`.toUpperCase();
          const summary = createDemoSummary({ lines: state.cart, location: locationDraft, now, id: `SIX-DEMO-${suffix}` });
          store2.completeDemo(summary);
          customer = {};
          navigate2(`#demo/${summary.id}`);
        } catch {
          submitting = false;
          updateSummary();
          toast2("The demo summary could not be prepared. Please review your bag and try again.", "error");
        }
      }
      function onClick(event) {
        if (event.target.closest("[data-sample-details]")) {
          customer = { ...sampleCustomer };
          for (const [name, value] of Object.entries(customer)) {
            const input = root.querySelector(`[name="${name}"]`);
            if (input) input.value = value;
          }
          refreshErrors();
          root.querySelector("#checkout-name")?.focus();
        }
        if (event.target.closest("[data-edit-delivery]")) {
          stage = "delivery";
          notice = "";
          render();
          focusHeading(root);
        }
        if (event.target.closest("[data-confirm-demo]")) confirmDemo();
        const errorLink = event.target.closest("[data-error-field]");
        if (errorLink) {
          const key = errorLink.dataset.errorField;
          (key === "location" ? citySelect?.button : root.querySelector(`#checkout-${key}`))?.focus();
        }
      }
      root.addEventListener("submit", onSubmit);
      root.addEventListener("click", onClick);
      root.addEventListener("input", refreshErrors);
      const unsubscribe = store2.subscribe((state) => {
        const nextLocation = JSON.stringify(state.location);
        if (nextLocation !== lastLocation) {
          lastLocation = nextLocation;
          locationDraft = { ...state.location || { city: "", area: "" } };
          if (stage === "review" && !submitting) {
            stage = "delivery";
            notice = "Your delivery area changed. Check your street address before reviewing again.";
            render();
          } else if (stage === "delivery") {
            citySelect?.setValue(locationDraft.city);
            areaSelect?.setOptions(areaOptions(locationDraft.city), locationDraft.area);
            if (areaSelect) areaSelect.button.disabled = !locationDraft.city;
          }
        }
        updateSummary();
      });
      render();
      return () => {
        customer = {};
        unsubscribe();
        selectCleanup();
        root.removeEventListener("submit", onSubmit);
        root.removeEventListener("click", onClick);
        root.removeEventListener("input", refreshErrors);
      };
    }
    function mountConfirmation(root, id) {
      const summary = store2.getState().lastDemo;
      if (!summary || summary.id !== id) {
        root.innerHTML = `<section class="container empty-state checkout-empty">${icon("bag", 36)}<h1>That demo isn\u2019t here.</h1><p>This browser has no matching demo summary. No real order has been placed.</p><a class="button button-dark" href="#shop">Explore the collection ${icon("arrow-right", 18)}</a></section>`;
        return () => {
        };
      }
      root.innerHTML = `<section class="container confirmation-page"><div class="confirmation-heading"><span class="confirmation-check">${icon("check", 30)}</span><p class="eyebrow">Demo complete. Not a real order.</p><h1>A little less waiting.<br>A lot of good tech.</h1><p>You\u2019ve tried the sixhours experience. Your demo summary is below.<br><strong>No payment was taken. Nothing will be dispatched.</strong></p><p class="demo-reference">${escapeHTML(summary.id)}</p></div><div class="confirmation-summary"><div class="confirmation-topline"><div><p class="eyebrow">Illustrative delivery area</p><strong>${escapeHTML(locationLabel(summary.location))}</strong></div><div><p class="eyebrow">Illustrative window</p><strong>${escapeHTML(summary.delivery.headline)}</strong></div></div><div class="confirmation-items">${summary.items.map((item) => {
        const product2 = getProduct(item.productId);
        return `<div class="confirmation-item">${product2 ? imageMarkup(product2.images[0], product2.name) : ""}<div><h2>${escapeHTML(item.name)}</h2><p>${escapeHTML(item.option)} \xB7 Qty ${item.quantity}</p></div><strong>${money(item.lineTotal)}</strong></div>`;
      }).join("")}</div><div class="confirmation-total"><div><span>Subtotal</span><span>${money(summary.subtotal)}</span></div><div><span>Sample delivery</span><span>${money(summary.fee)}</span></div><div><strong>Preview total</strong><strong>${money(summary.total)}</strong></div></div></div><p class="fine-print text-center">${store2.getState().storageAvailable ? "This summary is stored in this browser only. It is not a receipt or purchase confirmation." : "Browser storage is blocked. This demo summary is available for this session only."}<br>Your contact details and street address are not saved in it.</p><div class="confirmation-actions"><a class="button button-dark button-lift" href="#shop">Keep exploring ${icon("arrow-right", 18)}</a><button class="inline-link" type="button" data-action="open-promise">Read the six-hour promise ${icon("arrow-up-right", 17)}</button></div></section>`;
      return () => {
      };
    }
    return { mountCheckout, mountConfirmation };
  }

  // src/features/policies.js
  function promiseBody() {
    return `<p class="policy-lead">Six hours. One simple idea: your everyday upgrade shouldn\u2019t keep you waiting.</p><div class="policy-callout">Working design preview only. The coverage, fees, stock, and operating window below are proposed settings, not a verified delivery service.</div><div class="policy-section"><h3>The doorstep comes first.</h3><p>Selected areas in Lagos and Abuja are supported. Choose your area before checkout to see whether the preview can offer a six-hour window.</p><button class="inline-link" type="button" data-action="open-delivery">Check my area ${icon("arrow-right", 17)}</button></div><div class="policy-section"><h3>A clear order window.</h3><p>The proposed order window is daily, ${policyLabels.orderWindow} (West Africa Time). For eligible items confirmed during that window, the six-hour clock begins at confirmation.</p><p>Before ${policyLabels.startTime}, the window starts at ${policyLabels.startTime} that day. At or after ${policyLabels.cutoffTime}, the next window starts at ${policyLabels.startTime} the following day. We never label an after-cutoff order as arriving in six hours from now.</p></div><div class="policy-section"><h3>Available means available in your city.</h3><p>Every item in your bag must have enough illustrative stock in the selected city. If it doesn\u2019t, adjust your bag or change your area before continuing.</p></div><div class="policy-section"><h3>No surprise delivery fees.</h3><p>The sample fee is ${money(DELIVERY_POLICY.cities[0].fee)} in supported Lagos areas and ${money(DELIVERY_POLICY.cities[1].fee)} in supported Abuja areas. Your preview total is shown before confirmation.</p></div><div class="policy-section"><h3>A promise to verify before launch.</h3><p>Real courier coverage, full-address serviceability, live inventory, payment confirmation, dispatch, tracking, exceptions, returns, and remedies for late delivery must be established before this becomes a live store.</p></div>`;
  }
  function createPoliciesFeature({ overlay: overlay2 }) {
    function openPromise() {
      overlay2.open({ title: "The six-hour promise.", kind: "policy", content: `<div class="policy-body">${promiseBody()}</div>` });
    }
    function openReturns() {
      overlay2.open({ title: "Returns & warranty.", kind: "policy", content: `<div class="policy-body"><p class="serif panel-intro">Good to know,<br>before it\u2019s yours.</p><div class="policy-callout">There are no real purchases, warranties, or returns in this HTML preview.</div><div class="policy-section"><h3>What the preview does</h3><p>You can explore products, choose options, build a bag, check an illustrative delivery area, and prepare a demo summary. No purchase contract or dispatch is created.</p></div><div class="policy-section"><h3>Before a real store goes live</h3><p>The retailer must publish the applicable return period, product-condition requirements, warranty coverage, proof-of-purchase requirements, and a working support contact. These depend on the supplier, product, and applicable consumer rights.</p></div><div class="policy-section"><h3>Product compatibility matters.</h3><p>Check your exact device, connector, network model, regional variant, and box contents with the retailer before a real purchase. Sample descriptions here are for browsing and design review.</p></div><button class="inline-link" type="button" data-action="open-help">Back to the help desk ${icon("arrow-right", 17)}</button></div>` });
    }
    function openPrivacy() {
      overlay2.open({ title: "Privacy in this preview.", kind: "policy", content: `<div class="policy-body"><p class="serif panel-intro">Just a preview.<br>Your details stay here.</p><div class="policy-section"><h3>No checkout service is connected.</h3><p>Your checkout inputs are handled in browser memory only. Use example details. This preview does not send them to a server, courier, email provider, or payment processor.</p></div><div class="policy-section"><h3>What the browser remembers</h3><p>Where browser storage is available, this preview remembers your bag, selected area, and last demo summary. That summary contains products, totals, city, and area, not your name, email, phone number, or street address. You can remove this data by clearing this site\u2019s browser storage.</p><p>If storage is blocked, the same interactions work in this tab without cross-reload persistence.</p></div><div class="policy-section"><h3>Local assets. No tracking.</h3><p>Fonts, icons, and photographs are bundled locally. No analytics, advertising, or external requests are added by the storefront.</p></div><div class="policy-section"><h3>Imagery and catalogue</h3><p>Lifestyle photography is AI-generated. Product photographs are sourced from public retailer listings for this design preview. Font and product imagery rights, actual specifications, prices, and inventory must be verified before commercial use.</p></div></div>` });
    }
    function openHelp() {
      overlay2.open({ title: "A little help.", kind: "help", content: `<div class="help-intro"><p class="eyebrow">The sixhours help guide</p><p class="serif panel-intro">Let\u2019s make<br>this easy.</p><p>A few answers, without the wait.</p></div><div class="help-links"><button type="button" data-action="open-delivery">${icon("pin", 22)}<span><strong>Is my area covered?</strong><span>Check your area, fee, and delivery window.</span></span>${icon("arrow-right", 18)}</button><button type="button" data-action="open-promise">${icon("clock", 22)}<span><strong>The six-hour promise</strong><span>How the order window and stock rules work.</span></span>${icon("arrow-right", 18)}</button><button type="button" data-action="open-returns">${icon("package", 22)}<span><strong>Returns & product information</strong><span>Compatibility, box contents, and preview limits.</span></span>${icon("arrow-right", 18)}</button><button type="button" data-action="open-privacy">${icon("shield", 22)}<span><strong>Your details in the preview</strong><span>What is stored and what is never sent.</span></span>${icon("arrow-right", 18)}</button></div><div class="policy-callout">This is a local help guide, not a live chat. No support team or messaging service is connected.</div>` });
    }
    function mountPromise(root) {
      root.innerHTML = `<section class="promise-page-intro"><div class="container"><p class="eyebrow">The six-hour promise</p><h1>Good things don\u2019t<br>have to take forever.</h1><p>The gadgets you want. A little less waiting.</p><button class="button button-dark button-lift" type="button" data-action="open-delivery">Check your doorstep ${icon("pin", 18)}</button></div></section><section class="container policy-page"><div class="policy-page-aside"><p class="promise-page-number">6<span>hours, not days.</span></p><p>Selected areas in<br>Lagos + Abuja.</p><a class="inline-link" href="#shop">Find your everyday upgrade ${icon("arrow-right", 17)}</a></div><div class="policy-body"><h2 class="sr-only">The delivery conditions in detail</h2>${promiseBody()}</div></section>`;
      return () => {
      };
    }
    return { mountPromise, actions: { "open-promise": openPromise, "open-returns": openReturns, "open-privacy": openPrivacy, "open-help": openHelp } };
  }

  // src/features/navigation.js
  var accessories = [
    { label: "Chargers & power", href: "#shop/accessories?q=charger" },
    { label: "Desk accessories", href: "#shop/accessories?q=Magic" },
    { label: "Apple Pencil", href: "#product/apple-pencil-pro" },
    { label: "AirTag", href: "#product/airtag-pack" }
  ];
  var gifting = [
    { label: "Gift items & bundles", href: "#bundles" },
    { label: "The workday edit", href: "#bundle/workday-edit" },
    { label: "Everyday essentials", href: "#bundle/everyday-essentials" }
  ];
  var tree = [
    { label: "Shop", children: [
      { label: "Phones", children: [{ label: "All phones", href: "#shop/phones" }, { label: "iPhone", href: "#shop/phones?q=iPhone" }, { label: "Samsung", href: "#shop/phones?q=Samsung" }] },
      { label: "Laptops", href: "#shop/laptops" },
      { label: "Audio & Sound", href: "#shop/audio" },
      { label: "Tablets", href: "#shop/tablets" },
      { label: "Accessories", children: accessories },
      { label: "Gifting", children: gifting }
    ] },
    { label: "Phones", href: "#shop/phones" },
    { label: "Laptops", href: "#shop/laptops" },
    { label: "Tablets", href: "#shop/tablets" },
    { label: "Accessories", children: accessories },
    { label: "Audio & Sound", href: "#shop/audio" },
    { label: "Gifting", children: gifting }
  ];
  function menuItems(items, nested = false) {
    return `<ul class="${nested ? "menu-sublist" : "menu-links"}">${items.map((item) => {
      if (!item.children) return `<li><a class="menu-row" href="${item.href}">${escapeHTML(item.label)}</a></li>`;
      const id = uniqueId("menu-group");
      return `<li><button type="button" class="menu-row menu-toggle-row" data-menu-toggle aria-expanded="false" aria-controls="${id}">${escapeHTML(item.label)}${icon("chevron-down", 17)}</button><div id="${id}" data-menu-group hidden>${menuItems(item.children, true)}</div></li>`;
    }).join("")}</ul>`;
  }
  function createNavigationFeature({ overlay: overlay2 }) {
    function openMenu() {
      overlay2.open({ title: "Main navigation", kind: "menu", content: `<nav aria-label="Browse the store">${menuItems(tree)}</nav>`, onMount: (root) => {
        root.closest("dialog").querySelector("#overlay-title").innerHTML = '<img src="images/brand/wordmark.svg" alt="Main navigation: sixhours" width="405" height="109">';
        const animations = /* @__PURE__ */ new Map();
        const click = (event) => {
          const button = event.target.closest("[data-menu-toggle]");
          if (!button) return;
          const panel = root.querySelector(`#${button.getAttribute("aria-controls")}`);
          const opening = button.getAttribute("aria-expanded") !== "true";
          const from = panel.hidden ? 0 : panel.getBoundingClientRect().height;
          animations.get(panel)?.cancel();
          button.setAttribute("aria-expanded", String(opening));
          panel.hidden = false;
          const to = opening ? panel.scrollHeight : 0;
          const finish = () => {
            panel.hidden = !opening;
            panel.style.height = "";
            panel.style.overflow = "";
            animations.delete(panel);
          };
          if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
            finish();
            return;
          }
          panel.style.overflow = "hidden";
          const animation = panel.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: 400, easing: "cubic-bezier(.445,.05,.55,.95)" });
          animations.set(panel, animation);
          animation.onfinish = finish;
        };
        root.addEventListener("click", click);
        return () => {
          root.removeEventListener("click", click);
          animations.forEach((animation) => animation.cancel());
        };
      } });
    }
    return { actions: { "open-menu": openMenu } };
  }

  // src/ui/bundle-card.js
  var buttonLabel = (availability) => availability.available ? "View set" : availability.reason === "city" ? "Unavailable" : "Adjust your bag";
  function bundleCard(bundle, { city = null, lines = [] } = {}) {
    const availability = bundleAvailability(lines, bundle.id, city);
    return `<article class="product-card bundle-card" data-bundle-card="${bundle.id}"><div class="product-media"><a class="product-photo" href="#bundle/${bundle.id}" aria-label="Explore ${escapeHTML(bundle.name)}">${imageMarkup(bundle.image, `${bundle.name}, two actual catalogue products`)}</a><button type="button" class="quick-view icon-button" data-action="open-bundle" data-bundle="${bundle.id}" aria-label="Quick view ${escapeHTML(bundle.name)}">${icon("eye", 19)}</button></div><div class="product-info"><h3><a href="#bundle/${bundle.id}">${escapeHTML(bundle.name)}</a></h3>${bundle.sampleStars ? sampleRating() : '<span class="sample-rating is-empty" aria-hidden="true"></span>'}<p class="product-price">${money(bundlePrice(bundle))}</p></div><button type="button" class="card-add" data-action="open-bundle" data-bundle="${bundle.id}" title="${escapeHTML(availability.message)}" ${!availability.available ? "disabled" : ""}>${buttonLabel(availability)}</button></article>`;
  }
  function updateBundleCards(root, state) {
    root.querySelectorAll("[data-bundle-card]").forEach((card2) => {
      const bundle = getBundle(card2.dataset.bundleCard);
      if (!bundle) return;
      const availability = bundleAvailability(state.cart, bundle.id, state.location?.city);
      const button = card2.querySelector(".card-add");
      button.disabled = !availability.available;
      button.textContent = buttonLabel(availability);
      button.title = availability.message;
    });
  }

  // src/features/bundles.js
  function createBundlesFeature(context2) {
    const { store: store2, overlay: overlay2, toast: toast2 } = context2;
    function renderHome() {
      document.querySelector("#home-bundles").innerHTML = bundles.map((bundle) => bundleCard(bundle, { city: store2.getState().location?.city, lines: store2.getState().cart })).join("");
    }
    store2.subscribe((state) => updateBundleCards(document.querySelector("#home-bundles"), state));
    function details(bundle, heading = "h2") {
      const statusId = uniqueId("bundle-availability");
      return `<div class="bundle-details" data-focus-scope><${heading}>${escapeHTML(bundle.name)}</${heading}><p class="bundle-description">${escapeHTML(bundle.description)}</p><ul class="bundle-components">${bundleItems(bundle).map((item) => `<li><a href="#product/${item.product.id}">${escapeHTML(item.product.name)}</a><span>${item.quantity} \xD7 ${escapeHTML(item.variant.label)} \xB7 ${money(item.lineTotal)}</span></li>`).join("")}</ul><p class="bundle-total"><span>Set total</span><strong>${money(bundlePrice(bundle))}</strong></p><button class="button button-dark full-width" type="button" data-action="add-bundle" data-bundle="${bundle.id}" data-bundle-add aria-describedby="${statusId}">Add set to bag ${icon("plus", 19)}</button><p class="fine-print bundle-availability" id="${statusId}" data-bundle-status role="status"></p><p class="fine-print bundle-details-note">Sample prices. The total is the sum of these products; there is no additional discount or separate set inventory. Components are added together or not at all.</p>${bundle.id === "creative-kit" ? '<p class="fine-print bundle-details-note">Apple Pencil Pro requires a compatible iPad. Confirm the exact model and compatibility before a real purchase.</p>' : ""}</div>`;
    }
    function mountAvailability(root, bundle) {
      const update = () => {
        const state = store2.getState();
        const availability = bundleAvailability(state.cart, bundle.id, state.location?.city);
        const button = root.querySelector("[data-bundle-add]");
        button.disabled = !availability.available;
        button.innerHTML = availability.available ? `Add set to bag ${icon("plus", 19)}` : availability.reason === "city" ? "Unavailable in your city" : "Adjust bag quantities";
        root.querySelector("[data-bundle-status]").textContent = availability.message;
      };
      update();
      return store2.subscribe(update);
    }
    function openBundle(button) {
      const bundle = getBundle(button.dataset.bundle);
      if (!bundle) return;
      overlay2.open({ title: "A considered set.", kind: "bundle", content: `<div class="quickview-layout"><a class="quickview-image" href="#bundle/${bundle.id}" aria-label="View full set details">${imageMarkup(bundle.image, bundle.name, "bundle-preview-image", true)}</a><div class="quickview-details">${details(bundle)}</div></div>`, onMount: (root) => mountAvailability(root, bundle) });
    }
    function addBundle(button) {
      const state = store2.getState();
      const result = addBundleToCart(state.cart, button.dataset.bundle, state.location?.city);
      if (!result.ok) {
        toast2(result.message, "error");
        return;
      }
      const opener = document.activeElement;
      store2.setCart(result.lines);
      context2.cart.openCart(opener);
      toast2(`${getBundle(button.dataset.bundle).name} added as its component products.`);
    }
    function mountCollection(root) {
      root.innerHTML = '<section class="shop-intro"><div class="container"><h1>Gift Items &amp; Bundles</h1><p>Thoughtful pairs, made from the actual products in the collection. Sample prices.</p></div></section><section class="merch-container shop-section"><h2 class="sr-only">Gift sets in this collection</h2><div class="product-grid" data-bundle-collection></div></section>';
      const render = () => {
        root.querySelector("[data-bundle-collection]").innerHTML = bundles.map((bundle) => bundleCard(bundle, { city: store2.getState().location?.city, lines: store2.getState().cart })).join("");
      };
      render();
      return store2.subscribe((state) => updateBundleCards(root, state));
    }
    function mountBundle(root, id) {
      const bundle = getBundle(id);
      if (!bundle) return () => {
      };
      root.innerHTML = `<section class="container bundle-page"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="#home">Home</a>${icon("chevron-right", 13)}<a href="#bundles">Gift Items &amp; Bundles</a>${icon("chevron-right", 13)}<span>${escapeHTML(bundle.name)}</span></nav><div class="product-layout"><div class="product-main-image">${imageMarkup(bundle.image, bundle.name, "bundle-preview-image", true)}</div><div>${details(bundle, "h1")}</div></div></section>`;
      return mountAvailability(root, bundle);
    }
    function openBusiness() {
      overlay2.open({ title: "Thoughtful business gifting.", kind: "policy", content: `<div class="business-body"><h3 class="business-lead">Useful tech.<br>A thoughtful gesture.</h3><p>Explore the eight curated sets or build a bag from the individual catalogue products. Every set lists its exact components and sample total before you add it.</p><p>This is a working design preview. Bulk quantities are limited by the same illustrative city stock as individual products. No live quote, customization, corporate account or sales team is connected.</p><a class="button button-dark" href="#bundles">Explore gift sets ${icon("arrow-right", 18)}</a><p><button type="button" class="text-link" data-action="open-delivery">Check the proposed delivery areas and fees</button></p></div>` });
    }
    return { renderHome, mountCollection, mountBundle, actions: { "open-bundle": openBundle, "add-bundle": addBundle, "open-business": openBusiness } };
  }

  // src/features/newsletter.js
  var DISMISSED_KEY = "sixhours:signup-dismissed";
  function mountLocalForm(form, feedback, onValid = () => {
  }) {
    const submit = (event) => {
      event.preventDefault();
      const name = form.elements.namedItem("name");
      const email = form.elements.namedItem("email");
      const nameValid = name.value.trim().length >= 2;
      const emailValid = email.value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
      name.setAttribute("aria-invalid", String(!nameValid));
      email.setAttribute("aria-invalid", String(!emailValid));
      feedback.classList.toggle("is-error", !nameValid || !emailValid);
      if (!nameValid || !emailValid) {
        feedback.textContent = [!nameValid && "Enter a name with at least two characters.", !emailValid && "Enter a valid email address."].filter(Boolean).join(" ");
        (!nameValid ? name : email).focus();
        return;
      }
      feedback.textContent = "Form checks completed locally. Nothing was sent and no subscription was created.";
      onValid();
    };
    const input = (event) => {
      event.target.removeAttribute("aria-invalid");
      feedback.textContent = "";
      feedback.classList.remove("is-error");
    };
    form.addEventListener("submit", submit);
    form.addEventListener("input", input);
    return () => {
      form.removeEventListener("submit", submit);
      form.removeEventListener("input", input);
    };
  }
  function createNewsletterFeature({ overlay: overlay2 }) {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
    }
    let loadTimer;
    let idleTimer;
    const dismiss = () => {
      dismissed = true;
      clearTimeout(loadTimer);
      clearTimeout(idleTimer);
      try {
        sessionStorage.setItem(DISMISSED_KEY, "1");
      } catch {
      }
    };
    const footerForm = document.querySelector("[data-newsletter-form]");
    mountLocalForm(footerForm, document.querySelector("#newsletter-feedback"), dismiss);
    function showPopup() {
      if (dismissed || overlay2.isOpen || document.visibilityState !== "visible" || document.body.dataset.route !== "home" || document.activeElement?.matches("input, textarea")) return;
      overlay2.open({ title: "The Sixhours local form preview", kind: "newsletter", content: `<div class="signup-card"><div class="signup-copy"><h3>Good tech.<br>Less waiting.</h3><p>A little closer to the next everyday favourite.</p><form class="signup-form" novalidate><label class="sr-only" for="signup-name">First name</label><input id="signup-name" name="name" type="text" autocomplete="given-name" maxlength="80" placeholder="First Name" aria-describedby="signup-note signup-feedback"><label class="sr-only" for="signup-email">Email address</label><input id="signup-email" name="email" type="email" autocomplete="email" maxlength="254" placeholder="Enter your email" aria-describedby="signup-note signup-feedback"><p class="signup-note" id="signup-note">Local preview. Nothing is sent and no subscription is created.</p><button class="button button-dark full-width" type="submit">Try the Form</button><p class="signup-feedback" id="signup-feedback" role="status"></p></form></div><img src="images/editorial/audio.jpg" alt="An illustrative listening moment with headphones and an open book" width="896" height="1152"></div>`, onMount: (root) => mountLocalForm(root.querySelector("form"), root.querySelector('[role="status"]'), dismiss), onClose: dismiss });
    }
    let lastActivity = 0;
    const activity = () => {
      if (dismissed || Date.now() - lastActivity < 500) return;
      lastActivity = Date.now();
      clearTimeout(idleTimer);
      idleTimer = setTimeout(showPopup, 9e4);
    };
    if (!dismissed) {
      loadTimer = setTimeout(showPopup, 3e3);
      activity();
      for (const event of ["pointerdown", "pointermove", "keydown", "scroll"]) window.addEventListener(event, activity, { passive: true });
    }
    return { showPopup };
  }

  // src/data/experience-examples.js
  var experienceExamples = [
    { title: "The right configuration", copy: "Choose the configuration that fits.", productId: "iphone-16" },
    { title: "A considered setup", copy: "Useful essentials, without the clutter.", productId: "macbook-air" },
    { title: "The delivery window", copy: "The proposed six-hour window depends on your selected area, available sample stock and confirmation within the daily order window. Check the conditions before continuing. The preview shows the next available window outside those hours, rather than promising six hours from an after-cutoff confirmation.", productId: "airpods-4" },
    { title: "Compatibility matters", copy: "Match the accessory to your exact device and connector. Sample descriptions are not a substitute for confirming a regional model or box contents before a real purchase.", productId: "apple-adapter" },
    { title: "A thoughtful pair", copy: "Every set lists its actual component products and adds them together against the same shared inventory.", productId: "magic-mouse" },
    { title: "A local checkout demo", copy: "Try the complete flow using example details. No payment is taken and no real order is placed.", productId: "jbl-flip-6" }
  ];

  // src/features/experience.js
  function card(example, number) {
    const product2 = getProduct(example.productId);
    return `<article class="review-card" aria-label="Preview guide ${number + 1}, not a customer review"><div class="review-person"><span class="review-avatar" aria-hidden="true">${String(number + 1).padStart(2, "0")}</span><div><strong>${escapeHTML(example.title)}</strong><p>Preview guide</p></div></div><div class="review-rating">${sampleRating({ large: true })}</div><p class="review-content">${escapeHTML(example.copy)}</p><p class="review-meta">Illustrative, not customer feedback.</p><a class="review-product" href="#product/${product2.id}">${imageMarkup(product2.images[0], "")}<span>${escapeHTML(product2.name)}</span></a></article>`;
  }
  function mountExperienceCarousel() {
    const root = document.querySelector("[data-review-carousel]");
    const track = root.querySelector(".reviews-track");
    const viewport = root.querySelector(".reviews-window");
    const dots = root.querySelector("[data-review-dots]");
    const status = root.querySelector("[data-review-status]");
    const padding = 3;
    let visible = 3;
    let index = padding;
    let moving = false;
    let timer;
    let swipeStart;
    let suppressClickUntil = 0;
    let lastWidth = 0;
    const normalize = (value) => (value + experienceExamples.length) % experienceExamples.length;
    const current = () => normalize(index - padding);
    const count = () => innerWidth <= 650 ? 1 : innerWidth <= 800 ? 2 : 3;
    function updateAccessibility() {
      const focusedCard = document.activeElement?.closest(".review-card");
      [...track.children].forEach((element, position2) => {
        const active2 = position2 >= index && position2 < index + visible;
        element.inert = !active2;
        element.setAttribute("aria-hidden", String(!active2));
      });
      [...dots.children].forEach((button, position2) => button.setAttribute("aria-pressed", String(position2 === current())));
      if (focusedCard && track.contains(focusedCard) && focusedCard.inert) dots.children[current()]?.focus({ preventScroll: true });
      status.textContent = `Preview example ${current() + 1} of ${experienceExamples.length}. These are not customer reviews.`;
    }
    function position(animate = true) {
      const first = track.firstElementChild;
      if (!first || !viewport.clientWidth) return;
      const step = first.getBoundingClientRect().width + 20;
      track.style.transition = animate ? "" : "none";
      track.style.transform = `translateX(${-index * step}px)`;
      if (!animate) {
        track.getBoundingClientRect();
        track.style.transition = "";
      }
      updateAccessibility();
    }
    function finish() {
      clearTimeout(timer);
      moving = false;
      if (index >= experienceExamples.length + padding) index -= experienceExamples.length;
      else if (index < padding) index += experienceExamples.length;
      position(false);
    }
    function move(delta) {
      if (moving || delta === 0) return;
      index += delta;
      moving = true;
      position(true);
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) finish();
      else timer = setTimeout(finish, 500);
    }
    const ordered = [...experienceExamples.slice(-padding), ...experienceExamples, ...experienceExamples.slice(0, padding)];
    track.innerHTML = ordered.map((example, offset) => card(example, normalize(offset - padding))).join("");
    dots.innerHTML = experienceExamples.map((_, offset) => `<button type="button" data-review-index="${offset}" aria-label="Show preview example ${offset + 1} of ${experienceExamples.length}" aria-pressed="${offset === 0}"></button>`).join("");
    function refresh() {
      const width = viewport.clientWidth;
      if (!width || width === lastWidth && visible === count()) return;
      clearTimeout(timer);
      moving = false;
      const selected = current();
      visible = count();
      index = padding + selected;
      lastWidth = width;
      position(false);
    }
    root.addEventListener("click", (event) => {
      const button = event.target.closest("[data-review-step]");
      if (button) move(Number(button.dataset.reviewStep));
      const dot = event.target.closest("[data-review-index]");
      if (dot && !moving) move(Number(dot.dataset.reviewIndex) - current());
    });
    root.addEventListener("click", (event) => {
      if (Date.now() < suppressClickUntil && event.target.closest(".review-product")) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);
    viewport.addEventListener("pointerdown", (event) => {
      swipeStart = { x: event.clientX, id: event.pointerId };
    });
    window.addEventListener("pointerup", (event) => {
      if (!swipeStart || swipeStart.id !== event.pointerId) return;
      const distance = event.clientX - swipeStart.x;
      swipeStart = null;
      if (Math.abs(distance) > 45) {
        suppressClickUntil = Date.now() + 250;
        move(distance < 0 ? 1 : -1);
      }
    });
    window.addEventListener("pointercancel", () => {
      swipeStart = null;
    });
    window.addEventListener("resize", refresh);
    refresh();
    return { refresh };
  }

  // src/features/information.js
  function mountInformation() {
    const secondary = document.querySelector("[data-information-open-wide]");
    const media = matchMedia("(min-width: 768px)");
    const update = () => {
      secondary.open = media.matches;
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }

  // src/app.js
  hydrateIcons();
  document.querySelectorAll("[data-policy]").forEach((element) => {
    if (policyLabels[element.dataset.policy]) element.textContent = policyLabels[element.dataset.policy];
  });
  var store = createStore();
  var overlay = createOverlay();
  var navigationState = createNavigationState();
  var toast = createToast();
  var home = document.querySelector("#home-view");
  var routeRoot = document.querySelector("#route-view");
  var routeCleanup = () => {
  };
  var initial = true;
  function navigate(hash) {
    navigationState.capture();
    overlay.close({ immediate: true, restoreFocus: false });
    if (location.hash === hash || navigationState.push(hash)) renderRoute();
  }
  var context = { store, overlay, toast, navigate };
  var catalog = createCatalogFeature(context);
  var cart = createCartFeature(context);
  context.cart = cart;
  var search = createSearchFeature(context);
  var product = createProductFeature(context);
  var delivery = createDeliveryFeature(context);
  var checkout = createCheckoutFeature(context);
  var policies = createPoliciesFeature(context);
  var navigation = createNavigationFeature(context);
  var bundles2 = createBundlesFeature(context);
  var experience = mountExperienceCarousel();
  mountInformation();
  var actions = {
    ...catalog.actions,
    ...cart.actions,
    ...search.actions,
    ...product.actions,
    ...delivery.actions,
    ...policies.actions,
    ...navigation.actions,
    ...bundles2.actions,
    "back-to-top": () => window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })
  };
  function updateHeader(state) {
    const count = cartTotals(state.cart).count;
    document.querySelectorAll("[data-bag-count]").forEach((element) => {
      element.textContent = count;
      element.hidden = count === 0;
    });
    document.querySelector(".bag-button").setAttribute("aria-label", `Open bag, ${count} ${count === 1 ? "item" : "items"}`);
    document.querySelectorAll("[data-location-label]").forEach((element) => {
      element.textContent = locationLabel(state.location);
    });
  }
  store.subscribe(updateHeader);
  updateHeader(store.getState());
  function notFound() {
    routeRoot.innerHTML = `<section class="container empty-state not-found">${icon("search", 36)}<h1>That page isn\u2019t here.</h1><p>Explore the gadget collection or choose a gift set.</p><a class="button button-dark" href="#shop">Shop everyday tech ${icon("arrow-right", 18)}</a></section>`;
  }
  function renderRoute() {
    const snapshot = navigationState.arrive();
    toast.clear();
    overlay.close({ immediate: true, restoreFocus: false });
    routeCleanup();
    routeCleanup = () => {
    };
    routeRoot.replaceChildren();
    const hash = location.hash.slice(1) || "home";
    const [rawPath, queryString = ""] = hash.split("?");
    const parts = rawPath.split("/");
    const page = parts[0];
    const params = new URLSearchParams(queryString);
    const isHome = page === "home" || page === "main";
    home.hidden = !isHome;
    routeRoot.hidden = isHome;
    document.body.dataset.route = isHome ? "home" : page;
    if (isHome) {
      document.title = "sixhours | Everyday tech. Less waiting.";
      requestAnimationFrame(experience.refresh);
    } else if (page === "shop" && parts.length <= 2) {
      document.title = "The collection | sixhours";
      routeCleanup = catalog.mountShop(routeRoot, { category: parts[1] || "all", query: (params.get("q") || "").slice(0, 100), sort: params.get("sort"), maxPrice: params.get("maxPrice") });
    } else if (page === "product" && parts.length === 2 && getProduct(parts[1])) {
      document.title = `${getProduct(parts[1]).name} | sixhours`;
      routeCleanup = product.mountProduct(routeRoot, parts[1]);
    } else if (page === "bundles" && parts.length === 1) {
      document.title = "Gift Items & Bundles | sixhours";
      routeCleanup = bundles2.mountCollection(routeRoot);
    } else if (page === "bundle" && parts.length === 2 && getBundle(parts[1])) {
      document.title = `${getBundle(parts[1]).name} | sixhours`;
      routeCleanup = bundles2.mountBundle(routeRoot, parts[1]);
    } else if (page === "checkout" && parts.length === 1) {
      document.title = "Demo checkout | sixhours";
      routeCleanup = checkout.mountCheckout(routeRoot);
    } else if (page === "demo" && parts.length === 2) {
      document.title = "Your demo summary | sixhours";
      routeCleanup = checkout.mountConfirmation(routeRoot, parts[1]);
    } else if (page === "promise" && parts.length === 1) {
      document.title = "The six-hour promise | sixhours";
      routeCleanup = policies.mountPromise(routeRoot);
    } else {
      document.title = "Page not found | sixhours";
      notFound();
    }
    document.querySelectorAll(".primary-nav [aria-current]").forEach((element) => element.removeAttribute("aria-current"));
    [...document.querySelectorAll(".primary-nav a")].find((link) => link.getAttribute("href") === `#${rawPath}`)?.setAttribute("aria-current", "page");
    if (!initial && !navigationState.restore(document.body, snapshot)) {
      window.scrollTo({ top: 0, behavior: "instant" });
      focusHeading(isHome ? home : routeRoot);
    }
    initial = false;
  }
  document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]");
    if (action && !action.disabled) {
      const handler = actions[action.dataset.action];
      if (handler) {
        event.preventDefault();
        handler(action, event);
      }
      return;
    }
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.getAttribute("href") === "#main") {
      event.preventDefault();
      document.querySelector("#main").setAttribute("tabindex", "-1");
      document.querySelector("#main").focus();
      return;
    }
    event.preventDefault();
    navigate(link.getAttribute("href"));
  });
  window.addEventListener("hashchange", renderRoute);
  window.addEventListener("scroll", () => {
    document.querySelector(".back-to-top").hidden = window.scrollY < 700;
  }, { passive: true });
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      search.openSearch();
    }
  });
  document.addEventListener("error", (event) => {
    if (!(event.target instanceof HTMLImageElement)) return;
    const image = event.target;
    if (image.classList.contains("product-alternate")) {
      image.parentElement.classList.remove("has-alternate");
      image.remove();
      return;
    }
    image.hidden = true;
    if (!image.parentElement.querySelector(".image-fallback")) {
      const fallback = document.createElement("span");
      fallback.className = "image-fallback";
      fallback.textContent = "Image unavailable";
      image.parentElement.append(fallback);
    }
  }, true);
  document.querySelector("#year").textContent = (/* @__PURE__ */ new Date()).getFullYear();
  catalog.renderHome();
  bundles2.renderHome();
  renderRoute();
  createNewsletterFeature(context);
  document.documentElement.dataset.ready = "true";
})();
/*! Bundled license information:

lucide/dist/esm/defaultAttributes.mjs:
lucide/dist/esm/createElement.mjs:
lucide/dist/esm/icons/arrow-left.mjs:
lucide/dist/esm/icons/arrow-right.mjs:
lucide/dist/esm/icons/arrow-up-right.mjs:
lucide/dist/esm/icons/arrow-up.mjs:
lucide/dist/esm/icons/check.mjs:
lucide/dist/esm/icons/chevron-down.mjs:
lucide/dist/esm/icons/chevron-left.mjs:
lucide/dist/esm/icons/chevron-right.mjs:
lucide/dist/esm/icons/circle-check.mjs:
lucide/dist/esm/icons/circle-exclamation-point.mjs:
lucide/dist/esm/icons/clock-3.mjs:
lucide/dist/esm/icons/copy.mjs:
lucide/dist/esm/icons/eye.mjs:
lucide/dist/esm/icons/map-pin.mjs:
lucide/dist/esm/icons/menu.mjs:
lucide/dist/esm/icons/message-circle.mjs:
lucide/dist/esm/icons/minus.mjs:
lucide/dist/esm/icons/package-check.mjs:
lucide/dist/esm/icons/plus.mjs:
lucide/dist/esm/icons/rotate-ccw.mjs:
lucide/dist/esm/icons/search.mjs:
lucide/dist/esm/icons/shield-check.mjs:
lucide/dist/esm/icons/shopping-bag.mjs:
lucide/dist/esm/icons/sliders-horizontal.mjs:
lucide/dist/esm/icons/star.mjs:
lucide/dist/esm/icons/trash.mjs:
lucide/dist/esm/icons/truck.mjs:
lucide/dist/esm/icons/x.mjs:
lucide/dist/esm/lucide.mjs:
  (**
   * @license lucide v1.70.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
