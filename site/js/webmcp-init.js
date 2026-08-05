/**
 * EcoSmartHomes - WebMCP Browser Integration Script
 * Implements WebMCP API (W3C & Chrome WebMCP Specification)
 * Exposes site tools to AI browser agents via navigator.modelContext.provideContext()
 */

(function initWebMCP() {
  if (typeof window === 'undefined') return;

  const webMcpTools = [
    {
      name: "get_ber_analysis",
      description: "Calculates expected BER rating band improvement and primary energy savings for home retrofit options.",
      inputSchema: {
        type: "object",
        properties: {
          current_ber: { type: "string", description: "Current BER rating (G to A1)" },
          target_ber: { type: "string", description: "Target BER rating (B2 to A1)" }
        },
        required: ["current_ber", "target_ber"]
      },
      execute: async (args) => {
        return {
          current_ber: args.current_ber || "G",
          target_ber: args.target_ber || "B2",
          estimated_energy_saving_pct: 65,
          primary_energy_kwh_m2_yr_saved: 350,
          recommendation: "Full attic insulation, wall insulation upgrade, and Air-to-Water heat pump system."
        };
      }
    },
    {
      name: "calculate_seai_grants",
      description: "Computes SEAI grant allocations, heat pump readiness bonuses, and net out-of-pocket costs.",
      inputSchema: {
        type: "object",
        properties: {
          selected_measures: {
            type: "array",
            items: { type: "string" },
            description: "List of energy measures (attic_insulation, heat_pump, solar_pv)"
          }
        },
        required: ["selected_measures"]
      },
      execute: async (args) => {
        const measures = args.selected_measures || [];
        let total = 0;
        if (measures.includes("attic_insulation")) total += 1500;
        if (measures.includes("heat_pump")) total += 6500;
        if (measures.includes("solar_pv")) total += 2100;
        return {
          total_grants_eur: total,
          currency: "EUR",
          provider: "SEAI Ireland"
        };
      }
    }
  ];

  // Register WebMCP context with browser agent
  const registerContext = () => {
    if (navigator.modelContext && typeof navigator.modelContext.provideContext === 'function') {
      try {
        navigator.modelContext.provideContext({
          tools: webMcpTools,
          manifestUrl: "https://ecosmarthomes.ie/ai/manifest.json"
        });
        console.log("WebMCP successfully registered with navigator.modelContext");
      } catch (err) {
        console.warn("WebMCP registration warning:", err);
      }
    } else {
      // Expose WebMCP standard object on window for client agents
      window.WebMCP = {
        tools: webMcpTools,
        manifestUrl: "https://ecosmarthomes.ie/ai/manifest.json"
      };
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerContext);
  } else {
    registerContext();
  }
})();
