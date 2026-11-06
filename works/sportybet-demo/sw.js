"use strict";
const PREFIX = "sporty-demo:" + self.registration.scope + ":";
const CACHE = PREFIX + "v9";
const ASSETS = [
  "/ng/",
  "/ng/index.html",
  "/ng/m/",
  "/ng/m/index.html",
  "/",
  "/index.html",
  "/m/",
  "/m/index.html",
  "/assets/css/pages.css",
  "/assets/css/tokens.css",
  "/assets/css/desktop.css",
  "/assets/css/interactions.css",
  "/assets/css/app.css",
  "/assets/js/lucide.js",
  "/assets/js/app.js",
  "/assets/js/demo.js",
  "/assets/js/demo-data.js",
  "/assets/js/views.js",
  "/assets/fonts/Roboto-Regular.ae3a8db937.ttf",
  "/assets/fonts/RobotoCondensed-Regular.461bd71faa.ttf",
  "/assets/fonts/RobotoCondensed-SemiBold.2ebf3566cd.ttf",
  "/assets/fonts/Roboto-Medium.af9d01395a.ttf",
  "/assets/fonts/iconfont.3c32fc6c6f.ttf",
  "/assets/fonts/iconfont.c166d601c2.woff",
  "/assets/fonts/Inter-SemiBold.3558e0041c.ttf",
  "/assets/fonts/Barlow-Regular.3a262070f4.ttf",
  "/assets/fonts/Roboto-Bold.88d61d57d5.ttf",
  "/assets/fonts/ScienceGothic-Regular.a61172e949.ttf",
  "/assets/fonts/Barlow-Bold.af3944704d.ttf",
  "/assets/fonts/Inter-Medium.adc5e93683.ttf",
  "/assets/fonts/Inter-Bold.56a11d287d.ttf",
  "/assets/fonts/text-security-disc.f758130bc0.woff",
  "/assets/fonts/Inter-Regular.a1db723976.ttf",
  "/assets/img/d3d77957815db3662fcb5da8921e690b.png",
  "/assets/img/icon_telegram_logo.987e5936ae.svg",
  "/assets/img/fb374b3ea8478f90fa242311ae27f2eb.png",
  "/assets/img/footer_opay_logo_a954fa8a51.png",
  "/assets/img/6e288236e170579fa1e2bac1400aa7bf.png",
  "/assets/img/pac-card-bg.d26cb50d17.svg",
  "/assets/img/icon_check.1b59a733d4.svg",
  "/assets/img/semicircle.0942db6293.svg",
  "/assets/img/59bd76f2fe42b8cd5daf90e91b822ef3.jpg",
  "/assets/img/cash-card-bg.1c8414fa56.svg",
  "/assets/img/football-field_360x150.09ca071876.jpg",
  "/assets/img/footer_gtbank_logo_6b74706f30.png",
  "/assets/img/79f718d0679214a0f65bd7aeb6699b3a.webp",
  "/assets/img/f012954cf4bb2e7da6bb87440282af91.webp",
  "/assets/img/icon-roulette.3f8157103a.png",
  "/assets/img/24b794528caceddf0418741815fefaae.webp",
  "/assets/img/minigame-soon.png",
  "/assets/img/79111db9b222681556b23702a70ef825.png",
  "/assets/img/open-bet.4b0ce3ba4a.png",
  "/assets/img/mobile-promo-4.png",
  "/assets/img/hot.2d9c9be910.png",
  "/assets/img/cb02231cca7e2f7e6d56d60fa9de8762.png",
  "/assets/img/9d4eaa939537b05d3fb32708ce391fc6.png",
  "/assets/img/a01d98f87c256a84477e6dfa6eb8fa84.webp",
  "/assets/img/footer_quickteller_logo_67ba461e70.png",
  "/assets/img/dis-card-bg.153874f810.svg",
  "/assets/img/a4f70412a49c863de2c07a072a234796.webp",
  "/assets/img/mx.03edb56690.svg",
  "/assets/img/footer_palmpay_logo_dbb2dc54fc.png",
  "/assets/img/footer_mastercard_logo_094fa25aea.png",
  "/assets/img/9daf2d802a176bf5beaca990abb9c3b4.webp",
  "/assets/img/f687c701203721f9a26e8dbf8b879bb2.png",
  "/assets/img/5843d11bd9118b43c0731d379c197d07.webp",
  "/assets/img/45d2f3d6b108a0acf7a394b788a1873d.png",
  "/assets/img/7555c59481512478174ec1d35067e1d4.png",
  "/assets/img/minigame-bottle.png",
  "/assets/img/3f29a54789748d6b167134ce3e34f57d.png",
  "/assets/img/ce11ea85ac65ae129758f20a0b4d8d63.png",
  "/assets/img/616cc93166ce6f2c1316a2c31ec32cb1.png",
  "/assets/img/footer_fidelity_logo_b6239d349d.png",
  "/assets/img/a917911891cdc5f574a842d7847b1c3a.webp",
  "/assets/img/flashWinImg.bdcb03e6aa.png",
  "/assets/img/background.fefbd012c9.png",
  "/assets/img/aed95418bdaf759c6e669440e280a1c.png",
  "/assets/img/e79f533fcfa4307156e1a81f844b7dd6.png",
  "/assets/img/d2c1b7f09aa4f0ae5098ee990e6740ae.png",
  "/assets/img/hot_badge_c157795775.png",
  "/assets/img/Image_partnership_2logo_desktop_f15468abc8.png",
  "/assets/img/worldCup.c31eab3504.png",
  "/assets/img/f268b4a9f6e7adb4921ea24d392edfa5.png",
  "/assets/img/5d118dca0ce307abbd678ef4365b7fe7.png",
  "/assets/img/2ee7dda8cc83fb0d8aefca468f9d734e.png",
  "/assets/img/left.0bac49396d.jpg",
  "/assets/img/forum@2x.b116a24aba.svg",
  "/assets/img/4b016f6e289ffc33bf25c4de0261e02f.webp",
  "/assets/img/goalkeeper.jpg",
  "/assets/img/4b182df3cac0aa336aa89b91a64a642d.png",
  "/assets/img/144x144.png",
  "/assets/img/winBg.7021172f98.png",
  "/assets/img/dob-verify-bg.544021490c.png",
  "/assets/img/right.7a114c1a9b.jpg",
  "/assets/img/lucky-bg.4c2708501e.svg",
  "/assets/img/icon_youtube.260f9bc049.png",
  "/assets/img/popupBg2-big.18bdb88cc6.png",
  "/assets/img/f49fef104470724cb6e4f1ea674c3c13.png",
  "/assets/img/ef04ea5faf985a7f9163aacd509e0148.png",
  "/assets/img/3175f1a20ec5adb7a2ffe7aeff7a1ec8.png",
  "/assets/img/popupBall2.fc00d8d576.png",
  "/assets/img/e67c812d32ef2f665d7e83e67c7ddf5b.webp",
  "/assets/img/bg_desktop_dialog.72b871151f.jpg",
  "/assets/img/icon-games.6a218923c5.svg",
  "/assets/img/679fad28e6fdebf9303e21a74817df5a.png",
  "/assets/img/cefcc0cc47f0de8465fc1bb3b0e0f1fd.png",
  "/assets/img/boost-light.6144486700.png",
  "/assets/img/footer_zenith_logo_5bfa08a0c5.png",
  "/assets/img/footer_uba_logo_58a31a9c3b.png",
  "/assets/img/more-dot.3c0aa6303b.svg",
  "/assets/img/15c023581130431bee1e0d7cee077a72.webp",
  "/assets/img/mobile-promo-2.png",
  "/assets/img/354b166d79ff5888e294065048d8a331.png",
  "/assets/img/3d2f6a89f2eaec4919c93343f3c7b770.png",
  "/assets/img/mobile-promo-3.png",
  "/assets/img/fb38667f1d986ec977ea756ecaf01bfd.png",
  "/assets/img/cash-top-bg.31552e0dfd.svg",
  "/assets/img/footer_access_logo_93dc405323.png",
  "/assets/img/d0839820d9f53131fa12f9583c909440.png",
  "/assets/img/473ebe4bc9ec82b681c36d6597f258e0.jpg",
  "/assets/img/logo.2723b05b63.png",
  "/assets/img/footer_firstbank_logo_d49c06c2ef.png",
  "/assets/img/lagos.d37caa18cb.png",
  "/assets/img/e11368d7b4583e713fdfa5c014cd3ccd.webp",
  "/assets/img/popSuc.3630e5f7cb.jpg",
  "/assets/img/77362c68280b20151571b56e670980bb.png",
  "/assets/img/6dd5d9f61e6c9988c109074e37c5972c.png",
  "/assets/img/dob-gift-popup-bg.58c07d7db1.png",
  "/assets/img/dob-verified-bg.6c2ef4fa41.png",
  "/assets/img/43cbd2c166ca216489e926b86d080481.png",
  "/assets/img/c080f2554374fe85415baf77f7d518f2.png",
  "/assets/img/5841880836a4009d87257d573f04f784.png",
  "/assets/img/flagNigeria.12aeae58bb.png",
  "/assets/img/top-bg.8b6bc14c77.svg",
  "/assets/img/Live_6911167f54.png",
  "/assets/img/74de67175927226ac3aca1e1ae68a806.png",
  "/assets/img/5c2def0f678e58706de2cfa5ea1c2c3.png",
  "/assets/img/boost-dark.680ddaf1aa.png",
  "/assets/img/b711e5dfcf69d69226ba2371f2d165f7.webp",
  "/assets/img/footer_verve_logo_c68b5a53c0.png",
  "/assets/img/cda660514c1071b6cac25e610c754845.png",
  "/assets/img/c6ca3632c820fd5dd917f17f7cc5ab62.png",
  "/assets/img/minigame-hero.png",
  "/assets/img/icon-bingo.dc39c6bf63.png",
  "/assets/img/ae6322fc2a9625f66191ea200e1c11ec.jpg",
  "/assets/img/shortLogo.b916e6f109.png",
  "/assets/img/dis-top-bg.3c8e9c52bf.svg",
  "/assets/img/7d2274f4de09878c1bb1fa42b154d659.png",
  "/assets/img/popupBgInt.0fd86d7416.png",
  "/assets/img/f8742b2d9f0b12b2e579577ad0e3d6c8.png",
  "/assets/img/23a7f8dfa3ed98a943188973bd5f80b3.webp",
  "/assets/img/mobile-promo-0.png",
  "/assets/img/a812f25aeb58f890c09308475799bde0.webp",
  "/assets/img/2affb09cf9a813e5801f12ade72bcb7d.png",
  "/assets/img/freebet-card-bg.8e848f1127.svg",
  "/assets/img/b638c0f668a29248d4709fa3618d4615.webp",
  "/assets/img/bg.832d4f9fa3.jpg",
  "/assets/img/welcome_bonus_claim.dda8aa6acc.png",
  "/assets/img/3e03544469705b9601e974c10e5fd961.webp",
  "/assets/img/footer_visa_logo_9dabd03576.png",
  "/assets/img/Load_Code_8ad27d3808.png",
  "/assets/img/license@2x.e4e544418c.svg",
  "/assets/img/winningImg.0ddcac60fd.png",
  "/assets/img/minigame-redblack.png",
  "/assets/img/mission-of-the-week-banner.3262667c5a.png",
  "/assets/img/mobile-promo-1.png",
  "/assets/img/ac71b0a1a6b0a8fd8c6f6169d1f06fb9.png",
  "/assets/img/1c2690061368128d0f1b68302c151e69.png",
  "/assets/img/sfm.9a7043a916.png",
];
self.addEventListener("install", (e) =>
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(ASSETS.map(p=>new URL(p.replace(/^\//,""),self.registration.scope).href)))
      .then(() => self.skipWaiting()),
  ),
);
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith(PREFIX) && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (e) => {
  if (
    e.request.method !== "GET" ||
    new URL(e.request.url).origin !== self.location.origin
  )
    return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok) {
          const copy = r.clone();
          caches
            .open(CACHE)
            .then((c) => c.put(e.request, copy))
            .catch(() => {});
        }
        return r;
      })
      .catch(() =>
        caches
          .match(e.request)
          .then(
            (r) =>
              r ||
              (e.request.mode === "navigate"
                ? caches.match(new URL("index.html",self.registration.scope).href)
                : Response.error()),
          ),
      ),
  );
});
