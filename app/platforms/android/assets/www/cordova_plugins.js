cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-admobpro/www/AdMob.js",
        "id": "cordova-plugin-admobpro.AdMob",
        "pluginId": "cordova-plugin-admobpro",
        "clobbers": [
            "window.AdMob"
        ]
    },
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
    },
    {
        "file": "plugins/com.cmackay.plugins.googleanalytics/www/analytics.js",
        "id": "com.cmackay.plugins.googleanalytics.GoogleAnalytics",
        "pluginId": "com.cmackay.plugins.googleanalytics",
        "clobbers": [
            "navigator.analytics"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-extension": "1.2.3",
    "cordova-plugin-admobpro": "2.10.0",
    "cordova-plugin-customurlscheme": "4.1.0",
    "cordova-plugin-whitelist": "1.2.0",
    "phonegap-facebook-plugin": "0.12.0",
    "com.cmackay.plugins.googleanalytics": "0.1.22"
}
// BOTTOM OF METADATA
});