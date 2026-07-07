/**
 * Dinheiro é sempre guardado em CÊNTIMOS (inteiros) para evitar erros
 * de vírgula flutuante. 1 Kz = 100 cêntimos.
 */

const toCents = (kz) => Math.round(Number(kz) * 100);

const toKz = (cents) => Number((Number(cents || 0) / 100).toFixed(2));

const formatKz = (cents) =>
  `${new Intl.NumberFormat('pt-AO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toKz(cents))} Kz`;

/** Valida um valor em Kz enviado pelo cliente. Devolve cêntimos ou lança erro. */
function parseAmountKz(value, { min = 0 } = {}) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    throw new Error('Valor inválido');
  }
  const cents = toCents(num);
  if (cents < min) {
    throw new Error(`Valor mínimo: ${formatKz(min)}`);
  }
  return cents;
}

module.exports = { toCents, toKz, formatKz, parseAmountKz };
