/**
 * Figital Celular - Servidor Express
 * Serve os arquivos estáticos e a API de celulares
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Servir arquivos estáticos ───────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── Rota principal ──────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// ─── API: listar todos os celulares ─────────────────────────────────────────
app.get('/api/celulares', (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'data', 'celulares.json');
    const raw = fs.readFileSync(dataPath, 'utf8');
    const celulares = JSON.parse(raw);
    res.json({ success: true, data: celulares });
  } catch (err) {
    console.error('Erro ao ler celulares.json:', err);
    res.status(500).json({ success: false, message: 'Erro ao carregar produtos.' });
  }
});

// ─── API: celulares em destaque ──────────────────────────────────────────────
app.get('/api/celulares/destaques', (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'data', 'celulares.json');
    const raw = fs.readFileSync(dataPath, 'utf8');
    const celulares = JSON.parse(raw);
    const destaques = celulares.filter(c => c.destaque === true);
    res.json({ success: true, data: destaques });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao carregar destaques.' });
  }
});

// ─── Iniciar servidor ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Figital Celular rodando em http://localhost:${PORT}\n`);
});