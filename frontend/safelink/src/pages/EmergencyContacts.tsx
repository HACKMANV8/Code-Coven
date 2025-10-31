import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Phone, Trash2, Edit, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { emergencyContactsAPI } from '@/lib/api';

interface Contact {
  _id: string;
  name: string;
  phone: string;
  relation: string;
}

export default function EmergencyContacts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch contacts when component loads
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await emergencyContactsAPI.getAll();
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error Loading Contacts",
        description: (error as Error).message || "Failed to load contacts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await emergencyContactsAPI.delete(id);
      
      // Remove from local state
      setContacts(contacts.filter(contact => contact._id !== id));
      
      toast({
        title: "Contact Deleted",
        description: `${name} has been removed from your emergency contacts`,
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error Deleting Contact",
        description: (error as Error).message || "Failed to delete contact. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Emergency Contacts</h1>
              <p className="text-muted-foreground">
                Manage your trusted contacts for emergencies
              </p>
            </div>
            <Button 
              onClick={() => navigate('/add-contact')}
              className="rounded-2xl hover:scale-[1.02] transition-transform"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Contact
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading contacts...</p>
            </div>
          ) : contacts.length === 0 ? (
            <Card className="p-12 text-center card-shadow">
              <UserCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Emergency Contacts Yet</h3>
              <p className="text-muted-foreground mb-6">
                Add trusted contacts who will be notified in case of emergency
              </p>
              <Button 
                onClick={() => navigate('/add-contact')}
                className="rounded-2xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Contact
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {contacts.map((contact, index) => (
                <motion.div
                  key={contact._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 card-shadow hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserCircle className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            {contact.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {contact.phone}
                            </span>
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                              {contact.relation}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/edit-contact/${contact._id}`)}
                          className="rounded-full hover:bg-primary/10"
                        >
                          <Edit className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(contact._id, contact.name)}
                          disabled={deletingId === contact._id}
                          className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                        >
                          {deletingId === contact._id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-destructive"></div>
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}