import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Send, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Organization {
  id: string;
  name: string;
  email: string;
  website?: string;
  industry: string;
  location?: string;
  contact_person?: string;
  company_size?: string;
  notes?: string;
}

const Index = () => {
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedOrganizations, setSelectedOrganizations] = useState<Organization[]>([]);
  const [campaign, setCampaign] = useState({
    name: '',
    industry: '',
    subject: '',
    content: `Hej [KONTAKTPERSON]!

Jag heter [DITT NAMN] och arbetar som musikproducent med specialisering på [BRANSCH]-segmentet.

Jag har sett att [FÖRETAG] är aktiva inom [BRANSCH] och tänkte att vi kanske kunde utforska möjligheter att samarbeta kring musik och ljudproduktion för era projekt.

Med vänliga hälsningar,
[DITT NAMN]
Musikproducent`
  });

  const handleSearchCompanies = async () => {
    if (!campaign.industry.trim()) {
      toast({
        title: "Fel",
        description: "Ange vilken bransch du vill söka inom",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-companies', {
        body: {
          industry: campaign.industry,
          limit: 20
        }
      });

      if (error) throw error;

      setSelectedOrganizations(data.companies || []);
      
      toast({
        title: "Företagssökning klar!",
        description: `Hittade ${data.companies?.length || 0} företag inom ${campaign.industry}`,
      });

    } catch (error: any) {
      console.error('Fel vid företagssökning:', error);
      toast({
        title: "Fel",
        description: error.message || "Kunde inte söka företag",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!campaign.name || !campaign.subject || !campaign.content) {
      toast({
        title: "Fel", 
        description: "Fyll i alla obligatoriska fält",
        variant: "destructive",
      });
      return;
    }

    if (selectedOrganizations.length === 0) {
      toast({
        title: "Fel",
        description: "Sök och välj företag innan du skickar kampanjen",
        variant: "destructive", 
      });
      return;
    }

    setIsSending(true);
    try {
      // Skapa kampanj i databasen
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          name: campaign.name,
          subject: campaign.subject,
          target_industry: campaign.industry,
          status: 'sending',
          user_id: 'anonymous' // Placeholder för autentisering senare
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Skicka e-postmeddelanden
      const { data, error } = await supabase.functions.invoke('send-campaign', {
        body: {
          campaignId: campaignData.id,
          organizationIds: selectedOrganizations.map(org => org.id),
          subject: campaign.subject,
          content: campaign.content
        }
      });

      if (error) throw error;

      toast({
        title: "Kampanj skickad!",
        description: `${data.sent} e-postmeddelanden skickades, ${data.failed} misslyckades`,
      });

      // Rensa formulär
      setCampaign({
        name: '',
        industry: '',
        subject: '',
        content: campaign.content // Behåll mallen
      });
      setSelectedOrganizations([]);

    } catch (error: any) {
      console.error('Fel vid kampanjutskick:', error);
      toast({
        title: "Fel",
        description: error.message || "Kunde inte skicka kampanjen", 
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            E-postbot för Musikproducenter
          </h1>
          <p className="text-xl text-muted-foreground">
            Hitta och kontakta företag inom bilreklam, matreklam och andra branscher automatiskt
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Skapa Ny Kampanj
            </CardTitle>
            <CardDescription>
              Ange kampanjdetaljer och sök efter relevanta företag
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Kampanjnamn *</Label>
                <Input
                  id="campaign-name"
                  value={campaign.name}
                  onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                  placeholder="t.ex. Bilreklam Q1 2024"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Målbransch *</Label>
                <Select
                  value={campaign.industry}
                  onValueChange={(value) => setCampaign({ ...campaign, industry: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Välj bransch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bilreklam">Bilreklam & Fordonsgrafik</SelectItem>
                    <SelectItem value="matreklam">Matreklam & Restauranger</SelectItem>
                    <SelectItem value="detaljhandel">Detaljhandel & Butiker</SelectItem>
                    <SelectItem value="event">Event & Catering</SelectItem>
                    <SelectItem value="marknadsföring">Marknadsföringsbyråer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">E-postämne *</Label>
              <Input
                id="subject"
                value={campaign.subject}
                onChange={(e) => setCampaign({ ...campaign, subject: e.target.value })}
                placeholder="Musikproduktion för [FÖRETAG] - Samarbetsmöjligheter"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">E-postmall *</Label>
              <Textarea
                id="content"
                value={campaign.content}
                onChange={(e) => setCampaign({ ...campaign, content: e.target.value })}
                rows={8}
                className="resize-y"
              />
              <p className="text-sm text-muted-foreground">
                Använd [FÖRETAG], [KONTAKTPERSON], [BRANSCH] för personalisering
              </p>
            </div>

            <Button 
              onClick={handleSearchCompanies}
              disabled={isSearching || !campaign.industry}
              className="w-full"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Söker företag...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Sök Företag Automatiskt
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {selectedOrganizations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Hittade Företag ({selectedOrganizations.length})</CardTitle>
              <CardDescription>
                Dessa företag kommer att få ditt meddelande
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 mb-4">
                {selectedOrganizations.map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{org.name}</h4>
                      <p className="text-sm text-muted-foreground">{org.email}</p>
                      {org.contact_person && (
                        <p className="text-sm text-muted-foreground">
                          Kontakt: {org.contact_person}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="secondary">{org.industry}</Badge>
                      {org.location && (
                        <span className="text-xs text-muted-foreground">{org.location}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={handleSendCampaign}
                disabled={isSending}
                className="w-full"
                size="lg"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Skickar kampanj...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Skicka till Alla ({selectedOrganizations.length} företag)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;