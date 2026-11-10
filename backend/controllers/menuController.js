const Menu = require('../models/Menu');

const getDayName = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

// @desc    Get complete weekly menu (or filtered by day)
// @route   GET /api/menu
// @access  Public
const getWeeklyMenu = async (req, res, next) => {
  try {
    const { day, mealType } = req.query;
    const filter = {};

    if (day) filter.day = day;
    if (mealType) filter.mealType = mealType.toLowerCase();

    const menu = await Menu.find(filter).sort({ day: 1, mealType: 1 });

    // Group by days
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const grouped = {};
    daysOrder.forEach(d => {
      grouped[d] = {
        breakfast: null,
        lunch: null,
        snacks: null,
        dinner: null
      };
    });

    menu.forEach(item => {
      if (grouped[item.day]) {
        grouped[item.day][item.mealType] = item;
      }
    });

    res.status(200).json({
      success: true,
      count: menu.length,
      data: menu,
      grouped
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's menu
// @route   GET /api/menu/today
// @access  Public
const getTodayMenu = async (req, res, next) => {
  try {
    const today = getDayName();
    const todaysMenu = await Menu.find({ day: today }).sort({ mealType: 1 });

    const meals = {
      day: today,
      breakfast: todaysMenu.find(m => m.mealType === 'breakfast') || null,
      lunch: todaysMenu.find(m => m.mealType === 'lunch') || null,
      snacks: todaysMenu.find(m => m.mealType === 'snacks') || null,
      dinner: todaysMenu.find(m => m.mealType === 'dinner') || null
    };

    res.status(200).json({
      success: true,
      day: today,
      data: meals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin create or replace a menu slot
// @route   POST /api/menu
// @access  Private (Admin)
const createOrUpdateMenu = async (req, res, next) => {
  try {
    const { day, mealType, items, description, specialDietNote, caloriesEstimate, timing } = req.body;

    if (!day || !mealType || !items) {
      return res.status(400).json({
        success: false,
        message: 'Day, meal type, and items are required.'
      });
    }

    const itemArray = Array.isArray(items)
      ? items.map(i => i.trim()).filter(Boolean)
      : items.split(',').map(i => i.trim()).filter(Boolean);

    if (itemArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one menu item is required.'
      });
    }

    const updatedMenu = await Menu.findOneAndUpdate(
      { day, mealType: mealType.toLowerCase() },
      {
        day,
        mealType: mealType.toLowerCase(),
        items: itemArray,
        description: description || '',
        specialDietNote: specialDietNote || '',
        caloriesEstimate: caloriesEstimate ? Number(caloriesEstimate) : 450,
        timing: timing || '',
        updatedBy: req.user.id
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Menu for ${day} ${mealType.toUpperCase()} updated successfully.`,
      data: updatedMenu
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin update specific menu by ID
// @route   PUT /api/menu/:id
// @access  Private (Admin)
const updateMenuById = async (req, res, next) => {
  try {
    const { items, description, specialDietNote, caloriesEstimate, timing } = req.body;

    const menu = await Menu.findById(req.params.id);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu entry not found.'
      });
    }

    if (items) {
      menu.items = Array.isArray(items)
        ? items.map(i => i.trim()).filter(Boolean)
        : items.split(',').map(i => i.trim()).filter(Boolean);
    }
    if (description !== undefined) menu.description = description;
    if (specialDietNote !== undefined) menu.specialDietNote = specialDietNote;
    if (caloriesEstimate !== undefined) menu.caloriesEstimate = Number(caloriesEstimate);
    if (timing !== undefined) menu.timing = timing;
    menu.updatedBy = req.user.id;

    await menu.save();

    res.status(200).json({
      success: true,
      message: 'Menu entry updated successfully.',
      data: menu
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin delete menu entry
// @route   DELETE /api/menu/:id
// @access  Private (Admin)
const deleteMenuById = async (req, res, next) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.id);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu entry not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: `Menu for ${menu.day} ${menu.mealType.toUpperCase()} removed.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWeeklyMenu,
  getTodayMenu,
  createOrUpdateMenu,
  updateMenuById,
  deleteMenuById
};
