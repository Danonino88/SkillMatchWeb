# Backend SkillMatch - Guía de Configuración

## 📁 Estructura de carpetas creadas

```
SkillMatchWeb/
├── .env                          # Configuración de variables de entorno
├── .env.php                      # Loader de variables .env
├── backend/
│   ├── index.php                # Punto de entrada de la API
│   └── config/
│       └── database.php          # Configuración de conexión a BD
└── db/
    └── schema.sql                # Script SQL con estructura de BD
```

## 🔧 Configuración Inicial

### 1. Editar el archivo `.env`
El archivo `.env` contiene tus credenciales de base de datos. **⚠️ NO comitees este archivo (ya está en .gitignore)**

```ini
DB_ENGINE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=SkillMatch
DB_USER=root
DB_PASSWORD=  # Agrega tu contraseña si tienes una
```

### 2. Crear la base de datos
Ejecuta el archivo `db/schema.sql` en tu cliente MySQL:

**Opción 1: Con MySQL CLI**
```bash
mysql -u root -p < db/schema.sql
```

**Opción 2: Con phpMyAdmin**
- Abre phpMyAdmin
- Ve a "Importar"
- Selecciona el archivo `db/schema.sql`
- Haz clic en "Importar"

### 3. Iniciar el servidor

Abre una terminal en la carpeta `backend` y ejecuta:

```bash
php -S localhost:8000
```

Luego abre en tu navegador:
```
http://localhost:8000/api/health
```

Deberías ver una respuesta JSON confirmando que el servidor está activo.

## 📝 Próximos pasos para el backend

1. **Crear carpetas adicionales:**
   ```
   backend/
   ├── api/          # Endpoints de API
   ├── models/       # Modelos de datos
   ├── controllers/  # Lógica de negocio
   ├── middleware/   # Autenticación, validaciones
   └── utils/        # Funciones auxiliares
   ```

2. **Empezar a crear endpoints** en la carpeta `api/`

3. **Implementar autenticación** (JWT, sessions)

## 🚀 Comando para iniciar

```bash
cd backend
php -S localhost:8000
```

Accede a `http://localhost:8000/api/health` para verificar que está funcionando.
