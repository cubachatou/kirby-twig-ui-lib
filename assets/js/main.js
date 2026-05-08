import "../css/tailwind.css";
import "../scss/main.scss";

// ── Dark / light mode ──────────────────────────────────────────────────────
(function initTheme() {
	var toggle = document.querySelector("[data-theme-toggle]");
	if (!toggle) return;

	function applyTheme(theme) {
		document.documentElement.setAttribute("data-theme", theme);
		try {
			localStorage.setItem("ui-lib-theme", theme);
		} catch (_) {}
	}

	toggle.addEventListener("click", function () {
		var current = document.documentElement.getAttribute("data-theme");
		applyTheme(current === "dark" ? "light" : "dark");
	});
})();

// ── Search modal ───────────────────────────────────────────────────────────
(function initSearch() {
	var overlay = document.getElementById("doc-search-overlay");
	var input = document.getElementById("doc-search-input");
	var results = document.getElementById("doc-search-results");
	var empty = document.getElementById("doc-search-empty");
	var openers = document.querySelectorAll("[data-search-open]");
	if (!overlay || !input || !results) return;

	var pages = [];
	try {
		var blob = document.getElementById("doc-search-index");
		if (blob) pages = JSON.parse(blob.textContent || "[]");
	} catch (_) {}

	function openModal() {
		overlay.hidden = false;
		input.value = "";
		renderResults("");
		requestAnimationFrame(function () {
			input.focus();
		});
		document.body.style.overflow = "hidden";
	}

	function closeModal() {
		overlay.hidden = true;
		document.body.style.overflow = "";
	}

	function renderResults(query) {
		var q = query.trim().toLowerCase();
		results.innerHTML = "";
		if (empty) empty.hidden = true;

		var hits =
			q.length < 1
				? pages
				: pages.filter(function (p) {
						return (p.title + " " + p.excerpt + " " + p.section).toLowerCase().includes(q);
					});

		if (!hits.length) {
			if (empty) empty.hidden = false;
			return;
		}

		hits.forEach(function (p, i) {
			var li = document.createElement("li");
			var a = document.createElement("a");
			a.href = p.url;
			a.className = "doc-search-result";
			a.setAttribute("role", "option");
			a.setAttribute("aria-selected", i === 0 ? "true" : "false");
			a.innerHTML =
				'<span class="doc-search-result-section">' +
				escHtml(p.section) +
				"</span>" +
				'<span class="doc-search-result-title">' +
				escHtml(p.title) +
				"</span>" +
				(p.excerpt ? '<span class="doc-search-result-excerpt">' + escHtml(p.excerpt) + "</span>" : "");
			a.addEventListener("click", closeModal);
			li.appendChild(a);
			results.appendChild(li);
		});
	}

	function escHtml(s) {
		return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	}

	openers.forEach(function (btn) {
		btn.addEventListener("click", openModal);
	});

	// Cmd/Ctrl + K
	document.addEventListener("keydown", function (e) {
		if ((e.metaKey || e.ctrlKey) && e.key === "k") {
			e.preventDefault();
			overlay.hidden ? openModal() : closeModal();
		}
		if (e.key === "Escape" && !overlay.hidden) {
			closeModal();
		}
	});

	// Click outside panel to close
	overlay.addEventListener("click", function (e) {
		if (e.target === overlay) closeModal();
	});

	input.addEventListener("input", function () {
		renderResults(input.value);
	});
})();

// ── TOC: auto-generate from h2/h3 elements + scroll-spy ─────────────────
(function initToc() {
	var tocList = document.getElementById("toc-list");
	var content = document.getElementById("doc-content");
	if (!tocList || !content) return;

	// Collect h2 and h3 elements in DOM order.
	// Heading blocks set id via PHP Str::slug(); assign one for any
	// hard-coded headings (e.g. the live demo) that are missing an id.
	var allHeadings = Array.from(content.querySelectorAll("h2, h3")).map(function (h) {
		if (!h.id) {
			h.id = h.textContent
				.trim()
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, "")
				.trim()
				.replace(/\s+/g, "-");
		}
		return h;
	});

	if (!allHeadings.length) return;

	// Build nested TOC: h3s nest as <ul> children of the preceding h2 <li>.
	var links = [];
	var currentH2Li = null;
	var currentSubList = null;

	allHeadings.forEach(function (h) {
		var a = document.createElement("a");
		a.href = "#" + h.id;
		a.textContent = h.textContent;

		if (h.tagName === "H2") {
			var li = document.createElement("li");
			li.appendChild(a);
			tocList.appendChild(li);
			currentH2Li = li;
			currentSubList = null; // each h2 gets its own fresh sublist
		} else {
			// H3 — nest under the preceding h2
			if (!currentSubList) {
				currentSubList = document.createElement("ul");
				currentSubList.className = "doc-toc-sublist";
				if (currentH2Li) {
					currentH2Li.appendChild(currentSubList);
				} else {
					// orphan h3 with no preceding h2 — add directly
					var orphanLi = document.createElement("li");
					orphanLi.appendChild(currentSubList);
					tocList.appendChild(orphanLi);
				}
			}
			var subLi = document.createElement("li");
			subLi.appendChild(a);
			currentSubList.appendChild(subLi);
		}

		links.push(a);
	});

	// IntersectionObserver scroll-spy
	if (!("IntersectionObserver" in window)) return;

	var active = null;

	var observer = new IntersectionObserver(
		function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					var idx = allHeadings.indexOf(entry.target);
					if (idx >= 0) {
						if (active) active.removeAttribute("data-toc-active");
						active = links[idx];
						active.setAttribute("data-toc-active", "");
					}
				}
			});
		},
		{
			rootMargin: "0px 0px -70% 0px",
			threshold: 0,
		},
	);

	allHeadings.forEach(function (h) {
		observer.observe(h);
	});
})();

// ── Example blocks: wrap button(s) + .doc-code pairs into cards ──────────
// The Kirby button block renders a bare <button> element with no container.
// This post-processes the body: scanning backwards from each .doc-code to
// collect all consecutive .button siblings immediately before it, then wraps
// them together in a .doc-example card (preview zone + code zone).
(function initExampleWrappers() {
	var content = document.getElementById("doc-content");
	if (!content) return;

	// Iterate over all code blocks in the content area
	content.querySelectorAll(".doc-code").forEach(function (codeBlock) {
		// Skip code blocks inside the hero demo
		if (codeBlock.closest(".doc-demo")) return;

		// Walk backwards from the code block collecting consecutive .kui-button siblings
		var buttons = [];
		var el = codeBlock.previousElementSibling;
		while (el && el.classList.contains("kui-button")) {
			buttons.unshift(el); // prepend to preserve DOM order
			el = el.previousElementSibling;
		}

		if (!buttons.length) return;

		// Wrap all collected buttons in a preview zone div
		var preview = document.createElement("div");
		preview.className = "doc-example-preview";
		buttons[0].parentNode.insertBefore(preview, buttons[0]);
		buttons.forEach(function (btn) {
			preview.appendChild(btn);
		});

		// Wrap the preview zone + code block in the outer example card
		var wrapper = document.createElement("div");
		wrapper.className = "doc-example";
		preview.parentNode.insertBefore(wrapper, preview);
		wrapper.appendChild(preview);
		wrapper.appendChild(codeBlock); // moves .doc-code into the card
	});
})();

// ── Mobile sidebar toggle ──────────────────────────────────────────────────
(function initMobileSidebar() {
	var toggle = document.querySelector("[data-sidebar-toggle]");
	var backdrop = document.querySelector("[data-sidebar-backdrop]");
	var outer = document.querySelector(".doc-outer");
	if (!toggle || !outer) return;

	function open() {
		outer.setAttribute("data-sidebar-open", "");
		toggle.setAttribute("aria-expanded", "true");
		document.body.style.overflow = "hidden";
	}

	function close() {
		outer.removeAttribute("data-sidebar-open");
		toggle.setAttribute("aria-expanded", "false");
		document.body.style.overflow = "";
	}

	toggle.addEventListener("click", function () {
		outer.hasAttribute("data-sidebar-open") ? close() : open();
	});

	if (backdrop) backdrop.addEventListener("click", close);

	document.addEventListener("keydown", function (e) {
		if (e.key === "Escape" && outer.hasAttribute("data-sidebar-open")) close();
	});

	// Close on nav link click (mobile)
	document.querySelectorAll(".doc-nav-item").forEach(function (link) {
		link.addEventListener("click", close);
	});
})();
