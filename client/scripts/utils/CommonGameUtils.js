export function findMyBrowser(){
    var browser = [{
                    name: 'Opera',
                    found: false
                   },{
                    name : 'Firefox',
                    found: false
                   },{
                    name : 'Safari',
                    found: false
                   },{
                    name : 'Chrome',
                    found: false
                   },{
                    name : 'IE',
                    found: false
                   }];
    browser[0].found = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
    browser[1].found = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
    browser[2].found = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // At least Safari 3+: "[object HTMLElementConstructor]"
    browser[3].found = !!window.chrome && !browser[0].found;              // Chrome 1+
    browser[4].found = /*@cc_on!@*/false || !!document.documentMode;   // At least IE6
    for (var i = browser.length - 1; i >= 0; i--) {
        if(browser[i].found){
            return browser[i].name;
        }
    };
    return false;
}
export function scaleGameBody(gameCSSConstants){
        var win_w = window.innerWidth;
        var effh = window.innerHeight;
        let gameBodyWidth, gameBodyHeight;
        // For the older and newer versions of gameCSSConstants
        if(!gameCSSConstants.gameBody.x &&  gameCSSConstants.gameBody.width) gameBodyWidth = gameCSSConstants.gameBody.width;
        if( gameCSSConstants.gameBody.x && !gameCSSConstants.gameBody.width) gameBodyWidth = gameCSSConstants.gameBody.x;
        if(!gameCSSConstants.gameBody.y &&  gameCSSConstants.gameBody.height) gameBodyHeight = gameCSSConstants.gameBody.height;
        if( gameCSSConstants.gameBody.y && !gameCSSConstants.gameBody.height) gameBodyHeight = gameCSSConstants.gameBody.y;
        //
        var effw = win_w - 80;
            if(effw/effh < gameBodyWidth/gameBodyHeight){
                var scalefactor = effw/gameBodyWidth;
                var leftshiftFirefox = gameBodyWidth*(scalefactor-1)/2;
                var topshiftFirefox = gameBodyHeight*(scalefactor-1)/2 + + (effh-gameBodyHeight*scalefactor)/2;
            }
            if(effw/effh > gameBodyWidth/gameBodyHeight){
                scalefactor = effh/gameBodyHeight;
                var leftshiftFirefox = gameBodyWidth*(scalefactor-1)/2 + (effw-gameBodyWidth*scalefactor)/2;
                var topshiftFirefox = gameBodyHeight*(scalefactor-1)/2;
                var leftshiftChrome = (effw - gameBodyWidth*scalefactor)/2 + gameBodyWidth*scalefactor/2;
            }
        scalefactor = 0.99*scalefactor; 
        if(findMyBrowser() == 'Firefox' || findMyBrowser() == 'IE'){
            return {
                WebkitTransform : 'scale('+scalefactor+','+scalefactor+')',
                msTransform : 'scale('+scalefactor+','+scalefactor+')',
                transform : 'scale('+scalefactor+','+scalefactor+')',
                MozTransform : 'scale('+scalefactor+','+scalefactor+')',
                left : leftshiftFirefox,
                top: topshiftFirefox
            }
        }else{
            var zoompercent = scalefactor*100;
            return {
                zoom: zoompercent+'%',
                margin: '0 auto',
                left : 0,
                top: 0
            }
        }
        
    }