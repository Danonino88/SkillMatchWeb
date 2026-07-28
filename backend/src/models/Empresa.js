class Empresa {
  static async create({
    id_usuario,
    razon_social,
    rfc = null,
    domicilio = null,
    ubicacion = null,
    giro = null,
    sector = null,
    contacto = null,
    responsable_nombre = null,
    responsable_apellido = null,
    responsable_cargo = null,
    responsable_correo = null,
    responsable_telefono = null,
    observaciones = null,
    estado = 'pendiente',
    registrada_por = null,
    conn
  }) {
    const [result] = await conn.query(
      `INSERT INTO empresas (
        id_empresa, razon_social, rfc, domicilio, ubicacion, giro, sector, contacto,
        responsable_nombre, responsable_apellido, responsable_cargo, responsable_correo,
        responsable_telefono, observaciones, estado, registrada_por
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (id_empresa) DO UPDATE SET
         razon_social = EXCLUDED.razon_social,
         rfc = EXCLUDED.rfc,
         domicilio = EXCLUDED.domicilio,
         ubicacion = EXCLUDED.ubicacion,
         giro = EXCLUDED.giro,
         sector = EXCLUDED.sector,
         contacto = EXCLUDED.contacto,
         responsable_nombre = EXCLUDED.responsable_nombre,
         responsable_apellido = EXCLUDED.responsable_apellido,
         responsable_cargo = EXCLUDED.responsable_cargo,
         responsable_correo = EXCLUDED.responsable_correo,
         responsable_telefono = EXCLUDED.responsable_telefono,
         observaciones = EXCLUDED.observaciones,
         estado = EXCLUDED.estado,
         registrada_por = EXCLUDED.registrada_por`,
      [
        id_usuario, razon_social, rfc, domicilio, ubicacion, giro, sector, contacto,
        responsable_nombre, responsable_apellido, responsable_cargo, responsable_correo,
        responsable_telefono, observaciones, estado, registrada_por
      ]
    );

    return result.insertId || id_usuario;
  }
}

module.exports = Empresa;
