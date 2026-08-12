(() => {
  const apiUrl = "https://rabbitfriendly-day-2026.scsalex.chatgpt.site/api/registrations";
  const form = document.querySelector("#registration-form");
  if (!(form instanceof HTMLFormElement)) return;

  const tickets = [
    { audience: "Mitglieder", mode: "Präsenz", early: 299, late: 399 },
    { audience: "Mitglieder", mode: "Live-Online", early: 199, late: 299 },
    { audience: "Nichtmitglieder", mode: "Präsenz", early: 399, late: 499 },
    { audience: "Nichtmitglieder", mode: "Live-Online", early: 299, late: 399 },
  ];
  const earlyBird = Date.now() <= new Date("2026-09-09T23:59:59+02:00").getTime();
  let audience = "Mitglieder";
  let mode = "Präsenz";
  let startedAt = Date.now();

  const pillGroups = [...form.querySelectorAll(".form-pills")];
  const audienceButtons = pillGroups[0] ? [...pillGroups[0].querySelectorAll("button")] : [];
  const modeButtons = pillGroups[1] ? [...pillGroups[1].querySelectorAll("button")] : [];
  const priceRows = [...document.querySelectorAll(".price-table > button")];
  const foodLabel = form.querySelector('select[name="food"]')?.closest("label");
  const submitLabel = form.querySelector(".submit-button span");
  const selectedTicket = document.querySelector(".selected-ticket");

  function selectedPrice() {
    const ticket = tickets.find((item) => item.audience === audience && item.mode === mode);
    return ticket ? (earlyBird ? ticket.early : ticket.late) : 0;
  }

  function render() {
    audienceButtons.forEach((button) => button.classList.toggle("active", button.textContent?.trim() === audience));
    modeButtons.forEach((button) => button.classList.toggle("active", button.textContent?.trim() === mode));
    priceRows.forEach((row, index) => {
      const selected = tickets[index]?.audience === audience && tickets[index]?.mode === mode;
      row.classList.toggle("selected", selected);
      const label = row.querySelector(".price-select");
      if (label) label.textContent = selected ? "✓ Ausgewählt" : "Auswählen →";
    });
    if (foodLabel instanceof HTMLElement) foodLabel.hidden = mode !== "Präsenz";
    if (submitLabel) submitLabel.textContent = `Verbindlich für ${selectedPrice()} € anmelden`;
    if (selectedTicket) selectedTicket.innerHTML = `<small>Ihre Auswahl</small><strong>${audience}<br>${mode}</strong><span>${selectedPrice()} € <small>${earlyBird ? "Frühbucher" : "regulär"}</small></span>`;
  }

  audienceButtons.forEach((button) => button.addEventListener("click", () => { audience = button.textContent?.trim() || audience; render(); }));
  modeButtons.forEach((button) => button.addEventListener("click", () => { mode = button.textContent?.trim() || mode; render(); }));
  priceRows.forEach((row, index) => row.addEventListener("click", () => { audience = tickets[index].audience; mode = tickets[index].mode; render(); document.querySelector("#anmeldung")?.scrollIntoView({ behavior: "smooth" }); }));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector(".submit-button");
    const error = form.querySelector("#registration-status");
    if (button instanceof HTMLButtonElement) button.disabled = true;
    if (submitLabel) submitLabel.textContent = "Anmeldung wird gespeichert …";
    if (error instanceof HTMLElement) { error.hidden = true; error.textContent = ""; }
    const values = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, audience, mode, startedAt, food: mode === "Präsenz" ? values.food : "Nicht erforderlich" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Die Anmeldung konnte nicht gespeichert werden.");
      form.innerHTML = `<div class="success-card" role="status"><span>✓</span><h3>Vielen Dank!</h3><p>${result.confirmationEmailSent ? "Ihre Anmeldung wurde gespeichert. Eine Bestätigung wurde an Ihre E-Mail-Adresse versendet." : "Ihre Anmeldung wurde gespeichert. Das Rabbitfriendly-Team meldet sich mit den weiteren Informationen per E-Mail."}</p><button type="button" class="secondary-button" id="new-registration">Weitere Anmeldung</button></div>`;
      form.querySelector("#new-registration")?.addEventListener("click", () => window.location.reload());
    } catch (errorValue) {
      if (error instanceof HTMLElement) { error.hidden = false; error.textContent = errorValue instanceof Error ? errorValue.message : "Die Anmeldung konnte nicht gespeichert werden."; }
      startedAt = Date.now();
      if (button instanceof HTMLButtonElement) button.disabled = false;
      render();
    }
  });

  render();
})();
