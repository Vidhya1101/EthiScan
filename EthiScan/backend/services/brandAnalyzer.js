function analyzeBrand(text, brandName) {

    let score = 50;

    const negatives = [
        "child labor",
        "pollution",
        "animal testing",
        "lawsuit",
        "plastic waste",
        "poor wages",
        "fast fashion",
        "worker abuse"
    ];

    const positives = [
        "recycled",
        "ethical sourcing",
        "eco friendly",
        "carbon neutral",
        "sustainable",
        "fair trade",
        "renewable"
    ];

    let issues = [];
    let strengths = [];

    negatives.forEach((word) => {

        if (
            text.toLowerCase().includes(word)
        ) {

            score -= 10;

            issues.push(word);
        }
    });

    positives.forEach((word) => {

        if (
            text.toLowerCase().includes(word)
        ) {

            score += 10;

            strengths.push(word);
        }
    });

    if (score > 100) score = 100;

    if (score < 0) score = 0;

    let sustainability = "Moderate";

    if (score >= 70) {
        sustainability = "Excellent";
    }

    else if (score < 40) {
        sustainability = "Poor";
    }

    return {

        brandName,

        ethicalScore: score,

        sustainability,

        industry: "Live Web Analysis",

        description:
            `${brandName} was analyzed using live ethical and sustainability indicators gathered from public web data.`,

        pros:
            strengths.length > 0
                ? strengths.join(" • ")
                : "No strong positive indicators detected.",

        cons:
            issues.length > 0
                ? issues.join(" • ")
                : "No major ethical concerns detected.",

        smartAlternatives: [

            {
                brandName: "Patagonia",
                ethicalScore: 92
            },

            {
                brandName: "Fairphone",
                ethicalScore: 88
            },

            {
                brandName: "Ecover",
                ethicalScore: 85
            }
        ]
    };
}

module.exports = analyzeBrand;