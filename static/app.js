const variables = ["x", "y", "z"];
const defaults = {
  2: {a11: 1, a12: 1, b1: 3, a21: 2, a22: -1, b2: 0},
  3: {a11: 1, a12: 2, a13: -1, b1: 2, a21: 2, a22: -1, a23: 1, b2: 3, a31: 2, a32: 2, a33: -1, b3: 3}
};
const savedValues = {};
const $ = id => document.getElementById(id);
let renderedSize;

function currentSize() {
  return Number($("systemSize").value);
}

function saveCurrentValues() {
  const size = renderedSize;
  savedValues[size] = {};
  for (let row = 1; row <= size; row++) {
    for (let column = 1; column <= size; column++) {
      const id = `a${row}${column}`;
      savedValues[size][id] = $(id).value;
    }
    savedValues[size][`b${row}`] = $(`b${row}`).value;
  }
}

function renderEquationRows() {
  const size = currentSize();
  renderedSize = size;
  const values = savedValues[size] || defaults[size];
  $("equationRows").innerHTML = Array.from({length: size}, (_, rowIndex) => {
    const row = rowIndex + 1;
    const equation = variables.slice(0, size).map((variable, columnIndex) => {
      const column = columnIndex + 1;
      const id = `a${row}${column}`;
      const operator = columnIndex ? '<span class="op">+</span>' : "";
      return `${operator}<input aria-label="coeficiente ${variable} ecuación ${row}" id="${id}" value="${values[id]}" type="number" step="any"><b>${variable}</b>`;
    }).join("");
    return `<div class="equation-row"><span class="eq-index">E${row}</span>${equation}<span class="op">=</span><input aria-label="resultado ecuación ${row}" id="b${row}" value="${values[`b${row}`]}" type="number" step="any"></div>`;
  }).join("");
}

$("systemSize").addEventListener("change", () => {
  saveCurrentValues();
  renderEquationRows();
  $("results").classList.add("hidden");
  $("errorMsg").textContent = "";
});

$("exampleBtn").addEventListener("click", () => {
  const size = currentSize();
  savedValues[size] = {...defaults[size]};
  renderEquationRows();
  $("errorMsg").textContent = "";
});

function fmt(number) {
  if (Math.abs(number - Math.round(number)) < 1e-9) return String(Math.round(number));
  return Number(number.toPrecision(7)).toString();
}

function matrixHTML(matrix, replacementColumn = -1, vector = false) {
  const cells = matrix.flatMap((row, rowIndex) => row.map((value, columnIndex) =>
    `<span class="${columnIndex === replacementColumn ? "replaced" : ""}">${fmt(value)}</span>`
  )).join("");
  return `<div class="matrix ${vector ? "vector" : ""}" style="--matrix-size:${matrix[0].length}">${cells}</div>`;
}

function matrixPanel(label, matrix, column = -1) {
  return `<div class="mini-panel"><div class="mini-title">${label}</div>${matrixHTML(matrix, column)}</div>`;
}

function detHTML(label, det, steps, size) {
  const positiveLabel = size === 2 ? "Diagonal principal" : "Descendentes";
  const negativeLabel = size === 2 ? "Diagonal secundaria" : "Ascendentes";
  const positiveSum = steps.positive.reduce((sum, value) => sum + value, 0);
  const negativeSum = steps.negative.reduce((sum, value) => sum + value, 0);
  return `<div class="det-box">
    <div class="det-expression"><span class="positive">${positiveLabel}: (${steps.positive.map(fmt).join(") + (")}) = ${fmt(positiveSum)}</span><br>
    <span class="negative">${negativeLabel}: (${steps.negative.map(fmt).join(") + (")}) = ${fmt(negativeSum)}</span><br>
    Δ = ${fmt(positiveSum)} − (${fmt(negativeSum)})</div>
    <div class="det-answer"><span>${label}</span><strong>${fmt(det)}</strong></div>
  </div>`;
}

function miniDet(label, det, steps, size) {
  const positiveLabel = size === 2 ? "ad" : "↓";
  const negativeLabel = size === 2 ? "bc" : "↑";
  return `<div class="mini-panel"><div class="mini-title">${label}</div>
    <div class="det-expression"><span class="positive">${positiveLabel}: ${steps.positive.map(fmt).join(" + ")}</span><br>
    <span class="negative">${negativeLabel}: ${steps.negative.map(fmt).join(" + ")}</span></div>
    <div class="det-answer"><span>Determinante</span><strong>${fmt(det)}</strong></div></div>`;
}

function matrixReadable(matrix, label) {
  return `<div class="matrix-wrap"><span class="matrix-label">${label}</span>${matrixHTML(matrix)}</div>`;
}

function renderResults(result) {
  const size = result.size;
  const count = result.variables.length;
  $("results").classList.remove("hidden");
  $("detExplanation").textContent = size === 2
    ? "Para una matriz 2×2, calculamos ad − bc."
    : "Aplicamos la regla de Sarrus: suma de diagonales descendentes menos suma de diagonales ascendentes.";
  $("matrixA").innerHTML = `<div class="matrix-line">${matrixReadable(result.A, "A =")}<span class="equals">·</span>${matrixReadable(result.B.map(value => [value]), "B =")}</div>`;
  $("detAsteps").innerHTML = detHTML("Determinante principal Δ", result.detA, result.det_steps, size);
  $("replacementMatrices").innerHTML = result.replacements.map((replacement, column) =>
    matrixPanel(`${replacement.variable === "x" ? "Δx" : `Δ${replacement.variable}`} · reemplazar columna ${replacement.variable}`, replacement.matrix, column)
  ).join("");
  $("subDetSteps").innerHTML = result.replacements.map(replacement =>
    miniDet(`Δ${replacement.variable}`, replacement.det, replacement.steps, size)
  ).join("");
  $("formulas").innerHTML = result.replacements.map(replacement => {
    const value = result.solution_formatted?.[replacement.variable];
    return `<div class="formula-card"><div class="var">${replacement.variable} =</div>
      <div class="fraction"><span>Δ${replacement.variable} = ${fmt(replacement.det)}</span><span>Δ = ${fmt(result.detA)}</span></div>
      <strong>${result.detA === 0 ? "No se puede dividir entre cero" : `${fmt(replacement.det)} / ${fmt(result.detA)}`}</strong>
      ${value !== undefined ? `<div class="formula-value">= ${value}</div>` : ""}</div>`;
  }).join("");

  if (result.unique) {
    const values = result.variables.map(variable =>
      `<div class="solution-value"><span>VALOR DE ${variable.toUpperCase()}</span><strong>${result.solution_formatted[variable]}</strong></div>`
    ).join("");
    $("finalResult").innerHTML = `<div class="final-result"><h3>✦ SOLUCIÓN DEL SISTEMA</h3><div class="solution-values" style="--solution-count:${count}">${values}</div></div>`;
  } else {
    $("finalResult").innerHTML = `<div class="final-result"><p class="no-solution">${result.message}</p></div>`;
  }
}

async function solve() {
  $("errorMsg").textContent = "";
  const size = currentSize();
  const data = {size};
  for (let row = 1; row <= size; row++) {
    for (let column = 1; column <= size; column++) {
      const id = `a${row}${column}`;
      const input = $(id);
      if (input.value.trim() === "" || !Number.isFinite(Number(input.value))) {
        $("errorMsg").textContent = "Completa todos los campos con números válidos.";
        input.focus();
        return;
      }
      data[id] = Number(input.value);
    }
    const id = `b${row}`;
    const input = $(id);
    if (input.value.trim() === "" || !Number.isFinite(Number(input.value))) {
      $("errorMsg").textContent = "Completa todos los campos con números válidos.";
      input.focus();
      return;
    }
    data[id] = Number(input.value);
  }

  $("solveBtn").disabled = true;
  $("solveBtn").querySelector("span").textContent = "Calculando…";
  try {
    const response = await fetch("/resolver", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "No se pudo calcular.");
    renderResults(result);
    $("results").scrollIntoView({behavior: "smooth", block: "start"});
  } catch (error) {
    $("errorMsg").textContent = error.message || "Ocurrió un error al calcular.";
  } finally {
    $("solveBtn").disabled = false;
    $("solveBtn").querySelector("span").textContent = "Calcular y mostrar procedimiento";
  }
}

$("solveBtn").addEventListener("click", solve);
renderEquationRows();
