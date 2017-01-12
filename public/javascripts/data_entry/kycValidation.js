var angle = 90;
var imagesArray = new Array();
var imageNameArray = new Array();
var countValue = 1;
var currentImage;
var incArrayImage = 0;
var incArrayCount = 0;
var inc =0;
var familyMemberNameArray = new Array();
var ageArray = new Array();
var genderArray = new Array();
var relationshipArray = new Array();
var otherRelationshipNameArray = new Array();
var educationArray = new Array();
var occupationArray = new Array();
var incomeArray = new Array();
var GroupIdKYC;
var GroupNameKYC;
//othermfiloan popup array declaration
var otherMfiNameArray = new Array();
var otherMfiAmtSecuredArray = new Array();
var otherMfiLoanOutstandingArray = new Array();

function checkIfAlreadyMemberExists(isDataVerified,isRejected){
    var GuarantorName =  document.getElementById("guarantorName").value;
    var MembFirstName = document.getElementById("membFirstNameId").value;
    var MembLastName = document.getElementById("membLastNameId").value;
    if(isDataVerified==0){
        var DOB = document.getElementById("dateOfBirth").value;
    }else{
        var DOB = document.getElementById("dateOfBirthDV").value;
    }
    var clientId = document.getElementById("memberName").value;
    var data = {};
    data.clientName = MembFirstName.trim() +" "+MembLastName.trim();
    data.dateOfBirth = DOB;
    data.GuarantorName = GuarantorName.trim();
    data.clientId = clientId;
    ajaxVariable = $.ajax({
        beforeSend : function() {
            $.mobile.showPageLoadingMsg();
        },
        complete: function() {
            $.mobile.hidePageLoadingMsg()
        },
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/checkIfAlreadyExistsMember',
        success: function(data) {
            if(data.status == "failure"){
                document.getElementById("errorLabelId").innerText = data.errorMessage;
                $(window).scrollTop(0);
            }else{
                kycFormSubmission(isDataVerified,isRejected);
            }
        },error : function(jqXHR, textStatus, error) {
            document.getElementById("errorLabelId").innerText = "Error in Checking DuplicateName";
            $(window).scrollTop(0);
        }
    });
}

function kycFormSubmission(isDataVerified,isRejected){
    $("#rejectConfirmationId" ).popup( "close" );
	/*----------------HOUSE DETAILS-----------------*/
	//--------------HOUSEHOLD DETAILS---------------//
	/*var housholdDetails = new Array();
		
	if($("#television").is(':checked') == true){      
		housholdDetails.push($("#televisionID").text());
	}
	if($("#mixie").is(':checked')==true){
		housholdDetails.push($("#mixieID").text());
	}
	if($("#grinder").is(':checked')==true){
		housholdDetails.push($("#grinderID").text());
	}
	if($("#refrigerator").is(':checked')==true){
		housholdDetails.push($("#refrigeratorID").text());
	}
	if($("#washingMachine").is(':checked')==true){
		housholdDetails.push($("#washingMachineID").text());
	}
	$("#hiddenHousehold").val(housholdDetails);*/
	//---------------------------------------------//	
	
	//---------------VEHICLE DETAILS--------------//
	var vehicleDetails = new Array();
	
	if($("#bicycle").is(':checked') == true){      
		vehicleDetails.push($("#bicycleID").text());
	}
	if($("#scooter").is(':checked')==true){
		vehicleDetails.push($("#scooterID").text());
	}
	if($("#moped").is(':checked')==true){
		vehicleDetails.push($("#mopedID").text());
	}
	if($("#bike").is(':checked')==true){
		vehicleDetails.push($("#bikeID").text());
	}
	if($("#car").is(':checked')==true){
		vehicleDetails.push($("#carID").text());
	}
	if($("#others").is(':checked')==true){
		vehicleDetails.push($("#othersID").text());
	}
	$("#hiddenVehicle").val(vehicleDetails);
	//---------------------------------------------//
	
	//--------------HOUSEROOM DETAILS--------------//
	var houseroomDetails = new Array();
	
	if($("#hall").is(':checked') == true){      
		houseroomDetails.push($("#hallID").text());
	}
	if($("#kitchen").is(':checked')==true){
		houseroomDetails.push($("#kitchenID").text());
	}
	if($("#1room").is(':checked')==true){
		houseroomDetails.push($("#1roomID").text());
	}
	if($("#2rooms").is(':checked')==true){
		houseroomDetails.push($("#2roomsID").text());
	}
	if($("#3rooms").is(':checked')==true){
		houseroomDetails.push($("#3roomsID").text());
	}
	$("#hiddenHouseroom").val(houseroomDetails);
	
	//---------------------------------------------//
	
	
	/*-------------BANK ACCOUNT DETAILS-------------*/
	//FOR BANK_ACCOUNT
	if($("#bankAccount").is(':checked') == true)
		$("#bankAccountHidden").val('1');
	else
		$("#bankAccountHidden").val('0');
	//FOR SAVINGS
	if($("#savings").is(':checked') == true)
		$("#savingsHidden").val('1');
	else
		$("#savingsHidden").val('0');
	//FOR LIFETIME_INSURANCE
	/*if($("#lifeTimeInsurance").is(':checked') == true)
		$("#lifeTimeInsuranceHidden").val('1');
	else
		$("#lifeTimeInsuranceHidden").val('0');
	//FOR ACCIDENTAL_INSURANCE
	if($("#accidentalInsurance").is(':checked') == true)
		$("#accidentalInsuranceHidden").val('1');
	else
		$("#accidentalInsuranceHidden").val('0');
	//FOR MEDICAL_INSURANCE
	if($("#medicalInsurance").is(':checked') == true)
		$("#medicalInsuranceHidden").val('1');
	else
		$("#medicalInsuranceHidden").val('0');*/
	//---------------------------------------------//
	
	
	/*------------OTHER MFI LOAN DETAILS-----------*/
	//FOR ISLOANSECURED
	if($("#loanSecuredOtherMFI").is(':checked') == true)
		$("#otherMfiLoanHidden").val('1');
	else
		$("#otherMfiLoanHidden").val('0');
		
	//validation
	if(!($("#loanSecuredOtherMFI").is(':checked') == true)){
		//alert("Hello");
		$("#OtherMfiNameHiddenId").val('');
		$("#deleteOtherMfiClientId").val($("#OtherMfiClientNameFetchHiddenId").val());
		$("#deleteOtherMfiAmtSecuredId").val($("#OtherMfiClientAmtFetchHiddenId").val());
		$("#deleteOtherMfiOutId").val($("#OtherMfiClientOutFetchHiddenId").val());
			
	}
	//---------------------------------------------//
	
	/*-----------OtherId in memberPersonal details------------*/
	if($("#otherIdsID").is(':checked') == true){
		$("#otherIdsIDHidden").val('1');
		//alert($("#otherIdsIDHidden").val());
		
	}
	else{
		$("#otherIdsIDHidden").val('0');
		$("#otherIdIDName").val("");
        $("#otherIdID").val("");
        $("#otherIdIDName2").val("");
        $("#otherIdID2").val("");
		//alert($("#otherIdsIDHidden").val());
	}
	//---------------------------------------------------------
	
	/*------------OTHER DETAILS-----------*/
	//FOR DECLARATION ACKNOWLEDGED AND SIGNED
	if($("#declarationAcknowledgedSigned").is(':checked') == true)
		$("#declarationAcknowledgedSignedHidden").val('1');
	else
		$("#declarationAcknowledgedSignedHidden").val('0');
	//FOR PLEDGE ACKNOWLEDGED AND SIGNED
	if($("#pledgeAcknowledgedSigned").is(':checked') == true)
		$("#pledgeAcknowledgedSignedHidden").val('1');
	else
		$("#pledgeAcknowledgedSignedHidden").val('0');
	//FOR GUARANTOR ACKNOWLEDGED AND SIGNED
	if($("#guarantorAcknowledgedSigned").is(':checked') == true)
		$("#guarantorAcknowledgedSignedHidden").val('1');
	else
		$("#guarantorAcknowledgedSignedHidden").val('0');
	//FOR MEMBER PHOTOCOPY ATTACHED
	if($("#memberPhotocopyAttached").is(':checked') == true)
		$("#memberPhotocopyAttachedHidden").val('1');
	else
		$("#memberPhotocopyAttachedHidden").val('0');
	//FOR GUARANTOR PHOTOCOPY ATTACHED
	if($("#guarantorPhotocopyAttached").is(':checked') == true)
		$("#guarantorPhotocopyAttachedHidden").val('1');
	else
		$("#guarantorPhotocopyAttachedHidden").val('0');
	//---------------------------------------------//
	
	//MEMBER PERSONAL DETAILS VARIABLES
	var MembFirstName = document.getElementById("membFirstNameId").value;
	var MembLastName = document.getElementById("membLastNameId").value;
    if(isDataVerified==0){
        var DOB = document.getElementById("dateOfBirth").value;
    }else{
        var DOB = document.getElementById("dateOfBirthDV").value;
    }
    //var DOB = document.getElementById("dateOfBirth").value;
	var ContactNumber = document.getElementById("contactNumber").value
	var AddressDetails = document.getElementById("addressDetails").value
	var RationCardNumber = document.getElementById("RationCardNo").value
	var Gender = document.getElementById("gender").value
	var MaritalStatus = document.getElementById("maritalStatus").value
	var EducationDetails = document.getElementById("educationDetails").value
	var LoanPurpose = document.getElementById("loanPurpose").value
	//var Relationship = document.getElementById("relationship").value
	//var HusbandOrFatherName = document.getElementById("husbandOrFatherName").value
    var Relationship = document.getElementById("guarantorRelationship").value
    var HusbandOrFatherName = document.getElementById("guarantorName").value
	var HusbandOrFatherLastName = document.getElementById("husbandOrFatherLastNameId").value
	var pinCode = document.getElementById("pinCode").value
	//GUARANTOR DETAILS VARIABLES
	var GuarantorName =  document.getElementById("guarantorName").value;
	var GuarantorRelationship =  document.getElementById("guarantorRelationship").value;
	var GuarantorAddress =  document.getElementById("guarantorAddress").value;
	var guarantorId =  document.getElementById("guarantorId").value;
	//FAMILY INCOME VARIABLES
	var Name =  document.getElementById("familyMemberName").value;
	var FamilyRelationship =  document.getElementById("Relationship").value;
	var Income =  document.getElementById("income").value;
	var FamilyTotalIncome =  document.getElementById("familyTotalIncome").value;
	var FamilyMonthlyExpenses =  document.getElementById("familyMonthlyExpenses").value;
	//HOUSE VARIABLES
	var House =  document.getElementById("house").value;
	var TimePeriod =  document.getElementById("timePeriod").value;
	//var Housesqft =  document.getElementById("housesqft").value;
	var HouseCeilingType =  document.getElementById("houseCeilingType").value;
	var HouseWallType =  document.getElementById("houseWallType").value;
	var HouseFlooringDetails =  document.getElementById("houseFlooringDetails").value;
	var Housetoilet =  document.getElementById("housetoilet").value;
	//var HiddenHousehold =  document.getElementById("hiddenHousehold").value;
	var HiddenVehicle =  document.getElementById("hiddenVehicle").value;
	var HiddenHouseroom =  document.getElementById("hiddenHouseroom").value;
	//var RepayTrackRecord = document.getElementById("RepayTrackRecord").value;
	//var memberNames = document.getElementById("memberNamesHidden").value;
    if(isDataVerified==0) {
        var guarantorDOB = document.getElementById("guarantorAge").value;

    }
    else{
        var guarantorDOB = document.getElementById("guarantorAgeDV").value;
    }

    if(document.getElementById("memberName").value==0){
        $("#successMessage").hide();
		var errorLabelMember = "Please Select a Member Name";
		document.getElementById("errorLabelId").innerText = errorLabelMember;
		$(window).scrollTop(0);
	}
	else if($("#membFirstNameId").val().trim() == ""){
        var errorLabelMember = "Please fill member first name";
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else if($("#membLastNameId").val().trim() ==""){
        var errorLabelMember ="Please fill member last name";
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else if(DOB.trim() ==""){
        var errorLabelMember ="Please select member date of birth";
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }

    else if ($("#contactNumber").val().trim() ==""){
        var errorLabelMember ="Please fill member mobile number"
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else if($("#contactNumber").val().length < 10){
        var errorLabelMember ="Please provide a 10 digit mobile number"
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else if($("#addressDetails").val().trim() == ""){
        var errorLabelMember ="Please fill member address details"
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else if($("#pinCode").val().trim() ==""){
        var errorLabelMember ="Please fill member pin code"
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else if($("#pinCode").val().length < 6 | $("#pinCode").val().length > 6){
        var errorLabelMember ="Please provide a 6 digit pin code number"
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else if($("#RationCardNo").val().trim() ==""){
        var errorLabelMember ="Please fill member ration card number"
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else if($("#gender").val() == 0){
        var errorLabelMember ="Please select member gender"
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else if($("#maritalStatus").val() == 0){
        var errorLabelMember ="Please select member marital status"
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else if($("#educationDetails").val() == 0){
        var errorLabelMember ="Please select member educational details"
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else if($("#loanPurpose").val() == 0){
        var errorLabelMember ="Please select member loan purpose"
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else if($("#loanPurpose").val() == 19 && ($("#businessCategory").val() == 0)){
        var errorLabelMember ="Please select business category"
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else if($("#guarantorRelationship").val() == 0){
        var errorLabelMember ="Please select member relationship"
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else if($("#guarantorName").val().trim() == ""){
        var errorLabelMember ="Please fill member first name of the relation"
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else if($("#husbandOrFatherLastNameId").val().trim() == ""){
        var errorLabelMember ="Please fill member last name of the relation"
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else if($("#guarantorName").val().trim() == ""){
        var errorLabelMember ="Please fill guarantor name"
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else if($("#guarantorId").val().trim() == ""){
        var errorLabelMember ="Please fill guarantor id"
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else if(guarantorDOB.trim() == ""){
        var errorLabelMember ="Please fill guarantor date of birth"
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else if($("#guarantorRelationship").val() == 0){
        var errorLabelMember ="Please select guarantor relationship"
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else if($("#guarantorRelationship").val() == 85 && ($("#otherRelationShipName").val()).trim() == ""){
        //alert($("#guarantorRelationship").val());
        var errorLabelMandatory = "Please fill other guarantor relationship name"
        document.getElementById("errorLabelId").innerText = errorLabelMandatory;
        $(window).scrollTop(0);
    }
    else if($("#guarantorAddress").val().trim() == ""){
        var errorLabelMember ="Please fill guarantor address"
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        $(window).scrollTop(0);
    }
    else if($("#familyTotalIncome").val() ==0){
        var errorLabelMandatory = "Please fill Family total income"
        document.getElementById("errorLabelId").innerText = errorLabelMandatory;
        $(window).scrollTop(0);
    }
    else if($("#familyMonthlyExpenses").val().trim() =="" | $("#familyMonthlyExpenses").val() ==0){
        var errorLabelMandatory = "Please fill Family monthly expense"
        document.getElementById("errorLabelId").innerText = errorLabelMandatory;
        $(window).scrollTop(0);
    }
    else{
        if($("#loanSecuredOtherMFI").is(':checked') == true & $("#OtherMfiNameHiddenId").val() == "" & $("#OtherMfiClientNameOnDeleteShowLabel").val() == ""){
            var errorLabelMandatory = "Pleas fill other MFI loan details"
            document.getElementById("errorLabelId").innerText = errorLabelMandatory;
            $(window).scrollTop(0);
        }
        else if($("#loanSecuredOtherMFI").is(':checked') == true & incArrayCount == 0){
            var errorLabelMandatory = "Pleas fill other MFI Loan details"
            document.getElementById("errorLabelId").innerText = errorLabelMandatory;
            $(window).scrollTop(0);
        }
        else if($("#otherIdsID").is(':checked') == true & ($("#otherIdIDName").val()== "" | $("#otherIdID").val()=="")){
            //alert("fill other id name ");
            var errorLabelMandatory = "Please fill other ID 1 details"
            document.getElementById("errorLabelId").innerText = errorLabelMandatory;
            $(window).scrollTop(0);
        }
        else if($("#aadhaarNoId").val()!="" & $("#aadhaarNoId").val().length<12 & $("#aadhaarNoId").val().length<12){
            var errorLabelMandatory = "Aadhar Number Should be 12 digits"
            document.getElementById("errorLabelId").innerText = errorLabelMandatory;
            $(window).scrollTop(0);
        }
        else{
            if (isRejected == 0){
                if (DOB){
                    var today = new Date();
                    var date = DOB;
                    var datearray = date.split("/");
                    var newdate = datearray[1] + '/' + datearray[0] + '/' + datearray[2];
                    var birthDate = new Date(newdate);
                    var memberAge = today.getFullYear() - birthDate.getFullYear();
                    if(memberAge < 18){
                        var errorLabelMember ="Member age should be 18 and above only"
                        document.getElementById("errorLabelId").innerText = errorLabelMember;
                        $(window).scrollTop(0);
                    }
                    else if (memberAge > 56){
                        var errorLabelMember ="Member age should be 56 and below only"
                        document.getElementById("errorLabelId").innerText = errorLabelMember;
                        $(window).scrollTop(0);
                    }else{
                            if(isDataVerified==1){
                                var checkboxValidate=validateDVCheckboxform(1);
                                if(checkboxValidate==true){
                                    if (guarantorDOB){
                                        var today = new Date();
                                        var date = guarantorDOB;
                                        var datearray = date.split("/");
                                        var newdate = datearray[1] + '/' + datearray[0] + '/' + datearray[2];
                                        var birthDate = new Date(newdate);
                                        var guarantorAge = today.getFullYear() - birthDate.getFullYear();
                                        if(guarantorAge < 18){
                                            var errorLabelMember ="Guarantor age should be 18 and above only"
                                            document.getElementById("errorLabelId").innerText = errorLabelMember;
                                            $(window).scrollTop(0);
                                        }
                                        else if (guarantorAge > 61){
                                            var errorLabelMember ="Guarantor age should be 61 and below only"
                                            document.getElementById("errorLabelId").innerText = errorLabelMember;
                                            $(window).scrollTop(0);
                                        }
                                        else{
                                            $("#memberPopupAge").text(memberAge);
                                            $("#guarantorPopupAge").text(guarantorAge);
                                            $("#memberPopupDOB").text(DOB);
                                            $("#guarantorPopupDOB").text(guarantorDOB);
                                            $("#ageConfirmationId").popup("open");
                                        }
                                    }
                                }else{
                                    //alert("Something Went Wrong");
                                }
                            } else{
                                if (guarantorDOB){
                                    var today = new Date();
                                    var date = guarantorDOB;
                                    var datearray = date.split("/");
                                    var newdate = datearray[1] + '/' + datearray[0] + '/' + datearray[2];
                                    var birthDate = new Date(newdate);
                                    var guarantorAge = today.getFullYear() - birthDate.getFullYear();
                                    if(guarantorAge < 18){
                                        var errorLabelMember ="Guarantor age should be 18 and above only"
                                        document.getElementById("errorLabelId").innerText = errorLabelMember;
                                        $(window).scrollTop(0);
                                    }
                                    else if (guarantorAge > 61){
                                        var errorLabelMember ="Guarantor age should be 61 and below only"
                                        document.getElementById("errorLabelId").innerText = errorLabelMember;
                                        $(window).scrollTop(0);
                                    }
                                    else{
                                        $("#memberPopupAge").text(memberAge);
                                        $("#guarantorPopupAge").text(guarantorAge);
                                        $("#memberPopupDOB").text(DOB);
                                        $("#guarantorPopupDOB").text(guarantorDOB);
                                        $("#ageConfirmationId").popup("open");
                                    }
                                }
                            }

                        }
                    }
            }else{
                $("#rejectConfirmationId").popup("open");
                //callkycFormSubmission(isDataVerified,isRejected);
            }
        }
    }
}

function validateDVCheckboxform(val){
    var value = $('#memberName').val();
    var firstName = $("#firstNameID").is(':checked');
    var lastName = $("#lastNameID").is(':checked');
    var dobMember =  $("#dobNameID").is(':checked') ;
    var contactNameID = $("#contactNameID").is(':checked') ;
    var landlineNameID = $("#landlineNameID").is(':checked') ;
    var addressNameID = $("#addressNameID").is(':checked') ;
    var pinNameID = $("#pinNameID").is(':checked') ;
    var rationNameID = $("#rationNameID").is(':checked') ;
    var voterNameID = $("#voterNameID").is(':checked') ;
    var gasNameID = $("#gasNameID").is(':checked') ;
    var aadhaarId = $("#aadhaarId").is(':checked') ;
    if($("#otherIdsID").is(':checked') == true){
        var other1NameID = $("#other1NameID").is(':checked') ;
        var other1ID = $("#other1ID").is(':checked') ;
        var other2NameID = $("#other2NameID").is(':checked') ;
        var other2ID = $("#other2ID").is(':checked') ;
    }
    var genderCID = $("#genderCID").is(':checked') ;
    var maritialCID = $("#maritialCID").is(':checked') ;
    var nationalCID = $("#nationalCID").is(':checked') ;
    var relignCID = $("#relignCID").is(':checked') ;
    var casteCID = $("#casteCID").is(':checked') ;
    var educationalCID = $("#educationalCID").is(':checked') ;
    var loanCID = $("#loanCID").is(':checked') ;
    var businessCID = $("#businessCID").is(':checked') ;
    //var relationshipCID = $("#relationshipCID").is(':checked') ;
    //var husbandFirstCID = $("#husbandFirstCID").is(':checked') ;
    var husbandLastCID = $("#husbandLastCID").is(':checked') ;
    //var husbandAgeCID = $("#husbandAgeCID").is(':checked') ;
    var guarantorNameCID = $("#guarantorNameCID").is(':checked') ;
    var guarantorAgeCID = $("#guarantorAgeCID").is(':checked') ;
    var guarantorIdCID = $("#guarantorIdCID").is(':checked') ;
    var guarantorRelationshipCID = $("#guarantorRelationshipCID").is(':checked') ;
    var guarantorCID = $("#guarantorCID").is(':checked') ;
    var familyTotalIncomeCID = $("#familyTotalIncomeCID").is(':checked') ;
    var familyMonthlyExpensesCID = $("#familyMonthlyExpensesCID").is(':checked') ;
    var MemberPhotocopyAttachedCID = $("#MemberPhotocopyAttachedCID").is(':checked') ;
    var statusRemarks="";
    if(value == 0){
        $("#errorField").text("Please Select Member Name To Submit Verified Details");
        $(window).scrollTop(0);
    }
    else{
        if(firstName&lastName&dobMember&contactNameID&landlineNameID&addressNameID&pinNameID&rationNameID&voterNameID&
            gasNameID&aadhaarId&genderCID&maritialCID&nationalCID&relignCID&casteCID&educationalCID&loanCID&businessCID&
            husbandLastCID&guarantorNameCID&guarantorAgeCID&guarantorIdCID&guarantorRelationshipCID&
            guarantorCID&familyTotalIncomeCID&familyMonthlyExpensesCID&MemberPhotocopyAttachedCID){
            var status;
        }else{
            if(val==1){
                var status= "DataVerification Failed and Client Deatils Not Matched for";
            }
        }

        if(!firstName) {
            status += "\n   -Member First Name not matched";
            statusRemarks+="MFName";
        }
        if(!lastName) {
            status += "\n   -Member Last Name not matched";
            statusRemarks+="MLName,";
        }
        if(!dobMember) {
            status += "\n   -Member DOB not matched";
            statusRemarks+="MDOB,";
        }
        if(!contactNameID) {
            status += "\n   -Member Contact Number not matched";
            statusRemarks+="ContactNo,";
        }
        if(!landlineNameID) {
            status += "\n   -Member Landline Number not matched";
            statusRemarks+="Landline,";
        }
        if(!addressNameID) {
            status += "\n   -Member Address not matched";
            statusRemarks+="MAddrs,";
        }
        if(!pinNameID) {
            status += "\n   -Member Pincode not matched";
            statusRemarks+="Pincode,";
        }
        if(!rationNameID) {
            status += "\n   -Member Ration card not matched";
            statusRemarks+="Rationcard,";
        }
        if(!voterNameID) {
            status += "\n   -Member Voterid not matched";
            statusRemarks+="\n Voterid,";
        }
        if(!gasNameID) {
            status += "\n   -Member Gas number not matched";
            statusRemarks+="Gas,";
        }
        if(!aadhaarId) {
            status += "\n   -Member Aadhaar No not matched";
            statusRemarks+="Aadhaar,";
        }
        if($("#otherIdsID").is(':checked') == true){
            if(!status&!other1NameID&!other1ID&!other2NameID&!other2ID){
                var status= "DataVerification Failed and Client Deatils Not Matched for";
            }
            if(!other1NameID) {
                status += "\n   -Member OtherID Name not matched";
                statusRemarks+="OtName,";
            }
            if(!other1ID) {
                status += "\n   -Member Other ID One not matched";
                statusRemarks+="ID1,";
            }
            if(!other2NameID) {
                status += "\n   -Member Other Id Two Name not matched";
                statusRemarks+="OtName2,";
            }
            if(!other2ID) {
                status += "\n   -Member Other Id two not matched";
                statusRemarks+="ID2,";
            }
        }
        if(!genderCID) {
            status += "\n   -Member Gender not matched";
            statusRemarks+="\n MGender,";
        }
        if(!maritialCID) {
            status += "\n   -Member Marital Status not matched";
            statusRemarks+="Marital,";
        }
        if(!nationalCID) {
            status += "\n   -Member Nationality not matched";
            statusRemarks+="Nationality,";
        }
        if(!relignCID) {
            status += "\n   -Member Relign not matched";
            statusRemarks+="Relign,";
        }
        if(!casteCID) {
            status += "\n   -Member Caste not matched";
            statusRemarks+="Caste,";
        }
        if(!educationalCID) {
            status += "\n   -Member Educational not matched";
            statusRemarks+="Educational,";
        }
        if(!loanCID) {
            status += "\n   -Member loanpurpose not matched";
            statusRemarks+="LoanPurpose,";
        }
        if(!businessCID) {
            status += "\n   -Member Business Category not matched";
            statusRemarks+="\n Business,";
        }
       /* if(!relationshipCID) {
            status += "\n   -Member Relationship not matched";
            statusRemarks+=",Relationship";
        }*/
       /* if(!husbandFirstCID) {
            status += "\n   -Relation First Name not matched";
            statusRemarks+=",ReFName";
        }*/
        if(!husbandLastCID) {
            status += "\n   -Relation last name not matched";
            statusRemarks+="ReLName,";
        }
        /*if(!husbandAgeCID) {
            status += "\n   -Relation DOB not matched";
            statusRemarks+=",ReDOB";
        }*/
        if(!guarantorNameCID) {
            status += "\n   -Guarantor First Name not matched";
            statusRemarks+="\n GFName,";
        }
        if(!guarantorAgeCID) {
            status += "\n   -Guarantor DOB not matched";
            statusRemarks+="GDOB,";
        }
        if(!guarantorIdCID) {
            status += "\n   -Guarantor Id not matched";
            statusRemarks+="GId,";
        }
        if(!guarantorRelationshipCID) {
            status += "\n   -Guarantor Relationship not matched";
            statusRemarks+="GRelation,";
        }
        if(!guarantorCID) {
            status += "\n   -Guarantor Address not matched";
            statusRemarks+="GAddr,";
        }
        if(!familyTotalIncomeCID) {
            status += "\n   -Family Monthly Income not matched";
            statusRemarks+="FIncome,";
        }
        if(!familyMonthlyExpensesCID) {
            status += "\n   -Family Monthly Expense not matched";
            statusRemarks+="FExp,";
        }
        if(!MemberPhotocopyAttachedCID) {
            status += "\n   -Member Photo copy Attached not matched";
            statusRemarks+="MPhoto";
        }
        /*var r = confirm(status);
        if (r == true) {
            return true;
        }
        else{
            return false;
        }*/
        if(val==1){
            if(status){
                alert(status);
                return false;
            }else{
                return true;
            }
        }else{
            return statusRemarks;
        }
    }
}

function callkycFormSubmission(isDataVerified,isRejected){

    $("#isRejected").val(isRejected);
    //remove the images
    $("#base64Image").val("");
    $("#leftPanel").remove();
    $('#submitDivId').hide();
    //family details popup
    familyMemberNameArray  = $.grep(familyMemberNameArray ,function(n){return(n);});
    $('#nameIdHidden').val(familyMemberNameArray);
    ageArray   = $.grep(ageArray  ,function(n){return(n);});
    $('#ageIdHidden').val(ageArray);
    genderArray   = $.grep(genderArray  ,function(n){return(n);});
    $('#genderIdHidden').val(genderArray);
    relationshipArray   = $.grep(relationshipArray  ,function(n){return(n);});
    $('#relationshipIdHidden').val(relationshipArray);
    otherRelationshipNameArray   = $.grep(otherRelationshipNameArray  ,function(n){return(n);});
    $('#otherRelationshipHidden').val(otherRelationshipNameArray);
    educationArray   = $.grep(educationArray  ,function(n){return(n);});
    $('#educationIdHidden').val(educationArray);
    occupationArray   = $.grep(occupationArray  ,function(n){return(n);});
    $('#occupationIdHidden').val(occupationArray);
    incomeArray   = $.grep(incomeArray  ,function(n){return(n);});
    $('#incomeIdHidden').val(incomeArray);
    //other mfi loan popup
    otherMfiNameArray  = $.grep(otherMfiNameArray ,function(n){return(n);});
    $("#OtherMfiNameHiddenId").val(otherMfiNameArray);
    otherMfiAmtSecuredArray   = $.grep(otherMfiAmtSecuredArray  ,function(n){return(n);});
    $("#OtherMfiAmountHiddenId").val(otherMfiAmtSecuredArray);
    otherMfiLoanOutstandingArray   = $.grep(otherMfiLoanOutstandingArray  ,function(n){return(n);});
    $("#OtherMfiOutstandingHiddenId").val(otherMfiLoanOutstandingArray);
    $.mobile.showPageLoadingMsg();
    var url=localStorage.contextPath+"/client/ci/savekycupdating/"+isDataVerified;
    var form="BMFormId";
    document.getElementById(form).method='POST';
    document.getElementById(form).action=url;
    document.getElementById(form).submit();

}
function cancelCallKYCUpdate(){
    $("#ageConfirmationId").popup("close");
}

//Check for already exist member
function checkAlreadyExistingMember(contactNumber,rationCardNumber,voterId,aadhaarNumber,callback) {
	var data = {};
	data.rationCardNumber = rationCardNumber;
	data.contactNumber = contactNumber;
	data.voterId = voterId;
	data.aadhaarNumber = aadhaarNumber;
	ajaxVariable = $.ajax({
        beforeSend : function() {
            $.mobile.showPageLoadingMsg();
        },
        complete: function() {
            $.mobile.hidePageLoadingMsg()
        },
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json',
		url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/client/checkforexistingmember',						
		success: function(data) {
			callback(data.noOfClients,data.groupName,data.centerName,data.clientName);
		},error : function(jqXHR, textStatus, error) {
			alert("textStatus"+textStatus);
			alert("error"+error);
			
		}	
	});
}

function kycFormSubmissionForNMIClients(){
	/*----------------HOUSE DETAILS-----------------*/
	//--------------HOUSEHOLD DETAILS---------------//
	/*var housholdDetails = new Array();
		
	if($("#television").is(':checked') == true){      
		housholdDetails.push($("#televisionID").text());
	}
	if($("#mixie").is(':checked')==true){
		housholdDetails.push($("#mixieID").text());
	}
	if($("#grinder").is(':checked')==true){
		housholdDetails.push($("#grinderID").text());
	}
	if($("#refrigerator").is(':checked')==true){
		housholdDetails.push($("#refrigeratorID").text());
	}
	if($("#washingMachine").is(':checked')==true){
		housholdDetails.push($("#washingMachineID").text());
	}
	$("#hiddenHousehold").val(housholdDetails);*/
	//---------------------------------------------//	
	
	//---------------VEHICLE DETAILS--------------//
	var vehicleDetails = new Array();
	
	if($("#bicycle").is(':checked') == true){      
		vehicleDetails.push($("#bicycleID").text());
	}
	if($("#scooter").is(':checked')==true){
		vehicleDetails.push($("#scooterID").text());
	}
	if($("#moped").is(':checked')==true){
		vehicleDetails.push($("#mopedID").text());
	}
	if($("#bike").is(':checked')==true){
		vehicleDetails.push($("#bikeID").text());
	}
	if($("#car").is(':checked')==true){
		vehicleDetails.push($("#carID").text());
	}
	if($("#others").is(':checked')==true){
		vehicleDetails.push($("#othersID").text());
	}
	$("#hiddenVehicle").val(vehicleDetails);
	//---------------------------------------------//
	
	//--------------HOUSEROOM DETAILS--------------//
	var houseroomDetails = new Array();
	
	if($("#hall").is(':checked') == true){      
		houseroomDetails.push($("#hallID").text());
	}
	if($("#kitchen").is(':checked')==true){
		houseroomDetails.push($("#kitchenID").text());
	}
	if($("#1room").is(':checked')==true){
		houseroomDetails.push($("#1roomID").text());
	}
	if($("#2rooms").is(':checked')==true){
		houseroomDetails.push($("#2roomsID").text());
	}
	if($("#3rooms").is(':checked')==true){
		houseroomDetails.push($("#3roomsID").text());
	}
	$("#hiddenHouseroom").val(houseroomDetails);
	
	//---------------------------------------------//
	
	
	/*-------------BANK ACCOUNT DETAILS-------------*/
	//FOR BANK_ACCOUNT
	if($("#bankAccount").is(':checked') == true)
		$("#bankAccountHidden").val('1');
	else
		$("#bankAccountHidden").val('0');
	//FOR SAVINGS
	if($("#savings").is(':checked') == true)
		$("#savingsHidden").val('1');
	else
		$("#savingsHidden").val('0');
	//FOR LIFETIME_INSURANCE
	/*if($("#lifeTimeInsurance").is(':checked') == true)
		$("#lifeTimeInsuranceHidden").val('1');
	else
		$("#lifeTimeInsuranceHidden").val('0');
	//FOR ACCIDENTAL_INSURANCE
	if($("#accidentalInsurance").is(':checked') == true)
		$("#accidentalInsuranceHidden").val('1');
	else
		$("#accidentalInsuranceHidden").val('0');
	//FOR MEDICAL_INSURANCE
	if($("#medicalInsurance").is(':checked') == true)
		$("#medicalInsuranceHidden").val('1');
	else
		$("#medicalInsuranceHidden").val('0');*/
	//---------------------------------------------//
	
	
	/*------------OTHER MFI LOAN DETAILS-----------*/
	//FOR ISLOANSECURED
	if($("#loanSecuredOtherMFI").is(':checked') == true)
		$("#otherMfiLoanHidden").val('1');
	else
		$("#otherMfiLoanHidden").val('0');
		
	//validation
	if(!($("#loanSecuredOtherMFI").is(':checked') == true)){
		//alert("Hello");
		$("#OtherMfiNameHiddenId").val('');
		$("#deleteOtherMfiClientId").val($("#OtherMfiClientNameFetchHiddenId").val());
	}
	//---------------------------------------------//
	
	/*-----------OtherId in memberPersonal details------------*/
	if($("#otherIdsID").is(':checked') == true){
		$("#otherIdsIDHidden").val('1');
		//alert($("#otherIdsIDHidden").val());
		
	}
	else{
		$("#otherIdsIDHidden").val('0');
		$("#otherIdIDName").val("");
		$("#otherIdID").val("");
		//alert($("#otherIdsIDHidden").val());
	}
	//---------------------------------------------------------
	
	
	/*------------OTHER DETAILS-----------*/
	//FOR DECLARATION ACKNOWLEDGED AND SIGNED
	if($("#declarationAcknowledgedSigned").is(':checked') == true)
		$("#declarationAcknowledgedSignedHidden").val('1');
	else
		$("#declarationAcknowledgedSignedHidden").val('0');
	//FOR PLEDGE ACKNOWLEDGED AND SIGNED
	if($("#pledgeAcknowledgedSigned").is(':checked') == true)
		$("#pledgeAcknowledgedSignedHidden").val('1');
	else
		$("#pledgeAcknowledgedSignedHidden").val('0');
	//FOR GUARANTOR ACKNOWLEDGED AND SIGNED
	if($("#guarantorAcknowledgedSigned").is(':checked') == true)
		$("#guarantorAcknowledgedSignedHidden").val('1');
	else
		$("#guarantorAcknowledgedSignedHidden").val('0');
	//FOR MEMBER PHOTOCOPY ATTACHED
	if($("#memberPhotocopyAttached").is(':checked') == true)
		$("#memberPhotocopyAttachedHidden").val('1');
	else
		$("#memberPhotocopyAttachedHidden").val('0');
	//FOR GUARANTOR PHOTOCOPY ATTACHED
	if($("#guarantorPhotocopyAttached").is(':checked') == true)
		$("#guarantorPhotocopyAttachedHidden").val('1');
	else
		$("#guarantorPhotocopyAttachedHidden").val('0');
	//---------------------------------------------//
	
	//NMI Information
	//MEMBER PERSONAL DETAILS VARIABLES
	var MembFirstName = document.getElementById("membFirstNameId").value;
	var MembLastName = document.getElementById("membLastNameId").value;
	var DOB = document.getElementById("dateOfBirth").value;
	var ContactNumber = document.getElementById("contactNumber").value;
	var AddressDetails = document.getElementById("addressDetails").value;
	var RationCardNumber = document.getElementById("RationCardNo").value;
	var Gender = document.getElementById("gender").value;
	var MaritalStatus = document.getElementById("maritalStatus").value;
	var EducationDetails = document.getElementById("educationDetails").value;
	var LoanPurpose = document.getElementById("loanPurpose").value;
	var Relationship = document.getElementById("relationship").value;
	var HusbandOrFatherName = document.getElementById("husbandOrFatherName").value;
	var HusbandOrFatherLastName = document.getElementById("husbandOrFatherLastNameId").value;
	//GUARANTOR DETAILS VARIABLES
	var GuarantorName =  document.getElementById("guarantorName").value;
	var GuarantorRelationship =  document.getElementById("guarantorRelationship").value;
	var GuarantorAddress =  document.getElementById("guarantorAddress").value;
	//FAMILY INCOME VARIABLES
	var Name =  document.getElementById("familyMemberName").value;
	var FamilyRelationship =  document.getElementById("Relationship").value;
	var Income =  document.getElementById("income").value;
	var FamilyTotalIncome =  document.getElementById("familyTotalIncome").value;
	var FamilyMonthlyExpenses =  document.getElementById("familyMonthlyExpenses").value;
	//HOUSE VARIABLES
	var House =  document.getElementById("house").value;
	var TimePeriod =  document.getElementById("timePeriod").value;
	//var Housesqft =  document.getElementById("housesqft").value;
	var HouseCeilingType =  document.getElementById("houseCeilingType").value;
	var HouseWallType =  document.getElementById("houseWallType").value;
	var HouseFlooringDetails =  document.getElementById("houseFlooringDetails").value;
	var Housetoilet =  document.getElementById("housetoilet").value;
	//var HiddenHousehold =  document.getElementById("hiddenHousehold").value;
	var HiddenVehicle =  document.getElementById("hiddenVehicle").value;
	var HiddenHouseroom =  document.getElementById("hiddenHouseroom").value;
	//var RepayTrackRecord = document.getElementById("RepayTrackRecord").value;
	//var memberNames = document.getElementById("memberNamesHidden").value;
	
	if(document.getElementById("memberName").value==0){
        $("#successMessage").hide();
		var errorLabelMember = "Please Select a Member Name";
		document.getElementById("errorLabelId").innerText = errorLabelMember;
		$(window).scrollTop(0);
	}
	else{
		if(MembFirstName!="" &  MembLastName!="" & DOB!="" & ContactNumber!="" & AddressDetails!="" & RationCardNumber!="" & Gender!='0' & MaritalStatus!='0' 
		& EducationDetails!='0' & pinCode!="" & LoanPurpose!='0' & Relationship!='0' & HusbandOrFatherName!="" & HusbandOrFatherLastName!="" 
		& GuarantorName!="" & GuarantorRelationship!='0' & GuarantorAddress!="" & FamilyTotalIncome!='0' 
		& FamilyMonthlyExpenses!='0' & FamilyMonthlyExpenses!="" ){
		
			
			if($("#loanSecuredOtherMFI").is(':checked') == true & $("#OtherMfiNameHiddenId").val() == "" & $("#OtherMfiClientNameOnDeleteShowLabel").val() == ""){
				var errorLabelMandatory = "Pleas fill other MFI loan details"
				document.getElementById("successMessage").innerText = errorLabelMandatory;
				$(window).scrollTop(0);
			}
			else if($("#loanSecuredOtherMFI").is(':checked') == true & incArrayCount == 0){
				var errorLabelMandatory = "Pleas fill other MFI loan details"
				document.getElementById("successMessage").innerText = errorLabelMandatory;
				$(window).scrollTop(0);
			
			}
			else if((ContactNumber.length < 10)){
				var errorLabelMandatory = "Please provide 10 digit contact number"
				document.getElementById("successMessage").innerText = errorLabelMandatory;
				$(window).scrollTop(0);
			}
			else if((pinCode.length > 6) || (pinCode.length < 6) ){
				var errorLabelMandatory = "Please provide a six digit pin code number"
				document.getElementById("successMessage").innerText = errorLabelMandatory;
				$(window).scrollTop(0);
			}
			else if($("#otherIdsID").is(':checked') == true & ($("#otherIdIDName").val()== "" | $("#otherIdID").val()=="")){
				//alert("fill other id name ");
				var errorLabelMandatory = "Pleas fill other ID details"
				document.getElementById("successMessage").innerText = errorLabelMandatory;
				$(window).scrollTop(0);
			}
			else{
				//family details popup
				familyMemberNameArray  = $.grep(familyMemberNameArray ,function(n){return(n);});
				$('#nameIdHidden').val(familyMemberNameArray);
				ageArray   = $.grep(ageArray  ,function(n){return(n);});
				$('#ageIdHidden').val(ageArray);
				genderArray   = $.grep(genderArray  ,function(n){return(n);});
				$('#genderIdHidden').val(genderArray);
				relationshipArray   = $.grep(relationshipArray  ,function(n){return(n);});
				$('#relationshipIdHidden').val(relationshipArray);
                otherRelationshipNameArray   = $.grep(otherRelationshipNameArray  ,function(n){return(n);});
                $('#otherRelationshipHidden').val(otherRelationshipNameArray);
				educationArray   = $.grep(educationArray  ,function(n){return(n);});
				$('#educationIdHidden').val(educationArray);
				occupationArray   = $.grep(occupationArray  ,function(n){return(n);});
				$('#occupationIdHidden').val(occupationArray);
				incomeArray   = $.grep(incomeArray  ,function(n){return(n);});
				$('#incomeIdHidden').val(incomeArray);
				//other mfi loan popup
				otherMfiNameArray  = $.grep(otherMfiNameArray ,function(n){return(n);});
				$("#OtherMfiNameHiddenId").val(otherMfiNameArray);			
				otherMfiAmtSecuredArray   = $.grep(otherMfiAmtSecuredArray  ,function(n){return(n);});
				$("#OtherMfiAmountHiddenId").val(otherMfiAmtSecuredArray);
				otherMfiLoanOutstandingArray   = $.grep(otherMfiLoanOutstandingArray  ,function(n){return(n);});
				$("#OtherMfiOutstandingHiddenId").val(otherMfiLoanOutstandingArray);

                $.mobile.showPageLoadingMsg();
				var url=localStorage.contextPath+"/client/ci/client/nmisavekycupdating";
				var form="BMFormId";
				document.getElementById(form).method='POST';
				document.getElementById(form).action=url;
				document.getElementById(form).submit();
			}
		}
		else{
			var errorLabelMandatory = "Please fill all mandatory fields"
			document.getElementById("successMessage").innerText = errorLabelMandatory;
			$(window).scrollTop(0);
		}
		
	}
	
}

//function for kycupdating form submission
function KYC_FormSubmission(groupId,groupName,isDataVerified){
    var operationId;
    if($('#pageName').val() == 'KYC_Update' || $('#pageName').val() == 'KYC_Update_New'){
       operationId = kycUpdatingOperationId;
    }
    else{
        operationId = dataVerificationOperationId;
    }
    $.mobile.showPageLoadingMsg();
    GroupIdKYC =groupId;
    GroupNameKYC =groupName;
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/kycupdating/"+GroupIdKYC+"/"+GroupNameKYC+"/"+isDataVerified+"/"+operationId;
    document.getElementById("BMFormId").submit();
}

function KYC_FormSubmissionForNMIClients(groupId,groupName){
    $.mobile.showPageLoadingMsg();
	/*document.getElementById("groupNameHidden").value = document.getElementById("groupNameId").innerText
	document.getElementById("labelGroupsId").innerText*/
	GroupIdKYC =groupId;
	GroupNameKYC =groupName;
	var urlforNMI=localStorage.contextPath+"/client/ci/NMIClientsVerification/"+GroupIdKYC+"/NMIClients";
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=urlforNMI;
	document.getElementById("BMFormId").submit();
	
}
//memberName onchange function
function memberNameOnchange(isDataVerified){
    var memberNameId= document.getElementById("memberName").value;
	var memberName = $("#memberName option:selected").text().split(" ");
	var memberFirstName = memberName[0];
	if(memberNameId !='0'){
		if(memberFirstName != "mfn"){
			$('#memberNameIdHidden').val(memberFirstName);
			$('#MemberLastNameIdHidden').val(memberName[1]);
		}
		$.mobile.showPageLoadingMsg();
        $("#base64Image").val("");
		var form= "BMFormId";
		$("#leftPanel").remove();
		document.getElementById(form).method='POST';
        if(isDataVerified == 1){     // Added by chitra
            document.getElementById(form).action = localStorage.contextPath+"/client/ci/kycupdating/member/"+memberNameId+"/1";
        }else{
            document.getElementById(form).action = localStorage.contextPath+"/client/ci/kycupdating/member/"+memberNameId+"/0";
        }
		document.getElementById(form).submit().refresh();
	}else{
        var errorLabelMember = "Please select a member name";
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        document.getElementById("kycUpdatedBy").innerText = "";
    }
}

function memberNameOnchangeForNMIClients(){
	var memberNameId= document.getElementById("memberName").value
	if(memberNameId !='0'){
        $.mobile.showPageLoadingMsg();
		var form= "BMFormId";
		document.getElementById(form).method='POST';
		document.getElementById(form).action = localStorage.contextPath+"/client/ci/NMIClientsVerification/member/"+memberNameId+"/memberId";
		document.getElementById(form).submit().refresh();
	}else{
        var errorLabelMember = "Please select a member name";
        document.getElementById("errorLabelId").innerText = errorLabelMember;
        document.getElementById("kycUpdatedBy").innerText = "";
    }
}

// Paramasivan
function downloadRequestedDocument(){
    $('#errorLabelId').text('');
    $('#panelImage').remove();
    var groupId=$("#groupIdHidden").val();
    var memberId = $("#memberName").val();
    if(memberId != 0) {
        var groupId=$("#groupIdHidden").val();
        var previousImage = -1,count=2;
        imageNameArray = new Array();
        imagesArray = new Array();
        countValue = 1;
        incArrayImage = 0;
        $.mobile.showPageLoadingMsg();
        $.post("http://" + ajaxcallip + localStorage.contextPath+"/client/ci/kycdownload/groupId/" + groupId + "/kycdownloadNew",
            { memberID:memberId,  documentTypeID:-1,retrieveType: 2},
            function (data) {
                $.mobile.hidePageLoadingMsg();
                if(data.status == 'success') {
                    $('.buttonWrapper,.wrapper').show();
                    splitPage();
                    $('#collapseButtonDiv').show();
                    // for loading images
                    newContent = '<div id="panelImage" class="viewer">';
                    $(".wrapper").append(newContent).trigger('create');
                    var imageId;
                    for (var i = 0; i < data.base64ImageArray.length; i++) {
                        if (previousImage > 0) {
                            if (previousImage == data.docTypeIdArray[i]) {
                                imageId = data.docTypeNameArray[i] + " " + count;
                                count++;
                            }
                            else {
                                imageId = data.docTypeNameArray[i] + " 1";
                                count = 2;
                            }
                        }
                        else {
                            imageId = data.docTypeNameArray[i] + " 1"
                            $('#imageName').text(data.docTypeNameArray[0] + " 1");
                            $("#panelImage").iviewer({src: data.base64ImageArray[0]});
                            currentImage = data.base64ImageArray[0];
                        }
                        previousImage = data.docTypeIdArray[i];
                        imageNameArray[i] = imageId;
                        imagesArray.push({imageId:i,image:data.base64ImageArray[i],deg:0});
                    }
                }
                else{
                    $('#errorLabelId').text('No documents found for this member');
                }
            }
        );
    }
    else{
        $('#rightPanel').css('overflow','hidden');
    }
}

$(document).ready(function() {
    //Added by Paramasivan to retrieve image
    $('#collapseButtonDiv').show();
	$(function () {
        if($('#menuName').val() == 'new') {
            var accessType = $("#accessTypeIdId").val();
            imageNameArray = $('#availDocTypeName').val().split(',');
            var base64Array = $('#base64Image').val().split(',');
            if (base64Array.length > 0 && $('#base64Image').val() != 'undefined' && $('#status').val() != 'failure') {
                $('#errorLabelId').text('');
                $('#panelImage').remove();
                $('#rightPanel').css('overflow-y', 'scroll');
                $("body").css("overflow-x", "hidden");
                $('#mainSplitter').jqxSplitter({ width: '100%', height: '800', panels: [
                    { size: '60%' },
                    { size: '40%' }
                ] });
                $('.buttonWrapper,.wrapper').show();
                newContent = '<div id="panelImage" class="viewer">';
                $(".wrapper").append(newContent).trigger('create');
                $('#imageName').text(imageNameArray[0]);
                var indexValue = 0;
                if(accessType == 1) {
                    $("#panelImage").iviewer({src: (base64Array[0])});
                    for (var i = 0; i < base64Array.length;) {
                        imagesArray.push({image: (base64Array[indexValue]), deg: 0});
                        indexValue++;
                        i++;
                    }
                }
                else{
                    $("#panelImage").iviewer({src: (base64Array[0] + "," + base64Array[1])});
                    for (var i = 0; i < base64Array.length / 2;) {
                        if (i == 0) {
                            imagesArray.push({image: (base64Array[indexValue] + "," + base64Array[indexValue + 1]), deg: 0});
                            indexValue++;
                        }
                        else {
                            imagesArray.push({image: (base64Array[indexValue + 1] + "," + base64Array[indexValue + 2]), deg: 0});
                            indexValue += 2;
                        }
                        i++;
                    }

                }
            }
            else if ($('#status').val() == 'failure') {
                $('#errorLabelId').text('No documents found for this member');
            }
        }
    })

    $('#OtherMFIdetails').hide();
    $('#houseHoldDetails').hide();



    $("#imageClarityOptions").click(function(){
        $("#documentList").show();
        $("#reasonList").hide();
    });

    $("#reasonForHoldOptions").click(function(){
        $("#documentList").hide();
        $("#reasonList").show();
    });

    $('#next').click(function(){
        if(imagesArray.length > countValue){
            countValue++;
            $('#imageName').text(imageNameArray[countValue-1]);
            $("#panelImage").iviewer('loadImage', (imagesArray[countValue-1].image,imagesArray[countValue-1].image),imagesArray[countValue-1].deg);
        }
    });

    $('#previous').click(function(){
        if(countValue > 1){
            countValue--;
            $('#imageName').text(imageNameArray[countValue-1]);
            $("#panelImage").iviewer('loadImage', (imagesArray[countValue-1].image,imagesArray[countValue-1].image),imagesArray[countValue-1].deg);
        }
    });

    $("#rotateRight").click(function(){
        $("#panelImage").iviewer('angle', angle);
        rotateImage(angle,countValue-1)
    });
    $("#rotateLeft").click(function(){
        $("#panelImage").iviewer('angle', -angle);
        rotateImage(-angle,countValue-1)
    });

    if ($("#memberName").val() == 0) {
        $("#collapseButtonDiv,.updatedDetails").hide();
    }

    if($("#loanPurpose").val() == 19) {
        $("#businessCategoryDiv").show();
    }else{
        $("#businessCategoryDiv").hide();
    }

    $(function() {
        $("#dateOfBirth").datepicker({
            maxDate: '-18Y',
            dateFormat: 'dd/mm/yy',
            yearRange: "-90:+0",
            changeMonth: true,
            changeYear: true
        });
    });
    $(function() {
        $("#husbandOrFatherAge").datepicker({
            maxDate: '-18Y',
            dateFormat: 'dd/mm/yy',
            yearRange: "-90:+0",
            changeMonth: true,
            changeYear: true
        });
    });
    $(function() {
        $("#guarantorAge").datepicker({
            maxDate: '-18Y',
            dateFormat: 'dd/mm/yy',
            yearRange: "-90:+0",
            changeMonth: true,
            changeYear: true
        });
    });
    $(function() {
        $("#age").datepicker({
            maxDate: new Date,
            dateFormat: 'dd/mm/yy',
            yearRange: "-90:+0",
            changeMonth: true,
            changeYear: true
        });
    });
    //needImageClarity docType save button click
    $("#needImageClaritySaveId").click(function(){
        var docTypeIdArrayLength = document.getElementById("docTypeIdArrayHiddenId").value;
        var memberNameId= document.getElementById("memberName").value
        var selectedDocTypeIdArray = new Array();

        var reasonForHoldIdArrayLength = document.getElementById("reasonForHoldArrayHiddenId").value;
        var selectedreasonForHoldArray = new Array();

        //if need image clarity
        if($("input[name='reasonForHoldRadio']:checked").val() == 1) {
            for(var i=0;i<docTypeIdArrayLength;i++){
                if($('#documentTypeId'+i).is(':checked') == true){
                    //alert("checked: "+$('#documentTypeId'+i).val());
                    selectedDocTypeIdArray.push($('#documentTypeId'+i).val());
                }
            }
            $('#selectedDocTypeArrayHiddenId').val(selectedDocTypeIdArray);
            $('#reasonForHoldRemarksId').val(document.getElementById("needImageClarityRemarksId").value)
        }
        // if need for RM approval
        else {
            for(var i=0;i<docTypeIdArrayLength;i++){
                if($('#reasonTypeId'+i).is(':checked') == true){
                    //alert("checked: "+$('#documentTypeId'+i).val());
                    selectedDocTypeIdArray.push($('#reasonTypeId'+i).val());
                }
            }

            if(document.getElementById("needReasonForHoldRemarksId").value !="") {
                $('#reasonForHoldRemarksId').val(document.getElementById("needReasonForHoldRemarksId").value);
                selectedDocTypeIdArray.push(" Remarks : " + $('#reasonForHoldRemarksId').val());
            }
            $('#selectedDocTypeArrayHiddenId').val(selectedDocTypeIdArray);
        }
        if(document.getElementById("memberName").value==0){
            $("#successMessage").hide();
            var errorLabelMember = "Please select a member name";
            document.getElementById("errorLabelId").innerText = errorLabelMember;
            $(window).scrollTop(0);
        }else if(document.getElementById("reasonForHoldRemarksId").value ==""){
            var errorLabelMember = "Please enter remarks";
            //document.getElementById("errorLabelId").innerText = errorLabelMember;
            document.getElementById("errorFieldNICPopup").innerText = errorLabelMember;
            //$(window).scrollTop(0);
            $("a#needImageClaritySaveId").attr('href','');

        }else if(document.getElementById("selectedDocTypeArrayHiddenId").value !=""){
            $("#base64Image").val("");
            $.mobile.showPageLoadingMsg();
            var url=localStorage.contextPath+"/client/ci/KYC_updatingNeedImageClarity/member/"+memberNameId+"/memberId";
            var form="BMFormId";
            $('#reasonForHoldRemarksId').val("[DEO] " + $('#reasonForHoldRemarksId').val());
            //remove the images
            $("#leftPanel").remove();
            document.getElementById(form).method='POST';
            document.getElementById(form).action=url;
            document.getElementById(form).submit();
        }else{
            document.getElementById("errorFieldNICPopup").innerText = "Please select a document type";
            $("a#needImageClaritySaveId").attr('href','');
        }
    });
    $("#needImageClarityCancelId").click(function(){
        document.getElementById("errorFieldNICPopup").innerText = "";
    });
    $('#listoffice').on('change',function(){
        $.mobile.showPageLoadingMsg();
        document.getElementById("BMFormId").method='POST';
        document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groupsWhileOfficeChange/"+$('#listoffice').val()+"/"+$('#operationId').val();
        document.getElementById("BMFormId").submit();
    });

    $('#listofficeId').on('change',function(){
        $.mobile.showPageLoadingMsg();
        document.getElementById("BMFormId").method='POST';
        document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/verification/groupsWhileOfficeChange/"+$('#listoffice').val();
        document.getElementById("BMFormId").submit();
    });
    $('#listofficeforRM').on('change',function(){
        $.mobile.showPageLoadingMsg();
        document.getElementById("BMFormId").method='POST';
        document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/listClients/Office/"+$('#listofficeforRM').val()+"/"+$('#currentOperationId').val();
        document.getElementById("BMFormId").submit();
    });

    if(document.getElementById("OtherMfiClientNameCountHiddenId") != null){
        incArrayCount = document.getElementById("OtherMfiClientNameCountHiddenId").value;
    }

	//alert("Count = "+incArrayCount);
	
	//OTHER MFI LOAN CHECK TOGGLE
	
	$('#addOtherMfiLoansButtonId').hide();
	$('#popupShowDivId').hide();
	$('#loanSecuredOtherMFI').click(function(){
	
		$('#addOtherMfiLoansButtonId').toggle();
		$('#popupShowDivId').toggle();
		
	});
	
	//other ID member personal check toggle
	$("#OtherIdNameDiv").hide();
	$("#otherIdIDDiv").hide();
    $("#OtherIdNameDiv2").hide();
	$("#otherIdIDDiv2").hide();
    $("#otherIdRelationShipDiv").hide();
    //$("#otherIdIDDiv2").hide();
    $("#OtherIdNameCDiv").hide();
    $("#otherIdIDCDiv").hide();
    $("#OtherIdNameCDiv2").hide();
    $("#otherIdCDiv2").hide();
    $("#otherIdLengthDiv").hide();
    $("#otherId2LengthDiv").hide();
    $("#otherIdFamilyRelationShipDiv").hide();
	$("#otherIdsLabelID").click(function(){
    	$("#OtherIdNameDiv").toggle();
		$("#otherIdIDDiv").toggle();
        $("#OtherIdNameDiv2").toggle();
        $("#otherIdIDDiv2").toggle();
        //$("#otherIdIDDiv2").toggle();
        $("#OtherIdNameCDiv").toggle();
        $("#otherIdIDCDiv").toggle();
        $("#OtherIdNameCDiv2").toggle();
        $("#otherIdCDiv2").toggle();
        $("#otherIdLengthDiv").toggle();
        $("#otherId2LengthDiv").toggle();
	});
	
	
	//NUMBER VALIDATION
	$("#contactNumber").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
		if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || event.keyCode  == 37 || event.keyCode  == 39 ||
             // Allow: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) || 
             // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        else {
            // Ensure that it is a number and stop the keypress
            if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
                event.preventDefault(); 
            }   
        }
    });
	
	$("#pinCode").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
        if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || event.keyCode  == 37 || event.keyCode  == 39 ||
             // Allow: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) || 
             // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        else {
            // Ensure that it is a number and stop the keypress
            if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
                event.preventDefault(); 
            }   
        }
    });
	
	$("#addressDetails").keydown(function(event) {
		if((!event.shiftKey && event.keyCode == 222) || event.keyCode == 220) {
			return false; 
		}
	});
	
	$("#guarantorAddress").keydown(function(event) {
		if((!event.shiftKey && event.keyCode == 222) || event.keyCode == 220) {
			return false; 
		}
	});
	
	$("#RationCardNo").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
        return event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || event.keyCode  == 37 || event.keyCode  == 39 ||
             // Allow: Ctrl+A
           (event.keyCode == 65 && event.ctrlKey === true) || event.keyCode == 111 || (!event.shiftKey && event.keyCode == 191) || 
             // Allow: home, end, left, right
           (event.keyCode >= 35 && event.keyCode <= 39) || (event.keyCode >= 48 && event.keyCode <= 57 && !event.shiftKey)
			|| (event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 96 && event.keyCode <= 105)
    });
	
	$("#voterIdID").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
        return event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || event.keyCode  == 37 || event.keyCode  == 39 ||
             // Allow: Ctrl+A
           (event.keyCode == 65 && event.ctrlKey === true) || event.keyCode == 111 || (!event.shiftKey && event.keyCode == 191) ||
             // Allow: home, end, left, right
           (event.keyCode >= 35 && event.keyCode <= 39) || (event.keyCode >= 48 && event.keyCode <= 57 && !event.shiftKey)
			|| (event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 96 && event.keyCode <= 105)
    });
	$("#guarantorId").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
        return event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || event.keyCode  == 37 || event.keyCode  == 39 ||
             // Allow: Ctrl+A
           (event.keyCode == 65 && event.ctrlKey === true) || event.keyCode == 111 || (!event.shiftKey && event.keyCode == 191) ||
             // Allow: home, end, left, right
           (event.keyCode >= 35 && event.keyCode <= 39) || (event.keyCode >= 48 && event.keyCode <= 57 && !event.shiftKey)
			|| (event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 96 && event.keyCode <= 105)
    });
	$("#gasNumberId").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
        return event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || event.keyCode  == 37 || event.keyCode  == 39 ||
             // Allow: Ctrl+A
           (event.keyCode == 65 && event.ctrlKey === true) ||
             // Allow: home, end, left, right
           (event.keyCode >= 35 && event.keyCode <= 39) || (event.keyCode >= 48 && event.keyCode <= 57 && !event.shiftKey)
			|| (event.keyCode >= 96 && event.keyCode <= 105)
    });
	
	$("#aadhaarNoId").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
        return event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || event.keyCode  == 37 || event.keyCode  == 39 ||
             // Allow: Ctrl+A
           (event.keyCode == 65 && event.ctrlKey === true) ||
             // Allow: home, end, left, right
           (event.keyCode >= 35 && event.keyCode <= 39) || (event.keyCode >= 48 && event.keyCode <= 57 && !event.shiftKey)
			|| (event.keyCode >= 96 && event.keyCode <= 105)
    });
	
	$("#otherIdID").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
        return event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || event.keyCode  == 37 || event.keyCode  == 39 ||
             // Allow: Ctrl+A
			 event.keyCode == 32 ||
           (event.keyCode == 65 && event.ctrlKey === true) || event.keyCode == 111 || (!event.shiftKey && event.keyCode == 191) || event.keyCode == 189 ||
             // Allow: home, end, left, right
           (event.keyCode >= 35 && event.keyCode <= 39) || (event.keyCode >= 48 && event.keyCode <= 57 && !event.shiftKey)
			|| (event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 96 && event.keyCode <= 105)
    });
	
	$("#income").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
        if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || event.keyCode  == 37 || event.keyCode  == 39 ||
             // Allow: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) || 
             // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        else {
            // Ensure that it is a number and stop the keypress
            if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
                event.preventDefault(); 
            }   
        }
    }); 
	
	$("#familyTotalIncome").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
        if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || event.keyCode  == 37 || event.keyCode  == 39 ||
             // Allow: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) || 
             // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        else {
            // Ensure that it is a number and stop the keypress
            if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
                event.preventDefault(); 
            }   
        }
    });
	
	$("#familyMonthlyExpenses").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
        if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || event.keyCode  == 37 || event.keyCode  == 39 ||
             // Allow: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) || 
             // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        else {
            // Ensure that it is a number and stop the keypress
            if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
                event.preventDefault(); 
            }   
        }
    });
	
	$("#timePeriod").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
        if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || event.keyCode  == 37 || event.keyCode  == 39 ||
             // Allow: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) || 
             // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        else {
            // Ensure that it is a number and stop the keypress
            if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
                event.preventDefault(); 
            }   
        }
    });
	
	$("#housesqft").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
        if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || event.keyCode  == 37 || event.keyCode  == 39 ||
             // Allow: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) || 
             // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        else {
            // Ensure that it is a number and stop the keypress
            if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
                event.preventDefault(); 
            }   
        }
    });
	
	$("#mfiAmountSecured").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
        if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || event.keyCode  == 37 || event.keyCode  == 39 ||
             // Allow: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) || 
             // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        else {
            // Ensure that it is a number and stop the keypress
            if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
                event.preventDefault(); 
            }   
        }
    });
	
	$("#mfiLoanOutstanding").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
        if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || event.keyCode  == 37 || event.keyCode  == 39 ||
             // Allow: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) || 
             // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        else {
            // Ensure that it is a number and stop the keypress
            if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
                event.preventDefault(); 
            }   
        }
    });
	
	  
	//DURING FETCH
	//BANK DETAILS CHECK BOX
	//bankAccount
	if($("#bankAccountHiddenFetch").val() == 1){
		$('#bankAccount').attr("checked", "true").checkboxradio('refresh');
	}
	else{
		$("#bankAccount").removeAttr("checked");
	}
	//savings
	if($("#savingsHiddenFetch").val() == 1){
		$('#savings').attr("checked", "true").checkboxradio('refresh');
	}
	else{
		$("#savings").removeAttr("checked");
	}
	
	//Insurance(Life Time)
	/*if($("#lifeTimeInsuranceHiddenFetch").val() == 1){
		$('#lifeTimeInsurance').attr("checked", "true").checkboxradio('refresh');
	}
	else{
		$("#lifeTimeInsurance").removeAttr("checked");
	}
	
	//Insurance(Accidental)
	if($("#accidentalInsuranceHiddenFetch").val() == 1){
		$('#accidentalInsurance').attr("checked", "true").checkboxradio('refresh');
	}
	else{
		$("#accidentalInsurance").removeAttr("checked");
	}
	
	//Insurance(Medical)
	if($("#medicalInsuranceHiddenFetch").val() == 1){
		$('#medicalInsurance').attr("checked", "true").checkboxradio('refresh');
	}
	else{
		$("#medicalInsurance").removeAttr("checked");
	}
	*/
	//Other mfi loan detail
	if($("#otherMfiLoanHiddenFetch").val() == 1){
		$('#loanSecuredOtherMFI').attr("checked", "true").checkboxradio('refresh');
		//$('#repaymentTrackRecordId').toggle();
		$('#addOtherMfiLoansButtonId').toggle();
		$('#popupShowDivId').toggle();
		
		//$('#mfiNameDiv').toggle();
		//$('#mfiAmountSecuredDiv').toggle();
		//$('#mfiLoanOutstandingDiv').toggle();
	}
	else{
		$("#loanSecuredOtherMFI").removeAttr("checked");
	}
	
	//Other ID in memberPersonal detail
	if($("#otherIdsHiddenFetch").val() == 1){
		$('#otherIdsID').attr("checked", "true").checkboxradio('refresh');
		$("#OtherIdNameDiv").toggle();
		$("#otherIdIDDiv").toggle();
		$("#OtherIdNameDiv2").toggle();
		$("#otherIdIDDiv2").toggle();
        $("#OtherIdNameCDiv").toggle();
        $("#otherIdIDCDiv").toggle();
        $("#OtherIdNameCDiv2").toggle();
        $("#otherIdCDiv2").toggle();
        $("#otherIdLengthDiv").toggle();
        $("#otherId2LengthDiv").toggle();
	}
	else{
		$("#otherIdsID").removeAttr("checked");
	}

    if($("#guarantorRelationship").val() == 85){
        $("#otherIdRelationShipDiv").toggle();
    }else{
        $("#otherIdRelationShipDiv").hide();
    }

	//declaration
	if($("#declarationAcknowledgedSignedHiddenFetch").val() == 1){
		$('#declarationAcknowledgedSigned').attr("checked", "true").checkboxradio('refresh');
	}
	else{
		$("#declarationAcknowledgedSigned").removeAttr("checked");
	}
	
	//pledgeAcknowledgedSigned
	if($("#pledgeAcknowledgedSignedHiddenFetch").val() == 1){
		$('#pledgeAcknowledgedSigned').attr("checked", "true").checkboxradio('refresh');
	}
	else{
		$("#pledgeAcknowledgedSigned").removeAttr("checked");
	}
	
	//guarantorAcknowledgedSigned
	if($("#guarantorAcknowledgedSignedHiddenFetch").val() == 1){
		$('#guarantorAcknowledgedSigned').attr("checked", "true").checkboxradio('refresh');
	}
	else{
		$("#guarantorAcknowledgedSigned").removeAttr("checked");
	}
	
	//memberPhotocopyAttached
	if($("#memberPhotocopyAttachedHiddenFetch").val() == 1){
		$('#memberPhotocopyAttached').attr("checked", "true").checkboxradio('refresh');
	}
	else{
		$("#memberPhotocopyAttached").removeAttr("checked");
	}
	
	
	//guarantorPhotocopyAttached
	if($("#guarantorPhotocopyAttachedHiddenFetch").val() == 1){
		$('#guarantorPhotocopyAttached').attr("checked", "true").checkboxradio('refresh');
	}
	else{
		$("#guarantorPhotocopyAttached").removeAttr("checked");
	}
	
	//CheckBox: Household details fetch
	/*var hiddenHouseHoldFetchArray = new Array();
	hiddenHouseHoldFetchArray = $("#hiddenHouseholdFetch").val().split(",");
	for(var i = 0;i< hiddenHouseHoldFetchArray.length;i++){
		if(hiddenHouseHoldFetchArray[i]==$("#televisionID").text()){
			$('#television').attr("checked", "true").checkboxradio('refresh');
		}
		
		if(hiddenHouseHoldFetchArray[i]==$("#mixieID").text()){
			$('#mixie').attr("checked", "true").checkboxradio('refresh');
		}
		
		if(hiddenHouseHoldFetchArray[i]==$("#grinderID").text()){
			$('#grinder').attr("checked", "true").checkboxradio('refresh');
		}
		
		if(hiddenHouseHoldFetchArray[i]==$("#refrigeratorID").text()){
			$('#refrigerator').attr("checked", "true").checkboxradio('refresh');
		}
		
		if(hiddenHouseHoldFetchArray[i]==$("#washingMachineID").text()){
			$('#washingMachine').attr("checked", "true").checkboxradio('refresh');
		}
		
	}*/
	
	//Checkbox: Vehicle Details fetch
    var hiddenVehiclesFetchArray = new Array();
    if($("#hiddenVehicleFetch").val() != null){
        hiddenVehiclesFetchArray = $("#hiddenVehicleFetch").val().split(",");
    }

	for(var i = 0;i< hiddenVehiclesFetchArray.length;i++){
		if(hiddenVehiclesFetchArray[i]==$("#bicycleID").text()){
			$('#bicycle').attr("checked", "true").checkboxradio('refresh');
		}
		
		if(hiddenVehiclesFetchArray[i]==$("#scooterID").text()){
			$('#scooter').attr("checked", "true").checkboxradio('refresh');
		}
		
		if(hiddenVehiclesFetchArray[i]==$("#mopedID").text()){
			$('#moped').attr("checked", "true").checkboxradio('refresh');
		}
		
		if(hiddenVehiclesFetchArray[i]==$("#bikeID").text()){
			$('#bike').attr("checked", "true").checkboxradio('refresh');
		}
		
		if(hiddenVehiclesFetchArray[i]==$("#carID").text()){
			$('#car').attr("checked", "true").checkboxradio('refresh');
		}
		
		if(hiddenVehiclesFetchArray[i]==$("#othersID").text()){
			$('#others').attr("checked", "true").checkboxradio('refresh');
		}
		
	}
	
	//Checkbox: HouseRoom fetch
    var hiddenHouseroomFetch = new Array();
    if($("#hiddenHouseroomFetch").val() != null){
        hiddenHouseroomFetch = $("#hiddenHouseroomFetch").val().split(",");
    }
	for(var i = 0;i< hiddenHouseroomFetch.length;i++){
		if(hiddenHouseroomFetch[i]==$("#hallID").text()){
			$('#hall').attr("checked", "true").checkboxradio('refresh');
		}
		
		if(hiddenHouseroomFetch[i]==$("#kitchenID").text()){
			$('#kitchen').attr("checked", "true").checkboxradio('refresh');
		}
		
		if(hiddenHouseroomFetch[i]==$("#1roomID").text()){
			$('#1room').attr("checked", "true").checkboxradio('refresh');
		}
		
		if(hiddenHouseroomFetch[i]==$("#2roomsID").text()){
			$('#2rooms').attr("checked", "true").checkboxradio('refresh');
		}
		
		if(hiddenHouseroomFetch[i]==$("#3roomsID").text()){
			$('#3rooms').attr("checked", "true").checkboxradio('refresh');
		}
		
		
	}
	
	//FAMILY INCOME
	//ADD FAMILY MEMBERS POPUP
	
	
	$("#addFamilyMembersSaveId").click(function(){
		//SETTING VALUE IN HIDDEN TEXTBOX
        document.getElementById("errorLabelId").innerText = "";
        if($("#familyMemberName").val()=="" ) {
            var errorLabelPopup = "Please fill family members name";
			$("#errorLabelPopupId").text(errorLabelPopup);
			$("a#addFamilyMembersSaveId").attr('href','');
   		}
        else if($("#genderId").val()== 0){
            var errorLabelPopup = "Please select family member gender";
            $("#errorLabelPopupId").text(errorLabelPopup);
            $("a#addFamilyMembersSaveId").attr('href','');
        }
        else if($("#Relationship").val()==0){
            var errorLabelPopup = "Please select family member relationship";
            $("#errorLabelPopupId").text(errorLabelPopup);
            $("a#addFamilyMembersSaveId").attr('href','');
        }
        else if($("#Relationship").val()==109 & $("#otherIdFamilyRelation").val()==""){
            var errorLabelPopup = "Please fill other relationship name";
            $("#errorLabelPopupId").text(errorLabelPopup);
            $("a#addFamilyMembersSaveId").attr('href','');
        }
        else if($("#income").val()==""){
            var errorLabelPopup = "Please fill family member income";
            $("#errorLabelPopupId").text(errorLabelPopup);
            $("a#addFamilyMembersSaveId").attr('href','');
        }
		else{
			var newContent = '<div data-role="content" data-theme="b" class="content-primary">';
			newContent += '<ul data-role="listview" data-split-theme="b" data-inset="true" id="ulId">';
			newContent += '<li>';
			newContent += '<a href="">';
			newContent += "<label for='name'"+inc+" id='name"+inc+"'>"+$("#familyMemberName").val()+"</label>";
			newContent += '<a href="", onclick="removeClient(this,'+inc+','+$("#income").val()+')", data-icon="delete">';
			newContent += '</a>';
			newContent += '</a>';
			newContent += '</li>';
			newContent += '</ul>';
			newContent += '</div>';
			$("#addFamilyMembersDivId").append(newContent).trigger('create');
				
			familyMemberNameArray.push($("#familyMemberName").val())
			$("#nameIdHidden").val(familyMemberNameArray);
			if($("#age").val() == '' || $("#age").val() == 'NULL') {
				ageArray.push('0000-00-00')
			
			}
			else {
				ageArray.push($("#age").val())
			
			}
			$("#ageIdHidden").val(ageArray);	
			genderArray.push($("#genderId").val())
			$("#genderIdHidden").val(genderArray);
			relationshipArray.push($("#Relationship").val())
			$("#relationshipIdHidden").val(relationshipArray);
            if($("#Relationship").val()==109){
                otherRelationshipNameArray.push($("#otherIdFamilyRelation").val())
            }
            else{
                otherRelationshipNameArray.push('')
            }
            $("#otherRelationshipHidden").val(otherRelationshipNameArray);
            educationArray.push($("#education").val())
			$("#educationIdHidden").val(educationArray);
			occupationArray.push($("#occupation").val())
			$("#occupationIdHidden").val(occupationArray);
			incomeArray.push($("#income").val())
			$("#incomeIdHidden").val(incomeArray);
			
			//Incrementing total income value
			//alert("Income=== "+incomeArray);
			var total =0;
			total = parseInt($("#familyTotalIncome").val() || 0);
			total += parseInt($("#income").val());
			//alert("value==="+total);
			$("#familyTotalIncome").val(total);
			
			
			$("a#addFamilyMembersSaveId").attr('href','#addFamilyMembers');
			//clearing all value
			$("#familyMemberName").val('');
			$("#age").val('');
			$("#income").val('');
			$("#genderId").val('0').selectmenu("refresh");;
			$("#Relationship").val('0').selectmenu("refresh");
			$("#education").val('0').selectmenu("refresh");
			$("#occupation").val('0').selectmenu("refresh");
			$("#errorLabelPopupId").text("");
            $("#otherIdFamilyRelationShipDiv").hide();
            $("#otherIdFamilyRelation").val('');
		
			inc++;
		
		}
	});
	//validation for clearing all datas on cancel button click
	$("#addFamilyMembersCancelId").click(function(){
		$("#familyMemberName").val('');
		$("#age").val('');
		$("#income").val('');
		$("#genderId").val('0').selectmenu("refresh");;
		$("#Relationship").val('0').selectmenu("refresh");
		$("#education").val('0').selectmenu("refresh");
		$("#occupation").val('0').selectmenu("refresh");
		$("#errorLabelPopupId").text("");
        $("#otherIdFamilyRelationShipDiv").hide();
        $("#otherIdFamilyRelation").val('');
	});
	
	
	//validation for not typing values in datepicker field
	$("#dateOfBirth").keypress(function(e){ e.preventDefault(); });
	$("#husbandOrFatherAge").keypress(function(e){ e.preventDefault(); });
	$("#guarantorAge").keypress(function(e){ e.preventDefault(); });
	$("#age").keypress(function(e){ e.preventDefault(); });
	
//Adding Other Mfi Loans Popup
	$("#addOtherMfiLoanSaveId").click(function(){
		
		var otherMfiErrorLabelPopup = "Please fill up the mandatory fields";
		if($("#mfiName").val()=="" | $("#mfiAmountSecured ").val()=="" | $("#mfiLoanOutstanding ").val()== ""){
			$("#otherMfiErrorLabelPopupId").text(otherMfiErrorLabelPopup);
			$("a#addOtherMfiLoanSaveId").attr('href','');
		}
		else{
			var newContent = '<div data-role="content" data-theme="b" class="content-primary">';
			newContent += '<ul data-role="listview" data-split-theme="b" data-inset="true" id="ulId">';
			newContent += '<li>';
			newContent += '<a href="">';
			newContent += "<label for='name'"+inc+" id='name"+inc+"'>"+$("#mfiName").val()+"</label>";
			newContent += '<a href="", onclick="removeOtherMfiClient(this,'+inc+')", data-icon="delete">';
			newContent += '</a>';
			newContent += '</a>';
			newContent += '</li>';
			newContent += '</ul>';
			newContent += '</div>';
			$("#otherMfiLoanDivId").append(newContent).trigger('create');
				
			otherMfiNameArray.push($("#mfiName").val());
			$("#OtherMfiNameHiddenId").val(otherMfiNameArray);
			otherMfiAmtSecuredArray.push($("#mfiAmountSecured").val());
			$("#OtherMfiAmountHiddenId").val(otherMfiAmtSecuredArray);
			otherMfiLoanOutstandingArray.push($("#mfiLoanOutstanding").val());
			$("#OtherMfiOutstandingHiddenId").val(otherMfiLoanOutstandingArray);
			
			$("a#addOtherMfiLoanSaveId").attr('href','#addOtherMfiLoans');
			//clearing all value
			$("#mfiName").val('');
			$("#mfiAmountSecured").val('');
			$("#mfiLoanOutstanding").val('');
			$("#otherMfiErrorLabelPopupId").text("");
		
			inc++;
			incArrayCount++;
			//alert("CountDynamicAdd = "+incArrayCount);
		
		}
	});
	
	//validation for clearing all datas on cancel button click
	$("#addOtherMfiLoanCancelId").click(function(){
		$("#mfiName").val('');
		$("#mfiAmountSecured").val('');
		$("#mfiLoanOutstanding").val('');
		$("#otherMfiErrorLabelPopupId").text("");
	});
	$("#mfiName").keydown(function(event){
	    if (!( (event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 46 || event.keyCode  == 37 || event.keyCode  == 39 ) )) {
			event.preventDefault(); 
        } 
	});
	
	$("#familyMemberName").keydown(function(event){
	   if (!( (event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 46 || event.keyCode  == 37 || event.keyCode  == 39) )) {
			event.preventDefault(); 
        }  
	});
	$("#guarantorName").keydown(function(event){
		if (!( (event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 46 || event.keyCode  == 37 || event.keyCode  == 39) )) {
			event.preventDefault(); 
        }  
	});
	$("#husbandOrFatherName").keydown(function(event){
		if (!( (event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 46 || event.keyCode  == 37 || event.keyCode  == 39) )) {
			event.preventDefault(); 
        }  
	});
	$("#husbandOrFatherLastNameId").keydown(function(event){
		if (!( (event.keyCode >= 65 && event.keyCode  <= 90) || (event.keyCode == 8 || event.keyCode  == 9 || event.keyCode  == 32 || event.keyCode  == 46 || event.keyCode  == 37 || event.keyCode  == 39) )) {
			event.preventDefault(); 
        }  
	});
	
	//Time Period validation
	$("#timePeriodLabelId").hide();
	$("#timePeriod").hide();
	
	//alert("M= "+$("#memberName").val());
	//alert("H= "+$("#house").val());
	
	if($("#memberName").val() !='0')  {
		if($("#house").val() == rentalHouse | $("#house").val() == leaseHouse) {
			//$("#timePeriod").val("");
			$("#timePeriodLabelId").show();
			$("#timePeriod").show();
		}
	}
	$('#expand').click(function(){
        $(".collapsible_content").trigger('expand');
    })
    $('#collapse').click(function(){
        $(".collapsible_content").trigger('collapse');
    })

    $("#verifiedId").hide();
});

function houseTypeOnchange(){

	if($("#house").val() == ownHouse){
		$("#timePeriod").val("");
		$("#timePeriodLabelId").hide();
		$("#timePeriod").hide();
	}
	else if($("#house").val() == rentalHouse | $("#house").val() == leaseHouse){
		$("#timePeriod").val("");
		$("#timePeriodLabelId").show();
		$("#timePeriod").show();
	}
}

//removing dynamic div
function removeClient(remove,i,value){
	//alert("Helll");
	//var value=$("#clientNameID"+i).text();
	r=remove.parentNode.parentNode;
	r.parentNode.removeChild(r);
	familyMemberNameArray[i]="";
	ageArray[i]="";
	genderArray[i]="";
	relationshipArray[i]="";
    otherRelationshipNameArray[i]="";
	educationArray[i]="";
	occupationArray[i]="";
	incomeArray[i]=0;
	var total = 0;
	total = parseInt($("#familyTotalIncome").val());
	total -= parseInt(value);
	
	$("#familyTotalIncome").val(total);
		
	//$("#incomeIdHidden").val("");
	$('#nameIdHidden').val(familyMemberNameArray);
	$('#ageIdHidden').val(ageArray);
	$('#genderIdHidden').val(genderArray);
	$('#relationshipIdHidden').val(relationshipArray);
    $('#otherRelationshipHidden').val(otherRelationshipNameArray);
	$('#educationIdHidden').val(educationArray);
	$('#occupationIdHidden').val(occupationArray);
	$('#incomeIdHidden').val(incomeArray);
	
	
}
//static div remove
var deleteclientname = new Array();
var deleteclientrelation = new Array();
var deleteclientincome = new Array();
function clientRemove(val,i,clientName,clientIncome,relation){
	//alert("INCOMEEEe "+clientIncome);
	deleteclientname.push(clientName);
	deleteclientrelation.push(relation);
	deleteclientincome.push(clientIncome);
	$('#deletecnameid').val(deleteclientname);
	$('#deletecrelationid').val(deleteclientrelation);
	$('#deletecincomeid').val(deleteclientincome);
	$("#clientLiId"+i).remove();
	var total = 0;
	total = parseInt($("#familyTotalIncome").val());
	total -= parseInt(clientIncome);
   //Added by Sathish Kumar M 008 For Family income issue
    var length =0;
    length = parseInt($("#deleteclientLength").val());
    length -=1;
    $("#deleteclientLength").val(length);
    if(length == 0){
        $("#familyTotalIncome").val(0);
    }else{
        $("#familyTotalIncome").val(total);
    }
}
//removing dynamic div of other mfi loan detail
function removeOtherMfiClient(remove,i){
	r=remove.parentNode.parentNode;
	r.parentNode.removeChild(r);
	otherMfiNameArray[i]="";
	otherMfiAmtSecuredArray[i]="";
	otherMfiLoanOutstandingArray[i]="";
	
	$('#OtherMfiNameHiddenId').val(otherMfiNameArray);
	$('#OtherMfiAmountHiddenId').val(otherMfiAmtSecuredArray);
	$('#OtherMfiOutstandingHiddenId').val(otherMfiLoanOutstandingArray);
	
	incArrayCount--;
	//alert("CountDynamicRemove = "+incArrayCount);
	
}
//removing static div of other mfi loan details
var deleteOtherMfiClientname = new Array();
var deleteOtherMfiAmountSecured = new Array();
var deleteOtherMfiLoanOutstanding = new Array();
function MfiClientRemove(val,i,clientName,clientAmt,clientOut){
	deleteOtherMfiClientname.push(clientName);
	deleteOtherMfiAmountSecured.push(clientAmt);
	deleteOtherMfiLoanOutstanding.push(clientOut);
	$('#deleteOtherMfiClientId').val(deleteOtherMfiClientname);
	$('#deleteOtherMfiAmtSecuredId').val(deleteOtherMfiAmountSecured);
	$('#deleteOtherMfiOutId').val(deleteOtherMfiLoanOutstanding);
	$("#mfiClientLiId"+i).remove();
	
	incArrayCount--;
	//alert("CountStaticRemove = "+incArrayCount);
}

//needImageClarity button clilck
function needImageClaritySubmission(){
	if(document.getElementById("memberName").value==0){
        $("#successMessage").hide();
		var errorLabelMember = "Please select a member name";
		document.getElementById("errorLabelId").innerText = errorLabelMember;
		$(window).scrollTop(0);
	}
	else{
		document.getElementById('needImageClarityId').href= "#needImageClarity";
		$("#needImageClarityId").trigger('click');
	}
	
}

// Added Paramasivan for back previous operation
function cancelKYCUpdate() {
    $("#base64Image").val("");
    $.mobile.showPageLoadingMsg();
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+kycUpdatingOperationId+"";
    document.getElementById("BMFormId").submit();
}

function cancelDataVerification() {
    $("#base64Image").val("");
    $.mobile.showPageLoadingMsg();
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+dataVerificationOperationId+"";
    document.getElementById("BMFormId").submit();
}

function cancelNMIUpdate() {
    $.mobile.showPageLoadingMsg();
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+neededMoreinformationOperationId+"";
    document.getElementById("BMFormId").submit();
}

function cancelHold() {
    $("#base64Image").val("");
    $.mobile.showPageLoadingMsg();
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groups/operation/"+holdGroupsOperationId+"";
    document.getElementById("BMFormId").submit();
}

//function for skip data verification
function skipDataVerification(){
    $.mobile.showPageLoadingMsg();
    $('#isSkip').val(1);
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/savekycupdating/1";
    document.getElementById("BMFormId").submit();
}

//Ezra Johnson
function splitPage(){
    $('#rightPanel').css('overflow-y','scroll');
    $("body").css("overflow-x", "hidden");
    $('#mainSplitter').jqxSplitter({ width: '100%', height: '800', panels: [{ size: '60%' }, { size: '40%' }] });
}

// chitra
function forRelationShipChange(){
    if($("#guarantorRelationship").val() == 85){
        $("#otherIdRelationShipDiv").toggle();
    }else{
        $("#otherIdRelationShipDiv").hide();
    }
}
// chitra
function forLoanPurposeChange(){
    if($("#loanPurpose").val() == 19) {
        $("#businessCategoryDiv").toggle();
    }else{
        $("#businessCategoryDiv").hide();
        $("#businessCategory").val(0).selectmenu("refresh");
    }
}

//SathishKumar M 008
function forFamilyRelationShipChange(){
    if($("#Relationship").val() == 109){
        $("#otherIdFamilyRelationShipDiv").toggle();
    }else{
        $("#otherIdFamilyRelationShipDiv").hide();
        $("#otherIdFamilyRelation").val('');
    }
}

function rotateImage(angle, arrayCount) {
    if (arrayCount in imagesArray) {
        imagesArray[arrayCount].deg += angle;
    }
}

function getHoldClients(customerId,groupCode,groupName) {
    $('#groupName').val(groupCode+" "+groupName)
    $("#customerId").val(customerId);
    document.getElementById("BMFormId").method='POST';
    document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/loadHoldMembers";
    document.getElementById("BMFormId").submit();
}

function getHoldClientsWhileOnchange() {
    if($('#memberName').val() != 0) {
        $('p').text("");
        $("#base64Image").val("");
        $.mobile.showPageLoadingMsg();
        document.getElementById("BMFormId").method = 'POST';
        document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/loadHoldMembers";
        document.getElementById("BMFormId").submit().refresh();
    }
    else{
        $('p').text("");
        $('.updatedDetails').hide();
        $('#errorLabelId').text("Please select the client");
    }
}

function getKYCReUpdateGroups(groupId) {
	$.mobile.showPageLoadingMsg();
	$('#groupId').val(groupId);
	document.getElementById("BMFormId").method = 'POST';
	document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/retrieveKYCReUpdateClients";
	document.getElementById("BMFormId").submit().refresh();
}

function memberNameOnchangeInKYC() {
	$.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").method = 'POST';
	document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/retrieveKYCReUpdateClients";
	document.getElementById("BMFormId").submit().refresh();
}

function cancelKYCReUpdate(){
	$.mobile.showPageLoadingMsg();
	document.getElementById("BMFormId").method='POST';
	document.getElementById("BMFormId").action=localStorage.contextPath+"/client/ci/groupsWhileOfficeChange/"+$('#officeId').val()+"/"+kycReUpdateOperationId;
	document.getElementById("BMFormId").submit();
}


function updateKYC(status){
	/*if((typeof $('#newAddress').val() != 'undefined') && $('#newAddress').val().trim().length == 0){
		$('#errorKYCMessage').text('Please fill the address');
		$('#newAddress').focus();
	}
	else if((typeof $('#pincode').val() != 'undefined') && $('#pincode').val().trim().length == 0){
		$('#errorKYCMessage').text('Please enter the pin code');
		$('#pincode').focus();
	}
	else {
		$('#leftPanel').remove();
		$('#errorKYCMessage').text('');
		$.mobile.showPageLoadingMsg();
		$('#updateKYCVerificationStatus').val(verificationStatus);
		document.getElementById("BMFormId").method = 'POST';
		document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/updateKYCDetails";
		document.getElementById("BMFormId").submit();
	}*/
    var mobileNumberVerified = "",landLineNumberVerified = "";
    if($('#newlandlineNumber').text() != ""){
        landLineNumberVerified = $('#landLineNumberMatched').is(':checked');
    }
    if($('#newMobileNumber').text() != "" ){
        mobileNumberVerified = $('#mobileNumberMatched').is(':checked');
    }

    if($('#remarks').val() == ""){
        $('#errorKYCMessage').text('Please enter remarks');
    }else{
        var verificationStatus;
        if(status == 0) {
            if($('#newlandlineNumber').text() != "" && $('#newMobileNumber').text() != ""){
                if(mobileNumberVerified && landLineNumberVerified){
                    verificationStatus =  verificationSuccess;
                }else{
                    verificationStatus =  deoRejected;
                }
            }
            else if(mobileNumberVerified == "" && (landLineNumberVerified || !landLineNumberVerified)){
                 if(landLineNumberVerified){
                     verificationStatus =  verificationSuccess;
                 }else{
                     verificationStatus =  deoRejected;
                 }
            }else if(landLineNumberVerified == "" && (mobileNumberVerified || !mobileNumberVerified)){
                if(mobileNumberVerified){
                    verificationStatus =  verificationSuccess;
                }else{
                    verificationStatus =  deoRejected;
                }
            }
        }else{
            verificationStatus =  verificationFailed;
        }

        $('#leftPanel').remove();
        $('#errorKYCMessage').text('');
        $.mobile.showPageLoadingMsg();
        $('#updateKYCVerificationStatus').val(verificationStatus);
        document.getElementById("BMFormId").method = 'POST';
        document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/updateKYCDetails";
        document.getElementById("BMFormId").submit();
    }
}

function onclickRejectMember(){
    if($("#memberName").val()!=0){
        if($('#rejectMember').is(':checked') == true){
           $("#membFirstNameId").val("Member");
           $("#membLastNameId").val("Rejected");
           $("#dateOfBirth").val("01/01/1995");
           $("#contactNumber").val("1234567890");
           $("#addressDetails").val("Member Rejected");
           $("#RationCardNo").val("Rejected");
           $("#gender").val(2).selectmenu("refresh");
           $("#maritalStatus").val(4).selectmenu("refresh");
           $("#educationDetails").val(16).selectmenu("refresh");
           $("#loanPurpose").val(19).selectmenu("refresh");
           //$("#relationship").val(23).selectmenu("refresh");
           //$("#husbandOrFatherName").val("Member");
           $("#husbandOrFatherLastNameId").val("Rejected");
           $("#pinCode").val("123456");
            //GUARANTOR DETAILS VARIABLES
           $("#guarantorName").val("Member");
           $("#guarantorRelationship").val(57).selectmenu("refresh");
           $("#guarantorAddress").val("Member Rejected");
           $("#guarantorId").val("Rejected");
        }
        else{
            $("#membFirstNameId").val("");
            $("#membLastNameId").val("");
            $("#dateOfBirth").val("");
            $("#contactNumber").val("");
            $("#addressDetails").val("");
            $("#RationCardNo").val("");
            $("#gender").val(0).selectmenu("refresh");
            $("#maritalStatus").val(0).selectmenu("refresh");
            $("#educationDetails").val(0).selectmenu("refresh");
            $("#loanPurpose").val(0).selectmenu("refresh");
            $("#businessCategory").val(0).selectmenu("refresh");
            $("#relationship").val(0).selectmenu("refresh");
            $("#husbandOrFatherName").val("");
            $("#husbandOrFatherLastNameId").val("");
            $("#pinCode").val("");
            //GUARANTOR DETAILS VARIABLES
            $("#guarantorName").val("");
            $("#guarantorRelationship").val(0).selectmenu("refresh");
            $("#guarantorAddress").val("");
            $("#guarantorId").val("");
        }
    }else{
        $("#errorLabelId").text("Please Select a Member Name");
        $("#rejectMember").removeAttr("checked");
    }
}

function onclickResetMember(){
    if($("#memberName").val()!=0){

        $("#membFirstNameId").val("");
        $("#membLastNameId").val("");
        $("#dateOfBirth").val("");
        $("#contactNumber").val("");
        $("#landlineNumber").val("");
        $("#addressDetails").val("");
        $("#pinCode").val("");
        $("#RationCardNo").val("");
        $("#voterIdID").val("");
        $("#gasNumberId").val("");
        $("#aadhaarNoId").val("");

        if($("#otherIdsID").is(':checked') == true){
            $("#otherIdIDName").val("");
            $("#otherIdID").val("");
            $("#otherIdIDName2").val("");
            $("#otherIdID2").val("");
            $('#otherIdsID').prop('checked', false).checkboxradio('refresh');
        }

        $("#OtherIdNameDiv").hide();
        $("#otherIdIDDiv").hide();
        $("#OtherIdNameDiv2").hide();
        $("#otherIdIDDiv2").hide();
        $("#otherIdRelationShipDiv").hide();
        $("#otherIdFamilyRelationShipDiv").hide();

        $("#gender").val(0).selectmenu("refresh");
        $("#maritalStatus").val(0).selectmenu("refresh");
        $("#nationality").val(0).selectmenu("refresh");
        $("#religion").val(0).selectmenu("refresh");
        $("#caste").val(0).selectmenu("refresh");
        $("#educationDetails").val(0).selectmenu("refresh");
        $("#loanPurpose").val(0).selectmenu("refresh");
        $("#businessCategory").val(0).selectmenu("refresh");
        $("#relationship").val(0).selectmenu("refresh");
        $("#husbandOrFatherName").val("");
        $("#husbandOrFatherLastNameId").val("");
        $("#husbandOrFatherAge").val("");

        //GUARANTOR DETAILS VARIABLES
        $("#guarantorName").val("");
        $("#guarantorAge").val("");
        $("#guarantorId").val("");
        $("#guarantorRelationship").val(0).selectmenu("refresh");
        $("#otherRelationShipName").val("");
        $("#guarantorAddress").val("");

    }else{
        $("#errorLabelId").text("Please Select a Member Name");
        $("#rejectMember").removeAttr("checked");
    }
}

function submitDataVerification(isDataVerified) {
    if($("#memberName").val()!=0 && $("#rejectMemberDV").is(':checked') == true ){
        $(window).scrollTop(0);
        if($("#reasonForRejection").val().trim() =="" ){
            $("#errorLabelId").text("Please enter remarks for Rejection");
        }else{
            checkIfAlreadyMemberExists(1,1);
            //kycFormSubmission(isDataVerified,1);
            //$("#rejectConfirmationId").popup("open");
        }
    }else if($("#memberName").val()!=0){
        checkIfAlreadyMemberExists(isDataVerified,0);
    }else{
        $("#errorLabelId").text("Please Select a Member Name");
    }
}

function submitBackToDe() {
    if($("#memberName").val()!=0){
        var checkboxValidate=validateDVCheckboxform(0);
        //alert(checkboxValidate);
        $("#checkboxvalues").text("Are you sure this client will move to DE? "+checkboxValidate);
        $("#checkBoxValue").val(checkboxValidate);
        $("#backToDeConfirmationId").popup("open");
        /*var answer =confirm("Are you sure this client will move to DE?");

       if(answer==true){
           $.mobile.showPageLoadingMsg();
           document.getElementById("BMFormId").method = 'POST';
           document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/updateKYCDEDetails";
           document.getElementById("BMFormId").submit();
       } else{
           return false;
       }*/
    }
    else{
        $(window).scrollTop(0);
        $("#errorLabelId").text("Please Select a Member Name");
    }
}
function confirmRejectToDe(){
    if($("#memberName").val()!=0){
         if($("#remarks").val().trim()==""){
             $(window).scrollTop(0);
             $("#alertMessage").text("Please Enter Remarks For Back to DE");
         }else{
             $.mobile.showPageLoadingMsg();
             document.getElementById("BMFormId").method = 'POST';
             document.getElementById("BMFormId").action = localStorage.contextPath + "/client/ci/updateKYCDEDetails";
             document.getElementById("BMFormId").submit();
         }
    }
    else{
        $(window).scrollTop(0);
        $("#errorLabelId").text("Please Select a Member Name");
    }
}
function rejectDVValidation() {
    if($("#memberName").val()== 0 ){
        $("#successMessage").hide();
        $('#rejectMemberDV').prop('checked', false).checkboxradio('refresh');
        $("#errorLabelId").text("Please Select a Member Name");
    }else if($("#memberName").val()!=0 && $("#rejectMemberDV").is(':checked') == true ){
        $("#rejectReasonDiv").show();
    }else if($("#memberName").val()!=0 && $("#rejectMemberDV").is(':checked') == false ){
        $("#rejectReasonDiv").hide();
        $("#reasonForRejection").val("");
    }
}
$(document).ready(function(){
    $("#rejectReasonDiv").hide();
    $('#noCustomerRejectId').click(function() {
        $("#rejectConfirmationId" ).popup( "close" );
    });
    /*$('#yesCustomerRejectId').click(function() {
        checkIfAlreadyMemberExists(1,1);
    });*/
});


function checkHoldHistoryMember(){
    if($("#memberName").val()!=0){
        $("#poupHeaderId").text("Member Hold History Details");
        var data = {};
        data.clientId = $("#memberName").val();
        ajaxVariable = $.ajax({
            beforeSend : function() {
                $.mobile.showPageLoadingMsg();
            },
            complete: function() {
                $.mobile.hidePageLoadingMsg()
            },
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/client/memberHoldHistory',
            success: function(data) {
                $('table').remove('#clientListTableId');
                var newContent = '<table id="clientListTableId">';
                $("#clientListDivId").append(newContent).trigger('create');
                var newContent ='<tr>';
                newContent+='<th>';
                newContent+= "S.NO";
                newContent+='</th>';
                newContent+='<th>';
                newContent+= "Document Name";
                newContent+='</th>';
                newContent+='<th>';
                newContent+= "Remarks";
                newContent+='</th>';
                newContent+='<th>';
                newContent+= "Hold Given BY";
                newContent+='</th>';
                newContent+='<th>';
                newContent+= "Date & Time";
                newContent+='</th>';
                newContent+='</tr>';
                $("#clientListTableId").append(newContent).trigger('create');
                if(data.holdBy.length>0){
                    for(var i=0;i<data.holdBy.length;i++) {
                        var newContent ='<tr class = "showhide">';
                        newContent+='<td>';
                        newContent+= i+1;
                        newContent+='</td>';
                        newContent+='<td>';
                        newContent += data.docNameArray[i];
                        newContent+='</td>';
                        newContent+='<td>';
                        newContent+= data.remarks[i];
                        newContent+='</td>';
                        newContent+='<td>';
                        newContent+= data.holdBy[i];
                        newContent+='</td>';
                        newContent+='<td>';
                        newContent+= data.date[i];
                        newContent+='</td>';
                        newContent+='</tr>';
                        $("#clientListTableId").append(newContent).trigger('create');

                    }
                }else{
                    var newContent ='<tr class = "showhide">';
                    newContent+='<td>';
                    newContent+= "";
                    newContent+='</td>';
                    newContent+='<td>';
                    newContent+= "No Records To Display!";
                    newContent+='</td>';
                    newContent+='</tr>';
                    $("#clientListTableId").append(newContent).trigger('create');
                }
                document.getElementById("custommainTab").href= "#recentActivityPopup";
                $("#custommainTab").trigger('click');
                document.getElementById("custommainTab").href= "JavaScript:checkHoldHistoryMember();";
            },error : function(jqXHR, textStatus, error) {
                alert("textStatus"+textStatus);
                alert("error"+error);

            }
        });
    }else{
        $("#errorLabelId").text("Please Select a Member Name");
    }
}



function clientCurrentStatus(){
    if($("#groupIdHidden").val()!=0){
        $("#poupHeaderId").text("Client Current Status");
        var data = {};
        data.groupId = $("#groupIdHidden").val();
        ajaxVariable = $.ajax({
            beforeSend : function() {
                $.mobile.showPageLoadingMsg();
            },
            complete: function() {
                $.mobile.hidePageLoadingMsg()
            },
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: 'http://'+ajaxcallip+localStorage.contextPath+'/client/ci/retrieveClientCurrentStatus',
            success: function(data) {
                $('table').remove('#clientListTableId');
                var newContent = '<table id="clientListTableId">';
                $("#clientListDivId").append(newContent).trigger('create');
                var newContent ='<tr>';
                newContent+='<th>';
                newContent+= "S.NO";
                newContent+='</th>';
                newContent+='<th>';
                newContent+= "Client Name";
                newContent+='</th>';
                newContent+='<th>';
                newContent+= "Client Status";
                newContent+='</th>';
                newContent+='</tr>';
                $("#clientListTableId").append(newContent).trigger('create');
                if(data.clientStatusObject.clientNameList.length>0){
                    for(var i=0;i<data.clientStatusObject.clientNameList.length;i++) {
                        var newContent ='<tr class = "showhide">';
                        newContent+='<td>';
                        newContent+= i+1;
                        newContent+='</td>';
                        newContent+='<td>';
                        newContent += data.clientStatusObject.clientNameList[i];
                        newContent+='</td>';
                        if(data.clientStatusObject.clientStatusList[i] == "Client is available for KYC Updating") {
                            newContent += '<td style="color:#ff0000">';
                        }else {
                            newContent += '<td>';
                        }
                        newContent+= data.clientStatusObject.clientStatusList[i];
                        newContent+='</td>';
                        newContent+='</tr>';
                        $("#clientListTableId").append(newContent).trigger('create');
                    }
                }else{
                    var newContent ='<tr class = "showhide">';
                    newContent+='<td>';
                    newContent+= "";
                    newContent+='</td>';
                    newContent+='<td>';
                    newContent+= "No Records To Display!";
                    newContent+='</td>';
                    newContent+='</tr>';
                    $("#clientListTableId").append(newContent).trigger('create');
                }
                document.getElementById("clientCurrentStatus").href= "#recentActivityPopup";
                $("#clientCurrentStatus").trigger('click');
                document.getElementById("clientCurrentStatus").href= "JavaScript:clientCurrentStatus();";

            },error : function(jqXHR, textStatus, error) {
                alert("textStatus"+textStatus);
                alert("error"+error);

            }
        });
    }else{
        $("#errorLabelId").text("Please contact IT team");
    }
}
function submitDataToPreview(){
    if($("#memberName").val()!=0){
        $("#cbaDvConfirmationId").popup("open");
        $("#verifiedId").show();
    }else{
        $("#errorLabelId").text("Please Select a Member Name");
    }
}
