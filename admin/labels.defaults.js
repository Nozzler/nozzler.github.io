/* Nozzler label defaults: brand, colours, texts and every label template as plain JSON.
   Edit here, or override anything in Admin > Labels > JSON (your overrides are saved with your data and merged on top).
   Template language: see the 'How templates work' box in the JSON tab. */
window.LABEL_DEFAULTS={
 "version": 1,
 "brand": {
  "name": "Nozzler",
  "wordmark": [
   ["No","ink"],
   ["zz","ac"],
   ["ler","ink"]
  ],
  "tagline": "BY SEPP · 3D PRINTING ON DEMAND",
  "sign": "Sepp",
  "footer": "Nozzler · by Sepp",
  "contact": "",
  "web": "",
  "address": ""
 },
 "defaults": {
  "style": "color",
  "lang": "",
  "fmt": "pdf",
  "dpi": 300,
  "zoom": 100,
  "sheet": {
   "paper": "a4",
   "land": 0,
   "margin": 8,
   "gap": 3,
   "border": 1,
   "sort": 1
  }
 },
 "palettes": {
  "color": {
   "ink": "#1c1b18",
   "ac": "#c2410c",
   "lt": "#fb923c",
   "l2": "#fdba74",
   "o2": "#ea580c",
   "d2": "#9a3412",
   "st": "#57534e",
   "pp": "#fff7ed",
   "mu": "#6d6a62",
   "ln": "#d6d3d1",
   "wh": "#ffffff"
  },
  "gray": {
   "ink": "#111111",
   "ac": "#3a3a3a",
   "lt": "#8c8c8c",
   "l2": "#bdbdbd",
   "o2": "#666666",
   "d2": "#2a2a2a",
   "st": "#555555",
   "pp": "#f1f1f1",
   "mu": "#666666",
   "ln": "#c8c8c8",
   "wh": "#ffffff"
  },
  "bw": {
   "ink": "#000000",
   "ac": "#000000",
   "lt": "#ffffff",
   "l2": "#ffffff",
   "o2": "#000000",
   "d2": "#000000",
   "st": "#000000",
   "pp": "#ffffff",
   "mu": "#000000",
   "ln": "#000000",
   "wh": "#ffffff"
  }
 },
 "texts": {
  "en": {
   "box": "BOX",
   "of": "of",
   "order": "ORDER",
   "inbox": "IN THIS BOX",
   "more": "more (see packing slip)",
   "deliver": "Deliver to",
   "need": "Needed by",
   "cut": "CUT ALONG THE LINE TO OPEN",
   "seal": "Sealed by Nozzler",
   "slip": "PACKING SLIP",
   "tot": "Pieces in this box",
   "qty": "QTY",
   "part": "PART",
   "chk": "Please check the contents when you unpack. Something missing or damaged? Send me a message and I’ll fix it.",
   "dear": "Dear {{customer||t.there}},",
   "there": "there",
   "reg": "Warm regards,",
   "care": "Caring for your print",
   "yo": "YOUR ORDER",
   "parts": "parts",
   "box1": "box",
   "boxes": "boxes",
   "letter": ["Thank you so much for your order. Every part in this box was prepared, printed and checked by hand, one layer at a time.","Please take a look at everything when you unpack. If something isn’t right, or you just want to say hi, send me a message and I’ll make it right.","Happy with your print? Tell a friend, or send me a photo of it in use. That really makes my day."],
   "tips": ["Clean with lukewarm water and a soft cloth.","Layer lines are normal for 3D prints and part of their character.","Remove small support marks with fine sandpaper or a hobby knife.","Keep away from long, direct sun and from heaters."],
   "PLA": "PLA: keep below 50 °C (no hot car dashboard).",
   "PETG": "PETG: tough and water resistant, fine up to about 70 °C.",
   "ABS": "ABS/ASA: handles heat up to about 90 °C. Avoid acetone.",
   "TPU": "TPU: flexible; avoid sharp edges and long stretching.",
   "PA": "Nylon / carbon: keep dry, it absorbs moisture.",
   "fragile": "FRAGILE",
   "handle": "HANDLE WITH CARE",
   "up": "THIS SIDE UP",
   "checked": "QUALITY CHECKED",
   "byhand": "Checked by hand",
   "thankyou": "Thank you!",
   "printed": "printed layer by layer",
   "noteh": "A little note for you",
   "to": "To",
   "warr": "Need help?",
   "warrl": ["Something not right with your print? Cracked, warped or not what you ordered? Send me a message with your order number and a photo, and I’ll make it right.","Keep this card so you have my details at hand."],
   "qty2": "Qty",
   "headline": "This package is happy to see you too",
   "thanks2": "THANK YOU",
   "forpurchase": "FOR YOUR PURCHASE",
   "madewith": "MADE WITH LOVE",
   "social": "LET’S BE SOCIAL",
   "revh": "Happy with your print?",
   "revl": ["A review, or a photo of your print in use, means the world to a small maker.","Tag me or send me a message and I’ll happily share it."],
   "material": "Material",
   "weight": "Weight",
   "ptime": "Print time",
   "pdate": "Date",
   "ret": "RETURN TO",
   "ticket": "JOB TICKET",
   "steps": "PACK CHECKLIST",
   "packsteps": ["Parts counted and checked","Supports removed, edges cleaned","Quality check by hand","Parts bagged and packed","Papers and labels in the box","Boxes sealed and labelled"],
   "pass": "PRINT PASSPORT"
  },
  "nl": {
   "box": "DOOS",
   "of": "van",
   "order": "BESTELLING",
   "inbox": "IN DEZE DOOS",
   "more": "meer (zie pakbon)",
   "deliver": "Afleveren bij",
   "need": "Nodig tegen",
   "cut": "SNIJD LANGS DE LIJN OM TE OPENEN",
   "seal": "Verzegeld door Nozzler",
   "slip": "PAKBON",
   "tot": "Stuks in deze doos",
   "qty": "AANT.",
   "part": "ONDERDEEL",
   "chk": "Kijk de inhoud even na als je uitpakt. Mist er iets of is het beschadigd? Stuur me een bericht, dan los ik het op.",
   "dear": "Beste {{customer||t.there}},",
   "there": "klant",
   "reg": "Hartelijke groet,",
   "care": "Zo blijft je print mooi",
   "yo": "JE BESTELLING",
   "parts": "onderdelen",
   "box1": "doos",
   "boxes": "dozen",
   "letter": ["Hartelijk dank voor je bestelling. Elk onderdeel in deze doos is met zorg voorbereid, laag voor laag geprint en met de hand gecontroleerd.","Kijk alles even na als je de doos uitpakt. Klopt er iets niet, of wil je gewoon hallo zeggen? Stuur me een bericht, dan maak ik het goed.","Blij met je print? Vertel het een vriend door, of stuur me een foto van hoe je hem gebruikt. Daar word ik echt blij van."],
   "tips": ["Reinigen met lauw water en een zachte doek.","Laaglijntjes horen bij 3D-prints en maken ze uniek.","Kleine steunresten verwijder je met fijn schuurpapier of een hobbymes.","Houd uit de buurt van langdurige zon en verwarming."],
   "PLA": "PLA: houd onder 50 °C (niet op een warm autodashboard).",
   "PETG": "PETG: sterk en waterbestendig, goed tot ongeveer 70 °C.",
   "ABS": "ABS/ASA: kan tegen warmte tot ongeveer 90 °C. Geen aceton.",
   "TPU": "TPU: flexibel; vermijd scherpe randen en langdurig rekken.",
   "PA": "Nylon / carbon: droog bewaren, het neemt vocht op.",
   "fragile": "BREEKBAAR",
   "handle": "VOORZICHTIG BEHANDELEN",
   "up": "DEZE KANT BOVEN",
   "checked": "KWALITEIT GECONTROLEERD",
   "byhand": "Met de hand gecontroleerd",
   "thankyou": "Bedankt!",
   "printed": "laag voor laag geprint",
   "noteh": "Een berichtje voor jou",
   "to": "Aan",
   "warr": "Hulp nodig?",
   "warrl": ["Klopt er iets niet met je print? Gebarsten, kromgetrokken of niet wat je besteld hebt? Stuur me een bericht met je bestelnummer en een foto, dan maak ik het goed.","Bewaar dit kaartje, dan heb je mijn gegevens bij de hand."],
   "qty2": "Aantal",
   "headline": "Dit pakket is blij om jou te zien",
   "thanks2": "BEDANKT",
   "forpurchase": "VOOR JE AANKOOP",
   "madewith": "MET LIEFDE GEMAAKT",
   "social": "VOLG ME OOK",
   "revh": "Blij met je print?",
   "revl": ["Een review, of een foto van je print in gebruik, betekent echt veel voor een kleine maker.","Tag me of stuur me een berichtje, dan deel ik hem graag."],
   "material": "Materiaal",
   "weight": "Gewicht",
   "ptime": "Printtijd",
   "pdate": "Datum",
   "ret": "RETOUR NAAR",
   "ticket": "OPDRACHTKAART",
   "steps": "INPAKLIJST",
   "packsteps": ["Onderdelen geteld en gecontroleerd","Steunmateriaal verwijderd, randen schoon","Kwaliteitscontrole met de hand","Onderdelen gezakt en ingepakt","Papieren en labels in de doos","Dozen gesloten en gelabeld"],
   "pass": "PRINT-PASPOORT"
  }
 },
 "templates": [
  {
   "id": "delivery",
   "name": "Delivery label",
   "group": "outside",
   "per": "box",
   "w": 100,
   "h": 150,
   "on": 1,
   "desc": "Big label for the side of the box: box number, order, customer, contents, barcode.",
   "vars": {
    "barcode": {
     "label": "Show barcode",
     "type": "bool",
     "v": 1
    },
    "partZ": {
     "label": "Part list text size (mm)",
     "v": 4.2,
     "min": 2.5,
     "max": 7,
     "step": 0.1
    }
   },
   "elements": [
    {"k":"rect","x":1.5,"y":1.5,"w":"W-3","h":"H-3","s":"ink","sw":0.5,"r":4},
    {"k":"logo","x":6,"y":6,"h":13},
    {"k":"text","x":94,"y":9,"text":"{{t.box}}","z":3,"b":1,"a":"r","f":"mu"},
    {"k":"text","x":94,"y":23,"text":"{{box}}/{{boxes}}","z":17,"b":1,"a":"r"},
    {"k":"rect","x":6,"y":27,"w":88,"h":2,"f":"ac"},
    {"k":"text","x":6,"y":35,"text":"{{t.order}}","z":2.6,"b":1,"f":"mu"},
    {"k":"text","x":6,"y":42,"text":"{{name}}","z":6.5,"fit":88,"b":1},
    {"k":"text","x":6,"y":48,"text":"{{idline}}","z":3.6,"fit":84},
    {"k":"text","x":6,"y":54,"text":"{{info}}","z":3.2,"cut":88,"f":"mu","if":"info"},
    {"k":"line","x":6,"y":58,"x2":94,"y2":58,"s":"ln","sw":0.3},
    {"k":"text","x":6,"y":64,"text":"{{t.inbox}}","z":2.6,"b":1,"f":"mu"},
    {"k":"parts","style":"compact","x":6,"y":72,"w":88,"y2":"barcode?118:H-8","z":"partZ"},
    {"k":"bars","x":6,"y":123,"w":62,"h":13,"if":"barcode"},
    {"k":"text","x":6,"y":141,"text":"{{id}}","z":3,"b":1},
    {"k":"text","x":94,"y":141,"text":"{{brand.footer}}","z":2.6,"a":"r","f":"mu"}
   ]
  },
  {
   "id": "top",
   "name": "Top label",
   "group": "outside",
   "per": "box",
   "w": 150,
   "h": 100,
   "on": 1,
   "desc": "Label for the lid: big box number on a dark band, order and contents.",
   "vars": {
    "barcode": {
     "label": "Show barcode",
     "type": "bool",
     "v": 1
    },
    "partZ": {
     "label": "Part list text size (mm)",
     "v": 3.8,
     "min": 2.5,
     "max": 7,
     "step": 0.1
    }
   },
   "elements": [
    {"k":"rect","x":1,"y":1,"w":"W-2","h":"H-2","s":"ink","sw":0.5,"r":3},
    {"k":"rect","x":1,"y":1,"w":46,"h":"H-2","f":"ink","r":3},
    {"k":"rect","x":30,"y":1,"w":17,"h":"H-2","f":"ink"},
    {"k":"text","x":24,"y":24,"text":"{{t.box}}","z":4.5,"b":1,"a":"m","f":"wh"},
    {"k":"text","x":24,"y":60,"text":"{{box}}","z":36,"fit":38,"b":1,"a":"m","f":"wh"},
    {"k":"text","x":24,"y":75,"text":"{{t.of}} {{boxes}}","z":6.5,"a":"m","f":"lt"},
    {"k":"logo","x":54,"y":8,"h":11},
    {"k":"text","x":54,"y":32,"text":"{{name}}","z":6,"fit":90,"b":1},
    {"k":"text","x":54,"y":38,"text":"{{idline}}","z":3.4,"fit":90,"f":"mu"},
    {"k":"line","x":54,"y":42,"x2":144,"y2":42,"s":"ln","sw":0.3},
    {"k":"parts","style":"compact","x":54,"y":50,"w":90,"y2":78,"z":"partZ"},
    {"k":"bars","x":54,"y":81,"w":50,"h":12,"if":"barcode"},
    {"k":"text","x":144,"y":91,"text":"{{brand.name}}","z":3,"b":1,"a":"r"}
   ]
  },
  {
   "id": "seal",
   "name": "Cut-open seal",
   "group": "outside",
   "per": "box",
   "w": 280,
   "h": 44,
   "on": 1,
   "desc": "Strip over top, side and bottom with a cut line, so the box has to be cut open.",
   "vars": {
    "cutX": {
     "label": "Cut line position (mm from the left)",
     "v": 210,
     "min": 20,
     "max": 260,
     "step": 1
    },
    "fold": {
     "label": "Show fold hints",
     "type": "bool",
     "v": 1
    }
   },
   "elements": [
    {"k":"rect","x":0,"y":10,"w":"W","h":"H-10","f":"wh","s":"ink","sw":0.4},
    {"k":"rect","x":0,"y":10,"w":"W","h":3,"f":"ac"},
    {"k":"rect","x":0,"y":"H-3","w":"W","h":3,"f":"ac"},
    {"k":"rep","v":"x","from":0,"to":"W","step":4,"items":[{"k":"line","x":"x","y":10,"x2":"x+2.6","y2":13,"s":"wh","sw":0.5},{"k":"line","x":"x","y":"H-3","x2":"x+2.6","y2":"H","s":"wh","sw":0.5}]},
    {"k":"line","x":70,"y":13,"x2":70,"y2":"H-3","s":"mu","sw":0.3,"d":[1.6,1.2],"if":"fold"},
    {"k":"line","x":140,"y":13,"x2":140,"y2":"H-3","s":"mu","sw":0.3,"d":[1.6,1.2],"if":"fold"},
    {"k":"line","x":"cutX","y":0.5,"x2":"cutX","y2":"H","s":"ink","sw":0.5,"d":[2,1.3]},
    {"k":"rect","x":"cutX-4.5","y":0.5,"w":9,"h":9.2,"f":"wh"},
    {"k":"rect","x":"cutX-1.9","y":1,"w":2.4,"h":2.4,"s":"ink","sw":0.4,"r":1.2},
    {"k":"rect","x":"cutX-0.5","y":1,"w":2.4,"h":2.4,"s":"ink","sw":0.4,"r":1.2},
    {"k":"line","x":"cutX-0.7","y":3.3,"x2":"cutX+1.6","y2":8.9,"s":"ink","sw":0.5},
    {"k":"line","x":"cutX+0.7","y":3.3,"x2":"cutX-1.6","y2":8.9,"s":"ink","sw":0.5},
    {"k":"logo","x":7,"y":20,"h":15},
    {"k":"text","x":105,"y":24,"text":"{{t.box}}","z":3,"b":1,"a":"m","f":"mu"},
    {"k":"text","x":105,"y":37,"text":"{{box}} / {{boxes}}","z":13,"fit":32,"b":1,"a":"m"},
    {"k":"text","x":175,"y":22,"text":"#{{id}}","z":6,"b":1,"a":"m"},
    {"k":"text","x":175,"y":28.5,"text":"{{name}}","z":3.8,"fit":62,"a":"m"},
    {"k":"text","x":175,"y":35.5,"text":"{{t.cut}}","z":3,"fit":62,"b":1,"a":"m","f":"ac"},
    {"k":"logo","x":219,"y":18,"h":13,"mark":1},
    {"k":"text","x":250,"y":26,"text":"{{brand.name}}","z":7,"b":1,"a":"m"},
    {"k":"text","x":250,"y":33,"text":"{{t.seal}}","z":2.6,"fit":38,"a":"m","f":"mu"}
   ]
  },
  {
   "id": "wrapseal",
   "name": "Bottom & side seal",
   "group": "outside",
   "per": "box",
   "w": "width",
   "h": "sideLen+botLen",
   "on": 0,
   "desc": "Simple sticker that wraps from the side onto the bottom of the box: only the logo and a cut line on the seam.",
   "vars": {
    "width": {
     "label": "Width (mm)",
     "v": 60,
     "min": 30,
     "max": 120,
     "step": 1
    },
    "sideLen": {
     "label": "Length on the side (mm)",
     "v": 60,
     "min": 20,
     "max": 200,
     "step": 1
    },
    "botLen": {
     "label": "Length on the bottom (mm)",
     "v": 45,
     "min": 15,
     "max": 200,
     "step": 1
    },
    "outline": {
     "label": "Hairline outline (cutting guide)",
     "type": "bool",
     "v": 0
    },
    "showBox": {
     "label": "Small box number",
     "type": "bool",
     "v": 0
    }
   },
   "elements": [
    {"k":"rect","x":0.3,"y":0.3,"w":"W-0.6","h":"H-0.6","s":"ln","sw":0.3,"r":2,"if":"outline"},
    {"k":"logo","x":"W/2-8","y":"sideLen/2-14","h":16,"mark":1},
    {"k":"text","x":"W/2","y":"sideLen/2+10","text":"@wordmark","z":7,"fit":"W-10","a":"m"},
    {"k":"line","x":0,"y":"sideLen","x2":"W","y2":"sideLen","s":"ink","sw":0.5,"d":[2,1.3]},
    {"k":"rect","x":0.5,"y":"sideLen-4.5","w":9.2,"h":9,"f":"wh"},
    {"k":"rect","x":1.2,"y":"sideLen-1.9","w":2.4,"h":2.4,"s":"ink","sw":0.4,"r":1.2},
    {"k":"rect","x":1.2,"y":"sideLen-0.5","w":2.4,"h":2.4,"s":"ink","sw":0.4,"r":1.2},
    {"k":"line","x":3.3,"y":"sideLen-0.7","x2":8.9,"y2":"sideLen+1.6","s":"ink","sw":0.5},
    {"k":"line","x":3.3,"y":"sideLen+0.7","x2":8.9,"y2":"sideLen-1.6","s":"ink","sw":0.5},
    {"k":"text","x":"W/2","y":"sideLen+botLen/2+3","text":"{{box}}/{{boxes}}","z":8,"b":1,"a":"m","f":"mu","if":"showBox"}
   ]
  },
  {
   "id": "fragile",
   "name": "Fragile label",
   "group": "outside",
   "per": "box",
   "w": 100,
   "h": 60,
   "on": 0,
   "desc": "Handle-with-care warning with a cracked glass and the box number.",
   "elements": [
    {"k":"rect","x":1,"y":1,"w":"W-2","h":"H-2","s":"ac","sw":1.4,"r":4},
    {"k":"poly","p":[[9,11],[33,11],[28,29],[21,33],[14,29]],"f":"ac"},
    {"k":"rect","x":20,"y":33,"w":2,"h":11,"f":"ac"},
    {"k":"rect","x":13,"y":44,"w":16,"h":2.4,"f":"ac","r":1},
    {"k":"line","x":14,"y":15,"x2":19,"y2":21,"s":"wh","sw":0.9},
    {"k":"line","x":19,"y":21,"x2":17,"y2":26,"s":"wh","sw":0.9},
    {"k":"line","x":17,"y":26,"x2":23,"y2":30,"s":"wh","sw":0.9},
    {"k":"text","x":42,"y":28,"text":"{{t.fragile}}","z":13,"fit":52,"b":1,"f":"ac"},
    {"k":"text","x":42,"y":37,"text":"{{t.handle}}","z":4.4,"fit":52,"b":1},
    {"k":"line","x":42,"y":42,"x2":94,"y2":42,"s":"ln","sw":0.3},
    {"k":"text","x":42,"y":50,"text":"{{t.box}} {{box}}/{{boxes}}  ·  #{{id}}","z":3.4,"fit":52,"f":"mu"}
   ]
  },
  {
   "id": "up",
   "name": "This side up",
   "group": "outside",
   "per": "box",
   "w": 70,
   "h": 68,
   "on": 0,
   "desc": "Two arrows and 'this side up' for the lid side.",
   "elements": [
    {"k":"rect","x":1,"y":1,"w":"W-2","h":"H-2","s":"ink","sw":0.5,"r":3},
    {"k":"poly","p":[[21,8],[11,22],[31,22]],"f":"ac"},
    {"k":"rect","x":17.5,"y":21.5,"w":7,"h":24,"f":"ac"},
    {"k":"poly","p":[[49,8],[39,22],[59,22]],"f":"ac"},
    {"k":"rect","x":45.5,"y":21.5,"w":7,"h":24,"f":"ac"},
    {"k":"text","x":"W/2","y":56,"text":"{{t.up}}","z":6,"fit":60,"b":1,"a":"m"},
    {"k":"text","x":"W/2","y":63,"text":"{{t.box}} {{box}}/{{boxes}}","z":3,"a":"m","f":"mu"}
   ]
  },
  {
   "id": "boxno",
   "name": "Box number sticker",
   "group": "outside",
   "per": "box",
   "w": 50,
   "h": 30,
   "on": 0,
   "desc": "Small sticker with only the box number and order, for extra sides.",
   "elements": [
    {"k":"rect","x":0.5,"y":0.5,"w":"W-1","h":"H-1","s":"ink","sw":0.5,"r":3},
    {"k":"logo","x":4,"y":4,"h":9,"mark":1},
    {"k":"text","x":"W/2","y":8,"text":"{{t.box}}","z":3,"b":1,"a":"m","f":"mu"},
    {"k":"text","x":"W/2","y":21,"text":"{{box}}/{{boxes}}","z":15,"fit":44,"b":1,"a":"m"},
    {"k":"text","x":"W/2","y":27,"text":"#{{id}}","z":3,"b":1,"a":"m"}
   ]
  },
  {
   "id": "slip",
   "name": "Packing slip",
   "group": "inside",
   "per": "box",
   "w": 148,
   "h": 214,
   "on": 1,
   "desc": "A5 list of what is in this box, with tick boxes.",
   "vars": {
    "barcode": {
     "label": "Show barcode",
     "type": "bool",
     "v": 1
    },
    "tick": {
     "label": "Tick boxes",
     "type": "bool",
     "v": 1
    }
   },
   "elements": [
    {"k":"logo","x":10,"y":10,"h":15},
    {"k":"text","x":"W-10","y":17,"text":"{{t.slip}}","z":7,"b":1,"a":"r"},
    {"k":"text","x":"W-10","y":25,"text":"{{t.box}} {{box}} {{t.of}} {{boxes}}","z":4.5,"b":1,"a":"r","f":"ac"},
    {"k":"rect","x":10,"y":31,"w":"W-20","h":1.6,"f":"ac"},
    {"k":"text","x":10,"y":41,"text":"{{name}}","z":6,"fit":128,"b":1},
    {"k":"text","x":10,"y":47,"text":"#{{id}}{{'  ·  '+date}}{{customer?'  ·  '+customer:''}}","z":3.5,"cut":128,"f":"mu"},
    {"k":"rect","x":10,"y":54,"w":128,"h":7,"f":"pp","r":1.5},
    {"k":"text","x":18,"y":59,"text":"{{t.qty}}","z":2.8,"b":1,"f":"mu"},
    {"k":"text","x":34,"y":59,"text":"{{t.part}}","z":2.8,"b":1,"f":"mu"},
    {"k":"parts","style":"slip","x":10,"y":70,"w":128,"y2":168,"tick":"tick"},
    {"k":"text","x":138,"y":177,"text":"{{t.tot}}: {{pieces}}","z":4.2,"b":1,"a":"r"},
    {"k":"bars","x":10,"y":184,"w":50,"h":10,"if":"barcode"},
    {"k":"text","x":10,"y":198,"text":"{{id}}","z":3,"b":1},
    {"k":"para","x":74,"y":205,"w":128,"text":"{{t.chk}}","z":3.2,"lh":4,"a":"m","f":"mu"}
   ]
  },
  {
   "id": "receipt",
   "name": "Receipt",
   "group": "inside",
   "per": "once",
   "w": 80,
   "h": "auto",
   "on": 1,
   "desc": "Receipt strip built from the bill (height follows the content).",
   "elements": [
    {"k":"rc","y":6}
   ]
  },
  {
   "id": "thanks",
   "name": "Thank-you letter",
   "group": "inside",
   "per": "once",
   "w": 148,
   "h": 210,
   "on": 1,
   "desc": "A5 letter that greets the customer by name.",
   "vars": {
    "summary": {
     "label": "Show order summary box",
     "type": "bool",
     "v": 1
    }
   },
   "elements": [
    {"k":"logo","x":10,"y":10,"h":15},
    {"k":"text","x":"W-10","y":17,"text":"{{today}}","z":3.6,"a":"r","f":"mu"},
    {"k":"rect","x":10,"y":31,"w":128,"h":1.6,"f":"ac"},
    {"k":"stack","x":10,"y":50,"w":128,"items":[{"k":"text","text":"{{t.dear}}","z":5.6,"b":1,"adv":12,"fit":128},{"k":"paras","list":"t.letter","z":4.1,"lh":6.2,"gap":4},{"k":"text","text":"{{t.reg}}","z":4.4,"dy":3,"adv":7},{"k":"text","text":"{{brand.sign}}","z":6,"b":1,"f":"ac","dy":3}]},
    {"k":"rect","x":10,"y":166,"w":128,"h":30,"f":"pp","r":3,"if":"summary"},
    {"k":"text","x":16,"y":175,"text":"{{t.yo}}","z":2.7,"b":1,"f":"mu","if":"summary"},
    {"k":"text","x":16,"y":183,"text":"{{name}}","z":5,"fit":116,"b":1,"if":"summary"},
    {"k":"text","x":16,"y":190,"text":"#{{id}}  ·  {{allpieces}} {{t.parts}}  ·  {{boxes}} {{boxes>1?t.boxes:t.box1}}","z":3.4,"cut":116,"f":"mu","if":"summary"},
    {"k":"text","x":"W/2","y":205,"text":"{{brand.footer}}","z":2.8,"a":"m","f":"mu"}
   ]
  },
  {
   "id": "care",
   "name": "Care card",
   "group": "inside",
   "per": "once",
   "w": 105,
   "h": 148,
   "on": 1,
   "desc": "Care tips that follow the materials in the order.",
   "elements": [
    {"k":"logo","x":8,"y":8,"h":12},
    {"k":"rect","x":8,"y":26,"w":"W-16","h":1.4,"f":"ac"},
    {"k":"text","x":8,"y":38,"text":"{{t.care}}","z":6,"fit":"W-16","b":1},
    {"k":"tips","x":14,"bx":9,"y":48,"w":"W-24","y2":"H-14","z":3.8},
    {"k":"text","x":"W/2","y":"H-7","text":"{{brand.footer}}","z":2.8,"a":"m","f":"mu"}
   ]
  },
  {
   "id": "warranty",
   "name": "Help & contact card",
   "group": "inside",
   "per": "once",
   "w": 105,
   "h": 148,
   "on": 0,
   "desc": "Tells the customer what to do if something is wrong, with your contact lines.",
   "elements": [
    {"k":"logo","x":8,"y":8,"h":12},
    {"k":"rect","x":8,"y":26,"w":"W-16","h":1.4,"f":"ac"},
    {"k":"text","x":8,"y":38,"text":"{{t.warr}}","z":6,"fit":"W-16","b":1},
    {"k":"stack","x":8,"y":50,"w":"W-16","items":[{"k":"paras","list":"t.warrl","z":3.9,"lh":5.4,"gap":3}]},
    {"k":"rect","x":8,"y":104,"w":"W-16","h":34,"f":"pp","r":3},
    {"k":"text","x":13,"y":112,"text":"{{t.yo}}","z":2.7,"b":1,"f":"mu"},
    {"k":"text","x":13,"y":119,"text":"#{{id}}","z":6,"fit":"W-26","b":1,"f":"ac"},
    {"k":"text","x":13,"y":127,"text":"{{brand.contact}}","z":3.6,"cut":"W-26","if":"brand.contact"},
    {"k":"text","x":13,"y":133,"text":"{{brand.web}}","z":3.6,"cut":"W-26","if":"brand.web"},
    {"k":"text","x":"W/2","y":"H-7","text":"{{brand.footer}}","z":2.8,"a":"m","f":"mu"}
   ]
  },
  {
   "id": "note",
   "name": "Handwritten note card",
   "group": "inside",
   "per": "once",
   "w": 105,
   "h": 148,
   "on": 0,
   "desc": "Card with writing lines so you can add a personal note by hand.",
   "vars": {
    "lineGap": {
     "label": "Line spacing (mm)",
     "v": 8,
     "min": 5,
     "max": 14,
     "step": 0.5
    }
   },
   "elements": [
    {"k":"logo","x":8,"y":8,"h":12},
    {"k":"rect","x":8,"y":26,"w":"W-16","h":1.4,"f":"ac"},
    {"k":"text","x":8,"y":38,"text":"{{t.noteh}}","z":5.6,"fit":"W-16","b":1},
    {"k":"text","x":8,"y":47,"text":"{{t.to}}: {{customer}}","z":3.8,"fit":"W-16","f":"mu","if":"customer"},
    {"k":"rep","v":"y","from":58,"to":"H-20","step":"lineGap","items":[{"k":"line","x":8,"y":"y","x2":"W-8","y2":"y","s":"ln","sw":0.3}]},
    {"k":"text","x":"W-8","y":"H-9","text":"{{brand.sign}}","z":5,"b":1,"a":"r","f":"ac"}
   ]
  },
  {
   "id": "qc",
   "name": "Quality-checked sticker",
   "group": "inside",
   "per": "once",
   "w": 50,
   "h": 25,
   "on": 0,
   "desc": "Small 'checked by hand' sticker with the date.",
   "elements": [
    {"k":"rect","x":0.5,"y":0.5,"w":"W-1","h":"H-1","s":"ink","sw":0.5,"r":3},
    {"k":"logo","x":3,"y":5,"h":14,"mark":1},
    {"k":"text","x":22,"y":9,"text":"{{t.checked}}","z":3.4,"fit":26,"b":1},
    {"k":"text","x":22,"y":15,"text":"{{t.byhand}}","z":2.8,"fit":26,"f":"mu"},
    {"k":"text","x":22,"y":21,"text":"{{today}}","z":2.8,"fit":26,"f":"mu"}
   ]
  },
  {
   "id": "sticker",
   "name": "Thank-you sticker (round)",
   "group": "inside",
   "per": "once",
   "w": 50,
   "h": 50,
   "on": 0,
   "desc": "Round sticker for the outside or the inside of the lid.",
   "elements": [
    {"k":"rect","x":0.5,"y":0.5,"w":49,"h":49,"f":"ac","r":24.5},
    {"k":"rect","x":3,"y":3,"w":44,"h":44,"s":"wh","sw":0.5,"r":22},
    {"k":"text","x":25,"y":25,"text":"{{t.thankyou}}","z":8,"fit":38,"b":1,"a":"m","f":"wh"},
    {"k":"text","x":25,"y":33,"text":"{{brand.name}}","z":4.2,"fit":34,"b":1,"a":"m","f":"wh"},
    {"k":"text","x":25,"y":40,"text":"{{t.printed}}","z":2.6,"fit":34,"a":"m","f":"wh"}
   ]
  },
  {
   "id": "parttag",
   "name": "Part tag",
   "group": "part",
   "per": "part",
   "w": 60,
   "h": 30,
   "on": 0,
   "desc": "One small tag per part (name, details, quantity and box). Stick it on the bag or the part.",
   "vars": {
    "barcode": {
     "label": "Show order ID",
     "type": "bool",
     "v": 1
    }
   },
   "elements": [
    {"k":"rect","x":0.5,"y":0.5,"w":"W-1","h":"H-1","s":"ink","sw":0.5,"r":2.5},
    {"k":"rect","x":4,"y":4,"w":12,"h":1.4,"f":"ac"},
    {"k":"text","x":4,"y":12,"text":"{{part.name}}","z":5,"fit":52,"b":1},
    {"k":"text","x":4,"y":17.5,"text":"{{part.detail}}","z":3.2,"cut":52,"f":"mu","if":"part.detail"},
    {"k":"text","x":4,"y":26,"text":"{{t.qty2}} {{part.qty}}×  ·  {{t.box}} {{part.box}}","z":3.4,"fit":34,"b":1},
    {"k":"text","x":56,"y":26,"text":"#{{id}}","z":3,"a":"r","f":"mu","if":"barcode"}
   ]
  },
  {
   "id": "lidthanks",
   "name": "Lid thank-you seal",
   "group": "outside",
   "per": "box",
   "w": 60,
   "h": "topLen+botLen",
   "on": 0,
   "desc": "Wrap-around thank-you sticker over the lid seam: brand, headline, vertical THANK YOU, hearts and your social lines, with an optional cut line.",
   "vars": {
    "topLen": {
     "label": "Length on the lid (mm)",
     "v": 55,
     "min": 40,
     "max": 120,
     "step": 1
    },
    "botLen": {
     "label": "Length on the side (mm)",
     "v": 55,
     "min": 30,
     "max": 120,
     "step": 1
    },
    "cut": {
     "label": "Cut line on the seam",
     "type": "bool",
     "v": 1
    }
   },
   "elements": [
    {"k":"text","x":7,"y":11,"text":"{{upper(brand.name)}}","z":3,"fit":"W-26","b":1,"f":"mu"},
    {"k":"line","x":"W-18","y":9,"x2":"W-18","y2":"topLen+8","s":"ink","sw":0.3},
    {"k":"para","x":7,"y":28,"w":"W-27","text":"{{t.headline}}","z":4.6,"lh":5.8,"b":1},
    {"k":"text","x":"W-15","y":9,"text":"{{t.forpurchase}}","z":2.2,"rot":1,"f":"mu"},
    {"k":"text","x":"W-11.5","y":9,"text":"{{t.thanks2}}","z":5,"rot":1},
    {"k":"heart","x":"W/2-4","y":"topLen+14","s":5,"f":"ink"},
    {"k":"heart","x":"W/2+4","y":"topLen+14","s":5,"f":"ink"},
    {"k":"text","x":"W/2","y":"topLen+24","text":"{{t.madewith}}","z":3,"b":1,"a":"m"},
    {"k":"text","x":"W/2","y":"H-19","text":"{{t.social}}","z":2.6,"b":1,"a":"m","if":"brand.contact||brand.web"},
    {"k":"text","x":"W/2","y":"H-13","text":"{{brand.contact}}","z":3,"a":"m","cut":"W-8","if":"brand.contact"},
    {"k":"text","x":"W/2","y":"H-8","text":"{{brand.web}}","z":3,"a":"m","cut":"W-8","if":"brand.web"},
    {"k":"line","x":0,"y":"topLen","x2":"W","y2":"topLen","s":"ink","sw":0.5,"d":[2,1.3],"if":"cut"},
    {"k":"rect","x":0.5,"y":"topLen-4.5","w":9.2,"h":9,"f":"wh","if":"cut"},
    {"k":"rect","x":1.2,"y":"topLen-1.9","w":2.4,"h":2.4,"s":"ink","sw":0.4,"r":1.2,"if":"cut"},
    {"k":"rect","x":1.2,"y":"topLen-0.5","w":2.4,"h":2.4,"s":"ink","sw":0.4,"r":1.2,"if":"cut"},
    {"k":"line","x":3.3,"y":"topLen-0.7","x2":8.9,"y2":"topLen+1.6","s":"ink","sw":0.5,"if":"cut"},
    {"k":"line","x":3.3,"y":"topLen+0.7","x2":8.9,"y2":"topLen-1.6","s":"ink","sw":0.5,"if":"cut"}
   ]
  },
  {
   "id": "reviewcard",
   "name": "Review request card",
   "group": "inside",
   "per": "once",
   "w": 105,
   "h": 95,
   "on": 0,
   "desc": "Asks for a review or a photo of the print in use, with your contact lines.",
   "elements": [
    {"k":"logo","x":8,"y":8,"h":12},
    {"k":"heart","x":"W-22","y":14,"s":6},
    {"k":"heart","x":"W-13","y":14,"s":6},
    {"k":"rect","x":8,"y":26,"w":"W-16","h":1.2,"f":"ac"},
    {"k":"text","x":8,"y":37,"text":"{{t.revh}}","z":6,"fit":"W-16","b":1},
    {"k":"paras","x":8,"y":46,"w":"W-16","list":"t.revl","z":3.6,"lh":4.8,"gap":2},
    {"k":"text","x":8,"y":"H-12","text":"{{brand.contact}}","z":3.6,"cut":"W-16","b":1,"if":"brand.contact"},
    {"k":"text","x":8,"y":"H-6.5","text":"{{brand.web}}","z":3.6,"cut":"W-16","f":"mu","if":"brand.web"}
   ]
  },
  {
   "id": "passport",
   "name": "Print passport (card)",
   "group": "inside",
   "per": "once",
   "w": 85,
   "h": 55,
   "on": 0,
   "desc": "Credit-card sized card with the material, weight and print time of the order.",
   "elements": [
    {"k":"rect","x":0.5,"y":0.5,"w":"W-1","h":"H-1","s":"ink","sw":0.4,"r":3},
    {"k":"logo","x":5,"y":5,"h":10},
    {"k":"text","x":"W-5","y":10,"text":"{{t.pass}}","z":3.2,"b":1,"a":"r","f":"ac"},
    {"k":"rect","x":5,"y":15,"w":"W-10","h":0.8,"f":"ac"},
    {"k":"text","x":5,"y":24,"text":"{{t.material}}","z":2.8,"f":"mu"},
    {"k":"text","x":"W-5","y":24,"text":"{{material}}","z":3.6,"b":1,"a":"r","fit":50,"if":"material"},
    {"k":"text","x":5,"y":31,"text":"{{t.weight}}","z":2.8,"f":"mu"},
    {"k":"text","x":"W-5","y":31,"text":"{{weight}}","z":3.6,"b":1,"a":"r","fit":50,"if":"weight"},
    {"k":"text","x":5,"y":38,"text":"{{t.ptime}}","z":2.8,"f":"mu"},
    {"k":"text","x":"W-5","y":38,"text":"{{time}}","z":3.6,"b":1,"a":"r","fit":50,"if":"time"},
    {"k":"text","x":5,"y":45,"text":"{{t.pdate}}","z":2.8,"f":"mu"},
    {"k":"text","x":"W-5","y":45,"text":"{{date}}","z":3.6,"b":1,"a":"r","fit":50},
    {"k":"text","x":5,"y":"H-3.5","text":"#{{id}}","z":2.6,"f":"mu"},
    {"k":"text","x":"W-5","y":"H-3.5","text":"{{brand.footer}}","z":2.4,"a":"r","f":"mu","cut":50}
   ]
  },
  {
   "id": "returnlabel",
   "name": "Return address label",
   "group": "outside",
   "per": "once",
   "w": 70,
   "h": 32,
   "on": 0,
   "desc": "Small 'return to' label with your name, address and contact line.",
   "elements": [
    {"k":"rect","x":0.5,"y":0.5,"w":"W-1","h":"H-1","s":"ink","sw":0.5,"r":3},
    {"k":"logo","x":"W-14","y":3,"h":10,"mark":1},
    {"k":"text","x":4,"y":8,"text":"{{t.ret}}","z":2.6,"b":1,"f":"mu"},
    {"k":"text","x":4,"y":16,"text":"{{brand.name}}","z":5.5,"fit":50,"b":1},
    {"k":"text","x":4,"y":22.5,"text":"{{brand.address}}","z":3.2,"cut":62,"if":"brand.address"},
    {"k":"text","x":4,"y":27.5,"text":"{{brand.contact}}","z":3,"f":"mu","cut":62,"if":"brand.contact"}
   ]
  },
  {
   "id": "tape",
   "name": "Thank-you tape strip",
   "group": "outside",
   "per": "once",
   "w": "length",
   "h": 16,
   "on": 0,
   "desc": "Long narrow strip with the logo mark and 'Thank you!' repeated, for taping over the seam. Turn it 90° for a vertical run.",
   "vars": {
    "length": {
     "label": "Length (mm)",
     "v": 200,
     "min": 60,
     "max": 400,
     "step": 5
    },
    "step": {
     "label": "Space between repeats (mm)",
     "v": 48,
     "min": 30,
     "max": 120,
     "step": 1
    }
   },
   "elements": [
    {"k":"rect","x":0,"y":0,"w":"W","h":1.2,"f":"ac"},
    {"k":"rect","x":0,"y":"H-1.2","w":"W","h":1.2,"f":"ac"},
    {"k":"rep","v":"x","from":4,"to":"W-30","step":"step","items":[{"k":"logo","x":"x","y":3.2,"h":10,"mark":1},{"k":"text","x":"x+12","y":9.8,"text":"{{t.thankyou}}","z":4.4,"b":1}]}
   ]
  },
  {
   "id": "ticket",
   "name": "Job ticket",
   "group": "workshop",
   "per": "once",
   "w": 100,
   "h": 60,
   "on": 0,
   "desc": "Internal ticket for the print queue: order, material, weight, print time, due date and barcode.",
   "elements": [
    {"k":"rect","x":0.5,"y":0.5,"w":"W-1","h":"H-1","s":"ink","sw":0.5,"r":3},
    {"k":"text","x":5,"y":9,"text":"{{t.ticket}}","z":2.8,"b":1,"f":"mu"},
    {"k":"text","x":"W-5","y":9,"text":"{{boxes}} {{boxes>1?t.boxes:t.box1}}","z":3.6,"b":1,"a":"r","f":"ac"},
    {"k":"text","x":5,"y":19,"text":"{{name}}","z":7,"fit":90,"b":1},
    {"k":"text","x":5,"y":25,"text":"{{idline}}","z":3.4,"fit":90,"f":"mu"},
    {"k":"line","x":5,"y":28,"x2":"W-5","y2":28,"s":"ln","sw":0.3},
    {"k":"text","x":5,"y":34,"text":"{{t.material}}","z":2.3,"f":"mu"},
    {"k":"text","x":5,"y":40,"text":"{{material}}","z":4,"fit":28,"b":1},
    {"k":"text","x":37,"y":34,"text":"{{t.weight}}","z":2.3,"f":"mu"},
    {"k":"text","x":37,"y":40,"text":"{{weight}}","z":4,"fit":26,"b":1},
    {"k":"text","x":66,"y":34,"text":"{{t.ptime}}","z":2.3,"f":"mu"},
    {"k":"text","x":66,"y":40,"text":"{{time}}","z":4,"fit":29,"b":1},
    {"k":"text","x":5,"y":47,"text":"{{t.need}} {{due}}","z":3.6,"b":1,"f":"ac","if":"due"},
    {"k":"bars","x":5,"y":50,"w":55,"h":6},
    {"k":"text","x":"W-5","y":55,"text":"#{{id}}","z":3,"b":1,"a":"r"}
   ]
  },
  {
   "id": "checklist",
   "name": "Pack checklist",
   "group": "workshop",
   "per": "once",
   "w": 105,
   "h": 148,
   "on": 0,
   "desc": "Internal tick-box list for packing the order, with the order details and barcode.",
   "elements": [
    {"k":"logo","x":8,"y":8,"h":12},
    {"k":"text","x":"W-8","y":14,"text":"{{today}}","z":3.2,"a":"r","f":"mu"},
    {"k":"rect","x":8,"y":26,"w":"W-16","h":1.4,"f":"ac"},
    {"k":"text","x":8,"y":37,"text":"{{t.steps}}","z":5.6,"fit":"W-16","b":1},
    {"k":"text","x":8,"y":44,"text":"{{name}}","z":4,"fit":"W-16","b":1},
    {"k":"text","x":8,"y":49.5,"text":"{{idline}}","z":3,"fit":"W-16","f":"mu"},
    {"k":"checks","x":8,"y":62,"w":"W-16","list":"t.packsteps","z":4,"gap":4.2},
    {"k":"bars","x":8,"y":"H-24","w":50,"h":9},
    {"k":"text","x":8,"y":"H-9","text":"{{allpieces}} {{t.parts}}  ·  {{boxes}} {{boxes>1?t.boxes:t.box1}}","z":3.4,"f":"mu"}
   ]
  }
 ]
};
