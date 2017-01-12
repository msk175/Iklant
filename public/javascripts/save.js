 function save(){
	var GroupName = document.getElementById('groupNameID').value;
	var CenterName = document.getElementById('CenterNameID').value;
	var GroupFormedDate = document.getElementById('GroupFormedDateID').value;
	var LastActiveFrom = document.getElementById('LastActiveFromID').value;
	var SavingsDiscussed = document.getElementById('checkbox-1a').value;
	var CompleteAttendance = document.getElementById('checkbox-2a').value;
	var BankAccount = document.getElementById('checkbox-3a').value;
	var BankName = document.getElementById('select-choice-12').value;
	var AccountNumber = document.getElementById('AccNoID').value;
	var AccountCreated = document.getElementById('AccCrID').value;
	var CreditTransaction = document.getElementById('checkbox-6a').value;
	var DebitTransaction = document.getElementById('checkbox-7a').value;
	var InternalLoan = document.getElementById('checkbox-4a').value;
	return GroupName;
}
