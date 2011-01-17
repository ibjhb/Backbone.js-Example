/* Artist Object for persistance */
component	persistent		= true
			accessors		= true
			entityname		= 'artists'
			{

			property name='id' 				column='ARTISTID' 		generator='increment';
			property name='FIRSTNAME'; 
		    property name='LASTNAME'; 
		    property name='ADDRESS'; 
		    property name='CITY'; 
		    property name='STATE'; 
		    property name='POSTALCODE'; 
		    property name='EMAIL'; 
		    property name='PHONE'; 
		    property name='FAX'; 
		    property name='THEPASSWORD'; 
}