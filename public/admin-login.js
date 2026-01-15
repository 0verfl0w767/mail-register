const form = document.getElementById('loginForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const message = document.getElementById('msg');

  if (!username || !password) {
    message.textContent = '아이디와 비밀번호를 입력해주세요.';
    message.style.display = 'block';
    return;
  }

  try {
    const res = await fetch('/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    console.log('login response status', res.status, 'data', data);

    if (!res.ok) {
      message.textContent = data.message || '로그인에 실패하였습니다.';
      message.style.display = 'block';
      return;
    }

    if (!data.access_token) {
      console.error('로그인 응답에 access_token이 없습니다:', data);
      message.textContent =
        '서버 응답에 토큰이 없습니다. 관리자에게 문의하세요.';
      message.style.display = 'block';
      return;
    }

    localStorage.setItem('access_token', data.access_token);
    try {
      const payload = JSON.parse(atob(data.access_token.split('.')[1] || ''));
      const expMs =
        payload && typeof payload.exp === 'number' ? payload.exp * 1000 : null;
      if (expMs && expMs <= Date.now()) {
        localStorage.removeItem('access_token');
        message.textContent =
          '토큰이 이미 만료되었습니다. 다시 로그인해주세요.';
        message.style.display = 'block';
        return;
      }
      if (expMs) {
        setTimeout(() => {
          localStorage.removeItem('access_token');
          window.location.href = '/admin-login';
        }, expMs - Date.now());
      }
    } catch (e) {
      console.warn('token decode failed', e);
    }

    window.location.href = '/users';
  } catch (err) {
    console.error('로그인 요청 실패:', err);
    message.textContent = '서버에 오류가 발생했습니다.';
    message.style.display = 'block';
  }
});

if (localStorage.getItem('access_token')) {
  window.location.href = '/users';
}
