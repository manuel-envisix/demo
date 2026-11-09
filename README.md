# Ein Satz

Statische Bühne für das Vorarlberger Wirtschaftsforum. Eine Aufgabe vom Vocci-Ring wird zu einer öffentlichen HTML-Seite. Drei Uhren messen, wie lange das gedauert hat.

Der Ordner ist die ganze App. Kein Build, kein Node-Prozess, keine Datenbank. Ein Webserver liefert die Dateien aus, zum Beispiel nginx oder `python3 -m http.server`.

- `index.html` ist die Leinwand.
- `gebaut.html` ist die öffentliche Seite.
- `regie.html` ist das Telefon. Nicht auf die Leinwand legen.
- `state.json` sagt der Leinwand, welcher Satz gerade gilt. Sie liest die Datei jede Sekunde.

Die Leinwand und `gebaut.html` müssen über http laufen, nicht als lokale Datei.

Live: https://ring-demo.envisix.at – jeder Push auf `cursor/ring-buehne-da52` deployt automatisch (~30–60 s).

## Live

Composer schreibt den Block. Im Ordner der Seite:

```bash
python3 uebernehmen.py block.txt
```

Damit liegen Satz und Seite auf der Platte. Wer die Adresse offen hat, sieht sie nach spätestens einer Sekunde.

```bash
python3 uebernehmen.py --aufnahme
python3 uebernehmen.py --nochmal
python3 uebernehmen.py --bereit
```

Steht der Projektor auf demselben Rechner, reicht auch Regie oder Einfügen auf der Leinwand. Die öffentliche Datei ändert das nur das Skript.

Eine Zahl nur, wenn die Aufgabe danach fragt. Strom kommt von Awattar, der Euro-Referenzkurs von der EZB. Beides steht im Auftrag auf der Regie. Nichts davon erfinden.
