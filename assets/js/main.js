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

	var activeIndex = -1;

	var S = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
	var ICONS = {
		page:
			"<svg " +
			S +
			'><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
		component:
			"<svg " +
			S +
			'><path d="M15.536 11.293a1 1 0 0 0 0 1.414l2.376 2.377a1 1 0 0 0 1.414 0l2.377-2.377a1 1 0 0 0 0-1.414l-2.377-2.377a1 1 0 0 0-1.414 0z"/><path d="M2.297 11.293a1 1 0 0 0 0 1.414l2.377 2.377a1 1 0 0 0 1.414 0l2.377-2.377a1 1 0 0 0 0-1.414L6.088 8.916a1 1 0 0 0-1.414 0z"/><path d="M8.916 17.912a1 1 0 0 0 0 1.415l2.377 2.376a1 1 0 0 0 1.414 0l2.377-2.376a1 1 0 0 0 0-1.415l-2.377-2.376a1 1 0 0 0-1.414 0z"/><path d="M8.916 4.674a1 1 0 0 0 0 1.414l2.377 2.376a1 1 0 0 0 1.414 0l2.377-2.376a1 1 0 0 0 0-1.414l-2.377-2.377a1 1 0 0 0-1.414 0z"/></svg>',
		element:
			"<svg " +
			S +
			'><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/></svg>',
	};
	var ENTER_SVG = "<svg " + S + '><polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/></svg>';

	function getIcon(section) {
		var s = section.toLowerCase();
		if (s.indexOf("component") !== -1) return ICONS.component;
		if (s.indexOf("element") !== -1) return ICONS.element;
		return ICONS.page;
	}

	function getItems() {
		return results.querySelectorAll(".doc-search-result");
	}

	function setActive(index) {
		var items = getItems();
		if (!items.length) return;
		if (index < 0) {
			activeIndex = -1;
			items.forEach(function (a) {
				a.setAttribute("aria-selected", "false");
			});
			input.focus();
			return;
		}
		if (index >= items.length) index = 0;
		activeIndex = index;
		items.forEach(function (a, i) {
			a.setAttribute("aria-selected", i === activeIndex ? "true" : "false");
		});
		items[activeIndex].scrollIntoView({ block: "nearest" });
	}

	function openModal() {
		overlay.hidden = false;
		input.value = "";
		activeIndex = -1;
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
		activeIndex = -1;
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

		// Group by section, preserving encounter order
		var groups = Object.create(null);
		var groupOrder = [];
		hits.forEach(function (p) {
			if (!groups[p.section]) {
				groups[p.section] = [];
				groupOrder.push(p.section);
			}
			groups[p.section].push(p);
		});

		groupOrder.forEach(function (section) {
			var icon = getIcon(section);
			var group = document.createElement("div");
			group.className = "doc-search-group";

			var header = document.createElement("div");
			header.className = "doc-search-group-header";
			header.textContent = section;
			group.appendChild(header);

			groups[section].forEach(function (p) {
				var a = document.createElement("a");
				a.href = p.url;
				a.className = "doc-search-result";
				a.setAttribute("aria-selected", "false");
				a.innerHTML =
					'<span class="doc-search-result-icon" aria-hidden="true">' +
					icon +
					"</span>" +
					'<span class="doc-search-result-title">' +
					escHtml(p.title) +
					"</span>" +
					'<span class="doc-search-result-enter" aria-hidden="true">' +
					ENTER_SVG +
					"</span>";
				a.addEventListener("click", closeModal);
				group.appendChild(a);
			});

			results.appendChild(group);
		});

		setActive(0);
	}

	function escHtml(s) {
		return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	}

	openers.forEach(function (btn) {
		btn.addEventListener("click", openModal);
	});

	document.addEventListener("keydown", function (e) {
		if ((e.metaKey || e.ctrlKey) && e.key === "k") {
			e.preventDefault();
			overlay.hidden ? openModal() : closeModal();
			return;
		}
		if (overlay.hidden) return;
		if (e.key === "Escape") {
			closeModal();
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			setActive(activeIndex + 1);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActive(activeIndex - 1);
		} else if (e.key === "Enter") {
			var items = getItems();
			if (activeIndex >= 0 && items[activeIndex]) {
				e.preventDefault();
				closeModal();
				window.location.href = items[activeIndex].href;
			}
		}
	});

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
	// Exclude headings inside dialog/drawer panels — they are not page sections.
	var allHeadings = Array.from(content.querySelectorAll("h2, h3"))
		.filter(function (h) {
			return !h.closest("[data-kui-dialog-panel], [data-kui-drawer-panel]");
		})
		.map(function (h) {
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

// ── Example blocks: wrap component(s) + .doc-code pairs into cards ───────
// Button and badge blocks render bare elements with no container.
// This post-processes the body: scanning backwards from each .doc-code to
// collect all consecutive component siblings immediately before it, then wraps
// them together in a .doc-example card (preview zone + code zone).
// Add new component root classes to PREVIEW_CLASSES when a new block is created.
(function initExampleWrappers() {
	var PREVIEW_CLASSES = ["kui-button", "kui-badge"];

	var content = document.getElementById("doc-content");
	if (!content) return;

	// Iterate over all code blocks in the content area
	content.querySelectorAll(".doc-code").forEach(function (codeBlock) {
		// Skip code blocks inside the hero demo
		if (codeBlock.closest(".doc-demo")) return;

		// Walk backwards from the code block collecting consecutive component siblings
		var buttons = [];
		var el = codeBlock.previousElementSibling;
		while (
			el &&
			PREVIEW_CLASSES.some(function (cls) {
				return el.classList.contains(cls);
			})
		) {
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
