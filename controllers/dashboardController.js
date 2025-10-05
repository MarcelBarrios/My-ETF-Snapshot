const Etf = require('../models/Etf');
const apiService = require('../services/apiService');

module.exports = {
    getDashboard: async (req, res) => {
        try {
            // Get the list of ETF symbols the user is tracking from our database
            const userEtfs = await Etf.find({ user: req.user.id });

            // For each symbol, fetch the latest quote from the API
            const etfDataPromises = userEtfs.map(etf => apiService.fetchQuote(etf.symbol));
            const etfQuotes = await Promise.all(etfDataPromises);

            // Combine our DB data (like the ID for deletion) with the API data
            const displayData = userEtfs.map((etf, index) => {
                return {
                    _id: etf._id, // Needed for the delete functionality
                    symbol: etf.symbol,
                    quote: etfQuotes[index] // The live data from the API
                };
            });

            res.render('dashboard.ejs', {
                title: 'Dashboard',
                user: req.user,
                etfs: displayData, // Pass the combined data to the view
                messages: { error: req.flash('error'), info: req.flash('info') },
            });
        } catch (err) {
            console.error(err);
            req.flash('error', 'Could not load dashboard data.');
            res.redirect('/');
        }
    },

    addEtf: async (req, res) => {
        const symbol = req.body.symbol.toUpperCase();
        try {
            // 1. Check if the user is already tracking this ETF
            const existingEtf = await Etf.findOne({ symbol: symbol, user: req.user.id });
            if (existingEtf) {
                req.flash('error', `You are already tracking ${symbol}.`);
                return res.redirect('/dashboard');
            }

            // 2. Validate the symbol with the API
            const quote = await apiService.fetchQuote(symbol);
            if (!quote) {
                req.flash('error', `Symbol "${symbol}" not found or invalid.`);
                return res.redirect('/dashboard');
            }

            // 3. Save the new ETF to the database
            await Etf.create({
                symbol: symbol,
                user: req.user.id,
            });

            req.flash('info', `${symbol} added to your dashboard.`);
            res.redirect('/dashboard');
        } catch (err) {
            console.error(err);
            req.flash('error', 'Something went wrong. Please try again.');
            res.redirect('/dashboard');
        }
    },

    deleteEtf: async (req, res) => {
        try {
            await Etf.findOneAndDelete({ _id: req.params.id, user: req.user.id });
            req.flash('info', 'ETF removed successfully.');
            res.redirect('/dashboard');
        } catch (err) {
            console.error(err);
            req.flash('error', 'Could not remove ETF.');
            res.redirect('/dashboard');
        }
    },
};