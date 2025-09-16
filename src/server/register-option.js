const { generateRegistrationOptions } = require('@simplewebauthn/server');

function makeRegistrationOptions(user) {
  return generateRegistrationOptions({
    rpName: "MonApp (local)",
    rpID: "http://localhost:3000/", // ou domaine https://concorde-cartulaire.vercel.app/
    userID: String(user.id),
    userName: user.email || user.username,
    timeout: 60000,
    attestationType: 'none',     // plus simple pour dev
    // Important : préférer l'authenticator "platform"
    authenticatorSelection: {
      authenticatorAttachment: 'platform', // FORCE Windows Hello
      userVerification: 'required',        // ou 'preferred'
      residentKey: 'discouraged'           // évite comportements exigeant clé hardware
    },
    // ne mettez pas excludeCredentials stricts qui bloqueraient platform
    // autres options...
  });
}

module.exports = { makeRegistrationOptions };
