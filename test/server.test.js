const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer, photos } = require('../server');

let server;
let baseUrl;

test.before(async () => {
  const app = createServer();
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});

test('retorna feed de fotos na API', async () => {
  const response = await fetch(`${baseUrl}/api/photos`);
  assert.equal(response.status, 200);

  const body = await response.json();
  assert.deepEqual(body.photos, photos);
});

test('renderiza HTML SSR no endpoint principal', async () => {
  const response = await fetch(`${baseUrl}/`);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /<main class="feed">/);
  assert.match(html, /Manhã no centro/);
  assert.match(html, /<img class="card-image" src="\/images\/morning.svg"/);
});
