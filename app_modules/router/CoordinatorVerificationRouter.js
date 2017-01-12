module.exports = coordinatorVerification;
var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var props = require(path.join(rootPath,"properties.json"));
mifosServiceIP = props.mifosServiceIp;
mifosPort = props.mifosPort;
GPSPort = props.GPSPort;
iklantPort = props.iklantPort;
var fs = require('fs');

var commonDTO = path.join(rootPath,"app_modules/dto/common");

var customlog = new require(path.join(rootPath,"logger/loggerConfig.js"))('CoordinatorVerificationRouter.js');
var CoordinatorVerificationModel = require(path.join(rootPath,"app_modules/model/CoordinatorVerificationModel"));
var dateUtils = require(path.join(rootPath,'app_modules/utils/DateUtils'));
var PDFDocument = require('pdfkit');

function coordinatorVerification(constants) {
    customlog.debug("Inside Router");
    this.model = new CoordinatorVerificationModel(constants);
    this.constants = constants;
}

coordinatorVerification.prototype = {


    getFreshGroupsForVerifcation : function(req,res){

        var self = this;
        var tenantId = req.session.tenantId;
        var userId = req.session.userId;
        var constantsObj = this.constants;
        var reqOfficeId = req.body.listofficeName;
        var officeIdList = new Array();
        var officeNameList = new Array();
        var roleId = req.session.roleId;
        if(typeof tenantId == 'undefined' || typeof userId == 'undefined') {
            res.redirect(props.contextPath+'/client/ci/login');
        }
        else {
            var roleId = req.session.roleId;
            var officeId = req.session.officeId;
            console.log("officeId : " + officeId);
            var requestedTab = req.body.requestedTab;
            console.log("reqOfficeId : " + reqOfficeId);
            if (typeof reqOfficeId == 'undefined' || reqOfficeId == '') {
                reqOfficeId = req.session.officeId;
            }
            if (typeof requestedTab == 'undefined' || requestedTab == '') {
                requestedTab = req.params.requestedTab;
            }
            req.session.requestedTab = requestedTab;
            var jadeName = requestedTab == 1 ? 'coordinator_verification/freshGroups' : requestedTab == 2 ? 'coordinator_verification/imageRecapturedList' : requestedTab == 4 ? 'coordinator_verification/imagesRejectedByDEO' : 'coordinator_verification/inFoQueueToRecapture';
                userId = (roleId == constantsObj.getSMHroleId() || roleId == constantsObj.getBMroleId() || roleId == constantsObj.getAccountsExecutiveRoleId() || roleId == constantsObj.getAMHroleId()) ? req.session.userId : -1;
                var constantsObj = this.constants;
                self.commonRouter.retriveOfficeCall(tenantId, userId, function (officeIdArray, officeNameArray, officeAddressArray, officeShortNameArray) {
                    officeIdList = officeIdArray;
                    officeNameList = officeNameArray;
                    self.model.getGroupsForKYCVerificationModel(tenantId,userId,roleId,reqOfficeId,requestedTab,function(groupsForKYCVerification){
                        res.render(jadeName, {
                            contextPath: props.contextPath,
                            constantsObj: constantsObj,
                            officeValue: officeId,
                            officeIdList: officeIdList,
                            officeNameList: officeNameList,
                            groupsForKYCVerification : groupsForKYCVerification,
                            selectedOfficeId : 0,
                            roleId : roleId
                        });
                    });
                });

                //reqOfficeId = (roleId == constantsObj.getSMHroleId()) ? (typeof req.body.listoffice == 'undefined') ? -1 : req.body.listoffice : (req.session.officeId == constantsObj.getApexHeadOffice()) ? -1 : req.session.officeId;
        }
            //userId = (roleId == constantsObj.getSMHroleId()) ? -1 : req.session.userId;
        },

        getGroupsForVerifcation : function(req,res){
            console.log(" Inside getGroupsForVerifcation ") ;
            var self = this;
            var reqOfficeId = req.params.officeId;
            var officeId = req.session.officeId;
            var tenantId = req.session.tenantId;
            var constantsObj = this.constants;
            var userId = req.session.userId;
            var roleId = req.session.roleId;
            /*
                // requestedTab = undefined = freshGroups
                // requestedTab = 1 = freshGroups
                // requestedTab = 2 = RecapturedByFO
                // requestedTab = 3 = IN FO QUEUE
                // requestedTab = 4 = Images Rejected By DEO
            */
            var requestedTab = req.body.requestedTab;
            console.log("reqOfficeId : " + reqOfficeId);
            if (typeof reqOfficeId == 'undefined' || reqOfficeId == '') {
                reqOfficeId = req.session.officeId;
            }
            if (typeof requestedTab == 'undefined' || requestedTab == '') {
               if(typeof req.session.requestedTab == 'undefined') {
                 requestedTab = 1;
                 req.session.requestedTab = requestedTab;
               }else {
                   requestedTab = req.session.requestedTab;
               }
            }
            var jadeName = requestedTab == 1 ? 'coordinator_verification/freshGroups' : requestedTab == 2 ? 'coordinator_verification/imageRecapturedList' : requestedTab == 4 ? 'coordinator_verification/imagesRejectedByDEO' : 'coordinator_verification/inFoQueueToRecapture';
            userId = (roleId == constantsObj.getSMHroleId() || roleId == constantsObj.getBMroleId() || roleId == constantsObj.getAccountsExecutiveRoleId() || roleId == constantsObj.getAMHroleId()) ? req.session.userId : -1;
            console.log("reqOfficeIdddd : " + reqOfficeId);
            self.commonRouter.retriveOfficeCall(tenantId, userId, function (officeIdArray, officeNameArray, officeAddressArray, officeShortNameArray) {
                officeIdList = officeIdArray;
                officeNameList = officeNameArray;
                self.model.getGroupsForKYCVerificationModel(tenantId,userId,roleId,reqOfficeId,requestedTab,function(groupsForKYCVerification){
                    console.log(groupsForKYCVerification);
                    res.render(jadeName, {
                        contextPath: props.contextPath,
                        constantsObj: constantsObj,
                        officeValue: officeId,
                        officeIdList: officeIdList,
                        officeNameList: officeNameList,
                        groupsForKYCVerification : groupsForKYCVerification,
                        selectedOfficeId : reqOfficeId,
                        roleId : roleId
                    });
                });
            });


        },

    getClientListForKYCrVerifcation : function(req,res){
        var self = this;
        var officeId = req.body.listofficeName;
        var tenantId = req.session.tenantId;
        var constantsObj = this.constants;
        var userId = req.session.userId;
        var roleId = req.session.roleId;
        var groupId = req.params.groupId;
        var screenFlag = req.params.screenFlag;

        if(typeof officeId == 'undefined' || officeId == '' || officeId == '0'){
            officeId = req.session.officeId;
        }


        self.model.getClientListForKYCVerifcationModel(groupId,function(clientsForKYCVerification){
            res.render('coordinator_verification/KYCVerification', {
                contextPath: props.contextPath,
                constantsObj: constantsObj,
                clientsForKYCVerification: clientsForKYCVerification,
                officeValue: officeId,
                screenFlag : screenFlag,
                roleId : roleId
            });

        });
    },

    getKYCDocumentsForClient : function(req,res){

        console.log("Inside getKYCDocumentsForClient");

        var self = this;
        var officeId = req.session.officeId;
        var tenantId = req.session.tenantId;
        var constantsObj = this.constants;
        var userId = req.session.userId;
        var roleId = req.session.roleId;
        var clientId = req.body.clientId;
        var documentId = req.body.documentId;
        console.log("clientId " +  clientId);
        console.log("documentId " +  documentId);
        self.model.getKYCDocumentsForClientModel(clientId,documentId,function(clientKYCDocumentsForVerification){
            req.body.documentId = documentId;
            req.body.clientId = clientId;
            req.body.clientKYCDocumentsForVerification = clientKYCDocumentsForVerification;
            req.body.status = "success";
            res.send(req.body);
        });
    },

    getResolvedKYCDocuments : function(req,res){

        console.log("Inside getKYCDocumentsForClient");

        var self = this;
        var officeId = req.session.officeId;
        var tenantId = req.session.tenantId;
        var constantsObj = this.constants;
        var userId = req.session.userId;
        var roleId = req.session.roleId;
        var clientId = req.body.clientId;
        console.log("clientId " +  clientId);
        self.model.getResolvedKYCDocumentsModel(clientId,function(clientKYCDocumentsForVerification){


            if(clientKYCDocumentsForVerification.docIdList.length !=0 ) {
            var neededImageClarityDocs = clientKYCDocumentsForVerification.neededImageClarityDocs[0].split(",");
                console.log(neededImageClarityDocs);
            }
            console.log(clientKYCDocumentsForVerification.deoRemarks);
            req.body.clientId = clientId;
            req.body.clientKYCDocumentsForVerification = clientKYCDocumentsForVerification;
            req.body.status = "success";
            req.body.neededImageClarityDocs = neededImageClarityDocs;
            res.send(req.body);
        });
    },

    updateVerificationClientStatus : function(req,res){

        var self = this;
        var officeId = req.session.officeId;
        var tenantId = req.session.tenantId;
        var constantsObj = this.constants;
        var userId = req.session.userId;
        var roleId = req.session.roleId;

        var clientId = req.body.clientId;
        var groupId = req.body.groupId;
        var rejectedDocs = req.body.rejectedDocs;
        var rejectedDocsRemarks = req.body.rejectedDocsRemarks;

        self.model.updateVerificationClientStatusModel(userId,clientId,rejectedDocs,rejectedDocsRemarks,groupId,function(successMessage){

            req.body.status = "success";
            req.body.successMessage = successMessage;
            res.send(req.body);

        });

    },

    groupCountDashBoard : function(req,res) {

        var self = this;
        var officeId = req.session.officeId;
        var tenantId = req.session.tenantId;
        var constantsObj = this.constants;
        var userId = req.session.userId;
        var roleId = req.session.roleId;

        self.model.groupCountDashBoardModel(officeId,roleId,function(groupCountDashBoardForVerification){

            res.render('coordinator_verification/VerificationGroupCountDashboard', {
                contextPath: props.contextPath,
                constantsObj: constantsObj,
                roleId : roleId,
                groupCountDashBoardForVerification : groupCountDashBoardForVerification
            });

        });
    }

};
