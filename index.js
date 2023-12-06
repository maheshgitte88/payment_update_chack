const express = require('express');
const app = express();
const GreaquestRoutes = require('./Routes/Greaquest');
const IciciRoutes = require('./Routes/IciciBank');
const Propelled =require('./Routes/Propelled')

const sequelize = require('./config');

app.use(express.json());

sequelize.sync().then(() => {
  console.log('Database synced.');
});

app.use('/api', GreaquestRoutes);
app.use('/api', IciciRoutes);
app.use('/api', Propelled);



const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
