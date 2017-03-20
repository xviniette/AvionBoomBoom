(function(){
	var codeToKey = {"3":"break","8":"backspace","9":"tab","12":"clear","13":"enter","16":"shift","17":"ctrl","18":"alt","19":"pause","20":"capslock","27":"escape","32":"spacebar","33":"pageup","34":"pagedown","35":"end","36":"home","37":"left","38":"up","39":"right","40":"down","41":"select","42":"print","43":"execute","44":"Print","45":"insert ","46":"delete","48":"0","49":"1","50":"2","51":"3","52":"4","53":"5","54":"6","55":"7","56":"8","57":"9","58":":","59":"semicolon","60":"<","61":"equals","63":"ß","64":"@","65":"a","66":"b","67":"c","68":"d","69":"e","70":"f","71":"g","72":"h","73":"i","74":"j","75":"k","76":"l","77":"m","78":"n","79":"o","80":"p","81":"q","82":"r","83":"s","84":"t","85":"u","86":"v","87":"w","88":"x","89":"y","90":"z","91":"WindowsKey","92":"rightWindowsKey","93":"WindowsMenu","96":"num0","97":"num1","98":"num2","99":"num3","100":"num4","101":"num5","102":"num6","103":"num7","104":"num8","105":"num9","106":"multiply","107":"add","108":"numpadperiod","109":"subtract","110":"decimalpoint","111":"divide","112":"f1","113":"f2","114":"f3","115":"f4","116":"f5","117":"f6","118":"f7","119":"f8","120":"f9","121":"f10","122":"f11","123":"f12","124":"f13","125":"f14","126":"f15","127":"f16","128":"f17","129":"f18","130":"f19","131":"f20","132":"f21","133":"f22","134":"f23","135":"f24","144":"numlock","145":"scrolllock","160":"^","161":"!","163":"#","164":"$","165":"ù","166":"page backward","167":"page forward","169":"closing parent","170":"*","171":"~ + * key","173":"mute/unmute","174":"decrease volume level","175":"increase volume level","176":"next","177":"previous","178":"stop","179":"play/pause","180":"e-mail","181":"mute/unmute (firefox)","182":"decrease volume level (firefox)","183":"increase volume level (firefox)","186":"semi-colon / ñ","187":"equal sign ","188":"comma","189":"dash ","190":"period ","191":"forward slash / ç","192":"grave accent / ñ","193":"?, / or °","194":"numpad period (chrome)","219":"open bracket ","220":"back slash ","221":"close bracket ","222":"single quote ","223":"`","224":"left or right ⌘ key (firefox)","225":"altgr","226":"< /git >","230":"GNOME Compose Key","233":"XF86Forward","234":"XF86Back","255":"toggle touchpad"};
	var keyToCode = {"0":"48","1":"49","2":"50","3":"51","4":"52","5":"53","6":"54","7":"55","8":"56","9":"57","break":"3","backspace":"8","tab":"9","clear":"12","enter":"13","shift":"16","ctrl":"17","alt":"18","pause":"19","capslock":"20","escape":"27","spacebar":"32","pageup":"33","pagedown":"34","end":"35","home":"36","left":"37","up":"38","right":"39","down":"40","select":"41","print":"42","execute":"43","Print":"44","insert ":"45","delete":"46",":":"58","semicolon":"59","<":"60","equals":"61","ß":"63","@":"64","a":"65","b":"66","c":"67","d":"68","e":"69","f":"70","g":"71","h":"72","i":"73","j":"74","k":"75","l":"76","m":"77","n":"78","o":"79","p":"80","q":"81","r":"82","s":"83","t":"84","u":"85","v":"86","w":"87","x":"88","y":"89","z":"90","WindowsKey":"91","rightWindowsKey":"92","WindowsMenu":"93","num0":"96","num1":"97","num2":"98","num3":"99","num4":"100","num5":"101","num6":"102","num7":"103","num8":"104","num9":"105","multiply":"106","add":"107","numpadperiod":"108","subtract":"109","decimalpoint":"110","divide":"111","f1":"112","f2":"113","f3":"114","f4":"115","f5":"116","f6":"117","f7":"118","f8":"119","f9":"120","f10":"121","f11":"122","f12":"123","f13":"124","f14":"125","f15":"126","f16":"127","f17":"128","f18":"129","f19":"130","f20":"131","f21":"132","f22":"133","f23":"134","f24":"135","numlock":"144","scrolllock":"145","^":"160","!":"161","#":"163","$":"164","ù":"165","page backward":"166","page forward":"167","closing parent":"169","*":"170","~ + * key":"171","mute/unmute":"173","decrease volume level":"174","increase volume level":"175","next":"176","previous":"177","stop":"178","play/pause":"179","e-mail":"180","mute/unmute (firefox)":"181","decrease volume level (firefox)":"182","increase volume level (firefox)":"183","semi-colon / ñ":"186","equal sign ":"187","comma":"188","dash ":"189","period ":"190","forward slash / ç":"191","grave accent / ñ":"192","?, / or °":"193","numpad period (chrome)":"194","open bracket ":"219","back slash ":"220","close bracket ":"221","single quote ":"222","`":"223","left or right ⌘ key (firefox)":"224","altgr":"225","< /git >":"226","GNOME Compose Key":"230","XF86Forward":"233","XF86Back":"234","toggle touchpad":"255"};

	var KEYS = {};

	var Key = {
		isDown(key){
			key = key.toLowerCase();
			if(keyToCode[key] && KEYS[keyToCode[key]] !== undefined){
				return KEYS[keyToCode[key]];
			}
			return false;
		},
		isUp(key){
			key = key.toLowerCase();
			if(keyToCode[key] && KEYS[keyToCode[key]] !== undefined){
				return KEYS[keyToCode[key]];
			}
			return true;
		},
		isDownKeyCode(key){
			if(KEYS[key] !== undefined){
				return KEYS[key];
			}
			return false;
		},
		isUpKeyCode(key){
			if(KEYS[key] !== undefined){
				return KEYS[key];
			}
			return true;
		},
		getKeyCode(key){
			if(keyToCode[key] != undefined){
				return keyToCode[key];
			}
			return false;
		},
		getKey(keycode){
			if(codeToKey[keycode] != undefined){
				return codeToKey[keycode];
			}
			return false;
		},
		getDownKeys(){
			var keys = [];
			for(var i in KEYS){
				if(KEYS[i] == true){
					keys.push(this.getKey(i));
				}
			}
			return keys;
		},
		getUpKeys(){
			var keys = [];
			for(var i in keyToCode){
				if(this.isUp(i)){
					keys.push(i);
				}
			}
			return keys;
		}
	}

	document.body.addEventListener("keydown", function(e) {
		KEYS[e.keyCode] = true;
	});

	document.body.addEventListener("keyup", function(e) {
		KEYS[e.keyCode] = false;
	});

	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
		module.exports = Key;
	else
		window.KeyManager = Key;
})();