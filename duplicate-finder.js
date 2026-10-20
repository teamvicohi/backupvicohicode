let fullData=[];
let viewData=[];

let page=1;
let limit=50;

let currentMode=null;

let activeColumn=null;
let columnMode=null;

let previewDataStore=[];
let previewPage=1;
let previewLimit=20;

function norm(v){
return String(v || "").toLowerCase().trim();
}

function showStatus(msg){

let box=document.getElementById("statusMessage");

box.style.display="block";
box.innerText=msg;

setTimeout(()=>{
box.style.display="none";
},3000);

}

function updateLoader(percent,fileName){

document.getElementById("loader").style.display="block";
document.getElementById("loadingPercent").innerText=percent+"%";
document.getElementById("progressFill").style.width=percent+"%";
document.getElementById("loadingFileName").innerText="📁 "+fileName;

}

function hideLoader(){
document.getElementById("loader").style.display="none";
}

function getDuplicateMap(data,col=null){

let map={};

data.forEach(row=>{

if(col){

let val=norm(row[col]);

if(val!==""){
map[val]=(map[val]||0)+1;
}

}
else{

Object.values(row).forEach(v=>{

let val=norm(v);

if(val!==""){
map[val]=(map[val]||0)+1;
}

});

}

});

return map;

}

function updateButtonUI(){

document.querySelectorAll(".mode-btn").forEach(btn=>{
btn.classList.remove("active");
});

if(currentMode==="dup"){
document.getElementById("dupBtn").classList.add("active");
}

if(currentMode==="unique"){
document.getElementById("uniqueBtn").classList.add("active");
}

if(currentMode==="all"){
document.getElementById("allBtn").classList.add("active");
}

}

function resetDashboard(){

page=1;

activeColumn=null;
columnMode=null;
currentMode=null;

document.getElementById("previewContainer").style.display="none";
document.getElementById("mainTableSection").style.display="block";

updateButtonUI();

}

document.getElementById("fileInput").addEventListener("change",e=>{

let file=e.target.files[0];

if(file){

document.getElementById("fileInfo").style.display="block";

document.getElementById("fileInfo").innerHTML=
"📁 Current File: <b>"+file.name+"</b>";

}

});

const dropZone=document.getElementById("dropZone");

dropZone.addEventListener("dragover",e=>{
e.preventDefault();
dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave",()=>{
dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop",e=>{

e.preventDefault();

dropZone.classList.remove("dragover");

let file=e.dataTransfer.files[0];

document.getElementById("fileInput").files=e.dataTransfer.files;

if(file){

document.getElementById("fileInfo").style.display="block";

document.getElementById("fileInfo").innerHTML=
"📁 Current File: <b>"+file.name+"</b>";

}

});

function loadData(){

fullData=[];

let file=document.getElementById("fileInput").files[0];

if(!file){
return alert("Please upload a CSV or Excel file.");
}

resetDashboard();

let name=file.name.toLowerCase();
let sizeMB=file.size/(1024*1024);

if(name.endsWith(".csv")){

if(sizeMB>400){
return alert("CSV file size exceeded.\nMaximum CSV limit is 400MB.");
}

}
else if(name.endsWith(".xlsx") || name.endsWith(".xls")){

if(sizeMB>50){
return alert("Excel file size exceeded.\nMaximum Excel limit is 50MB.");
}

}
else{
return alert("Unsupported file type.\nOnly CSV/XLSX/XLS files are allowed.");
}

updateLoader(10,file.name);

if(name.endsWith(".csv")){

Papa.parse(file,{

header:true,
skipEmptyLines:true,
worker:true,

step:function(results){

if(results.data){
fullData.push(results.data);
}

},

complete:function(){

updateLoader(100,file.name);

setTimeout(()=>{

viewData=[...fullData];

init();

hideLoader();

},500);

}

});

}
else{

let reader=new FileReader();

reader.onprogress=e=>{

if(e.lengthComputable){
let percent=Math.round((e.loaded/e.total)*100);
updateLoader(percent,file.name);
}

};

reader.onload=e=>{

let wb=XLSX.read(new Uint8Array(e.target.result),{
type:"array"
});

let ws=wb.Sheets[wb.SheetNames[0]];

fullData=XLSX.utils.sheet_to_json(ws,{defval:""});

viewData=[...fullData];

init();

hideLoader();

};

reader.readAsArrayBuffer(file);

}

}

function init(){

page=1;

updateStats(viewData);

render();

}

/* UPDATED */
function updateStats(data=viewData){

let cols=Object.keys(data[0]||{});

let duplicateRowCount=0;
let duplicateColumnCount=0;

let map=getDuplicateMap(data);

data.forEach(row=>{

let hasDup=Object.values(row).some(v=>map[norm(v)]>1);

if(hasDup){
duplicateRowCount++;
}

});

cols.forEach(c=>{

let temp={};
let hasDup=false;

data.forEach(r=>{

let v=norm(r[c]);

if(v!==""){

temp[v]=(temp[v]||0)+1;

if(temp[v]>1){
hasDup=true;
}

}

});

if(hasDup){
duplicateColumnCount++;
}

});

let accuracy=0;

if(data.length>0){
accuracy=((duplicateRowCount/data.length)*100).toFixed(1);
}

document.getElementById("totalRows").innerText=data.length;
document.getElementById("totalColumns").innerText=cols.length;
document.getElementById("duplicateRows").innerText=duplicateRowCount;
document.getElementById("duplicateColumns").innerText=duplicateColumnCount;
document.getElementById("duplicateAccuracy").innerText=accuracy+"%";

}

function toggleMode(mode){

activeColumn=null;
columnMode=null;

if(currentMode===mode){

currentMode=null;
viewData=[...fullData];
page=1;

updateButtonUI();
updateStats(viewData);
render();

showStatus("Filter removed");

return;

}

currentMode=mode;

let map=getDuplicateMap(fullData);

if(mode==="dup"){

viewData=fullData.filter(row=>
Object.values(row).some(v=>map[norm(v)]>1)
);

showStatus("Duplicate rows selected");

}

else if(mode==="unique"){

viewData=fullData.filter(row=>
Object.values(row).every(v=>map[norm(v)]===1 || norm(v)==="")
);

showStatus("Unique rows selected");

}

else{

viewData=[...fullData];

showStatus("All rows selected");

}

page=1;

updateButtonUI();
updateStats(viewData);
render();

}

function toggleColumnDuplicate(col,btn){

if(activeColumn===col && columnMode==="dup"){

activeColumn=null;
columnMode=null;

viewData=[...fullData];

document.querySelectorAll(".col-btn").forEach(b=>{
b.classList.remove("active","dup-active","unique-active");
});

updateStats(viewData);
render();

showStatus("Duplicate filter removed");

return;

}

let map=getDuplicateMap(fullData,col);

let duplicateRows=fullData.filter(r=>{

let val=norm(r[col]);

return val!=="" && map[val]>1;

});

if(duplicateRows.length===0){
showStatus("No duplicate rows found");
return;
}

activeColumn=col;
columnMode="dup";

viewData=duplicateRows;

page=1;

updateStats(viewData);
render();

showStatus("Duplicate filter applied on column: "+col);

scrollToActiveButton();

}

function toggleColumnUnique(col,btn){

if(activeColumn===col && columnMode==="unique"){

activeColumn=null;
columnMode=null;

viewData=[...fullData];

document.querySelectorAll(".col-btn").forEach(b=>{
b.classList.remove("active","dup-active","unique-active");
});

updateStats(viewData);
render();

showStatus("Unique filter removed");

return;

}

let map=getDuplicateMap(fullData,col);

let uniqueRows=fullData.filter(r=>{

let val=norm(r[col]);

return val!=="" && map[val]===1;

});

if(uniqueRows.length===0){
showStatus("No unique rows found");
return;
}

activeColumn=col;
columnMode="unique";

viewData=uniqueRows;

page=1;

updateStats(viewData);
render();

showStatus("Unique filter applied on column: "+col);

scrollToActiveButton();

}

function scrollToActiveButton(){

setTimeout(()=>{

let active=document.querySelector(".col-btn.active");

if(active){
active.scrollIntoView({
behavior:"smooth",
inline:"center",
block:"nearest"
});
}

},100);

}

function copyColumnData(col){

let values=viewData.map(r=>r[col]);

navigator.clipboard.writeText(values.join("\n"));

showStatus(col+" copied successfully");

}

function manualSearch(){

let val=norm(document.getElementById("searchInput").value);

if(!val){

viewData=[...fullData];
page=1;

updateStats(viewData);
render();

showStatus("Search cleared");

return;

}

viewData=fullData.filter(r=>
Object.values(r).some(v=>norm(v).includes(val))
);

page=1;

updateStats(viewData);
render();

showStatus("Search applied");

}

function render(){

let start=(page-1)*limit;
let end=start+limit;

let rows=viewData.slice(start,end);

let cols=Object.keys(fullData[0]||{});

let colMap={};

viewData.forEach(row=>{

cols.forEach(c=>{

let v=norm(row[c]);

if(v!==""){

if(!colMap[c]){
colMap[c]={};
}

colMap[c][v]=(colMap[c][v]||0)+1;

}

});

});

let html="<div class='table-box'><table><tr>";

cols.forEach(c=>{

let dupCount=0;
let uniqueCount=0;

Object.values(colMap[c]||{}).forEach(v=>{

if(v>1) dupCount++;
if(v===1) uniqueCount++;

});

let dupActive=activeColumn===c && columnMode==="dup";
let uniqueActive=activeColumn===c && columnMode==="unique";

html+=`
<th class="${activeColumn===c?'active-column':''}">
<div class="col-box">

<div class="col-title">${c}</div>

<button class="col-btn ${dupActive?'active dup-active':''}"
onclick="toggleColumnDuplicate('${c.replace(/'/g,"\\'")}')">
${dupActive?'✅ DUPLICATE SELECTED':'🔁 Duplicates'} (${dupCount})
</button>

<button class="col-btn ${uniqueActive?'active unique-active':''}"
onclick="toggleColumnUnique('${c.replace(/'/g,"\\'")}')">
${uniqueActive?'✅ UNIQUE SELECTED':'✨ Unique'} (${uniqueCount})
</button>

<button class="col-btn"
onclick="copyColumnData('${c.replace(/'/g,"\\'")}')">
📋 Copy
</button>

</div>
</th>
`;

});

html+="</tr>";

rows.forEach(r=>{

html+="<tr>";

cols.forEach(c=>{

let v=norm(r[c]);

let isDup=colMap[c] && colMap[c][v]>1;

let highlight=false;

if(activeColumn===c){

if(columnMode==="dup" && isDup) highlight=true;
if(columnMode==="unique" && colMap[c][v]===1) highlight=true;

}

html+=`
<td class="${isDup?'dup-cell':''} ${highlight?'highlight-cell':''}">
${r[c]}
</td>
`;

});

html+="</tr>";

});

html+="</table></div>";

document.getElementById("tableContainer").innerHTML=html;

let total=viewData.length;

let from=total===0?0:start+1;
let to=Math.min(end,total);

document.getElementById("pageInfo").innerText=
`${from}–${to} of ${total}`;

}

/* ================= FIX: DOWNLOAD NOW MATCHES PREVIEW ================= */

function getDownloadData(){
let type=document.getElementById("dataType").value;

let map=getDuplicateMap(fullData);

if(type==="dup"){
return fullData.filter(r=>Object.values(r).some(v=>map[norm(v)]>1));
}

if(type==="unique"){
return fullData.filter(r=>Object.values(r).every(v=>map[norm(v)]===1 || norm(v)===""));
}

return fullData;
}

function previewDownloadData(){
previewDataStore=getDownloadData();
previewPage=1;

document.getElementById("mainTableSection").style.display="none";

renderPreviewTable();
}

/* FIXED: now download uses SAME preview data if preview is active */
function downloadData(){

let data;

if(previewDataStore && previewDataStore.length>0){
data=[...previewDataStore];
}
else{
data=[...viewData];
}

if(data.length===0){
showStatus("No data available");
return;
}

let format=document.getElementById("formatType").value;
let customName=document.getElementById("fileNameInput").value.trim();
let fileName=customName || "Vicohi";

if(format==="csv"){

let csv=Papa.unparse(data);

let blob=new Blob([csv],{
type:"text/csv;charset=utf-8;"
});

let a=document.createElement("a");
a.href=URL.createObjectURL(blob);
a.download=fileName+".csv";

document.body.appendChild(a);
a.click();
document.body.removeChild(a);

URL.revokeObjectURL(a.href);

}
else{

let ws=XLSX.utils.json_to_sheet(data);
let wb=XLSX.utils.book_new();

XLSX.utils.book_append_sheet(wb,ws,"Data");
XLSX.writeFile(wb,fileName+".xlsx");

}

showStatus("Download Started");
}

/* PREVIEW FUNCTIONS (UNCHANGED LOGIC) */

function renderPreviewTable(searchText=""){

let preview=document.getElementById("previewContainer");

let data=[...previewDataStore];

if(searchText){
data=data.filter(r=>
Object.values(r).some(v=>norm(v).includes(norm(searchText)))
);
}

if(data.length===0){
preview.style.display="block";
preview.innerHTML="<h2>No Data Found</h2>";
return;
}

let cols=Object.keys(data[0]);

let totalPages=Math.ceil(data.length/previewLimit);

let start=(previewPage-1)*previewLimit;
let end=start+previewLimit;

let rows=data.slice(start,end);

let type=document.getElementById("dataType").value;

let typeText="All Data";
if(type==="dup") typeText="Duplicate Data";
if(type==="unique") typeText="Unique Data";

let html=`
<div class="preview-header">
<h2>👁️ DOWNLOAD PREVIEW</h2>
<p>Currently Showing: <b>${typeText}</b></p>
</div>

<div class="preview-search">
<input type="text" id="previewSearchInput" placeholder="🔍 Search Preview Data">
<button onclick="searchPreviewData()">🔎 Search</button>
<button onclick="closePreview()">❌ Close Preview</button>
<button onclick="copyPreviewData()">📋 Copy Preview</button>
</div>

<div class="table-box"><table><tr>
`;

cols.forEach(c=>{
html+=`<th class="preview-th">${c}</th>`;
});

html+="</tr>";

rows.forEach(r=>{
html+="<tr>";
cols.forEach(c=>{
html+=`<td>${r[c]}</td>`;
});
html+="</tr>";
});

html+=`
</table></div>

<div class="preview-pagination">
<button onclick="previewPrevPage()">⬅ Prev</button>
<span>${start+1}–${Math.min(end,data.length)} of ${data.length}</span>
<button onclick="previewNextPage()">Next ➡</button>

<div class="page-box">
<input type="number" id="previewPageInput" placeholder="Page">
<button onclick="previewGoPage()">Go</button>
</div>
</div>
`;

preview.style.display="block";
preview.innerHTML=html;

}

function closePreview(){
document.getElementById("previewContainer").style.display="none";
document.getElementById("mainTableSection").style.display="block";
}

function searchPreviewData(){
previewPage=1;
let val=document.getElementById("previewSearchInput").value;
renderPreviewTable(val);
}

function previewNextPage(){
let total=Math.ceil(previewDataStore.length/previewLimit);
if(previewPage<total){
previewPage++;
renderPreviewTable(document.getElementById("previewSearchInput")?.value || "");
}
}

function previewPrevPage(){
if(previewPage>1){
previewPage--;
renderPreviewTable(document.getElementById("previewSearchInput")?.value || "");
}
}

function previewGoPage(){
let p=parseInt(document.getElementById("previewPageInput").value);
let total=Math.ceil(previewDataStore.length/previewLimit);
if(p>=1 && p<=total){
previewPage=p;
renderPreviewTable(document.getElementById("previewSearchInput")?.value || "");
}
}

function copyPreviewData(){

if(previewDataStore.length===0){
showStatus("No preview data available");
return;
}

let cols=Object.keys(previewDataStore[0]);
let text=cols.join("\t")+"\n";

previewDataStore.forEach(r=>{
text+=cols.map(c=>r[c]).join("\t")+"\n";
});

navigator.clipboard.writeText(text);
showStatus("Preview copied successfully");

}

function copyVisibleData(){

if(viewData.length===0){
showStatus("No data to copy");
return;
}

let cols=Object.keys(viewData[0]);
let text=cols.join("\t")+"\n";

viewData.forEach(r=>{
text+=cols.map(c=>r[c]).join("\t")+"\n";
});

navigator.clipboard.writeText(text);
showStatus("Current table copied");

}

function nextPage(){
let total=Math.ceil(viewData.length/limit);
if(page<total){ page++; render(); }
}

function prevPage(){
if(page>1){ page--; render(); }
}

function goToPage(){
let p=parseInt(document.getElementById("pageInput").value);
let total=Math.ceil(viewData.length/limit);
if(p>=1 && p<=total){ page=p; render(); }
}