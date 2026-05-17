const path = require('node:path');
const express = require('express');
const React = require('react');
const { renderToString } = require('react-dom/server');

const photos = [
  {
    id: 1,
    title: 'Manhã no centro',
    location: 'São Paulo',
    imageUrl: '/images/morning.svg'
  },
  {
    id: 2,
    title: 'Fim de tarde',
    location: 'Porto',
    imageUrl: '/images/sunset.svg'
  },
  {
    id: 3,
    title: 'Noite suave',
    location: 'Rio de Janeiro',
    imageUrl: '/images/night.svg'
  }
];

function PhotoCard({ photo }) {
  return React.createElement(
    'article',
    { className: 'card' },
    React.createElement('img', {
      className: 'card-image',
      src: photo.imageUrl,
      alt: `${photo.title} - ${photo.location}`,
      loading: 'lazy'
    }),
    React.createElement(
      'div',
      { className: 'card-meta' },
      React.createElement('h2', null, photo.title),
      React.createElement('p', null, photo.location)
    )
  );
}

function Gallery({ feed }) {
  return React.createElement(
    'main',
    { className: 'feed' },
    feed.map((photo) => React.createElement(PhotoCard, { key: photo.id, photo }))
  );
}

function renderPage(feed) {
  const galleryMarkup = renderToString(React.createElement(Gallery, { feed }));

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Galeria pessoal</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <header class="header">
      <h1>galeria</h1>
      <p>feed pessoal minimalista</p>
    </header>
    <div id="root">${galleryMarkup}</div>
  </body>
</html>`;
}

function createServer() {
  const app = express();

  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/api/photos', (_req, res) => {
    res.json({ photos });
  });

  app.get('/', (_req, res) => {
    res.send(renderPage(photos));
  });

  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

module.exports = {
  createServer,
  photos,
  renderPage
};
