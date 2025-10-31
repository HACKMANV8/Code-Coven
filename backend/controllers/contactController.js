import Contact from "../models/contactModel.js";

// 🟢 GET all contacts
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

// 🟢 GET single contact by ID
export const getContactById = async (req, res) => {
  const { id } = req.params;

  try {
    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: "Error fetching contact: " + error.message });
  }
};

// 🟢 POST add a new contact
export const addContact = async (req, res) => {
  const { name, phone, relation } = req.body;

  if (!name || !phone || !relation) {
    return res.status(400).json({ message: "Please provide name, phone, and relation" });
  }

  try {
    const newContact = new Contact({ name, phone, relation });
    await newContact.save();
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: "Error saving contact: " + error.message });
  }
};

// 🟢 PUT update a contact
export const updateContact = async (req, res) => {
  const { id } = req.params;
  const { name, phone, relation } = req.body;

  if (!name || !phone || !relation) {
    return res.status(400).json({ message: "Please provide name, phone, and relation" });
  }

  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { name, phone, relation },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: "Error updating contact: " + error.message });
  }
};

// 🟢 DELETE a contact
export const deleteContact = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting contact: " + error.message });
  }
};