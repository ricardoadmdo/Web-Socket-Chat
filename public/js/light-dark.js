const modoBtn = document.getElementById('modoBtn');
const iconoModo = document.getElementById('iconoModo');

modoBtn.addEventListener('click', () => {
	document.body.classList.toggle('dark-mode');
	if (document.body.classList.contains('dark-mode')) {
		iconoModo.classList.remove('bi-moon');
		iconoModo.classList.add('bi-sun');
	} else {
		iconoModo.classList.remove('bi-sun');
		iconoModo.classList.add('bi-moon');
	}
});
