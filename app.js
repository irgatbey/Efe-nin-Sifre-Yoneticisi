/* --- AÇILIŞ EKRANI MANTIĞI --- */
window.addEventListener("load", () => {
  const splashScreen = document.getElementById("splash-screen");
  if (splashScreen) {
    setTimeout(() => {
      splashScreen.classList.add("hidden");
    }, 1500);
  }
});

/* --- ANA UYGULAMA MANTIĞI --- */
document.addEventListener("DOMContentLoaded", () => {
  /* --- HTML ELEMANLARI --- */
  const fabAddBtn = document.getElementById("fab-add-btn");
  const passwordsList = document.getElementById("passwords-list");
  const exportButton = document.getElementById("export-button");
  const importFile = document.getElementById("import-file");
  const allModals = document.querySelectorAll(".modal-overlay");
  const addModal = document.getElementById("add-modal");
  const editModal = document.getElementById("edit-modal");
  const confirmModal = document.getElementById("confirm-modal");
  const passwordForm = document.getElementById("password-form");
  const siteNameInput = document.getElementById("site-name");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const editForm = document.getElementById("edit-form");
  const editSiteNameInput = document.getElementById("edit-site-name");
  const editUsernameInput = document.getElementById("edit-username");
  const editPasswordInput = document.getElementById("edit-password");
  const confirmTitle = document.getElementById("confirm-title");
  const confirmText = document.getElementById("confirm-text");
  const successOverlay = document.getElementById("success-overlay");
  const successMessage = document.getElementById("success-message");
  const toastNotification = document.getElementById("toast-notification");
  const toastMessage = document.getElementById("toast-message");

  /* --- VERİ YÖNETİMİ --- */
  let passwords = JSON.parse(localStorage.getItem("passwords")) || [];
  let currentlyEditingIndex = null;
  let confirmAction = () => {};

  const savePasswords = () => {
    localStorage.setItem("passwords", JSON.stringify(passwords));
    updateUI();
  };

  /* --- YARDIMCI FONKSİYONLAR --- */
  const showSuccessAnimation = (message) => {
    successMessage.textContent = message;
    successOverlay.classList.add("visible");
    setTimeout(() => successOverlay.classList.remove("visible"), 2500);
  };
  let toastTimeout;
  const showToast = (message) => {
    clearTimeout(toastTimeout);
    toastMessage.textContent = message;
    toastNotification.classList.add("show");
    toastTimeout = setTimeout(
      () => toastNotification.classList.remove("show"),
      2000
    );
  };
  const escapeHTML = (str) => {
    const p = document.createElement("p");
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
  };
  const openModal = (modal) => modal.classList.add("visible");
  const closeModal = (modal) => modal.classList.remove("visible");

  const showConfirmation = (title, text, onConfirmCallback) => {
    confirmTitle.textContent = title;
    confirmText.textContent = text;
    confirmAction = onConfirmCallback;
    openModal(confirmModal);
  };

  /* --- YENİLENMİŞ ARAYÜZ OLUŞTURMA --- */
  const renderPasswords = () => {
    passwordsList.innerHTML = "";
    passwords.forEach((p, index) => {
      // Swipe yapısı yerine doğrudan yeni kart yapısını oluşturuyoruz
      const card = document.createElement("div");
      card.className = "password-item-wrapper";
      card.innerHTML = `
        <div class="info">
          <h3>${escapeHTML(p.site)}</h3>
          <p>
            <span class="username-text">${escapeHTML(p.username)}</span>
          </p>
          <p>
            <span class="password-text" style="display: none;">${escapeHTML(
              p.password
            )}</span>
            <span class="password-dots">${"*".repeat(p.password.length)}</span>
          </p>
        </div>
        <div class="password-item-actions">
          <button class="icon-btn copy-btn" data-type="username" data-index="${index}" title="Kullanıcı adını kopyala">
            <i class="far fa-copy"></i>
          </button>
          <button class="icon-btn view-btn" data-index="${index}" title="Şifreyi göster/gizle">
            <i class="fas fa-eye"></i>
          </button>
          <button class="icon-btn edit-btn" data-index="${index}" title="Düzenle">
            <i class="fas fa-pen-to-square"></i>
          </button>
          <button class="icon-btn delete-btn" data-index="${index}" title="Sil">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      passwordsList.appendChild(card);
    });
  };

  const updateUI = () => {
    renderPasswords();
    if (passwords.length === 0) {
      passwordsList.innerHTML = `<p style="text-align: center; padding: 2rem; color: var(--secondary-text-color);">Kasanız boş.<br>Başlamak için sağ alttaki '+' butonuna dokunun.</p>`;
    }
  };

  /* --- KAYDIRMA MANTIĞI (TAMAMEN KALDIRILDI) --- */

  /* --- OLAY DİNLEYİCİLER --- */
  fabAddBtn.addEventListener("click", () => {
    openModal(addModal);
  });

  allModals.forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (
        e.target.matches(
          ".modal-overlay, .modal-close-btn, .modal-close-btn i, #confirm-cancel-btn"
        )
      ) {
        closeModal(modal);
      }
    });
  });

  document
    .getElementById("confirm-delete-btn")
    .addEventListener("click", () => {
      if (typeof confirmAction === "function") {
        confirmAction();
      }
      closeModal(confirmModal);
    });

  passwordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    passwords.push({
      site: siteNameInput.value,
      username: usernameInput.value,
      password: passwordInput.value,
    });
    savePasswords();
    passwordForm.reset();
    closeModal(addModal);
  });
  editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (currentlyEditingIndex !== null) {
      passwords[currentlyEditingIndex] = {
        site: editSiteNameInput.value,
        username: editUsernameInput.value,
        password: editPasswordInput.value,
      };
      savePasswords();
      closeModal(editModal);
      currentlyEditingIndex = null;
    }
  });

  /* --- YENİ LİSTE OLAY DİNLEYİCİSİ (SWIPE YERİNE) --- */
  passwordsList.addEventListener("click", (e) => {
    const button = e.target.closest(".icon-btn");
    if (!button) return;

    const index = parseInt(button.dataset.index);

    if (button.classList.contains("copy-btn")) {
      const textToCopy = passwords[index].username;
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast("Kullanıcı adı kopyalandı!");
      });
    } else if (button.classList.contains("view-btn")) {
      const item = button.closest(".password-item-wrapper");
      const passwordText = item.querySelector(".password-text");
      const isHidden = passwordText.style.display === "none";
      passwordText.style.display = isHidden ? "inline" : "none";
      item.querySelector(".password-dots").style.display = isHidden
        ? "none"
        : "inline";
      button.querySelector("i").classList.toggle("fa-eye", !isHidden);
      button.querySelector("i").classList.toggle("fa-eye-slash", isHidden);
    } else if (button.classList.contains("edit-btn")) {
      currentlyEditingIndex = index;
      editSiteNameInput.value = passwords[index].site;
      editUsernameInput.value = passwords[index].username;
      editPasswordInput.value = passwords[index].password;
      openModal(editModal);
    } else if (button.classList.contains("delete-btn")) {
      showConfirmation(
        `'${passwords[index].site}' kaydını sil?`,
        "Bu işlemi geri alamazsınız.",
        () => {
          passwords.splice(index, 1);
          savePasswords();
        }
      );
    }
  });

  /* --- YEDEKLEME FONKSİYONLARI --- */
  exportButton.addEventListener("click", () => {
    if (passwords.length === 0) return;
    const dataStr = JSON.stringify(passwords, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sifre_yedek_${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
    showSuccessAnimation("Yedek başarıyla dışa aktarıldı!");
  });
  importFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (
          Array.isArray(imported) &&
          imported.every((p) => p.site && p.username && p.password)
        ) {
          showConfirmation(
            "Yedekten Geri Yükle?",
            "Mevcut tüm şifreleriniz silinecek ve bu yedekle değiştirilecektir.",
            () => {
              passwords = imported;
              savePasswords();
              showSuccessAnimation("Şifreler başarıyla içe aktarıldı!");
            }
          );
        } else {
          alert("Geçersiz dosya formatı!");
        }
      } catch (error) {
        alert("Dosya okunurken bir hata oluştu: " + error.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  /* --- UYGULAMAYI BAŞLAT --- */
  updateUI();
});
