const admin = require('firebase-admin');

const serviceAccount = {
  "type": "service_account",
  "project_id": "wordapp-c94ec",
  "private_key_id": "676721cd68c7c4e5856a11daae265ddcfc402249",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDIl9MzeSQKu2GD\nFw4MomrMxlipTBP1lrS055JxHWwttLlin5alU2kAgPO2YCkjjIZmZWoAqrzmEtDF\n3nGp+e4kQ5Spli26yBlVu1z9giWERjZzXK61CuecxYDxhmCZtAWEvQUHiSF87z5Y\n0UrbtH00UNQtU3dhhOZLsM9lAi6MFlIhXYlI6ZAg1TbdQmv3EgOmDglwVVSPsTBH\n3LRh+YilsbUssdk89FlBv2VA/9G9lS6moWnElQsCKXzN1jkcHe+x7dJgSYRI5JLu\nNw+Yxj0YCYStvoZHJeCgG2YXvzZo2w3fYw1YLY1MNT8cJ9/ypWVkgsiYoL3nyuVD\nvk3Y2UnZAgMBAAECggEAI+lyiVOVzUoQwhxdiouFXVXhR6X0KNKrVXvj7tZaqLAj\nRHHX0Y9mTA3KFAuRMekVor1jRe1LVlFmCRay+MBjDyD+O4JEe50ZVAzwL/6d4tmD\nJBIiwQzLvHhrhlINd1cQadxBS0EUur5GRjZqFX1xsO0Ln3XC+LWHWWO1LZs/ZBrF\nerOcV/k6SPEe297f+KQqTRSxdYGso5DTIYZNWohq4xWHNeaVgZgZrl44pA0wCF0f\nDH0/fxFrS0ZcoAe7r3S72yxYFY6rwwLMFEkC3d3xsgtzsZVPzrZ0PhDMINxxW0zq\nrldn0TyUtI3coNt5VeYDgOF2I6MhzyP9TOFsP3h0RQKBgQD2ZAxGk+OSrBg7lCcM\n4RdDyjkeeGIi2JTUqEPfSrGwBKFadHV3SU9Kg+NVShcSqMxJ+9ezYyM+m53TixmV\nqTvRSiy4W8nl1bpZdB9voH7/HMQFBG2csD7l1T7FTGayjGQqZLNF0s2vngD/O1tq\nmXaMiuDPpO8JwL02FSrswkBZrwKBgQDQaojw8HeYTONjE+siLaZgnUFpNTFD+O2Q\nLWNQQv0bjuxj+7nU9GrAchAv8eUDeJo2vHRmtprrQk/hPTsQFJhXtBgLP5bTwphR\n+kaY8mQu8tig6ZgZQ1Sev9erxtEaVEmMrazfv2dfdK1nxN5NTYCX5docn57SGpPW\np60UORPe9wKBgQDlfszcVFWtQTSVEerJmUMlNk+7rN+jm14NMel+K0GUNMvhyAW9\npQAA5RWzVH5nN+iIpNYF1bp3T1VTPAYJm4cG6vL6iSxmMowPVBUP0UtY7f86uSQr\nxRHg255LAV3Kwu9teTxuNeq1wBMnqK7+fJCqWZUKc5Le37KdlFvWCR0NKwKBgQCW\naEvrlZ65isOO/RDz2X34u4Q5KOok48CODDNf+PgwqzRt83xo8vsXZznHYAqmNqMU\nXWyjs6SZo4GCS24UbMiEgrPXakyvBgBnKPdJ6aPjPd6YQfxCPxUSe+BpV1IQbkOm\nArB/yOIRQWLjQHAt2YC0Hm0Juygi+Is4nkmKDqcIgQKBgAzVVajmQDPulBo1jhNi\nElBuhyqMISTaRfxC9wzn/14n2c+bUE2F8sZqJIr3/ug+Tt7mfK3konWHntzPV68y\nIro+4n/7vIgB8F4jOdDTgs1AdMtf9cUjp3RtG3GbsS8efFvZ2PJS+3ne7Q62yMVr\nUbpB5mJnVK/cbQnLHaGDqy+R\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@wordapp-c94ec.iam.gserviceaccount.com",
  "client_id": "115687655656674913359",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40wordapp-c94ec.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const adminWords = [
  { word: "example1", definition: "This is an example word 1." },
  { word: "example2", definition: "This is an example word 2." },
  // Add more words as needed
];

adminWords.forEach(async (wordObj) => {
  try {
    await db.collection('admin_words').add(wordObj);
    console.log(`Added word: ${wordObj.word}`);
  } catch (error) {
    console.error(`Error adding word: ${wordObj.word}`, error);
  }
}); 