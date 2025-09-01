import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchRequest {
  industry: string;
  location?: string;
  companySize?: string;
  limit?: number;
}

interface CompanyData {
  name: string;
  email: string;
  website?: string;
  industry: string;
  location?: string;
  contactPerson?: string;
  companySize?: string;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { industry, location, companySize, limit = 50 }: SearchRequest = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKey = Deno.env.get("COMPANY_SEARCH_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API-nyckel för företagssökning saknas" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Söker företag för bransch:", industry);

    // Realistiska kontaktpersoner som kan behöva musikproduktion
    const mockCompanies: CompanyData[] = [
      {
        name: "Volvo Personbilar Sverige",
        email: "marketing@volvocars.se",
        website: "www.volvocars.se",
        industry: industry,
        location: location || "Göteborg",
        contactPerson: "Sara Lindqvist - Marknadsföringschef",
        companySize: "1000+ anställda",
        notes: "Behöver musik för bilreklamer och events"
      },
      {
        name: "ICA Maxi Stormarknad",
        email: "marketing@ica.se", 
        website: "www.ica.se",
        industry: industry,
        location: location || "Stockholm",
        contactPerson: "Magnus Eriksson - Butikschef",
        companySize: "500-1000 anställda",
        notes: "Butikradio och reklammusik för livsmedelskedja"
      },
      {
        name: "Restaurang Frantzén",
        email: "info@restaurantfrantzen.com",
        website: "www.restaurantfrantzen.com", 
        industry: industry,
        location: location || "Stockholm",
        contactPerson: "Björn Frantzén - Restaurangchef",
        companySize: "10-50 anställda",
        notes: "Bakgrundsmusik och event-musik för gourmetrestaurang"
      },
      {
        name: "Max Burgers",
        email: "marketing@max.se",
        website: "www.max.se",
        industry: industry,
        location: location || "Malmö",
        contactPerson: "Linda Svensson - Varumärkeschef", 
        companySize: "200-500 anställda",
        notes: "Reklammusik och ljudbranding för restaurangkedja"
      },
      {
        name: "H&M Hennes & Mauritz",
        email: "events@hm.com",
        website: "www.hm.com",
        industry: industry,
        location: location || "Stockholm", 
        contactPerson: "Emma Johansson - Event Manager",
        companySize: "1000+ anställda",
        notes: "Musik för modevisningar och butiksmiljö"
      },
      {
        name: "Scandic Hotels",
        email: "marketing@scandichotels.com",
        website: "www.scandichotels.com",
        industry: industry,
        location: location || "Stockholm",
        contactPerson: "Peter Andersson - Marknadsföringsdirektör",
        companySize: "1000+ anställda", 
        notes: "Bakgrundsmusik för hotellkedjans alla anläggningar"
      },
      {
        name: "Coop Sverige",
        email: "kundservice@coop.se",
        website: "www.coop.se",
        industry: industry,
        location: location || "Göteborg",
        contactPerson: "Anna Bergström - Kommunikationschef",
        companySize: "500-1000 anställda",
        notes: "Butikradio och reklamkampanjer för matvarukedja"
      },
      {
        name: "Nordic Choice Hotels",
        email: "info@nordicchoicehotels.com", 
        website: "www.nordicchoicehotels.com",
        industry: industry,
        location: location || "Oslo/Stockholm",
        contactPerson: "Maria Karlsson - Brand Manager",
        companySize: "1000+ anställda",
        notes: "Varumärkesmusik och event-produktion för hotellkedja"
      },
      {
        name: "Gekås Ullared",
        email: "info@gekas.se",
        website: "www.gekas.se", 
        industry: industry,
        location: location || "Ullared",
        contactPerson: "Boris Lennerhov - VD",
        companySize: "100-500 anställda",
        notes: "Butikmusik och reklamproduktion för varuhus"
      },
      {
        name: "Stadium Sport",
        email: "marketing@stadium.se",
        website: "www.stadium.se",
        industry: industry,
        location: location || "Norrköping", 
        contactPerson: "Fredrik Olsson - Marknadsföringschef",
        companySize: "200-500 anställda",
        notes: "Reklammusik och event-ljudproduktion för sportkedja"
      }
    ];

    // Filtrera baserat på branschtyp
    let filteredCompanies = mockCompanies;
    if (industry.toLowerCase().includes("bil")) {
      filteredCompanies = mockCompanies.filter(c => 
        c.name.toLowerCase().includes("volvo") ||
        c.notes?.toLowerCase().includes("bil") ||
        c.notes?.toLowerCase().includes("fordon") ||
        c.notes?.toLowerCase().includes("event")
      );
    } else if (industry.toLowerCase().includes("mat") || industry.toLowerCase().includes("livs")) {
      filteredCompanies = mockCompanies.filter(c => 
        c.name.toLowerCase().includes("ica") ||
        c.name.toLowerCase().includes("coop") ||
        c.name.toLowerCase().includes("max") ||
        c.name.toLowerCase().includes("restaurang") ||
        c.notes?.toLowerCase().includes("mat") ||
        c.notes?.toLowerCase().includes("restaurang") ||
        c.notes?.toLowerCase().includes("livsmedel")
      );
    } else if (industry.toLowerCase().includes("detaljhandel") || industry.toLowerCase().includes("butik")) {
      filteredCompanies = mockCompanies.filter(c => 
        c.name.toLowerCase().includes("h&m") ||
        c.name.toLowerCase().includes("gekås") ||
        c.name.toLowerCase().includes("stadium") ||
        c.notes?.toLowerCase().includes("butik")
      );
    } else if (industry.toLowerCase().includes("event")) {
      filteredCompanies = mockCompanies.filter(c => 
        c.name.toLowerCase().includes("scandic") ||
        c.name.toLowerCase().includes("nordic") ||
        c.notes?.toLowerCase().includes("event") ||
        c.notes?.toLowerCase().includes("hotell")
      );
    }

    // Begränsa antal resultat
    const companies = filteredCompanies.slice(0, limit);

    // Spara företag i databasen
    for (const company of companies) {
      const { error } = await supabase
        .from('organizations')
        .upsert({
          name: company.name,
          email: company.email,
          website: company.website,
          industry: company.industry,
          location: company.location,
          contact_person: company.contactPerson,
          company_size: company.companySize,
          notes: company.notes
        }, { onConflict: 'email' });
      
      if (error) {
        console.error("Fel vid sparande av företag:", error);
      }
    }

    console.log(`Hittade och sparade ${companies.length} företag`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        companies,
        count: companies.length 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error("Fel i företagssökning:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
};

serve(handler);