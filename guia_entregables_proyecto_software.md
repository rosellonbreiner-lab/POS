# Guía maestra de entregables para un proyecto de software

Esta guía reúne los documentos, requisitos, diagramas, manuales, pruebas y demás entregables recomendados para desarrollar y entregar un software de forma organizada, académica o profesional.

> **Nota:** No todos los entregables son obligatorios en todos los proyectos. Se deben seleccionar según el tamaño, alcance, riesgos, tipo de software y necesidades del cliente.

---

## 1. Requisitos del software

Los requisitos definen qué debe hacer el sistema y bajo qué condiciones debe funcionar.

### 1.1 Requisitos funcionales (RF)

Describen las funciones que el sistema debe realizar.

Ejemplos:

- RF-01: El sistema debe permitir registrar usuarios.
- RF-02: El sistema debe permitir iniciar sesión.
- RF-03: El sistema debe permitir registrar, editar y eliminar información.
- RF-04: El sistema debe permitir consultar registros.
- RF-05: El sistema debe generar reportes.
- RF-06: El sistema debe permitir recuperar la contraseña.

### 1.2 Requisitos no funcionales (RNF)

Definen las condiciones de calidad, seguridad y funcionamiento.

Ejemplos:

- RNF-01: El sistema debe cargar sus páginas en menos de 3 segundos en condiciones normales.
- RNF-02: Las contraseñas deben almacenarse de forma segura mediante hashing.
- RNF-03: El sistema debe adaptarse a computadores, tabletas y teléfonos.
- RNF-04: El sistema debe cumplir la disponibilidad acordada.
- RNF-05: El sistema debe realizar copias de seguridad.
- RNF-06: El sistema debe proteger la información contra accesos no autorizados.

### 1.3 Otros requisitos que pueden documentarse

- Requisitos de negocio.
- Requisitos legales.
- Requisitos técnicos.
- Restricciones del sistema.
- Requisitos de hardware y software.
- Reglas del negocio.

---

## 2. Documentación de análisis y planificación

| Documento | Propósito |
|---|---|
| Acta de inicio del proyecto | Autoriza y define el inicio del proyecto. |
| Planteamiento del problema | Explica la situación que se busca solucionar. |
| Justificación | Explica por qué es necesario desarrollar el software. |
| Objetivo general | Define la meta principal. |
| Objetivos específicos | Desglosa las metas que permiten alcanzar el objetivo general. |
| Alcance del proyecto | Define qué incluye y qué no incluye el sistema. |
| Estudio de viabilidad | Evalúa si el proyecto es realizable. |
| Análisis de interesados | Identifica clientes, usuarios, administradores y personas involucradas. |
| Plan de trabajo | Define actividades, responsables y fechas. |
| Gestión de riesgos | Identifica posibles problemas y sus acciones preventivas. |
| Presupuesto | Estima costos de desarrollo, infraestructura, equipos y mantenimiento. |

---

## 3. Diagramas del proyecto

### 3.1 Diagramas UML

1. **Diagrama de casos de uso:** representa las acciones que los usuarios pueden realizar en el sistema.
2. **Diagrama de clases:** representa clases, atributos, métodos y relaciones.
3. **Diagrama de secuencia:** representa la interacción entre componentes a lo largo del tiempo.
4. **Diagrama de actividades:** representa el flujo de un proceso, incluyendo decisiones.
5. **Diagrama de estados:** representa los estados de un objeto y sus transiciones.
6. **Diagrama de componentes:** muestra la organización del sistema en módulos o componentes.
7. **Diagrama de despliegue:** muestra dónde se ejecutan las partes del software, como servidores, dispositivos y bases de datos.

### 3.2 Otros diagramas

8. **Diagrama entidad-relación (DER):** representa entidades, atributos, llaves y relaciones de la base de datos.
9. **Diagrama de flujo:** representa paso a paso un proceso mediante símbolos y decisiones.
10. **Diagrama de arquitectura:** explica cómo se conectan las tecnologías y las partes del sistema.

No todos los proyectos necesitan los diez diagramas. Los más comunes en proyectos académicos y profesionales son casos de uso, actividades, clases, secuencia, arquitectura, base de datos y despliegue.

---

## 4. Diseño del software (UI/UX)

Antes de desarrollar, se define cómo se verá y cómo interactuará el usuario con el sistema.

### Entregables de diseño

- Mapa de navegación.
- Wireframes (bocetos de pantallas).
- Mockups (diseños visuales detallados).
- Prototipo interactivo.
- Diseño responsive.
- Design System (colores, fuentes, botones, iconos y componentes).
- Diseño de formularios.
- Diseño de mensajes de error y confirmación.
- Diseño de estados vacíos, cargando y sin conexión, cuando aplique.

### Herramientas comunes

- Figma.
- Penpot.
- Adobe XD.

---

## 5. Especificación de casos de uso

Además del diagrama, los procesos importantes se documentan individualmente.

### Ejemplo: Iniciar sesión

| Campo | Descripción |
|---|---|
| Código | CU-01 |
| Nombre | Iniciar sesión |
| Actor principal | Usuario |
| Objetivo | Acceder al sistema |
| Precondición | El usuario debe estar registrado |
| Flujo principal | Ingresar usuario, ingresar contraseña, validar datos y acceder |
| Flujo alternativo | Credenciales incorrectas |
| Postcondición | Sesión iniciada o mensaje de error mostrado |

Casos de uso que pueden documentarse:

- Registrar usuario.
- Iniciar sesión.
- Cerrar sesión.
- Recuperar contraseña.
- Crear registros.
- Editar registros.
- Eliminar registros.
- Consultar información.
- Generar reportes.
- Administrar usuarios.
- Cambiar configuraciones.

---

## 6. Historias de usuario y backlog

Se utilizan especialmente en Scrum y metodologías ágiles.

### Ejemplo de historia de usuario

**HU-01 – Registrar usuario**

- **Como:** Administrador.
- **Quiero:** registrar usuarios en el sistema.
- **Para:** permitir el acceso a personas autorizadas.

**Criterios de aceptación:**

- El formulario debe solicitar los datos obligatorios.
- No debe permitir usuarios duplicados.
- Debe validar el correo electrónico.
- Debe informar si el registro fue exitoso.
- Debe mostrar errores si los datos son inválidos.

### Entregables

- Product Backlog.
- Historias de usuario.
- Criterios de aceptación.
- Sprint Backlog, si aplica.
- Priorización de funcionalidades.
- Tablero de tareas.
- Registro de avances.
- Incrementos funcionales por sprint.

---

## 7. Manuales del software

Un proyecto puede incluir diferentes manuales, según las personas que lo utilizarán o mantendrán.

### 7.1 Manual de usuario

Explica cómo utilizar el sistema, desde el inicio hasta realizar cada función.

### 7.2 Manual de administrador

Explica cómo gestionar usuarios, permisos, configuraciones y procesos administrativos.

### 7.3 Manual de instalación

Explica cómo instalar, configurar y poner en funcionamiento el sistema.

### 7.4 Manual técnico

Explica la arquitectura, tecnologías, estructura del código, base de datos y funcionamiento interno.

### 7.5 Manual de solución de problemas

Explica errores comunes, sus causas y cómo solucionarlos.

### Estructura recomendada del manual de usuario

1. Portada.
2. Nombre del software.
3. Introducción.
4. Objetivo del sistema.
5. Requisitos mínimos para utilizarlo.
6. Cómo acceder al software.
7. Inicio de sesión.
8. Descripción de la interfaz.
9. Explicación de cada menú.
10. Cómo registrar información.
11. Cómo editar información.
12. Cómo eliminar información.
13. Cómo buscar y filtrar.
14. Cómo generar reportes.
15. Mensajes de error comunes.
16. Preguntas frecuentes.
17. Información de soporte.

El manual de usuario debe incluir capturas reales de pantalla y explicaciones paso a paso.

---

## 8. Manual técnico

Dirigido a desarrolladores, técnicos y personas encargadas del mantenimiento.

Debe incluir:

- Descripción general del sistema.
- Arquitectura del software.
- Lenguajes de programación.
- Frameworks y librerías.
- Requisitos del entorno.
- Estructura de carpetas.
- Instalación de dependencias.
- Configuración de variables de entorno.
- Configuración del servidor.
- Conexión a la base de datos.
- Estructura de la base de datos.
- APIs y endpoints.
- Autenticación y autorización.
- Procesos internos.
- Gestión de errores.
- Copias de seguridad.
- Restauración de datos.
- Despliegue.
- Mantenimiento.
- Actualización del software.

---

## 9. Documentación de la base de datos

### Entregables

- Diagrama entidad-relación (DER).
- Diccionario de datos.
- Modelo lógico.
- Modelo físico.
- Script de creación de base de datos.
- Script de datos iniciales, si corresponde.
- Relaciones y llaves.
- Restricciones.
- Índices.
- Procedimientos almacenados, si se utilizan.
- Triggers, si se utilizan.
- Consultas principales.

### Ejemplo de diccionario de datos

| Campo | Tipo | Descripción | Restricción |
|---|---|---|---|
| id_usuario | INT | Identificador del usuario | PK, autoincremental |
| nombre | VARCHAR(100) | Nombre del usuario | NOT NULL |
| correo | VARCHAR(150) | Correo del usuario | UNIQUE |
| contraseña | VARCHAR | Contraseña/hash | NOT NULL |
| rol | VARCHAR(30) | Rol del usuario | NOT NULL |

---

## 10. Pruebas de software

El software debe probarse antes de entregarse.

### Tipos de pruebas

| Prueba | Qué verifica |
|---|---|
| Unitarias | Funciones o componentes individuales. |
| Integración | Comunicación entre módulos. |
| Funcionales | Cumplimiento de funcionalidades. |
| Usabilidad | Facilidad de uso. |
| Compatibilidad | Funcionamiento en dispositivos y navegadores. |
| Rendimiento | Velocidad y estabilidad. |
| Seguridad | Protección de datos y accesos. |
| Regresión | Que los cambios no dañen funciones existentes. |
| Aceptación (UAT) | Que cliente o usuario apruebe el sistema. |

### Ejemplo de documento de casos de prueba

| ID | Prueba | Resultado esperado | Estado |
|---|---|---|---|
| CP-01 | Iniciar sesión con datos correctos | Acceso permitido | Aprobado |
| CP-02 | Iniciar sesión con contraseña incorrecta | Mostrar error | Aprobado |
| CP-03 | Registrar usuario sin nombre | No permitir registro | Aprobado |
| CP-04 | Consultar información inexistente | Mostrar mensaje apropiado | Aprobado |

### Entregables de pruebas

- Plan de pruebas.
- Casos de prueba.
- Pruebas unitarias.
- Pruebas de integración.
- Pruebas funcionales.
- Pruebas de usabilidad.
- Pruebas de seguridad.
- Pruebas de rendimiento.
- Pruebas de aceptación.
- Informe de resultados.
- Evidencias de pruebas.
- Registro de errores encontrados y corregidos.

---

## 11. Seguridad del software

La seguridad debe aplicarse y documentarse.

### Entregables

- Matriz de roles y permisos.
- Sistema de autenticación.
- Sistema de autorización.
- Políticas de contraseñas.
- Protección de datos personales.
- Validación de entradas.
- Control de sesiones.
- Registro de actividades (logs).
- Protección contra SQL Injection.
- Protección contra XSS.
- Protección contra CSRF, cuando aplique.
- Gestión de errores sin exponer datos sensibles.
- Política de respaldos.
- Plan de recuperación ante incidentes.

### Ejemplo de matriz de permisos

| Funcionalidad | Administrador | Usuario | Invitado |
|---|---|---|---|
| Iniciar sesión | Sí | Sí | No |
| Consultar información | Sí | Sí | Limitado |
| Crear registros | Sí | Sí | No |
| Editar registros | Sí | Limitado | No |
| Eliminar registros | Sí | No | No |
| Administrar usuarios | Sí | No | No |
| Consultar reportes | Sí | Limitado | No |

---

## 12. Arquitectura y documentación técnica

Se debe explicar cómo está construido el sistema.

### Documentos recomendados

- Arquitectura general.
- Arquitectura frontend.
- Arquitectura backend.
- Arquitectura de base de datos.
- Diagrama de comunicación.
- Diagrama de componentes.
- Diagrama de despliegue.
- Tecnologías utilizadas.
- Integraciones externas.
- APIs.
- Servicios externos.
- Dependencias.
- Estructura de carpetas.

### Ejemplo de componentes

- **Frontend:** interfaz visual con la que interactúa el usuario.
- **Backend:** lógica del negocio, validaciones y procesos.
- **API:** comunicación entre frontend y backend.
- **Base de datos:** almacenamiento de información.
- **Servidor:** ambiente donde se ejecuta el sistema.

---

## 13. API y documentación de endpoints

Si el software tiene backend o se conecta con otros sistemas, debe documentar sus servicios.

### Ejemplo

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/usuarios` | Consultar usuarios |
| GET | `/usuarios/:id` | Consultar usuario específico |
| POST | `/usuarios` | Registrar usuario |
| PUT | `/usuarios/:id` | Actualizar usuario |
| DELETE | `/usuarios/:id` | Eliminar usuario |

Cada endpoint debe documentar:

- URL.
- Método HTTP.
- Descripción.
- Parámetros.
- Datos requeridos.
- Autenticación.
- Respuesta exitosa.
- Respuesta de error.
- Códigos HTTP.

Herramientas como Swagger (OpenAPI) o Postman pueden utilizarse para documentar y probar las APIs.

---

## 14. Instalación, despliegue y puesta en producción

El software debe poder instalarse y ejecutarse en el ambiente donde se utilizará.

### Entregables

- Manual de instalación.
- Configuración de servidor.
- Configuración de dominio, si aplica.
- Configuración SSL/HTTPS.
- Configuración de base de datos.
- Variables de entorno.
- Archivo de dependencias.
- Build de producción.
- Procedimiento de despliegue.
- Procedimiento de actualización.
- Plan de rollback o reversión.
- Configuración de copias de seguridad.
- Evidencias de instalación.
- Acta de puesta en producción.

### Ambientes recomendados

| Ambiente | Uso |
|---|---|
| Desarrollo | Construcción y modificación del software. |
| Pruebas | Validación antes de liberar. |
| Staging | Simulación del ambiente real. |
| Producción | Ambiente donde los usuarios utilizan el sistema. |

---

## 15. Gestión de versiones y control de cambios

Todo proyecto debe tener una forma de controlar sus modificaciones.

### Entregables

- Repositorio de código.
- Historial de commits.
- Versiones del software.
- Registro de cambios (Changelog).
- Control de errores (Issues).
- Registro de solicitudes de cambio.
- Etiquetas de versiones.
- Rama principal estable.
- Ramas de desarrollo, cuando corresponda.

Se pueden utilizar Git con GitHub o GitLab.

### Ejemplo de versiones

- `v1.0.0` — Primera versión oficial.
- `v1.0.1` — Corrección de errores.
- `v1.1.0` — Nuevas funcionalidades.
- `v2.0.0` — Cambios importantes.

---

## 16. Mantenimiento y soporte

Debe considerarse qué sucede después de entregar el software.

### Entregables

- Plan de mantenimiento.
- Plan de soporte.
- Registro de incidencias.
- Procedimiento de actualización.
- Procedimiento de recuperación.
- Política de copias de seguridad.
- Calendario de mantenimiento.
- Monitoreo.
- Registro de errores.
- Plan de continuidad.

### Tipos de mantenimiento

| Tipo | Objetivo |
|---|---|
| Correctivo | Corregir errores. |
| Preventivo | Evitar problemas futuros. |
| Adaptativo | Adaptar el sistema a cambios tecnológicos o del entorno. |
| Evolutivo | Añadir o mejorar funcionalidades. |

---

## 17. Gestión de riesgos

Debe identificarse qué puede salir mal durante el proyecto y cómo se responderá.

| Riesgo | Probabilidad | Impacto | Acción preventiva |
|---|---|---|---|
| Pérdida de información | Media | Alto | Copias de seguridad |
| Fallo del servidor | Media | Alto | Monitoreo y recuperación |
| Retraso del proyecto | Alta | Medio | Planificación y seguimiento |
| Acceso no autorizado | Media | Alto | Seguridad y permisos |
| Error en la base de datos | Media | Alto | Pruebas y respaldos |
| Cambios de requisitos | Alta | Medio | Control de cambios |

---

## 18. Capacitación y entrega al cliente

Las personas que utilizarán el software deben saber cómo funciona.

### Entregables

- Plan de capacitación.
- Presentación de funcionamiento.
- Material didáctico.
- Manual de usuario.
- Registro de asistentes.
- Evidencias de capacitación.
- Acta de entrega.
- Acta de aceptación.

---

## 19. Acta de entrega y aceptación

Documento final del proyecto.

Debe incluir:

- Nombre del proyecto.
- Nombre del cliente o institución.
- Nombre del equipo desarrollador.
- Fecha de entrega.
- Versión entregada.
- Funcionalidades incluidas.
- Elementos entregados.
- Pendientes conocidos, si existen.
- Resultado de las pruebas.
- Observaciones.
- Aprobación del cliente.
- Firma de responsables.

El acta deja constancia de que el cliente recibió el producto y de las condiciones de entrega.

---

## 20. Lista maestra de entregables (checklist)

### A. Análisis y requisitos

- [ ] Documento de requisitos del software (SRS).
- [ ] Requisitos funcionales.
- [ ] Requisitos no funcionales.
- [ ] Reglas del negocio.
- [ ] Alcance.
- [ ] Objetivos.
- [ ] Justificación.
- [ ] Viabilidad.
- [ ] Identificación de actores.
- [ ] Historias de usuario.
- [ ] Criterios de aceptación.

### B. Planificación

- [ ] Acta de inicio.
- [ ] Cronograma.
- [ ] Presupuesto.
- [ ] Plan de trabajo.
- [ ] Product backlog.
- [ ] Sprint backlog (si se trabaja con Scrum).
- [ ] Gestión de riesgos.
- [ ] Matriz de responsabilidades.

### C. Diagramas

- [ ] Diagrama de casos de uso.
- [ ] Diagrama de actividades.
- [ ] Diagrama de clases.
- [ ] Diagrama de secuencia.
- [ ] Diagrama de estados (si aplica).
- [ ] Diagrama entidad-relación.
- [ ] Diagrama de arquitectura.
- [ ] Diagrama de componentes.
- [ ] Diagrama de despliegue.
- [ ] Diagrama de flujo.

### D. Diseño UI/UX

- [ ] Mapa de navegación.
- [ ] Wireframes.
- [ ] Mockups.
- [ ] Prototipo.
- [ ] Diseño responsive.
- [ ] Design System.
- [ ] Diseño de formularios.
- [ ] Diseño de errores y alertas.

### E. Desarrollo

- [ ] Código fuente frontend.
- [ ] Código fuente backend.
- [ ] Base de datos.
- [ ] APIs.
- [ ] Configuración.
- [ ] Dependencias.
- [ ] Repositorio Git.
- [ ] Control de versiones.

### F. Pruebas

- [ ] Plan de pruebas.
- [ ] Casos de prueba.
- [ ] Pruebas unitarias.
- [ ] Pruebas de integración.
- [ ] Pruebas funcionales.
- [ ] Pruebas de usabilidad.
- [ ] Pruebas de seguridad.
- [ ] Pruebas de rendimiento.
- [ ] Pruebas de aceptación.
- [ ] Informe de resultados.
- [ ] Evidencias de pruebas.

### G. Manuales

- [ ] Manual de usuario.
- [ ] Manual de administrador.
- [ ] Manual técnico.
- [ ] Manual de instalación.
- [ ] Manual de mantenimiento.
- [ ] Manual de solución de problemas.

### H. Seguridad

- [ ] Roles y permisos.
- [ ] Autenticación.
- [ ] Autorización.
- [ ] Protección de datos.
- [ ] Validación de formularios.
- [ ] Registro de actividades.
- [ ] Política de respaldos.

### I. Despliegue

- [ ] Ambiente de desarrollo.
- [ ] Ambiente de pruebas.
- [ ] Ambiente de producción.
- [ ] Servidor.
- [ ] Configuración.
- [ ] Dominio, si aplica.
- [ ] HTTPS, si aplica.
- [ ] Procedimiento de despliegue.
- [ ] Copias de seguridad.

### J. Entrega

- [ ] Software funcional.
- [ ] Código fuente.
- [ ] Base de datos.
- [ ] Scripts SQL.
- [ ] Documentación completa.
- [ ] Manuales.
- [ ] Capacitación.
- [ ] Acta de entrega.
- [ ] Acta de aceptación.
- [ ] Registro de versión entregada.

### K. Mantenimiento

- [ ] Plan de soporte.
- [ ] Plan de mantenimiento.
- [ ] Gestión de errores.
- [ ] Registro de cambios.
- [ ] Plan de recuperación.
- [ ] Plan de actualización.

---

## 21. Estructura de carpetas recomendada

```text
PROYECTO-SOFTWARE/
│
├── 01-ANALISIS-Y-REQUISITOS/
│   ├── Documento-SRS/
│   ├── Requisitos-Funcionales/
│   ├── Requisitos-No-Funcionales/
│   ├── Alcance/
│   ├── Objetivos/
│   ├── Reglas-de-Negocio/
│   └── Casos-de-Uso/
│
├── 02-PLANIFICACION/
│   ├── Acta-de-Inicio/
│   ├── Cronograma/
│   ├── Presupuesto/
│   ├── Plan-de-Trabajo/
│   ├── Backlog/
│   └── Gestion-de-Riesgos/
│
├── 03-DISENO-UI-UX/
│   ├── Mapa-de-Navegacion/
│   ├── Wireframes/
│   ├── Mockups/
│   ├── Prototipo/
│   └── Design-System/
│
├── 04-DIAGRAMAS/
│   ├── UML/
│   ├── Casos-de-Uso/
│   ├── Actividades/
│   ├── Clases/
│   ├── Secuencia/
│   ├── Estados/
│   ├── Componentes/
│   ├── Despliegue/
│   ├── Flujo/
│   └── Arquitectura/
│
├── 05-ARQUITECTURA-Y-DISENO-TECNICO/
│   ├── Arquitectura-General/
│   ├── Frontend/
│   ├── Backend/
│   ├── API/
│   └── Tecnologias/
│
├── 06-BASE-DE-DATOS/
│   ├── DER/
│   ├── Diccionario-de-Datos/
│   ├── Modelo-Logico/
│   ├── Modelo-Fisico/
│   ├── Scripts-SQL/
│   └── Procedimientos-y-Triggers/
│
├── 07-CODIGO-FUENTE/
│   ├── Frontend/
│   ├── Backend/
│   ├── Configuracion/
│   └── README/
│
├── 08-PRUEBAS/
│   ├── Plan-de-Pruebas/
│   ├── Casos-de-Prueba/
│   ├── Pruebas-Unitarias/
│   ├── Pruebas-Integracion/
│   ├── Pruebas-Funcionales/
│   ├── Pruebas-Seguridad/
│   ├── Evidencias/
│   └── Informe-de-Pruebas/
│
├── 09-SEGURIDAD/
│   ├── Matriz-de-Permisos/
│   ├── Politicas/
│   ├── Analisis-de-Riesgos/
│   └── Seguridad-de-Datos/
│
├── 10-MANUALES/
│   ├── Manual-de-Usuario/
│   ├── Manual-de-Administrador/
│   ├── Manual-Tecnico/
│   ├── Manual-de-Instalacion/
│   ├── Manual-de-Mantenimiento/
│   └── Solucion-de-Problemas/
│
├── 11-INSTALACION-Y-DESPLIEGUE/
│   ├── Configuracion/
│   ├── Servidor/
│   ├── Variables-de-Entorno/
│   ├── Procedimiento-de-Despliegue/
│   └── Evidencias/
│
├── 12-CAPACITACION/
│   ├── Presentaciones/
│   ├── Material-Didactico/
│   └── Evidencias/
│
├── 13-ENTREGA-Y-ACEPTACION/
│   ├── Acta-de-Entrega/
│   ├── Acta-de-Aceptacion/
│   ├── Version-Entregada/
│   └── Pendientes/
│
└── 14-MANTENIMIENTO-Y-SOPORTE/
    ├── Plan-de-Mantenimiento/
    ├── Registro-de-Incidencias/
    ├── Registro-de-Cambios/
    ├── Plan-de-Recuperacion/
    └── Actualizaciones/
```

---

## 22. Entregables prioritarios

### Nivel indispensable

1. Documento de requisitos (SRS).
2. Requisitos funcionales y no funcionales.
3. Casos de uso.
4. Historias de usuario.
5. Diagrama de casos de uso.
6. Diagrama de actividades.
7. Diagrama de clases.
8. Diagrama entidad-relación.
9. Diseño UI/UX y prototipo.
10. Arquitectura del sistema.
11. Código fuente.
12. Base de datos.
13. Plan y casos de prueba.
14. Informe de pruebas.
15. Manual de usuario.
16. Manual técnico.
17. Manual de instalación.
18. Sistema funcionando.
19. Acta de entrega.

### Nivel profesional o empresarial

Además de lo anterior:

- Matriz de trazabilidad de requisitos.
- Matriz de permisos.
- Gestión de riesgos.
- Análisis de seguridad.
- Documentación de API.
- CI/CD.
- Control de versiones.
- Monitoreo.
- Plan de recuperación ante desastres.
- Política de backups.
- Gestión de incidencias.
- SLA de soporte.
- Registro de cambios.
- Plan de mantenimiento.
- Documentación de infraestructura.
- Evidencias de aceptación del cliente.

---

## 23. Ciclo completo de desarrollo de software

1. **Recolección de requisitos:** necesidades del cliente, problemas y objetivos.
2. **Análisis:** requisitos, reglas, alcance y casos de uso.
3. **Diseño:** diagramas, arquitectura, UI/UX y base de datos.
4. **Desarrollo:** programación de frontend, backend y base de datos.
5. **Pruebas y calidad:** validación, corrección y seguridad.
6. **Despliegue:** instalación y puesta en producción.
7. **Entrega y capacitación:** manuales, documentación, aprobación y entrega.
8. **Mantenimiento:** soporte, mejoras, actualizaciones y evolución.

---

## 24. Recomendación final

Para un proyecto universitario, un desarrollo para un cliente o un software que se quiera comercializar, esta guía sirve como mapa de trabajo. No es necesario generar absolutamente todos los documentos para un sistema pequeño: se deben priorizar los que realmente aporten control, calidad, seguridad, claridad y facilidad de mantenimiento.

La documentación debe mantenerse alineada con el software real. Los diagramas, manuales, requisitos y pruebas deben actualizarse cuando el sistema cambie.
