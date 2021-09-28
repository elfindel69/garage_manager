const {ipcRenderer} = require("electron");
let cars = [];
function generateRowLine(tbodyId,data){
    const tbody = document.querySelector("#"+tbodyId);
    data.forEach(item=>{
        const tr = document.createElement("tr");

        const thId = document.createElement("th");
        thId.scope = 'row';
        thId.innerText = item.id;
        thId.classList.add("col-2");
        const tdBrand = document.createElement("td");
        tdBrand.innerText = item.brand;
        tdBrand.classList.add("col-3");
        const tdModel = document.createElement("td");
        tdModel.innerText = item.model;
        tdBrand.classList.add("col-3");
        const tdButtons = document.createElement("td");
        tdButtons.classList.add("col-4");
        const editBtn = document.createElement("button");
        editBtn.innerText = 'Modif.';
        editBtn.classList.add('btn','btn-outline-warning','mx-2');

        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = 'Suppr.';
        deleteBtn.classList.add('btn','btn-outline-danger','mx-2');

        tdButtons.append(editBtn,deleteBtn);
        tr.append(thId,tdBrand,tdModel,tdButtons);
        tbody.append(tr);

    })
}



ipcRenderer.on("init-data",(e,data)=>{
    cars = data;
    generateRowLine('cars-table',data);


})

const btnAdd = document.getElementById("add-car");

function onClickAddNewItem(e){
    ipcRenderer.send("open-new-item-window", null);
}
btnAdd.addEventListener("click",onClickAddNewItem);

ipcRenderer.on("new-item-added",(e,data)=>{
        generateRowLine("cars-table",data.item);
    }
)