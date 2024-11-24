const Loan = require('../models/Loan');
const Resource = require('../models/Resource');
const Group = require('../models/Group');

// Crear un nuevo préstamo
exports.createLoan = async (req, res) => {
  const { recurso_id, fecha_inicio, fecha_fin } = req.body;

  try {
    // Verificar si el recurso existe y está disponible
    const resource = await Resource.findById(recurso_id).populate('grupo');
    if (!resource) return res.status(404).json({ error: 'Recurso no encontrado' });
    if (resource.estado !== 'disponible') return res.status(400).json({ error: 'Recurso no disponible' });

    // Validar las fechas
    if (new Date(fecha_inicio) >= new Date(fecha_fin)) {
      return res.status(400).json({ error: 'Las fechas de inicio y fin no son válidas' });
    }

    // Crear el nuevo préstamo
    const newLoan = new Loan({
      recurso_id,
      prestatario: req.user.id, // Usuario autenticado
      fecha_inicio,
      fecha_fin,
      estado: 'pendiente'
    });

    // Cambiar el estado del recurso a "en préstamo"
    resource.estado = 'en préstamo';
    await resource.save();

    // Guardar el préstamo en la base de datos
    await newLoan.save();
    res.status(201).json({ mensaje: 'Préstamo creado exitosamente', prestamo: newLoan });
  } catch (error) {
    console.error('Error al crear el préstamo:', error);
    res.status(500).json({ error: 'Error al crear el préstamo' });
  }
};

// Obtener todos los préstamos
exports.getLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate('recurso_id', 'nombre_recurso estado')
      .populate('prestatario', 'nombre email');
    res.json(loans);
  } catch (error) {
    console.error('Error al obtener los préstamos:', error);
    res.status(500).json({ error: 'Error al obtener los préstamos' });
  }
};

// Obtener un préstamo específico
exports.getLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('recurso_id', 'nombre_recurso estado')
      .populate('prestatario', 'nombre email');
    if (!loan) return res.status(404).json({ error: 'Préstamo no encontrado' });

    res.json(loan);
  } catch (error) {
    console.error('Error al obtener el préstamo:', error);
    res.status(500).json({ error: 'Error al obtener el préstamo' });
  }
};

// Obtener préstamos del usuario autenticado
exports.getUserLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ prestatario: req.user.id }).populate('recurso_id', 'nombre_recurso estado');
    res.json(loans);
  } catch (error) {
    console.error('Error al obtener los préstamos del usuario:', error);
    res.status(500).json({ error: 'Error al obtener los préstamos del usuario' });
  }
};


exports.getGroupLoans = async (req, res) => {
    const { groupId } = req.params; // ID del grupo
  
    try {
      // Verificar si el grupo existe
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });
  
      // Verificar permisos: Solo administradores o colaboradores pueden acceder a los préstamos del grupo
      const isAuthorized =
        group.id_miembro_owner.equals(req.user.id) || group.colaboradores.includes(req.user.id);
  
      if (!isAuthorized) {
        return res.status(403).json({ error: 'No tienes permiso para acceder a los préstamos de este grupo' });
      }
  
      // Buscar préstamos relacionados con el grupo
      const loans = await Loan.find()
        .populate({
          path: 'recurso_id',
          match: { grupo: groupId }, // Filtrar recursos que pertenezcan al grupo
          select: 'nombre_recurso estado'
        })
        .populate('prestatario', 'nombre email');
  
      // Filtrar préstamos relacionados con recursos del grupo
      const groupLoans = loans.filter((loan) => loan.recurso_id !== null);
  
      res.json(groupLoans);
    } catch (error) {
      console.error('Error al obtener los préstamos del grupo:', error);
      res.status(500).json({ error: 'Error al obtener los préstamos del grupo' });
    }
  };
  

// Confirmar finalización de un préstamo
exports.confirmLoanCompletion = async (req, res) => {
  const { id } = req.params; // ID del préstamo

  try {
    // Buscar el préstamo
    const loan = await Loan.findById(id).populate('recurso_id');
    if (!loan) return res.status(404).json({ error: 'Préstamo no encontrado' });

    const resource = loan.recurso_id;

    // Verificar permisos: Solo administradores o colaboradores pueden confirmar
    const group = await Group.findById(resource.grupo);
    if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

    const isAuthorized =
      group.id_miembro_owner.equals(req.user.id) || group.colaboradores.includes(req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({ error: 'No tienes permiso para confirmar la finalización de este préstamo' });
    }

    // Cambiar el estado del préstamo a "finalizado"
    loan.estado = 'finalizado';
    await loan.save();

    // Cambiar el estado del recurso a "disponible"
    resource.estado = 'disponible';
    await resource.save();

    res.json({ mensaje: 'Préstamo confirmado como finalizado', prestamo: loan });
  } catch (error) {
    console.error('Error al confirmar la finalización del préstamo:', error);
    res.status(500).json({ error: 'Error al confirmar la finalización del préstamo' });
  }
};
