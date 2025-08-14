const express = require('express');
const { body, validationResult, param } = require('express-validator');
const Todo = require('../models/Todo');
const { authenticateToken, requireOwnership } = require('../middleware/auth');

const router = express.Router();

// Validierung für Todo-Erstellung
const createTodoValidation = [
  body('title')
    .isLength({ min: 1, max: 255 })
    .withMessage('Titel muss zwischen 1 und 255 Zeichen lang sein')
    .trim(),
  body('description')
    .optional()
    .isString()
    .withMessage('Beschreibung muss ein String sein'),
  body('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'DONE'])
    .withMessage('Status muss TODO, IN_PROGRESS oder DONE sein'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Fälligkeitsdatum muss ein gültiges Datum sein')
];

// Validierung für Todo-Update
const updateTodoValidation = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Titel muss zwischen 1 und 255 Zeichen lang sein')
    .trim(),
  body('description')
    .optional()
    .isString()
    .withMessage('Beschreibung muss ein String sein'),
  body('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'DONE'])
    .withMessage('Status muss TODO, IN_PROGRESS oder DONE sein'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Fälligkeitsdatum muss ein gültiges Datum sein')
];

// Validierung für Todo-ID
const todoIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Todo-ID muss eine gültige UUID sein')
];

// GET /todos - Alle Todos des Users abrufen
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const todos = await Todo.findByUserId(userId);

    res.json({
      success: true,
      message: 'Todos erfolgreich abgerufen',
      data: {
        todos,
        count: todos.length
      }
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Todos:', error);
    res.status(500).json({
      success: false,
      message: 'Server Fehler beim Abrufen der Todos',
      errorCode: 'SERVER_ERROR'
    });
  }
});

// GET /todos/status/:status - Todos nach Status filtern
router.get('/status/:status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.params;
    const userId = req.user.id || req.user._id;

    if (!['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Ungültiger Status',
        errorCode: 'INVALID_STATUS'
      });
    }

    const todos = await Todo.findByUserIdAndStatus(userId, status);

    res.json({
      success: true,
      message: `Todos mit Status ${status} erfolgreich abgerufen`,
      data: {
        todos,
        count: todos.length,
        status
      }
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Todos nach Status:', error);
    res.status(500).json({
      success: false,
      message: 'Server Fehler beim Abrufen der Todos',
      errorCode: 'SERVER_ERROR'
    });
  }
});

// GET /todos/overdue - Überfällige Todos abrufen
router.get('/overdue', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const overdueTodos = await Todo.findOverdue();
    
    // Nur Todos des aktuellen Users filtern
    const userOverdueTodos = overdueTodos.filter(todo => {
      const todoUserId = todo.userId || todo.userId;
      return todoUserId.toString() === userId.toString();
    });

    res.json({
      success: true,
      message: 'Überfällige Todos erfolgreich abgerufen',
      data: {
        todos: userOverdueTodos,
        count: userOverdueTodos.length
      }
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der überfälligen Todos:', error);
    res.status(500).json({
      success: false,
      message: 'Server Fehler beim Abrufen der überfälligen Todos',
      errorCode: 'SERVER_ERROR'
    });
  }
});

// GET /todos/:id - Einzelnes Todo abrufen
router.get('/:id', authenticateToken, todoIdValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validierungsfehler',
        errors: errors.array(),
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const todo = await Todo.findByPk ? await Todo.findByPk(id) : await Todo.findById(id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo nicht gefunden',
        errorCode: 'TODO_NOT_FOUND'
      });
    }

    // Prüfen, ob das Todo dem User gehört
    const todoUserId = todo.userId || todo.userId;
    if (todoUserId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Zugriff verweigert',
        errorCode: 'ACCESS_DENIED'
      });
    }

    res.json({
      success: true,
      message: 'Todo erfolgreich abgerufen',
      data: { todo }
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Todos:', error);
    res.status(500).json({
      success: false,
      message: 'Server Fehler beim Abrufen des Todos',
      errorCode: 'SERVER_ERROR'
    });
  }
});

// POST /todos - Neues Todo erstellen
router.post('/', authenticateToken, createTodoValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validierungsfehler',
        errors: errors.array(),
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const { title, description, status, dueDate } = req.body;
    const userId = req.user.id || req.user._id;

    const todo = await Todo.create({
      title,
      description,
      status: status || 'TODO',
      dueDate,
      userId
    });

    res.status(201).json({
      success: true,
      message: 'Todo erfolgreich erstellt',
      data: { todo }
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Todos:', error);
    res.status(500).json({
      success: false,
      message: 'Server Fehler beim Erstellen des Todos',
      errorCode: 'SERVER_ERROR'
    });
  }
});

// PUT /todos/:id - Todo aktualisieren
router.put('/:id', authenticateToken, todoIdValidation, updateTodoValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validierungsfehler',
        errors: errors.array(),
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const todo = await Todo.findByPk ? await Todo.findByPk(id) : await Todo.findById(id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo nicht gefunden',
        errorCode: 'TODO_NOT_FOUND'
      });
    }

    // Prüfen, ob das Todo dem User gehört
    const todoUserId = todo.userId || todo.userId;
    if (todoUserId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Zugriff verweigert',
        errorCode: 'ACCESS_DENIED'
      });
    }

    // Todo aktualisieren
    const updatedTodo = await todo.update(req.body);

    res.json({
      success: true,
      message: 'Todo erfolgreich aktualisiert',
      data: { todo: updatedTodo }
    });
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Todos:', error);
    res.status(500).json({
      success: false,
      message: 'Server Fehler beim Aktualisieren des Todos',
      errorCode: 'SERVER_ERROR'
    });
  }
});

// PATCH /todos/:id/status - Todo-Status ändern
router.patch('/:id/status', authenticateToken, todoIdValidation, [
  body('status')
    .isIn(['TODO', 'IN_PROGRESS', 'DONE'])
    .withMessage('Status muss TODO, IN_PROGRESS oder DONE sein')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validierungsfehler',
        errors: errors.array(),
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id || req.user._id;

    const todo = await Todo.findByPk ? await Todo.findByPk(id) : await Todo.findById(id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo nicht gefunden',
        errorCode: 'TODO_NOT_FOUND'
      });
    }

    // Prüfen, ob das Todo dem User gehört
    const todoUserId = todo.userId || todo.userId;
    if (todoUserId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Zugriff verweigert',
        errorCode: 'ACCESS_DENIED'
      });
    }

    // Status ändern
    todo.status = status;
    await todo.save();

    res.json({
      success: true,
      message: 'Todo-Status erfolgreich geändert',
      data: { todo }
    });
  } catch (error) {
    console.error('Fehler beim Ändern des Todo-Status:', error);
    res.status(500).json({
      success: false,
      message: 'Server Fehler beim Ändern des Todo-Status',
      errorCode: 'SERVER_ERROR'
    });
  }
});

// DELETE /todos/:id - Todo löschen
router.delete('/:id', authenticateToken, todoIdValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validierungsfehler',
        errors: errors.array(),
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const todo = await Todo.findByPk ? await Todo.findByPk(id) : await Todo.findById(id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo nicht gefunden',
        errorCode: 'TODO_NOT_FOUND'
      });
    }

    // Prüfen, ob das Todo dem User gehört
    const todoUserId = todo.userId || todo.userId;
    if (todoUserId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Zugriff verweigert',
        errorCode: 'ACCESS_DENIED'
      });
    }

    // Todo löschen
    await todo.destroy();

    res.json({
      success: true,
      message: 'Todo erfolgreich gelöscht'
    });
  } catch (error) {
    console.error('Fehler beim Löschen des Todos:', error);
    res.status(500).json({
      success: false,
      message: 'Server Fehler beim Löschen des Todos',
      errorCode: 'SERVER_ERROR'
    });
  }
});

module.exports = router;
