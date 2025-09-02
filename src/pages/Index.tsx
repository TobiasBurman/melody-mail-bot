import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Search, Send, Building2, Eye, ArrowLeft, Mail } from "lucide-react";
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
  selected?: boolean;
}

const Index = () => {
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedOrganizations, setSelectedOrganizations] = useState<Organization[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [campaign, setCampaign] = useState({
    name: '',
    industry: '',
    subject: '',
    content: `Hej [KONTAKTPERSON]!

Jag heter [DITT NAMN] och arbetar som musikproducent med specialisering på kommersiell musik och ljudbranding.

Jag har sett att [FÖRETAG] är ett framgångsrikt företag inom [BRANSCH] och tänkte att ni kanske skulle vara intresserade av professionell musikproduktion för:

• Reklamkampanjer och marknadsföring
• Bakgrundsmusik för butiker/lokaler  
• Event och företagsarrangemang
• Ljudbranding och varumärkesmusik

Jag har tidigare arbetat med liknande företag och kan skräddarsy musik som stärker ert varumärke.

Skulle ni vara intresserade av en kort presentation av vad jag kan erbjuda [FÖRETAG]?

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
          limit: 100
        }
      });

      if (error) throw error;

      setSelectedOrganizations((data.companies || []).map((org: Organization) => ({ ...org, selected: true })));
      
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

  const toggleOrganization = (orgId: string) => {
    setSelectedOrganizations(prev => 
      prev.map(org => 
        org.id === orgId 
          ? { ...org, selected: !org.selected }
          : org
      )
    );
  };

  const getSelectedOrganizations = () => {
    return selectedOrganizations.filter(org => org.selected !== false);
  };

  const handleShowPreview = () => {
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
        description: "Sök och välj företag innan du förhandsgranskar kampanjen",
        variant: "destructive", 
      });
      return;
    }

    setShowPreview(true);
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

    const selectedOrgs = getSelectedOrganizations();
    if (selectedOrgs.length === 0) {
      toast({
        title: "Fel",
        description: "Välj minst ett företag innan du skickar kampanjen",
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
          organizationIds: selectedOrgs.map(org => org.id),
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
      setShowPreview(false);

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
    <div className="min-h-screen p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 pointer-events-none" />
      <div className="max-w-4xl mx-auto space-y-6 relative">
        <div className="text-center mb-8 py-12">
          <div className="inline-block px-8 py-4 gradient-primary rounded-2xl shadow-2xl mb-6">
            <h1 className="text-4xl font-bold text-primary-foreground mb-2">
              🎵 E-postbot för Musikproducenter
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Hitta och kontakta företag inom bilreklam, matreklam och andra branscher automatiskt med AI-driven precision
          </p>
        </div>

        <Card className="glass-effect shadow-xl border-0">
          <CardHeader className="gradient-secondary rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-accent-foreground">
              <Building2 className="h-5 w-5" />
              Skapa Ny Kampanj
            </CardTitle>
            <CardDescription className="text-accent-foreground/80">
              Ange kampanjdetaljer och sök efter relevanta företag med AI-assistans
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
                    <SelectItem value="bilreklam">Bilföretag & Fordonstillverkare</SelectItem>
                    <SelectItem value="matreklam">Restauranger & Livsmedelsföretag</SelectItem>
                    <SelectItem value="detaljhandel">Detaljhandel & Kedjor</SelectItem>
                    <SelectItem value="event">Hotell & Eventföretag</SelectItem>
                    <SelectItem value="marknadsföring">Företag med Marknadsavdelningar</SelectItem>
                    <SelectItem value="stora-företag">Stora Företag (1000+ anställda)</SelectItem>
                    <SelectItem value="små-företag">Små Företag (1-50 anställda)</SelectItem>
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

            <div className="flex gap-2">
              <Button 
                onClick={handleSearchCompanies}
                disabled={isSearching || !campaign.industry}
                className="flex-1 gradient-primary border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Söker företag...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    🚀 Sök 100+ Företag Automatiskt
                  </>
                )}
              </Button>

              {selectedOrganizations.length > 0 && !showPreview && (
                <Button 
                  onClick={handleShowPreview}
                  variant="outline"
                  className="flex-1 border-primary/30 bg-accent/20 hover:bg-accent/40 transition-all duration-300 hover:scale-[1.02]"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Förhandsgranska ({getSelectedOrganizations().length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedOrganizations.length > 0 && !showPreview && (
          <Card className="glass-effect shadow-xl border-0">
            <CardHeader className="gradient-secondary rounded-t-lg">
              <CardTitle className="text-accent-foreground">
                🎯 Hittade Företag ({selectedOrganizations.length})
              </CardTitle>
              <CardDescription className="text-accent-foreground/80">
                Välj vilka företag som ska få ditt meddelande
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 mb-4 max-h-96 overflow-y-auto">
                {selectedOrganizations.map((org) => (
                  <div key={org.id} className="flex items-center space-x-3 p-4 border rounded-xl bg-gradient-to-r from-card to-muted/20 hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
                    <Checkbox
                      checked={org.selected !== false}
                      onCheckedChange={() => toggleOrganization(org.id)}
                      className="border-primary data-[state=checked]:bg-primary"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-card-foreground">{org.name}</h4>
                      <p className="text-sm text-muted-foreground">{org.email}</p>
                      {org.contact_person && (
                        <p className="text-sm text-muted-foreground">
                          👤 Kontakt: {org.contact_person}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className="gradient-primary border-0 text-primary-foreground">
                        {org.industry}
                      </Badge>
                      {org.location && (
                        <span className="text-xs text-muted-foreground">📍 {org.location}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-sm text-muted-foreground mb-3">
                {getSelectedOrganizations().length} av {selectedOrganizations.length} företag valda
              </div>
            </CardContent>
          </Card>
        )}

        {showPreview && (
          <Card className="glass-effect shadow-xl border-0">
            <CardHeader className="gradient-secondary rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-accent-foreground">
                <Mail className="h-5 w-5" />
                ✨ Förhandsgranskning - {getSelectedOrganizations().length} Mottagare
              </CardTitle>
              <CardDescription className="text-accent-foreground/80">
                Kontrollera alla e-postadresser innan kampanjen skickas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-medium">Kampanjdetaljer:</h3>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p><span className="font-medium">Namn:</span> {campaign.name}</p>
                  <p><span className="font-medium">Ämne:</span> {campaign.subject}</p>
                  <p><span className="font-medium">Bransch:</span> {campaign.industry}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">E-postadresser som kommer få meddelandet:</h3>
                <div className="bg-muted/50 p-4 rounded-lg max-h-48 overflow-y-auto">
                  {getSelectedOrganizations().map((org, index) => (
                    <div key={org.id} className="flex items-center justify-between py-2 border-b border-muted last:border-b-0">
                      <div>
                        <span className="font-medium">{org.name}</span>
                        <span className="text-muted-foreground ml-2">({org.contact_person || 'Ingen kontaktperson'})</span>
                      </div>
                      <code className="text-sm bg-background px-2 py-1 rounded">{org.email}</code>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Totalt: <span className="font-medium">{getSelectedOrganizations().length}</span> e-postmeddelanden kommer att skickas
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowPreview(false)}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Tillbaka för Redigering
                </Button>
                
                <Button 
                  onClick={handleSendCampaign}
                  disabled={isSending}
                  className="flex-1 gradient-primary border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
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
                      🚀 Bekräfta & Skicka ({getSelectedOrganizations().length} e-post)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;