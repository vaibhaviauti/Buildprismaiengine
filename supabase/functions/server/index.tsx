import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Emotional keywords for bias detection
const EMOTIONAL_KEYWORDS = {
  positive: ['excellent', 'amazing', 'wonderful', 'fantastic', 'brilliant', 'outstanding', 'perfect', 'incredible', 'exceptional', 'magnificent'],
  negative: ['terrible', 'awful', 'horrible', 'disgusting', 'atrocious', 'pathetic', 'abysmal', 'dreadful', 'deplorable', 'appalling'],
  loaded: ['always', 'never', 'everyone', 'nobody', 'absolutely', 'completely', 'totally', 'obviously', 'clearly', 'definitely']
};

function calculateBiasScore(query: string): number {
  const lowerQuery = query.toLowerCase();
  let emotionalCount = 0;
  const words = lowerQuery.split(/\s+/);

  for (const word of words) {
    if (EMOTIONAL_KEYWORDS.positive.some(kw => word.includes(kw)) ||
        EMOTIONAL_KEYWORDS.negative.some(kw => word.includes(kw)) ||
        EMOTIONAL_KEYWORDS.loaded.some(kw => word.includes(kw))) {
      emotionalCount++;
    }
  }

  const biasScore = Math.min(100, (emotionalCount / words.length) * 200);
  return Math.round(biasScore);
}

// Health check endpoint
app.get("/make-server-5706d5c6/health", (c) => {
  return c.json({ status: "ok" });
});

// Analysis endpoint
app.post("/make-server-5706d5c6/analyze", async (c) => {
  try {
    const { query } = await c.req.json();

    if (!query) {
      return c.json({ error: "Query is required" }, 400);
    }

    const biasScore = calculateBiasScore(query);

    // Multi-agent pipeline simulation
    const thesis = `Affirmative Position: ${query} demonstrates several compelling advantages. Primary evidence suggests measurable benefits across key performance indicators. Empirical data supports the viability of this approach, with stakeholder analysis revealing significant alignment with strategic objectives. Risk-adjusted projections indicate positive outcomes within acceptable confidence intervals.`;

    const antithesis = `Counterargument Framework: Critical examination of ${query} reveals substantive challenges. Alternative hypotheses warrant consideration, particularly regarding implementation complexity and resource allocation constraints. Comparative analysis with established methodologies suggests potential inefficiencies. Systematic review of precedent cases indicates non-trivial failure modes requiring mitigation protocols.`;

    const synthesis = `Dialectical Integration: The optimal resolution synthesizes elements from both positions. ${query} presents valid opportunities when deployed under constrained parameters with appropriate safeguards. A phased implementation strategy, incorporating continuous monitoring and adaptive governance mechanisms, mitigates identified risks while preserving core value propositions. This balanced approach aligns with evidence-based decision-making frameworks.`;

    const verdict = biasScore > 50
      ? `VERDICT: Query exhibits elevated bias coefficient (${biasScore}/100). Recommendation: Reframe analysis using neutral terminology to enhance objectivity. Current formulation may compromise analytic rigor.`
      : `VERDICT: Analysis demonstrates acceptable neutrality (bias coefficient: ${biasScore}/100). Dialectical synthesis supports conditional implementation with structured oversight. Recommendation: Proceed to stakeholder review phase with documented risk parameters.`;

    const analysisResult = {
      thesis,
      antithesis,
      synthesis,
      verdict,
      bias_score: biasScore,
      timestamp: new Date().toISOString(),
      query
    };

    return c.json(analysisResult);
  } catch (error) {
    console.log(`Analysis endpoint error: ${error}`);
    return c.json({ error: `Analysis failed: ${error.message}` }, 500);
  }
});

// Save analysis to history (requires auth)
app.post("/make-server-5706d5c6/save-analysis", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { analysis } = await c.req.json();
    const historyKey = `history_${user.id}_${Date.now()}`;

    await kv.set(historyKey, JSON.stringify(analysis));

    return c.json({ success: true, id: historyKey });
  } catch (error) {
    console.log(`Save analysis error: ${error}`);
    return c.json({ error: `Failed to save analysis: ${error.message}` }, 500);
  }
});

// Get user's analysis history (requires auth)
app.get("/make-server-5706d5c6/history", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const prefix = `history_${user.id}_`;
    const historyEntries = await kv.getByPrefix(prefix);

    const history = historyEntries.map((entry: any) => ({
      id: entry.key,
      ...JSON.parse(entry.value)
    })).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return c.json({ history });
  } catch (error) {
    console.log(`Get history error: ${error}`);
    return c.json({ error: `Failed to retrieve history: ${error.message}` }, 500);
  }
});

// Sign up endpoint
app.post("/make-server-5706d5c6/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: `Signup failed: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);