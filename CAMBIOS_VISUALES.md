# Ajustes visuales aplicados

- Perfil del estudiante reorganizado en una cuadrícula compacta para aprovechar mejor el ancho.
- Información personal distribuida en tres columnas en pantallas grandes.
- Logos de SkillMatch y UTEQ recortados y ampliados para mejorar su visibilidad.
- Código QR del bot agregado en la parte superior del hero de la landing.
- Vista pública de detalle de proyecto rediseñada por completo.
- Manejo visual para imágenes faltantes o rutas de archivos no disponibles.
- Build de producción actualizado en `frontend/build`.

## Puertos locales

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

## Ajuste de espacio lateral del dashboard
- Se eliminó el margen izquierdo heredado de `DashboardProfesores.css` que agregaba 280 px a todos los dashboards.
- El contenido del dashboard de estudiante ahora comienza inmediatamente después del sidebar, conservando únicamente el padding normal.

## Corrección global del espacio izquierdo
- Se eliminó la reserva duplicada de 280 px que provenía de `DashboardProfesores.css`.
- La corrección aplica a Estudiante, Profesor, Empresa y Vinculación/Administrador.
- Todos los apartados internos ahora utilizan el ancho disponible inmediatamente después del sidebar.
- También se eliminó el ancho máximo centrado de `.content` dentro de los dashboards para aprovechar mejor pantallas grandes.
