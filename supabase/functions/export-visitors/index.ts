import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as XLSX from 'npm:xlsx';

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

const defaultFields = [
  "name", "email", "city", "visit_date", "people_count", "created_at"
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

const toTitleCase = (str: string) =>
  str.replace(/_/g, " ").replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1));

function getTimestamp() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
}

Deno.serve(async (req) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! }
      }
    });

    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    if (!token) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

    // Parse body
    const body = await req.json();
    const { startDate, endDate, fields = defaultFields, format = "csv", orgId } = body;

    if (!orgId) return new Response("Organization not specified", { status: 400, headers: corsHeaders });

    // Query visitors with RLS enforced
    let query = supabaseClient
      .from("visitors")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (startDate) query = query.gte("visit_date", `${startDate}T00:00:00Z`);
    if (endDate) query = query.lte("visit_date", `${endDate}T23:59:59Z`);

    const { data: visitors, error } = await query.limit(100_000);
    if (error) return new Response(JSON.stringify(error), { status: 400, headers: corsHeaders });

    const titles = fields.map(toTitleCase);
    const timestamp = getTimestamp();
    const filename = `Visitors_${timestamp}.${format === "xlsx" ? "xlsx" : "csv"}`;

    // --- CSV ---
    if (format === "csv") {
      const csvRows = [
        titles.join(","),
        ...visitors.map(v => fields.map(f => v[f] ?? "").join(","))
      ];
      return new Response(csvRows.join("\n"), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}"`,
          ...corsHeaders
        }
      });
    }

    // --- XLSX ---
    if (format === "xlsx") {
      const wb = XLSX.utils.book_new();
      const wsData = visitors.map(v => {
        const row: Record<string, any> = {};
        fields.forEach((f, i) => row[titles[i]] = v[f] ?? "");
        return row;
      });
      const ws = XLSX.utils.json_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, "Visitors");
      const xlsxData = XLSX.write(wb, { type: "array", bookType: "xlsx" });

      return new Response(xlsxData, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
          ...corsHeaders
        }
      });
    }

    return new Response("Invalid format", { status: 400, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify(err), { status: 500, headers: corsHeaders });
  }
});
