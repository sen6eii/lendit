const Loan = require('../models/Loan');
const Resource = require('../models/Resource');
const Group = require('../models/Group');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Crear un nuevo préstamo (el recurso se bloquea al hacer la solicitud)
exports.createLoan = async (req, res) => {
  const { recurso_id, fecha_inicio, fecha_fin } = req.body;

  try {
    const resource = await Resource.findById(recurso_id).populate('grupo');
    if (!resource) return res.status(404).json({ error: 'Recurso no encontrado' });
    if (resource.estado !== 'disponible') {
      return res.status(400).json({ error: 'El recurso no está disponible en este momento' });
    }
    if (new Date(fecha_inicio) >= new Date(fecha_fin)) {
      return res.status(400).json({ error: 'Las fechas de inicio y fin no son válidas' });
    }

    // Save loan first to avoid race condition
    const newLoan = new Loan({
      recurso_id,
      prestatario: req.user.id,
      fecha_inicio,
      fecha_fin,
      estado: 'pendiente'
    });
    await newLoan.save();

    // Then lock resource
    resource.estado = 'en préstamo';
    await resource.save();

    // Notify resource owner
    await Notification.create({
      usuario_destinatario: resource.propietario,
      tipo: 'loan_request',
      mensaje: `Nueva solicitud de préstamo para "${resource.nombre_recurso}"`,
      referencia_id: resource.grupo?._id ?? resource.grupo,
    });

    res.status(201).json({ mensaje: 'Solicitud de préstamo creada', prestamo: newLoan });
  } catch (error) {
    console.error('Error al crear el préstamo:', error);
    res.status(500).json({ error: 'Error al crear el préstamo' });
  }
};

// Aprobar un préstamo (solo el propietario del recurso)
exports.approveLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('recurso_id');
    if (!loan) return res.status(404).json({ error: 'Préstamo no encontrado' });
    if (loan.estado !== 'pendiente') {
      return res.status(400).json({ error: 'Solo se pueden aprobar préstamos pendientes' });
    }

    const resource = loan.recurso_id;
    if (resource.propietario.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Solo el propietario del recurso puede aprobarlo' });
    }

    loan.estado = 'en curso';
    await loan.save();

    await Notification.create({
      usuario_destinatario: loan.prestatario,
      tipo: 'loan_approved',
      mensaje: `Tu solicitud de préstamo para "${resource.nombre_recurso}" fue aprobada`,
      referencia_id: resource.grupo,
    });

    res.json({ mensaje: 'Préstamo aprobado', prestamo: loan });
  } catch (error) {
    console.error('Error al aprobar el préstamo:', error);
    res.status(500).json({ error: 'Error al aprobar el préstamo' });
  }
};

// Denegar un préstamo (solo el propietario del recurso)
exports.denyLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('recurso_id');
    if (!loan) return res.status(404).json({ error: 'Préstamo no encontrado' });
    if (loan.estado !== 'pendiente') {
      return res.status(400).json({ error: 'Solo se pueden denegar préstamos pendientes' });
    }

    const resource = loan.recurso_id;
    if (resource.propietario.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Solo el propietario del recurso puede denegarlo' });
    }

    loan.estado = 'denegado';
    await loan.save();

    resource.estado = 'disponible';
    await resource.save();

    await Notification.create({
      usuario_destinatario: loan.prestatario,
      tipo: 'loan_denied',
      mensaje: `Tu solicitud de préstamo para "${resource.nombre_recurso}" fue rechazada`,
      referencia_id: resource.grupo,
    });

    res.json({ mensaje: 'Préstamo denegado', prestamo: loan });
  } catch (error) {
    console.error('Error al denegar el préstamo:', error);
    res.status(500).json({ error: 'Error al denegar el préstamo' });
  }
};

// Cancelar un préstamo (solo el prestatario, y solo si está pendiente)
exports.cancelLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('recurso_id');
    if (!loan) return res.status(404).json({ error: 'Préstamo no encontrado' });
    if (loan.prestatario.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Solo el solicitante puede cancelar el préstamo' });
    }
    if (loan.estado !== 'pendiente') {
      return res.status(400).json({ error: 'Solo se pueden cancelar préstamos pendientes' });
    }

    loan.estado = 'cancelado';
    await loan.save();

    const resource = loan.recurso_id;
    resource.estado = 'disponible';
    await resource.save();

    res.json({ mensaje: 'Préstamo cancelado', prestamo: loan });
  } catch (error) {
    console.error('Error al cancelar el préstamo:', error);
    res.status(500).json({ error: 'Error al cancelar el préstamo' });
  }
};

// Obtener todos los préstamos (admin)
exports.getLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate('recurso_id', 'nombre_recurso estado')
      .populate('prestatario', 'nombre email');
    res.json(loans);
  } catch (error) {
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
    res.status(500).json({ error: 'Error al obtener el préstamo' });
  }
};

// Obtener préstamos del usuario autenticado como prestatario
exports.getUserLoans = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ error: 'ID de usuario no válido' });
    }
    const loans = await Loan.find({ prestatario: new mongoose.Types.ObjectId(req.user.id) })
      .populate('recurso_id', 'nombre_recurso estado fotos')
      .sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    console.error('Error al obtener los préstamos del usuario:', error);
    res.status(500).json({ error: 'Error al obtener los préstamos del usuario' });
  }
};

// Obtener préstamos pendientes de recursos que el usuario posee
exports.getOwnerLoans = async (req, res) => {
  try {
    const resources = await Resource.find({ propietario: req.user.id }).select('_id nombre_recurso');
    const resourceIds = resources.map(r => r._id);

    const loans = await Loan.find({
      recurso_id: { $in: resourceIds },
      estado: 'pendiente'
    })
      .populate('recurso_id', 'nombre_recurso fotos')
      .populate('prestatario', 'nombre email')
      .sort({ createdAt: -1 });

    res.json(loans);
  } catch (error) {
    console.error('Error al obtener los préstamos como propietario:', error);
    res.status(500).json({ error: 'Error al obtener las solicitudes' });
  }
};

// Obtener préstamos de un grupo específico (admin del grupo)
exports.getGroupLoans = async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

    const isAuthorized =
      group.id_miembro_owner.equals(req.user.id) || group.colaboradores.includes(req.user.id);
    if (!isAuthorized) {
      return res.status(403).json({ error: 'No tenés permiso para acceder a los préstamos de este grupo' });
    }

    const loans = await Loan.find()
      .populate({
        path: 'recurso_id',
        match: { grupo: groupId },
        select: 'nombre_recurso estado fotos propietario'
      })
      .populate('prestatario', 'nombre email')
      .sort({ createdAt: -1 });

    res.json(loans.filter(l => l.recurso_id !== null));
  } catch (error) {
    console.error('Error al obtener los préstamos del grupo:', error);
    res.status(500).json({ error: 'Error al obtener los préstamos del grupo' });
  }
};

// Confirmar finalización de un préstamo (propietario del recurso)
exports.confirmLoanCompletion = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('recurso_id');
    if (!loan) return res.status(404).json({ error: 'Préstamo no encontrado' });

    const resource = loan.recurso_id;
    const group = await Group.findById(resource.grupo);
    if (!group) return res.status(404).json({ error: 'Grupo no encontrado' });

    const isAuthorized =
      group.id_miembro_owner.equals(req.user.id) ||
      group.colaboradores.includes(req.user.id) ||
      resource.propietario.toString() === req.user.id;

    if (!isAuthorized) {
      return res.status(403).json({ error: 'No tenés permiso para confirmar este préstamo' });
    }

    loan.estado = 'finalizado';
    await loan.save();

    resource.estado = 'disponible';
    await resource.save();

    await Notification.create({
      usuario_destinatario: loan.prestatario,
      tipo: 'loan_completed',
      mensaje: `El préstamo de "${resource.nombre_recurso}" fue marcado como finalizado`,
      referencia_id: resource.grupo,
    });

    res.json({ mensaje: 'Préstamo finalizado correctamente', prestamo: loan });
  } catch (error) {
    console.error('Error al finalizar el préstamo:', error);
    res.status(500).json({ error: 'Error al confirmar la finalización del préstamo' });
  }
};
