const {ipcRenderer} = require("electron");

let cbEditedItem;
let isEditionModeActivated = false;
/**
 * fonction de création de ligne d'item
 * @param tbodyId tableau à modifier
 * @param data items à insérer
 */
function generateRowLine(tbodyId,data){
    //récupération du tableau
    const tbody = document.querySelector("#"+tbodyId);

    //ajout des éléments
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
        tdModel.classList.add("col-3");
        const tdButtons = document.createElement("td");
        tdButtons.classList.add("col-4");
        tdButtons.hidden = !isEditionModeActivated;
        //bouton d'édition
        const editBtn = document.createElement("button");
        editBtn.innerText = 'Modif.';
        editBtn.classList.add('btn','btn-outline-warning','mx-2');

        //édition de l'élément
        editBtn.addEventListener('click', () => {
            //demande de création de la vue édition
            ipcRenderer.send('open-edit-item-window',{
                id: item.id
            });
            //si le channel est déjà ouvert, on le ferme
            if(cbEditedItem){
                ipcRenderer.removeListener("edited-item",cbEditedItem);
                cbEditedItem = null;
            }

            //callback d'édition
            cbEditedItem = (e,data)=>{
                tdModel.innerText = data.item.model;
                tdBrand.innerText = data.item.brand;
            };
            ipcRenderer.on("edited-item",cbEditedItem);
        })

        //bouton de suppression
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = 'Suppr.';
        deleteBtn.classList.add('btn','btn-outline-danger','mx-2');
        //suppression de l'élément
        deleteBtn.addEventListener('click', () => {
            //demande d'affichage de la pop-up de suppression
            ipcRenderer.invoke('show-confirm-delete-item',{id:item.id})
                //suppression de la ligne
                .then(resp => {
                    if (resp.choice){
                        tr.remove();
                    }
                })
        });

        tdButtons.append(editBtn,deleteBtn);
        tr.append(thId,tdBrand,tdModel,tdButtons);
        tbody.append(tr);

    })
}


//initialisation du tableau
ipcRenderer.on("init-data",(e,data)=>{
    generateRowLine('cars-table',data);


})

//bouton d'ajout
const btnAdd = document.getElementById("add-car");

function onClickAddNewItem(){
    ipcRenderer.send("open-new-item-window", null);
}
btnAdd.addEventListener("click",onClickAddNewItem);

//ajout d'un élément
ipcRenderer.on("new-item-added",(e,data)=>{
        generateRowLine("cars-table",data.item);
    }
)

ipcRenderer.on("toggle-edition-mode",()=>{
    isEditionModeActivated = !isEditionModeActivated;
    const trTHeads = document.querySelectorAll('thead tr');
    trTHeads[0].lastElementChild.hidden = !trTHeads[0].lastElementChild.hidden;

    const trTBodies = document.querySelectorAll('tbody tr');
    trTBodies.forEach(tr=>{tr.lastElementChild.hidden = !tr.lastElementChild.hidden});
})