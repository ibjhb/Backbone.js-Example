// Let's get started:
$(function(){
		
		// We're going to save the sync function to a local variable so it doesn't get overwritten below, 
		// and so we can call it below:
		var originalSync = Backbone.sync;
		
		// This is because my webserver and ColdFusion work better with these set to true.  Your results may vary:
		Backbone.emulateHTTP = true;
		Backbone.emulateJSON = true;
		
		// Synce we're going to persist to ColdFusion, we're going to modify each request before it is sent to the server,
		// if you are using php or other language, you may not need this block and/or may need to modify it for your language:
		Backbone.sync = function(method, model, success, error){
			if (!model.originalURL){
				model.originalURL = model.url;
			}
			model.url = model.originalURL + method + '&returnFormat=json';
			if (model.id){
				model.url = model.url + '&id=' + model.id;
			}
		    return originalSync(method, model, success, error);
		};
		
		
		// Create our 'artist' object and specify the URL for ajax calls:
		window.Artist = Backbone.Model.extend({
			url					: 'artistService.cfc?method='
		});
		
		// Setup our collection of artists and specify the URL for ajax calls.  We also
		// Specify which model this collection is going to be populated with:
		window.ArtistList = Backbone.Collection.extend({
			 model				: Artist
			,url				: 'artistService.cfc?method='
		});	
		
		// We're going to go ahead and create our colleciton of artists:
		window.Artists = new ArtistList;
		
		// This is a single artist view.  Don't think of it as a view of all the artists,
		// but the view of just one.  Each view will be each appended to our table to create
		// the whole table of rows:
		// In backbone, the view can also act as a sort of 'controller' in our MVC:
		window.ArtistView = Backbone.View.extend({
			 // This is our tag 'parent'
			 tagName			: "div"
			 // This class will be set to each div so we can style it via css
			,className			: "artist"
			// We're going to compile and set each of our templates into the view object
			// so we can reference them anytime and they are already compiled:
			,template			: _.template($('#item-template').html())
			,editTemplate		: _.template($('#edit-template').html())
			,deleteTemplate		: _.template($('#delete-template').html())

			// These are events that we setup for each view 'object'
			// The left-hand side is our action and the right-hand side is our function to call:
			,events: {
				 'click .artist_Keep' 	: 'toggleDone'
				,'click .edit'			: 'edit'
				,'click .delete'		: 'deleteObject'
			}
			
			// Our 'init' function.  We're going to also bind a 'change' event to our render function.
			// Lastly, we set the view into the model:
			,initialize: function(){
				_.bindAll(this, 'render', 'close');
      			this.model.bind('change', this.render);
      			this.model.view = this;
			}
			
			// Our render function.  This actually sends the data into the template and prepares the element:
			,render: function() {
				$(this.el).html(this.template(this.model.toJSON()));
				return this;
			}
			
			// We can hide the view, used when we create a new view so it doesn't show until we update the model with info:
			,hide: function(){
				$(this.el).addClass('hidden');
				return this;
			}
			// Show the view, typically after we create a new view:
			,show: function(){
				$(this.el).removeClass('hidden');
				return this;
			}
			
			// Helper function to know if the view is hidden or not:
			,isHidden: function(){
				return $(this.el).hasClass('hidden');
			}
			
			// Our massive edit function.  Fires when we want to edit a record:
			,edit: function() {
				// Let's get our dialog template ready and also save the model for later use:
				var dialogWindow = this.editTemplate(this.model.toJSON());
				var modelHolder = this.model;
				
				// Use jQuery UI to pop up the window and set some options and buttons:
				$(dialogWindow)
					.appendTo('body')
					.dialog({
	                     modal: true
						,width: 525
						,height: 400
	                    ,buttons: {
	                        OK: function(){
								
								var $dialog = $(this);
								// Serialize the object so we can set it into the model and save it up to the serveR:
								var newObject = $(this).children('form').serializeObject();
								
								// Our save function!  Backbone will automatically save the object, update the model,
								// re-render the view and send the data up to the server for persistence.  We also
								// set a callback function so we can show the view, if it's hidden and close the dialog
								// after the ajax returns from the server:
								modelHolder.save(newObject, {
									success: function(){
										modelHolder.view.show();
										$dialog.dialog('close');
									}
								});
	                        }
							,Cancel: function(){
								// Canceling the dialog/edit window.  If the record was new, we want to remove the view:
								if (modelHolder.view.isHidden()){
									modelHolder.destroy({success: function(model, response) {
										model.view.remove();  	
									}});
								}
								
								// Close the dialog:
								$(this).dialog('close');
							}
	                    }
						,close: function(event, ui) {
							// When we close the dialog, either through 'OK' or 'Cancel', we want to remove the dialog
							// code from the DOM:
							$(this).remove();
						}
	                });
				
				return false;
			}
			// Our delete confirmation:
			,deleteObject: function(){
				// Create the dialog window from our template, using the data from the model:
				var dialogWindow = this.deleteTemplate(this.model.toJSON());
				// Let's save the model to a local variable because 'this' changes later in the function:
				var modelHolder = this.model;
				
				// Create the dialog with options:
				$(dialogWindow)
					.appendTo('body')
					.dialog({
	                     modal: true
						,width: 525
						,height: 200
	                    ,buttons: {
	                        OK: function(){
								var $dialog = $(this);
								
								// Let's delete the object and backbone will let the server know via ajax. 
								// Also, have a callback function to remove the dialog and close the view:
								modelHolder.destroy({success: function(model, response) {
									model.view.remove();
									$dialog.dialog('close');  	
								}});
								
	                        }
							// Cancel button with closing the dialog:
							,Cancel: function(){
								$(this).dialog('close');
							}
	                    }
						// Remove the delete dialog modal from the DOM if we close the window:
						,close: function(event, ui) {
							$(this).remove();
						}
	                });
				
				return false;
			}
		
		});
		
		// Setup our application view			
		window.AppView = Backbone.View.extend({
			el		: $('#artistapp')

			// Setup the create event when they click the 'Add Artist' button:
			,events: {
				'click #newArtist'		: 'createOne'
			}
			
			// This starts everything up and going:
			,initialize: function(){
				
				// Keep 'this' going:
				_.bindAll(this, 'addOne', 'addAll');
				
				// Bind these events so they are fired too:
				Artists.bind('add',     this.addOne);
				Artists.bind('refresh', this.addAll);
				Artists.bind('all',     this.render);
				
				// This is what really gets things moving. 
				Artists.fetch();
			}
			// This creates a blank artist object that we can populate and use.  It also has
			// a callback to hide the new view and then pop up the edit dialog.  
			,createOne : function(){
				var newArtist = Artists.create({}, {
					success: function(){
						newArtist.view.hide();
						newArtist.view.edit();
					}
				});
				
				return false;
			}
			// This is to loop over the returned objects and render them out to the UI
			,addOne: function(artist){
				var view = new ArtistView({model : artist});
				this.$("#artist-list").append(view.render().el);
			}
			// This will be called after the .fetch() above.
			,addAll: function(){
				Artists.each(this.addOne);
			}
			
		});
		
		// Fire up the whole application:
		window.App = new AppView;
	});