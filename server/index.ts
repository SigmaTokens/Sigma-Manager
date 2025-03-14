import express from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// Define the absolute path to your client build folder.
const clientBuildPath = path.join(__dirname, '../client/dist');

if (process.env.NODE_ENV === 'production') {
  // Serve static files from the client build directory.
  app.use(express.static(clientBuildPath));

  // For any other request, send back index.html.
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
} else {
  // In development, you can either serve a simple message,
  // or let the client be served by Vite's dev server.
  app.get('*', (req, res) => {
    res.send("API is running in development mode. Use Vite for the client.");
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
