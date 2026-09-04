const axios = require("axios");

async function scrapeBrandData(brandName) {

    try {

        const response =
            await axios.post(

                "https://google.serper.dev/search",

                {
                    q:
                    `${brandName} sustainability ethics controversies`
                },

                {
                    headers: {

                        "X-API-KEY":
                        process.env.SERPER_API_KEY,

                        "Content-Type":
                        "application/json"
                    }
                }
            );

        const results =
            response.data.organic || [];

        let combinedText = "";

        results.forEach((result) => {

            combinedText +=
                `${result.title} `;

            combinedText +=
                `${result.snippet} `;
        });

        return combinedText;

    } catch (error) {

        console.log(
            "SERPER ERROR:",
            error.message
        );

        return "";
    }
}

module.exports = scrapeBrandData;