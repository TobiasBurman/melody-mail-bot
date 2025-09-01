import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CampaignRequest {
  campaignId: string;
  organizationIds: string[];
  subject: string;
  content: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignId, organizationIds, subject, content }: CampaignRequest = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "Resend API-nyckel saknas" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Skickar kampanj ${campaignId} till ${organizationIds.length} organisationer`);

    // Hämta organisationsdata
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .in('id', organizationIds);

    if (orgError) {
      throw new Error(`Fel vid hämtning av organisationer: ${orgError.message}`);
    }

    let successCount = 0;
    let errorCount = 0;

    // Skicka e-post till varje organisation
    for (const org of organizations || []) {
      try {
        // Personalisera meddelandet
        const personalizedContent = content
          .replace('[FÖRETAG]', org.name)
          .replace('[KONTAKTPERSON]', org.contact_person || 'Hej')
          .replace('[BRANSCH]', org.industry);

        const emailResult = await resend.emails.send({
          from: "Musikproducent <onboarding@resend.dev>",
          to: [org.email],
          subject: subject.replace('[FÖRETAG]', org.name),
          html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
              <h2 style="color: #333;">Hej ${org.contact_person || org.name}!</h2>
              <div style="line-height: 1.6; color: #555;">
                ${personalizedContent.replace(/\n/g, '<br>')}
              </div>
              <br>
              <p style="color: #777; font-size: 0.9em;">
                Detta meddelande skickades till ${org.email}
              </p>
            </div>
          `,
        });

        // Spara resultat
        await supabase.from('campaign_results').insert({
          campaign_id: campaignId,
          organization_id: org.id,
          status: 'sent',
          sent_at: new Date().toISOString()
        });

        successCount++;
        console.log(`E-post skickad till ${org.name} (${org.email})`);

      } catch (emailError: any) {
        console.error(`Fel vid skickning till ${org.name}:`, emailError);
        
        // Spara felresultat
        await supabase.from('campaign_results').insert({
          campaign_id: campaignId,
          organization_id: org.id,
          status: 'failed',
          error_message: emailError.message
        });

        errorCount++;
      }
    }

    // Uppdatera kampanjstatistik
    await supabase
      .from('campaigns')
      .update({ 
        sent_count: successCount,
        status: 'completed'
      })
      .eq('id', campaignId);

    console.log(`Kampanj slutförd: ${successCount} skickade, ${errorCount} fel`);

    return new Response(
      JSON.stringify({ 
        success: true,
        sent: successCount,
        failed: errorCount,
        total: organizationIds.length
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error("Fel i kampanjutskick:", error);
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