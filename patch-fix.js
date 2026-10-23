const fs = require("fs");

const files = [
  "index-DHEVf1vn.js",
  "index.js",
  "configurator/assets/index-DHEVf1vn.js",
  "configurator/assets/index.js",
];

const RTK = `,lC=[{id:"rtk",labelKey:"sidebar.rtk",icon:s.jsxs("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:[s.jsx("path",{d:"M12 20v-6"}),s.jsx("path",{d:"M8 20h8"}),s.jsx("path",{d:"M9 14h6"}),s.jsx("path",{d:"M5 10a7 7 0 0 1 14 0"}),s.jsx("path",{d:"M8 10a4 4 0 0 1 8 0"}),s.jsx("circle",{cx:"12",cy:"10",r:"1.5"})]})}]`;

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let s = fs.readFileSync(f, "latin1");
  const log = [];

  // 1. Hardware item: remove ONLY the hardware object (keep ],lC=[...RTK...)
  const a = s.indexOf('{id:"hardware",labelKey');
  if (a > 0 && s[a - 1] === ",") {
    const e = s.indexOf('}],lC=[', a);
    if (e > a) { s = s.slice(0, a - 1) + s.slice(e + 1); log.push("hardware removed"); }
  }

  // 2. Repair: RTK list (lC) deleted by the old buggy patch
  if (!s.includes('lC=[{id:"rtk"')) {
    const k = s.indexOf("}];function cC()");
    if (k > 0) { s = s.slice(0, k + 2) + RTK + s.slice(k + 2); log.push("RTK list restored"); }
  }

  // 3. Home icon in top bar
  const h0 = s.indexOf('s.jsx("a",{className:"topbar__icon-btn",href:t.language==="zh"?"https://micoair.cn"');
  const h1 = s.indexOf('s.jsx("a",{className:"topbar__icon-btn",href:"https://discord.com', h0);
  if (h0 > 0 && h1 > h0 && h1 - h0 < 1200) { s = s.slice(0, h0) + s.slice(h1); log.push("home removed"); }

  fs.writeFileSync(f, s, "latin1");
  console.log(f, "->", log.length ? log.join(", ") : "already OK");
}