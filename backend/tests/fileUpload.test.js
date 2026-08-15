const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

describe('DE - Validación de archivos en carga de evidencias', () => {
    test('debe rechazar un archivo con extensión y MIME no permitidos', async () => {
        const token = jwt.sign(
            {
                id_usuario: 999999,
                correo: 'test.estudiante@uteq.edu.mx',
                id_rol: 2
            },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        const response = await request(app)
            .post('/api/estudiante/evidencias')
            .set('Authorization', `Bearer ${token}`)
            .attach(
                'archivo',
                Buffer.from('contenido de prueba'),
                {
                    filename: 'archivo-malicioso.exe',
                    contentType: 'application/x-msdownload'
                }
            );

        console.log('Status upload:', response.status);
        console.log('Respuesta upload:', response.body);

        expect(response.status).toBe(400);
        expect(response.body.ok).toBe(false);

        expect(response.body.mensaje).toBe(
            'Formato no permitido. Usa PDF, JPG, PNG, WEBP, MP4, WEBM o MOV.'
        );
    });
});