const formatKz = (amount) =>
  new Intl.NumberFormat('pt-AO', { style: 'decimal', minimumFractionDigits: 2 }).format(amount) + ' Kz';

module.exports = { formatKz };
