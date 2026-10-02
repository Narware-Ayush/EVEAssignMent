const { Centre, Test, CentreTest } = require('../models');
const AppError = require('../utils/AppError');
const { success } = require('../utils/response');

const listCentres = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const offset = (page - 1) * limit;

    const { rows, count } = await Centre.findAndCountAll({
      where: { isActive: true },
      include: [
        {
          model: Test,
          as: 'tests',
          attributes: ['id', 'name', 'description'],
          through: { attributes: ['price', 'available'] },
        },
      ],
      limit,
      offset,
      distinct: true,
      order: [['name', 'ASC']],
    });

    return success(res, rows, 200, {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    });
  } catch (err) {
    next(err);
  }
};

const getCentre = async (req, res, next) => {
  try {
    const centre = await Centre.findByPk(req.params.id, {
      include: [
        {
          model: Test,
          as: 'tests',
          through: { attributes: ['price', 'available'] },
        },
      ],
    });
    if (!centre) throw new AppError('Centre not found', 404, 'CENTRE_NOT_FOUND');
    return success(res, centre);
  } catch (err) {
    next(err);
  }
};

const listTests = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const offset = (page - 1) * limit;

    const { rows, count } = await Test.findAndCountAll({
      limit,
      offset,
      order: [['name', 'ASC']],
    });
    return success(res, rows, 200, { page, limit, total: count, totalPages: Math.ceil(count / limit) });
  } catch (err) {
    next(err);
  }
};

module.exports = { listCentres, getCentre, listTests };