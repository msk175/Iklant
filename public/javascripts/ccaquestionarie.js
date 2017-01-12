var inc =0;
var answerArray = new Array();
var marksArray = new Array();
$("#pageID").live('pagecreate',function() {
	//alert("inside ready");
	
	//radiobutton validation for add n edit questions
	$("#addQDiv").hide();
	$("#editQDiv").hide();
	//alert("radio");
	$("#addQId").click(function(){
		$("#editQDiv").hide();
		$("#addQDiv").show();
	});
	$("#editQId").click(function(){
		$("#addQDiv").hide();
		$("#editQDiv").show();
	});
	
	if($("#questionsEditId").val() != '0'){
		//alert("Not Equal to Zero");
		//$("#editQId").val();
		var radioEditId = $("#editQId").val();
		$("#"+radioEditId).attr("checked", "checked");
		$("#editQDiv").show();
	}
	$("#weightageId").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
        if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || 
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
	
	$("#weightageEditId").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
        if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || 
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
	
		$("#markid").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
        if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || 
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
	
	$(".markClass").keydown(function(event) {
        // Allow: backspace, delete, tab, escape, and enter
        if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || 
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
	
	
	$("#addChoices").click(function(){
		var marks =$('#markid').val();
		var answer = $('#answerid').val();
		var errorLabelMandatory = "Pleas Fill Mandatory fields";
		
		if($('#answerid').val() == "" | $('#markid').val() == ""){
			
			document.getElementById("successMessage").innerText = errorLabelMandatory;
			$("a#addChoices").attr('href','');	
				
		}
		else{
			if(answerArray.length == 3){
				alert("Only three Answers are allowed!");
			}else{
				
				var newContent = '<div data-role="content" data-theme="a" class="content-primary">';
				newContent += '<ul data-role="listview" data-split-theme="a" data-inset="true" data-mini="true" id="ulId">';
				newContent += '<li>';
				newContent += '<a href="">';
				newContent += "<label for='NewClientName'"+inc+" id='clientNameID"+inc+"'>"+answer+"</label>";
				newContent += '<h5>'+marks+'</h5>';
				newContent += '<a href="", onclick="" , data-icon="star">';
				newContent += '</a>';
				newContent += '</a>';
				newContent += '</li>';
				newContent += '</ul>';
				newContent += '</div>';
				$("#addClientDivId").append(newContent).trigger('create'); 
				inc++;

				answerArray.push(answer);
				marksArray.push(marks);
				$('#answerArrayId').val(answerArray);
				$('#marksArrayId').val(marksArray);
				$("a#addChoices").attr('href','#popup');				
				$('#markid').val('');
				$('#answerid').val('');
				$('#successMessage').text('');
			}
		}
	});
	$("#SaveButtonId").click(function(){
	
		answerArray = $.grep(answerArray,function(n){return(n);});
		marksArray = $.grep(marksArray,function(n){return(n);});
		$('#answerArrayId').val(answerArray);
		$('#marksArrayId').val(marksArray);
	});
	/*
	$("#resetAllAdd").click(function(){
		$("#question").val("");
		$("#display").val("");
		$("#weightageId").val("");
		$('div').remove('#addClientDivId');
		answerArray =[];
		marksArray = [];
		$('#answerArrayId').val(answerArray);
		$('#marksArrayId').val(marksArray);
		var newContent = '<div data-role="content" data-theme="a" class="content-primary" id="addClientDivId">';
		$("#choicesMarksHidden").append(newContent).trigger('create'); 
		
	});
	
	$("#resetAllEdit").click(function(){
		$("#questionsEditId").val('0');
		$("#questioneditid").val("");
		$("#displayeditid").val("");
		$("#weightageEditId").val("");
	});
	*/
	//clearing all values on cancel click in popup
	$("#questionarieIdCancel").click(function(){
		$('#markid').val('');
		$('#answerid').val('');
		$('#successMessage').text('');
	
	});
	
	
});
	function removeClient(remove,i){
	//var value=$("#clientNameID"+i).text();
    r=remove.parentNode.parentNode;
	r.parentNode.removeChild(r);
	answerArray[i]="";
	marksArray[i]="";
	//alert("I= "+i);
	$('#answerArrayId').val(answerArray);
	$('#marksArrayId').val(marksArray);
}
function saveQuestion(){
	var submitId = 0;
	if(document.getElementById('addQId').checked) {
		//alert("submitId Add= "+submitId);
		if($('#question').val() != "" &	$('#display').val() != "" &	$('#weightageId').val() != "" &	$('#answerArrayId').val() != "" & $('#marksArrayId').val() != "") {
			alert("New Question has been added successfully!");
            $.mobile.showPageLoadingMsg();
			document.getElementById("BMFormId").method='POST';
			document.getElementById("BMFormId").action = localStorage.contextPath+"/client/ci/groups/savequestion/"+submitId;
			document.getElementById("BMFormId").submit().refresh();
        }
    }
}
			/*$('#BMFormId').attr('method', 'POST'); 
			$('#BMFormId').attr('action','/mfi/api/1.0/client/ci/groups/savequestion/'+submitId);
			$('#BMFormId').submit();
		}
		else {
			alert("Fields should not be empty");
		}
	}
	else{
		submitId = 1;
		//alert("inside");
		if($('#questionsEditId').val() != '0'){
			//alert("submitId Edit= "+submitId);
			if($('#questioneditid').val() != "" & $('#displayeditid').val() != "" & $('#weightageEditId').val() != ""){
				var choiceIDArray = new Array();
				var answersArray = new Array();
				var marksArray = new Array();
				var emptyFlag=0;
				for(i=0;i< $('#questionsLengthIdHidden').val() ; i++){
					answersArray.push($('#answerId'+i).val());
					$('#answerIdHidden').val(answersArray);
					marksArray.push($('#markId'+i).val());
					$('#marksIdHidden').val(marksArray);
					choiceIDArray.push($('#choiceId'+i).val());
					$('#choiceIdHidden').val(choiceIDArray);
					
					if($('#answerId'+i).val()=="" | $('#markId'+i).val()==""){
						emptyFlag=1;
					}
								
				}	
				if(emptyFlag==0){
					alert("You have successfully edited the question!");	
					document.getElementById("BMFormId").method='POST';
					document.getElementById("BMFormId").action = '/mfi/api/1.0/client/ci/groups/savequestion/'+submitId;
					document.getElementById("BMFormId").submit().refresh();
					/*$('#BMFormId').attr('method', 'POST'); 
					$('#BMFormId').attr('action','/mfi/api/1.0/client/ci/groups/savequestion/'+submitId);
					$('#BMFormId').submit();
				}
				else if(emptyFlag == 1){
						alert("Please Fill all the fields");
				}
				
			}
			else{
				alert("Please Fill all the fields");
			}
		}
		else{
			alert("Please Select a Question");
		}
	}
} 
//questions onchange function
function questionsOnchange(){
	var questionsEditId= document.getElementById("questionsEditId").value
	if(questionsEditId !='0'){
		var form= "BMFormId";
		document.getElementById(form).method='POST';
		document.getElementById(form).action = localStorage.contextPath+"/client/ci/groups/operation/addquestions/cca/questions";
		document.getElementById(form).submit().refresh();
	}
}

