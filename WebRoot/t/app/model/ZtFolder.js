/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * This class is a special organizer, so that we can create another store
 * out of the ZtUserSession organizer data.

 * @author Macy Abbey
 */
Ext.define('ZCS.model.ZtFolder', {
	extend: 'ZCS.model.ZtOrganizer',
	config: {
		/**
		 * This is a hack to trick ext into allowing us to create two ZtOrganizers with the same 'id' property
		 */
		idProperty: 'foo'
	}
})