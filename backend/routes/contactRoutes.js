import express from "express";
import { 
  addContact, 
  getContacts,
  getContactById, 
  updateContact, 
  deleteContact 
} from "../controllers/contactController.js";

const router = express.Router();

// GET all contacts
router.get("/", getContacts);

// GET single contact by ID
router.get("/:id", getContactById);

// POST create new contact
router.post("/", addContact);

// PUT update contact by ID
router.put("/:id", updateContact);

// DELETE contact by ID
router.delete("/:id", deleteContact);

export default router;