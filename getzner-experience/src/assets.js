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
  baseplate:
    'https://www.getzner.com/uploads/media/1180x/03/48983-L%C3%B6sungen%20f%C3%BCr%20den%20Bahnoberbau_Grafik%20Produkte%20f%C3%BCr%20den%20Bahnoberbau%20EN.png?v=2-0',
  isotop:
    'https://www.getzner.com/uploads/media/330x330/08/188-Getzner-Produkte-Industrie-Waggonbodenlagerungen.webp?v=2-0',
};

export const PRODUCTS = [
  {
    id: 'sylomer',
    name: 'Sylomer®',
    image: GETZNER.sylomerSamples,
    thumb: GETZNER.sylomerSamples,
    url: 'https://www.getzner.com/en/products/sylomer',
    placement: 'Schienenlager / definierte Federkennlinie im Oberbau',
    blurb:
      'Polyurethan-Elastomer für Elastizität im Bahnoberbau — reduziert Körperschall und Verschleiß (illustrative Demo-Werte).',
  },
  {
    id: 'sylodyn',
    name: 'Sylodyn®',
    image: GETZNER.sylodynSamples,
    thumb: GETZNER.sylodynSamples,
    url: 'https://www.getzner.com/en/products/sylodyn',
    placement: 'Hochbelastete Lager, z. B. Baseplate Pads / HGV',
    blurb:
      'Höhere dynamische Steifigkeit, geschlossene Zellstruktur — für Hochgeschwindigkeit und Punktlasten.',
  },
  {
    id: 'insertion',
    name: 'Einlageplatten LVT',
    image: GETZNER.insertionPads,
    thumb: GETZNER.insertionPads,
    url: 'https://www.getzner.com/en-us/products/rail-products/elastic-insertion-pads-for-sleeper-boots',
    placement: 'Schwellenschuhe · Fertigbetonoberbau',
    blurb: 'Zusätzliche Masse im Schwingungspfad — typisch in Tunnel- und Slab-Track-Abschnitten.',
  },
  {
    id: 'mass-spring',
    name: 'Masse-Feder-System',
    image: GETZNER.massSpring,
    thumb: GETZNER.massSpring,
    url: 'https://www.getzner.com/media/850/download/Brochure%20Mass-Spring%20Systems%20EN.pdf?v=3',
    placement: 'Entkopplung der gesamten Überbau-Masse',
    blurb: 'Maximaler Körperschallschutz mit Sylomer® / Sylodyn® als dauerelastische Lager.',
  },
  {
    id: 'isotop',
    name: 'Isotop®',
    image: GETZNER.isotop,
    thumb: GETZNER.isotop,
    url: 'https://www.getzner.com/en/products/isotop',
    placement: 'Maschinen- und Systemlager (kein Gleisfeld)',
    blurb:
      'Feder-Elemente mit Metall und Polyurethan — hier nur zur Produktfamilie, nicht als verbaute Gleislösung dargestellt.',
    illustrativeOnly: true,
  },
];
