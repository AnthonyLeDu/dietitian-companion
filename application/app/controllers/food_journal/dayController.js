/* global module */
const { Day, Journal } = require('../../models');

const dayController = {

  // -----------------
  // GENERIC FUNCTIONS
  // -----------------
  getDays: async () => {
    return await Day.findAll({
      include: 'journal'
    });
  },

  getDay: async (dayID) => {
    const day = await Day.findByPk(
      dayID, {
        include: 'journal'
      }
    );
    return day;
  },

  /**
   * Find days associated to a journal's id.
   * @param {Integer} journalID Journal's id
   * @returns {Array<Day>} Matching Days array.
   */
  getJournalDays: async (journalID) => {
    const journal = await Journal.findByPk(journalID);
    if (!journal) return [];
    const findData = {
      order: ['position'],
      where: { journal_id: journalID },
      // include: 'journal'
    };
    return await Day.findAll(findData);
  },

  // -------------
  // API FUNCTIONS
  // -------------

  apiCreateDay: async (req, res) => {
    const dayData = req.body;
    const day = await Day.create(dayData);
    return res.json(day);
  },

  apiUpdateDay: async (req, res, next) => {
    const { id } = req.params;
    let day = await dayController.getDay(id);
    if (!day) return next(); // 404
    // Converting empy values to null
    for (const prop in req.body) {
      req.body[prop] = req.body[prop] || null;
    }
    await day.update(req.body);
    // Re-get day in case journal_id has been changed.
    day = await dayController.getDay(id);
    res.json(day);
  },

  apiGetDays: async (req, res, next) => {
    let days;
    if (req.query.journal !== undefined) {
      days = await dayController.getJournalDays(req.query.journal);
    } else {
      days = await dayController.getDays();
    }
    if (!days) return next(); // journal id was provided but journal not found
    res.json(days);
  },

  apiGetDay: async (req, res, next) => {
    const day = await dayController.getDay(req.params.id);
    if (!day) return next(); // 404
    res.json(day);
  },

  apiDeleteDay: async (req, res, next) => {
    const { id } = req.params;
    const day = await dayController.getDay(id);
    if (!day) return next(); // 404
    day.destroy();
    res.status(204).json({});
  },
};

module.exports = dayController;
