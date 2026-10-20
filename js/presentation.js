(() => {
  const deck = document.getElementById("deck");
  const slides = [...document.querySelectorAll(".slide")];
  const total = slides.length;
  let current = 0;
  const speaker = document.getElementById("speaker");
  const overview = document.getElementById("overview");
  const noteText = document.getElementById("noteText");
  const progress = document.getElementById("progress");
  const tiles = document.getElementById("tiles");
  const edgePrev = document.getElementById("edgePrev");
  const edgeNext = document.getElementById("edgeNext");
  function updateEdgeNavigation() {
    const overviewOpen = overview.classList.contains("visible");
    edgePrev.hidden = overviewOpen || current === 0;
    edgeNext.hidden = overviewOpen || current === total - 1;
  }
  function createAccountingDemo() {
    const slide = document.querySelector(".accounting-project");
    if (!slide) return { setVisible() {} };
    const steps = [...slide.querySelectorAll(".accounting-approval-step")];
    const status = document.getElementById("accountingDemoStatus");
    const evidence = document.getElementById("accountingDemoEvidence");
    const proof = document.getElementById("accountingDemoProof");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stages = [
      { text: "Người tạo lập phiếu", role: 0, files: 0, duration: 1600 },
      { text: "Bổ sung chứng từ vào phiếu", role: 0, files: 1, duration: 1800 },
      { text: "Đính kèm minh chứng bổ sung", role: 0, files: 2, duration: 1800 },
      { text: "Đủ hồ sơ · gửi phiếu đi duyệt", role: 0, files: 2, duration: 1400 },
      { text: "TBP tiếp nhận và xét duyệt", role: 1, files: 2, duration: 2400 },
      { text: "TBP đã duyệt · chuyển TP/QL", role: 2, files: 2, duration: 2400 },
      { text: "TP/QL đã duyệt · chuyển Kế toán", role: 3, files: 2, duration: 2400 },
      { text: "Kế toán đã duyệt · trình Giám đốc", role: 4, files: 2, duration: 2600 },
      { text: "✓ Giám đốc đã duyệt · Hoàn thành", role: 5, files: 2, duration: 0 },
    ];
    let stage = 0;
    let timer = null;
    let visible = false;
    function clearTimer() {
      window.clearTimeout(timer);
      timer = null;
    }
    function render() {
      const state = stages[stage];
      const complete = stage === stages.length - 1;
      slide.dataset.demoStage = String(stage);
      slide.classList.toggle("is-demo-running", !complete);
      slide.classList.toggle("is-demo-submitted", stage >= 3);
      slide.classList.toggle("is-demo-complete", complete);
      status.textContent = state.text;
      evidence.classList.toggle("is-added", state.files >= 1);
      evidence.textContent = state.files >= 1 ? "✓ Chứng từ" : "+ Chứng từ";
      proof.classList.toggle("is-added", state.files >= 2);
      proof.textContent = state.files >= 2 ? "✓ Minh chứng" : "+ Minh chứng";
      steps.forEach((step, index) => {
        step.classList.toggle("is-current", index === state.role);
        step.classList.toggle("is-complete", index < state.role);
        step.querySelector(".accounting-step-number").textContent = index < state.role ? "✓" : String(index + 1).padStart(2, "0");
      });
    }
    function schedule() {
      clearTimer();
      if (!visible || document.hidden || !stages[stage].duration) return;
      timer = window.setTimeout(() => {
        stage += 1;
        render();
        schedule();
      }, stages[stage].duration);
    }
    function restart() {
      clearTimer();
      stage = 0;
      render();
      schedule();
    }
    document.addEventListener("visibilitychange", schedule);
    render();
    return {
      setVisible(next) {
        if (visible === next) return;
        visible = next;
        clearTimer();
        if (visible) {
          if (reducedMotion.matches) {
            stage = stages.length - 1;
                  render();
          } else restart();
        }
      },
    };
  }
  const accountingDemo = createAccountingDemo();
  function fit() {
    const s = Math.min(innerWidth / 1440, innerHeight / 810);
    deck.style.transform = `scale(${s})`;
  }
  function go(n, updateHash = true) {
    current = Math.max(0, Math.min(total - 1, n));
    slides.forEach((sl, i) => sl.classList.toggle("active", i === current));
    const sl = slides[current];
    accountingDemo.setVisible(sl.matches(".accounting-project") && !overview.classList.contains("visible"));
    deck.classList.add("is-dark");
    deck.dataset.motif = String((current % 3) + 1);
    document.getElementById("counter").textContent =
      `${String(current + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
    document.getElementById("footTitle").textContent =
      sl.dataset.section || "CONTRACTOPS";
    progress.style.width = `${(100 * (current + 1)) / total}%`;
    document.getElementById("prev").disabled = current === 0;
    document.getElementById("next").disabled = current === total - 1;
    updateEdgeNavigation();
    noteText.textContent = (
      sl.querySelector(".speaker-notes")?.textContent || ""
    ).trim();
    if (updateHash) history.replaceState(null, "", `#slide-${current + 1}`);
  }
  function toggleSpeaker() {
    speaker.classList.toggle("visible");
  }
  function toggleOverview(on) {
    overview.classList.toggle(
      "visible",
      on === undefined ? !overview.classList.contains("visible") : on,
    );
    updateEdgeNavigation();
    accountingDemo.setVisible(slides[current].matches(".accounting-project") && !overview.classList.contains("visible"));
  }
  function fullscreen() {
    if (!document.fullscreenElement)
      document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }
  slides.forEach((sl, i) => {
    let t = document.createElement("button");
    t.className = "tile";
    t.innerHTML = `<em>${String(i + 1).padStart(2, "0")} · ${sl.dataset.section || ""}</em>${sl.dataset.title || ""}`;
    t.addEventListener("click", () => {
      go(i);
      toggleOverview(false);
    });
    tiles.appendChild(t);
  });
  document.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    const edgeWidth = Math.min(180, Math.max(100, innerWidth * .12));
    edgePrev.classList.toggle("is-near-edge", event.clientX <= edgeWidth);
    edgeNext.classList.toggle("is-near-edge", event.clientX >= innerWidth - edgeWidth);
  }, { passive: true });
  document.documentElement.addEventListener("pointerleave", () => {
    edgePrev.classList.remove("is-near-edge");
    edgeNext.classList.remove("is-near-edge");
  });
  edgePrev.onclick = () => go(current - 1);
  edgeNext.onclick = () => go(current + 1);
  document.getElementById("prev").onclick = () => go(current - 1);
  document.getElementById("next").onclick = () => go(current + 1);
  document.getElementById("overviewButton").onclick = () => toggleOverview();
  document.getElementById("closeOverview").onclick = () =>
    toggleOverview(false);
  document.getElementById("noteButton").onclick = toggleSpeaker;
  document.getElementById("fullButton").onclick = fullscreen;
  document.addEventListener("keydown", (e) => {
    if (
      e.target instanceof HTMLElement &&
      ["INPUT", "TEXTAREA"].includes(e.target.tagName)
    )
      return;
    if (overview.classList.contains("visible")) {
      if (e.key === "Escape" || e.key.toLowerCase() === "g") {
        toggleOverview(false);
        e.preventDefault();
      }
      return;
    }
    if (["ArrowRight", "PageDown", " "].includes(e.key)) {
      go(current + 1);
      e.preventDefault();
    } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
      go(current - 1);
      e.preventDefault();
    } else if (e.key === "Home") {
      go(0);
      e.preventDefault();
    } else if (e.key === "End") {
      go(total - 1);
      e.preventDefault();
    } else if (e.key.toLowerCase() === "f") {
      fullscreen();
      e.preventDefault();
    } else if (e.key.toLowerCase() === "n") {
      toggleSpeaker();
      e.preventDefault();
    } else if (e.key.toLowerCase() === "g") {
      toggleOverview();
      e.preventDefault();
    } else if (e.key === "Escape") {
      speaker.classList.remove("visible");
    }
  });
  window.addEventListener("resize", fit);
  window.addEventListener("hashchange", () => {
    let m = location.hash.match(/^#slide-(\d+)$/);
    if (m) go(Number(m[1]) - 1, false);
  });
  let init = (location.hash.match(/^#slide-(\d+)$/) || [])[1];
  go(init ? Number(init) - 1 : 0, false);
  fit();
})();
