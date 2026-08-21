# Cómo generar el reporte y la captura de SonarQube (10 minutos)

No se pudo ejecutar SonarQube en el entorno de este asistente porque Docker Desktop
no arrancó ahí. Todo lo demás (Semgrep, npm audit, CVSS, tabla de dependencias)
ya está generado con datos reales en esta misma carpeta de evidencias. Solo falta
esto, y es rápido de correr en tu propia máquina (donde Docker sí funciona).

## 1. Levantar SonarQube

Desde esta carpeta (Evidencias_SA_Emilio/sonarqube):

```bash
docker compose up -d
```

Espera 1-2 minutos y abre http://localhost:9000 — usuario `admin`, contraseña
`admin` (te pedirá cambiarla en el primer ingreso).

## 2. Crear un token

En SonarQube: menú de usuario (arriba a la derecha) → **My Account** → **Security**
→genera un token, por ejemplo `skillmatch-token`. Cópialo, lo necesitas en el paso 3.

## 3. Instalar el scanner y ejecutar el análisis

Ya dejé listo `sonar-project.properties` dentro de `backend/` y `frontend/` del
proyecto (junto al `package.json` de cada uno), con `sonar.host.url=http://localhost:9000`
ya configurado.

```bash
npm install -g sonarqube-scanner

cd backend
sonar-scanner -Dsonar.login=TU_TOKEN_AQUI

cd ../frontend
sonar-scanner -Dsonar.login=TU_TOKEN_AQUI
```

(Si `sonar-scanner` no se reconoce como comando, usa `npx sonarqube-scanner -Dsonar.login=TU_TOKEN_AQUI`
en su lugar.)

## 4. Capturar la evidencia

En http://localhost:9000 verás dos proyectos: **SkillMatch Backend** y
**SkillMatch Frontend**. Para cada uno:

- Captura de pantalla del **Overview** (muestra Security Rating, Bugs,
  Vulnerabilities, Code Smells, Coverage, Duplications).
- Entra a la pestaña **Issues**, filtra por `Type = Vulnerability` y por
  `Type = Security Hotspot`, y captura esa vista.
- Anota el **Security Rating** (A–E) y el **% de cobertura** que aparezca
  (probablemente 0%, ya que el backend no tiene una suite de pruebas real
  — solo `test:syntax` — y el frontend usa las pruebas por defecto de
  create-react-app si existen).

Con esas capturas y esos dos números completas los deliverables 1 y 2
("Reporte inicial de SonarQube" y "Captura completa del dashboard").

## 5. Completar la tabla de hallazgos SAST (SA.3.3)

Compara lo que reporte SonarQube contra el pre-diagnóstico manual que ya
está en el reporte (`Emilio_SkillMatch.docx`, sección SA.3.2): los mismos
`console.log` con la contraseña/clave AES en `authController.js` y el JWT
decodificado en `authMiddleware.js` deberían aparecer ahí como Security
Hotspots o issues de tipo "Vulnerability". Si SonarQube los marca con un
CWE distinto al que anoté (CWE-532 / CWE-312), usa el que reporte la
herramienta — es la fuente autorizada una vez que la ejecutas de verdad.

## 6. Al terminar

```bash
docker compose down
```

para apagar el contenedor (los datos quedan en los volúmenes de Docker
por si necesitas volver a entrar).
