module.exports = loanDisbursement;
var path = require('path');
var rootPath = path.dirname(process.mainModule.filename);
var props = require(path.join(rootPath,"properties.json"));
mifosServiceIP = props.mifosServiceIp;
mifosPort = props.mifosPort;
GPSPort = props.GPSPort;
iklantPort = props.iklantPort;
var loanDisbursementDTOpath = path.join(rootPath,"app_modules/dto/loan_disbursement");
var commonDTO = path.join(rootPath,"app_modules/dto/common");
var dateUtils = require(path.join(rootPath,'app_modules/utils/DateUtils'));
var SmsConstants = require(path.join(rootPath,"app_modules/dto/sms/SmsConstants"));
var rest = require("./rest.js");
var http = require('http');
var https = require('https');

var LoanDisbursementModel = require(path.join(rootPath,"app_modules/model/LoanDisbursementModel"));

var customlog = require(path.join(rootPath,"logger/loggerConfig.js"))('LoanDisbursementRouter.js');


function loanDisbursement(constants) {
    customlog.debug("Inside Router");
    this.model = new LoanDisbursementModel(constants);
    this.constants = constants;
}

loanDisbursement.prototype = {
    //Retrive Client Details From Mifos
    retrieveClientsFromService : function(req,res) {
        try{
            var self = this;
            var constantsObj = this.constants;
            customlog.info('Inside retrieveClientsFromService');

            customlog.info("req.session.mifosCookie" + req.session.mifosCookie);
            var mifosCustomerId = req.params.mifosCustomerId;
            var iklantGroupId = req.params.id;
            var isSynchronized = req.params.isSynchronized;
            customlog.info("mifosCustomerId" + mifosCustomerId);
            customlog.info("iklantGroupId" + iklantGroupId);
            req.session.iklantGroupId = iklantGroupId;
            var inpdata = JSON.stringify({ });
            var postheaders = {
                'Content-Type' : 'application/json',
                'Cookie' : req.session.mifosCookie
            };

            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: '/mfi/api/account/loan/offering/loanproducts/cust-'+mifosCustomerId+'.json',
                method: 'GET',
                headers : postheaders
            };
            self.commonRouter.retrieveClientDetailsForGeneratePDF(mifosCustomerId,"",function(clientdetails,groupcode) {
                customlog.info("groupCode" + groupcode);
                var loanForm = "/GeneratedPDF/"+groupcode+"_loanform.pdf";
                var kycform = "/GeneratedPDF/"+groupcode+"_KYCform.pdf";
                var legalForm = "/GeneratedPDF/"+mifosCustomerId+"_legalform.pdf";
                var promissoryNote = "/GeneratedPDF/"+mifosCustomerId+"_promissoryNote.pdf";
                var installmentSchedule = "/GeneratedPDF/"+mifosCustomerId+"_loanRepaymentSchedule.pdf";
                var receiptForm = "/GeneratedPDF/"+mifosCustomerId+"_receiptForm.pdf";

                rest.getJSON(options,function(statuscode,result,headers) {
                    var productCategoryId = new Array();
                    var productCategoryName = new Array();

                    customlog.info("statuscode" + statuscode);
                    customlog.info("result" + result);
                    customlog.info("headers" + headers);
                    if(statuscode == 302){
                        res.redirect(props.contextPath+'/client/ci/showPageExpired');
                    }
                    else if(result.status == "success") {
                        var loanOffering = require(loanDisbursementDTOpath +"/loanOffering");
                        var loanOfferingObjLocal = new loanOffering();
                        var sanctionLoanHolder = require(loanDisbursementDTOpath +"/sanctionLoanHolder");
                        var SanctionLoanHolderLocal = new sanctionLoanHolder();
                        if(typeof result.loanCreationProductDetailsDto == 'undefined' || result == ''){
                            self.showErrorPage(req,res);
                        }
                        else if(result.status == "success") {
                            //var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "retrieveClientsFromService", "success", "Loan Sanction Form", "retrieveClientsFromService");
                            //self.model.insertActivityLogModel(activityDetails);
                            if(result.loanCreationProductDetailsDto.loanProductDtos != null) {
                                for(var i=0;i<result.loanCreationProductDetailsDto.loanProductDtos.length;i++){
                                    productCategoryId[i] = result.loanCreationProductDetailsDto.loanProductDtos[i].prdOfferingId;
                                    productCategoryName[i] = result.loanCreationProductDetailsDto.loanProductDtos[i].prdOfferingName;
                                }
                            }
                            loanOfferingObjLocal.setProductCategoryIdList(productCategoryId);
                            loanOfferingObjLocal.setProductCategoryNameList(productCategoryName);
                            loanOfferingObjLocal.setCenterName(result.loanCreationProductDetailsDto.customerDetailDto.displayName);
                            loanOfferingObjLocal.setCustomerId(result.loanCreationProductDetailsDto.customerDetailDto.customerId);
                            loanOfferingObjLocal.setGlobalAccountNum(result.loanCreationProductDetailsDto.customerDetailDto.globalCustNum);

                            res.render('loan_disbursement/LoanSanctionForm', {loanOfferingObjLocal:loanOfferingObjLocal,
                                SanctionLoanHolderLocal:SanctionLoanHolderLocal, groupcode:groupcode,
                                loanForm:loanForm, kycform:kycform, legalForm:legalForm,promissoryNote:promissoryNote,receiptForm:receiptForm,constantsObj:constantsObj,
                                iklantGroupId:iklantGroupId,isSynchronized:isSynchronized,activeClientName:"",activeClientId:"",installmentSchedule:installmentSchedule, contextPath:props.contextPath,roleId:req.session.roleId});

                        }else{
                            self.commonRouter.showErrorPage(req,res);
                        }
                    } else {
                        self.commonRouter.showErrorPage(req,res);
                    }
                });
            });
        }catch(e){
            customlog.error("Exception while retrieveClientsFromService "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    retrieveGroupInformation : function(req,res) {
        try{
            var self = this;
            var memberIdArray = new Array();
            var memberNameArray = new Array();
            var memberActiveLoansArray = new Array();
            var memberOverdueArray = new Array();
            var memberOutstandingArray = new Array();
            var productCategoryId = new Array();
            var productCategoryName = new Array();
            var activeClientId = new Array();
            var activeClientName = new Array();
            var activeClientIdArray = new Array();
            customlog.info('Inside retrieveGroupInformation');
            customlog.info("req.session.mifosCookie" + req.session.mifosCookie);
            var mifosCustomerId = req.params.mifosCustomerId;
            var loanProductId = req.params.loanProductId;
            var iklantGroupId = req.params.iklantGroupId;
            customlog.info("mifosCustomerId" + mifosCustomerId);
            customlog.info("loanProductId" + loanProductId);
            customlog.info("Office " + req.session.officeId);

            var postheaders = {
                'Content-Type' : 'application/json',
                'Cookie' : req.session.mifosCookie
            };
            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: '/mfi/api/account/loan/offering/loanCreationDetails/cust-'+mifosCustomerId+'/prd-'+loanProductId+'.json',
                method: 'GET',
                headers : postheaders
            };
            rest.getJSON(options,function(statuscode,result,headers){

                customlog.info("statuscode" + statuscode);
                var loanOfferingObj = require(loanDisbursementDTOpath +"/loanOffering");
                var loanOfferingObjLocal = new loanOfferingObj();
                var sanctionLoanHolder = require(loanDisbursementDTOpath +"/sanctionLoanHolder");
                var SanctionLoanHolderLocal = new sanctionLoanHolder();
                var glCodesDTO = require(commonDTO +"/glcodes");
                var glCodes = new glCodesDTO();
                var feesId 			= new Array();
                var feesName 		= new Array();
                var isAMountOrRatio = new Array();
                var amountOrRatio	 = new Array();
                var k=0;
                if(statuscode == 302){
                    self.showErrorPage(req,res);
                }
                else if(result.status == "success") {
                    // Added by Chitra [Documents shouldn't generated for rejected clients]
                    self.getActiveClientDetailsByIklantGroupIdCall(iklantGroupId,function(client_details,iklantClientName,iklantClientChoice,clientMobileNumbers,clientLandLineNumbers,mifosCustomerId,clientIds){
                        //Added by Sathish Kumar M #008 for Same client name loan sanction error
                        if(client_details.length != 0) {
                            for(var i=0;i<client_details.length;i++){
                                activeClientId[i] = client_details[i].client_id;
                                activeClientName[i] = client_details[i].client_name;
                            }
                        }

                        SanctionLoanHolderLocal.setGlimApplicable(result.loanSanctionDetails.glimApplicable);
                        SanctionLoanHolderLocal.setLocale(result.loanSanctionDetails.locale);
                        SanctionLoanHolderLocal.setMonthlyDayOfMonthOptionSelected(result.loanSanctionDetails.monthlyDayOfMonthOptionSelected);
                        SanctionLoanHolderLocal.setRepaymentScheduleIndependentOfCustomerMeeting(result.loanSanctionDetails.repaymentScheduleIndependentOfCustomerMeeting);
                        SanctionLoanHolderLocal.setDigitsBeforeDecimalForInterest(result.loanSanctionDetails.digitsBeforeDecimalForInterest);
                        SanctionLoanHolderLocal.setDigitsAfterDecimalForInterest(result.loanSanctionDetails.digitsAfterDecimalForInterest);
                        SanctionLoanHolderLocal.setDigitsBeforeDecimalForMonetaryAmounts(result.loanSanctionDetails.digitsBeforeDecimalForMonetaryAmounts);
                        SanctionLoanHolderLocal.setDigitsAfterDecimalForMonetaryAmounts(result.loanSanctionDetails.digitsAfterDecimalForMonetaryAmounts);
                        SanctionLoanHolderLocal.setVoucherNumberIfBank(result.loanSanctionDetails.voucherNumberIfBank);
                        SanctionLoanHolderLocal.setVoucherNumberIfCash(result.loanSanctionDetails.voucherNumberIfCash);
                        for (var key in result.loanSanctionDetails.additionalFees) {
                            customlog.info("Fees Key: " + key);
                            customlog.info("Fees Value: " + result.loanSanctionDetails.additionalFees[key].id);

                            customlog.info("rateBasedFee: " + result.loanSanctionDetails.additionalFees[key].rateBasedFee);
                            //if(result.loanSanctionDetails.additionalFees[key].id != 2){
                            //customlog.info("ID" + result.loanSanctionDetails.additionalFees[key].id + "\n");
                            feesId[k] = result.loanSanctionDetails.additionalFees[key].id;
                            //customlog.info("name" + result.loanSanctionDetails.additionalFees[key].name + "\n");
                            feesName[k] = result.loanSanctionDetails.additionalFees[key].name;
                            //customlog.info("rateBasedFee" + result.loanSanctionDetails.additionalFees[key].rateBasedFee + "\n");
                            isAMountOrRatio[k] = result.loanSanctionDetails.additionalFees[key].rateBasedFee;
                            if(result.loanSanctionDetails.additionalFees[key].rateBasedFee){
                                //customlog.info("Rate" + result.loanSanctionDetails.additionalFees[key].rate  + "\n");
                                amountOrRatio[k] = result.loanSanctionDetails.additionalFees[key].rate;
                            }else{
                                //customlog.info("Amount" + result.loanSanctionDetails.additionalFees[key].amount  + "\n");
                                amountOrRatio[k] = result.loanSanctionDetails.additionalFees[key].amount;
                            }
                            k++;
                            //}
                        }
                        SanctionLoanHolderLocal.setFeesId(feesId);
                        SanctionLoanHolderLocal.setFeesName(feesName);
                        SanctionLoanHolderLocal.setIsAMountOrRatio(isAMountOrRatio);
                        SanctionLoanHolderLocal.setAmountOrRatio(amountOrRatio);

                        if(result.loanCreationDetails.loanProductDtos != null) {
                            for(var i=0;i<result.loanCreationDetails.loanProductDtos.length;i++){
                                productCategoryId[i] = result.loanCreationDetails.loanProductDtos[i].prdOfferingId;
                                productCategoryName[i] = result.loanCreationDetails.loanProductDtos[i].prdOfferingName;
                            }
                        }

                        customlog.info("productCategoryId" +productCategoryId);
                        customlog.info("productCategoryName" + productCategoryName);

                        loanOfferingObjLocal.setProductCategoryIdList(productCategoryId);
                        loanOfferingObjLocal.setProductCategoryNameList(productCategoryName);
                        loanOfferingObjLocal.setCenterName(result.loanCreationDetails.customerDetailDto.displayName);
                        loanOfferingObjLocal.setCustomerId(result.loanCreationDetails.customerDetailDto.customerId);


                        customlog.info("Individual Tracked" + result.loanSanctionDetails.individualTracked + "\n");
                        SanctionLoanHolderLocal.setIndividualTracked(result.loanSanctionDetails.individualTracked);
                        var minMax= "allowed : " + result.loanSanctionDetails.minAllowedAmount + "-" + result.loanSanctionDetails.maxAllowedAmount;
                        customlog.info("MIN Loan Amount" + result.loanSanctionDetails.minAllowedAmount + "\n");
                        customlog.info("MAX Loan Amount" + result.loanSanctionDetails.maxAllowedAmount + "\n");
                        customlog.info("minMax" +minMax);
                        SanctionLoanHolderLocal.setMinMaxAmount(minMax);

                        SanctionLoanHolderLocal.setInterestRate(result.loanSanctionDetails.interestRate);
                        SanctionLoanHolderLocal.setMinAllowedInterestRate(result.loanSanctionDetails.minAllowedInterestRate);
                        SanctionLoanHolderLocal.setMaxAllowedInterestRate(result.loanSanctionDetails.maxAllowedInterestRate);

                        SanctionLoanHolderLocal.setNumberOfInstallments(result.loanSanctionDetails.numberOfInstallments);
                        SanctionLoanHolderLocal.setMinNumberOfInstallments(result.loanSanctionDetails.minNumberOfInstallments);
                        SanctionLoanHolderLocal.setMaxNumberOfInstallments(result.loanSanctionDetails.maxNumberOfInstallments);
                        var clientInsuredLocal = new Array();
                        var clientLoanPurposeId = new Array();
                        if(result.loanCreationDetails.clientDetails != null) {
                            for(var i=0;i<activeClientName.length;i++){
                                for(var index=0;index<result.loanCreationDetails.clientDetails.length;index++){
                                    if((activeClientName [i]).replace(/ /g,'')  == (result.loanCreationDetails.clientDetails[index].clientWithGuarantorName).replace(/ /g,'')){
                                        activeClientIdArray [i] =  activeClientId[i];
                                        memberIdArray[i] = result.loanCreationDetails.clientDetails[index].clientId;
                                        memberNameArray[i] = result.loanCreationDetails.clientDetails[index].clientName;
                                        clientInsuredLocal[i] = result.loanCreationDetails.clientDetails[index].insured;
                                        memberActiveLoansArray[i] = result.loanCreationDetails.clientDetails[index].noOfActiveLoans;
                                        memberOverdueArray[i] = result.loanCreationDetails.clientDetails[index].overdueAmount;
                                        memberOutstandingArray[i] = result.loanCreationDetails.clientDetails[index].outstandingAmount;
                                        if (iklantClientName.indexOf(memberNameArray[i]) > -1) {
                                            for (var j = 0; j < iklantClientChoice.length; j++) {
                                                if(iklantClientName[j] == memberNameArray[i]) {
                                                    clientLoanPurposeId[i] = iklantClientChoice[j];
                                                    break;
                                                }
                                            }
                                        }
                                        break;
                                    }
                                }

                            }
                        }
                        SanctionLoanHolderLocal.setClientSelectForGroup(memberIdArray);
                        SanctionLoanHolderLocal.setClientNameForGroup(memberNameArray);
                        SanctionLoanHolderLocal.setClientInsured(clientInsuredLocal);
                        SanctionLoanHolderLocal.setClientLoanPurposeId(clientLoanPurposeId);
                        SanctionLoanHolderLocal.setNoOfActiveLoans(memberActiveLoansArray);
                        SanctionLoanHolderLocal.setOutstandingAmount(memberOverdueArray);
                        SanctionLoanHolderLocal.setOverdueAmount(memberOutstandingArray);

                        /*Disbursement Date*/
                        SanctionLoanHolderLocal.setDisbursementDate(result.loanSanctionDetails.disbursementDateStr);

                        /*Source Of Payment*/
                        customlog.info("disbursalPaymentTypes" + result.loanCreationDetails.disbursalPaymentTypes + "\n");
                        var sourceOfPaymentId = new Array();
                        var sourceOfPaymentName = new Array();
                        var j=0;
                        for (var key in result.loanCreationDetails.disbursalPaymentTypes) {
                            sourceOfPaymentId[j] = key;
                            sourceOfPaymentName[j] = result.loanCreationDetails.disbursalPaymentTypes[key];
                            j++;
                            //customlog.info("Key: " + key);
                            //customlog.info("Value: " + result.loanCreationDetails.disbursalPaymentTypes[key]);
                        }
                        customlog.info("sourceOfPaymentId" + sourceOfPaymentId);
                        customlog.info("sourceOfPaymentName" + sourceOfPaymentName);
                        SanctionLoanHolderLocal.setSourceOfPaymentId(sourceOfPaymentId);
                        SanctionLoanHolderLocal.setSourceOfPaymentName(sourceOfPaymentName);

                        SanctionLoanHolderLocal.setMinAmount(result.loanSanctionDetails.minAllowedAmount);
                        SanctionLoanHolderLocal.setMaxAmount(result.loanSanctionDetails.maxAllowedAmount);
                        SanctionLoanHolderLocal.setTodaysDate(dateUtils.convertToMifosDateFormat(result.loanSanctionDetails.currentDateStr));

                        customlog.info(result.loanSanctionDetails.monthly);
                        customlog.info(result.loanSanctionDetails.weekly);
                        if(result.loanSanctionDetails.monthly){
                            customlog.info(result.loanCreationDetails.customerMeetingDetail.meetingDetailsDto.recurrenceDetails.dayNumber);
                            customlog.info(result.loanCreationDetails.customerMeetingDetail.meetingDetailsDto.every);

                            SanctionLoanHolderLocal.setMonthly(result.loanSanctionDetails.monthly);
                            SanctionLoanHolderLocal.setRepaymentDayOfMonth(result.loanCreationDetails.customerMeetingDetail.meetingDetailsDto.recurrenceDetails.dayNumber);
                            SanctionLoanHolderLocal.setRepaymentRecursEvery(result.loanCreationDetails.customerMeetingDetail.meetingDetailsDto.every);

                        }else{
                            customlog.info("result.loanSanctionDetails.weekly" +result.loanSanctionDetails.weekly);
                            customlog.info("result.loanCreationDetails.loanOfferingMeetingDetail.meetingDetailsDto.every"+result.loanCreationDetails.loanOfferingMeetingDetail.meetingDetailsDto.every);
                            customlog.info("result.loanCreationDetails.loanOfferingMeetingDetail.meetingDetailsDto.dayOfWeek"+result.loanCreationDetails.loanOfferingMeetingDetail.meetingDetailsDto.recurrenceDetails.dayOfWeek);
                            SanctionLoanHolderLocal.setWeekly(result.loanSanctionDetails.weekly);
                            SanctionLoanHolderLocal.setRepaymentRecursEvery(result.loanCreationDetails.loanOfferingMeetingDetail.meetingDetailsDto.every);
                            SanctionLoanHolderLocal.setRepaymentDayOfWeek(result.loanCreationDetails.loanOfferingMeetingDetail.meetingDetailsDto.recurrenceDetails.dayOfWeek);
                        }

                        SanctionLoanHolderLocal.setGraceDuration(result.loanCreationDetails.gracePeriodInInstallments);
                        var glCodeId = new Array();
                        var glCode = new Array();
                        var cashOrBank = new Array();
                        if(result.loanSanctionDetails.glcodeList != null) {
                            for(var i=0;i<result.loanSanctionDetails.glcodeList.length;i++){
                                glCodeId[i] = result.loanSanctionDetails.glcodeList[i].glcodeId;
                                glCode[i] = result.loanSanctionDetails.glcodeList[i].glcode + "-" + result.loanSanctionDetails.glcodeList[i].glname;
                                cashOrBank[i] = result.loanSanctionDetails.glcodeList[i].cashOrBank
                                customlog.info("cashOrBank = "+ result.loanSanctionDetails.glcodeList[i].cashOrBank);
                            }
                        }
                        customlog.info("glCodeId" + glCodeId);
                        customlog.info("glCode" + glCode);
                        customlog.info("activeClientIdArray" + activeClientIdArray);
                        glCodes.setGlcodeId(glCodeId);
                        glCodes.setGlcode(glCode);
                        glCodes.setCashOrBank(cashOrBank);
                        req.body.loanOfferingObjLocal = loanOfferingObjLocal;
                        req.body.SanctionLoanHolderLocal = SanctionLoanHolderLocal;
                        req.body.glcodes = glCodes;
                        req.body.activeClientName = activeClientName;
                        req.body.activeClientId = activeClientIdArray;
                        req.body.meetingTime = result.loanCreationDetails.customerDetailDto.meetingTime;
                        req.body.clientMobileNumbers = clientMobileNumbers;
                        req.body.iklantClientNames = iklantClientName;
                        req.body.clientLandLineNumbers = clientLandLineNumbers;
                        req.body.mifosClientCustomerId = mifosCustomerId;
                        req.body.clientIds = clientIds;
                        res.send(req.body);
                    });
                } else {
                    self.commonRouter.showErrorPage(req,res);
                }
            });
        }catch(e){
            customlog.error("Exception while retrieveGroupInformation "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    // Added by Chitra [Documents shouldn't generated for rejected clients]
    getActiveClientDetailsByIklantGroupIdCall:function(group_id,callBack){
        this.model.getActiveClientDetailsByIklantGroupIdModel(group_id,callBack);
    },
    loanOffering : function(req,res) {
        try{
		    res.setTimeout(0);
            var self = this;
            var sanctionLoanHolder = require(loanDisbursementDTOpath +"/LoanDisbursal");
            var SanctionLoanHolderLocal = new sanctionLoanHolder();
            var iklantGroupId = req.body.iklantGroupId;
            var mifosCustomerId = req.body.mifosGroupId;
            var groupName = req.body.groupName;
            var clientNamesArray = [];
            if(req.body.clientNames){
                clientNamesArray = req.body.clientNames.split(',');
            }

            var customerId = req.body.mifosGroupId;
            var productId = req.body.prdname;
            SanctionLoanHolderLocal.setCustomerId(req.body.mifosGroupId);
            SanctionLoanHolderLocal.setProductId(req.body.prdname);
            SanctionLoanHolderLocal.setAmount(req.body.amount);
            SanctionLoanHolderLocal.setMinAllowedAmount(req.body.minAmountAllowed);
            SanctionLoanHolderLocal.setMaxAllowedAmount(req.body.maxAmountAllowed);
            SanctionLoanHolderLocal.setGlimApplicable(req.body.glimApplicableHiddenName);
            SanctionLoanHolderLocal.setLocale(req.body.localeHiddenName);
            SanctionLoanHolderLocal.setMonthlyDayOfMonthOptionSelected(req.body.monthlyDayOfMonthOptionSelectedHiddenName);
            SanctionLoanHolderLocal.setRepaymentScheduleIndependentOfCustomerMeeting(req.body.repaymentScheduleIndependentOfCustomerMeetingHiddenName);
            SanctionLoanHolderLocal.setDigitsBeforeDecimalForInterest(req.body.digitsBeforeDecimalForInterestHiddenName);
            SanctionLoanHolderLocal.setDigitsAfterDecimalForInterest(req.body.digitsAfterDecimalForInterestHiddenName);
            SanctionLoanHolderLocal.setDigitsBeforeDecimalForMonetaryAmounts(req.body.digitsBeforeDecimalForMonetaryAmountsHiddenName);
            SanctionLoanHolderLocal.setDigitsAfterDecimalForMonetaryAmounts(req.body.digitsAfterDecimalForMonetaryAmountsHiddenName);
            clientInsuredHiddenName = req.body.clientInsuredHiddenName.split(',');
            SanctionLoanHolderLocal.setClientInsured(clientInsuredHiddenName);
            clientLoanPurposeIdHiddenName = req.body.clientLoanPurposeIdHiddenName.split(',');
            customlog.info("clientLoanPurposeIdHiddenName" + clientLoanPurposeIdHiddenName);
            SanctionLoanHolderLocal.setClientLoanPurposeId(clientLoanPurposeIdHiddenName);
            //By default individual tracked is true [changed by baskar030]
            SanctionLoanHolderLocal.setIndividualTracked(true);
            clientSelectedForLoan = req.body.clientSelected.split(',');
            SanctionLoanHolderLocal.setClientGlobalId(clientSelectedForLoan);
            amountSanctionedForLoan = req.body.amountSanctioned.split(',');
            SanctionLoanHolderLocal.setClientAmount(amountSanctionedForLoan);
            clientStatusForLoan = req.body.clientStatus.split(',');
            SanctionLoanHolderLocal.setClientSelectForGroup(clientStatusForLoan);
            //SanctionLoanHolderLocal.setApprovalDate(convertToMifosDate(req.body.approvalDate));
            SanctionLoanHolderLocal.setApprovalDateStr(dateUtils.convertToMifosDateFormat(req.body.approvalDate));
            //SanctionLoanHolderLocal.setDisbursementDate(convertToMifosDate(req.body.disbursalDate));
            SanctionLoanHolderLocal.setDisbursementDateStr(dateUtils.convertToMifosDateFormat(req.body.disbursalDate));
            SanctionLoanHolderLocal.setDisbursalGLCode(req.body.sourceOfPaymentId);
            SanctionLoanHolderLocal.setInterestRate(req.body.interestrate);
            SanctionLoanHolderLocal.setMinAllowedInterestRate(req.body.mininterestrate);
            SanctionLoanHolderLocal.setMaxAllowedInterestRate(req.body.maxinterestrate);

            SanctionLoanHolderLocal.setNumberOfInstallments(req.body.installments);
            SanctionLoanHolderLocal.setMinNumberOfInstallments(req.body.mininstallments);
            SanctionLoanHolderLocal.setMaxNumberOfInstallments(req.body.maxinstallments);



            if(req.body.meetingschedule == 1){
                SanctionLoanHolderLocal.setWeekly(true);
                SanctionLoanHolderLocal.setRepaymentRecursEvery(req.body.recurEvery);
                SanctionLoanHolderLocal.setRepaymentDayOfWeek(req.body.dayListId);
            }else{
                SanctionLoanHolderLocal.setMonthly(true);
                SanctionLoanHolderLocal.setMonthlyDayOfMonthOptionSelected(true);
                SanctionLoanHolderLocal.setRepaymentRecursEvery(1);
                SanctionLoanHolderLocal.setRepaymentDayOfMonth(req.body.day);
            }

            if(req.body.graceperiod == true){
                customlog.info("Grace Period " + req.body.grace);
                SanctionLoanHolderLocal.setGraceDuration(req.body.grace);
            }
            customlog.info("PF " + req.body.processingFee);
            var selectedFeeId = new Array();
            var selectedFeeAmount = new Array();
            var fees = 0;
            if(req.body.processingFee == true){
                selectedFeeId[fees] = 3;
                selectedFeeAmount[fees] = req.body.processingFeePercentage;
                fees++;
            }else{
                selectedFeeId[fees] = null;
                selectedFeeAmount[fees] = null;
                fees++;
            }
            if(req.body.serviceTax == true){
                selectedFeeId[fees] = 1;
                selectedFeeAmount[fees] = req.body.serviceTaxPercentage;
                fees++;
            }else{
                selectedFeeId[fees] = null;
                selectedFeeAmount[fees] = null;
                fees++;
            }
            if(req.body.insurance == true){
                selectedFeeId[fees] = 2;
                selectedFeeAmount[fees] = req.body.insurancePercentage;
                fees++;
            }else{
                selectedFeeId[fees] = null;
                selectedFeeAmount[fees] = null;
                fees++;

            }
            customlog.info("selectedFeeId" + selectedFeeId);
            customlog.info("selectedFeeAmount" + selectedFeeAmount);
            if(selectedFeeId.length > 0 ){
                SanctionLoanHolderLocal.setSelectedFeeId(selectedFeeId);
                SanctionLoanHolderLocal.setSelectedFeeAmount(selectedFeeAmount);
            }
            SanctionLoanHolderLocal.setVoucherNumber(req.body.voucherNumber);
            var date = new Date();
            var defaultTime = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
            var meetingTime =  (req.body.meetingTime == '')?defaultTime:req.body.meetingTime;
            SanctionLoanHolderLocal.setMeetingTime(meetingTime);
            var jsonArray = JSON.stringify(SanctionLoanHolderLocal);
            customlog.info("req.session.mifosCookie" + req.session.mifosCookie);
            customlog.info("JSON FORMAT " + jsonArray);


            var postheaders = {
                'Content-Type' : 'application/json',
                'Content-Length' : Buffer.byteLength(jsonArray, 'utf8'),
                'Cookie' : req.session.mifosCookie
            };

            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: "/mfi/api/account/loan/sanction/cust-"+customerId+"/prd-"+productId+".json",
                method: 'POST',
                headers : postheaders
            };
            rest.postJSON(options,jsonArray,function(statuscode,result,headers){
                customlog.info("statuscode: " + statuscode);
                customlog.info("result: " , result);
                customlog.info("headers: " , headers);
                customlog.info("status: " + result.status);
                if(statuscode == 302){
                    res.redirect(props.contextPath+'/client/ci/logout');
                }
                else{
                    if(result.status == "success"){
                        //req.session.loanStatusId = 1;
                        if(req.session.iklantGroupId != 0){
                            customlog.info("Inside StatusID Updation");
                            self.model.changeStatusIdModel(req.session.iklantGroupId,req.body.rejected_member,function(callback){
                                self.commonRouter.updateLeaderSubLeaderDetails(req,res,iklantGroupId,mifosCustomerId,function(updatedStatus){
                                    self.model.changeMifosGroupAddressModel(iklantGroupId,function(status){

                                    });
                                });
                            });
                        }
                        var smsConstants = new SmsConstants();
                        //Ezra Johnson
                        self.shortMessagingRouter.getAlertStatus(smsConstants.getLoanDisbursementId(),function(callbackStatus, smsAlertStatus){
                            if(smsAlertStatus){
                                customlog.debug("Constructing message for sending SMS after loan sanction");
                                self.getClientMobileNumber(SanctionLoanHolderLocal.getClientGlobalId(),function(status,mobileNumArray){
                                    if(status === 'success'){
                                        /*
                                         SanctionLoanHolderLocal.getNumberOfInstallmentse(); //no of installments
                                         SanctionLoanHolderLocal.getAmount();        //total amount sanctioned
                                         groupName;                                  // name of the group
                                         SanctionLoanHolderLocal.getClientAmount();  //Array
                                         clientNamesArray                            //Array
                                         */
                                        self.shortMessagingRouter.sendLoanDisbursementSMS(SanctionLoanHolderLocal.getNumberOfInstallmentse(),
                                            SanctionLoanHolderLocal.getAmount(),groupName,SanctionLoanHolderLocal.getClientAmount(),
                                            clientNamesArray,mobileNumArray,SanctionLoanHolderLocal.getClientSelectForGroup());
                                    }else {
                                        customlog.error("error occured querying the mobile number of the clients");
                                    }
                                });
                            }
                        });
                        customlog.info("After StatusID Updation");
                        req.body.status = "success";
                        req.body.successmessage = "LOAN DISBURSED SUCCESFULLY";
                        req.body.globalAccountNum = result.loanCreationResultDetails.globalAccountNum;
                        res.send(req.body);
                        var activityDetails = new Array(iklantPort, req.session.tenantId, req.session.userId, req.session.userName, req.originalUrl, req.connection.remoteAddress, "router.js", "loanOffering", "success", "Loan Sanction","GroupId "+req.session.iklantGroupId+" AccNo "+req.body.globalAccountNum+" Loan Sanctioned successfully","insert");
                        self.commonRouter.insertActivityLogModel(activityDetails);
                    }
                    else if(result.status == "failure"){
                        if(result.hasOwnProperty('errors')){
                            req.body.status = "failure";
                            req.body.error = result.errors[0];
                        }else{
                            req.body.status = "runtime";
                        }
                        res.send(req.body);
                    } else {

                        self.commonRouter.showErrorPage(req,res);
                    }
                }
            });
        }catch(e){
            customlog.error("Exception while loanoffering "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    },
    fileUploadForLoanSanctionCall:function(clientid,groupCode,mifosGlobalAccNo,docLanguage,bcOfficeId,callback){
        this.model.fileUploadForLoanSanctionModel(clientid,groupCode,mifosGlobalAccNo,docLanguage,bcOfficeId,callback);
    },
    fileUploadForLS :  function(req,res) {
        try{
            customlog.info("Inside File Upload");
            var self = this;
            var mifosCustomerId = req.body.mifosCustomerId;
            var mifosGlobalAccNo = req.body.mifosGlobalAccNo;
            var selectedMemberId = req.body.selectedMemberId;
            var formType = req.body.formType;
            var prdid = req.body.prdcategoryid;
            var tenantId = req.session.tenantId;
            var userId = req.session.userId;
            var docLanguage = req.session.language;
            var bcOfficeId = req.session.bcOfficeId;
            customlog.info("mifosGlobalAccNo" + mifosGlobalAccNo);
            if(typeof tenantId == 'undefined' || typeof userId == 'undefined' || typeof req.session.operationId == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }
            else {
                self.commonRouter.retrieveClientDetailsForGeneratePDF(mifosCustomerId, selectedMemberId, function (clientid, groupCode) {

                    customlog.info("clientid" + clientid);
                    customlog.info("groupCode" + groupCode);
                    if (formType == 1) {
                        self.commonRouter.KYCFileUploadForLoanSanctionCall(clientid, formType, mifosCustomerId, docLanguage,bcOfficeId, function (client_name, groupId, groupName, isSynchronized) {
                            var path = "/GeneratedPDF/" + groupCode + "_KYCform.pdf";
                            req.body.path = path;
                            res.send(req.body);
                            //setTimeout(self.showLoanSanctionPage(res,groupId,path,isSynchronized,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType),600000);
                        });
                    }
                    else if (formType == 2) {
                        self.fileUploadForLoanSanctionCall(clientid, groupCode, mifosGlobalAccNo, docLanguage,bcOfficeId, function () {
                            var path = "/GeneratedPDF/" + groupCode + "_loanform.pdf";
                            customlog.info("PATH : " + path);
                            req.body.path = path;
                            res.send(req.body);
                            //setTimeout(self.showLoanSanctionPage(res,groupId,path,isSynchronized,thisclientId,clientNameArray,groupNameForLoanSanction,clientIdArray,productCategoryId,ProductCategoryType),600000);
                        });
                    }
                    else if (formType == 3) {
                        self.commonRouter.generateLegalForm(req, res, function () {
                            res.send();
                        });
                    }
                    else if (formType == 4) {
                        self.commonRouter.generatePromissoryNote(req, res, function () {
                            res.send();
                        });
                    }
                    else if (formType == 5) {
                        req.body.subLeaderNameArray = "";
                        req.body.clientCodeArray = "";
                        self.commonRouter.generateLoanScheduleForm(req, res, function () {
                            res.send();
                        });
                    }
                    else if (formType == 6) {
                        self.commonRouter.generateReceiptForm(req, res, function () {
                            res.send();
                        });
                    }
                    else if (formType == 7) {
                        self.commonRouter.generateMASLegalForm(req, res, function (status) {
                            res.send();
                        });
                    }
                    else if (formType == 8) {
                        self.commonRouter.KYCFileUploadForLoanSanctionCall(clientid, formType, mifosCustomerId, docLanguage,bcOfficeId, function (client_name, groupId, groupName, isSynchronized) {
                            var path = "/GeneratedPDF/" + groupName + "_MASLoanCardform.pdf";
                            req.body.path = path;
                            res.send(req.body);
                        });
                    }
                    else if (formType == 9) {
                        self.commonRouter.generateMASDemandPromissoryform(req, res, function (status) {
                            res.send();
                        });
                    } else if (formType == 10) {
                        self.commonRouter.KYCFileUploadForLoanSanctionCall(clientid, formType, mifosCustomerId, docLanguage,bcOfficeId, function (client_name, groupId, groupName, isSynchronized) {
                            var path = "/GeneratedPDF/" + groupName + "_MAS_Appraisal.pdf";
                            req.body.path = path;
                            res.send(req.body);
                        });
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while file upload for LS "+e);
            self.showErrorPage(req,res);
        }
    },
    //For Loan Offering By Bask:1939
    //Retrieve Loan Offering Input Details
    createLoan : function(req,res) {
        try{
            var self = this;
            var constantsObj = this.constants;
            customlog.info('Inside retrieveClientsFromService');
            customlog.info("req.session.mifosCookie" + req.session.mifosCookie);
            customlog.info("req.session.userId" + req.session.userId);
            var mifosCustomerId = req.params.mifosCustomerId;
            var iklantGroupId = 0;
            req.session.iklantGroupId = 0;
            customlog.info("mifosCustomerId" + mifosCustomerId);
            if(typeof req.session.operationId == 'undefined'){
                req.session.operationId = 2;
            }
            // Added by chitra[Document should not generated For rejected clients]
            self.commonRouter.getIklantGroupIdFromCustomerIdCall(mifosCustomerId,function(iklantGroupIdValue){
                if(iklantGroupIdValue != null && iklantGroupIdValue.length != 0){
                    iklantGroupId = iklantGroupIdValue[0].group_id;
                }
            });
            var inpdata = JSON.stringify({ });
            var postheaders = {
                'Content-Type' : 'application/json',
                'Cookie' : req.session.mifosCookie
            };
            var options = {
                host: mifosServiceIP,
                port: mifosPort,
                path: '/mfi/api/account/loan/offering/loanproducts/cust-'+mifosCustomerId+'.json',
                method: 'GET',
                headers : postheaders
            };
            self.commonRouter.retrieveClientDetailsForGeneratePDF(mifosCustomerId,"",function(clientdetails,groupcode) {
                customlog.info("groupCode" + groupcode);
                var loanForm = "/GeneratedPDF/"+groupcode+"_loanform.pdf";
                var kycform = "/GeneratedPDF/"+groupcode+"_KYCform.pdf";
                var legalForm = "/GeneratedPDF/"+mifosCustomerId+"_legalform.pdf";
                var promissoryNote = "/GeneratedPDF/"+mifosCustomerId+"_promissoryNote.pdf";
                var installmentSchedule = "/GeneratedPDF/"+mifosCustomerId+"_loanRepaymentSchedule.pdf";
                var receiptForm = "/GeneratedPDF/"+mifosCustomerId+"_receiptForm.pdf";
                rest.getJSON(options,function(statuscode,result,headers) {
                    var productCategoryId = new Array();
                    var productCategoryName = new Array();
                    customlog.info("statuscode===" + statuscode);
                    customlog.info("result" + result);
                    customlog.info("headers" + headers);
                    if(statuscode == 302) {
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else if(result.status == "success") {
                        var loanOffering = require(path.join(rootPath,"app_modules/dto/loan_disbursement/loanOffering"));
                        var loanOfferingObjLocal = new loanOffering();
                        var sanctionLoanHolder = require(path.join(rootPath,"app_modules/dto/loan_disbursement/sanctionLoanHolder"));
                        var SanctionLoanHolderLocal = new sanctionLoanHolder();
                        customlog.info("result.loanList.voucherNumberIfBank"+result);
                        //SanctionLoanHolderLocal.setVoucherNumberIfBank(result.loanSanctionDetails.voucherNumberIfBank);
                        //SanctionLoanHolderLocal.setVoucherNumberIfCash(result.loanSanctionDetails.voucherNumberIfCash);
                        if(result.loanCreationProductDetailsDto.loanProductDtos != null) {
                            for(var i=0;i<result.loanCreationProductDetailsDto.loanProductDtos.length;i++){
                                productCategoryId[i] = result.loanCreationProductDetailsDto.loanProductDtos[i].prdOfferingId;
                                productCategoryName[i] = result.loanCreationProductDetailsDto.loanProductDtos[i].prdOfferingName;
                            }
                        }
                        customlog.info(result.loanCreationProductDetailsDto.customerDetailDto.displayName + "\n");
                        loanOfferingObjLocal.setProductCategoryIdList(productCategoryId);
                        loanOfferingObjLocal.setProductCategoryNameList(productCategoryName);
                        loanOfferingObjLocal.setCenterName(result.loanCreationProductDetailsDto.customerDetailDto.displayName);
                        loanOfferingObjLocal.setCustomerId(result.loanCreationProductDetailsDto.customerDetailDto.customerId);
                        loanOfferingObjLocal.setGlobalAccountNum(result.loanCreationProductDetailsDto.customerDetailDto.globalCustNum);
                        res.render('loan_disbursement/LoanSanctionForm1', {loanOfferingObjLocal:loanOfferingObjLocal,
                            SanctionLoanHolderLocal:SanctionLoanHolderLocal, groupcode:groupcode,iklantGroupId:iklantGroupId,receiptForm:receiptForm,
                            loanForm:loanForm, kycform:kycform,legalForm:legalForm,promissoryNote:promissoryNote,activeClientName:"",activeClientId:"", constantsObj:constantsObj,installmentSchedule:installmentSchedule, contextPath:props.contextPath,roleId: req.session.roleId });
                    }else{
                        self.commonRouter.showErrorPage(req,res);
                    }
                });
            });
        }catch(e){
            customlog.error("Exception while createLoan "+e);
            self.commonRouter.showErrorPage(req, res);
        }
    },

    getClientMobileNumber: function(clientGlobalArray,callback) {
        this.model.getClientMobileNumberModel(clientGlobalArray,callback);
    },

    calcPreviewDateEMI: function(req, res) {
        try{
            var self = this;
            customlog.info("request received for EMI");
            var recurrenceDay = req.body.recurrenceDay;
            var disbursalDate = req.body.disbursalDate;
            var mifosCustomerId = req.body.mifosCustomerId;
            if(typeof req.session.tenantId == 'undefined' || typeof req.session.userId == 'undefined' || typeof recurrenceDay == 'undefined' || typeof disbursalDate == 'undefined') {
                res.redirect(props.contextPath+'/client/ci/login');
            }else {
                var rest = require("./rest.js");
                var http = require('http');
                var https = require('https');
                var postheaders = {
                    'Content-Type' : 'application/json',
                    'Cookie' : req.session.mifosCookie
                };
                var options = {
                    host: mifosServiceIP,
                    port: mifosPort,
                    path: "/mfi/api/account/loan/offering/loanproducts/disDate-"+dateUtils.convertToMifosDateFormat(disbursalDate)+"/recDay-"+recurrenceDay+"/cust-"+mifosCustomerId+".json",  //due-"+userId+"-"+officeId+".json",
                    method: 'GET',
                    headers : postheaders
                };
                customlog.info(options.path);
                rest.getJSON(options,function(statuscode,result,headers){
                    customlog.info("statuscode:"+statuscode);
                    customlog.info("result");
                    customlog.info(result);
                    if(statuscode == 302) {
                        res.redirect(props.contextPath+'/client/ci/logout');
                    }
                    else if(result.status == "success") {
                        customlog.info(result.firstInstallmentDate);
                        res.json(result);
                    } else {
                        var err = {};
                        err.status = 'failure'
                        err.message = 'Connection problem';
                        res.json(err);
                    }
                });
            }
        }catch(e){
            customlog.error("Exception while calcPreviewDateEMI "+e);
            self.commonRouter.showErrorPage(req,res);
        }
    }
};

