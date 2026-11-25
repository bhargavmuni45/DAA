const sampleProducts = [
  {name:"Wireless scanner", weight:4, value:9},
  {name:"Packing cartons", weight:6, value:12},
  {name:"Barcode printer", weight:5, value:10},
  {name:"Safety equipment", weight:3, value:7},
  {name:"Spare batteries", weight:2, value:4},
  {name:"Label rolls", weight:4, value:6}
];

const algorithms = {
  brute:{name:"Brute force",kicker:"APPROACH 01 / EXHAUSTIVE SEARCH",description:"Try every possible combination of products, calculate its total weight and value, and keep the best valid combination.",steps:["Generate every possible include-or-exclude combination.","Calculate the total weight and value for each combination.","Ignore combinations that exceed warehouse capacity.","Keep the valid combination with the highest total value."],time:"O(2ⁿ)",space:"O(n)"},
  greedy:{name:"Greedy",kicker:"APPROACH 02 / LOCAL BEST CHOICE",description:"Rank products by value per unit of weight, then add the best-ranked products while they still fit. It is fast, but it is not guaranteed to find the global optimum.",steps:["Calculate each product's value-to-weight ratio.","Sort products from highest ratio to lowest.","Add each product if it fits in the remaining capacity.","Return the selected set and its total value."],time:"O(n log n)",space:"O(n)"},
  dp:{name:"Dynamic programming",kicker:"APPROACH 03 / REUSE SUBPROBLEMS",description:"Build a table of the best value achievable for each product prefix and each capacity. The table reuses earlier results to guarantee an optimal answer.",steps:["Create a DP table for products and capacities.","For each product, compare skipping it with taking it.","Store the better value for each capacity.","Trace back through the table to identify selected products."],time:"O(nW)",space:"O(nW)"},
  backtracking:{name:"Backtracking",kicker:"APPROACH 04 / SEARCH WITH PRUNING",description:"Explore decisions to include or exclude each product. Stop exploring a branch as soon as its weight exceeds the capacity.",steps:["Start with no products selected.","At each product, explore the include and exclude choices.","Prune a branch immediately if its weight exceeds capacity.","Track the best valid selection found across the search."],time:"O(2ⁿ) worst case",space:"O(n)"}
};
let products = sampleProducts.map(p=>({...p}));
let results = {};
let activeAlgorithm = "brute";

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function renderProducts(){
  $("productRows").innerHTML = products.map((p,i)=>`<tr>
    <td><input class="product-name" aria-label="Product ${i+1} name" data-index="${i}" data-field="name" value="${esc(p.name)}"></td>
    <td><input type="number" min="1" step="1" aria-label="Product ${i+1} weight" data-index="${i}" data-field="weight" value="${p.weight}"></td>
    <td><input type="number" min="0" step="1" aria-label="Product ${i+1} value" data-index="${i}" data-field="value" value="${p.value}"></td>
    <td><button class="remove-row" data-remove="${i}" aria-label="Remove ${esc(p.name)}" type="button">×</button></td>
  </tr>`).join("");
}
$("productRows").addEventListener("change",e=>{
  const field=e.target.dataset.field;if(!field)return;
  const i=Number(e.target.dataset.index);products[i][field]=field==="name"?e.target.value:Number(e.target.value);
});
$("productRows").addEventListener("click",e=>{
  const i=e.target.dataset.remove;if(i===undefined)return;
  products.splice(Number(i),1);renderProducts();clearResults();
});
$("addProduct").addEventListener("click",()=>{
  if(products.length>=20){message("For this demo, use no more than 20 products.");return;}
  products.push({name:`New product ${products.length+1}`,weight:1,value:1});renderProducts();clearResults();
});
$("loadSample").addEventListener("click",()=>{products=sampleProducts.map(p=>({...p}));$("capacity").value=15;renderProducts();clearResults();message("Sample dataset loaded.","success");});

function message(text,type=""){const el=$("validationMessage");el.textContent=text;el.className=`validation ${type}`;}
function clearResults(){results={};renderComparison();renderAlgorithm();$("insightTitle").textContent="No single approach wins every trade-off.";$("insightText").textContent="Run the four approaches on the same dataset to compare their outputs."}
function validate(){
  const capacity=Number($("capacity").value);
  if(!Number.isInteger(capacity)||capacity<1||capacity>10000)return "Capacity must be a whole number between 1 and 10,000.";
  if(products.length<1)return "Add at least one product.";
  if(products.length>20)return "Use no more than 20 products for this interactive demo.";
  const names=new Set();
  for(let i=0;i<products.length;i++){
    const p=products[i];
    if(!p.name||!p.name.trim())return `Enter a name for product ${i+1}.`;
    if(names.has(p.name.trim().toLowerCase()))return `Product names must be unique. "${p.name}" appears more than once.`;
    names.add(p.name.trim().toLowerCase());
    if(!Number.isInteger(Number(p.weight))||p.weight<=0)return `Weight for "${p.name}" must be a positive whole number.`;
    if(!Number.isInteger(Number(p.value))||p.value<0)return `Value for "${p.name}" must be a non-negative whole number.`;
  }
  return "";
}
function summarize(indices,elapsed){
  const weight=indices.reduce((s,i)=>s+products[i].weight,0);
  const value=indices.reduce((s,i)=>s+products[i].value,0);
  return {indices,weight,value,elapsed};
}
function runBrute(cap){
  let best={indices:[],weight:0,value:0};const n=products.length;
  for(let mask=0;mask<(1<<n);mask++){
    let weight=0,value=0,indices=[];
    for(let i=0;i<n;i++)if(mask&(1<<i)){weight+=products[i].weight;value+=products[i].value;indices.push(i);}
    if(weight<=cap&&value>best.value)best={indices,weight,value};
  }return best;
}
function runGreedy(cap){
  const order=products.map((p,i)=>({i,ratio:p.value/p.weight})).sort((a,b)=>b.ratio-a.ratio||a.i-b.i);
  let weight=0,indices=[];
  for(const item of order){const p=products[item.i];if(weight+p.weight<=cap){weight+=p.weight;indices.push(item.i);}}
  return summarize(indices,0);
}
function runDP(cap){
  const n=products.length,dp=Array.from({length:n+1},()=>new Array(cap+1).fill(0));
  for(let i=1;i<=n;i++){const p=products[i-1];for(let w=0;w<=cap;w++){dp[i][w]=dp[i-1][w];if(p.weight<=w)dp[i][w]=Math.max(dp[i][w],dp[i-1][w-p.weight]+p.value);}}
  let w=cap,indices=[];
  for(let i=n;i>0;i--){if(dp[i][w]!==dp[i-1][w]){indices.push(i-1);w-=products[i-1].weight;}}
  indices.reverse();return summarize(indices,0);
}
function runBacktracking(cap){
  let best={indices:[],weight:0,value:0},chosen=[];
  const suffixValue=new Array(products.length+1).fill(0);
  for(let i=products.length-1;i>=0;i--)suffixValue[i]=suffixValue[i+1]+products[i].value;
  function search(i,weight,value){
    if(weight>cap)return;
    if(value+suffixValue[i]<best.value)return;
    if(i===products.length){if(value>best.value)best={indices:[...chosen],weight,value};return;}
    chosen.push(i);search(i+1,weight+products[i].weight,value+products[i].value);chosen.pop();
    search(i+1,weight,value);
  }
  search(0,0,0);return best;
}
function runAll(){
  const error=validate();if(error){message(error);return;}
  const cap=Number($("capacity").value);
  const runners={brute:runBrute,greedy:runGreedy,dp:runDP,backtracking:runBacktracking};
  results={};
  for(const [key,fn] of Object.entries(runners)){
    const start=performance.now();const answer=fn(cap);const elapsed=performance.now()-start;
    results[key]={...answer,elapsed};
  }
  renderComparison();renderAlgorithm();updateInsight();
  const optimal=results.dp.value;
  message(`Completed. Optimal inventory value: ${optimal}. Compare the four approaches below.`,"success");
  $("comparison").scrollIntoView({behavior:"smooth",block:"start"});
}
function renderAlgorithm(){
  const a=algorithms[activeAlgorithm],r=results[activeAlgorithm];
  $("algoKicker").textContent=a.kicker;$("algoTitle").textContent=a.name;$("algoDescription").textContent=a.description;
  $("algoSteps").innerHTML=a.steps.map(s=>`<li>${s}</li>`).join("");
  $("timeComplexity").textContent=a.time;$("spaceComplexity").textContent=a.space;
  if(!r){$("resultStatus").textContent="RUN TO CALCULATE";$("resultValue").textContent="—";$("resultWeight").textContent="—";$("resultCount").textContent="—";$("resultTime").textContent="—";$("selectedProducts").textContent="Run the algorithms to see the allocation.";return;}
  $("resultStatus").textContent=r.value===results.dp.value?"OPTIMAL VALUE":"HEURISTIC RESULT";
  $("resultValue").textContent=r.value;$("resultWeight").textContent=`${r.weight} / ${$("capacity").value} units`;$("resultCount").textContent=r.indices.length;
  $("resultTime").textContent=`${r.elapsed.toFixed(3)} ms`;
  $("selectedProducts").textContent=r.indices.length?r.indices.map(i=>products[i].name).join(", "):"No products selected.";
}
function renderComparison(){
  const names={brute:"Brute force",greedy:"Greedy",dp:"Dynamic programming",backtracking:"Backtracking"};
  const keys=["brute","greedy","dp","backtracking"];
  $("comparisonRows").innerHTML=keys.some(k=>results[k])?keys.map(k=>{
    const r=results[k];if(!r)return `<tr><td>${names[k]}</td><td colspan="4">Not run</td></tr>`;
    const optimal=r.value===results.dp.value;
    return `<tr><td>${names[k]}</td><td>${r.value}</td><td>${r.weight}</td><td>${r.elapsed.toFixed(3)} ms</td><td><span class="pill ${optimal?"yes":"no"}">${optimal?"Yes":"No"}</span></td></tr>`;
  }).join(""):`<tr><td colspan="5" class="empty-row">Run all algorithms to populate the comparison.</td></tr>`;
}
function updateInsight(){
  const g=results.greedy,optimal=results.dp.value;
  if(g.value===optimal){$("insightTitle").textContent="Greedy matched the optimal value this time.";$("insightText").textContent="This input happens to suit the value-per-weight heuristic. Greedy is not guaranteed to match the optimum for every dataset.";}
  else{$("insightTitle").textContent="Greedy traded optimality for speed.";$("insightText").textContent=`Greedy found value ${g.value}, while the optimal value is ${optimal}. This illustrates why a fast local choice can miss a better overall combination.`;}
}
document.querySelectorAll(".algorithm-tab").forEach(btn=>btn.addEventListener("click",()=>{
  activeAlgorithm=btn.dataset.algo;document.querySelectorAll(".algorithm-tab").forEach(b=>{const selected=b===btn;b.classList.toggle("selected",selected);b.setAttribute("aria-selected",String(selected));});renderAlgorithm();
}));
$("runAll").addEventListener("click",runAll);

const themeSelect=$("themeSelect"),root=document.documentElement;
function systemTheme(){return window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}
function applyTheme(choice){const theme=choice==="system"?systemTheme():choice;root.dataset.theme=theme;themeSelect.value=choice;}
themeSelect.addEventListener("change",()=>{localStorage.setItem("stockroom-theme",themeSelect.value);applyTheme(themeSelect.value);});
const savedTheme=localStorage.getItem("stockroom-theme")||"system";applyTheme(savedTheme);
if(window.matchMedia){window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{if(themeSelect.value==="system")applyTheme("system");});}
$("menuToggle").addEventListener("click",()=>$("menuToggle").parentElement.classList.toggle("menu-open"));
document.querySelectorAll(".nav-link").forEach(link=>link.addEventListener("click",()=>{$("menuToggle").parentElement.classList.remove("menu-open");document.querySelectorAll(".nav-link").forEach(l=>l.classList.remove("active"));link.classList.add("active");}));
renderProducts();renderAlgorithm();
