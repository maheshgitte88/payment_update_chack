const express = require('express');
const cors = require('cors');
const app = express();
const GreaquestRoutes = require('./Routes/Greaquest');
const IciciRoutes = require('./Routes/IciciBank');
const Propelled =require('./Routes/Propelled')

const sequelize = require('./config');
const LoanFeeOnlyTranstions = require('./Models/LoanFeeOnlyTranstions');
const FeeFromLoanTracker = require('./Models/FeeFromLoanTracker');

app.use(express.json());
app.use(cors());

sequelize.sync().then(() => {
  console.log('Database synced.');
});

app.use('/api', GreaquestRoutes);
app.use('/api', IciciRoutes);
app.use('/api', Propelled);

app.get('/api/loanFeeTransactions', async (req, res) => {
  try {
    const transactions = await LoanFeeOnlyTranstions.findAll();
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/FeeFromLoanTracker', async (req, res) => {
  try {
    console.log("api hit")
    const transactions = await FeeFromLoanTracker.findAll();
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
