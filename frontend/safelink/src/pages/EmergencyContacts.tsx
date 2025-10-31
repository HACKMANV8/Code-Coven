import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Plus, Edit2, Trash2, ArrowLeft, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { WaveHeader } from '@/components/WaveHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Contact {
  id: number;
  name: string;
  phone: string;
  relation: string;
}

const initialContacts: Contact[] = [
  { id: 1, name: 'John Doe', phone: '+1 234 567 8900', relation: 'Father' },
  { id: 2, name: 'Jane Smith', phone: '+1 234 567 8901', relation: 'Mother' },
  { id: 3, name: 'Emergency Services', phone: '911', relation: 'Emergency' },
];

export default function EmergencyContacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', relation: '' });

  const handleDelete = (id: number) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const handleEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setEditForm({
      name: contact.name,
      phone: contact.phone,
      relation: contact.relation,
    });
  };

  const handleSaveEdit = () => {
    if (!editForm.name || !editForm.phone || !editForm.relation) return;
    
    setContacts(contacts.map(c =>
      c.id === editingId ? { ...c, ...editForm } : c
    ));
    setEditingId(null);
    setEditForm({ name: '', phone: '', relation: '' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', phone: '', relation: '' });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Navbar />
      
      <WaveHeader className="mt-16" contentClassName="pb-20 md:pb-24">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-primary-foreground/90 hover:text-primary-foreground mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
            <Phone size={32} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Emergency Contacts</h1>
            <p className="text-primary-foreground/90">
              Manage your trusted contacts
            </p>
          </div>
        </div>
      </WaveHeader>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="space-y-4">
          {contacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-5 card-shadow hover:card-shadow-hover transition-all duration-300">
                {editingId === contact.id ? (
                  <div className="space-y-3">
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Name"
                      className="w-full"
                    />
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Phone"
                      className="w-full"
                    />
                    <Input
                      value={editForm.relation}
                      onChange={(e) => setEditForm({ ...editForm, relation: e.target.value })}
                      placeholder="Relation"
                      className="w-full"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 hover:bg-secondary rounded-xl transition-colors"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="p-2 hover:bg-primary/10 rounded-xl transition-colors"
                      >
                        <Save className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-lg">{contact.name}</h4>
                        <p className="text-sm text-muted-foreground">{contact.phone}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {contact.relation}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(contact)}
                        className="p-2 hover:bg-secondary rounded-xl transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </button>
                      <button 
                        onClick={() => handleDelete(contact.id)}
                        className="p-2 hover:bg-destructive/10 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-8 right-8"
      >
        <Button
          onClick={() => navigate('/add-contact')}
          size="lg"
          className="rounded-full w-16 h-16 shadow-lg hover:shadow-xl animate-pulse-glow"
        >
          <Plus size={28} />
        </Button>
      </motion.div>
    </div>
  );
}
