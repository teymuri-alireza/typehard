export async function initView(container: HTMLElement): Promise<void> {
	try {
		const res = await fetch('/src/ui/lessons.html');
		if (!res.ok) throw new Error('Failed to load lessons view');
		const html = await res.text();
		container.innerHTML = html;
	} catch (err) {
		container.innerHTML = `<div class="placeholder"><h2>Lessons</h2><p>Could not load view.</p></div>`;
	}
}