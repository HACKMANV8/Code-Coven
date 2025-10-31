import express from "express";
import { addContact, getContacts, updateContact, deleteContact } from "../controllers/contactController.js";

const router = express.Router();

router.get("/", getContacts);
router.post("/", addContact);
router.put("/:id", updateContact);
router.delete("/:id", deleteContact);

export default router;