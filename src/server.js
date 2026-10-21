const app = require('./app');

const port = Number(process.env.PORT || 3000);

app.listen(port, (error) => {
  if (error) {
    console.error(`Impossibile avviare il server: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Mini Library in ascolto su http://localhost:${port}`);
});
