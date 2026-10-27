// Adds a "Zone" sidebar item (below Message) that opens the Digital Sky airspace map.
// Run:  node add-zone.js
// ZONE_URL: "/digital-sky-map" = via local proxy in server.js (needed: site blocks iframes). Direct: "https://digitalsky.aai.aero/digital-sky-map"
const ZONE_URL = "/digital-sky-map";

const fs = require("fs");

const files = [
  "index-DHEVf1vn.js",
  "index.js",
  "configurator/assets/index-DHEVf1vn.js",
  "configurator/assets/index.js",
];

const zoneItem =
  '{id:"zone",labelKey:"sidebar.zone",icon:s.jsxs("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:[' +
  's.jsx("path",{d:"M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"}),' +
  's.jsx("circle",{cx:"12",cy:"10",r:"2.5"}),' +
  's.jsx("path",{d:"M2 20l3-1.5M22 20l-3-1.5"})]})},';

const zoneView =
  'function CdaZone(){const[k,setK]=F.useState(0),U="' + ZONE_URL + '",' +
  'b={display:"inline-flex",alignItems:"center",padding:"6px 14px",borderRadius:"6px",border:"1px solid var(--accent)",color:"var(--accent)",background:"transparent",cursor:"pointer",textDecoration:"none",fontSize:"13px",fontWeight:600};' +
  'return s.jsxs("div",{className:"cda-zone",style:{display:"flex",flexDirection:"column",height:"100%",width:"100%"},children:[' +
  's.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px",padding:"8px 16px",borderBottom:"1px solid var(--border-color,rgba(128,128,128,.25))"},children:[' +
  's.jsx("strong",{style:{fontFamily:"var(--font-display)",letterSpacing:".1em",textTransform:"uppercase",fontSize:"14px"},children:"Digital Sky \\u00b7 Airspace Zones"}),' +
  's.jsxs("div",{style:{display:"flex",gap:"8px"},children:[' +
  's.jsx("button",{style:b,onClick:()=>setK(x=>x+1),children:"Reload"}),' +
  's.jsx("a",{style:b,href:U,target:"_blank",rel:"noopener noreferrer",children:"Open in new tab"})]})]}),' +
  's.jsx("iframe",{key:k,src:U,title:"Digital Sky Airspace Map",allow:"geolocation; fullscreen",referrerPolicy:"no-referrer-when-downgrade",style:{flex:1,width:"100%",border:0,background:"#fff"}})]})}';

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let s = fs.readFileSync(f, "latin1");
  const log = [];

  if (s.includes('{id:"zone",labelKey')) {
    // already added -> just update the URL
    s = s.replace(/(function CdaZone\(\)\{const\[k,setK\]=F\.useState\(0\),U=")[^"]*(")/, "$1" + ZONE_URL + "$2");
    fs.writeFileSync(f, s, "latin1");
    console.log(f, "-> zone url updated");
    continue;
  }

  // 1. sidebar item: right after Message (console), before Mission (map)
  const m = s.indexOf('{id:"map",labelKey:"sidebar.map"');
  if (m < 0) { console.log(f, "-> sidebar not found (skipped)"); continue; }
  s = s.slice(0, m) + zoneItem + s.slice(m);
  log.push("sidebar item");

  // 2. label in every language
  s = s.split('rtk:"RTK"}').join('rtk:"RTK",zone:"Zone"}');
  log.push("label");

  // 3. page component + router
  const u = s.indexOf("function UC(){");
  if (u < 0) { console.log(f, "-> router not found (skipped)"); continue; }
  s = s.slice(0, u) + zoneView + s.slice(u);

  const r1 = 'e==="rtk"&&(a.current=!0);';
  const r2 = 'a.current&&s.jsx("div",{style:n("rtk"),children:s.jsx(VC,{})})]';
  if (!s.includes(r1) || !s.includes(r2)) { console.log(f, "-> router markers not found (skipped)"); continue; }
  s = s.replace(r1, r1 + 'e==="zone"&&(window.__cdaZone=!0);');
  s = s.replace(r2, 'a.current&&s.jsx("div",{style:n("rtk"),children:s.jsx(VC,{})}),window.__cdaZone&&s.jsx("div",{style:n("zone"),children:s.jsx(CdaZone,{})})]');
  log.push("page");

  fs.writeFileSync(f, s, "latin1");
  console.log(f, "->", log.join(", "));
}
