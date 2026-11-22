# comidasTop · Negocios web

Panel de negocios en Next.js, JavaScript y Tailwind CSS, conectado exclusivamente a la API real.

## Incluye

- Inicio de sesión con credenciales creadas al aprobar la solicitud del negocio.
- Resumen de puntuación calculada, cobertura del menú y platos mejor puntuados.
- Estado abierto/cerrado.
- Administración de productos: crear, editar, ocultar y cambiar disponibilidad.
- Edición de datos públicos, dirección, contacto y horario.
- Puntuaciones y reconocimiento en modo de solo lectura.
- Sesión persistida con token en `localStorage`.
- Sin datos de demostración: todo proviene de la API.

## Requisitos

1. API funcionando con MongoDB Atlas (`api/`, `npm run dev`).
2. Una solicitud de negocio aprobada desde `admin-web` (**Solicitudes**). La aprobación crea la cuenta del negocio y muestra su contraseña temporal una sola vez.
3. `API_URL` apuntando a la URL base del API, incluyendo `/api`.

En Vercel configura `API_URL` como variable de entorno (sin prefijo `NEXT_PUBLIC_`) y vuelve a desplegar. Next.js la usa en un rewrite del servidor; el navegador solo llama al mismo dominio del panel mediante `/api`.

## Ejecutar

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev -- --port 3001
```

Abre `http://localhost:3001` e inicia sesión con el correo y la contraseña temporal que entregó el administrador.

Si la cuenta no tiene un negocio aprobado, el panel muestra un aviso y no permite el acceso.

## Verificación

```bash
npm run lint
npm run build
```
