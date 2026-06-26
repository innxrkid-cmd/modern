import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createSuggestion,
  getSuggestions
} from '../controllers/suggestionController.js';

const router = express.Router();

router.post('/', authenticate, createSuggestion);
router.get('/', authenticate, getSuggestions);

export default router;
