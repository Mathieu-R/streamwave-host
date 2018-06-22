class Toast {
  static create (messages = [], buttons = [], duration = 3000) {
    const container = document.querySelector('.toast');
    const toast = document.createElement('div');
    toast.classList.add('toast__messages');


    messages.map(message => {
      const toastContent = document.createElement('div');
      toastContent.classList.add('toast__content');
      toastContent.textContent = message;
      toast.appendChild(toastContent);
    });

    const buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('toast__buttons');

    buttons.map(name => {
      const button = document.createElement('button');
      button.classList.add('toast__button');
      button.dataset.name = name;
      button.textContent = name;
      buttonsContainer.appendChild(button);
    })

    container.appendChild(toast);
    container.appendChild(buttonsContainer);

    setTimeout(() => toast.classList.add('hide'), 3000);
    toast.addEventListener('transitionend', evt => evt.target.parentNode.removeChild(evt.target));
  }
}

export default Toast;
