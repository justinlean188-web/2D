const fs=require('fs');
const s=fs.readFileSync('src/components/PlayerView.tsx','utf8');
let i=s.indexOf('isBalloonPopProject');
while(i>=0){
  console.log('at',i);
  i=s.indexOf('isBalloonPopProject',i+1);
}