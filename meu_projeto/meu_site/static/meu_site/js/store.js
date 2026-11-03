(() => {
    const quantityForms = document.querySelectorAll(".case-open-form");

    quantityForms.forEach((form) => {
        const quantity = form.querySelector(".case-quantity");
        const button = form.querySelector(".redeem-button");
        const price = Number(form.dataset.price);
        const singleLabel = button.dataset.singleLabel;
        const formatTokens = new Intl.NumberFormat("pt-PT");

        const updatePrice = () => {
            const count = Number(quantity.value);
            const boxLabel = count === 1 ? singleLabel : `${count} caixas`;
            button.textContent = `${boxLabel} · ${formatTokens.format(price * count)} Tokens`;
        };

        quantity.addEventListener("change", updatePrice);
        updatePrice();
    });

    const overlay = document.querySelector("#case-opening");
    if (!overlay) {
        return;
    }

    const stage = overlay.querySelector("#case-opening-stage");
    const rewardGrid = overlay.querySelector("#case-reward-grid");
    const status = overlay.querySelector("#case-opening-status");
    const closeButton = overlay.querySelector(".case-opening-close");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const closeOverlay = () => {
        overlay.hidden = true;
        document.body.classList.remove("loot-reveal-open");
    };

    overlay.hidden = false;
    document.body.classList.add("loot-reveal-open");
    closeButton.addEventListener("click", closeOverlay);
    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            closeOverlay();
        }
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !overlay.hidden) {
            closeOverlay();
        }
    });
    closeButton.focus();

    const revealRewards = () => {
        stage.classList.remove("is-opening");
        stage.classList.add("is-opened");
        status.textContent = "Caixa aberta! Estas são as tuas recompensas.";
        window.setTimeout(() => {
            stage.hidden = true;
            rewardGrid.hidden = false;
            rewardGrid.classList.add("is-visible");
        }, prefersReducedMotion ? 0 : 450);
    };

    if (prefersReducedMotion) {
        revealRewards();
    } else {
        stage.classList.add("is-opening");
        window.setTimeout(revealRewards, 1750);
    }
})();
