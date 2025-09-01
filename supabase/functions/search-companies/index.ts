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

    // Simulerad företagssökning (ersätt med riktig API-integration)
    const mockCompanies: CompanyData[] = [
      {
        name: "Bilreklam Nord AB",
        email: "kontakt@bilreklamnord.se",
        website: "www.bilreklamnord.se",
        industry: industry,
        location: location || "Stockholm",
        contactPerson: "Marcus Andersson",
        companySize: "10-50 anställda",
        notes: "Specialiserat på bilreklamer och fordonsgrafik"
      },
      {
        name: "Matreklam Sverige",
        email: "info@matreklamse.se", 
        website: "www.matreklamse.se",
        industry: industry,
        location: location || "Göteborg",
        contactPerson: "Lisa Johansson",
        companySize: "50-200 anställda",
        notes: "Livsmedelsmarknadsföring och restaurangreklam"
      },
      {
        name: "Kreativ Bilmedia",
        email: "hej@kreativbilmedia.se",
        website: "www.kreativbilmedia.se", 
        industry: industry,
        location: location || "Malmö",
        contactPerson: "Johan Berg",
        companySize: "5-25 anställda",
        notes: "Fordonsreklam och bildekor"
      },
      {
        name: "Gourmet Marketing",
        email: "kontakt@gourmetmarketing.se",
        website: "www.gourmetmarketing.se",
        industry: industry,
        location: location || "Uppsala",
        contactPerson: "Anna Lindström",
        companySize: "25-100 anställda", 
        notes: "Exklusiv matmarknadsföring och event"
      }
    ];

    // Filtrera baserat på branschtyp
    let filteredCompanies = mockCompanies;
    if (industry.toLowerCase().includes("bil")) {
      filteredCompanies = mockCompanies.filter(c => 
        c.name.toLowerCase().includes("bil") || 
        c.notes?.toLowerCase().includes("bil") ||
        c.notes?.toLowerCase().includes("fordon")
      );
    } else if (industry.toLowerCase().includes("mat") || industry.toLowerCase().includes("livs")) {
      filteredCompanies = mockCompanies.filter(c => 
        c.name.toLowerCase().includes("mat") || 
        c.notes?.toLowerCase().includes("mat") ||
        c.notes?.toLowerCase().includes("livsmedel") ||
        c.notes?.toLowerCase().includes("restaurang")
      );
    }

    // Begränsa antal resultat
    const companies = filteredCompanies.slice(0, limit);

    // Spara företag i databasen
    for (const company of companies) {
      const { error } = await supabase
        .from('organizations')
        .upsert(company, { onConflict: 'email' });
      
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