// services/translate.js
const OpenAI = require("openai");
const { Translate } = require('@google-cloud/translate').v2;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const googleTranslate = new Translate({
    key: process.env.GOOGLE_TRANSLATE_API_KEY,
});

/**
 * Translate using Google Translate (literal, no filtering)
 */
async function translateWithGoogle({ from, text }) {
    const isKen = from === "ken";
    const targetLang = isKen ? "zh-CN" : "en";

    const [translation] = await googleTranslate.translate(text, targetLang);
    return translation;
}

/**
 * Translate using OpenAI (warmer tone, but content filtered)
 */
async function translateWithOpenAI({ from, text }) {
    const isKen = from === "ken";

    const systemPrompt = isKen
        ? `You are a translation engine for romantic chat from a man (Ken) to a woman (Julie).
Detect the source language automatically and translate it into natural, modern written Chinese appropriate for private romantic messages.

Style:
- Keep the meaning faithful, but use warm, intimate, slightly seductive language that feels natural and affectionate for adults in a private relationship.
- Use natural, modern Chinese that a woman in her 30s–40s would find sweet and romantic.

Name handling:
- Keep the name "Julie" in English letters; do NOT translate or transliterate it.
- If the source text contains "Ken" in English or in any other form, render it as "Ken" in English letters in the output.
- Do NOT change or translate personal names.

Return only the translated text, with no explanations or extra comments.`
        : `You are a translation engine for romantic chat from a woman (Julie) to a man (Ken).
Detect the source language automatically and translate it into natural, modern English.

Style:
- Keep the meaning faithful, but use warm, intimate, slightly seductive language that feels natural and affectionate for adults in a private relationship.
- Use natural, modern English that a man in his 40s–50s would find sweet and romantic.

Name handling:
- If the source text expresses the man's name as "Ken" or via Chinese characters referring to him, render it as "Ken" in English letters.
- If the source text uses Julie's name, keep "Julie" as "Julie" in English letters.
- Do NOT change or translate personal names.

Return only the translated text, with no explanations or extra comments.`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text },
        ],
        temperature: 0.3,
    });

    return response.choices[0].message.content.trim();
}

/**
 * Hybrid translation: try OpenAI first, fall back to Google if it fails
 */
async function translate({ from, text }) {
    try {
        // Try OpenAI for warmer, more natural translation
        const translation = await translateWithOpenAI({ from, text });

        // Check if OpenAI refused or returned a policy message
        if (
            translation.toLowerCase().includes("i cannot") ||
            translation.toLowerCase().includes("i can't") ||
            translation.toLowerCase().includes("inappropriate") ||
            translation.toLowerCase().includes("i'm unable")
        ) {
            // OpenAI refused; fall back to Google
            console.log("OpenAI refused content, using Google Translate fallback");
            return await translateWithGoogle({ from, text });
        }

        return translation;
    } catch (error) {
        // If OpenAI errors for any reason (rate limit, content policy, network), use Google
        console.log("OpenAI translation failed, using Google Translate fallback:", error.message);
        return await translateWithGoogle({ from, text });
    }
}

module.exports = { translate };
