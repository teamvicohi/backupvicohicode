let headers=[];
let all=[], matched=[], notMatched=[];
let filteredData=[];

let mode="all";
let page=1;
let limit=50;

let selectedCols=new Set();

const rowStore=new Map();
const searchIndex=new Map();

let analysisMessage="";
let uploadedFileName="data";

function showToast(message,color="#059669"){

const toast=document.createElement("div");

toast.className="toast";

toast.style.background=color;

toast.innerText=message;

document.body.appendChild(toast);

setTimeout(()=>{
toast.style.opacity="0";
toast.style.transform="translateY(-10px)";
toast.style.transition="0.3s";
},2200);

setTimeout(()=>{
toast.remove();
},2600);

}

function clearOldData(){

headers=[];
all=[];
matched=[];
notMatched=[];
filteredData=[];

page=1;

rowStore.clear();
searchIndex.clear();

document.getElementById("table").innerHTML="";
document.getElementById("pageInfo").innerText="";

document.getElementById("rawCount").innerText="0";
document.getElementById("matchedCount").innerText="0";
document.getElementById("notMatchedCount").innerText="0";
document.getElementById("totalRows").innerText="0";
document.getElementById("totalColumns").innerText="0";

selectedCols.clear();

document.getElementById("colList").innerHTML="";
document.getElementById("selectedPreview").innerHTML="<b>Selected:</b> None";

}

function toggleDropdown(event,id){

event.stopPropagation();

document.querySelectorAll(".dropdown").forEach(drop=>{

if(drop.id !== id){
drop.classList.remove("show");
}

});

document.getElementById(id).classList.toggle("show");

}

document.addEventListener("click",function(e){

document.querySelectorAll(".dropdown").forEach(drop=>{

if(!drop.contains(e.target)){
drop.classList.remove("show");
}

});

});

function showMessage(msg,type="error"){

let box=document.getElementById("messageBox");

box.style.display="block";
box.className="";

if(type==="success"){
box.classList.add("message-success");
}else{
box.classList.add("message-error");
}

box.innerText=msg;

}

function hideMessage(){

document.getElementById("messageBox").style.display="none";

}

function normalize(v){

return String(v || "")
.toLowerCase()
.trim();

}

document.getElementById("fileInput").addEventListener("change",async e=>{

const file=e.target.files[0];

if(!file) return;

clearOldData();

uploadedFileName=file.name.replace(/\.[^/.]+$/,"");

const allowedExtensions=[".csv",".xlsx",".xls"];

const fileName=file.name.toLowerCase();

const isCSV=fileName.endsWith(".csv");

const isExcel=
fileName.endsWith(".xlsx") ||
fileName.endsWith(".xls");

if(!allowedExtensions.some(ext=>fileName.endsWith(ext))){

showMessage(
"⚠️ Only CSV and Excel (.csv, .xlsx, .xls) files are allowed for upload."
);

e.target.value="";

return;

}

const fileSizeMB=file.size / 1024 / 1024;

if(isCSV && fileSizeMB > 400){

document.getElementById("fileLoader").style.display="none";

document.getElementById("fileReady").style.display="none";

showMessage(
`⚠️ CSV file size limit exceeded.

Maximum allowed CSV size is 400 MB.`
);

e.target.value="";

return;

}

if(isExcel && fileSizeMB > 50){

document.getElementById("fileLoader").style.display="none";

document.getElementById("fileReady").style.display="none";

showMessage(
`⚠️ Excel file size limit exceeded.

Maximum allowed Excel size is 50 MB.

Please convert the Excel file to CSV format and upload again for faster processing and better performance.`
);

document.getElementById("fileStatus").innerHTML=`
❌ File Upload Failed

<br><br>

<b>Maximum allowed Excel file size:</b> 50 MB

<br><br>

Please convert the Excel file to CSV format and upload it again for smoother performance and faster processing.
`;

e.target.value="";

return;

}

hideMessage();

document.getElementById("fileStatus").innerText=
`${file.name} (${fileSizeMB.toFixed(2)} MB)`;

document.getElementById("fileLoader").style.display="flex";

document.getElementById("fileReady").style.display="none";

document.getElementById("loaderText").innerText=
"Initializing huge file processing engine...";

try{

if(isCSV){

let rowId=0;

Papa.parse(file,{

header:true,
skipEmptyLines:true,
worker:true,
chunkSize:1024 * 1024 * 10,

chunk:(results)=>{

const rows=results.data;

if(!headers.length){
headers=results.meta.fields || [];
}

for(let i=0;i<rows.length;i++){

const row=rows[i];

rowStore.set(rowId,row);

for(const key in row){

const val=normalize(row[key]);

if(val){
if(!searchIndex.has(val)) searchIndex.set(val, []);
searchIndex.get(val).push(rowId);
}

}

rowId++;

}

document.getElementById("loaderText").innerText=
`Indexing Huge CSV... ${rowId.toLocaleString()} rows`;

},

complete:()=>{
if(rowStore.size===0){
document.getElementById("fileLoader").style.display="none";
alert("Uploaded sheet is empty.");
return;
}

document.getElementById("fileLoader").style.display="none";

document.getElementById("fileReady").style.display="block";

buildCols();

showMessage(
`✅ Huge CSV indexed successfully.`,
"success"
);

showToast("✅ File uploaded successfully");

}

});

}else{

const reader=new FileReader();

reader.onload=function(ev){

setTimeout(()=>{

const wb=XLSX.read(new Uint8Array(ev.target.result),{
type:"array",
dense:true,
cellText:false,
cellDates:true,
cellNF:true,
cellStyles:true
});

const ws=wb.Sheets[wb.SheetNames[0]];

const rows=XLSX.utils.sheet_to_json(ws,{
defval:"",
raw:true
}).map(row=>{

const newRow={};

for(const key in row){

let value=row[key];

if(value === null || value === undefined){
value="";
}
else if(typeof value === "number"){

if(Number.isInteger(value)){
value=value.toLocaleString("fullwide",{useGrouping:false});
}else{
value=value.toString();
}

}else{
value=String(value).trim();
}

newRow[key]=value;

}

return newRow;

});

if(rows.length===0){alert("Uploaded sheet is empty.");document.getElementById("fileLoader").style.display="none";return;}
headers=Object.keys(rows[0] || []);

for(let i=0;i<rows.length;i++){

const row=rows[i];

rowStore.set(i,row);

for(const key in row){

const val=normalize(row[key]);

if(val){
if(!searchIndex.has(val)) searchIndex.set(val, []);
searchIndex.get(val).push(i);
}

}

}

document.getElementById("fileLoader").style.display="none";

document.getElementById("fileReady").style.display="block";

buildCols();

showMessage(
`✅ Excel indexed successfully.`,
"success"
);

showToast("✅ Excel uploaded successfully");

},50);

};

reader.readAsArrayBuffer(file);

}

}catch(err){

console.error(err);

document.getElementById("fileLoader").style.display="none";

showMessage("❌ Failed to process file.");

}

});

async function processData(){

hideMessage();

if(searchIndex.size===0){

showMessage("⚠️ Please upload CSV / Excel first.");

return;

}

let raw=document.getElementById("rawData").value.trim();

if(!raw){

alert("Please enter raw data");

return;

}

document.getElementById("fileLoader").style.display="flex";

const rawList=raw
.split("\n")
.map(x=>x.trim())
.filter(Boolean);

all=[];
matched=[];
notMatched=[];
filteredData=[];

for(let i=0;i<rawList.length;i++){

const rawValue=rawList[i];

const foundIds=searchIndex.get(normalize(rawValue));

if(foundIds && foundIds.length){

foundIds.forEach(foundId=>{
const row=rowStore.get(foundId);

const obj={
...row,
__type:"match",
__raw:rawValue
};

all.push(obj);
matched.push(obj);
});

}else{

const obj={
__type:"nomatch",
__raw:rawValue
};

all.push(obj);
notMatched.push(obj);

}

if(i % 1000 === 0){

document.getElementById("loaderText").style.display="flex";

document.getElementById("loaderText").innerText=
`Analyzing... ${i.toLocaleString()} / ${rawList.length.toLocaleString()}`;

await new Promise(r=>setTimeout(r,0));

}

}

document.getElementById("fileLoader").style.display="none";

updateStats();

analysisMessage=
`✅ ${matched.length.toLocaleString()} matching rows found successfully.`;

showMessage(analysisMessage,"success");

mode="all";

document.querySelectorAll("#allBtn,#matchBtn,#noBtn")
.forEach(b=>b.classList.remove("active"));

document.getElementById("allBtn").classList.add("active");

page=1;

render();

}

function setMode(m){

mode=m;

document.querySelectorAll("#allBtn,#matchBtn,#noBtn")
.forEach(b=>b.classList.remove("active"));

if(m==="all"){

document.getElementById("allBtn").classList.add("active");

if(analysisMessage){
showMessage(analysisMessage,"success");
}

}

if(m==="match"){

document.getElementById("matchBtn").classList.add("active");

if(analysisMessage){
showMessage(analysisMessage,"success");
}

}

if(m==="nomatch"){

document.getElementById("noBtn").classList.add("active");

hideMessage();

}

page=1;

render();

}

function getData(){

let data;

if(mode==="all"){
data=all;
}else if(mode==="match"){
data=matched;
}else{
data=notMatched;
}

if(filteredData.length){
return filteredData;
}

return data;

}

function searchData(){

const value=normalize(
document.getElementById("searchInput").value
);

if(!value){

alert("Please enter search value.");

return;

}

const currentData=mode==="all"
? all
: mode==="match"
? matched
: notMatched;

filteredData=currentData.filter(row=>{

return Object.values(row).some(v=>
normalize(v).includes(value)
);

});

page=1;

render();

}

function clearSearch(){

document.getElementById("searchInput").value="";

filteredData=[];

page=1;

render();

}

function updateStats(){

document.getElementById("rawCount").innerText=document.getElementById("rawData").value.split("\n").filter(v=>v.trim()).length.toLocaleString();
document.getElementById("totalRows").innerText=rowStore.size.toLocaleString();
document.getElementById("totalColumns").innerText=headers.length.toLocaleString();

document.getElementById("matchedCount").innerText=matched.length.toLocaleString();

document.getElementById("notMatchedCount").innerText=notMatched.length.toLocaleString();

}

function render(){

const d=getData();

if(!d.length){

document.getElementById("table").innerHTML=`
<div id="emptyState">
⚠️ No data available.
</div>
`;

document.getElementById("pageInfo").innerText="";

return;

}

const start=(page-1)*limit;

const end=Math.min(start+limit,d.length);

const rows=d.slice(start,end);

let html="<table><tr>";

headers.forEach(h=>{
html+=`<th>${h}</th>`;
});

html+="<th>Status</th></tr>";

rows.forEach(r=>{

html+=`<tr class="${r.__type}">`;

if(r.__type==="match"){

headers.forEach(h=>{
html+=`<td>${r[h] || ""}</td>`;
});

html+=`
<td>
<span class="status-badge badge-match">
Matched
</span>
</td>
`;

}else{

headers.forEach((h,index)=>{
html+=`<td>${index===0 ? r.__raw : ""}</td>`;
});

html+=`
<td>
<span class="status-badge badge-nomatch">
Not Matched
</span>
</td>
`;

}

html+="</tr>";

});

html+="</table>";

document.getElementById("table").innerHTML=html;

document.getElementById("pageInfo").innerText=
`Showing ${start+1} to ${end} of ${d.length.toLocaleString()} rows | Page ${page} of ${Math.ceil(d.length/limit)}`;

}

function nextPage(){

const d=getData();

if(page<Math.ceil(d.length/limit)){

page++;

render();

}

}

function prevPage(){

if(page>1){

page--;

render();

}

}

function goToPage(){

const d=getData();

const totalPages=Math.ceil(d.length/limit);

const input=parseInt(
document.getElementById("gotoPageInput").value
);

if(!input || input<1 || input>totalPages){

alert(`Please enter page number between 1 and ${totalPages}`);

return;

}

page=input;

render();

}

function buildCols(){

let html="";

headers.forEach(h=>{

html+=`
<label class="checkbox-item">
<input type="checkbox" value="${h}" onchange="toggleCol(this)">
${h}
</label>`;

});

document.getElementById("colList").innerHTML=html;

selectedCols.clear();

updateSelectedPreview();

}

function toggleCol(el){

if(el.checked){
selectedCols.add(el.value);
}else{
selectedCols.delete(el.value);
}

updateSelectedPreview();

}

function updateSelectedPreview(){

let box=document.getElementById("selectedPreview");

if(selectedCols.size===0){

box.innerHTML="<b>Selected:</b> None";

return;

}

box.innerHTML="<b>Selected:</b> "+[...selectedCols].join(", ");

}

async function copyAll(){

const d=getData();

let text=[...headers,"Status"].join("\t")+"\n";

d.forEach(r=>{

if(r.__type==="match"){

text+=[
...headers.map(h=>r[h]||""),
"Matched"
].join("\t")+"\n";

}else{

let rowData=[];

headers.forEach((h,index)=>{
rowData.push(index===0 ? r.__raw : "");
});

text+=[
...rowData,
"Not Matched"
].join("\t")+"\n";

}

});

await navigator.clipboard.writeText(text);

showToast("✅ Full table copied successfully");

}

async function copySelected(){

if(selectedCols.size===0){

showToast("⚠️ Please select columns first","#dc2626");

return;

}

const cols=[...selectedCols];

const d=getData();

let text=[...cols,"Status"].join("\t")+"\n";

d.forEach(r=>{

if(r.__type==="match"){

text+=[
...cols.map(c=>r[c]||""),
"Matched"
].join("\t")+"\n";

}else{

text+=[
r.__raw,
"Not Matched"
].join("\t")+"\n";

}

});

await navigator.clipboard.writeText(text);

showToast("✅ Selected columns copied successfully");

}

function exportCSV(){

const d=getData();

let csv=[...headers,"Status"].join(",")+"\n";

d.forEach(r=>{

if(r.__type==="match"){

csv+=[
...headers.map(h=>`"${String(r[h]||"").replace(/"/g,'""')}"`),
`"Matched"`
].join(",")+"\n";

}else{

let rowData=[];

headers.forEach((h,index)=>{
rowData.push(index===0 ? `"${r.__raw}"` : `""`);
});

csv+=[
...rowData,
`"Not Matched"`
].join(",")+"\n";

}

});

let exportName = "all_data";

if(mode === "match"){
    exportName = "matched_data";
}else if(mode === "nomatch"){
    exportName = "not_matched_data";
}

downloadFile(
csv,
`${uploadedFileName}_${exportName}.csv`,
"text/csv"
);

showToast("✅ CSV downloaded successfully");

}

function exportExcel(){

const d=getData();

const exportData=[];

d.forEach(r=>{

if(r.__type==="match"){

let obj={};

headers.forEach(h=>{
obj[h]=r[h];
});

obj["Status"]="Matched";

exportData.push(obj);

}else{

let obj={};

headers.forEach((h,index)=>{
obj[h]=index===0 ? r.__raw : "";
});

obj["Status"]="Not Matched";

exportData.push(obj);

}

});

const ws=XLSX.utils.json_to_sheet(exportData);

const wb=XLSX.utils.book_new();

XLSX.utils.book_append_sheet(wb,ws,"Data");

let exportName = "all_data";

if(mode === "match"){
    exportName = "matched_data";
}else if(mode === "nomatch"){
    exportName = "not_matched_data";
}

XLSX.writeFile(
wb,
`${uploadedFileName}_${exportName}.xlsx`,
{
compression:true
}
);
showToast("✅ Excel downloaded successfully");

}

function downloadFile(content,name,type){

const a=document.createElement("a");

a.href=URL.createObjectURL(new Blob([content],{type}));

a.download=name;

a.click();

setTimeout(()=>{
URL.revokeObjectURL(a.href);
},1000);

}