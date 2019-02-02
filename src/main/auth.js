const settings = require('electron-settings')
const axios = require('axios')
const moment = require('moment')
const request = require('request')

export const authConfig = {
    client_id: "5af76ddcefa179b5c277b0c04300f1e321c519ce64e2e81e24bf895ad9ec8953",
    client_secret: "6aaac5dac28d49ad355f1685944dfa5541e58bf334980b800dbfa88c66ee3b77",
    scope: "people services",
    redirect_uri: "http://localhost/callback",
    response_type: "code",
    authorize_url: "https://api.planningcenteronline.com/oauth/authorize",
    access_token_url: "https://api.planningcenteronline.com/oauth/token"
}

export function checkAndRefreshToken() {
    var promise = new Promise(function(resolve, reject) {
        var tokenInfo = settings.get('tokenInfo')
        if(tokenInfo == null)
            reject("No token information found. Try resetting")
        else if(tokenInfo.expires < moment().subtract(5, 'm')) {
            console.log("Token expiring, refreshing")
            // token
            axios.post('https://api.planningcenteronline.com/oauth/token', {
                'client_id': authConfig.client_id,
                'secret': authConfig.client_secret,
                'refresh_token': tokenInfo.refresh_token,
                'grant_type': 'refresh_token'
            }).then(function(response) {
                console.log(response)
                if(response.status == 200) {
                    response.data.expires = moment().add(response.data.expires_in, 's')
                    console.log("Token Expiration: " + response.data.expires)
                    settings.set('tokenInfo', response.data)
                    resolve(tokenInfo)
                }
                else
                    reject("Unable to refresh token")
            }).catch(function(error) {
                console.error(error)
                reject("Unable to refresh token")
            })
        }
        else
            resolve(tokenInfo)
    })
    return promise
}