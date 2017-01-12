
module.exports = {
    // set Alignment for the cells
    setAlignmentForHeader : function(sheet,startCol,endCol,rowIndex,width_array,header_name_array,heading,callback) {
        var i = 0;
        sheet.height(rowIndex, 30);
        for(var col=startCol;col<=endCol;col++){
            sheet.align(col, rowIndex, 'center');
            sheet.valign(col, rowIndex, 'center');
            sheet.font(col, rowIndex, {bold:'true'});
            sheet.fill(col, rowIndex, {bgColor :'64'});
            sheet.border(col, rowIndex, {left:'double',top:'double',right:'double',bottom:'double'});
        }
        // set width & header name for cells
        for(var col=startCol;col<=endCol;col++){
            sheet.width(col, width_array[i]);    // set width
            sheet.set(col,rowIndex,header_name_array[i]); // set header name
            sheet.wrap(col,rowIndex,header_name_array[i]);
            i++;
        }
        // heading for the reports
        if(heading != 'InstSchedule'){
            sheet.merge({col:startCol,row:2},{col:endCol,row:2}) ;
            sheet.set(startCol,2,heading);
            sheet.font(startCol, 2, {bold:'true',sz:'14'});
            sheet.align(startCol, 2, 'center');
            sheet.valign(startCol, 2, 'center');
            sheet.height(2,30);
            for(var col=startCol;col<=endCol;col++){
                sheet.border(col, 2, {left:'',top:'double',right:'',bottom:'double'});
            }
            sheet.border(startCol, 2, {left:'double',top:'double',right:'',bottom:'double'});
            sheet.border(endCol, 2, {left:'',top:'double',right:'double',bottom:'double'});
        }

        callback(sheet);
    },

    // set border for the cells by [single row and all columns]
    setBorderAndAlignForCell : function(sheet,startCol,endCol,rowIndex,right_align_col_array,center_align_col_array,callback) {
        for(var col=startCol;col<=endCol;col++){
            sheet.border(col, rowIndex, {left:'thin',top:'thin',right:'thin',bottom:'thin'});
        }
       // set right align for the columns
        for(var col=0;col<right_align_col_array.length;col++){
            sheet.align(right_align_col_array[col], rowIndex, 'right');
        }
        // set center align for the columns
        for(var col=0;col<center_align_col_array.length;col++){
            sheet.align(center_align_col_array[col], rowIndex, 'center');
        }
        callback(sheet);
    },

    // for the principal,int,total_acc,amount [only for the report summary]
    summaryGenerateReportWithPrincipalInt : function(summary_sheet,summary_result_set,heading,callback){
        var rowvalue = parseInt(4);
        var report_index = 0;
        var self = this;
        var summary_sheet_array = new Array('S.No','Office','Field Officer','Total Accounts','Total Amount','Total Principal','Total Interest');
        self.setAlignmentForHeader(summary_sheet,2,8,4,new Array(10,20,30,15,20,20,20),summary_sheet_array,heading,function(sheet_result){
            for (var i in summary_result_set) {
                summary_sheet = sheet_result;
                if(summary_result_set[i].account_id == null && summary_result_set[i].office != null && summary_result_set[i].personnel_id != null){
                    rowvalue = rowvalue + 1;
                    summary_sheet.set(2,rowvalue,parseInt(report_index)+1);
                    summary_sheet.set(3,rowvalue,summary_result_set[i].office);
                    summary_sheet.set(4,rowvalue,summary_result_set[i].field_officer);
                    summary_sheet.set(5,rowvalue,summary_result_set[i].total_accounts,'number');
                    summary_sheet.set(6,rowvalue,summary_result_set[i].total_amount,'number');
                    summary_sheet.set(7,rowvalue,summary_result_set[i].total_principal,'number');
                    summary_sheet.set(8,rowvalue,summary_result_set[i].total_interest,'number');
                    report_index++;
                }else if(summary_result_set[i].account_id == null && summary_result_set[i].office == null){
                    rowvalue = rowvalue + 1;
                    summary_sheet.set(4,rowvalue,"Total :");
                    summary_sheet.font(4, rowvalue, {bold:'true'});
                    summary_sheet.align(4, rowvalue, 'right');
                    summary_sheet.set(5,rowvalue,summary_result_set[i].total_accounts,'number');
                    summary_sheet.set(6,rowvalue,summary_result_set[i].total_amount,'number');
                    summary_sheet.set(7,rowvalue,summary_result_set[i].total_principal,'number');
                    summary_sheet.set(8,rowvalue,summary_result_set[i].total_interest,'number');
                    // set bold font for the columns
                    for(var col=4;col<=8;col++){
                        summary_sheet.font(col, rowvalue, {bold:'true'});
                    }
                }
                self.setBorderAndAlignForCell(summary_sheet,2,8,rowvalue,new Array(6,7,8),new Array(2,5),function(sheet){
                    summary_sheet = sheet;
                });
            }
            callback(summary_sheet);
        });
    },

    // for the total_acc,total_amount [only for the report summary]
    summaryGenerateReportWithAmt : function(summary_sheet,summary_result_set,summary_sheet_array,temp,heading,callback){
        var rowvalue = parseInt(4);
        var report_index = 0;
        var self = this;
        self.setAlignmentForHeader(summary_sheet,2,7,4,new Array(10,20,30,15,20,20),summary_sheet_array,heading,function(sheet_result){
            for (var i in summary_result_set) {
                summary_sheet = sheet_result;
                if(summary_result_set[i].account_id == null && summary_result_set[i].office != null && summary_result_set[i].personnel_id != null){
                    rowvalue = rowvalue + 1;
                    summary_sheet.set(2,rowvalue,parseInt(report_index)+1);
                    summary_sheet.set(3,rowvalue,summary_result_set[i].office);
                    summary_sheet.set(4,rowvalue,summary_result_set[i].field_officer);
                    summary_sheet.set(5,rowvalue,summary_result_set[i].total_amount,'number');
                    if(temp == "total_loans_available_without_acc"){    // for loan disbursal summary
                        summary_sheet.set(6,rowvalue,summary_result_set[i].total_no_of_loans,'number');
                    }else{
                        summary_sheet.set(6,rowvalue,summary_result_set[i].total_accounts,'number');
                    }

                    if(temp == "total_loans_available"){
                        summary_sheet.set(7,rowvalue,summary_result_set[i].total_no_of_loans,'number');
                    }
                    report_index++;
                }else if(summary_result_set[i].account_id == null && summary_result_set[i].office == null){
                    rowvalue = rowvalue + 1;
                    summary_sheet.set(4,rowvalue,"Total :");
                    summary_sheet.align(4, rowvalue, 'right');
                    summary_sheet.set(5,rowvalue,summary_result_set[i].total_amount,'number');
                    if(temp == "total_loans_available_without_acc"){    // for loan disbursal summary
                        summary_sheet.set(6,rowvalue,summary_result_set[i].total_no_of_loans,'number');
                    }else{
                        summary_sheet.set(6,rowvalue,summary_result_set[i].total_accounts,'number');
                    }

                    if(temp == "total_loans_available"){
                        summary_sheet.set(7,rowvalue,summary_result_set[i].total_no_of_loans,'number');
                    }
                }
                if(temp == "total_loans_available"){
                    self.setBorderAndAlignForCell(summary_sheet,2,7,rowvalue,new Array(0,5),new Array(2,6,7),function(sheet){
                        summary_sheet = sheet;
                    });
                }else{
                    self.setBorderAndAlignForCell(summary_sheet,2,6,rowvalue,new Array(0,5),new Array(2,6),function(sheet){
                        sheet.fill(7, 4, {bgColor :''});
                        sheet.border(7, 4, {left:'',top:'',right:'',bottom:''});
                        summary_sheet = sheet;
                    });
                }
            }
            // set bold font for the columns
            for(var col=2;col<=7;col++){
                summary_sheet.font(col, rowvalue, {bold:'true'});
            }
            callback(summary_sheet);
        });
    },

    // for the credit,debit,opening,closing [only for the report summary]
    summaryGenerateReportWithCreditDebit : function(summary_sheet,summary_result_set,summary_sheet_array,temp,heading,callback){
        var rowvalue = parseInt(4);
        var report_index = 0;
        var self = this;
        self.setAlignmentForHeader(summary_sheet,2,9,4,new Array(10,20,30,15,20,20,20,20),summary_sheet_array,heading,function(sheet_result){
            for (var i in summary_result_set) {
                summary_sheet = sheet_result;
                if(summary_result_set[i].account_id == null && summary_result_set[i].office != null && ( temp=="bank_cash" || summary_result_set[i].personnel_id != null)){
                    rowvalue = rowvalue + 1;
                    summary_sheet.set(2,rowvalue,parseInt(report_index)+1);
                    summary_sheet.set(3,rowvalue,summary_result_set[i].office);
                    summary_sheet.set(4,rowvalue,summary_result_set[i].field_officer);
                    summary_sheet.set(5,rowvalue,summary_result_set[i].total_accounts,'number');
                    summary_sheet.set(6,rowvalue,summary_result_set[i].total_credit,'number');
                    summary_sheet.set(7,rowvalue,summary_result_set[i].total_debit,'number');
                    if(temp == "opening_closing"){
                        summary_sheet.set(8,rowvalue,summary_result_set[i].total_opening_bal);
                        summary_sheet.set(9,rowvalue,summary_result_set[i].total_closing_bal);
                    }
                    report_index++;
                }else if(summary_result_set[i].account_id == null && summary_result_set[i].office == null){
                    rowvalue = rowvalue + 1;
                    summary_sheet.set(4,rowvalue,"Total :");
                    summary_sheet.align(4, rowvalue, 'right');
                    summary_sheet.set(5,rowvalue,summary_result_set[i].total_accounts,'number');
                    summary_sheet.set(6,rowvalue,summary_result_set[i].total_credit,'number');
                    summary_sheet.set(7,rowvalue,summary_result_set[i].total_debit,'number');
                    if(temp == "opening_closing"){
                        summary_sheet.set(8,rowvalue,summary_result_set[i].total_opening_bal,'number');
                        summary_sheet.set(9,rowvalue,summary_result_set[i].total_closing_bal,'number');
                    }
                }
                if(temp == "opening_closing"){
                    self.setBorderAndAlignForCell(summary_sheet,2,9,rowvalue,new Array(6,7,8,9),new Array(2,5),function(sheet){
                        summary_sheet = sheet;
                    });
                }else{
                    self.setBorderAndAlignForCell(summary_sheet,2,7,rowvalue,new Array(6,7),new Array(2,5),function(sheet){
                        // alignment to remove the border for the header [un used column]
                        sheet.fill(8, 4, {bgColor :''});
                        sheet.border(8, 4, {left:'',top:'',right:'',bottom:''});
                        sheet.fill(9, 4, {bgColor :''});
                        sheet.border(9, 4, {left:'',top:'',right:'',bottom:''});
                        summary_sheet = sheet;
                    });
                }
            }
            // set bold font for the columns
            for(var col=2;col<=9;col++){
                summary_sheet.font(col, rowvalue, {bold:'true'});
            }
            callback(summary_sheet);
        });
    },

    // Indian Currency Format
    indianCurrencyFormat : function(number){
        var result;
        number += '';
        var split_value = number.split('.');
        var before_decimal_value = split_value[0];
        var after_decimal_value = split_value.length > 1 ? '.' + split_value[1] : '';
        var rgx = /(\d+)(\d{3})/;
        var temp = 0;
        var len = String(before_decimal_value).length;
        var num = parseInt((len/2)-1);

        while (rgx.test(before_decimal_value))
        {
            if(temp > 0)
            {
                before_decimal_value = before_decimal_value.replace(rgx, '$1' + ',' + '$2');
            }
            else
            {
                before_decimal_value = before_decimal_value.replace(rgx, '$1' + ',' + '$2');
                rgx = /(\d+)(\d{2})/;
            }
            temp++;
            num--;
            if(num == 0)
            {
                break;
            }
        }
        result = before_decimal_value + after_decimal_value;
        return result;
    },

    convertToIndianCurrencyFormat:function(format_number_array){

    },
	
	setOpeningAndClosingBalance : function(sheet,opening_bal,closing_bal,last_total_row,total_debit,total_credit,callback){
        // For Opening Balance
        sheet.merge({col:2,row:4},{col:4,row:4}) ;
        sheet.set(2, 4, "Opening Balance : "+opening_bal);
        sheet.font(2, 4, {bold:'true'});

        // For Closing Balance
        sheet.merge({col:10,row:4},{col:14,row:4}) ;
        sheet.set(10, 4, "Closing Balance : "+closing_bal);
        sheet.font(10, 4, {bold:'true'});
        sheet.height(4,25); // height for the row 2nd

        // Last total
        sheet.font(2, last_total_row, {bold:'true'});
        sheet.height(last_total_row,25);
        sheet.set(10, last_total_row, "Total :");
        sheet.set(11, last_total_row, total_debit);
        sheet.set(12, last_total_row, total_credit);
        for(var col=10;col<=12;col++){
            sheet.valign(col, last_total_row, 'center');
            sheet.align(col, last_total_row, 'right');
            sheet.font(col, last_total_row, {bold:'true'});
        }
    }
}


