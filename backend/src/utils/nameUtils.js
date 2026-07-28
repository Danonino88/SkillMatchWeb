function normalizarTexto(value = '') {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9ñÑ\s]/g, ' ')
    .toLowerCase()
    .replace(/\b(de|del|la|las|los|y)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizarNombreCompleto(nombre = '', apellido = '') {
  return normalizarTexto(`${nombre || ''} ${apellido || ''}`);
}

function tokenizarBusqueda(value = '') {
  return normalizarTexto(value)
    .split(' ')
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

function coincideNombreBusqueda(nombreNormalizado = '', busqueda = '') {
  const texto = normalizarTexto(nombreNormalizado);
  const tokens = tokenizarBusqueda(busqueda);
  if (!tokens.length) return true;
  return tokens.every((token) => texto.includes(token));
}

module.exports = {
  normalizarTexto,
  normalizarNombreCompleto,
  tokenizarBusqueda,
  coincideNombreBusqueda,
};
