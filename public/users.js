async function loadUsers() {
  try {
    const response = await fetch('/users/api');
    const result = await response.json();

    if (!result.data || result.data.length === 0) {
      document.getElementById('users-container').innerHTML =
        '<div class="empty-state"><div class="empty-state-icon"><i class="bi bi-inbox"></i></div><p class="empty-state-text">등록된 회원이 없습니다.</p></div>';
      return;
    }

    const table = `
      <table class="users-table">
        <thead>
          <tr>
            <th style="width: 40%">아이디</th>
            <th style="width: 30%">상태</th>
            <th style="width: 30%">작업</th>
          </tr>
        </thead>
        <tbody>
          ${result.data
            .map(
              (user) => `
            <tr>
              <td><span class="username">${escapeHtml(user.username)}</span></td>
              <td>
                <span class="status ${user.active ? 'active' : 'inactive'}">
                  <i class="bi ${user.active ? 'bi-check-circle' : 'bi-x-circle'}"></i>
                  ${user.active ? '활성' : '비활성'}
                </span>
              </td>
              <td>
                <div class="actions">
                  <button class="warning" onclick="toggleUserStatus('${escapeHtml(user.username)}')">
                    <i class="bi bi-power"></i>
                    ${user.active ? '비활성' : '활성'}
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
    const response = await fetch(`/users/api/${username}`, {
      method: 'PATCH',
    });

    const result = await response.json();

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
    const response = await fetch(`/users/api/${username}`, {
      method: 'DELETE',
    });

    const result = await response.json();

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
      div.remove();
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

// 페이지 로드 시 사용자 목록 불러오기
window.addEventListener('DOMContentLoaded', loadUsers);
