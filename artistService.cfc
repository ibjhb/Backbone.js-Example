component  
	displayname='artistService' 
	output='false'
{
	// This is a utility function that deletes all blank or null artists.  It isn't used directly in the application:
	remote string function deleteNulls(){
		var nullArtists = entityLoad('artists', {LastName  = JavaCast('null', '')});
		var	blankArtists = entityLoad('artists', {LastName  = ''});
		
		nullArtists.addAll(blankArtists);

		for (artist in nullArtists){
			entityDelete(artist);
		}	
	}
	
	// Load all the persisted artists:
	remote string function read(){
		return SerializeJSON(entityLoad('artists'));
	}
	
	// Update an artist record:
	remote string function update(){
		var artist = entityNew('artists', deserializeJSON(arguments.model));
		EntitySave(artist);
		return SerializeJSON(artist);
	}
	
	// Create a new artist record:
	remote string function create(){
		var meta = getMetaData(entityNew('artists')).properties;
		var instance = {};
		
		for (i=1; i<= arrayLen(meta); i++) 
			instance[ meta[i].name ] = (!structKeyExists(variables, meta[i].name)) ? '' : variables[ meta[i].name ];
		
		structDelete(instance, 'id');
		arguments.model = serializeJSON(instance);
		return update(argumentCollection=arguments);
	}
	
	// Delete an artist record:
	remote string function delete(){
		if (!structKeyExists(arguments, 'model')){
			arguments.model = {};
			
			if (structKeyExists(arguments, 'id')){
				arguments.model.id = arguments.id;
			}
		}
		
		var artist = entityLoad('artists', arguments.model.id, true);
		entityDelete(artist);	
		return true;
	}
	
}