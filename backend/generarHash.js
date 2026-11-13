const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Escribe la contraseña del administrador: ', async (password) => {
  if (!password || password.length < 8) {
    console.log('La contraseña debe tener al menos 8 caracteres.');
    rl.close();
    return;
  }

  const hash = await bcrypt.hash(password, 8);

  console.log('\nHash generado:\n');
  console.log(hash);

  rl.close();
});