# Mini Library

Piccola API per consultare libri e registrare prestiti.

## Prerequisiti

- Node.js 20 o successivo e npm.
- Se non è disponibile un binario precompilato di `better-sqlite3`, servono Python 3 e gli strumenti di compilazione C/C++ del sistema.

## Installazione e avvio

Dalla cartella della repository:

```sh
npm install
npm run db:init
npm start
```

Il server risponde su `http://localhost:3000`. È possibile cambiare porta con `PORT=3001 npm start`.

Durante lo sviluppo, `npm run dev` riavvia il server quando vengono modificati i sorgenti.

Il database è `database/library.sqlite`. Per azzerarlo e ripristinare i dati di esempio, arrestare il server ed eseguire nuovamente `npm run db:init`: tutti i dati precedenti vengono eliminati. La variabile `DB_PATH` permette di scegliere un altro file SQLite in una cartella esistente.

## Test

```sh
npm test
```

I test avviano Express su una porta effimera e usano SQLite in memoria (`:memory:`), con schema e dati seed ripristinati prima di ogni test. Non creano file e non modificano il database dell'applicazione.

## Endpoint

| Metodo | Percorso | Risultato |
| --- | --- | --- |
| POST | `/loans` | Crea un prestito di 14 giorni e restituisce il prestito con stato `201` |
| GET | `/books/:id` | Restituisce il libro con stato `200`, oppure `404` |

Per creare un prestito, `memberId` e `bookId` devono essere numeri interi positivi nel JSON. Il socio deve esistere, essere attivo e avere meno di 3 prestiti attivi; il libro deve esistere e avere copie disponibili. Le date sono stringhe ISO 8601 in UTC; `returnedAt` è `null` per un prestito attivo.

Gli errori applicativi hanno formato `{"error":"CODICE","message":"Descrizione"}`: `400` per input non valido, `403` per socio inattivo, `404` per socio o libro inesistente, `409` per copie esaurite o limite dei prestiti raggiunto. Il JSON malformato viene rifiutato direttamente da Express con stato `400`.

Dopo l'inizializzazione: i soci `1` e `2` sono attivi, il socio `3` è inattivo, il socio `4` ha già 3 prestiti attivi. I libri `1`, `2` e `4` hanno copie disponibili; il libro `3` non ne ha. Il campo SQLite `active` vale `1` per i soci attivi e `0` per quelli inattivi.

```sh
curl -i http://localhost:3000/books/2

curl -i -X POST http://localhost:3000/loans \
  -H 'Content-Type: application/json' \
  -d '{"memberId":1,"bookId":2}'

curl -i -X POST http://localhost:3000/loans \
  -H 'Content-Type: application/json' \
  -d '{"memberId":3,"bookId":2}'
```
