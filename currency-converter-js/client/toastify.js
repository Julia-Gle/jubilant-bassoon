const toastConfig = {
  container: document.querySelector('.toast-container'),
  autoClose: 2000
};

const toastTypes = {
  success: {
    img: 'img/document.svg',
    headline: 'Success',
    style: 'bg-success'
  },
  error: {
    img: 'img/document.svg',
    headline: 'Error',
    style: 'bg-danger'
  },
  warning: {
    img: 'img/document.svg',
    headline: 'Warning',
    style: 'bg-warning'
  },
  info: {
    img: 'img/document.svg',
    headline: 'Information',
    style: 'bg-light'
  }
};

const createToast = (type, message) => {
  const { img, headline, style } = type.img || type.headline ? type : toastTypes[type];
  const toast = document.createElement('div');
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');

  toast.classList.add(`toast`, `fade`, `show`, type, style);

  const toastHeader = document.createElement('div');
  toastHeader.classList.add('toast-header');

  const imgElement = document.createElement('img');
  imgElement.src = img;
  imgElement.classList.add('feather', 'feather-file-text', 'align-text-bottom', 'me-1');
  toastHeader.appendChild(imgElement);

  const strongElement = document.createElement('strong');
  strongElement.classList.add('me-auto');
  strongElement.textContent = headline;
  toastHeader.appendChild(strongElement);

  const smallElement = document.createElement('small');
  smallElement.textContent = getCurrentTime();
  toastHeader.appendChild(smallElement);

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.classList.add('btn-close');
  closeButton.setAttribute('data-bs-dismiss', 'toast');
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.onclick = () => toast.remove();
  toastHeader.appendChild(closeButton);

  toast.appendChild(toastHeader);

  if (message) {
    const toastBody = document.createElement('div');
    toastBody.classList.add('toast-body');
    toastBody.textContent = message;
    toast.appendChild(toastBody);
  }

  toast.timeoutId = setTimeout(() => removeToast(toast), toastConfig.autoClose);
  toastConfig.container.prepend(toast);
}

const removeToast = (toast) => {
  toast.classList.add('hide');
  if (toast.timeoutId) clearTimeout(toast.timeoutId);
  toast.remove();
}

const getCurrentTime = () => {
  const currentTime = new Date();
  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');

  return hours + ':' + minutes;
}



