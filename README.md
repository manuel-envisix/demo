# Ein Satz

Bühne für das Vorarlberger Wirtschaftsforum. Der Satz vom Vocci-Ring kommt auf die Leinwand, daraus wird eine kurze Vorlage geschrieben, und drei Uhren messen, wie lange das gedauert hat.

- `/` ist die Leinwand.
- `/regie` ist das Telefon. Nicht auf die Leinwand legen.
- `/api/today` liefert Euro-Referenzkurs und Strom-Spot, nur zur Verwendung wenn der gesprochene Satz danach fragt.

Lokal: `INGEST_TOKEN` setzen, dann `npm run dev`. Ohne Datenbank läuft die Bühne gegen PGlite. Mit `DATABASE_URL` gegen Postgres.
