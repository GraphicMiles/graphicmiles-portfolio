/* ==========================================================================
   data.js — the store catalogue, transcribed from the reference site
   ========================================================================== */
(function () {
  'use strict';

  var IMG = 'assets/img/';

  var products = [
    {
      handle: 'tatum-5-orbit-copy',
      title: 'Air Jordan 12 Retro',
      price: 149,
      type: 'shoe',
      option: 'Shoe size',
      sizes: ['40', '41', '42', '43', '44', '45', '46'],
      media: ['2.webp', '7.webp', '8.webp', '9.webp'],
      card: '2.webp',
      tag: true
    },
    {
      handle: 'blazzer',
      title: 'Blazzer',
      price: 199,
      type: 'apparel',
      option: 'Size',
      sizes: ['S', 'L', 'M', 'XL'],
      media: ['2610071514560224.webp', '2610071515248388.webp', '2610071514492742.webp'],
      card: '2610071514560224.webp'
    },
    {
      handle: 'hoodie',
      title: 'Hoodie',
      price: 199,
      type: 'apparel',
      option: 'Size',
      sizes: ['S', 'L', 'M', 'XL'],
      media: ['2610071514403809.webp', '2610071514447647.webp', '2610071514388245.webp'],
      card: '2610071514403809.webp'
    },
    {
      handle: 'hoodie-black',
      title: 'Hoodie Black',
      price: 199,
      type: 'apparel',
      option: 'Size',
      sizes: ['S', 'L', 'M', 'XL'],
      media: ['2610071101472773.webp', '2610071101516777.webp', '2610071101430110.webp'],
      card: '2610071101472773.webp'
    },
    {
      handle: 'air-jordan-12-retro-copy',
      title: 'Luka 5',
      price: 149,
      type: 'shoe',
      option: 'Shoe size',
      sizes: ['40', '41', '42', '43', '44', '45', '46'],
      media: ['4.webp', '2.webp', '7.webp', '8.webp'],
      card: '4.webp'
    },
    {
      handle: 'sweatshirt',
      title: 'Sweatshirt',
      price: 199,
      type: 'apparel',
      option: 'Size',
      sizes: ['S', 'L', 'M', 'XL'],
      media: ['2610071517318112.webp', '2610071517384792.webp', '2610071517292954.webp'],
      card: '2610071517318112.webp'
    },
    {
      handle: 'sweatshirt-plus',
      title: 'Sweatshirt Plus',
      price: 199,
      type: 'apparel',
      option: 'Size',
      sizes: ['S', 'L', 'M', 'XL'],
      media: ['2610071516592552.webp', '2610071517049148.webp', '2610071517017451.webp'],
      card: '2610071516592552.webp'
    },
    {
      handle: 'tatum-5-orbit',
      title: 'Tatum 5 Orbit',
      price: 149,
      type: 'shoe',
      option: 'Shoe size',
      sizes: ['40', '41', '42', '43', '44', '45', '46'],
      media: ['1.webp', '7.webp', '8.webp', '9.webp'],
      card: '1.webp'
    },
    {
      handle: 'tshirt',
      title: 'Tshirt',
      price: 199,
      type: 'apparel',
      option: 'Size',
      sizes: ['S', 'L', 'M', 'XL'],
      media: ['2610071515314737.webp', '2610071516549024.webp', '2610071515554298.webp'],
      card: '2610071515314737.webp'
    }
  ];

  /* rail pieces: 3 views each (side / front / back) — side is the widest shot */
  var railPieces = [
    {
      handle: 'hoodie-black',
      title: 'Hoodie Black',
      price: 199,
      views: ['2610071101516777.webp', '2610071101472773.webp', '2610071101430110.webp']
    },
    {
      handle: 'blazzer',
      title: 'Blazzer',
      price: 199,
      views: ['2610071515248388.webp', '2610071514560224.webp', '2610071514492742.webp']
    },
    {
      handle: 'hoodie',
      title: 'Hoodie',
      price: 199,
      views: ['2610071514447647.webp', '2610071514403809.webp', '2610071514388245.webp']
    },
    {
      handle: 'sweatshirt',
      title: 'Sweatshirt',
      price: 199,
      views: ['2610071517384792.webp', '2610071517318112.webp', '2610071517292954.webp']
    },
    {
      handle: 'sweatshirt-plus',
      title: 'Sweatshirt Plus',
      price: 199,
      views: ['2610071517049148.webp', '2610071516592552.webp', '2610071517017451.webp']
    },
    {
      handle: 'tshirt',
      title: 'Tshirt',
      price: 199,
      views: ['2610071516549024.webp', '2610071515314737.webp', '2610071515554298.webp']
    }
  ];

  /* hero rail: widths and rest angles measured from the reference at h=320px
     (116 / 101 / 94 / 84 / 111 / 87 px wide, swing -1.70 / 2.53 / -3.49 /
     3.58 / -3.08 / 1.53 deg) */
  var heroPieces = [
    { handle: 'blazzer', title: 'Blazzer', price: 199, w: 116 / 320, sw: -1.70, views: ['2610071515248388.webp', '2610071514560224.webp', '2610071514492742.webp'] },
    { handle: 'hoodie', title: 'Hoodie', price: 199, w: 101 / 320, sw: 2.53, views: ['2610071514447647.webp', '2610071514403809.webp', '2610071514388245.webp'] },
    { handle: 'hoodie-black', title: 'Hoodie Black', price: 199, w: 94 / 320, sw: -3.49, views: ['2610071101516777.webp', '2610071101472773.webp', '2610071101430110.webp'] },
    { handle: 'sweatshirt', title: 'Sweatshirt', price: 199, w: 84 / 320, sw: 3.58, views: ['2610071517384792.webp', '2610071517318112.webp', '2610071517292954.webp'] },
    { handle: 'sweatshirt-plus', title: 'Sweatshirt Plus', price: 199, w: 111 / 320, sw: -3.08, views: ['2610071517049148.webp', '2610071516592552.webp', '2610071517017451.webp'] },
    { handle: 'tshirt', title: 'Tshirt', price: 199, w: 87 / 320, sw: 1.53, views: ['2610071516549024.webp', '2610071515314737.webp', '2610071515554298.webp'] }
  ];

  /* /pages/scene-rail uses the theme's deeper 15-piece arrangement
     (catenary sag 70px, mixed repeats) — separate from the home rail. */
  var railPiecesDeep = [
    { handle: 'blazzer', title: 'Blazzer', price: 199, w: 116 / 320, sw: -1.70, views: ['2610071515248388.webp', '2610071514560224.webp', ''] },
    { handle: 'hoodie', title: 'Hoodie', price: 199, w: 101 / 320, sw: 2.53, views: ['2610071514447647.webp', '2610071514403809.webp', ''] },
    { handle: 'hoodie-black', title: 'Hoodie Black', price: 199, w: 94 / 320, sw: -3.49, views: ['2610071101516777.webp', '2610071101472773.webp', ''] },
    { handle: 'sweatshirt', title: 'Sweatshirt', price: 199, w: 84 / 320, sw: 3.58, views: ['2610071517384792.webp', '2610071517318112.webp', ''] },
    { handle: 'sweatshirt-plus', title: 'Sweatshirt Plus', price: 199, w: 111 / 320, sw: -3.08, views: ['2610071517049148.webp', '2610071516592552.webp', ''] },
    { handle: 'tshirt', title: 'Tshirt', price: 199, w: 87 / 320, sw: 1.53, views: ['2610071516549024.webp', '2610071515314737.webp', ''] },
    { handle: 'hoodie', title: 'Hoodie', price: 199, w: 101 / 320, sw: 2.53, views: ['2610071514447647.webp', '2610071514403809.webp', ''] },
    { handle: 'blazzer', title: 'Blazzer', price: 199, w: 116 / 320, sw: -1.70, views: ['2610071515248388.webp', '2610071514560224.webp', ''] },
    { handle: 'hoodie', title: 'Hoodie', price: 199, w: 101 / 320, sw: 2.53, views: ['2610071514447647.webp', '2610071514403809.webp', ''] },
    { handle: 'sweatshirt', title: 'Sweatshirt', price: 199, w: 84 / 320, sw: 3.58, views: ['2610071517384792.webp', '2610071517318112.webp', ''] },
    { handle: 'blazzer', title: 'Blazzer', price: 199, w: 116 / 320, sw: -1.70, views: ['2610071515248388.webp', '2610071514560224.webp', ''] },
    { handle: 'sweatshirt-plus', title: 'Sweatshirt Plus', price: 199, w: 111 / 320, sw: -3.08, views: ['2610071517049148.webp', '2610071516592552.webp', ''] },
    { handle: 'hoodie', title: 'Hoodie', price: 199, w: 101 / 320, sw: 2.53, views: ['2610071514447647.webp', '2610071514403809.webp', ''] },
    { handle: 'blazzer', title: 'Blazzer', price: 199, w: 116 / 320, sw: -1.70, views: ['2610071515248388.webp', '2610071514560224.webp', ''] },
    { handle: 'sweatshirt-plus', title: 'Sweatshirt Plus', price: 199, w: 111 / 320, sw: -3.08, views: ['2610071517049148.webp', '2610071516592552.webp', ''] }
  ];

  /* bags rail (4 pieces, photographs of bags on hangers) */
  var bagPieces = [
    { handle: 'hoodie-black', title: 'Hoodie Black', price: 199, views: ['Untitled_design_-_25.webp', 'Untitled_design_-_20.webp', ''] },
    { handle: 'blazzer', title: 'Blazzer', price: 199, views: ['Untitled_design_-_23.webp', 'Untitled_design_-_22.webp', ''] },
    { handle: 'hoodie', title: 'Hoodie', price: 199, views: ['Untitled_design_-_24.webp', 'Untitled_design_-_14.webp', ''] },
    { handle: 'sweatshirt', title: 'Sweatshirt', price: 199, views: ['Untitled_design_2.webp', 'Untitled_design_-_17.webp', ''] }
  ];

  /* runway looks */
  var looks = [
    {
      name: 'The City Edit',
      image: '1.webp',
      items: [
        { handle: 'tatum-5-orbit-copy', title: 'Air Jordan 12 Retro', price: 149, type: 'shoe' },
        { handle: 'tshirt', title: 'Tshirt', price: 199, type: 'apparel' },
        { handle: 'sweatshirt', title: 'Sweatshirt', price: 199, type: 'apparel' }
      ]
    },
    {
      name: 'Gallery Opening',
      image: '5.webp',
      items: [
        { handle: 'tatum-5-orbit', title: 'Tatum 5 Orbit', price: 149, type: 'shoe' },
        { handle: 'hoodie-black', title: 'Hoodie Black', price: 199, type: 'apparel' },
        { handle: 'tshirt', title: 'Tshirt', price: 199, type: 'apparel' }
      ]
    },
    {
      name: 'Gallery Opening',
      image: '4.webp',
      items: [
        { handle: 'sweatshirt-plus', title: 'Sweatshirt Plus', price: 199, type: 'apparel' },
        { handle: 'tatum-5-orbit', title: 'Tatum 5 Orbit', price: 149, type: 'shoe' },
        { handle: 'tshirt', title: 'Tshirt', price: 199, type: 'apparel' }
      ]
    },
    {
      name: 'Studio Day',
      image: '6.webp',
      items: [
        { handle: 'hoodie-black', title: 'Hoodie Black', price: 199, type: 'apparel' },
        { handle: 'tatum-5-orbit-copy', title: 'Air Jordan 12 Retro', price: 149, type: 'shoe' },
        { handle: 'tshirt', title: 'Tshirt', price: 199, type: 'apparel' }
      ]
    },
    {
      name: 'Studio Day',
      image: '3.webp',
      items: [
        { handle: 'sweatshirt', title: 'Sweatshirt', price: 199, type: 'apparel' },
        { handle: 'tatum-5-orbit', title: 'Tatum 5 Orbit', price: 149, type: 'shoe' },
        { handle: 'tshirt', title: 'Tshirt', price: 199, type: 'apparel' }
      ]
    },
    {
      name: 'Studio Day',
      image: '2.webp',
      items: [
        { handle: 'hoodie', title: 'Hoodie', price: 199, type: 'apparel' },
        { handle: 'air-jordan-12-retro-copy', title: 'Luka 5', price: 149, type: 'shoe' },
        { handle: 'tshirt', title: 'Tshirt', price: 199, type: 'apparel' }
      ]
    }
  ];

  /* orbit shoes: 7 slots, 3 products alternating */
  var orbitShoes = [
    { handle: 'tatum-5-orbit-copy', title: 'Air Jordan 12 Retro', price: 149, img: '1_a7f51336-93eb-4078-b6c2-e14b721eaad0.webp' },
    { handle: 'air-jordan-12-retro-copy', title: 'Luka 5', price: 149, img: '3_601e6b64-4e5b-4031-98cc-f63701e92f66.webp' },
    { handle: 'tatum-5-orbit', title: 'Tatum 5 Orbit', price: 149, img: '2_a571db77-d4b0-4689-8bd8-434c8e97bc65.webp' },
    { handle: 'tatum-5-orbit-copy', title: 'Air Jordan 12 Retro', price: 149, img: '8_63fc2d79-acc2-4d8d-98c0-416f1c055cff.webp' },
    { handle: 'air-jordan-12-retro-copy', title: 'Luka 5', price: 149, img: '4_7cbe61bc-b2b9-4f84-a58f-b9704d1996da.webp' },
    { handle: 'tatum-5-orbit', title: 'Tatum 5 Orbit', price: 149, img: '7_5273163c-5745-4e20-b9ad-09e0bbaa9ecd.webp' },
    { handle: 'tatum-5-orbit-copy', title: 'Air Jordan 12 Retro', price: 149, img: '9_427d191d-5859-4a5e-9cfc-f4283fa83ea3.webp' }
  ];

  /* atelier: 17 cells (repeating 3 products with different cutouts) */
  var atelier = [
    { handle: 'tatum-5-orbit-copy', title: 'Air Jordan 12 Retro', price: 149, img: '9_427d191d-5859-4a5e-9cfc-f4283fa83ea3.webp' },
    { handle: 'tatum-5-orbit', title: 'Tatum 5 Orbit', price: 149, img: '6_2d2695d5-ce04-47f3-af60-4f2a67b83f39.webp' },
    { handle: 'air-jordan-12-retro-copy', title: 'Luka 5', price: 149, img: '8_63fc2d79-acc2-4d8d-98c0-416f1c055cff.webp' },
    { handle: 'tatum-5-orbit-copy', title: 'Air Jordan 12 Retro', price: 149, img: '2_a571db77-d4b0-4689-8bd8-434c8e97bc65.webp' },
    { handle: 'tatum-5-orbit', title: 'Tatum 5 Orbit', price: 149, img: '3_601e6b64-4e5b-4031-98cc-f63701e92f66.webp' },
    { handle: 'air-jordan-12-retro-copy', title: 'Luka 5', price: 149, img: '1_a7f51336-93eb-4078-b6c2-e14b721eaad0.webp' },
    { handle: 'tatum-5-orbit-copy', title: 'Air Jordan 12 Retro', price: 149, img: '6_2d2695d5-ce04-47f3-af60-4f2a67b83f39.webp' },
    { handle: 'tatum-5-orbit', title: 'Tatum 5 Orbit', price: 149, img: '4_7cbe61bc-b2b9-4f84-a58f-b9704d1996da.webp' },
    { handle: 'air-jordan-12-retro-copy', title: 'Luka 5', price: 149, img: '1_a7f51336-93eb-4078-b6c2-e14b721eaad0.webp' },
    { handle: 'tatum-5-orbit', title: 'Tatum 5 Orbit', price: 149, img: '7_5273163c-5745-4e20-b9ad-09e0bbaa9ecd.webp' },
    { handle: 'tatum-5-orbit-copy', title: 'Air Jordan 12 Retro', price: 149, img: '9_427d191d-5859-4a5e-9cfc-f4283fa83ea3.webp' },
    { handle: 'tatum-5-orbit', title: 'Tatum 5 Orbit', price: 149, img: '6_2d2695d5-ce04-47f3-af60-4f2a67b83f39.webp' },
    { handle: 'air-jordan-12-retro-copy', title: 'Luka 5', price: 149, img: '8_63fc2d79-acc2-4d8d-98c0-416f1c055cff.webp' },
    { handle: 'tatum-5-orbit-copy', title: 'Air Jordan 12 Retro', price: 149, img: '2_a571db77-d4b0-4689-8bd8-434c8e97bc65.webp' },
    { handle: 'tatum-5-orbit', title: 'Tatum 5 Orbit', price: 149, img: '4_7cbe61bc-b2b9-4f84-a58f-b9704d1996da.webp' },
    { handle: 'tatum-5-orbit-copy', title: 'Air Jordan 12 Retro', price: 149, img: '2_a571db77-d4b0-4689-8bd8-434c8e97bc65.webp' },
    { handle: 'air-jordan-12-retro-copy', title: 'Luka 5', price: 149, img: '1_a7f51336-93eb-4078-b6c2-e14b721eaad0.webp' }
  ];

  var stories = [
    { label: 'New arrivals', thumb: '078baadd4d4b41249d0d43d65e133d3b.thumbnail.0000000000.webp', video: 'assets/video/078baadd4d4b41249d0d43d65e133d3b.HD-1080p-2.5Mbps-99476759.mp4', seconds: 5, card: { handle: 'tatum-5-orbit-copy', title: 'Luka 5', price: 149 } },
    { label: 'New arrivals', thumb: '9d44131c3a6844dfa5100dbd7847c0d4.thumbnail.0000000000.webp', video: 'assets/video/9d44131c3a6844dfa5100dbd7847c0d4.HD-1080p-2.5Mbps-99476758.mp4', seconds: 5, card: { handle: 'tatum-5-orbit-copy', title: 'Air Jordan 12 Retro', price: 149 } },
    { label: 'New arrivals', thumb: 'IMG_8813.webp', seconds: 5, card: { handle: 'sweatshirt', title: 'Sweatshirt', price: 199 } },
    { label: 'New arrivals', thumb: 'IMG_8812.avif', seconds: 5, card: { handle: 'hoodie', title: 'Hoodie', price: 199 } },
    { label: 'New arrivals', thumb: '6.webp', seconds: 5, card: { handle: 'hoodie-black', title: 'Hoodie Black', price: 199 } },
    { label: 'New arrivals', thumb: '9d44131c3a6844dfa5100dbd7847c0d4.thumbnail.0000000000.webp', video: 'assets/video/9d44131c3a6844dfa5100dbd7847c0d4.HD-1080p-2.5Mbps-99476758.mp4', seconds: 5, card: { handle: 'tatum-5-orbit', title: 'Tatum 5 Orbit', price: 149 } }
  ];

  var luminaSlides = [
    {
      title: 'Lumina Slider',
      desc: 'A soft, radiant light that illuminates the soul.',
      image: 'ChatGPT_Image_Oct_29_2026_03_11_22_PM.webp',
      imageMobile: 'ChatGPT_Image_Oct_29_2026_03_11_28_PM.webp',
      href: 'product.html?handle=tatum-5-orbit-copy'
    },
    {
      title: 'Rose Mirage',
      desc: 'Lost in a desert of blooming dreams and endless horizons.',
      image: 'ChatGPT_Image_Oct_29_2026_03_13_43_PM.webp',
      imageMobile: 'ChatGPT_Image_Oct_29_2026_03_13_49_PM.webp',
      href: 'product.html?handle=tatum-5-orbit'
    }
  ];

  var carousel = [
    { img: 'air-force-1.avif' },
    { img: 'ce96bd170625469.6461ae0c8fa2c.webp' },
    { img: 'air-force-1.avif' },
    { img: 'ce96bd170625469.6461ae0c8fa2c.webp' }
  ];

  var accordions = [
    {
      title: 'Return policy',
      body: "Our goal is for every customer to be totally satisfied with their purchase. If this isn't the case, let us know and we'll do our best to work with you to make it right."
    },
    {
      title: 'Shipping',
      body: 'We will work quickly to ship your order as soon as possible. Once your order has shipped, you will receive an email with further information. Delivery times vary depending on your location.'
    },
    {
      title: 'Manufacturing',
      body: 'Our products are manufactured both locally and globally. We carefully select our manufacturing partners to ensure our products are high quality and a fair value.'
    }
  ];

  function byHandle(h) {
    for (var i = 0; i < products.length; i++) if (products[i].handle === h) return products[i];
    return null;
  }

  function money(n) {
    return '$' + Math.round(n).toFixed(2);
  }

  function productUrl(h) {
    return 'product.html?handle=' + encodeURIComponent(h);
  }

  window.DATA = {
    img: IMG,
    products: products,
    railPieces: railPieces,
    heroPieces: heroPieces,
    railPiecesDeep: railPiecesDeep,
    bagPieces: bagPieces,
    looks: looks,
    orbitShoes: orbitShoes,
    atelier: atelier,
    stories: stories,
    luminaSlides: luminaSlides,
    carousel: carousel,
    accordions: accordions,
    byHandle: byHandle,
    money: money,
    productUrl: productUrl
  };
})();
