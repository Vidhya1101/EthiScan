document.addEventListener("DOMContentLoaded", () => {

    const searchPlaceholder =
        document.getElementById("search-placeholder");

    if (!searchPlaceholder) return;

    fetch("/components/search-bar.html")

        .then(res => res.text())

        .then(html => {

            searchPlaceholder.innerHTML = html;

            initializeScannerEvents();
        })

        .catch(err => console.log(err));
});

function initializeScannerEvents() {

    const input =
        document.getElementById("brandSearchInput");

    const btn =
        document.getElementById("analyzeBtn");

    if (!input || !btn) return;

    async function executeAnalysis(queryValue) {

        const val = queryValue.trim();

        if (!val) return;

        const resPlaceholder =
            document.getElementById("result-placeholder");

        if (resPlaceholder) {

            resPlaceholder.innerHTML = `

                <div class="result-card-container animate-fade-in"
                    style="
                        background-color:#11131c;
                        border:1px solid #1e2230;
                        padding:32px;
                        border-radius:12px;
                        margin-top:24px;
                        text-align:center;
                    ">

                    <div style="
                        font-size:18px;
                        font-weight:600;
                    ">
                        Analyzing Brand Ethics...
                    </div>

                </div>
            `;
        }

        try {

            const response = await fetch(
                `/api/brands/${encodeURIComponent(val)}`
            );

            const data = await response.json();

            if (!response.ok || !data.success) {

    resPlaceholder.innerHTML = `

        <div style="
            background:#111827;
            border:1px solid #ef4444;
            padding:24px;
            border-radius:16px;
            margin-top:24px;
            color:white;
        ">

            <h3 style="
                color:#ef4444;
                margin-bottom:12px;
            ">
                Analysis Failed
            </h3>

            <p style="
                color:#9ca3af;
            ">
                Unable to analyze this brand right now.
            </p>

        </div>
    `;

    return;
}

            renderResultCard(data.brand);

        } catch (err) {

            console.log(err);

            if (resPlaceholder) {

                resPlaceholder.innerHTML = `

                    <div class="result-card-container animate-fade-in"
                        style="
                            background-color:#11131c;
                            border:1px solid #1e2230;
                            padding:32px;
                            border-radius:12px;
                            margin-top:24px;
                            text-align:center;
                        ">

                        <div style="
                            font-size:18px;
                            font-weight:600;
                            color:#ef4444;
                        ">
                            Server Error
                        </div>

                    </div>
                `;
            }
        }
    }

    btn.addEventListener("click", () => {
        executeAnalysis(input.value);
    });

    input.addEventListener("keypress", (e) => {

        if (e.key === "Enter") {
            executeAnalysis(input.value);
        }
    });

    document.querySelectorAll(".suggestion-tag")

        .forEach(tag => {

            tag.addEventListener("click", (e) => {

                    input.value =
                        e.target.textContent;

                    executeAnalysis(
                        e.target.textContent
                    );
            });
        });
}
function renderResultCard(brand) {

    const resPlaceholder =
        document.getElementById("result-placeholder");

    if (!resPlaceholder) return;

    let accentColor = "#f59e0b";

    const score = brand.ethicalScore || 0;

    if (score >= 70) {
        accentColor = "#10b981";
    }

    else if (score >= 40) {
        accentColor = "#f59e0b";
    }

    else {
        accentColor = "#ef4444";
    }

    resPlaceholder.innerHTML = `

        <div class="result-card-container animate-fade-in"

            style="
                background:#0f1117;
                border:1px solid #1f2430;
                padding:32px;
                border-radius:20px;
                margin-top:24px;
            ">

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:flex-start;
                gap:30px;
                flex-wrap:wrap;
            ">

                <div style="flex:1; min-width:280px;">

                    <div style="
                        font-size:11px;
                        color:#7c8597;
                        letter-spacing:1px;
                        text-transform:uppercase;
                    ">
                        Live Ethical Analysis
                    </div>

                    <h2 style="
                        font-size:42px;
                        font-weight:700;
                        margin-top:10px;
                        color:white;
                    ">
                        ${brand.brandName || "Unknown"}
                    </h2>

                    <div style="
                        margin-top:8px;
                        color:#7c8597;
                        font-size:14px;
                    ">
                        Industry • ${brand.industry || "General"}
                    </div>

                    <div style="
                        margin-top:18px;
                        display:inline-flex;
                        align-items:center;
                        gap:8px;
                        padding:8px 14px;
                        border-radius:999px;
                        border:1px solid ${accentColor};
                        color:${accentColor};
                        font-size:13px;
                        font-weight:600;
                    ">

                        ${brand.sustainability || "Unknown"}

                    </div>

                </div>

                <div style="
                    width:110px;
                    height:110px;
                    border-radius:50%;
                    border:5px solid ${accentColor};
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    font-size:38px;
                    font-weight:700;
                    color:${accentColor};
                    flex-shrink:0;
                ">

                    ${score}

                </div>

            </div>

            <div style="
                margin-top:28px;
                background:#151926;
                border:1px solid #222838;
                border-radius:14px;
                padding:18px;
                color:#cbd5e1;
                line-height:1.8;
                font-size:14px;
            ">

                ${brand.description ||
                "This brand was analyzed using live ethical evaluation and sustainability indicators."}

            </div>

            <div style="
                display:grid;
                grid-template-columns:
                repeat(auto-fit,minmax(280px,1fr));
                gap:20px;
                margin-top:28px;
            ">

                <div style="
                    background:#151926;
                    border:1px solid #222838;
                    border-radius:16px;
                    padding:20px;
                ">

                    <h3 style="
                        font-size:18px;
                        margin-bottom:16px;
                        color:white;
                    ">
                        Positive Indicators
                    </h3>

                    <div style="
                        color:#9ca3af;
                        line-height:1.8;
                        font-size:14px;
                    ">

                        ${brand.pros || "No positive indicators found."}

                    </div>

                </div>

                <div style="
                    background:#151926;
                    border:1px solid #222838;
                    border-radius:16px;
                    padding:20px;
                ">

                    <h3 style="
                        font-size:18px;
                        margin-bottom:16px;
                        color:white;
                    ">
                        Ethical Concerns
                    </h3>

                    <div style="
                        color:#9ca3af;
                        line-height:1.8;
                        font-size:14px;
                    ">

                        ${brand.cons || "No ethical concerns found."}

                    </div>

                </div>

            </div>

            ${
                brand.smartAlternatives &&
                brand.smartAlternatives.length > 0

                ? `

                <div style="
                    margin-top:28px;
                ">

                    <h3 style="
                        font-size:20px;
                        margin-bottom:18px;
                        color:white;
                    ">
                        Better Ethical Alternatives
                    </h3>

                    <div style="
                        display:grid;
                        grid-template-columns:
                        repeat(auto-fit,minmax(220px,1fr));
                        gap:16px;
                    ">

                        ${brand.smartAlternatives.map(item => `

                            <div style="
                                background:#151926;
                                border:1px solid #222838;
                                border-radius:16px;
                                padding:18px;
                            ">

                                <div style="
                                    font-size:18px;
                                    font-weight:600;
                                    color:white;
                                    margin-bottom:10px;
                                ">
                                    ${item.brandName}
                                </div>

                                <div style="
                                    color:#10b981;
                                    font-size:14px;
                                    font-weight:600;
                                ">
                                    Ethical Score •
                                    ${item.ethicalScore}
                                </div>

                            </div>

                        `).join("")}

                    </div>

                </div>

                `
                : ""
            }

        </div>
    `;
}