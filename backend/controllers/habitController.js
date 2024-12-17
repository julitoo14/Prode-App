const Habit = require('../models/Habit');

const addHabit = async (req, res) => {
    let params = req.body;
    console.log(params);

    try {
        const habit = new Habit(params);
        const savedHabit = await habit.save();
        return res.status(201).json({ message: 'Habit created successfully', habit: savedHabit });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

const one = async (req, res) => {
    const habitId = req.params.id;
    if (!habitId) {
        return res.status(400).json({ message: 'Habit Inexistente' });
    }

    try {
        const habit = await Habit.findById(habitId).exec();
        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        return res.status(200).json({ habit });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const getHabits = async (req, res) => {
    const userId = req.params.id;
    if (!userId) {
        return res.status(400).json({ message: 'Usuario Inexistente' });
    }

    try {
        let today = new Date().toLocaleString('es-ES', { weekday: 'long' });
        today = today.charAt(0).toUpperCase() + today.slice(1);
        const habits = await Habit.find({ id_user: userId, dias_de_la_semana: today, tipo: {$ne: 'meta'} }).exec();
        const metas = await Habit.find({ id_user: userId,dias_de_la_semana: today, tipo: 'meta', fecha_limite: { $gte: new Date() } }).exec();

        const combinedResults = [...habits, ...metas];

        combinedResults.sort((a, b) => a.tipo.localeCompare(b.tipo));

        return res.status(200).json({ habits: combinedResults });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

const toggleHabit = async (req, res) => {
    const habitId = req.params.id;
    if (!habitId) {
        return res.status(400).json({ message: 'Habit Inexistente' });
    }

    try {
        const habit = await Habit.findById(habitId).exec();
        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        const updatedHabit = await Habit.findByIdAndUpdate(
            habitId,
            { estado_inicial: !habit.estado_inicial },
            { new: true }
        );

        return res.status(200).json({ message: 'Habit actualizado', habit: updatedHabit });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const editHabit = async(req, res) => {
    const habitId = req.params.id;
    const data = req.body;

    if (!habitId) {
        return res.status(400).json({message: 'Habito Inexistente'});
    }

    try {
        const updatedHabit = await Habit.findByIdAndUpdate(
            habitId,
            data,
            {new: true}
        );

        return res.status(200).json({message: 'Habito actualizado', habit: updatedHabit});
    }catch (error) {
        return res.status(500).json({message: error.message});
    }
}

deleteHabit = async (req, res) => {
    const habitId = req.params.id;
    if (!habitId) {
        return res.status(400).json({ message: 'Habit Inexistente' });
    }

    try {
        await Habit.findByIdAndDelete(habitId).exec();
        return res.status(200).json({message: 'Habit eliminado'});
    }catch (error) {
        return res.status(500).json({message: error.message});
    }
}

module.exports = {
    addHabit,
    getHabits,
    toggleHabit,
    editHabit,
    one,
    deleteHabit
};