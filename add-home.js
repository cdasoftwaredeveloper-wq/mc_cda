// Adds a Home button (top bar, right side). Click -> opens your website in a new tab.
// 1) Put your website link below  2) run:  node add-home.js
const CDA_URL = "https://chennaidroneacademy.com";

const fs = require("fs");

if (!/^https?:\/\/[^"\s]+$/.test(CDA_URL) || CDA_URL.includes("YOUR-WEBSITE")) {
  console.log('Open add-home.js and set CDA_URL to your real website link first (example: "https://yourwebsite.com")');
  process.exit(1);
}

const files = [
  "index-DHEVf1vn.js",
  "index.js",
  "configurator/assets/index-DHEVf1vn.js",
  "configurator/assets/index.js",
];

const homeButton = (url) =>
  's.jsx("a",{"data-cda-home":"1",className:"topbar__icon-btn",href:"' + url +
  '",target:"_blank",rel:"noopener noreferrer",title:"Chennai Drone Academy",' +
  'children:s.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",' +
  'strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:[' +
  's.jsx("path",{d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"}),' +
  's.jsx("polyline",{points:"9 22 9 12 15 12 15 22"})]})}),';

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let s = fs.readFileSync(f, "latin1");

  if (s.includes('"data-cda-home":"1"')) {
    // already added -> just update the link
    s = s.replace(/("data-cda-home":"1",className:"topbar__icon-btn",href:")[^"]*(")/, "$1" + CDA_URL + "$2");
    fs.writeFileSync(f, s, "latin1");
    console.log(f, "-> home link updated");
    continue;
  }

  const marker = 'className:"topbar__right",children:[';
  const i = s.indexOf(marker);
  if (i < 0) { console.log(f, "-> topbar not found (skipped)"); continue; }
  const at = i + marker.length;
  s = s.slice(0, at) + homeButton(CDA_URL) + s.slice(at);
  fs.writeFileSync(f, s, "latin1");
  console.log(f, "-> home button added");
}