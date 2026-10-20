let images=[];

/* OPEN FILE */
function openGallery(){
let input=document.getElementById("fileInput");
input.value="";
input.click();
}

/* ADD IMAGES */
/* ADD IMAGES */
document.getElementById("fileInput").addEventListener("change",e=>{

let files = Array.from(e.target.files);

if(files.length > 10){
    alert("Maximum 10 images allowed at a time.");
    return;
}

if(images.length + files.length > 10){
    alert("You can upload only 10 images in total.");
    return;
}

files.forEach(file=>{
    let reader=new FileReader();
    reader.onload=function(ev){
        images.push(ev.target.result);
        render();
    };
    reader.readAsDataURL(file);
});

});

/* START */
function start(){
if(images.length===0){
alert("Upload images first!");
return;
}
document.getElementById("modeBox").classList.remove("hidden");
}

/* =========================
   🔥 NEW: ORDER + DELETE UI
========================= */
function render(){

let html="";

images.forEach((img,i)=>{

html+=`
<div class="item">
<img src="${img}">

<div>Image ${i+1}</div>

<div class="ctrl">

<button onclick="up(${i})">⬆</button>
<button onclick="down(${i})">⬇</button>
<button onclick="removeImg(${i})">❌</button>

</div>

</div>
`;

});

document.getElementById("list").innerHTML=html;
}

/* MOVE UP */
function up(i){
if(i===0)return;
[images[i],images[i-1]]=[images[i-1],images[i]];
render();
}

/* MOVE DOWN */
function down(i){
if(i===images.length-1)return;
[images[i],images[i+1]]=[images[i+1],images[i]];
render();
}

/* DELETE */
function removeImg(i){
images.splice(i,1);
render();
}

/* LOAD */
function load(src){
return new Promise(res=>{
let img=new Image();
img.onload=()=>res(img);
img.src=src;
});
}

/* MAIN PDF (UNCHANGED) */
async function generatePDF(){

const { jsPDF } = window.jspdf;

let mode=document.querySelector('input[name="mode"]:checked').value;

if(images.length===0){
alert("No images!");
return;
}

/* 🟢 ONE PDF */
if(mode==="single"){

let pdf=new jsPDF("p","mm","a4");

let W=pdf.internal.pageSize.getWidth();
let H=pdf.internal.pageSize.getHeight();

let margin=10;
let perH=(H-margin*2)/images.length;

for(let i=0;i<images.length;i++){

let img=await load(images[i]);

let ratio=Math.min((W-margin*2)/img.width, perH/img.height);

let w=img.width*ratio;
let h=img.height*ratio;

let x=(W-w)/2;
let y=margin+(i*perH);

pdf.addImage(images[i],"JPEG",x,y,w,h);

}

pdf.save("One_Page.pdf");

}

/* 🔵 ZIP MODE */
else{

let zip=new JSZip();

for(let i=0;i<images.length;i++){

let pdf=new jsPDF("p","mm","a4");

let W=pdf.internal.pageSize.getWidth();
let H=pdf.internal.pageSize.getHeight();

let img=await load(images[i]);

let ratio=Math.min((W-20)/img.width,(H-20)/img.height);

let w=img.width*ratio;
let h=img.height*ratio;

let x=(W-w)/2;
let y=(H-h)/2;

pdf.addImage(images[i],"JPEG",x,y,w,h);

zip.file(`image_${i+1}.pdf`, pdf.output("blob"));

}

zip.generateAsync({type:"blob"}).then(content=>{
let a=document.createElement("a");
a.href=URL.createObjectURL(content);
a.download="All_PDFs.zip";
a.click();
});

}

}

