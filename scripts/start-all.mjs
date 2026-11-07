import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import QRCode from 'qrcode';
import https from 'https';
import http from 'http';

const isWin = process.platform === 'win32';
const cloudflaredExe = path.join(process.cwd(), 'bin', isWin ? 'cloudflared.exe' : 'cloudflared');

if (!fs.existsSync(cloudflaredExe)) {
  console.error('[ERROR] No se encontró el binario de Cloudflare Tunnel en:', cloudflaredExe);
  process.exit(1);
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

    nextProcess.stdout.on('data', (d) => {
      const text = d.toString();
      if (text.includes('Ready in') || text.includes('Compiled')) {
        // Silencioso o log sutil
      }
    });

    nextProcess.stderr.on('data', (d) => {
      const err = d.toString();
      if (!err.includes('Self-signed') && !err.includes('ExperimentalWarning')) {
        // Solo mostrar errores reales
      }
    });

    // Esperar hasta que responda el puerto 3000
    let ready = false;
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      ready = await checkServerReady(3000);
      if (ready) break;
    }

    if (!ready) {
      console.log('[!] El servidor está tardando en responder, intentando conectar túnel...');
    } else {
      console.log('[OK] Servidor Next.js listo y activo.');
    }
  }

  // 2. Iniciar Cloudflare Tunnel
  console.log('[*] Abriendo túnel seguro de Cloudflare (candado verde oficial)...');

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
      fs.writeFileSync(path.join(process.cwd(), 'tunnel-url.txt'), tunnelUrl);

      // Generar código QR para terminal
      let qrText = '';
      try {
        qrText = await QRCode.toString(tunnelUrl, { type: 'terminal', small: true });
      } catch (e) {
        qrText = '';
      }

      console.log('\n' + '='.repeat(70));
      console.log('  🚀 SISTEMA MOTOTALLER CONECTADO EXITOSAMENTE A LA RED GLOBAL');
      console.log('='.repeat(70));
      console.log('\n  📱 PARA ENTRAR DESDE TU CELULAR:');
      console.log('     (Funciona en cualquier Wi-Fi o datos 4G/5G, con candado verde)\n');
      console.log(`     👉 ${tunnelUrl}\n`);

      if (qrText) {
        console.log('  📷 Escanea este código QR con la cámara de tu celular:');
        console.log(qrText);
      }

      console.log('  💻 ACCESO DIRECTO EN ESTA COMPUTADORA:');
      console.log('     👉 https://localhost:3000\n');
      console.log('='.repeat(70));
      console.log('  [Presiona Ctrl + C en esta ventana para detener los servicios]');
      console.log('='.repeat(70) + '\n');

      // Abrir en el navegador local
      if (isWin) {
        spawn('cmd.exe', ['/c', 'start', 'https://localhost:3000'], { detached: true, stdio: 'ignore' });
      }
    }
  }

  readline.createInterface({ input: tunnel.stdout }).on('line', onLine);
  readline.createInterface({ input: tunnel.stderr }).on('line', onLine);

  tunnel.on('exit', (code) => {
    console.log(`\n[!] El túnel de Cloudflare se cerró (código ${code}).`);
  });

  // Limpieza al salir
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
