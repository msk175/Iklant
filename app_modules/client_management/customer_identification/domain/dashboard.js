module.exports = choicesSelectedAnswer;

var userId = new Array();
var userName = new Array();
var officeId = new Array();
var officeName = new Array();
var statusId = new Array();
var statusName = new Array();
var roleId = new Array();
var roleName = new Array();
var noOfGroups = new Array();
var noOfRejectedGroups;
var smhRoleName;
var smhUserName;
var pv_count;
var rejected_count;
var kyc_upload_count;
var kyc_updating_count;
var data_verification_count;
var credit_check_count;
var assign_fo_count;
var fv_count;
var appraisal_count;
var loan_authorize_count;
var loan_sanction_count;

function choicesSelectedAnswer() {
    //this.clearAll();
}

choicesSelectedAnswer.prototype = {

	getUserId: function(){
		return this.userId;
	},
	
	setUserId: function (t_userId){
        this.userId = t_userId;
	},
	
	getUserName: function(){
		return this.userName;
	},
	
	setUserName : function (t_userName){
        this.userName = t_userName;
	},
	
	getOfficeId: function(){
		return this.officeId;
	},
	
	setOfficeId : function (t_officeId){
        this.officeId = t_officeId;
	},
	setofficeName : function (t_officeName){
        this.officeName = t_officeName;
	},
	getOfficeName: function(){
		return this.officeName;
	},
	
	setStatusId: function (t_statusId){
        this.statusId = t_statusId;
	},
	
	
	getStatusId : function(){
		return this.statusId;
	},
	
	setStatusName: function (t_statusName){
        this.statusName = t_statusName;
	},
	
	getStatusName: function(){
		return this.statusName;
	},
	
	setRoleId: function (t_roleId){
        this.roleId = t_roleId;
	},
	
	getRoleId: function(){
		return this.roleId;
	},
	
	setRoleName: function (t_roleName){
        this.roleName = t_roleName;
	},
	
	getRoleName: function(){
		return this.roleName;
	},
	
	setNoOfGroups: function (t_noOfGroups){
        this.noOfGroups = t_noOfGroups;
	},
	
	getNoOfGroups: function(){
		return this.noOfGroups;
	},
	setNoOfRejectedGroups: function (t_noOfrejectedGroups){
        this.noOfRejectedGroups = t_noOfrejectedGroups;
	},
	
	getNoOfRejectedGroups : function(){
		return this.noOfRejectedGroups;
	},
	setSMHUserName: function (t_smhUserName){
        this.smhUserName = t_smhUserName;
	},
	
	getSMHUserName : function(){
		return this.smhUserName;
	},
	setSMHRoleName: function (t_smhRoleName){
        this.smhRoleName = t_smhRoleName;
	},
	
	getSMHRoleName : function(){
		return this.smhRoleName;
	},
    setPvCount: function (t_pv_count){
        this.pv_count = t_pv_count;
    },

    getPvCount: function(){
        return this.pv_count;
    },

    setKycUploadCount: function (t_kyc_upload_count){
        this.kyc_upload_count = t_kyc_upload_count;
    },

    getKycUploadCount: function(){
        return this.kyc_upload_count;
    },

    setKycUpdatingCount: function (t_kyc_updating_count){
        this.kyc_updating_count = t_kyc_updating_count;
    },

    getKycUpdatingCount: function(){
        return this.kyc_updating_count;
    },

    setDataVerificationCount: function (t_data_verification_count){
        this.data_verification_count = t_data_verification_count;
    },

    getDataVerificationCount: function(){
        return this.data_verification_count;
    },

    setCreditCheckCount: function (t_credit_check_count){
        this.credit_check_count = t_credit_check_count;
    },

    getCreditCheckCount: function(){
        return this.credit_check_count;
    },

    setAssignFoCount: function (t_assign_fo_count){
        this.assign_fo_count = t_assign_fo_count;
    },

    getAssignFoCount: function(){
        return this.assign_fo_count;
    },

    setFvCount: function (t_fv_count){
        this.fv_count = t_fv_count;
    },

    getFvCount: function(){
        return this.fv_count;
    },

    setAppraisalCount: function (t_appraisal_count){
        this.appraisal_count = t_appraisal_count;
    },

    getAppraisalCount: function(){
        return this.appraisal_count;
    },

    setLoanAuthorizeCount: function (t_loan_authorize_count){
        this.loan_authorize_count = t_loan_authorize_count;
    },

    getLoanAuthorizeCount: function(){
        return this.loan_authorize_count;
    },

    setLoanSanctionCount: function (t_loan_sanction_count){
        this.loan_sanction_count = t_loan_sanction_count;
    },

    getLoanSanctionCount: function(){
        return this.loan_sanction_count;
    },

    setRejectedCount: function (t_rejected_count){
        this.rejected_count = t_rejected_count;
    },

    getRejectedCount: function(){
        return this.rejected_count;
    },
	clearAll: function (){
		this.setUserId(new Array());
		this.setUserName(new Array());
		this.setOfficeId(new Array());
		this.setofficeName(new Array());
		this.setStatusId(new Array());
		this.setStatusName(new Array());
		this.setRoleId(new Array());
		this.setRoleName(new Array());
		this.setNoOfGroups(new Array());
		this.setNoOfRejectedGroups("");
		this.setSMHUserName("");
		this.setSMHRoleName("");
        this.setPvCount(new Array());
        this.setKycUploadCount(new Array());
        this.setKycCompletedCount(new Array());
        this.setDataVerificationCount(new Array());
        this.setCreditCheckCount(new Array());
        this.setAssignFoCount(new Array());
        this.setFvCount(new Array());
        this.setAppraisalCount(new Array());
        this.setLoanAuthorizeCount(new Array());
        this.setLoanSanctionCount(new Array());
	}
};