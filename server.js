const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8081;
const ROOT = __dirname;

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".png": "image/png",
  ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp",
  ".ico": "image/x-icon", ".webmanifest": "application/manifest+json",
  ".txt": "text/plain", ".wasm": "application/wasm"
};

function proxy(req, res, host, targetPath) {
  const opts = {
    host, path: targetPath, method: req.method,
    headers: { "User-Agent": "Mozilla/5.0", "Accept": req.headers.accept || "*/*" }
  };
  const p = https.request(opts, (r) => {
    if ([301, 302, 307, 308].includes(r.statusCode) && r.headers.location) {
      const u = new URL(r.headers.location, "https://" + host);
      r.resume();
      return proxy(req, res, u.host, u.pathname + u.search);
    }
    const h = { ...r.headers };
    delete h["content-security-policy"];
    h["access-control-allow-origin"] = "*";
    res.writeHead(r.statusCode, h);
    r.pipe(res);
  });
  p.on("error", () => { res.writeHead(502); res.end("Proxy error"); });
  p.end();
}

http.createServer((req, res) => {
  const u = new URL(req.url, "http://localhost");
  let p = decodeURIComponent(u.pathname);

  if (p.startsWith("/firmware-proxy/")) {
    return proxy(req, res, "firmware.ardupilot.org", p.replace("/firmware-proxy", "") + u.search);
  }
  if (p.startsWith("/micoair-firmware-proxy/")) {
    return proxy(req, res, "micoair.com", p.replace("/micoair-firmware-proxy", "") + u.search);
  }

  if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }

  fs.stat(file, (err, st) => {
    if (!err && st.isFile()) {
      res.writeHead(200, {
        "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-cache"
      });
      return fs.createReadStream(file).pipe(res);
    }
    const name = path.basename(p);
    if (/^(param-metadata|workbox-window).*\.js$/.test(name)) {
      return proxy(req, res, "micoair.com", "/configurator/assets/" + name);
    }
    if (p.startsWith("/configurator/firmware/")) {
      return proxy(req, res, "micoair.com", p + u.search);
    }
    res.writeHead(404); res.end("Not found");
  });
}).listen(PORT, () => console.log("Running: http://localhost:" + PORT));