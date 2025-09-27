import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as XLSX from 'npm:xlsx';

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const defaultFields = ["name", "email", "city", "visit_date", "people_count", "created_at"];
const toTitleCase = (str: string) =>
  str.replace(/_/g, " ").replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1));

function getTimestamp() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "csv";
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const fields = url.searchParams.get("fields")?.split(",") || defaultFields;
    const titles = fields.map(toTitleCase);

    let query = supabase
      .from("visitors")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100_000); // maximum safe records

    if (startDate) query = query.gte("visit_date", `${startDate}T00:00:00Z`);
    if (endDate) query = query.lte("visit_date", `${endDate}T23:59:59Z`);

    const { data: visitors, error } = await query;
    if (error) return new Response(JSON.stringify(error), { status: 400 });

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
        fields.forEach((f, i) => (row[titles[i]] = v[f] ?? ""));
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

    return new Response("Invalid format", { status: 400 });
  } catch (err) {
    return new Response(JSON.stringify(err), { status: 500 });
  }
});
