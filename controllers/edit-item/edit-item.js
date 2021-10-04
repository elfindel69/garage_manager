const {ipcRenderer} = require('electron');

const editItemForm = document.querySelector("#edit-item-form");
const editItemSubmitBtn = editItemForm.querySelector("#edit-item-submit");
const editItemBrandInput = editItemForm.querySelector("#item-brand");
const editItemModelInput = editItemForm.querySelector("#item-model");

/**
 * check des inputs
 */
function onInputCheckValue(){
    if(editItemBrandInput.value !== '' && editItemModelInput.value !==''){
        editItemSubmitBtn.hidden = false
    }else{
        editItemSubmitBtn.hidden = true
    }
}

//initialisation de la vue
ipcRenderer.on('init-data', (e,data)=>{
    editItemBrandInput.value = data.item.brand;
    editItemModelInput.value = data.item.model;
})

//envoi du formulaire
function onSubmitEditItemForm(e){
    //suppression de l'événement par défaut
    e.preventDefault();
    //objet édité
    const editItem = {
        brand : editItemBrandInput.value,
        model: editItemModelInput.value
    };

    //channel d'édition
    ipcRenderer.invoke("edit-item",editItem)
        .then(resp =>{
            const msgDiv = document.querySelector("#response-message");
            msgDiv.innerText = resp;
            msgDiv.hidden = false;
            setTimeout(()=>{
                msgDiv.innerText = '';
                msgDiv.hidden = true;

            },1500);

        } )
}

editItemBrandInput.addEventListener("input",onInputCheckValue);
editItemModelInput.addEventListener("input",onInputCheckValue);

editItemForm.addEventListener("submit",onSubmitEditItemForm)