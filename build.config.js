module.exports = function(options){

	return {
		src: options.src,
		dist: options.dist,

		entry: {
			"popup/index"	: "popup/index.ts",
			"page"			: "page/index.ts",
			"main"			: "main/index.ts",
			"background"	: "background.ts"
		},
	
		static: {
			"images"	: "images",
			"popup" 	: "popup",
			"lib" 		: "lib"
		},

		create: {
			"settings.json": JSON.stringify({
				debug: options.debug,
				watch: options.watch,
				wss: {
					hostname: "localhost",
					port: options.port
				}
			}, null, 4) 
		}
	}
}