
const API_URL = 'https://api-token-keur.onrender.com/'; 
const AUTO_REFRESH_INTERVAL_MS = 10_000; 
const FETCH_TIMEOUT_MS = 30_000; 


function padCode(code) {
	const s = String(code ?? '');
	return s.padStart(4, '0').slice(-4);
}

function timeout(ms) {
	return new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));
}

async function fetchWithTimeout(resource, options = {}) {
	return Promise.race([fetch(resource, options), timeout(FETCH_TIMEOUT_MS)]);
}


async function fetchCode() {
	const statusEl = document.getElementById('status');
	const codeEl = document.getElementById('code');

	if (!API_URL) {
		if (codeEl) codeEl.textContent = '----';
		if (statusEl) statusEl.textContent = 'API_URL não configurada — configure a URL em script.js';
		return;
	}

	if (statusEl) statusEl.textContent = 'Solicitando código...';

	try {
		const res = await fetchWithTimeout(API_URL, { method: 'GET' });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const json = await res.json();

		const code = json.code ?? json.codigo ?? json.token ?? json.otp;
		if (code === undefined || code === null) throw new Error('Resposta sem código');

		if (codeEl) codeEl.textContent = padCode(code);
		if (statusEl) statusEl.textContent = 'Código obtido com sucesso';
	} catch (err) {
		console.error(err);
		if (codeEl) codeEl.textContent = '----';
		if (statusEl) statusEl.textContent = `Erro: ${err.message}`;
	}
}


document.addEventListener('DOMContentLoaded', () => {
	// Não há checkbox nem botão: somente tentamos buscar automaticamente se API_URL estiver configurada.
	if (API_URL) {
		fetchCode();
	} else {
		const statusEl = document.getElementById('status');
		const codeEl = document.getElementById('code');
		if (statusEl) statusEl.textContent = 'API_URL não configurada — configure a URL em script.js';
		if (codeEl) codeEl.textContent = '----';
	}
});

