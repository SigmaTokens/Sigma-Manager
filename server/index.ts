import express from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

const clientBuildPath = path.join(__dirname, '../client/dist');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
} else {

  app.get('*', (req, res) => {
    res.send("API is running in development mode. Use Vite for the client.");
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
