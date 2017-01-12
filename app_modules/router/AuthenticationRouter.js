var crypto = require('crypto');
module.exports = authentication;
var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var props = require(path.join(rootPath,"properties.json"));
var AuthenticationModel = require(path.join(rootPath,"app_modules/model/AuthenticationModel"));

var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('AuthenticationRouter.js');


function authentication(constants) {
    customlog.debug("Inside Router");
    this.model = new AuthenticationModel(constants);
    this.constants = constants;
}

authentication.prototype = {
    loginPage: function(req, res) {
        var self = this;
        var ua = req.headers['user-agent'].toLowerCase();
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(ua)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4))) {
            req.session.browser = "mobile";
        }
        else {
            req.session.browser = "system";
        }
        self.showLoginPage(req,res);
    },
    showLoginPage: function(req,res) {
        if(req.session.browser == "mobile") {
            res.render('Mobile/LoginMobile', { errorMessage: '', contextPath:props.contextPath});
        }
        else {
            res.render('login', { errorMessage: '', contextPath:props.contextPath});
        }
    },
    authLogin: function(req, res) {
        var self = this;
        console.log("inside "+props.contextPath+'/client/ci/auth');
        try{
            customlog.info("Inside Router authLogin");
            var userName = req.body.userName;
            var password = req.body.password;
            if(userName == "" || password == ""){
                res.render('login', { errorMessage: 'Please fill the User Credentials', contextPath:props.contextPath, loginDiv:'', forgotPasswordDiv:'hideContent'});
            }else if(userName.indexOf("'") > 0 || password.indexOf("'") > 0 || userName.indexOf(",") > 0 || password.indexOf(",") > 0 ||
                userName.indexOf(".") > 0 || password.indexOf(".") > 0 || userName.indexOf("/") > 0 || password.indexOf("/,") > 0 || userName.indexOf('"') > 0 || password.indexOf('"') > 0 ){
                res.render('login', { errorMessage: 'Please Specify correct user credentials', contextPath:props.contextPath, loginDiv:'', forgotPasswordDiv:'hideContent'});
            }else{
                password = self.encrypt(password,userName);
                self.authLoginPage(userName,password,function(resultObj,menuObj){
                    self.showHomePage(req,res,resultObj,menuObj);
                });
            }
        }catch(e){
            customlog.error("Exception While Auth login "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    showHomePage: function(req,res,resultObj,menuObj) {
        try{
            var self =  this;
            var constantsObj = this.constants;
            var roleIdsArray = new Array();
            if(resultObj == null || resultObj.length == 0 || resultObj[0].user_name == "" || menuObj.length == 0 ) {
                if(req.session.browser == "mobile") {
                    res.render('Mobile/LoginMobile', { errorMessage: 'Invalid UserName/Password', contextPath:props.contextPath});
                }
                else {
                    res.render('login', { errorMessage: 'Invalid UserName/Password', contextPath:props.contextPath});
                }
            }
            else {
                for(var i=0;i< resultObj.length;i++){
                    roleIdsArray[i]= resultObj[i].role_id;
                }
                if(resultObj[0].role_id == constantsObj.getDEOroleId()&&roleIdsArray.length==1){
                    req.session.tenantId = resultObj[0].tenant_id;
                    req.session.userId = resultObj[0].user_id;
                    req.session.officeId = resultObj[0].office_id;
                    req.session.roleId = resultObj[0].role_id;
                    req.session.roleIds = roleIdsArray;
                    req.session.userName = resultObj[0].user_name;
                    req.session.userContactNumber = resultObj[0].contact_number;
                    req.session.roleName = resultObj[0].role_name;
                    req.session.roleDescription = resultObj[0].role_description;
                    req.session.access_type_description = resultObj[0].access_type_description;
                    req.session.access_type_id = resultObj[0].access_type_id;
                    req.session.language = resultObj[0].doc_language;
                    req.session.menuId = menuObj[0].menu_id;
                    req.session.menuName = menuObj[0].menu_name;
                    req.session.menuImgLocation = menuObj[0].img_location;
                    req.session.menuUrl = menuObj[0].menu_url;
                    req.session.passwordChanged = resultObj[0].password_changed;
                    req.session.bcOfficeId = resultObj[0].bc_office_id;
                    res.redirect(props.contextPath+'/client/ci/empty');
                }else{
                    var userName = req.body.userName;
                    var password = req.body.password;
                    var rest = require("./rest.js");
                    var roleArray = new Array();
                    var inpdata = JSON.stringify({
                        username : userName,
                        password : password});


                    var http = require('http');
                    var https = require('https');

                    var postheaders = {
                        'Content-Type' : 'application/json',
                        'Content-Length' : Buffer.byteLength(inpdata, 'utf8')
                    };

                    var options = {
                        host: mifosServiceIP,
                        port: mifosPort,
                        path: '/mfi/j_spring_security_check?j_username='+userName+'&j_password='+password+'&spring-security-redirect=/sam/auth.json',
                        method: 'POST',
                        headers : postheaders
                    };
                    var cookie = new Array();
                    rest.postJSON(options,inpdata,function(statuscode,result,headers) {
                        /*[Added by Ramya Baskar(ramy1746)] [This is used to extract the JSESSIONID from the header]*/

                        if(statuscode == 302) {
                            res.redirect(props.contextPath+'/client/ci/logout');
                        }
                        else if(result.status == "success"){
                            cookie = headers['set-cookie'];
                            var jsessionid = rest.get_cookies(cookie[0])['JSESSIONID'];
                            for(var j=0;j<result.grantedAuthority.length;j++){
                                roleArray[j] = result.grantedAuthority[j].role;
                            }
                            req.session.roleArray = roleArray;
                            req.session.mifosCookie = "JSESSIONID="+jsessionid;

                            /*This is for IKLANT*/

                            req.session.tenantId = resultObj[0].tenant_id;
                            req.session.userId = resultObj[0].user_id;
                            req.session.officeId = resultObj[0].office_id;
                            req.session.roleId = resultObj[0].role_id;
                            req.session.roleIds = roleIdsArray;
                            req.session.userName = resultObj[0].user_name;
                            req.session.userContactNumber = resultObj[0].contact_number;
                            req.session.roleName = resultObj[0].role_name;
                            req.session.roleDescription = resultObj[0].role_description;
                            req.session.access_type_description = resultObj[0].access_type_description;
                            req.session.access_type_id = resultObj[0].access_type_id;
                            req.session.mifosLoanOfficerId = result.activityDto.userId;
                            req.session.language = resultObj[0].doc_language;
                            var userName = req.session.userName;
                            var roleId = req.session.roleId;
                            var roleIds = req.session.roleIds;
                            req.session.menuId = menuObj[0].menu_id;
                            req.session.menuName = menuObj[0].menu_name;
                            req.session.menuImgLocation = menuObj[0].img_location;
                            req.session.menuUrl = menuObj[0].menu_url;
                            req.session.passwordChanged = resultObj[0].password_changed;
                            req.session.bcOfficeId = resultObj[0].bc_office_id;
                            customlog.info("userName : "+req.session.userName);
                            customlog.info("roleName : "+req.session.roleName);
                            customlog.info("roleIds : "+roleId);
                            customlog.info("Login Date and Time : "+ new Date());
                            if(req.session.fromAndroid == true){
                                self.retrieveLoanRecoveryPaymentDetails(req,res);
                            }else{
                                if(req.session.browser == "mobile") {
                                    res.render('Mobile/MenuMobile', {userName:userName, roleId:roleId, constantsObj:constantsObj, contextPath:props.contextPath});
                                }else{
                                    res.redirect(props.contextPath+'/client/ci/empty');
                                }
                            }
                        } else {
                            res.render('login', { errorMessage: result.errMessage, contextPath:props.contextPath});
                        }
                    });
                }
            }
        }catch(e){
            customlog.error("Exception while Show home page "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    showMenu: function(req,res) {
        var constantsObj = this.constants;
        var userName = req.session.userName;
        var roleId = req.session.roleId;
        var roleIds = req.session.roleIds;
        var menuId = req.session.menuId;
        if(req.session.browser == "mobile") {
            res.render('Mobile/MenuMobile', {userName:userName, roleId:roleId, constantsObj:constantsObj, contextPath:props.contextPath,roleIds:roleIds,menuId:menuId});
        }
        else {
            res.render('empty');
        }
    },
    getMenu: function (req, res) {
        var self = this;
        try{
            customlog.info("Inside Router getMenu");
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var menuId = req.session.menuId;
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                self.showMenuPage(req,res);
            }
        }catch(e){
            customlog.error("Exception while Get Menu ",e);
            self.commonRouter.showErrorPage(req,res);
        }
    },

    encrypt: function(text,password){
        var cipher = crypto.createCipher('aes-256-ctr', password)
        var crypted = cipher.update(text, 'utf8', 'hex')
        crypted += cipher.final('hex');
        return crypted;
    },
    authLoginPage: function(userName,password,callback) {
        this.model.authLoginModel(userName,password,callback);
    },
    showMenuPage: function(req,res) {
        var self = this;
        var constantsObj = this.constants;
        var userName = req.session.userName;
        var userId = req.session.userId;
        var roleId = req.session.roleId;
        var roleIds = req.session.roleIds;
        var menuId = req.session.menuId;
        var menuName = req.session.menuName;
        var menuImgLocation = req.session.menuImgLocation;
        var menuUrl = req.session.menuUrl;
        var passwordChanged = req.session.passwordChanged;
        console.log(menuId);
        var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "authenticationRouter.js", "showMenuPage", "success", "showMenuPage", "User "+ req.session.userName +" User Id [" + req.session.userId +"] Logged in successfully","insert");
        self.commonRouter.insertActivityLogModel(activityDetails);
        if(req.session.browser == "mobile") {
            res.render('Mobile/MenuMobile', {userName:userName, roleId:roleId, constantsObj:constantsObj, contextPath:props.contextPath});
        }
        else {
            if(passwordChanged == 0){
                res.render('user_management/changePassword',{contextPath:props.contextPath,userId:userId,userName:userName,errorMessage:"",passwordChanged:passwordChanged});
            }else{

                res.render('menu', {userName:userName, roleId:roleId, constantsObj:constantsObj,officeId:req.session.officeId, contextPath:props.contextPath,roleIds:roleIds,menuId:menuId,menuName:menuName,menuImgLocation:menuImgLocation,menuUrl:menuUrl});
            }
        }
    },
    logoutPage: function(req, res) {
        var self = this;


        /*req.session.branches = null;
         req.session.statusIdArray = null;
         req.session.statusNameArray = null;
         req.session.officeName = null;
         req.session.operationName = null;
         req.session.operationId = null;
         req.session.tenantId = null;
         req.session.userId = null;
         req.session.officeId = null;
         req.session.userName = null;
         req.session.roleId = null;
         req.session.roleName = null;
         req.session.roleDescription = null;
         req.session.mifosCookie = null;
         req.session.roleArray = null;
         req.session.fromAndroid = null;
         req.session.glCodeId = null;
         req.session.glCode   = null;
         req.session.userContactNumber = null;
         req.session.recurrenceType = null;
         req.session.limit = null;
         req.session.actualPOS = null;
         req.session.rptdate = null;
         req.session.actualPOD = null;
         req.session.daysInArrears = null;

         res.clearCookie('recurrenceType');
         res.clearCookie('limit');
         res.clearCookie('actualPOS');
         res.clearCookie('rptdate');
         res.clearCookie('actualPOD');
         res.clearCookie('daysInArrears');
         res.clearCookie('branches');
         res.clearCookie('roleArray');
         res.clearCookie('statusIdArray');
         res.clearCookie('statusNameArray');
         res.clearCookie('officeName');
         res.clearCookie('operationName');
         res.clearCookie('operationId');
         res.clearCookie('tenantId');
         res.clearCookie('userId');
         res.clearCookie('officeId');
         res.clearCookie('userName');
         res.clearCookie('roleId');
         res.clearCookie('roleName');
         res.clearCookie('roleDescription');
         res.clearCookie('userContactNumber'); */
        if(typeof req.session.userId != "undefined") {
            var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "authenticationRouter.js", "showMenuPage", "success", "showMenuPage", "User "+ req.session.userName +" User Id [" + req.session.userId +"] Logged out successfully","insert");
            self.commonRouter.insertActivityLogModel(activityDetails);

            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

            req.session.destroy(function() {
                res.redirect(props.contextPath+'/client/ci/login');
            });
        }
        else{
            res.redirect(props.contextPath+'/client/ci/login');
        }
    }
}