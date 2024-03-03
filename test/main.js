// JavaScript (Fetch)

// CommonJs
// Untuk CommonJs, bisa juga tidak menggunakan require (module "node-fetch"), karena fungsi "fetch" sudah bawaan CommonJs
const fetch = require('node-fetch');

// ESM
// Jika anda menggunakan type CJS maka hapus code bagian ini!
import fetch from 'node-fetch';

fetch('/api/data')
  .then(response => response.json())
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error('Error:', error);
  });

// JavaScript (Axios)

// CommonJs
// Jika anda menggunakan type ESM maka hapus code bagian ini!
const axios = require('axios');

// ESM
// Jika anda menggunakan type CJS maka hapus code bagian ini!
import axios from 'axios';

axios.get('/api/data')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error);
  });