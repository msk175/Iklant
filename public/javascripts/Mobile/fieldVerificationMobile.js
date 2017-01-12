var currentValue=1; //Adarsh
var maxField = 20;
var minField = 1;
$("#pageID").live('pageshow',function() {
	//Adarsh
	if(currentValue==minField) {
		$('#previous').hide();
	}
		
	for(var i=2;i<=maxField;i++){
		$('#field'+i).hide();
	}
	
	$('#header').text("Member Details Verification");
	$('#next').click(function(){
		//alert(currentValue);
						
		var flag = 0;
		if(currentValue == 1){
			 if($('#members').val()==0){
				$("#errorFieldTop").text("Please Select a Member Name");
				$(window).scrollTop(0);
				flag=1;
			 }else{
				$("#errorFieldTop").text("");
				if($("#proof").val()==0 & $("#addressmatchedCheck").is(':checked')){
					$("#errorField").text("Please select an Address proof");
					$('#field'+currentValue).show();
					flag=1;
				}else{
					$("#errorField").text("");
					flag=0;
				}
			}
		}
		if(currentValue == 4){
			 if($('#members').val()==0){
				$("#errorFieldTop").text("Please Select a Member Name");
				$(window).scrollTop(0);
				flag=1;
			 }else{
				$("#errorFieldTop").text("");
				if($("#idproof").val()==0 & $("#idproofcheck").is(':checked')){
					$("#errorField").text("Please select an IDProof");
					$('#field'+currentValue).show();
					flag=1;
				}else{
					$("#errorField").text("");
					flag=0;
				}
			}
		}
		if(currentValue == 5){
			 if($('#members').val()==0){
				$("#errorFieldTop").text("Please Select a Member Name");
				$(window).scrollTop(0);
				flag=1;
			 }else{
				$("#errorFieldTop").text("");
				if($("#guarantoraddprooff").val()==0 & $("#guarantoraddressmatchedCheck").is(':checked')){
					$("#errorField").text("Please select Guarantor Address Proof");
					$('#field'+currentValue).show();
					flag=1;
				}else{
					$("#errorField").text("");
					flag=0;
				}
			}
		}
		if(currentValue == 6){
			 if($('#members').val()==0){
				$("#errorFieldTop").text("Please Select a Member Name");
				$(window).scrollTop(0);
				flag=1;
			 }else{
				if($("#idguarantorproof").val()==0 & $("#guarantoridproofcheck").is(':checked')){
					$("#errorField").text("Please select Guarantor IDProof");
					$('#field'+currentValue).show();
					flag=1;
				}else{
					$("#errorField").text("");
					flag=0;
				}
			}
		}
		
		if(currentValue == 8){
			 if($('#members').val()==0){
				$("#errorFieldTop").text("Please Select a Member Name");
				$(window).scrollTop(0);
				flag=1;
			 }else{
				if(document.getElementById("house").value == '0'){
					$("#errorField").text("Please select a House Type");
					$('#field'+currentValue).show();
					flag=1;
				}else{
					$("#errorField").text("");
					flag=0;
				}
			}
		}
		if(currentValue == 13){
			 if($('#members').val()==0){
				$("#errorFieldTop").text("Please Select a Member Name");
				$(window).scrollTop(0);
				flag=1;
			 }else{
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
				
				if(document.getElementById("hiddenVehicle").value==""){
					$("#errorField").text("Please select a Vehicle");
					$('#field'+currentValue).show();
					flag=1;
				} else{
					$("#errorField").text("");
					flag=0;
				}
			}
		}
		
		if(flag==0){
			$('#field'+currentValue).hide();
				currentValue++;
			$('#field'+currentValue).show();
			
			if(currentValue >= 1 && currentValue <5 ){
			$('#header').text("Member Details Verification");
			}else if(currentValue >=5 && currentValue<8){
				$('#header').text("Guarantor Details Verification");
			}else if(currentValue >=8 && currentValue<15){
				$('#header').text("House Details");
			}else if(currentValue >=15 && currentValue<17){
				$('#header').text("Bank Account Details");
			}else if(currentValue >= 17 && currentValue <= 18){
				$('#header').text("PhotoCopy Verification");
			}else if(currentValue ==19){
				$('#header').text("Remarks");
			}else if(currentValue >=20){
				$('#header').text("Field Verification Submit");
			}
			
			if(currentValue==minField){
				$('#previous').hide(); 
			}	
			else {
				$('#previous').show();
			}
			if(currentValue==maxField){
				$('#next').hide(); 
			}
			else {
				$('#next').show();
			}
		}
	});
	$('#previous').click(function(){
		//alert(currentValue);
		$("#errorField").text("");
		$('#field'+currentValue).hide();
		currentValue--;
		$('#field'+currentValue).show();
		if(currentValue >= 1 && currentValue <5 ){
		$('#header').text("Member Details Verification");
		}else if(currentValue >=5 && currentValue<8){
			$('#header').text("Guarantor Details Verification");
		}else if(currentValue >=8 && currentValue<15){
			$('#header').text("House Details");
		}else if(currentValue >=15 && currentValue<17){
			$('#header').text("Bank Account Details");
		}else if(currentValue >= 17 && currentValue <= 18){
			$('#header').text("PhotoCopy Verification");
		}else if(currentValue ==19){
			$('#header').text("Remarks");
		}else if(currentValue >=20){
			$('#header').text("Field Verification Submit");
		}
		
		if(currentValue<=maxField){
			$('#next').show(); 
		}
		else {
			$('#next').hide();
		}
		if(currentValue==minField){
			$('#previous').hide(); 
		}
		else {
			$('#previous').show();
		}
	});
	//End By Adarsh
});