const {app, BrowserWindow,ipcMain} = require('electron');
const path = require('path');

let newItemWindow;
let homeWindow;
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



function createWindow(viewName,dataToSend,width=1600,height=900) {
    const win = new BrowserWindow({
        width, height,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile(path.join(__dirname, "views", viewName, viewName+".html")).then(() => {
        if(dataToSend){
            win.send('init-data', dataToSend);
        }
    });
    win.webContents.openDevTools();

    return win;
}


ipcMain.on('open-new-item-window',(e,data)=>{
    if(newItemWindow){
        newItemWindow.focus();
        return;
    }
    newItemWindow = createWindow("new-item",null,1000,500);

    ipcMain.handle('new-item',(e,newItem)=>{
        let id = 1;
        if(cars.length > 0){
            id = cars[cars.length - 1].id +1;
        }
        newItem.id = id;
        cars.push(newItem);

        homeWindow.send('new-item-added',{
            item: [newItem]
        });

        return 'Item ajouté avec succès'
    });
    newItemWindow.on('closed',()=>{
        newItemWindow = null;
        ipcMain.removeHandler('new-item');
    });
})



app.whenReady().then(()=>{
    homeWindow =  createWindow('home',cars);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        homeWindow = createWindow('home',cars);
    }
});



