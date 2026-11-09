/** Offizielle Getzner-Medien (getzner.com) */
export const GETZNER = {
  logo: 'https://www.getzner.com/build/website/getzner/img/logos/logo-getzner.png',
  sylodynSamples:
    'https://www.getzner.com/uploads/media/768x364/01/49291-Sylodyn%20Material%20Series%20Samples.jpg?v=1-0',
  sylomerSamples:
    'https://www.getzner.com/uploads/media/768x364/09/49289-Material%20Series%20Sylomer%20Samples.jpg?v=1-0',
  insertionPads:
    'https://www.getzner.com/uploads/media/330x330/08/108-PIktogramm_Bahn_Einlageplatten_fuer_Schwellenschuhe_LVT.webp?v=5-0',
  massSpring:
    'https://www.getzner.com/uploads/media/330x330/02/112-PIktogramm_Bahn_Masse_Feder_System_Streifenfoermig.webp?v=5-0',
};

export const PRODUCTS = [
  {
    id: 'sleeper-boot',
    name: 'Getzner Schwellensohle',
    image: GETZNER.insertionPads,
    thumb: GETZNER.insertionPads,
    url: 'https://www.getzner.com/en-us/products/rail-products/elastic-insertion-pads-for-sleeper-boots',
    placement: 'Unter jeder Betonschwelle · Schwellenschuh mit Sylomer®',
    blurb:
      'Elastische Schwellensohle im Schwellenschuh: entkoppelt die Schwelle vom Schotter, verlängert den Schwingungspfad und reduziert Körperschall (illustrativ).',
    primary: true,
    sceneFocus: true,
    material: 'Sylomer®',
  },
  {
    id: 'sylomer',
    name: 'Sylomer®',
    image: GETZNER.sylomerSamples,
    thumb: GETZNER.sylomerSamples,
    url: 'https://www.getzner.com/en/products/sylomer',
    placement: 'Werkstoff der Schwellensohle / definierte Federkennlinien',
    blurb: 'Bewährtes Polyurethan-Elastomer — in dieser Demo als Material der Schwellensohle dargestellt.',
    alternative: true,
  },
  {
    id: 'sylodyn',
    name: 'Sylodyn®',
    image: GETZNER.sylodynSamples,
    thumb: GETZNER.sylodynSamples,
    url: 'https://www.getzner.com/en/products/sylodyn',
    placement: 'Alternative bei höheren Punktlasten (z. B. Baseplate Pads)',
    blurb: 'Höhere dynamische Steifigkeit — alternative Lösung, hier nicht gleichzeitig mit Sohle verbaut.',
    alternative: true,
  },
  {
    id: 'insertion',
    name: 'Einlageplatten LVT',
    image: GETZNER.insertionPads,
    thumb: GETZNER.insertionPads,
    url: 'https://www.getzner.com/en-us/products/rail-products/elastic-insertion-pads-for-sleeper-boots',
    placement: 'Zusätzliche Elastizität in Schwellenschuhen (Fertigbeton)',
    blurb: 'Ergänzende Einlagen im Sonneville-LVT-System — alternative Konfiguration.',
    alternative: true,
  },
  {
    id: 'mass-spring',
    name: 'Masse-Feder-System',
    image: GETZNER.massSpring,
    thumb: GETZNER.massSpring,
    url: 'https://www.getzner.com/media/850/download/Brochure%20Mass-Spring%20Systems%20EN.pdf?v=3',
    placement: 'Entkoppelte Masse — anderer Anwendungsfall',
    blurb: 'Systemlösung für höchsten Körperschallschutz, nicht als Einzelsohle modelliert.',
    alternative: true,
  },
];
