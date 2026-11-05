import selfsigned from 'selfsigned';
import fs from 'fs';
import path from 'path';
import os from 'os';

const certDir = path.join(process.cwd(), 'certificates');
if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

const interfaces = os.networkInterfaces();
const ips = ['127.0.0.1'];
for (const devName in interfaces) {
  const iface = interfaces[devName];
  if (!iface) continue;
  for (const alias of iface) {
    if (alias.family === 'IPv4' && !alias.internal) {
      ips.push(alias.address);
    }
  }
}

console.log('Generando certificado SSL para IPs:', ips);

const attrs = [{ name: 'commonName', value: ips[1] || 'localhost' }];
const altNames = [
  { type: 2, value: 'localhost' },
  ...ips.map(ip => ({ type: 7, ip: ip }))
];

const pems = await selfsigned.generate(attrs, {
  days: 365,
  keySize: 2048,
  algorithm: 'sha256',
  extensions: [{
    name: 'subjectAltName',
    altNames: altNames
  }]
});

fs.writeFileSync(path.join(certDir, 'server.key'), pems.private);
fs.writeFileSync(path.join(certDir, 'server.crt'), pems.cert);
console.log('Certificados SSL generados exitosamente en certificates/ (server.key, server.crt)');
