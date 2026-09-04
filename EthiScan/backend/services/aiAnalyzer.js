const OpenAI =
    require("openai");

const client =
    new OpenAI({

        baseURL:
        "https://openrouter.ai/api/v1",

        apiKey:
        process.env.OPENROUTER_API_KEY
    });

async function analyzeWithAI(
    brandName,
    webData
) {

    try {

        const prompt = `

You are an advanced ethical brand intelligence AI.

Analyze this company or brand:

${brandName}

Internet research data:

${webData}

Your responsibilities:

1. Detect the REAL industry/category of the brand
2. Analyze sustainability and ethics fairly
3. Consider BOTH positive and negative evidence
4. Generate a realistic ethical score
5. Suggest BETTER ETHICAL ALTERNATIVES from the SAME INDUSTRY

IMPORTANT:

- DO NOT exaggerate negativity
- DO NOT assign 0 unless extremely unethical
- Most brands fall between 35-85
- Use nuanced reasoning
- Alternatives MUST belong to same industry/category
- Alternatives should be REAL companies
- If the brand is fashion → fashion alternatives
- If technology → technology alternatives
- If food → food alternatives
- If retail → retail alternatives
- If automotive → automotive alternatives

Scoring Guide:

90-100:
Exceptional ethical leadership

75-89:
Strong sustainability and ethical practices

60-74:
Mixed but generally responsible

40-59:
Significant ethical concerns

20-39:
Serious sustainability or labor concerns

0-19:
Extreme unethical behavior

Return ONLY VALID JSON.

{
  "brandName": "",
  "ethicalScore": 0,
  "sustainability": "",
  "industry": "",
  "description": "",
  "pros": "",
  "cons": "",
  "smartAlternatives": [
    {
      "brandName": "",
      "ethicalScore": 0
    },
    {
      "brandName": "",
      "ethicalScore": 0
    }
  ]
}
`;

        const response =
            await client.chat.completions.create({

                model:
                   "openrouter/free",

                messages: [

                    {
                        role: "system",

                        content:
                        "You are an ethical brand intelligence AI."
                    },

                    {
                        role: "user",

                        content: prompt
                    }
                ],

                temperature: 0.7
            });

        let text =
            response.choices[0]
            .message.content;

        console.log(
            "RAW AI:",
            text
        );

        text = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const parsed =
    JSON.parse(text);

if (
    !parsed.smartAlternatives ||
    parsed.smartAlternatives.length === 0
) {

    parsed.smartAlternatives = [

        {
            brandName:
            "No strong alternative found",

            ethicalScore: 0
        }
    ];
}

return parsed;

    } catch (error) {

        console.log(
            "OPENROUTER ERROR:",
            error
        );

        return {

            brandName,

            ethicalScore: 50,

            sustainability: "Moderate",

            industry: "General",

            description:
                "AI analysis temporarily unavailable.",

            pros:
                "Data insufficient",

            cons:
                "Data insufficient",

            smartAlternatives: []
        };
    }
}

module.exports =
    analyzeWithAI;