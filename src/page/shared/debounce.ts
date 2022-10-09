export default function(func: (...args: any[]) => any, delay=1000) {
	var handle: NodeJS.Timeout;

	return function(...args: any[]) {
		if (handle) clearTimeout(handle);
		handle = setTimeout(() => {
			func.apply(null, args);
		}, delay);
	}
}