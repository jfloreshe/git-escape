const { exec, spawn } = require('child_process');
const fs  = require('fs');

const GITPATH = process.argv[2];

function gitRevList(){
    let git = spawn('git',['log']);
    return new Promise((resolve, reject) => {
        git.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            resolve(1);
        });
          
        git.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
            reject(new Error(`stderr: ${data}`))
        });
        
        git.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    })
}

async function run(){
    const response = await gitRevList();
}

run()
// function gitRevList(){
//     return new Promise((resolve, reject) => {
//         exec(`git --git-dir=${GITPATH} rev-list --all --parents > test.txt`, (err, stdout, sterr) =>{
//             if (err){
//                 reject(new Error(`error: ${err}`))
//             }
//             resolve(1);
//         });        
//     })
// }

// function gitExtraData(id){
//     return new Promise((resolve, reject) => {
//         exec(`git --git-dir=${GITPATH} `)
//     })
// }

// gitRevList()
//     .then((data) => {
//         if (data === 1){
//             let finalObject = {}
//             let key = 'nodes';
//             finalObject[key] = [];
//             let sizeKey = 'size';
//             finalObject[sizeKey] = 0; 
//             const allFileContents = fs.readFileSync('test.txt', 'utf-8');
//             allFileContents.split(/\r?\n/).forEach(line =>  {
//                 ids = line.split(' ');
//                 if(ids[0] === ""){
//                     return;
//                 }    
//                 console.log(ids);
//                 const newNode = {
//                     id: ids[0],
//                     parents: ids.slice(1)
//                 }
//                 finalObject[key].push(newNode);
//                 finalObject[sizeKey]++;
//             });         
//             const json = JSON.stringify(finalObject);
//             fs.writeFile("gitMetaData.json", json, function(err) {
//                 if(err){
//                     console.error(err);
//                 }
//             })
//         }
//     })
