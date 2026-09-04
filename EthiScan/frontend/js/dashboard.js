async function loadDashboard() {

    try {

        const token =
            localStorage.getItem(
                "token"
            );

        const response =
            await fetch(
                "/api/history",
                {

                    headers: {

                        Authorization:

                        token

                        ? `Bearer ${token}`

                        : ""
                    }
                }
            );

        const history =
            await response.json();

        const tableBody =
            document.getElementById(
                "searchHistoryTableBody"
            );

        tableBody.innerHTML = "";

        let ethical = 0;
        let warning = 0;
        let unethical = 0;

        history.forEach(item => {

            if (
                item.status ===
                "ETHICAL"
            ) {

                ethical++;
            }

            else if (
                item.status ===
                "WARNING"
            ) {

                warning++;
            }

            else if (
                item.status ===
                "UNETHICAL"
            ) {

                unethical++;
            }

            tableBody.innerHTML += `

                <tr>

                    <td>
                        ${item.query}
                    </td>

                    <td>
                        ${new Date(
                            item.createdAt
                        ).toLocaleString()}
                    </td>

                    <td>
                        ${item.status}
                    </td>

                </tr>
            `;
        });

        const total =
            history.length;

        document.getElementById(
            "totalBrands"
        ).textContent =
            total;

        document.getElementById(
            "ethicalCount"
        ).textContent =
            ethical;

        document.getElementById(
            "warningCount"
        ).textContent =
            warning;

        document.getElementById(
            "unethicalCount"
        ).textContent =
            unethical;

        document.getElementById(
            "ethicalPct"
        ).textContent =

            total

            ? `${Math.round(
                (ethical / total) * 100
              )}% of catalog`

            : "0% of catalog";

        document.getElementById(
            "warningPct"
        ).textContent =

            total

            ? `${Math.round(
                (warning / total) * 100
              )}% of catalog`

            : "0% of catalog";

        document.getElementById(
            "unethicalPct"
        ).textContent =

            total

            ? `${Math.round(
                (unethical / total) * 100
              )}% of catalog`

            : "0% of catalog";

    } catch (error) {

        console.log(error);
    }
}

loadDashboard();