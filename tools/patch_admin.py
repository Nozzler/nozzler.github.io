#!/usr/bin/env python3
"""Applies the mobile + push changes to admin/index.html.   Usage: python3 tools/patch_admin.py ./admin/index.html
Every change is checked first; one that does not match exactly once is skipped and reported (e.g. already applied). A .bak copy is kept."""
import re, sys, shutil
p = sys.argv[1] if len(sys.argv) > 1 else "./admin/index.html"
s = open(p, encoding="utf-8").read()
shutil.copy(p, p + ".bak")
done, skipped = [], []

def sub(name, old, new, regex=False):
    global s
    n = len(re.findall(old, s, re.S)) if regex else s.count(old)
    if n != 1:
        skipped.append(f"{name} (found {n}x)"); return
    s = re.sub(old, lambda m: new, s, count=1, flags=re.S) if regex else s.replace(old, new)
    done.append(name)

sub("head: mobile css, manifest, icons",
    '<link rel="stylesheet" href="../shared/ui.css">',
    '<link rel="stylesheet" href="../shared/ui.css"><link rel="stylesheet" href="../shared/mobile.css"><link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="../assets/apple-touch-icon.png"><meta name="theme-color" content="#c2410c"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Nozzler Desk">')
sub("scripts: push.js",
    '<script src="../config.js"></script><script src="../shared/pricing.js"></script>',
    '<script src="../config.js"></script><script src="../shared/pricing.js"></script><script src="../shared/push.js"></script>')
sub("tables: data-l labels for card layout",
    '<td class="${nc.includes(i)?"n":""}">${y}</td>',
    '<td data-l="${h[i]||""}" class="${nc.includes(i)?"n":""}">${y}</td>')
# render() was closed one block too early: the sidebar, drawer-aware code and settings handlers ran once at load instead of on every render
sub("render(): remove early closing brace", 'files[0].text()}}', 'files[0].text()}')
sub("render(): remove duplicate isMobile", '\nconst isMobile=()=>window.innerWidth<640;\nconst navGroups=[', '\nconst navGroups=[')
sub("render(): close after sidebar block + push switch",
    '$("#sidebarToggle").style.display=isMobile()?"flex":"none";',
    '$("#sidebarToggle").style.display=isMobile()?"flex":"none";\n'
    '  const pm=$("#pm");if(pm){if(window.Push&&window.sb)Push.ui(pm,$("#pn"),window.sb);else pm.textContent="Sign in to the cloud to turn on notifications."}\n}')
sub("render wrapper returns its promise",
    'render=function(){origRender();headerSearch.style.display=searchTabs.has(tab)?"block":"none"};',
    'render=function(){const p=origRender();headerSearch.style.display=searchTabs.has(tab)?"block":"none";return p};')
sub("settings: notifications row",
    '<h3>Data & sync</h3>',
    '<h3>Notifications on this phone</h3>\n      <div class="settings-row"><label id="pm" style="color:var(--mu)">…</label><div class="control"><button class="btn s" id="pn" type="button" style="display:none"></button></div></div>\n    </div>\n    <div class="settings-section">\n      <h3>Data & sync</h3>')
sub("bottom nav: Requests instead of Print",
    r'<button data-a="t_Print".*?</button>',
    '<button data-a="t_Requests" aria-label="Requests">\n    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-6l-2 3h-4l-2-3H2"></path><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>\n    <span>Requests</span>\n  </button>', regex=True)
sub("More menu: keep Print reachable",
    '["Dashboard","Dashboard"],["Bills","Bills"]',
    '["Dashboard","Dashboard"],["Print","Now printing"],["Bills","Bills"]')

open(p, "w", encoding="utf-8").write(s)
print("applied:", *done, sep="\n  ")
if skipped: print("skipped:", *skipped, sep="\n  ")
