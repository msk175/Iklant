module.exports = prospectClientOtherDetail;

var otherDetailId;
var clientId;
var isDeclarationAcksign;
var isPledgeAcksign;
var isGuarantorAcksign;
var isMemberPhotocopyAttached;
var isGuarantorPhotocopyAttached;

function prospectClientOtherDetail() {	
}

prospectClientOtherDetail.prototype = {

	getOtherDetailId: function(){
		return this.otherDetailId;
	},
	setOtherDetailId: function (other_detail_id){
        this.otherDetailId = other_detail_id;
	},
	
	getClientId: function(){
		return this.clientId;
	},
	setClientId: function (client_id){
        this.clientId = client_id;
	},
	
	getIsDeclarationAcksign: function(){
		return this.isDeclarationAcksign;
	},
	setIsDeclarationAcksign: function (is_declaration_acksign){
        this.isDeclarationAcksign = is_declaration_acksign;
	},
	
	getIsPledgeAcksign: function(){
		return this.isPledgeAcksign;
	},
	setIsPledgeAcksign: function (is_pledge_acksign){
        this.isPledgeAcksign = is_pledge_acksign;
	},
	
	getIsGuarantorAcksign: function(){
		return this.isGuarantorAcksign;
	},
	setIsGuarantorAcksign: function (is_guarantor_acksign){
        this.isGuarantorAcksign = is_guarantor_acksign;
	},
	
	getIsMemberPhotocopyAttached: function(){
		return this.isMemberPhotocopyAttached;
	},
	setIsMemberPhotocopyAttached: function (is_member_photocopy_attached){
        this.isMemberPhotocopyAttached = is_member_photocopy_attached;
	},
	
	getIsGuarantorPhotocopyAttached: function(){
		return this.isGuarantorPhotocopyAttached;
	},
	setIsGuarantorPhotocopyAttached: function (is_guarantor_photocopy_attached){
        this.isGuarantorPhotocopyAttached = is_guarantor_photocopy_attached;
	},
	
	clearAll: function() {
		this.setClientId("");
        this.setOtherDetailId("");
		this.setIsDeclarationAcksign("");
		this.setIsPledgeAcksign("");
		this.setIsGuarantorAcksign("");
		this.setIsMemberPhotocopyAttached("");
		this.setIsGuarantorPhotocopyAttached("");
	}
};