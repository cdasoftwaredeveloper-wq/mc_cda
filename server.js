
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8081;
const ROOT = __dirname;

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain",
  ".wasm": "application/wasm"
};

function proxy(req, res, host, targetPath) {
  const opts = {
    hostname: host,
    path: targetPath,
    method: req.method,
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": req.headers.accept || "*/*"
    }
  };

  const p = https.request(opts, (r) => {
    if (
      [301, 302, 307, 308].includes(r.statusCode) &&
      r.headers.location
    ) {
      const u = new URL(r.headers.location, "https://" + host);
      r.resume();
      return proxy(req, res, u.host, u.pathname + u.search);
    }

    const h = { ...r.headers };
    delete h["content-security-policy"];
    delete h["x-frame-options"];
    h["access-control-allow-origin"] = "*";

    res.writeHead(r.statusCode, h);
    r.pipe(res);
  });

  p.on("error", (err) => {
    console.error("Proxy error:", err.message);
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "text/plain" });
    }
    res.end("Proxy error");
  });

  p.end();
}

const server = http.createServer((req, res) => {
  const u = new URL(req.url, "http://localhost");
  let p;

  try {
    p = decodeURIComponent(u.pathname);
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain" });
    return res.end("Bad request");
  }

  // Render health check endpoint
  if (p === "/healthz" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("ok");
  }

  // ArduPilot firmware proxy
  if (p.startsWith("/firmware-proxy/")) {
    return proxy(
      req,
      res,
      "firmware.ardupilot.org",
      p.replace("/firmware-proxy", "") + u.search
    );
  }

  // MicoAir firmware proxy
  if (p.startsWith("/micoair-firmware-proxy/")) {
    return proxy(
      req,
      res,
      "micoair.com",
      p.replace("/micoair-firmware-proxy", "") + u.search
    );
  }

<<<<<<< HEAD
  // Digital Sky map proxy
  if (p === "/digital-sky-map" || p.startsWith("/digital-sky-map/")) {
    return proxy(
      req,
      res,
      "digitalsky.aai.aero",
      p + u.search
    );
  }
=======
  if (p === "/digital-sky-map" || p === "/digital-sky-map/") {
  return proxy(req, res, "digitalsky.aai.aero", "/" + u.search);
}
if (p.startsWith("/digital-sky-map/")) {
  return proxy(req, res, "digitalsky.aai.aero", p.slice("/digital-sky-map".length) + u.search);
}
>>>>>>> 1a6c9f4 (change the some files)

  // Serve the home page
  if (p === "/") {
    p = "/index.html";
  }

  const file = path.resolve(ROOT, "." + p);

  // Prevent requests from accessing files outside the project folder
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    return res.end("Forbidden");
  }

  fs.stat(file, (err, st) => {
    if (!err && st.isFile()) {
      res.writeHead(200, {
        "Content-Type":
          MIME[path.extname(file).toLowerCase()] ||
          "application/octet-stream",
        "Cache-Control": "no-cache"
      });

      return fs.createReadStream(file)
        .on("error", (streamErr) => {
          console.error("File read error:", streamErr.message);
          if (!res.headersSent) {
            res.writeHead(500);
          }
          res.end("Internal server error");
        })
        .pipe(res);
    }

    const name = path.basename(p);

    if (/^(param-metadata|workbox-window).*\.js$/.test(name)) {
      return proxy(
        req,
        res,
        "micoair.com",
        "/configurator/assets/" + name + u.search
      );
    }

    if (p.startsWith("/configurator/firmware/")) {
      return proxy(req, res, "micoair.com", p + u.search);
    }

    if (
      /^\/(assets|static|_next|api|geoserver|images|fonts)\//.test(p) ||
      /\.(js|css|map|png|svg|woff2?|json)$/.test(p)
    ) {
      return proxy(req, res, "digitalsky.aai.aero", p + u.search);
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
