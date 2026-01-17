function clearTokenAndRedirect() {
  localStorage.removeItem('access_token');
  window.location.href = '/admin-login';
}

function decodeJwtExp(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null; // ms
  } catch (e) {
    console.warn('failed to decode jwt', e);
    return null;
  }
}

let expiryTimer = null;
function scheduleExpiryRedirect(token) {
  const expMs = decodeJwtExp(token);
  if (!expMs) return;
  const remain = expMs - Date.now();
  if (remain <= 0) {
    clearTokenAndRedirect();
    return;
  }
  if (expiryTimer) clearTimeout(expiryTimer);
  expiryTimer = setTimeout(() => {
    clearTokenAndRedirect();
  }, remain);
}

async function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  if (!token) {
    clearTokenAndRedirect();
    return null;
  }

  const expMs = decodeJwtExp(token);
  if (expMs && expMs <= Date.now()) {
    clearTokenAndRedirect();
    return null;
  }
  scheduleExpiryRedirect(token);

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function loadUsers() {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return;

    const response = await fetch('/users/api', { headers });
    const result = await response.json();

    if (response.status === 401) {
      console.warn('users/api 401 -> clearing token');
      clearTokenAndRedirect();
      return;
    }

    if (!result.data || result.data.length === 0) {
      document.getElementById('users-container').innerHTML =
        '<div class="empty-state"><div class="empty-state-icon"><i class="bi bi-inbox"></i></div><p class="empty-state-text">등록된 회원이 없습니다.</p></div>';
      return;
    }

    const table = `
      <table class="users-table">
        <thead>
          <tr>
            <th style="width: 30%">아이디</th>
            <th style="width: 15%">관리자</th>
            <th style="width: 20%">상태</th>
            <th style="width: 35%">작업</th>
          </tr>
        </thead>
        <tbody>
          ${result.data
            .map(
              (user) => `
            <tr>
              <td><span class="username">${escapeHtml(user.username)}</span></td>
              <td>
                <span class="badge ${user.admin ? 'admin' : 'user'}">
                  ${user.admin ? '관리자' : '사용자'}
                </span>
              </td>
              <td>
                <span class="status ${user.active ? 'active' : 'inactive'}">
                  <i class="bi ${user.active ? 'bi-check-circle' : 'bi-x-circle'}"></i>
                  ${user.active ? '활성화' : '비활성화'}
                </span>
              </td>
              <td>
                <div class="actions">
                  <button class="warning" onclick="toggleUserStatus('${escapeHtml(user.username)}')">
                    <i class="bi bi-power"></i>
                    ${user.active ? '비활성화' : '활성화'}
                  </button>
                  <button class="danger" onclick="deleteUser('${escapeHtml(user.username)}')">
                    <i class="bi bi-trash"></i>
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    `;

    document.getElementById('users-container').innerHTML = table;
  } catch (error) {
    showMessage('사용자 목록을 불러오지 못했습니다.', 'error');
    console.error('Error:', error);
  }
}

async function toggleUserStatus(username) {
  if (!confirm(`${username} 사용자의 상태를 변경하시겠습니까?`)) return;

  try {
    const headers = await getAuthHeaders();
    if (!headers) return;

    const response = await fetch(`/users/api/${username}`, {
      method: 'PATCH',
      headers,
    });

    const result = await response.json();

    if (response.status === 401) {
      console.warn('PATCH 401 -> clearing token');
      clearTokenAndRedirect();
      return;
    }

    if (response.ok) {
      showMessage(
        `${username} 사용자가 ${result.data.active ? '활성화' : '비활성화'}되었습니다.`,
        'success',
      );
      loadUsers();
    } else {
      showMessage(result.message || '상태 변경에 실패했습니다.', 'error');
    }
  } catch (error) {
    showMessage('상태 변경 중 오류가 발생했습니다.', 'error');
    console.error('Error:', error);
  }
}

async function deleteUser(username) {
  if (
    !confirm(
      `${username} 사용자를 정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
    )
  ) {
    return;
  }

  try {
    const headers = await getAuthHeaders();
    if (!headers) return;

    const response = await fetch(`/users/api/${username}`, {
      method: 'DELETE',
      headers,
    });

    const result = await response.json();

    if (response.status === 401) {
      console.warn('DELETE 401 -> clearing token');
      clearTokenAndRedirect();
      return;
    }

    if (response.ok) {
      showMessage(`${username} 사용자가 삭제되었습니다.`, 'success');
      loadUsers();
    } else {
      showMessage(result.message || '삭제에 실패했습니다.', 'error');
    }
  } catch (error) {
    showMessage('삭제 중 오류가 발생했습니다.', 'error');
    console.error('Error:', error);
  }
}

function showMessage(message, type = 'info') {
  const container = document.getElementById('message');
  const div = document.createElement('div');
  div.className = `message ${type}`;
  div.textContent = message;
  container.innerHTML = '';
  container.appendChild(div);

  if (type === 'success') {
    setTimeout(() => {
      div.classList.add('fade-out');
      setTimeout(() => {
        div.remove();
      }, 500);
    }, 3000);
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

window.addEventListener('DOMContentLoaded', loadUsers);
