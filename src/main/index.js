import { app, BrowserWindow, Menu, dialog } from 'electron'
const { OAuth2Provider } = require('electron-oauth-helper')
const settings = require('electron-settings')
const axios = require('axios')
const moment = require('moment')
import { authConfig } from './auth'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow, authWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  // Check if we need to login first, otherwise draw window
  let isSetupNeeded = true
  if((settings.has('secret') && settings.get('secret').length > 0)
      && settings.has('tokenInfo')) {
      isSetupNeeded = false
  }
  console.log("Is Setup Needed: " + isSetupNeeded)
  if(isSetupNeeded) {
    loginRequest();
  } else {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
      height: 563,
      useContentSize: true,
      width: 1000,
      webPreferences: { webSecurity:  !(process.env.NODE_ENV === 'development') }
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
                  settings.deleteAll()
                  createWindow()
                  mainWindow.close()
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
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    console.log("creating window...")
    createWindow()
  }
})

function checkAndVerifyAuthUrl(newUrl) {
  // check new url
  if(newUrl.startsWith('http://localhost/callback?code=')) {
      // get code, then get token info
      const code = newUrl.split('=')[1]
      settings.set('secret', code)
      // token
      axios.post('https://api.planningcenteronline.com/oauth/token', {
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': authConfig.client_id,
        'client_secret': authConfig.client_secret,
        'redirect_uri': authConfig.redirect_uri
      }).then(function(response) {
        if(response.status == 200) {
          response.data.expires = moment().add(response.data.expires_in, 's')
          console.log("Token Expiration: " + response.data.expires)
          settings.set('tokenInfo', response.data)
          createWindow()
          authWindow.close()
        }
      }).catch(function(error) {
          console.error(error)
      })
  }
}

function loginRequest() {
  authWindow = new BrowserWindow({
    show: false,
    height: 563,
    width: 1000,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })
  authWindow.once("ready-to-show", () => {
    authWindow.show()
    checkAndVerifyAuthUrl(authWindow.webContents.getURL())
  })
  authWindow.once("closed", () => {
    if(authWindow.webContents != null)
      authWindow.webContents.removeListener('will-navigate')
    authWindow = null
  })
  authWindow.webContents.on('will-navigate', (event, newUrl) => {
    // check and verify url
    checkAndVerifyAuthUrl(newUrl)
  })

  const provider = new OAuth2Provider(authConfig)

  provider.perform(authWindow)
    .then(resp => {
      console.log(resp)
      authWindow.close()
      createWindow()
    })
    .catch(error => {
      console.error("OAuth error")
      console.error(error)
    })
}