const ids = ["a11","a12","a13","a21","a22","a23","a31","a32","a33","b1","b2","b3"];
const $ = id => document.getElementById(id);
$("exampleBtn").addEventListener("click", () => {
  const example = {a11:1,a12:2,a13:-1,b1:2,a21:2,a22:-1,a23:1,b2:3,a31:2,a32:2,a33:-1,b3:3};
  Object.entries(example).forEach(([id,val]) => $(id).value = val);
  $("errorMsg").textContent = "";
});
$("solveBtn").addEventListener("click", solve);
function fmt(n) {
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  return Number(n.toPrecision(7)).toString();
}
function matrixHTML(m, replacementColumn=-1, vector=false) {
  const cells = m.flatMap((row,r)=>row.map((v,c)=>`<span class="${c===replacementColumn?'replaced':''}">${fmt(v)}</span>`)).join("");
  return `<div class="matrix ${vector?'vector':''}">${cells}</div>`;
}
function matrixPanel(label,m,col=-1) {
  return `<div class="mini-panel"><div class="mini-title">${label}</div>${matrixHTML(m,col)}</div>`;
}
function detHTML(label, det, steps) {
  const p = steps.positive.map(fmt), n = steps.negative.map(fmt);
  const posSum = steps.positive.reduce((a,b)=>a+b,0);
  const negSum = steps.negative.reduce((a,b)=>a+b,0);
  return `<div class="det-box">
    <div class="det-expression"><span class="positive">Descendentes: (${p.join(") + (")}) = ${fmt(posSum)}</span><br>
    <span class="negative">Ascendentes: (${n.join(") + (")}) = ${fmt(negSum)}</span><br>
    Δ = ${fmt(posSum)} − (${fmt(negSum)})</div>
    <div class="det-answer"><span>${label}</span><strong>${fmt(det)}</strong></div>
  </div>`;
}
function miniDet(label,det,steps) {
  return `<div class="mini-panel"><div class="mini-title">${label}</div>
    <div class="det-expression"><span class="positive">↓ ${steps.positive.map(fmt).join(" + ")}</span><br>
    <span class="negative">↑ ${steps.negative.map(fmt).join(" + ")}</span></div>
    <div class="det-answer"><span>Determinante</span><strong>${fmt(det)}</strong></div></div>`;
}
function matrixReadable(m,label) {
 return `<div class="matrix-wrap"><span class="matrix-label">${label}</span>${matrixHTML(m)} </div>`;
}
async function solve() {
  $("errorMsg").textContent = "";
  const data = {};
  for (const id of ids) {
    const v = $(id).value.trim();
    if (v === "" || !Number.isFinite(Number(v))) {
      $("errorMsg").textContent = "Completa todos los campos con números válidos.";
      $(id).focus(); return;
    }
    data[id] = Number(v);
  }
  $("solveBtn").disabled = true;
  $("solveBtn").querySelector("span").textContent = "Calculando…";
  try {
    const response = await fetch("/resolver", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
    const r = await response.json();
    if (!response.ok) throw new Error(r.error || "No se pudo calcular.");
    $("results").classList.remove("hidden");
    $("matrixA").innerHTML = `<div class="matrix-line">${matrixReadable(r.A,"A =") }<span class="equals">·</span>${matrixReadable([[r.B[0]],[r.B[1]],[r.B[2]]],"B =")}</div>`;
    $("detAsteps").innerHTML = detHTML("Determinante principal Δ",r.detA,r.det_steps.A);
    $("replacementMatrices").innerHTML =
      matrixPanel("Δx · reemplazar columna x",r.Ax,0)+
      matrixPanel("Δy · reemplazar columna y",r.Ay,1)+
      matrixPanel("Δz · reemplazar columna z",r.Az,2);
    $("subDetSteps").innerHTML =
      miniDet("Δx",r.detX,r.det_steps.Ax)+
      miniDet("Δy",r.detY,r.det_steps.Ay)+
      miniDet("Δz",r.detZ,r.det_steps.Az);
    $("formulas").innerHTML = [
      ["x","Δx",r.detX,r.detA,r.solution_formatted?.x],
      ["y","Δy",r.detY,r.detA,r.solution_formatted?.y],
      ["z","Δz",r.detZ,r.detA,r.solution_formatted?.z]
    ].map(([v,n,num,den,val])=>`<div class="formula-card"><div class="var">${v} =</div><div class="fraction"><span>${n} = ${fmt(num)}</span><span>Δ = ${fmt(den)}</span></div><strong>${den===0?"No se puede dividir entre cero":`${fmt(num)} / ${fmt(den)}`}</strong>${val!==undefined?`<div style="margin-top:10px;color:var(--mint);font:600 17px 'DM Mono',monospace">= ${val}</div>`:""}</div>`).join("");
    if (r.unique) {
      $("finalResult").innerHTML = `<div class="final-result"><h3>✦ SOLUCIÓN DEL SISTEMA</h3><div class="solution-values">
        <div class="solution-value"><span>VALOR DE X</span><strong>${r.solution_formatted.x}</strong></div>
        <div class="solution-value"><span>VALOR DE Y</span><strong>${r.solution_formatted.y}</strong></div>
        <div class="solution-value"><span>VALOR DE Z</span><strong>${r.solution_formatted.z}</strong></div>
        </div></div>`;
    } else {
      $("finalResult").innerHTML = `<div class="final-result"><p class="no-solution">${r.message}</p></div>`;
    }
    $("results").scrollIntoView({behavior:"smooth",block:"start"});
  } catch (e) {
    $("errorMsg").textContent = e.message || "Ocurrió un error al calcular.";
  } finally {
    $("solveBtn").disabled = false;
    $("solveBtn").querySelector("span").textContent = "Calcular y mostrar procedimiento";
  }
}
solve();
