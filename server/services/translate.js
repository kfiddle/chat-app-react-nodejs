// // services/translate.js
// const { OpenAI } = require("openai");

// const openAI = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });


// /**
//  * Translate a message between Ken and Julie with romantic tone.
//  * @param {Object} params
//  * @param {"ken"|"julie"} params.from - Who sent the original text.
//  * @param {string} params.text - Original message text.
//  * @returns {Promise<string>} Translated text.
//  */
// async function translate({ from, text }) {
//     const isKen = from === "ken";

//     const systemPrompt = isKen
//         ? `You are a translation engine for romantic chat from a man (Ken) to a woman (Julie).
// Detect the source language automatically and translate it into natural, modern written Chinese appropriate for private romantic messages.

// Style:
// - Keep the meaning faithful, but use warm, intimate, slightly seductive language that feels natural and affectionate for adults in a private relationship.
// - Use natural, modern Chinese that a woman in her 50s would find sweet and romantic.

// Name handling:
// - Keep the name "Julie" in English letters; do NOT translate or transliterate it.
// - If the source text contains "Ken" in English or in any other form, render it as "Ken" in English letters in the output.
// - Do NOT change or translate personal names.

// Return only the translated text, with no explanations or extra comments.`
//         : `You are a translation engine for romantic chat from a woman (Julie) to a man (Ken).
// Detect the source language automatically and translate it into natural, modern English.

// Style:
// - Keep the meaning faithful, but use warm, intimate, slightly seductive language that feels natural and affectionate for adults in a private relationship.
// - Use natural, modern English that a man in his 50s would find sweet and romantic.

// Name handling:
// - If the source text expresses the man's name as "Ken" or via Chinese characters referring to him, render it as "Ken" in English letters.
// - If the source text uses Julie’s name, keep "Julie" as "Julie" in English letters.
// - Do NOT change or translate personal names.

// Return only the translated text, with no explanations or extra comments.`;

//     const response = await openAI.chat.completions.create({
//         model: "gpt-4o-mini",
//         messages: [
//             { role: "system", content: systemPrompt },
//             { role: "user", content: text },
//         ],
//         temperature: 0,
//     });

//     return response.choices[0].message.content.trim();
// }

// module.exports = { translate };
