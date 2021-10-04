const {app, BrowserWindow,ipcMain,dialog} = require('electron');
const path = require('path');

let newItemWindow;
let editItemWindow;
let homeWindow;

/**
 * tableau de voitures
 * @type {[{model: string, id: number, brand: string}, {model: string, id: number, brand: string}, {model: string, id: number, brand: string}]}
 */
const cars = [
    {
        id: 1,
        brand: "Renault",
        model: "Clio"
    },
    {
        id: 2,
        brand: "Peugeot",
        model: "308"
    },
    {
        id: 3,
        brand: "Citroën",
        model: "DS"
    }
]

/**
 * fonction de création de fenêtre
 * @param viewName titre de la fenêtre
 * @param dataToSend données à afficher
 * @param width largeur de la fenêtre (px)
 * @param height hauteur de la fenêtre (px)
 * @returns {Electron.CrossProcessExports.BrowserWindow} fenêtre créée
 */
function createWindow(viewName,dataToSend,width=1600,height=900) {
    //création de la fenêtre
    const win = new BrowserWindow({
        width, height,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    //ouverture du fichier HTML
    win.loadFile(path.join(__dirname, "views", viewName, viewName+".html")).then(() => {
        if(dataToSend){
            win.send('init-data', dataToSend);
        }
    });
    //ouverture de la fenêtre de débug
    win.webContents.openDevTools();

    //retour
    return win;
}

/**
 * channel d'ajout d'item
 */
ipcMain.on('open-new-item-window',(e,data)=>{
    //si il y a une fenêtre, on l'affiche
    if(newItemWindow){
        newItemWindow.focus();
        return;
    }
    //création de la fenêtre
    newItemWindow = createWindow("new-item",null,1000,500);
    //retour sur le channel new-item
    ipcMain.handle('new-item',(e,newItem)=>{
        //ajout de l'item
        let id = 1;
        if(cars.length > 0){
            id = cars[cars.length - 1].id +1;
        }
        newItem.id = id;
        cars.push(newItem);

        //envoi de l'item à la vue principale
        homeWindow.send('new-item-added',{
            item: [newItem]
        });

        //message de retour
        return 'Item ajouté avec succès'
    });

    //suppression des channels
    newItemWindow.on('closed',()=>{
        newItemWindow = null;
        ipcMain.removeHandler('new-item');
    });
})

/**
 * édition d'un item
 */
ipcMain.on('open-edit-item-window',(e,data)=>{
    //si une fenêtre est ouverte on la ferme
    if(editItemWindow){
        editItemWindow.close();
    }

    //recherche de l'item
    for(let [index,item] of cars.entries()){
        if(item.id === data.id){
            //création de la fenêtre
            editItemWindow = createWindow("edit-item", {item},1000,500);

            //mise à jour de l'item
            ipcMain.handle('edit-item',(e,data)=>{
                cars[index].brand = data.brand;
                cars[index].model = data.model;

                //mise à jour du front
                homeWindow.send('edited-item',{item:cars[index]});

                //message de retour
                return 'item modifié avec succès';
            });

            //suppression des channels
            editItemWindow.on('closed',()=>{
                editItemWindow = null;
                ipcMain.removeHandler('edit-item');
            });
            break;
        }
    }

    //suppression des channels
    editItemWindow.on('closed',()=>{
        editItemWindow = null
    })


})

/**
 * suppression d'un item
 */
ipcMain.handle('show-confirm-delete-item', (e,data)=>{

    //pop-up de confirmation
    const choice = dialog.showMessageBoxSync({
        type: 'warning',
        buttons: ['Non', 'Oui'],
        title: 'Confirmation de suppression',
        message: 'Êtes-vous sûr de vouloir supprimer l\'élément ?'
    })

    //si suppression confirmée
    if (choice){
        //recherche de l'élément
        for (let [index, item] of cars.entries()){
            if (item.id === data.id){
                // Permet de supprimer un certain nombre d'élément
                // à partir d'un index donné
                cars.splice(index,1);
                // Slice permet d'extraire une partie d'un tableau
                break;
            }
        }
        // Sinon, mais moins sexy
        // for (let i = 0; i<selectedTab.length; i++){
        //
        // }
    }

    //retour si élément supprimé
    return {choice};
})

//création de la fenêtre
app.whenReady().then(()=>{
    homeWindow =  createWindow('home',cars);
});

//suppression de l'application
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

//activation de la fenêtre
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        homeWindow = createWindow('home',cars);
    }
});



