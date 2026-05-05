const Loan = require('../models/Loan');
const Resource = require('../models/Resource');

const updateLoanStates = async () => {
  const currentDate = new Date();
  console.log(`[${currentDate.toISOString()}] - Iniciando actualización de estados de préstamos`);

  try {
    // Actualizar préstamos a "en curso"
    const loansToInProgress = await Loan.updateMany(
      { estado: 'pendiente', fecha_inicio: { $lte: currentDate } },
      { $set: { estado: 'en curso' } }
    );
    console.log(`[${currentDate.toISOString()}] - Préstamos actualizados a "en curso": ${loansToInProgress.modifiedCount}`);

    // Actualizar préstamos a "retrasado"
    const loansToLate = await Loan.updateMany(
      { estado: { $in: ['pendiente', 'en curso'] }, fecha_fin: { $lt: currentDate } },
      { $set: { estado: 'retrasado' } }
    );
    console.log(`[${currentDate.toISOString()}] - Préstamos actualizados a "retrasado": ${loansToLate.modifiedCount}`);

    console.log(`[${currentDate.toISOString()}] - Finalizó la actualización de estados de préstamos`);
  } catch (error) {
    console.error(`[${currentDate.toISOString()}] - Error al actualizar estados de préstamos:`, error);
  }
};

module.exports = updateLoanStates;
