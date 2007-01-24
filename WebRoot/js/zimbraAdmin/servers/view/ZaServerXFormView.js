/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* @class ZaServerXFormView creates an view of one Server object
* @contructor
* @param parent {DwtComposite}
* @param app {@link ZaApp}
* @author Greg Solovyev
**/
function ZaServerXFormView (parent, app) {
	ZaTabView.call(this, parent, app,"ZaServerXFormView");	
	this.initForm(ZaServer.myXModel,this.getMyXForm());
	this._localXForm.setController(this._app);
}

ZaServerXFormView.prototype = new ZaTabView();
ZaServerXFormView.prototype.constructor = ZaServerXFormView;
ZaTabView.XFormModifiers["ZaServerXFormView"] = new Array();

ZaServerXFormView.onFormFieldChanged = 
function (value, event, form) {
	DBG.println (AjxDebug.DBG1, "On Form Field Changed ...");
	
	form.parent.setDirty(true);
	this.setInstanceValue(value);
	return value;
}

ZaServerXFormView.prototype.setObject = 
function (entry) {
	this.entry = entry;
	this._containedObject = AjxUtil.createProxy(entry,3);
	
	for(var a in entry) {
		if(typeof(entry[a]) == "object" || entry[a] instanceof Array) {
			continue;
		}
		this._containedObject[a] = entry[a];
	}
	
	if(!entry[ZaModel.currentTab])
		this._containedObject[ZaModel.currentTab] = "1";
	else
		this._containedObject[ZaModel.currentTab] = entry[ZaModel.currentTab];

	if(this._containedObject[ZaServer.A_Volumes])	
		this._containedObject[ZaServer.A_Volumes].sort(ZaServer.compareVolumesByName);		
		
	this._localXForm.setInstance(this._containedObject);	
}

ZaServerXFormView.isCurrent = function() {
	var volumeId = this.getModel().getInstanceValue(this.getInstance(), this.__parentItem.refPath + "/" +  ZaServer.A_VolumeId);
	return (volumeId != null && 
		(volumeId == this.getInstance()[ZaServer.A_CurrentPrimaryMsgVolumeId] ||
			volumeId == this.getInstance()[ZaServer.A_CurrentIndexMsgVolumeId] ||
			volumeId == this.getInstance()[ZaServer.A_CurrentSecondaryMsgVolumeId])
		);
}

ZaServerXFormView.isExistingVolume = function() {
	var volumeId = parseInt(this.getModel().getInstanceValue(this.getInstance(), this.__parentItem.refPath + "/" +  ZaServer.A_VolumeId));
	return (volumeId > 0);
}

/**
* @return {int}
 1 - show read-only label
 2 - Primary/Secondary
 3 - Primary/Secondary/Index
 4 - Primary/Index
**/
ZaServerXFormView.whichVolumeTypeSelect = function() {
	var model = this.getModel();
	var instance = this.getInstance();
 	if(model.getInstanceValue(instance, (this.__parentItem.refPath + '/' + ZaServer.A_VolumeId))) {
	 	//volume exists => don't allow changing its type
 		return 1;
 	} else {
 		//allow changing its type to Primary/Index
 		return 2;
 	}
}

ZaServerXFormView.onVolumeRemove = function (index, form) {
	var path = this.getRefPath();
	if(!this.getInstance()[ZaServer.A_RemovedVolumes]) {
		this.getInstance()[ZaServer.A_RemovedVolumes] = new Array();
	}
	//remove only existing volumes, ignore volumes that have not been saved yet
	if(this.getModel().getInstanceValue(this.getInstance(), path)[index][ZaServer.A_VolumeId]) {
		this.getInstance()[ZaServer.A_RemovedVolumes].push(this.getModel().getInstanceValue(this.getInstance(), path)[index]);
	}
	form.parent.setDirty(true);
	this.getModel().removeRow(this.getInstance(), path, index);	
}

ZaServerXFormView.makeCurrentHandler = function(ev) {
	var instance = this.getInstance();
	var parentRefPath = this.getParentItem().refPath;
	var model = this.getModel();
	var myVolumeType = parseInt(model.getInstanceValue(instance, (parentRefPath + '/' + ZaServer.A_VolumeType)));
	var myVolumeId = parseInt(model.getInstanceValue(instance, (parentRefPath + '/' + ZaServer.A_VolumeId)));
	switch(myVolumeType) {
		case ZaServer.PRI_MSG:
			instance[ZaServer.A_CurrentPrimaryMsgVolumeId] = myVolumeId;
		break;
		case ZaServer.SEC_MSG:
			instance[ZaServer.A_CurrentSecondaryMsgVolumeId] = myVolumeId;		
		break;
		case ZaServer.INDEX:
			instance[ZaServer.A_CurrentIndexMsgVolumeId] = myVolumeId;				
		break;
	}
	form = this.getForm();
	form.refresh();
	form.parent.setDirty(true);
}





ZaServerXFormView.getTLSEnabled = function () {
	var value = this.getModel().getInstanceValue(this.getInstance(),ZaServer.A_zimbraMtaAuthEnabled);
	return value == 'TRUE';
}

ZaServerXFormView.getIMAPEnabled = function () {
	var value = this.getModel().getInstanceValue(this.getInstance(),ZaServer.A_ImapServerEnabled);
	return value == 'TRUE';
}

ZaServerXFormView.getIMAPSSLEnabled = function () {
	var value = this.getModel().getInstanceValue(this.getInstance(),ZaServer.A_ImapSSLServerEnabled);	
	return (value == 'TRUE' && ZaServerXFormView.getIMAPEnabled.call(this));
}

ZaServerXFormView.getPOP3Enabled = function () {
	var value = this.getModel().getInstanceValue(this.getInstance(),ZaServer.A_Pop3ServerEnabled);
	return value == 'TRUE';
}

ZaServerXFormView.getPOP3SSLEnabled = function () {
	var value = this.getModel().getInstanceValue(this.getInstance(),ZaServer.A_Pop3SSLServerEnabled);
	return (value == 'TRUE' && ZaServerXFormView.getPOP3Enabled.call(this));
}

ZaServerXFormView.getMailboxEnabled = function () {
	var value = this.getModel().getInstanceValue(this.getInstance(),ZaServer.A_showVolumes);
	return value;
}

ZaServerXFormView.getMailProxyInstalled = function () {
	return this.getModel().getInstanceValue(this.getInstance(),ZaServer.A_zimbraMailProxyServiceInstalled);
}

ZaServerXFormView.getMailProxyEnabled = function () {
	return this.getModel().getInstanceValue(this.getInstance(),ZaServer.A_zimbraMailProxyServiceEnabled) && ZaServerXFormView.getMailProxyInstalled.call(this);	
}

ZaServerXFormView.getIMAPSSLProxyEnabled = function () {
	return (ZaServerXFormView.getMailProxyEnabled.call(this) && ZaServerXFormView.getIMAPSSLEnabled.call(this));
}

ZaServerXFormView.getPOP3ProxyEnabled = function () {
	return (ZaServerXFormView.getPOP3Enabled.call(this) && ZaServerXFormView.getMailProxyEnabled.call(this));
}

ZaServerXFormView.getPOP3SSLProxyEnabled = function () {
	return (ZaServerXFormView.getMailProxyEnabled.call(this) && ZaServerXFormView.getPOP3SSLEnabled.call(this));
}

ZaServerXFormView.getVolumeTypeDisplayValue = 
function(val) {
	if(!val)
		return "";
		
	var value = parseInt(val);
	switch(value ) {
		case ZaServer.PRI_MSG :
			return ZaMsg.NAD_VOLUME_Msg;
		case ZaServer.INDEX:
			return ZaMsg.NAD_VOLUME_Index;
		default :
			return val;
	}
}

ZaServerXFormView.volumeSelectionListener = 
function (ev) {
	var instance = this.getInstance();

	var arr = this.widget.getSelection();	
	if(arr && arr.length) {
		arr.sort(ZaServer.compareVolumesByName);
		instance.volume_selection_cache = arr;
	} else 
		instance.volume_selection_cache = null;
		
	this.getForm().refresh();
	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		ZaServerXFormView.editButtonListener.call(this);
	}	
}

ZaServerXFormView.isEditVolumeEnabled = function () {
	return (this.instance.volume_selection_cache != null && this.instance.volume_selection_cache.length==1);
}

ZaServerXFormView.isDeleteVolumeEnabled = function () {
	if(this.instance.volume_selection_cache != null && this.instance.volume_selection_cache.length>0) {
		for(var i = 0; i < this.instance.volume_selection_cache.length;i++) {
			if(this.instance.volume_selection_cache[i][ZaServer.A_VolumeId]==this.instance[ZaServer.A_CurrentSecondaryMsgVolumeId])
				return false;
			else if(this.instance.volume_selection_cache[i][ZaServer.A_VolumeId]==this.instance[ZaServer.A_CurrentPrimaryMsgVolumeId])
				return false;			
			else if(this.instance.volume_selection_cache[i][ZaServer.A_VolumeId]==this.instance[ZaServer.A_CurrentIndexMsgVolumeId])
				return false;				
		}
		return true;
	} else 
		return false;
}

ZaServerXFormView.editButtonListener =
function () {
	var instance = this.getInstance();
	if(instance.volume_selection_cache && instance.volume_selection_cache[0]) {	
		var formPage = this.getForm().parent;
		if(!formPage.editVolumeDlg) {
			formPage.editVolumeDlg = new ZaEditVolumeXDialog(formPage._app.getAppCtxt().getShell(), formPage._app,"550px", "150px",ZaMsg.VM_Edit_Volume_Title);
			formPage.editVolumeDlg.registerCallback(DwtDialog.OK_BUTTON, ZaServerXFormView.updateVolume, this.getForm(), null);						
		}
		var obj = {};
		obj[ZaServer.A_VolumeId] = instance.volume_selection_cache[0][ZaServer.A_VolumeId];
		obj[ZaServer.A_VolumeName] = instance.volume_selection_cache[0][ZaServer.A_VolumeName];
		obj[ZaServer.A_VolumeRootPath] = instance.volume_selection_cache[0][ZaServer.A_VolumeRootPath];
		obj[ZaServer.A_VolumeCompressBlobs] = instance.volume_selection_cache[0][ZaServer.A_VolumeCompressBlobs];
		obj[ZaServer.A_VolumeCompressionThreshold] = instance.volume_selection_cache[0][ZaServer.A_VolumeCompressionThreshold];
		obj[ZaServer.A_VolumeType] = instance.volume_selection_cache[0][ZaServer.A_VolumeType];		
		obj.current = (instance[ZaServer.A_CurrentPrimaryMsgVolumeId] == obj[ZaServer.A_VolumeId] || 
			instance[ZaServer.A_CurrentSecondaryMsgVolumeId] == obj[ZaServer.A_VolumeId] ||
			instance[ZaServer.A_CurrentIndexMsgVolumeId] == obj[ZaServer.A_VolumeId])

		formPage.editVolumeDlg.setObject(obj);
		formPage.editVolumeDlg.popup();		
	}
}

ZaServerXFormView.deleteButtonListener = function () {
	var instance = this.getInstance();
	var path = ZaServer.A_Volumes;

	if(!this.getInstance()[ZaServer.A_RemovedVolumes]) {
		this.getInstance()[ZaServer.A_RemovedVolumes] = new Array();
	}

	if(instance.volume_selection_cache != null) {
		var cnt = instance.volume_selection_cache.length>0;
		if(cnt && instance[ZaServer.A_Volumes] && instance[ZaServer.A_Volumes]) {
			for(var i=0;i<cnt;i++) {
				var cnt2 = instance[ZaServer.A_Volumes].length-1;				
				for(var k=0;k<cnt2;k++) {
					if(instance[ZaServer.A_Volumes][k][ZaServer.A_VolumeId]==instance.volume_selection_cache[i][ZaServer.A_VolumeId]) {
						instance[ZaServer.A_RemovedVolumes].push(instance[ZaServer.A_Volumes][k]);
						instance[ZaServer.A_Volumes].splice(k,1);
						break;	
					}
				}
			}
				
		}
	}
	this.getForm().parent.setDirty(true);
}

ZaServerXFormView.addButtonListener =
function () {
	var instance = this.getInstance();
	var formPage = this.getForm().parent;
	if(!formPage.addVolumeDlg) {
		formPage.addVolumeDlg = new ZaEditVolumeXDialog(formPage._app.getAppCtxt().getShell(), formPage._app,"550px", "150px",ZaMsg.VM_Add_Volume_Title);
		formPage.addVolumeDlg.registerCallback(DwtDialog.OK_BUTTON, ZaServerXFormView.addVolume, this.getForm(), null);						
	}
	
	var obj = {};
	obj[ZaServer.A_VolumeId] = null;
	obj[ZaServer.A_VolumeName] = "";
	obj[ZaServer.A_VolumeRootPath] = "/opt/zimbra";
	obj[ZaServer.A_VolumeCompressBlobs] = true;
	obj[ZaServer.A_VolumeCompressionThreshold] = 4096;
	obj[ZaServer.A_VolumeType] = ZaServer.PRI_MSG;		
	obj.current = false;		
	
	formPage.addVolumeDlg.setObject(obj);
	formPage.addVolumeDlg.popup();		
}
/**
* This method is added to the map {@link ZaTabView#XFormModifiers}
* @param xFormObject {Object} a definition of the form. This method adds/removes/modifies xFormObject to construct
* a Server view. 
**/
ZaServerXFormView.myXFormModifier = function(xFormObject) {	
	var headerList = new Array();
	headerList[0] = new ZaListHeaderItem(ZaServer.A_VolumeName, ZaMsg.VM_VolumeName, null, "100px", false, null, false, true);
	headerList[1] = new ZaListHeaderItem(ZaServer.A_VolumeRootPath, ZaMsg.VM_VolumeRootPath, null,"250px", false, null, false, true);
	headerList[2] = new ZaListHeaderItem(ZaServer.A_VolumeType, ZaMsg.VM_VolumeType, null, "120px", null, null, false, true);							
	headerList[3] = new ZaListHeaderItem(ZaServer.A_VolumeCompressBlobs, ZaMsg.VM_VolumeCompressBlobs, null, "120px", null, null, false, true);								
	headerList[4] = new ZaListHeaderItem(ZaServer.A_VolumeCompressionThreshold, ZaMsg.VM_VolumeCompressThreshold, null, "120px", null, null, false, true);									
	headerList[5] = new ZaListHeaderItem(ZaServer.A_isCurrentVolume, ZaMsg.VM_CurrentVolume, null, "50px", null, null, false, true);										



						
	
	xFormObject.tableCssStyle="width:100%;position:static;overflow:auto;";
	
	xFormObject.items = [
		{type:_GROUP_, cssClass:"ZmSelectedHeaderBg", colSpan: "*", id:"xform_header", 
			items: [
				{type:_GROUP_,	numCols:4,colSizes:["32px","350px","100px","250px"],
					items: [
						{type:_AJX_IMAGE_, src:"Server_32", label:null, rowSpan:2},
						{type:_OUTPUT_, ref:ZaServer.A_name, label:null,cssClass:"AdminTitle", rowSpan:2},				
						{type:_OUTPUT_, ref:ZaServer.A_ServiceHostname, label:ZaMsg.NAD_ServiceHostname+":"},
						{type:_OUTPUT_, ref:ZaItem.A_zimbraId, label:ZaMsg.NAD_ZimbraID}
					]
				}
			],
			cssStyle:"padding-top:5px; padding-bottom:5px"
		},
		{type:_TAB_BAR_, ref:ZaModel.currentTab,
			relevantBehavior:_HIDE_,
			containerCssStyle: "padding-top:0px",
			choices:[
				{value:1, label:ZaMsg.NAD_Tab_General},
				{value:2, label:ZaMsg.NAD_Tab_Services},
				{value:3, label:ZaMsg.NAD_Tab_MTA},
				{value:4, label:ZaMsg.NAD_Tab_IMAP},					
				{value:5, label:ZaMsg.NAD_Tab_POP},
				{value:6, label:ZaMsg.NAD_Tab_VolumeMgt}										
			],
			cssClass:"ZaTabBar", id:"xform_tabbar"
		},
		{type:_SWITCH_, items:[
				{type:_ZATABCASE_, width:"100%",colSizes:["100px","300px"], relevant:"instance[ZaModel.currentTab] == 1", 
					items:[
						{ref:ZaServer.A_name, type:_OUTPUT_, label:ZaMsg.NAD_DisplayName+":", labelLocation:_LEFT_},
						{ ref: ZaServer.A_description, type:_INPUT_, 
						  label:ZaMsg.NAD_Description,cssClass:"admin_xform_name_input",
						  onChange:ZaServerXFormView.onFormFieldChanged
						},
						{ ref: ZaServer.A_ServiceHostname, type:_OUTPUT_, 
						  label:ZaMsg.NAD_ServiceHostname+":", cssClass:"admin_xform_name_input"/*,
						  onChange:ZaServerXFormView.onFormFieldChanged*/
						},
						{ ref: ZaServer.A_LmtpAdvertisedName, type:_INPUT_, 
						  label: ZaMsg.NAD_LmtpAdvertisedName, cssClass:"admin_xform_name_input",
						  onChange: ZaServerXFormView.onFormFieldChanged
						},
						{ ref: ZaServer.A_LmtpBindAddress, type:_INPUT_, 
						  label:ZaMsg.NAD_LmtpBindAddress, cssClass:"admin_xform_name_input",
						  onChange:ZaServerXFormView.onFormFieldChanged
						},
						{ ref: ZaServer.A_notes, type:_TEXTAREA_, 
						  label: ZaMsg.NAD_Notes, labelCssStyle: "vertical-align:top", width: "30em",
						  onChange:ZaServerXFormView.onFormFieldChanged
					    }
					]
				},
				{type:_ZATABCASE_, width:"100%",colSizes:["100px","300px"], relevant:"instance[ZaModel.currentTab] == 2", 
					items:[
						{ type: _GROUP_, label: ZaMsg.NAD_Service_EnabledServices, labelCssStyle: "vertical-align:top",
						  items: [
						  	{ ref: ZaServer.A_zimbraLdapServiceEnabled, type: _CHECKBOX_,
						  	  relevant: "instance.attrs[ZaServer.A_zimbraLdapServiceInstalled]", 
						  	  relevantBehavior: _DISABLE_,
						  	  label: ZaMsg.NAD_Service_LDAP,
					  	      onChange: ZaServerXFormView.onFormFieldChanged
						  	},
						  	{ ref: ZaServer.A_zimbraMailboxServiceEnabled, type: _CHECKBOX_,
						  	  relevant: "instance.attrs[ZaServer.A_zimbraMailboxServiceInstalled]", 
						  	  relevantBehavior: _DISABLE_,
						  	  label: ZaMsg.NAD_Service_Mailbox,
					  	      onChange: ZaServerXFormView.onFormFieldChanged
						  	},
						  	{ ref: ZaServer.A_zimbraMailProxyServiceEnabled, type: _CHECKBOX_,
						  	  relevant: "instance.attrs[ZaServer.A_zimbraMailProxyServiceInstalled]", 
						  	  relevantBehavior: _DISABLE_,
						  	  label: ZaMsg.NAD_Service_Imapproxy,
					  	      onChange: ZaServerXFormView.onFormFieldChanged
						  	},						  	
						  	{ ref: ZaServer.A_zimbraMtaServiceEnabled, type: _CHECKBOX_,
						  	  relevant: "instance.attrs[ZaServer.A_zimbraMtaServiceInstalled]", 
						  	  relevantBehavior: _DISABLE_,
						  	  label: ZaMsg.NAD_Service_MTA,
					  	      onChange: ZaServerXFormView.onFormFieldChanged
						  	},
						  	{ ref: ZaServer.A_zimbraSnmpServiceEnabled, type: _CHECKBOX_,
						  	  relevant: "instance.attrs[ZaServer.A_zimbraSnmpServiceInstalled]", 
						  	  relevantBehavior: _DISABLE_,
						  	  label: ZaMsg.NAD_Service_SNMP,
					  	      onChange: ZaServerXFormView.onFormFieldChanged
						  	},
						  	{ ref: ZaServer.A_zimbraAntiSpamServiceEnabled, type: _CHECKBOX_,
						  	  relevant: "instance.attrs[ZaServer.A_zimbraAntiSpamServiceInstalled]", 
						  	  relevantBehavior: _DISABLE_,
						  	  label: ZaMsg.NAD_Service_AntiSpam,
					  	      onChange: ZaServerXFormView.onFormFieldChanged
						  	},
						  	{ ref: ZaServer.A_zimbraAntiVirusServiceEnabled, type: _CHECKBOX_,
						  	  relevant: "instance.attrs[ZaServer.A_zimbraAntiVirusServiceInstalled]", 
						  	  relevantBehavior: _DISABLE_,
						  	  label: ZaMsg.NAD_Service_AntiVirus,
					  	      onChange: ZaServerXFormView.onFormFieldChanged
						  	},
						  	{ ref: ZaServer.A_zimbraSpellServiceEnabled, type: _CHECKBOX_,
						  	  relevant: "instance.attrs[ZaServer.A_zimbraSpellServiceInstalled]", 
						  	  relevantBehavior: _DISABLE_,
						  	  label: ZaMsg.NAD_Service_Spell,
					  	      onChange: ZaServerXFormView.onFormFieldChanged
						  	},
						  	{ ref: ZaServer.A_zimbraLoggerServiceEnabled, type: _CHECKBOX_,
						  	  relevant: "instance.attrs[ZaServer.A_zimbraLoggerServiceInstalled]", 
						  	  relevantBehavior: _DISABLE_,
						  	  label: ZaMsg.NAD_Service_Logger,
					  	      onChange: ZaServerXFormView.onFormFieldChanged
						  	}							  	
						]}
					]
				}, 
				{ type: _ZATABCASE_,  width:"100%", relevant: "instance[ZaModel.currentTab] == 3",
			      items: [
			      	{ ref:ZaServer.A_zimbraMtaAuthEnabled, type: _SUPER_CHECKBOX_,
			      	  trueValue: "TRUE", falseValue: "FALSE",
			      	  onChange: ZaServerXFormView.onFormFieldChanged,
			      	  resetToSuperLabel:ZaMsg.NAD_ResetToGlobal,
			      	  checkBoxLabel:ZaMsg.NAD_MTA_Authentication
		      	    },
			      	{ ref:ZaServer.A_zimbraMtaTlsAuthOnly, type: _SUPER_CHECKBOX_,
			      	  relevant:"ZaServerXFormView.getTLSEnabled.call(item)",
			      	  relevantBehavior: _DISABLE_,
			      	  trueValue: "TRUE", falseValue: "FALSE",
			      	  onChange: ZaServerXFormView.onFormFieldChanged,
			      	  resetToSuperLabel:ZaMsg.NAD_ResetToGlobal,
			      	  checkBoxLabel:ZaMsg.NAD_MTA_TlsAuthenticationOnly
		      	    },
			      	{type:_SEPARATOR_, numCols:2},
					{ref:ZaServer.A_SmtpHostname, type:_SUPER_TEXTFIELD_, 
					  txtBoxLabel:ZaMsg.NAD_MTA_WebMailHostname,
					  resetToSuperLabel:ZaMsg.NAD_ResetToGlobal,
					  onChange: ZaServerXFormView.onFormFieldChanged,
					  toolTipContent: ZaMsg.tt_MTA_WebMailHostname,
					  textFieldCssClass:"admin_xform_name_input"
					},
					{type:_GROUP_,numCols:3,colSpan:3, colSizes:["275px","275px","150px"],
						items:[
						{ref:ZaServer.A_SmtpPort, type:_OUTPUT_, 
						  label:ZaMsg.NAD_MTA_WebMailPort,
						   width:"4em"
						},
						{type:_SPACER_}
						]
					},
					{type:_GROUP_,numCols:3,colSpan:3, colSizes:["275px","275px","150px"],
					items:[
						{ref:ZaServer.A_SmtpTimeout, type:_INPUT_, 
						  label:ZaMsg.NAD_MTA_WebMailTimeout, width: "4em",
						  onChange: ZaServerXFormView.onFormFieldChanged
						},
						{type:_SPACER_}
						]
					},
					{type:_GROUP_,numCols:2,colSpan:3, colSizes:["275px","475px"],
						items:[
					      	{ ref:ZaServer.A_zimbraMtaRelayHost, type:_SUPER_HOSTPORT_,
					      	  label: ZaMsg.NAD_MTA_RelayMTA, 
					      	  onChange: ZaServerXFormView.onFormFieldChanged,
					      	  onClick: "ZaController.showTooltip",
							  toolTipContent: ZaMsg.tt_MTA_RelayMTA,
							  onMouseout: "ZaController.hideTooltip",
					      	  resetToSuperLabel:ZaMsg.NAD_ResetToGlobal
					      	}
					      ]
					},
			      	{ref:ZaServer.A_zimbraMtaMyNetworks,txtBoxLabel:ZaMsg.NAD_MTA_MyNetworks,
						type:_SUPER_TEXTFIELD_, 
						onChange: ZaServerXFormView.onFormFieldChanged,
						resetToSuperLabel:ZaMsg.NAD_ResetToGlobal,
						toolTipContent: ZaMsg.tt_MTA_MyNetworks,
						textFieldCssClass:"admin_xform_name_input"
					},
			        { ref: ZaServer.A_zimbraMtaDnsLookupsEnabled, type:_SUPER_CHECKBOX_,
			      	  checkBoxLabel:ZaMsg.NAD_MTA_DnsLookups,
			      	  trueValue: "TRUE", falseValue: "FALSE",
			      	  onChange: ZaServerXFormView.onFormFieldChanged,
			      	  resetToSuperLabel:ZaMsg.NAD_ResetToGlobal
		      	    }
			    ]},
				{type:_ZATABCASE_, width:"100%",colSizes:["250px","400px"], relevant:"instance[ZaModel.currentTab] == 4", 
					items:[
						{ type: _DWT_ALERT_,
						  containerCssStyle: "padding-bottom:0px",
						  style: DwtAlert.WARNING,
						  iconVisible: false, 
						  content: ZaMsg.Alert_ServerRestart
						},							
				      	{ ref: ZaServer.A_ImapServerEnabled, type: _SUPER_CHECKBOX_,
				      	  checkBoxLabel:ZaMsg.NAD_IMAP_Service,
				      	  trueValue: "TRUE", falseValue: "FALSE",
				      	  onChange: ZaServerXFormView.onFormFieldChanged,
				      	  resetToSuperLabel:ZaMsg.NAD_ResetToGlobal
				  	    },	
						{ ref: ZaServer.A_zimbraImapBindPort, type:_SUPER_TEXTFIELD_, 
						  relevant: "ZaServerXFormView.getIMAPEnabled.call(item)",
						  relevantBehavior: _HIDE_,
						  txtBoxLabel: ZaMsg.NAD_IMAP_Port, width: "5em",
						  onChange: ZaServerXFormView.onFormFieldChanged,
				      	  resetToSuperLabel:ZaMsg.NAD_ResetToGlobal
						},	
						{ ref: ZaServer.A_zimbraImapProxyBindPort, type:_SUPER_TEXTFIELD_, 
						  relevant: "ZaServerXFormView.getMailProxyEnabled.call(item)",
						  relevantBehavior: _HIDE_,
						  txtBoxLabel: ZaMsg.NAD_IMAP_Proxy_Port, width: "5em",
						  onChange: ZaServerXFormView.onFormFieldChanged,
				      	  resetToSuperLabel:ZaMsg.NAD_ResetToGlobal
						},							
						{ ref: ZaServer.A_zimbraImapNumThreads, type:_SUPER_TEXTFIELD_, 
						  relevant: "ZaServerXFormView.getIMAPEnabled.call(item)",
						  relevantBehavior: _HIDE_,
						  txtBoxLabel: ZaMsg.NAD_IMAP_NumThreads, width: "5em",
						  onChange: ZaServerXFormView.onFormFieldChanged,
				      	  resetToSuperLabel:ZaMsg.NAD_ResetToGlobal
						},							
					    {ref: ZaServer.A_ImapSSLServerEnabled, type: _SUPER_CHECKBOX_,
						  checkBoxLabel:ZaMsg.NAD_IMAP_SSLService,
					      relevant:"ZaServerXFormView.getIMAPEnabled.call(item)",
					      trueValue: "TRUE", falseValue: "FALSE",
					      onChange: ZaServerXFormView.onFormFieldChanged,
					      resetToSuperLabel:ZaMsg.NAD_ResetToGlobal,
					      relevantBehavior:_DISABLE_
				      	},
						{ ref: ZaServer.A_ImapSSLBindPort, type:_SUPER_TEXTFIELD_, 
						  relevant: "ZaServerXFormView.getIMAPSSLEnabled.call(item)",
						  relevantBehavior: _HIDE_,
						  txtBoxLabel: ZaMsg.NAD_IMAP_SSLPort, width: "5em",
						  onChange: ZaServerXFormView.onFormFieldChanged,
				      	  resetToSuperLabel:ZaMsg.NAD_ResetToGlobal
						},		
						{ ref: ZaServer.A_zimbraImapSSLProxyBindPort, type:_SUPER_TEXTFIELD_, 
						  relevant: "ZaServerXFormView.getIMAPSSLProxyEnabled.call(item)",
						  relevantBehavior: _HIDE_,
						  txtBoxLabel: ZaMsg.NAD_IMAP_SSL_Proxy_Port, width: "5em",
						  onChange: ZaServerXFormView.onFormFieldChanged,
				      	  resetToSuperLabel:ZaMsg.NAD_ResetToGlobal
						},										      	
				      	{ ref: ZaServer.A_ImapCleartextLoginEnabled, type: _SUPER_CHECKBOX_,
				      	  checkBoxLabel:ZaMsg.NAD_IMAP_CleartextLoginEnabled,
				      	  relevant:"ZaServerXFormView.getIMAPEnabled.call(item)",
				      	  trueValue: "TRUE", falseValue: "FALSE",
				      	  onChange: ZaServerXFormView.onFormFieldChanged,
				      	  resetToSuperLabel:ZaMsg.NAD_ResetToGlobal,
				      	  relevantBehavior:_DISABLE_
			      	    }							  
					]
				},
				{type:_ZATABCASE_, width:"100%",relevant:"instance[ZaModel.currentTab] == 5", 
					items:[
						{ type: _DWT_ALERT_,
						  containerCssStyle: "padding-bottom:0px",
						  style: DwtAlert.WARNING,
						  iconVisible: false, 
						  content: ZaMsg.Alert_ServerRestart
						},
				      	{ ref: ZaServer.A_Pop3ServerEnabled, type: _SUPER_CHECKBOX_,
				      	  trueValue: "TRUE", falseValue: "FALSE",
				      	  onChange: ZaServerXFormView.onFormFieldChanged,
				      	  resetToSuperLabel:ZaMsg.NAD_ResetToGlobal,
				      	  checkBoxLabel:ZaMsg.NAD_POP_Service, 
				      	  relevantBehavior:_DISABLE_
			      	    },		
						{ ref: ZaServer.A_zimbraPop3BindPort, type:_SUPER_TEXTFIELD_, 
						  relevant:"ZaServerXFormView.getPOP3Enabled.call(item)",
						  relevantBehavior: _DISABLE_,
						  txtBoxLabel: ZaMsg.NAD_POP_Port,
						  labelLocation:_LEFT_, 
						  textFieldCssClass:"admin_xform_number_input", 
						  onChange:ZaServerXFormView.onFormFieldChanged,
				      	  resetToSuperLabel:ZaMsg.NAD_ResetToGlobal
					  	},		
						{ ref: ZaServer.A_zimbraPop3ProxyBindPort, type:_SUPER_TEXTFIELD_,
						  relevant:"ZaServerXFormView.getPOP3ProxyEnabled.call(item)",
						  relevantBehavior: _HIDE_,
						  labelLocation:_LEFT_, 
						  textFieldCssClass:"admin_xform_number_input", 
						  txtBoxLabel: ZaMsg.NAD_POP_proxy_Port,
						  onChange:ZaServerXFormView.onFormFieldChanged,
				      	  resetToSuperLabel:ZaMsg.NAD_ResetToGlobal
					  	},
					  	{type:_GROUP_,numCols:3,colSpan:3,
					  	  colSizes:["275px","275px","150px"],
					  	  relevant:"ZaServerXFormView.getPOP3Enabled.call(item)",
						  		relevantBehavior:_DISABLE_,
					  		items:[
							{ ref: ZaServer.A_Pop3BindAddress, type:_TEXTFIELD_, 
															
							 	label:ZaMsg.NAD_POP_Address,
							  	onChange:ZaServerXFormView.onFormFieldChanged
						  	},
						  	{type:_SPACER_}
						  ]
					  	},
					  	{type:_GROUP_,numCols:3,colSpan:3,
					  	  colSizes:["275px","275px","150px"], 
					  	  relevant:"ZaServerXFormView.getPOP3Enabled.call(item)",
								  relevantBehavior:_DISABLE_,
					  		items:[					  	
								{ ref: ZaServer.A_Pop3AdvertisedName, type:_TEXTFIELD_, 
								  labelLocation:_LEFT_,
								  
								  label: ZaMsg.NAD_POP_AdvertisedName, 
								  onChange: ZaServerXFormView.onFormFieldChanged
								},
							  	{type:_SPACER_}								
							]
					  	},
						{ ref: ZaServer.A_zimbraPop3NumThreads, type:_SUPER_TEXTFIELD_, 
						  relevant: "ZaServerXFormView.getPOP3Enabled.call(item)",
						  relevantBehavior: _HIDE_,
						  labelLocation:_LEFT_, 
						  textFieldCssClass:"admin_xform_number_input", 
						  txtBoxLabel: ZaMsg.NAD_POP_NumThreads,
						  onChange: ZaServerXFormView.onFormFieldChanged,
				      	  resetToSuperLabel:ZaMsg.NAD_ResetToGlobal
						},
				      	{ ref: ZaServer.A_Pop3SSLServerEnabled, type: _SUPER_CHECKBOX_,
				      	  checkBoxLabel:ZaMsg.NAD_POP_SSL,
				      	  relevant:"ZaServerXFormView.getPOP3Enabled.call(item)",
				      	  relevantBehavior: _DISABLE_,
				      	  trueValue: "TRUE", falseValue: "FALSE",
				      	  onChange: ZaServerXFormView.onFormFieldChanged,
				      	  resetToSuperLabel:ZaMsg.NAD_ResetToGlobal,
				      	  relevantBehavior:_DISABLE_
			      	    },		
						{ ref: ZaServer.A_zimbraPop3SSLBindPort, type:_SUPER_TEXTFIELD_,
						  relevant:"ZaServerXFormView.getPOP3SSLEnabled.call(item)",
						  relevantBehavior: _HIDE_,
						  labelLocation:_LEFT_, 
						  txtBoxLabel: ZaMsg.NAD_POP_SSL_Port,
						  onChange:ZaServerXFormView.onFormFieldChanged,
				      	  resetToSuperLabel:ZaMsg.NAD_ResetToGlobal
					  	},		
						{ ref: ZaServer.A_zimbraPop3SSLProxyBindPort, type:_SUPER_TEXTFIELD_, 
						  relevant:"ZaServerXFormView.getPOP3SSLProxyEnabled.call(item)",
						  relevantBehavior: _HIDE_,
						  labelLocation:_LEFT_, 
						  txtBoxLabel: ZaMsg.NAD_POP_SSL_proxy_Port,
						  textFieldCssClass:"admin_xform_number_input", 
						  onChange:ZaServerXFormView.onFormFieldChanged,
				      	  resetToSuperLabel:ZaMsg.NAD_ResetToGlobal
					  	},						  			      	    						  
				      	{ ref: ZaServer.A_Pop3CleartextLoginEnabled, type: _SUPER_CHECKBOX_,
				      	  checkBoxLabel:ZaMsg.NAD_POP_CleartextLoginEnabled,
				      	  relevant:"ZaServerXFormView.getPOP3Enabled.call(item)",
				      	  relevantBehavior: _DISABLE_,
				      	  trueValue: "TRUE", falseValue: "FALSE",
				      	  onChange: ZaServerXFormView.onFormFieldChanged,
				      	  resetToSuperLabel:ZaMsg.NAD_ResetToGlobal,
				      	  relevantBehavior:_DISABLE_
			      	    }							  
					]
				},
				{type:_ZATABCASE_, relevant:"((instance[ZaModel.currentTab] == 6) && ZaServerXFormView.getMailboxEnabled.call(item))", 
					numCols:1,
					items:[
						{type:_ZAGROUP_, items:[
							{ref:ZaServer.A_Volumes, type:_DWT_LIST_, height:"250", width:"100%", 
							 	forceUpdate: true, preserveSelection:true, multiselect:true,cssClass: "DLSource", 
							 	headerList:headerList, widgetClass:ZaServerVolumesListView,
							 	onSelection:ZaServerXFormView.volumeSelectionListener
							}
						]},	
						{type:_GROUP_, numCols:5, colSizes:["100px","auto","100px","auto","100px"], 
							items: [
								{type:_DWT_BUTTON_, label:ZaMsg.TBB_Delete,
									onActivate:"ZaServerXFormView.deleteButtonListener.call(this);",
									relevant:"ZaServerXFormView.isDeleteVolumeEnabled.call(this)", relevantBehavior:_DISABLE_
								},
								{type:_CELLSPACER_},
								{type:_DWT_BUTTON_, label:ZaMsg.TBB_Edit,
									onActivate:"ZaServerXFormView.editButtonListener.call(this);",
									relevant:"ZaServerXFormView.isEditVolumeEnabled.call(this)", relevantBehavior:_DISABLE_
								},
								{type:_CELLSPACER_},
								{type:_DWT_BUTTON_, label:ZaMsg.NAD_Add,
									onActivate:"ZaServerXFormView.addButtonListener.call(this);"
								}
							]
						 }
						
					]
				},
				{type:_ZATABCASE_, relevant:"((instance[ZaModel.currentTab] == 6) && !instance[ZaServer.A_showVolumes])", 					
					items: [
						{ type: _DWT_ALERT_,
						  cssClass: "DwtTabTable",
						  containerCssStyle: "padding-bottom:0px",
						  style: DwtAlert.WARNING,
						  iconVisible: true, 
						  content:ZaMsg.Alert_MbxSvcNotInstalled,
						  colSpan:"*"
						}						
					]
				
				}
			]
		}	
	];
};
ZaTabView.XFormModifiers["ZaServerXFormView"].push(ZaServerXFormView.myXFormModifier);