const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Evita mandar ao banco um id malformado vindo da URL (daria erro em vez de 404). */
export function ehUuid(valor: string | null | undefined): valor is string {
  return !!valor && UUID.test(valor);
}
