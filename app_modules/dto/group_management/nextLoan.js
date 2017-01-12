/**
 * Created by Paramasivan(siva0005) on 17-12-2014.
 */

module.exports = nextLoan;

var customerId;
var mifosParentCustomerId;
var iklantGroupId;
var groupCurrentLoanCount;
var clientCurrentLoanCount;
var updatedBy;
var approveRejectFlag;
var accountNo;
var iklantClientId;
var officeId;
var tenantId;
var groupName;
var clientFirstName;
var clientLastName;
var totalClients;
var loanOfficerId;
var remarksForRejection;
var clientAccountNo;

function nextLoan() {
    this.clearAll();
}
nextLoan.prototype = {

    getCustomerId: function(){
        return this.customerId;
    },

    setCustomerId: function(customer_id){
        this.customerId = customer_id;
    },
    
    getMifosParentCustomerId: function(){
        return this.mifosParentCustomerId;
    },

    setMifosParentCustomerId: function(mifos_parent_customer_id){
        this.mifosParentCustomerId = mifos_parent_customer_id;
    },
    
    getIklantGroupId: function(){
        return this.iklantGroupId;
    },

    setIklantGroupId: function(iklant_group_id){
        this.iklantGroupId = iklant_group_id;
    },
    
    getGroupCurrentLoanCount: function(){
        return this.groupCurrentLoanCount;
    },

    setGroupCurrentLoanCount: function(current_loan_count){
        this.groupCurrentLoanCount = current_loan_count;
    },

    getClientCurrentLoanCount: function(){
        return this.clientCurrentLoanCount;
    },

    setClientCurrentLoanCount: function(current_loan_count){
        this.clientCurrentLoanCount = current_loan_count;
    },
    
    getUpdatedBy: function(){
        return this.updatedBy;
    },

    setUpdatedBy: function(updated_by){
        this.updatedBy = updated_by;
    },
    
    getApproveRejectFlag: function(){
        return this.approveRejectFlag;
    },

    setApproveRejectFlag: function(approve_reject_flag){
        this.approveRejectFlag = approve_reject_flag;
    },
    
    getAccountNo: function(){
        return this.accountNo;
    },

    setAccountNo: function(account_no){
        this.accountNo = account_no;
    },

    getClientAccountNo: function(){
        return this.clientAccountNo;
    },

    setClientAccountNo: function(client_account_no){
        this.clientAccountNo = client_account_no;
    },
    
    getIklantClientId: function(){
        return this.iklantClientId;
    },

    setIklantClientId: function(iklant_client_id){
        this.iklantClientId = iklant_client_id;
    },
    
    getOfficeId: function(){
        return this.officeId;
    },

    setOfficeId: function(office_id){
        this.officeId = office_id;
    },
    
    getTenantId: function(){
        return this.tenantId;
    },

    setTenantId: function(tenant_id){
        this.tenantId = tenant_id;
    },
    
    getGroupName: function(){
        return this.groupName;
    },

    setGroupName: function(group_name){
        this.groupName = group_name;
    },

    getClientFirstName: function(){
        return this.clientFirstName;
    },

    setClientFirstName: function(client_first_name){
        this.clientFirstName = client_first_name;
    },

    getClientLastName: function(){
        return this.clientLastName;
    },

    setClientLastName: function(client_last_name){
        this.clientLastName = client_last_name;
    },

    getTotalClients: function(){
        return this.totalClients;
    },

    setTotalClients: function(total_clients){
        this.totalClients = total_clients;
    },

    getLoanOfficerId: function(){
        return this.loanOfficerId;
    },

    setLoanOfficerId: function(loan_officer_id){
        this.loanOfficerId = loan_officer_id;
    },

    getRemarksForRejection: function(){
        return this.remarksForRejection;
    },

    setRemarksForRejection: function(remarks){
        this.remarksForRejection = remarks;
    },

    clearAll: function(){
        this.setCustomerId("");
        this.setAccountNo("");
        this.setApproveRejectFlag("");
        this.setClientFirstName("");
        this.setClientLastName("");
        this.setGroupCurrentLoanCount("");
        this.setClientCurrentLoanCount("");
        this.setGroupName("");
        this.setIklantClientId("");
        this.setIklantGroupId("");
        this.setLoanOfficerId("");
        this.setMifosParentCustomerId("");
        this.setOfficeId("");
        this.setTenantId("");
        this.setTotalClients("");
        this.setUpdatedBy("");
        this.setRemarksForRejection("");
    }
}
