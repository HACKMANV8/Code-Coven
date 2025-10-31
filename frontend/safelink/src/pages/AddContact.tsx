import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function AddContact() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');
  const [errors, setErrors] = useState({ name: false, phone: false, relation: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = {
      name: !name.trim(),
      phone: !phone.trim(),
      relation: !relation.trim(),
    };
    
    setErrors(newErrors);
    
    if (Object.values(newErrors).some(error => error)) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Contact Added",
      description: `${name} has been added to your emergency contacts`,
    });
    
    navigate('/emergency-contacts');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
        <motion.button 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/emergency-contacts')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Contacts</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Add Emergency Contact</h1>
          <p className="text-muted-foreground mb-8">
            Enter the details of your emergency contact
          </p>

          <Card className="p-6 card-shadow">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors(prev => ({ ...prev, name: false }));
                  }}
                  className={`rounded-2xl ${errors.name ? 'border-destructive' : ''}`}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">Name is required</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setErrors(prev => ({ ...prev, phone: false }));
                  }}
                  className={`rounded-2xl ${errors.phone ? 'border-destructive' : ''}`}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">Phone number is required</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="relation">Relation *</Label>
                <Input
                  id="relation"
                  placeholder="Father, Mother, Friend, etc."
                  value={relation}
                  onChange={(e) => {
                    setRelation(e.target.value);
                    setErrors(prev => ({ ...prev, relation: false }));
                  }}
                  className={`rounded-2xl ${errors.relation ? 'border-destructive' : ''}`}
                />
                {errors.relation && (
                  <p className="text-sm text-destructive">Relation is required</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full rounded-2xl h-12 text-base font-semibold hover:scale-[1.02] transition-transform"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Contact
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
