import chalk from 'chalk';


export function createLoadingIndicator() {
  let indicator = ['◢', '◣', '◤', '◥'];
  let i = 0;
  let intervalId;

  return {
    start: () => {
      intervalId = setInterval(() => {
        i = ++i % indicator.length;
        process.stdout.write(`\r${chalk.yellow(`${indicator[i]} Fetching AI response...`)}`);
      }, 300);
    },
    stop: () => {
      clearInterval(intervalId);
      process.stdout.write('\r'); // Clear the line
    }
  };
}

export function generateFileName() {
        const now = new Date();
        
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        const formattedDate = `${year}_${month}_${day}_${hours}_${minutes}_${seconds}`;
        
        const fileName = `Tutorial_${formattedDate}.md`;
        
        return fileName;
    }