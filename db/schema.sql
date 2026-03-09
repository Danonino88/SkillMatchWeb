CREATE DATABASE SkillMatch;
USE SkillMatch;


CREATE TABLE Roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);


CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL, -- cifrada
    id_rol INT NOT NULL,
    estado ENUM('activo','inactivo') DEFAULT 'activo',
    FOREIGN KEY (id_rol) REFERENCES Roles(id_rol)
);


CREATE TABLE Estudiantes (
    id_estudiante INT PRIMARY KEY,
    matricula VARCHAR(20) NOT NULL UNIQUE,
    carrera VARCHAR(100),
    semestre INT,
    competencias TEXT,
    FOREIGN KEY (id_estudiante) REFERENCES Usuarios(id_usuario)
);


CREATE TABLE Profesores (
    id_profesor INT PRIMARY KEY,
    departamento VARCHAR(100),
    asignaturas TEXT,
    FOREIGN KEY (id_profesor) REFERENCES Usuarios(id_usuario)
);


CREATE TABLE Horarios_Profesores (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    id_profesor INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,             
    ruta_pdf VARCHAR(255) NOT NULL, 
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_profesor) REFERENCES Profesores(id_profesor)
);


CREATE TABLE Empresas (
    id_empresa INT PRIMARY KEY,
    razon_social VARCHAR(150) NOT NULL,
    giro VARCHAR(100),
    contacto VARCHAR(150),
    FOREIGN KEY (id_empresa) REFERENCES Usuarios(id_usuario)
);


CREATE TABLE Proyectos (
    id_proyecto INT AUTO_INCREMENT PRIMARY KEY,
    id_estudiante INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_registro DATE DEFAULT CURRENT_DATE,
    estado ENUM('en progreso','completado','pausado') DEFAULT 'en progreso',
    FOREIGN KEY (id_estudiante) REFERENCES Estudiantes(id_estudiante)
);


CREATE TABLE Evidencias (
    id_evidencia INT AUTO_INCREMENT PRIMARY KEY,
    id_proyecto INT NOT NULL,
    ruta_archivo VARCHAR(255),
    tipo VARCHAR(50),
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_proyecto) REFERENCES Proyectos(id_proyecto)
);


CREATE TABLE Calificaciones (
    id_calificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_proyecto INT NOT NULL,
    id_usuario INT NOT NULL,
    puntaje DECIMAL(3,2),
    comentario TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_proyecto) REFERENCES Proyectos(id_proyecto),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);


CREATE TABLE CVs (
    id_cv INT AUTO_INCREMENT PRIMARY KEY,
    id_estudiante INT NOT NULL,
    ruta_pdf VARCHAR(255),
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_estudiante) REFERENCES Estudiantes(id_estudiante)
);


CREATE TABLE Chatbot (
    id_pregunta INT AUTO_INCREMENT PRIMARY KEY,
    pregunta VARCHAR(255) NOT NULL,
    respuesta TEXT NOT NULL,
    categoria VARCHAR(50)
);


CREATE TABLE Auditoria (
    id_evento INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    accion VARCHAR(100),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_origen VARCHAR(50),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);