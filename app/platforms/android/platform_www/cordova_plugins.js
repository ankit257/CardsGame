cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-customurlscheme/www/android/LaunchMyApp.js",
        "id": "cordova-plugin-customurlscheme.LaunchMyApp",
        "pluginId": "cordova-plugin-customurlscheme",
        "clobbers": [
            "window.plugins.launchmyapp"
        ]
    },
    {
        "file": "plugins/cordova-plugin-whitelist/whitelist.js",
        "id": "cordova-plugin-whitelist.whitelist",
        "pluginId": "cordova-plugin-whitelist",
        "runs": true
    },
    {
        "file": "plugins/phonegap-facebook-plugin/facebookConnectPlugin.js",
        "id": "phonegap-facebook-plugin.FacebookConnectPlugin",
        "pluginId": "phonegap-facebook-plugin",
        "clobbers": [
            "facebookConnectPlugin"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-customurlscheme": "4.0.0",
    "cordova-plugin-whitelist": "1.2.0",
    "phonegap-facebook-plugin": "0.12.0"
}
// BOTTOM OF METADATA
});