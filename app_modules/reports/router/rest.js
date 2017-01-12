/**
 * REST request class
 *
 * User: bryanmac
 * Date: 2/10/12
 */

var http = require("http");
var https = require("https");

/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
exports.getJSON = function(options, onResult)
{
    console.log("rest::getJSON");

    var prot = options.port == 8080 ? http : https;
	/*options.rejectUnauthorized = false;
	options.requestCert = true;
	options.agent = false;*/
    var req = prot.request(options, function(res)
    {
        var output = '';
        console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');
		if(res.statusCode == 302){
			var obj ='';
			onResult(res.statusCode, obj);
		}
		else{
        res.on('data', function (chunk) {
			//console.log("Chunk:"+chunk);
            output += chunk;
        });

        res.on('end', function() {
			//console.log("output" + output);
			if(output!=null)
				var obj = eval("(" + output + ")");
            onResult(res.statusCode, obj);
        });
		}
	});
	

    req.on('error', function(err) {
        //res.send('error: ' + err.message);
		console.log('rest error: ' + err.message)
        onResult(302, null);
    });

    req.end();
};

/**
 * postJSON: post a JSON object to a REST service
 *
 * @param options
 * @param callback: callback to pass the results JSON object(s) back
 */
exports.postJSON = function(options, data, onResult)
{
    console.log("rest::postJSON");

    var prot = options.port == 8080 ? http : https;
	/*options.rejectUnauthorized = false;
	options.requestCert        = true;
	options.agent              = false;*/
	console.log("Ip Address" + prot + options.host +  options.port +options.path);
    var req = prot.request(options, function(res)
    {
        var output = '';
        console.log(options.host + ':' + res.statusCode);
		 if(res.statusCode == 302 || res.statusCode == 400){
			var obj = '';
			onResult(res.statusCode, obj,res.headers);
		}
		else {
			res.setEncoding('utf8');
				res.on('data', function (chunk) {
					//console.log("Chunk:"+chunk);
					output += chunk;
				});

				res.on('end', function() {
					// console.log('on end: ' + output);
					var obj = eval("(" + output + ")");
					onResult(res.statusCode, obj,res.headers);
				});
		}
    });

    req.on('error', function(err) {
        console.log('rest error: ' + err.message);
        onResult(302, null,null);
    });

    req.write(data);
	req.end();
};

/**
 * deleteJSON: send a delete REST request with an id to delete
 *
 * @param options: http server options object
 * @param itemId: item id to delete
 * @param callback: callback to pass the results JSON object(s) back
 */
exports.deleteJSON = function(options, itemId, onResult)
{
    console.log("rest::deleteJSON");

    var prot = options.port == 8080 ? http : https;
    var req = prot.request(options, function(res)
    {
        var output = '';
        console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
			console.log("On Data:"+output);
        });

        res.on('end', function() {
			console.log("On End");
            var obj = eval("(" + output + ")");
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
		console.log('rest error: ' + err.message)
        onResult(302, null,null);
    });

    req.end();
};

/*To extract JSESSIONID*/
exports.get_cookies = function(cookieheader) {
	var cookies = {};
	cookieheader.split(';').forEach(function(cookie) {
		var parts = cookie.match(/(.*?)=(.*)$/)
		//console.log("*****************"+parts);
		if(parts!=null)
			cookies[ parts[1].trim() ] = (parts[2] || '').trim();
	});
	return cookies;
};


exports.readCookie = function(name)
{
     var nameEQ = name + "=";
     var ca = nameEQ.split(';');
     for(var i=0;i < ca.length;i++)
     {
          var c = ca[i];
          while (c.charAt(0)==' ') c = c.substring(1,c.length);
          if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
     }
     return null;
}

