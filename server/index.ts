import express from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// Serve the client build folder statically.
app.use(express.static(path.join(__dirname, '../../client/dist')));

// For any route, send back index.html from the client build.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
