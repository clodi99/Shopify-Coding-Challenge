'use strict';


module.exports = function(Product) {

	//find all products 
	Product.findAllProducts = function(req, callback){

		//filter wether to include items with no inventory
		if(req == 'true'){

			//find items with inventory
			Product.find({where: {inventory: {gt: 0}}, fields: {title: true, price: true, inventory: true}}, function(error, availableProducts){

				if(error) {
					callback(error);
				} else {
					callback(null,availableProducts);
				}
			});

		} else {

			//find all items
			Product.find({fields: {title: true, price: true, inventory: true}}, function(error, availableProducts){

				if(error) {
					callback(error);
				} else {
					callback(null,availableProducts);
				}
			});
			
		}

		
	};

	//find a specified item from req argument 
	Product.findProduct = function(req, callback){


		Product.findOne({where: {title: req}, fields: {title: true, price: true, inventory: true}}, function(error, availableProduct){


			if(error) return callback(error);


			var err = {
					statusCode: "400",
					message: "No inventory"
				};
			
			// check whether item has inventory or not to respond with error
			if(availableProduct.inventory == 0){

				callback(err);

			} else {

				//respond with item if there is inventory available 
				callback(null,availableProduct);
			}

		});
	};


	Product.purchaseProduct = function(req, callback){


			//find item to be purchase using req argument
			Product.findOne({where: {title: req}}, function(error, availableProduct){

			//check if item has inventory
			if(availableProduct.inventory != 0){

				//calculate new inventory
				let newInventory = availableProduct.inventory - 1;

				//reduce inventory by 1
				availableProduct.updateAttributes({inventory: newInventory}, function(invError, newInventory){

					if(invError) return callback(invError);
				});

				//return success
				let result = {
					statusCode: "200",
					message: "Success"
				}

				callback(null,result);

			} else {

				//return error if item has no inventory
				let result = {
					statusCode: "400",
					message: "No inventory"
				}

				callback(null, result);
			}

		});


	};

	//defining remote methods

	Product.remoteMethod('findAllProducts',{
		accepts: {arg: 'req', type:'string', required: false},
		http: {verb:'get'}, 
		returns: {arg: 'callback', type: 'object', root: true},
		description: 'Finds all products depedent on the inventory filter'
	});

	Product.remoteMethod('findProduct', { 
		accepts: {arg:'req', type: "string", required: true},
		returns: {arg:'callback', type:'object', root: true},
		http: {verb:'get'}, 
		description: 'Find and return requested product by title'

	});

	Product.remoteMethod('purchaseProduct',{
		accepts: {arg:'req', type: "string", required: true},
		http: {verb:'put'}, 
		returns: {arg:'callback', type:'object', root: true},
		description: 'Purchase product'

	});

};
