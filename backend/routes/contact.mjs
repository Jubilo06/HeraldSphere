import express from 'express'
import contactController from '../controllers/contactController.mjs'

const router = express.Router();

router.post("/contact", contactController.handleContactForm);

export default router;