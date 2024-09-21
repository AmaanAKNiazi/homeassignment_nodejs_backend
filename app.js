const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const nodeRoutes = require('./routes/nodeRoutes');
const edgeRoutes = require('./routes/edgeRoutes');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use('/api', nodeRoutes);
app.use('/api', edgeRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
