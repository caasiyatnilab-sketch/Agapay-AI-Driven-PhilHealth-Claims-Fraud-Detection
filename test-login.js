(async () => {
   const email = process.env.TEST_EMAIL || 'patient@test.com';
   const password = process.env.TEST_PASSWORD || 'password123';
   try {
     const res = await fetch('http://localhost:3000/api/auth/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ email, password })
     });
     console.log(await res.text());
   } catch(e) {
     console.error(e);
   }
})();
