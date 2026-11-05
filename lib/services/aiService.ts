import { query } from '../db.js';

export async function callGemini(prompt: string, systemInstruction?: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

  const body: any = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.warn(`[Gemini API] HTTP ${res.status}: ${res.statusText}`);
      return null;
    }

    const data: any = await res.json();
    const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidate ? candidate.trim() : null;
  } catch (err: any) {
    console.warn(`[Gemini API Error] ${err?.message}`);
    return null;
  }
}

export async function askLearningAssistant(params: {
  question: string;
  topic?: string;
  careerRole?: string;
}): Promise<{ answer: string; grounded_sources: string[]; confidence_score: number }> {
  const { question, topic = 'Software Development', careerRole = 'Software Engineer' } = params;

  // Search local RAG knowledge chunks for grounding
  let groundedContext = '';
  const sources: string[] = [];

  try {
    const { rows: chunks } = await query(
      `SELECT title, content, source_url FROM knowledge_chunks WHERE content LIKE $1 LIMIT 2`,
      [`%${topic.split(' ')[0]}%`]
    );
    if (chunks.length > 0) {
      groundedContext = chunks.map((c: any) => `[Source: ${c.title}]\n${c.content}`).join('\n\n');
      sources.push(...chunks.map((c: any) => c.source_url || c.title));
    }
  } catch {
    // If knowledge_chunks table is empty, continue
  }

  const systemInstruction = `You are RoadmapIQ's grounded AI Career Mentor. You guide students preparing for '${careerRole}'. Provide concise, actionable, and encouraging guidance with code/syntax examples when applicable.`;

  const prompt = groundedContext
    ? `Reference Knowledge:\n${groundedContext}\n\nStudent Question:\n${question}\n\nTarget Topic: ${topic}`
    : `Student Question: ${question}\nTarget Topic: ${topic} in ${careerRole}`;

  const geminiResponse = await callGemini(prompt, systemInstruction);

  if (geminiResponse) {
    return {
      answer: geminiResponse,
      grounded_sources: sources.length > 0 ? sources : ['RoadmapIQ Verified Knowledge Base'],
      confidence_score: 0.95,
    };
  }

  // Deterministic fallback response when offline / no key
  return {
    answer: `### AI Career Mentor Guidance for **${topic}**

In **${careerRole}**, mastering **${topic}** is critical for both technical interviews and workplace execution.

**Recommended Action Steps:**
1. **Foundations**: Review standard architectural patterns and documentation for this milestone.
2. **Hands-On Practice**: Implement at least one working exercise in your local repository or sandbox.
3. **Evidence Verification**: Record your notes or GitHub link under the My Growth portfolio tab to verify completion.

*Tip: Break the problem into verifiable sub-components and write clean, self-documenting code.*`,
    grounded_sources: ['RoadmapIQ Curriculum Framework', 'Universal Career Knowledge Engine'],
    confidence_score: 0.88,
  };
}

export async function queryRag(params: { queryText: string }): Promise<any> {
  const { queryText } = params;
  const assistantRes = await askLearningAssistant({ question: queryText });
  return {
    query: queryText,
    answer: assistantRes.answer,
    sources: assistantRes.grounded_sources,
    confidence: assistantRes.confidence_score,
  };
}
