/* Enable ORM and set it up to the cfartgallery datasource */
component{

	this.name = hash(getCurrentTemplatePath());
	this.sessionManagement = true;
	this.sessionTimeout = createTimeSpan(0,0,30,0);
	this.setClientCookies = true;
	this.datasource = "cfartgallery";
	this.clientManagement = true;
	
	this.ormenabled = "true";
	this.ormsettings = {
			  logSQL 			= false
			 ,dbcreate			= 'update'
	};
}