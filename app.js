// AÇILIŞ EKRANI MANTIĞI
window.addEventListener("load", () => {
  const splashScreen = document.getElementById("splash-screen");
  if (splashScreen) {
    setTimeout(() => {
      splashScreen.classList.add("hidden");
    }, 1500);
  }
});

// ANA UYGULAMA MANTIĞI
document.addEventListener("DOMContentLoaded", () => {
  // --- HTML ELEMANLARI ---
  const appContent = document.querySelector(".app-content");
  const headerTitle = document.querySelector(".app-header h1"); // Yeni eklendi
  const fabAddBtn = document.getElementById("fab-add-btn");
  const passwordsList = document.getElementById("passwords-list");
  const exportButton = document.getElementById("export-button");
  const importFile = document.getElementById("import-file");
  const allModals = document.querySelectorAll(".modal-overlay");
  const addModal = document.getElementById("add-modal");
  const editModal = document.getElementById("edit-modal");
  const confirmModal = document.getElementById("confirm-modal");
  const nameModal = document.getElementById("name-modal"); // Yeni eklendi
  const passwordForm = document.getElementById("password-form");
  const siteNameInput = document.getElementById("site-name");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const editForm = document.getElementById("edit-form");
  const editSiteNameInput = document.getElementById("edit-site-name");
  const editUsernameInput = document.getElementById("edit-username");
  const editPasswordInput = document.getElementById("edit-password");
  const nameForm = document.getElementById("name-form"); // Yeni eklendi
  const userNameInput = document.getElementById("user-name-input"); // Yeni eklendi
  const confirmTitle = document.getElementById("confirm-title");
  const confirmText = document.getElementById("confirm-text");
  const successOverlay = document.getElementById("success-overlay");
  const successMessage = document.getElementById("success-message");
  const toastNotification = document.getElementById("toast-notification");
  const toastMessage = document.getElementById("toast-message");

  // --- VERİ YÖNETİMİ ---
  let passwords = JSON.parse(localStorage.getItem("passwords")) || [];
  let currentlyEditingIndex = null;
  let swipedItem = null;
  let confirmAction = () => {};

  const savePasswords = () => {
    localStorage.setItem("passwords", JSON.stringify(passwords));
    updateUI();
  };

  // --- YARDIMCI FONKSİYONLAR ---
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

  // --- YENİ FONKSİYONLAR ---
  const updateHeaderText = () => {
    const userName = localStorage.getItem("userName");
    if (userName) {
      const escapedUserName = escapeHTML(userName);
      headerTitle.textContent = `${escapedUserName}'nin Şifre Kasası`;
      document.title = `${escapedUserName}'nin Şifre Kasası`;
    } else {
      // Kullanıcı adı yoksa varsayılan başlık
      headerTitle.textContent = `Şifre Kasası`;
      document.title = `Şifre Kasası`;
    }
  };

  const checkUserName = () => {
    const userName = localStorage.getItem("userName");
    if (!userName) {
      // name-modal'ı diğer modalları kapatma mekanizmasından hariç tutmak için
      // click event'ini burada durduruyoruz.
      nameModal.addEventListener("click", (e) => e.stopPropagation());
      openModal(nameModal);
    }
  };

  // --- ARAYÜZ OLUŞTURMA ---
  const renderPasswords = () => {
    passwordsList.innerHTML = "";
    passwords.forEach((p, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "password-item-wrapper";
      wrapper.innerHTML = `
                <div class="swipe-actions">
                    <button class="edit-action" data-index="${index}"><i class="fas fa-pen-to-square"></i><span>Düzenle</span></button>
                    <button class="delete-action" data-index="${index}"><i class="fas fa-trash"></i><span>Sil</span></button>
                </div>
                <div class="swipe-content" data-index="${index}">
                    <div class="info">
                        <h3>${escapeHTML(p.site)}</h3>
                        <p>
                            <span class="username-text">${escapeHTML(
                              p.username
                            )}</span>
                            <button class="copy-btn" data-type="username" data-index="${index}"><i class="far fa-copy"></i></button>
                        </p>
                        <p>
                            <span class="password-text" style="display: none;">${escapeHTML(
                              p.password
                            )}</span>
                            <span class="password-dots">${"*".repeat(
                              p.password.length
                            )}</span>
                        </p>
                    </div>
                    <button class="view-btn" data-index="${index}"><i class="fas fa-eye"></i></button>
                </div>
            `;
      passwordsList.appendChild(wrapper);
    });
  };
  const updateUI = () => {
    renderPasswords();
    if (passwords.length === 0) {
      passwordsList.innerHTML = `<p style="text-align: center; padding: 2rem; color: var(--secondary-text-color);">Kasanız boş.<br>Başlamak için sağ alttaki '+' butonuna dokunun.</p>`;
    }
  };

  // --- KAYDIRMA MANTIĞI ---
  let startX,
    currentX,
    isSwiping = false,
    swipeThreshold = -80,
    swipeActionWidth = 160;
  let lastDiff = 0;

  const closeSwipedItem = (itemToExclude = null) => {
    document.querySelectorAll(".swipe-content.swiped").forEach((item) => {
      if (item !== itemToExclude) {
        item.classList.remove("swiped");
        item.style.transform = "translateX(0)";
      }
    });
    swipedItem = itemToExclude;
  };
  const onSwipeStart = (e) => {
    const item = e.target.closest(".swipe-content");
    if (!item) return;
    if (swipedItem && swipedItem !== item) {
      closeSwipedItem(item);
    } else {
      swipedItem = item;
    }
    lastDiff = 0;
    startX = e.type.includes("mouse") ? e.pageX : e.touches[0].pageX;
    isSwiping = true;
    swipedItem.classList.add("swiping");
  };
  const onSwipeMove = (e) => {
    if (!isSwiping || !swipedItem) return;
    currentX = e.type.includes("mouse") ? e.pageX : e.touches[0].pageX;
    let diff = currentX - startX;
    if (swipedItem.classList.contains("swiped")) {
      diff -= swipeActionWidth;
    }
    if (diff > 0) diff = 0;
    lastDiff = diff;
    swipedItem.style.transform = `translateX(${Math.max(
      diff,
      -swipeActionWidth - 20
    )}px)`;
  };
  const onSwipeEnd = () => {
    if (!isSwiping || !swipedItem) return;
    isSwiping = false;
    swipedItem.classList.remove("swiping");

    if (lastDiff < swipeThreshold) {
      swipedItem.style.transform = `translateX(-${swipeActionWidth}px)`;
      swipedItem.classList.add("swiped");
    } else {
      swipedItem.style.transform = "translateX(0)";
      swipedItem.classList.remove("swiped");
      swipedItem = null;
    }
  };
  passwordsList.addEventListener("mousedown", onSwipeStart);
  passwordsList.addEventListener("touchstart", onSwipeStart, { passive: true });
  document.addEventListener("mousemove", onSwipeMove);
  document.addEventListener("touchmove", onSwipeMove, { passive: true });
  document.addEventListener("mouseup", onSwipeEnd);
  document.addEventListener("touchend", onSwipeEnd);
  appContent.addEventListener("scroll", () => closeSwipedItem());

  // --- OLAY DİNLEYİCİLER ---
  fabAddBtn.addEventListener("click", () => {
    closeSwipedItem();
    openModal(addModal);
  });

  allModals.forEach((modal) => {
    modal.addEventListener("click", (e) => {
      // İsim girme modalı hariç tutuluyor
      if (modal.id === "name-modal") return;
      if (
        e.target.matches(
          ".modal-overlay, .modal-close-btn, .modal-close-btn i, #confirm-cancel-btn"
        )
      ) {
        closeModal(modal);
      }
    });
  });

  nameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const userName = userNameInput.value.trim();
    if (userName) {
      localStorage.setItem("userName", userName);
      updateHeaderText();
      closeModal(nameModal);
    }
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

  passwordsList.addEventListener("click", (e) => {
    const targetElement = e.target.closest(".swipe-content, button");
    if (!targetElement) {
      closeSwipedItem();
      return;
    }
    if (
      targetElement.classList.contains("swipe-content") &&
      targetElement.classList.contains("swiped")
    ) {
      closeSwipedItem();
      return;
    }
    const button = targetElement.closest("button");
    if (!button) return;
    const index = parseInt(button.dataset.index);

    if (button.classList.contains("copy-btn")) {
      const type = button.dataset.type;
      const textToCopy =
        type === "username"
          ? passwords[index].username
          : passwords[index].password;
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(
          type === "username"
            ? "Kullanıcı adı kopyalandı!"
            : "Şifre kopyalandı!"
        );
      });
    } else if (button.classList.contains("view-btn")) {
      const item = button.closest(".swipe-content");
      const passwordText = item.querySelector(".password-text");
      const isHidden = passwordText.style.display === "none";
      passwordText.style.display = isHidden ? "inline" : "none";
      item.querySelector(".password-dots").style.display = isHidden
        ? "none"
        : "inline";
      button.querySelector("i").classList.toggle("fa-eye", !isHidden);
      button.querySelector("i").classList.toggle("fa-eye-slash", isHidden);
    } else if (button.classList.contains("edit-action")) {
      currentlyEditingIndex = index;
      editSiteNameInput.value = passwords[index].site;
      editUsernameInput.value = passwords[index].username;
      editPasswordInput.value = passwords[index].password;
      openModal(editModal);
    } else if (button.classList.contains("delete-action")) {
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

  exportButton.addEventListener("click", () => {
    if (passwords.length === 0) return;
    const dataStr = JSON.stringify(passwords, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const userName = localStorage.getItem("userName") || "kullanici";
    link.href = url;
    link.download = `${userName}_sifre_yedek_${
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

  // --- UYGULAMAYI BAŞLAT ---
  updateHeaderText();
  updateUI();
  checkUserName();
});
