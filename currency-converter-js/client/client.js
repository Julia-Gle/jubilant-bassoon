function init() {
  loadCurrencies();
}
async function loadCurrencies() {
  try {
    const response = await fetch("/api/symbols");
    if (!response.ok) throw new Error("Failed to load currencies");
    const data = await response.json();

    const fromSelect = document.getElementById("from");
    const toSelect = document.getElementById("to");

    for (let i = 0; i < currencyCodes.length; i++) {
      const code = currencyCodes[i];
      const currency = data[code];

      const optionText = currency.description + " (" + code + ")";
      const option = new Option(optionText, code);

      fromSelect.add(option);
      toSelect.add(option);
    }

    fromSelect.value = "EUR";
    toSelect.value = "PLN";
  } catch (error) {
    console.error("Error loading currencies:", error);
    const currencies = [
      { code: "EUR", name: "Euro" },
      { code: "USD", name: "US Dollar" },
      { code: "GBP", name: "British Pound" },
      { code: "PLN", name: "Polish Złoty" },
      { code: "CHF", name: "Swiss Franc" },
      { code: "JPY", name: "Japanese Yen" },
      { code: "CAD", name: "Canadian Dollar" },
      { code: "AUD", name: "Australian Dollar" },
      { code: "CNY", name: "Chinese Yuan" },
      { code: "HKD", name: "Hong Kong Dollar" },
      { code: "NZD", name: "New Zealand Dollar" },
      { code: "SEK", name: "Swedish Krona" },
      { code: "NOK", name: "Norwegian Krone" },
      { code: "DKK", name: "Danish Krone" },
      { code: "SGD", name: "Singapore Dollar" },
      { code: "KRW", name: "South Korean Won" },
      { code: "TRY", name: "Turkish Lira" },
      { code: "RUB", name: "Russian Ruble" },
      { code: "INR", name: "Indian Rupee" },
      { code: "BRL", name: "Brazilian Real" },
      { code: "ZAR", name: "South African Rand" },
      { code: "MXN", name: "Mexican Peso" },
      { code: "HUF", name: "Hungarian Forint" },
      { code: "CZK", name: "Czech Koruna" },
      { code: "ILS", name: "Israeli Shekel" },
      { code: "THB", name: "Thai Baht" },
      { code: "MYR", name: "Malaysian Ringgit" },
      { code: "PHP", name: "Philippine Peso" },
      { code: "IDR", name: "Indonesian Rupiah" },
      { code: "AED", name: "UAE Dirham" },
      { code: "SAR", name: "Saudi Riyal" },
    ];

    const fromSelect = document.getElementById("from");
    const toSelect = document.getElementById("to");
    currencies.sort((a, b) => a.name.localeCompare(b.name));
    const prioCurrencies = ["EUR", "USD", "PLN"];
    const sortedCurrencies = [
      ...currencies.filter((c) => prioCurrencies.includes(c.code)),
      ...currencies.filter((c) => !prioCurrencies.includes(c.code)),
    ];
    sortedCurrencies.forEach((currency) => {
      const option = new Option(
        `${currency.name} (${currency.code})`,
        currency.code
      );
      fromSelect.add(option.cloneNode(true));
      toSelect.add(option);
    });
  }
}
function switchCurrency() {
  const fromSelect = document.getElementById("from");
  const toSelect = document.getElementById("to");

  const currentFrom = fromSelect.value;
  const currentTo = toSelect.value;
  fromSelect.value = currentTo;
  toSelect.value = currentFrom;
  if (document.getElementById("amount").value) {
    convertCurrency();
  }
}
function convertCurrency() {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;
  const amount = document.getElementById("amount").value;
  if (!from || !to || !amount) {
    alert("Fill in all Fields");
    return;
  }


  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status === 200) {
      try {
        const result = JSON.parse(xhr.responseText);
        displayResult(result);
      } catch (err) {
        console.error("Error parsing response:", err);
        alert("Error processing conversion result");
      }
    } else {
      try {
        const error = JSON.parse(xhr.responseText);
        alert(`Error: ${error.error}`);
      } catch {
        alert("Error converting currency");
      }
    }
  };

  xhr.open("GET", `/api/convert?from=${from}&to=${to}&amount=${amount}`);
  xhr.send();
}

function displayResult(result) {
  document.getElementById("resultFrom").textContent = result.from;
  document.getElementById("resultTo").textContent = result.to;
  document.getElementById("resultAmount").textContent =
    result.amount + " " + result.from;
  document.getElementById("resultRate").textContent = result.rate;
  document.getElementById("resultValue").textContent =
    result.result.toFixed(2) + " " + result.to;
  document.getElementById("resultCard").classList.remove("d-none");
}

function renderCurrenciesTable(currencies) {
  const container = document.getElementById("currenciesTable");
  container.replaceChildren();
  container.classList.remove("d-none");

  const table = document.createElement("table");
  table.className = "table table-striped table-bordered";

  const thead = document.createElement("thead");
  thead.innerHTML = `
        <tr>
            <th>Code</th>
            <th>Currency Name</th>
        </tr>
    `;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const [code, currency] of Object.entries(currencies)) {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${code}</td>
            <td>${currency.description}</td>
        `;
    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  container.appendChild(table);
}

document.getElementById("convertForm").addEventListener("submit", function (e) {
  e.preventDefault();
  convertCurrency();
});
