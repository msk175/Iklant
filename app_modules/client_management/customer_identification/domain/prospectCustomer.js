module.exports = prospectCustomer;

function prospectCustomer(
    groupName, statusId, createdDt, isEligible,
    bankName, bankBranch, accountNum, accountCreatedDt,
    creditTrxn, debitTrxn, internalLoan,
    momActiveFrom, savingsDiscussed, attendence, remarks) {
    this.groupName 			= groupName;
    this.statusId 			= statusId;
    this.createdDt 			= createdDt;
    this.isEligible 		= isEligible;
    this.bankName 			= bankName;
    this.bankBranch 		= bankBranch;
    this.accountNum 		= accountNum;
    this.accountCreatedDt 	= accountCreatedDt;
    this.creditTrxn 		= creditTrxn;
    this.debitTrxn 			= debitTrxn;
    this.internalLoan 		= internalLoan;
    this.momActiveFrom 		= momActiveFrom;
    this.savingsDiscussed 	= savingsDiscussed;
    this.attendence 		= attendence;
    this.remarks 			= remarks;
}

prospectCustomer.prototype = {

}