const {ipcRenderer} = require('electron');

const newItemForm = document.querySelector("#new-item-form");
const newItemSubmitBtn = newItemForm.querySelector("#new-item-submit");
const newItemBrandInput = newItemForm.querySelector("#item-brand");
const newItemModelInput = newItemForm.querySelector("#item-model");

/**
 * check des inputs
 */
function onInputCheckValue(){
    if(newItemBrandInput.value !== '' && newItemModelInput.value !==''){
        newItemSubmitBtn.hidden = false
    }else{
        newItemSubmitBtn.hidden = true
    }
}

//envoi du formulaire
function onSubmitNewItemForm(e){
    e.preventDefault();

    const newItem = {
        brand : newItemBrandInput.value,
        model: newItemModelInput.value
    };

    ipcRenderer.invoke("new-item",newItem)
        .then(resp =>{
        const msgDiv = document.querySelector("#response-message");
        msgDiv.innerText = resp;
        msgDiv.hidden = false;
        setTimeout(()=>{
            msgDiv.innerText = '';
            msgDiv.hidden = true;

        },1500);

        e.target.reset();
        newItemSubmitBtn.hidden = true;
    } )
}

newItemBrandInput.addEventListener("input",onInputCheckValue);
newItemModelInput.addEventListener("input",onInputCheckValue);

newItemForm.addEventListener("submit",onSubmitNewItemForm)