import { app, BrowserWindow, Menu, dialog } from 'electron'
const settings = require('electron-settings')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  // add menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Reset',
          click() {
            dialog.showMessageBox({
              type: 'question',
              buttons: ['Reset', 'Cancel'],
              tile: 'Reset App',
              message: 'Are you sure you want to reset the app?  The app with restart all information will be lost'
            }, function(resp) {
              if(resp === 0) {
                settings.deleteAll();
                app.relaunch();
              }
            })
          }
        },
        { role: 'seperator' },
        { role: 'close' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'zoomin' },
        { role: 'zoomout' },
        { role: 'resetzoom' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More'
        },
        {
          label: 'View on Github',
          click() { require('electron').shell.openExternal('https://github.com/nwestfall/musicstand') }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
