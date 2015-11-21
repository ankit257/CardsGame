export function saveItemInLocalStorage(key, data) {
	localStorage.setItem(key, JSON.stringify(data));
}
export function getItemFromLocalStorage(key){
	var dataString = localStorage.getItem(key);
	return JSON.parse(dataString);
}
