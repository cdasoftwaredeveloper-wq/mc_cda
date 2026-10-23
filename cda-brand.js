// "MicoConfigurator" -> "Chennai Drone Academy" (footer copyright untouched)
(function () {
  var OLD = "MicoConfigurator", NEW = "Chennai Drone Academy";

  function fix(root) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = w.nextNode())) {
      if (n.nodeValue.indexOf(OLD) === -1) continue;
      if (n.parentElement && n.parentElement.closest(".statusbar")) continue;
      n.nodeValue = n.nodeValue.split(OLD).join(NEW);
    }
    if (document.title.indexOf(OLD) !== -1) {
      document.title = document.title.split(OLD).join(NEW);
    }
  }

  function start() {
    fix(document.body);
    new MutationObserver(function () { fix(document.body); })
      .observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start);
})();