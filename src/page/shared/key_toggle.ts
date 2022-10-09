type ObjectMap = Dict<string, boolean>;

export default function(object: ObjectMap, key: keyof ObjectMap, enable?: boolean) {
	
	if (typeof enable === "undefined") {
		enable = !object[key];
	}

	if (enable) {
		object[key] = true;
	} else {
		delete object[key];
	}
}