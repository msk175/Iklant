module.exports = auditCategoryForAndroid;
var category_type_id = new Array();
var category_type_name = new Array();
var audit_type_id = new Array();


function auditCategoryForAndroid() {
    this.clearAll();
}

auditCategoryForAndroid.prototype = {

    setCategoryTypeId : function(t_category_type_id){
        this.category_type_id = t_category_type_id;
    },
    getCategoryTypeId : function(){
        return this.category_type_id;
    },

    setCategoryTypeName : function(t_category_type_name){
        this.category_type_name = t_category_type_name;
    },
    getCategoryTypeName : function(){
        return this.category_type_name;
    },

    setAuditTypeId : function(t_audit_type_id){
        this.audit_type_id = t_audit_type_id;
    },
    getAuditTypeId : function(){
        return this.audit_type_id;
    },

    clearAll: function() {
        this.setCategoryTypeId(new Array());
        this.setCategoryTypeName(new Array());
        this.setAuditTypeId(new Array());
    }

};