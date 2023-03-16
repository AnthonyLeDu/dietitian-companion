// eslint-disable-next-line no-unused-vars
const userFeedback = {
  mainElem: undefined,

  init() {
    userFeedback.mainElem = document.getElementById('feedback'),
    userFeedback.mainElem.addEventListener('click', userFeedback.clear);
  },
  
  success(message) {
    userFeedback.mainElem.className = '';
    userFeedback.mainElem.textContent = message;
    userFeedback.mainElem.classList.add('--is-success');
  },
  
  error(error) {
    console.error(error.message);
    console.error(error.stack);
    userFeedback.mainElem.className = '';
    userFeedback.mainElem.textContent = error.message;
    userFeedback.mainElem.classList.add('--is-danger');
  },

  clear() {
    userFeedback.mainElem.textContent = '';
    userFeedback.mainElem.className = '';
  },
};

userFeedback.init();