import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import QRCode from 'qrcode';
import https from 'https';

const isWin = process.platform === 'win32';

// Cargar variables de entorno desde .env manualmente
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

// 1. Función para verificar si el servidor local ya está respondiendo
function checkServerReady(port = 3000) {
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: '127.0.0.1',
        port,
        path: '/',
        method: 'GET',
        rejectUnauthorized: false,
        timeout: 2000,
      },
      (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 500);
      }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function showBanner(tunnelUrl, isPermanent = false) {
  fs.writeFileSync(path.join(process.cwd(), 'tunnel-url.txt'), tunnelUrl);

  let qrText = '';
  try {
    qrText = await QRCode.toString(tunnelUrl, { type: 'terminal', small: true });
  } catch (e) {
    qrText = '';
  }

  console.log('\n' + '='.repeat(70));
  if (isPermanent) {
    console.log('  🚀 MOTOTALLER - EN LÍNEA CON ENLACE FIJO PERMANENTE (NGROK)');
  } else {
    console.log('  🚀 MOTOTALLER - EN LÍNEA CON CLOUDFLARE TUNNEL');
  }
  console.log('='.repeat(70));
  console.log('\n  📱 ENLACE OFICIAL PARA TU CELULAR (Guárdalo en Favoritos):');
  console.log('     (Funciona en cualquier Wi-Fi o datos 4G/5G, nunca cambia)\n');
  console.log(`     👉 \x1b[36m\x1b[1m${tunnelUrl}\x1b[0m\n`);

  if (qrText) {
    console.log('  📷 O escanea este código QR con la cámara de tu celular:');
    console.log(qrText);
  }

  console.log('  💻 ACCESO DIRECTO EN ESTA COMPUTADORA:');
  console.log('     👉 \x1b[32mhttps://localhost:3000\x1b[0m\n');
  console.log('='.repeat(70));
  console.log('  [El sistema está en funcionamiento. Presiona Ctrl + C para detener]');
  console.log('='.repeat(70) + '\n');

  if (isWin) {
    spawn('cmd.exe', ['/c', 'start', 'https://localhost:3000'], { detached: true, stdio: 'ignore' });
  }
}

async function main() {
  console.clear?.();
  console.log('='.repeat(65));
  console.log('       MOTOTALLER - SISTEMA POS Y GESTIÓN DE TALLER');
  console.log('              Iniciando Servicios Seguros...');
  console.log('='.repeat(65));

  let nextProcess = null;
  const isAlreadyRunning = await checkServerReady(3000);

  if (isAlreadyRunning) {
    console.log('[OK] Servidor Next.js ya detectado y en ejecución en puerto 3000.');
  } else {
    console.log('[*] Levantando servidor Next.js...');
    const npmCmd = isWin ? 'npm.cmd' : 'npm';
    nextProcess = spawn(npmCmd, ['run', 'dev'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    nextProcess.stdout.on('data', () => {});
    nextProcess.stderr.on('data', () => {});

    let ready = false;
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      ready = await checkServerReady(3000);
      if (ready) break;
    }

    if (!ready) {
      console.log('[!] Esperando a que el servidor termine de inicializar...');
    } else {
      console.log('[OK] Servidor Next.js listo y activo.');
    }
  }

  const ngrokToken = process.env.NGROK_AUTHTOKEN;
  const ngrokDomain = process.env.NGROK_DOMAIN;

  // PRIORIDAD 1: NGROK CON DOMINIO FIJO PERMANENTE
  if (ngrokToken && ngrokDomain) {
    try {
      console.log(`[*] Conectando a tu dominio fijo ngrok (${ngrokDomain})...`);
      const ngrok = await import('@ngrok/ngrok');
      const listener = await ngrok.default.forward({
        addr: 'https://localhost:3000',
        authtoken: ngrokToken,
        domain: ngrokDomain,
        verify_upstream_tls: false,
      });

      const tunnelUrl = listener.url();
      await showBanner(tunnelUrl, true);

      // Mantener proceso vivo indefinidamente con timer activo
      const keepAlive = setInterval(() => {}, 1000 * 60 * 60);

      process.on('SIGINT', async () => {
        console.log('\n[*] Deteniendo túnel ngrok y servicios...');
        clearInterval(keepAlive);
        try { await listener.close(); } catch {}
        if (nextProcess) { try { nextProcess.kill(); } catch {} }
        process.exit(0);
      });
      return;
    } catch (err) {
      console.warn('[!] Error conectando con ngrok, usando Cloudflare como respaldo:', err?.message || err);
    }
  }

  // PRIORIDAD 2: CLOUDFLARE TUNNEL (Fallback)
  console.log('[*] Abriendo túnel seguro Cloudflare...');
  const cloudflaredExe = path.join(process.cwd(), 'bin', isWin ? 'cloudflared.exe' : 'cloudflared');

  if (!fs.existsSync(cloudflaredExe)) {
    console.error('[ERROR] No se encontró binario de túnel en:', cloudflaredExe);
    process.exit(1);
  }

  const tunnel = spawn(
    cloudflaredExe,
    [
      'tunnel',
      '--protocol',
      'http2',
      '--url',
      'https://localhost:3000',
      '--no-tls-verify',
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] }
  );

  let tunnelUrl = null;

  async function onLine(line) {
    const match = line.match(/(https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com)/);
    if (match && !tunnelUrl) {
      tunnelUrl = match[1];
      await showBanner(tunnelUrl, false);
    }
  }

  readline.createInterface({ input: tunnel.stdout }).on('line', onLine);
  readline.createInterface({ input: tunnel.stderr }).on('line', onLine);

  function cleanExit() {
    console.log('\n[*] Deteniendo servicios...');
    try { tunnel.kill(); } catch {}
    if (nextProcess) {
      try { nextProcess.kill(); } catch {}
    }
    process.exit(0);
  }

  process.on('SIGINT', cleanExit);
  process.on('SIGTERM', cleanExit);
}

main().catch((err) => {
  console.error('[ERROR]', err);
});
