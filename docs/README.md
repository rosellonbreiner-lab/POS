# MotoTaller

Sistema de gestión para taller de motos: inventario con foto y ubicación, escáner láser, cotizaciones, facturas imprimibles, órdenes de trabajo, contabilidad y estadísticas.

## Requisitos
Node.js LTS, Docker Desktop, Git.

## Inicio rápido (cuando exista el código)
```bash
cp .env.example .env        # completar valores
docker compose up -d db
npm install
npx prisma migrate dev
npm run seed
npm run dev
```
Calidad: `npm run typecheck && npm run lint && npm test && npm run build`

## Documentación
Ver carpeta `docs/` (PRD, ARCHITECTURE, SECURITY, DESIGN, RULES, TASKS, DECISIONS, TEST_PLAN, MEMORY).
