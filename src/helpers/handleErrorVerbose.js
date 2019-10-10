module.exports = err => {
  console.log(err.message);
  if (err.code) {
    console.log(`Exit code: ${err.code}`);
  }
  if (err.stderr) {
    console.log(err.stderr);
  }
  if (err.stdout) {
    console.log(err.stdout);
  }
};
