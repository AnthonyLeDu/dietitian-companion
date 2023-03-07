/* global app, dayjs, CoreObject, Day, BASE_URL */

// eslint-disable-next-line no-unused-vars
class Journal extends CoreObject {
  static childrenClass;

  /**
   * @param {Object} data Journal data to load
   * @param {HTMLElement} mainElem Form div
   */
  constructor(data, mainElem) {
    super(null, mainElem);
    this.id = data.id;
    this.childrenClass = Day;
    this.childrenRowElem = document.getElementById('days-row');
    this.childrenElem = document.getElementById('days');

    // Patient inputs
    this.patientNameInputElem = this.mainElem.querySelector('input[name=patient_fullname]');
    this.patientAgeInputElem = this.mainElem.querySelector('input[name=patient_age]');
    this.patientWeightInputElem = this.mainElem.querySelector('input[name=patient_weight]');
    this.startDayInputElem = this.mainElem.querySelector('input[name=start_day]');
    
    this.patientNameInputElem.addEventListener('change', event => this.self.handlePatientNameChange(event));
    this.patientAgeInputElem.addEventListener('change', event => this.self.handlePatientAgeChange(event));
    this.patientWeightInputElem.addEventListener('change', event => this.self.handlePatientWeightChange(event));
    this.startDayInputElem.addEventListener('change', event => this.self.handleStartDayChange(event));
    document.getElementById('add-day').addEventListener('click', () => this.self.postChild());
    
    this.loadData(data);
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
    return (this.patientAgeInputElem.value !== '') ? Number(this.patientAgeInputElem.value) : undefined;
  }
  
  /**
   * @param {Integer} age
   */
  set patientAge(age) {
    this.patientAgeInputElem.value = age;
  }

  get patientWeight() {
    const weight = this.mainElem.querySelector('input[name=patient_weight]').value;
    return (weight !== '') ? Number(weight) : undefined;
  }

  get startDay() {
    return this.mainElem.querySelector('input[name=start_day]').value;
  }

  /**
   * Load json data into the UI.
   */
  async loadData(data) {
    // Show the journal form and fill it
    this.mainElem.style.display = 'block';
    const { patient, patient_age, patient_weight, start_day } = data;
    if (patient) {
      this.patientId = patient.id;
      this.patientNameInputElem.value = this.patient.fullNameAndGender;
    }
    this.patientAgeInputElem.value = patient_age;
    this.patientWeightInputElem.value = patient_weight;
    this.startDayInputElem.value = start_day;

    // Load days
    data.days?.forEach((dayData) => this.addChild(dayData));
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
   * Post a new Day for this Journal in the DB.
   * @returns {Object} Created Day data object.
   */
  async postChild() {
    try {
      const formData = new FormData();
      formData.append('journal_id', this.id);
      formData.append('position', this.children.length);
      // POST fetch
      const response = await fetch(`${BASE_URL}/api/day`, {
        method: 'POST',
        body: formData,
      });
      const json = await response.json();
      if (!response.ok) throw json;
      this.addChild(json);
    }
    catch (error) {
      console.error(error);
      return app.errorFeedback(error.message);
    }
  }

  /**
   * Add a Day child.
   * @param {Object} childData Day data object.
   */
  addChild(childData) {
    console.log(childData);
    super.addChild(childData);
    // Move scrollbar to the right (if visible)
    if (this.childrenRowElem.scrollWidth > this.childrenRowElem.clientWidth) {
      this.childrenRowElem.scrollLeft += this.childrenRowElem.scrollWidth;
    }
  }
  
  updatePatientAge() {
    // Enable age input only if patient or date is not specified
    if (!this.patientId || !this.startDay) {
      this.patientAgeInputElem.readOnly = false;
      this.patientAgeInputElem.classList.remove('--is-readonly');
      return;
    }
    this.patientAgeInputElem.readOnly = true;
    this.patientAgeInputElem.classList.add('--is-readonly');
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
      console.error(error);
      return app.errorFeedback(error.message);
    }
  }

}
