const fs = require("fs");

const files = [
  "index-DHEVf1vn.js",
  "index.js",
  "configurator/assets/index-DHEVf1vn.js",
  "configurator/assets/index.js",
];

// file is read as latin1 (byte-safe), so non-ASCII text must be converted the same way
const u = (t) => Buffer.from(t, "utf8").toString("latin1");

const OLD_FOOTER = u('["MicoConfigurator v","1.0.6"," © 2026 MicoAir Tech. All rights reserved."]');
const NEW_FOOTER = u('["© 2026 Chennai Drone Academy  ·  SkyLynk Unmanned System Pvt Ltd"]');
const OLD_SUB = 's.jsx("span",{className:"topbar__subtitle",children:e("app.subtitle")})';
const NEW_SUB =
  's.jsxs("span",{className:"topbar__subtitle",children:[' +
  's.jsx("strong",{className:"cda-tag",children:"EASY TO LEARN & EASY TO FLY"}),' +
  's.jsx("small",{className:"cda-sub",children:e("app.subtitle")})]})';

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let s = fs.readFileSync(f, "latin1");
  const before = s;

  s = s.split(OLD_FOOTER).join(NEW_FOOTER);
  s = s.split(OLD_SUB).join(NEW_SUB);
  s = s.split("MicoConfigurator").join("Chennai Drone Academy");

  fs.writeFileSync(f, s, "latin1");
  console.log(f, "->", s === before ? "already OK" : "name + tagline + footer updated");
}