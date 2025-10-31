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

// 🟢 POST add a new contact
export const addContact = async (req, res) => {
  const { name, phoneNumber } = req.body;

  if (!name || !phoneNumber) {
    return res.status(400).json({ message: "Please provide name and phone number" });
  }

  try {
    const newContact = new Contact({ name, phoneNumber });
    await newContact.save();
    res.status(201).json(newContact);
  } catch (error) {
    res.status(500).json({ message: "Error saving contact: " + error.message });
  }
};
