/** Official Getzner media URLs (getzner.com) — product & railway visuals */
export const GETZNER = {
  logo: 'https://www.getzner.com/build/website/getzner/img/logos/logo-getzner.png',
  heroRail:
    'https://www.getzner.com/uploads/media/1440x615/07/48957-Header%20L%C3%B6sungen%20f%C3%BCr%20den%20Bahnoberbau1.jpg?v=1-0',
  gotthard:
    'https://www.getzner.com/uploads/media/427x240/03/48953-L%C3%B6sungen%20f%C3%BCr%20den%20Bahnoberbau_Bahnl%C3%B6sungen%20am%20Beispiel%20der%20Schweiz%20Gotthard%20Tunnel.webp?v=1-0',
  sylodynSamples:
    'https://www.getzner.com/uploads/media/768x364/01/49291-Sylodyn%20Material%20Series%20Samples.jpg?v=1-0',
  sylomerSamples:
    'https://www.getzner.com/uploads/media/768x364/09/49289-Material%20Series%20Sylomer%20Samples.jpg?v=1-0',
  insertionPads:
    'https://www.getzner.com/uploads/media/330x330/08/108-PIktogramm_Bahn_Einlageplatten_fuer_Schwellenschuhe_LVT.webp?v=5-0',
  massSpring:
    'https://www.getzner.com/uploads/media/330x330/02/112-PIktogramm_Bahn_Masse_Feder_System_Streifenfoermig.webp?v=5-0',
  railwayDiagram:
    'https://www.getzner.com/uploads/media/1180x/03/48983-L%C3%B6sungen%20f%C3%BCr%20den%20Bahnoberbau_Grafik%20Produkte%20f%C3%BCr%20den%20Bahnoberbau%20EN.png?v=2-0',
  vibrationIsolation:
    'https://www.getzner.com/uploads/media/1180x/05/48945-Funktionsbereiche_Vibrationsisolierung%2C%20Schutz%20vom%20Bahnoberbau%20und%20L%C3%A4rmreduktion_Schwingungsisolierung%20an%20der%20Quelle_Integrierte%20L%C3%B6sungsans%C3%A4tze_EN.png?v=3-0',
};

export const PRODUCTS = [
  {
    id: 'sylodyn',
    name: 'Sylodyn®',
    image: GETZNER.sylodynSamples,
    url: 'https://www.getzner.com/en/products/sylodyn',
    blurb:
      'Polyurethan mit hoher dynamischer Steifigkeit — präzise Schwingungsisolierung für Hochgeschwindigkeitsstrecken und Punktlasten.',
  },
  {
    id: 'sylomer',
    name: 'Sylomer®',
    image: GETZNER.sylomerSamples,
    url: 'https://www.getzner.com/en/products/sylomer',
    blurb:
      'Bewährtes Elastomer für definierte Federkennlinien im Oberbau — reduziert Körperschall und Materialverschleiß.',
  },
  {
    id: 'insertion',
    name: 'Einlageplatten LVT',
    image: GETZNER.insertionPads,
    url: 'https://www.getzner.com/en-us/products/rail-products/elastic-insertion-pads-for-sleeper-boots',
    blurb: 'Elastische Einlagen in Schwellenschuhen für Fertigbetonoberbau — mehr Masse im Schwingungspfad.',
  },
  {
    id: 'mass-spring',
    name: 'Masse-Feder-System',
    image: GETZNER.massSpring,
    url: 'https://www.getzner.com/media/850/download/Brochure%20Mass-Spring%20Systems%20EN.pdf?v=3',
    blurb: 'Höchste Anforderungen an Körperschallschutz — Sylomer®/Sylodyn® als dauerelastische Lager.',
  },
];
