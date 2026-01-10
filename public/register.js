const form = document.getElementById('registerForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirmPassword').value;
  const message = document.getElementById('msg');

  const usernameRegex = /^[a-z0-9._-]{8,20}$/;

  if (!usernameRegex.test(username)) {
    message.textContent =
      '아이디는 영문 소문자, 숫자, ., _, - 만 사용 가능하며 8~20자여야 합니다.';
    message.style.display = 'block';
    return;
  }

  if (password.length < 8) {
    message.textContent = '비밀번호는 최소 8자 이상이어야 합니다.';
    message.style.display = 'block';
    return;
  }

  if (password !== confirm) {
    message.textContent = '비밀번호가 일치하지 않습니다.';
    message.style.display = 'block';
    return;
  }

  try {
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      message.textContent = data.message || '회원가입에 실패하였습니다.';
      message.style.display = 'block';
      return;
    }

    message.textContent =
      '회원가입에 성공하였습니다. 페이지가 잠시 후 이동됩니다.';
    message.style.color = 'green';
    message.style.display = 'block';

    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  } catch (err) {
    message.textContent = '서버에 오류가 발생했습니다.';
    message.style.display = 'block';
  }
});
