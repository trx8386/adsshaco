document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.container');
  const loginCard = document.getElementById('login-card');
  const dashboardCard = document.getElementById('dashboard-card');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const btnLogout = document.getElementById('btn-logout');
  
  const loginLoader = document.getElementById('login-loader');

  // SVG Icons Constants
  const ICONS = {
    EDIT: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
    DELETE: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`,
    SAVE: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><polyline points="20 6 9 17 4 12"/></svg>`,
    CANCEL: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`
  };

  // Domain DOM Elements
  const domainForm = document.getElementById('domain-form');
  const domainNameInput = document.getElementById('domain-name');
  const domainTargetInput = document.getElementById('domain-target');
  const domainLoader = document.getElementById('domain-loader');
  const domainList = document.getElementById('domain-list');
  const domainToast = document.getElementById('domain-toast');

  // Check login state
  checkAuthState();

  // Login handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.style.display = 'none';
    loginLoader.style.display = 'block';

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Đăng nhập thất bại.');
        throw new Error(errorMsg);
      }

      localStorage.setItem('admin_token', data.access_token);
      checkAuthState();
    } catch (err) {
      showError(loginError, err.message);
    } finally {
      loginLoader.style.display = 'none';
    }
  });



  // Domain Form Submit Handler
  domainForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert(domainToast);
    domainLoader.style.display = 'block';

    const token = localStorage.getItem('admin_token');
    const domain = domainNameInput.value;
    const targetUrl = domainTargetInput.value;

    try {
      const response = await fetch('/api/settings/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ domain, targetUrl })
      });

      const data = await response.json();

      if (response.status === 401) {
        logout();
        throw new Error('Phiên làm việc hết hạn, vui lòng đăng nhập lại.');
      }

      if (!response.ok) {
        const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Không thể thêm liên kết cho tên miền.');
        throw new Error(errorMsg);
      }

      domainNameInput.value = '';
      domainTargetInput.value = '';
      showSuccess(domainToast, 'Thêm cấu hình tên miền thành công!');
      fetchDomains();
    } catch (err) {
      showError(domainToast, err.message);
    } finally {
      domainLoader.style.display = 'none';
    }
  });



  // Logout handler
  btnLogout.addEventListener('click', () => {
    logout();
  });

  // Functions
  function checkAuthState() {
    const token = localStorage.getItem('admin_token');
    if (token) {
      loginCard.classList.add('hidden');
      dashboardCard.classList.remove('hidden');
      if (container) {
        container.classList.add('dashboard-mode');
      }
      fetchDomains();
    } else {
      loginCard.classList.remove('hidden');
      dashboardCard.classList.add('hidden');
      if (container) {
        container.classList.remove('dashboard-mode');
      }
    }
  }



  async function fetchDomains() {
    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch('/api/settings/domains', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        logout();
        return;
      }
      
      const data = await response.json();
      if (response.ok) {
        renderDomainList(data);
      }
    } catch (err) {
      console.error('Lỗi khi tải cấu hình tên miền:', err);
    }
  }

  function renderDomainList(domains) {
    if (!domains || domains.length === 0) {
      domainList.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center; color: var(--text-secondary);">
            Chưa có tên miền nào được cấu hình chuyển hướng.
          </td>
        </tr>
      `;
      return;
    }

    domainList.innerHTML = domains.map(d => `
      <tr id="row-${d._id}" class="fade-in">
        <td><strong>${escapeHtml(d.domain)}</strong></td>
        <td>
          <a href="${escapeHtml(d.targetUrl)}" target="_blank" style="color: var(--primary-color); text-decoration: none; font-weight: 500;">
            ${escapeHtml(d.targetUrl)}
          </a>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-secondary btn-icon-sm btn-edit" title="Sửa cấu hình" onclick="startEditDomain('${d._id}', '${escapeHtml(escapeJs(d.domain))}', '${escapeHtml(escapeJs(d.targetUrl))}')">
              ${ICONS.EDIT}
            </button>
            <button class="btn btn-danger btn-icon-sm btn-delete" title="Xóa cấu hình" onclick="deleteDomain('${d._id}')">
              ${ICONS.DELETE}
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function logout() {
    localStorage.removeItem('admin_token');
    checkAuthState();
  }

  function showError(element, message) {
    element.className = 'alert alert-error';
    element.textContent = message;
    element.style.display = 'block';
  }

  function showSuccess(element, message) {
    element.className = 'alert alert-success';
    element.textContent = message;
    element.style.display = 'block';
    
    // Hide toast after 4s
    setTimeout(() => {
      hideAlert(element);
    }, 4000);
  }

  function hideAlert(element) {
    element.style.display = 'none';
  }

  // --- Window Global Event Handlers ---
  window.deleteDomain = async function(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa cấu hình chuyển hướng cho tên miền này?')) {
      return;
    }
    
    hideAlert(domainToast);
    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`/api/settings/domains/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Không thể xóa cấu hình.');
        throw new Error(errorMsg);
      }

      showSuccess(domainToast, 'Đã xóa cấu hình tên miền thành công.');
      fetchDomains();
    } catch (err) {
      showError(domainToast, err.message);
    }
  };

  window.startEditDomain = function(id, domain, targetUrl) {
    const row = document.getElementById(`row-${id}`);
    if (!row) return;

    row.innerHTML = `
      <td>
        <input type="text" class="table-input" id="edit-domain-${id}" value="${escapeHtml(domain)}" required>
      </td>
      <td>
        <input type="url" class="table-input" id="edit-target-${id}" value="${escapeHtml(targetUrl)}" required>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-success btn-icon-sm" title="Lưu lại" onclick="saveEditDomain('${id}')">
            ${ICONS.SAVE}
          </button>
          <button class="btn btn-secondary btn-icon-sm" title="Hủy" onclick="cancelEditDomain('${id}', '${escapeHtml(escapeJs(domain))}', '${escapeHtml(escapeJs(targetUrl))}')">
            ${ICONS.CANCEL}
          </button>
        </div>
      </td>
    `;
  };

  window.cancelEditDomain = function(id, domain, targetUrl) {
    const row = document.getElementById(`row-${id}`);
    if (!row) return;

    row.innerHTML = `
      <td><strong>${escapeHtml(domain)}</strong></td>
      <td>
        <a href="${escapeHtml(targetUrl)}" target="_blank" style="color: var(--primary-color); text-decoration: none; font-weight: 500;">
          ${escapeHtml(targetUrl)}
        </a>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-secondary btn-icon-sm btn-edit" title="Sửa cấu hình" onclick="startEditDomain('${id}', '${escapeHtml(escapeJs(domain))}', '${escapeHtml(escapeJs(targetUrl))}')">
            ${ICONS.EDIT}
          </button>
          <button class="btn btn-danger btn-icon-sm btn-delete" title="Xóa cấu hình" onclick="deleteDomain('${id}')">
            ${ICONS.DELETE}
          </button>
        </div>
      </td>
    `;
  };

  window.saveEditDomain = async function(id) {
    const domainInput = document.getElementById(`edit-domain-${id}`);
    const targetInput = document.getElementById(`edit-target-${id}`);
    if (!domainInput || !targetInput) return;

    const domain = domainInput.value.trim();
    const targetUrl = targetInput.value.trim();

    if (!domain || !targetUrl) {
      alert('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    hideAlert(domainToast);
    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`/api/settings/domains/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ domain, targetUrl })
      });

      const data = await response.json();
      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Không thể cập nhật cấu hình.');
        throw new Error(errorMsg);
      }

      showSuccess(domainToast, 'Đã cập nhật cấu hình tên miền thành công.');
      fetchDomains();
    } catch (err) {
      showError(domainToast, err.message);
    }
  };

  // Helper Escape Functions to prevent XSS
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeJs(str) {
    if (!str) return '';
    return str
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      .replace(/"/g, "\\\"")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r");
  }
});
