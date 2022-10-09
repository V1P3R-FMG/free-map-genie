export default function(style: string) {
	const element = document.createElement("style");
	element.innerHTML = style;
	document.head.appendChild(element);
}