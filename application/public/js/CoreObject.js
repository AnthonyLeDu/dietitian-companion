// eslint-disable-next-line no-unused-vars
class CoreObject {
  static childrenClass;
  parent;
  mainElem;
  children; // Ordered array of children CoreObjects
  childrenRowElem;
  childrenElem;
  id;

  /**
   * @param {CoreObject} parent Parent CoreObject
   * @param {HTMLElement} mainElem Corresponding DOM Element
  */
  constructor(parent = null, mainElem = null) {
    this.parent = parent;
    this.mainElem = mainElem;
    this.children = [];
    // Needed for eventListeners definition because 'this' corresponds
    // to the clicked element in addEventListener handlers.
    this.self = this;
  }

  /**
   * Remove an instance from the children and from the DOM.
   * @param {CoreObject} child Instance to remove.
   */
  removeChild(child) {
    this.children.splice(child.index, 1);
    child.mainElem.remove();
    this.updateChildren();
  }

  /**
   * Ask the parent to remove the instance
   */
  destroy() {
    this.parent.removeChild(this);
  }


  /**
   * Getter returning the index of the instance in its parent's children array.
   * @returns {Integer} The index.
   */
  get index() {
    const index = this.parent.children.indexOf(this);
    return (index !== -1) ? index : undefined;
  }

  /**
   * Setter moving the instance to the given index in its parent's children array.
   */
  set index(value) {
    this.parent.moveChild(this, value - this.index);
  }

  addChild(mainElem = null) {
    this.children.push(
      new this.childrenClass(this, mainElem));
    this.updateChildren();
  }

  /**
   * Move a child in the children array and update the DOM acccordingly.
   * @param {CoreObject} child Child instance
   * @param {Integer} increment Positive increment = to the end ; negative increment = to the start.
   */
  moveChild(child, increment) {
    if (child.index === undefined) throw new Error(`Child not found in ${this.constructor.name} children.`);
    if (increment === 0) return; // No move needed

    const targetIndex = child.index + increment;
    // Check that child can be moved in the array
    if (targetIndex < 0 || (this.children.length <= targetIndex)) {
      throw new Error(`
        Child cannot be moved to index '${targetIndex}' as it falls outside of the ${this.constructor.name} 
        children array range (i.e. it is below '0' or above '${this.children.length - 1}').
      `);
    }
    // Moving the child in the array and update the DOM
    this.children.splice(targetIndex, 0, this.children.splice(child.index, 1)[0]);
    this.updateChildren();
  }

  sortChildrenElem() {
    this.children.forEach((child, index) => {
      const htmlElem = this.self.childrenElem.children[index];
      if (htmlElem !== child.mainElem) { // Element is not at expected position, insert it
        this.self.childrenElem.insertBefore(child.mainElem, htmlElem);
      }
    });
  }

  updateChildren() {
    this.sortChildrenElem();
  }

}