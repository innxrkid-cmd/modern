import Suggestion from '../models/Suggestion.js';

export const createSuggestion = async (req, res) => {
  try {
    const { title, description, category, anonymous } = req.body;
    const suggestion = await Suggestion.create({
      user: req.user.id,
      title,
      description,
      category,
      anonymous: anonymous || false
    });
    res.status(201).json(suggestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSuggestions = async (req, res) => {
  try {
    let suggestions;
    if (req.user.role === 'admin') {
      suggestions = await Suggestion.find({})
        .populate('user', 'name email role employeeId')
        .sort({ createdAt: -1 });

      // Mask anonymous suggestions for admin
      suggestions = suggestions.map((s) => {
        const doc = s.toObject();
        if (doc.anonymous) {
          doc.user = {
            name: 'Anonymous Employee',
            role: 'employee'
          };
        }
        return doc;
      });
    } else {
      suggestions = await Suggestion.find({ user: req.user.id })
        .populate('user', 'name email role employeeId')
        .sort({ createdAt: -1 });
    }
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
