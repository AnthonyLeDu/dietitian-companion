/* global app, dayjs, CoreObject, Day, BASE_URL */

// eslint-disable-next-line no-unused-vars
class Journal extends CoreObject {
  static childrenClass;

  /**
   * @param {HTMLElement} mainElem Form div
   * @param {Number} id Journal id in database.
   */
  constructor(mainElem, id) {
    super(null, mainElem);
    this.id = id;
    this.childrenClass = Day;
    this.childrenRowElem = document.getElementById('days-row');
    this.childrenElem = document.getElementById('days');

    // Patient inputs
    this.mainElem.querySelector('input[name=patient_fullname]').addEventListener(
      'change', event => this.self.handlePatientNameChange(event));
    this.mainElem.querySelector('input[name=patient_age]').addEventListener(
      'change', event => this.self.handlePatientAgeChange(event));
    this.mainElem.querySelector('input[name=patient_weight]').addEventListener(
      'change', event => this.self.handlePatientWeightChange(event));
    this.mainElem.querySelector('input[name=start_day]').addEventListener(
      'change', event => this.self.handleStartDayChange(event));
    
    document.getElementById('add-day').addEventListener(
      'click', () => this.self.addChild());
    
    this.loadJournal();
  }

  get form() {
    return this.mainElem.querySelector('#journal-form');
  }

  get patientId() {
    const id = this.mainElem.querySelector('input[name=patient_id]').value;
    return (id !== '') ? Number(id) : undefined;
  }

  /**
   * @param {Integer} id
   */
  set patientId(id) {
    this.mainElem.querySelector('input[name=patient_id]').value = (id !== undefined) ? String(id) : '';
  }

  get patient() {
    if (!this.patientId) return undefined;
    return app.dbPatients.find(patient => patient.id === this.patientId);
  }

  get patientAge() {
    const age = this.mainElem.querySelector('input[name=patient_age]').value;
    return (age !== '') ? Number(age) : undefined;
  }
  
  /**
   * @param {Integer} age
   */
  set patientAge(age) {
    this.mainElem.querySelector('input[name=patient_age]').value = age;
  }

  get patientWeight() {
    const weight = this.mainElem.querySelector('input[name=patient_weight]').value;
    return (weight !== '') ? Number(weight) : undefined;
  }

  get startDay() {
    return this.mainElem.querySelector('input[name=start_day]').value;
  }

  /**
   * Load Journal in DOM
   */
  async loadJournal() {
    const journalData = await this.fetchJournal();
    if (!journalData) return;
    // Show journal form
    this.mainElem.style.display = 'block';
    // Fill the journal form
    if (journalData.patient) {
      this.patientId = journalData.patient.id;
      this.mainElem.querySelector(`input[name=patient_fullname]`).value = this.patient.fullNameAndGender;
    }
    for (const inputName of ['patient_age', 'patient_weight', 'start_day']) {
      this.mainElem.querySelector(`input[name=${inputName}]`).value = journalData[inputName];
    }
    // Load journal content
    // TODO
  }

  /**
   * Fetch Journal from API
   */
  async fetchJournal() {
    try {
      // Fetching using API
      const response = await fetch(`${BASE_URL}/api/journal/${this.id}`);
      const json = await response.json();
      if (!response.ok) throw json;
      return json;
    } catch (error) {
      console.error(error.message);
      app.errorFeedback(error.message);
      return;
    }
  }

  handlePatientNameChange(event) {
    const patientNameInputElem = event.target;
    patientNameInputElem.classList.remove('--is-danger');
    // Check if name matches a Patient
    const patient = app.dbPatients.find(patient => patient.fullNameAndGender === patientNameInputElem.value);
    if(!patient) {
      this.patientId = undefined;
      if (patientNameInputElem.value !== '') {
        patientNameInputElem.classList.add('--is-danger');
      }
    } else {
      this.patientId = patient.id;
    }
    this.updatePatientAge();
    this.patchInDatabase();
  }
  
  handlePatientAgeChange() {
    this.patchInDatabase();
  }
  
  handlePatientWeightChange() {
    this.patchInDatabase();
  }
  
  handleStartDayChange() {
    this.updatePatientAge();
    this.patchInDatabase();
    this.updateChildrenLook();
  }
  
  /**
   * Add a Day.
   */
  async addChild() {
    try {
      const formData = new FormData();
      formData.append('journal_id', this.id);
      // POST fetch
      const response = await fetch(`${BASE_URL}/api/day`, {
        method: 'POST',
        body: formData,
      });
      const json = await response.json();
      if (!response.ok) throw json;
    } catch (error) {
      console.log(error);
      app.errorFeedback(error.message);
      return;
    }
    // Add to DOM
    super.addChild();
    // Move scrollbar to the right (if visible)
    if (this.childrenRowElem.scrollWidth > this.childrenRowElem.clientWidth) {
      this.childrenRowElem.scrollLeft += this.childrenRowElem.scrollWidth;
    }
  }
  
  updatePatientAge() {
    // Enable age input only if patient or date is not specified
    const patientAgeInputElem = this.mainElem.querySelector('input[name=patient_age]');
    if (!this.patientId || !this.startDay) {
      patientAgeInputElem.readOnly = false;
      patientAgeInputElem.classList.remove('--is-readonly');
      return;
    }
    patientAgeInputElem.readOnly = true;
    patientAgeInputElem.classList.add('--is-readonly');
    // Calculate age
    this.patientAge = dayjs(this.startDay).diff(dayjs(this.patient.birth_date), 'years');
  }
  
  /**
   * Updates the children arrows and titles
  */
  updateChildrenLook() {
    this.children.forEach(child => {
      child.updateArrows();
      child.updateTitle();
    });
  }

  updateChildren() {
    this.sortChildrenElem();
    this.updateChildrenLook();
  }

  async patchInDatabase() {
    const formData = new FormData(this.form);
    try {
      const response = await fetch(`${BASE_URL}/api/journal/${this.id}`, {
        method: 'PATCH',
        body: formData
      });
      const json = await response.json();
      if (!response.ok) throw json;
      app.successFeedback('Journal mis à jour.');
    } catch (error) {
      console.log(error);
      app.errorFeedback(error.message);
      return;
    }
  }

}
