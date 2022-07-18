const { spawn } = require('child_process');
const fs  = require('fs');

const GITPATH = process.argv[2];

function getRawCommitsAndParents(){
    console.log(GITPATH)
    return new Promise((resolve, reject) => {
        let buffer = "";
        let git = spawn('git', [`--git-dir=${GITPATH}`, 'rev-list', '--all', '--parents']);
        git.stdout.on('data', (data) => {
            buffer += data;
        });
          
        git.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        
        git.on('close', (code) => {
            if (code != 0){
                return reject(`git had an error trying to resolve rev-list with ${code}`)
            }
            resolve(buffer);
        });
    })
}

function getRawDataFromCommit(id){
    return new Promise((resolve, reject) => {
        let buffer = "";
        let git = spawn('git', [`--git-dir=${GITPATH}`, 'log', '--numstat','--pretty=format:%an%n%ae%n%ai%n%s','-1', id])
        git.stdout.on('data', (data) => {
            buffer += data;
        });

        git.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        
        git.on('close', (code) => {
            if (code != 0){
                return reject(`git had an error trying to resolve log with ${code}`)
            }
            resolve(buffer);
        });
    })
}

function getCommitNodes(){
    const nodes = [];
    return new Promise(async(resolve, reject) => {
        let response = await getRawCommitsAndParents();
        let linesIds = response.split(/\r?\n/);
        for(let line of linesIds){
            if(line !== ''){
                ids = line.split(' ');
                let id = ids[0];
                let parents = ids.slice(1);
                let branch = await getCommitBranch(id);
                branch = branch.split('~')[0];
                let response = await getRawDataFromCommit(id);
                let linesExtraData = response.split(/\r?\n/);
                let author = linesExtraData[0];
                let email = linesExtraData[1];
                let dateRaw = linesExtraData[2].split(' ');
                let date = {
                    yyyymmdd: dateRaw[0],
                    time: dateRaw[1],
                    timeZone: dateRaw[2]
                }
                let message = linesExtraData[3];
                let filesRaw = linesExtraData.slice(4, linesExtraData.length - 1);
                let files = [];
                filesRaw.forEach( fileRaw => {
                                let file = fileRaw.split(/\t/)
                                let fileObj = {
                                    insert: file[0],
                                    delet: file[1],
                                    full: file[2]
                                }
                                files.push(fileObj);
                            });
                let node = {
                    id,
                    parents,
                    branch,
                    author,
                    email,
                    date,
                    message,
                    files
                }
                nodes.push(node)
            }
        }
        resolve(nodes);
    })
}

function getRawAuthors(){
    return new Promise((resolve, reject) => {
        let buffer = "";
        let git = spawn('git', [`--git-dir=${GITPATH}`, 'shortlog', '-s', '--all'])
        git.stdout.on('data', (data) => {
            buffer += data;
        });

        git.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        
        git.on('close', (code) => {
            if (code != 0){
                return reject(`git had an error trying to resolve authors with ${code}`)
            }
            resolve(buffer);
        });
    })
}

function getAuthors(){
    const authors = []
    return new Promise(async(resolve, reject) => {
        let response = await getRawAuthors();
        let linesAuthors = response.split(/\r?\n/);
        
        linesAuthors.forEach(line => {
            if(line !== ''){
                let lineTrimmed = line.trim();
                let author = lineTrimmed.split(/\t/)
                let newObj = {
                    author: author[1],
                    commits: author[0]
                };
                authors.push(newObj);
            }       
        })
        resolve(authors);
    })
}

function getRawBranhches(){
    return new Promise((resolve, reject) => {
        let buffer = "";
        let git = spawn('git', [`--git-dir=${GITPATH}`, 'branch', '-v', '--all'])
        git.stdout.on('data', (data) => {
            buffer += data;
        });

        git.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        
        git.on('close', (code) => {
            if (code != 0){
                return reject(`git had an error trying to resolve authors with ${code}`)
            }
            resolve(buffer);
        });
    })
}

function getCommitBranch(id){
    return new Promise((resolve, reject) => {
        let buffer = "";
        let git = spawn('git', [`--git-dir=${GITPATH}`, 'name-rev', '--name-only', id])
        git.stdout.on('data', (data) => {
            buffer += data;
        });

        git.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        
        git.on('close', (code) => {
            if (code != 0){
                return reject(`git had an error trying to resolve branches with ${code}`)
            }
            resolve(buffer);
        });
    })
}

async function run(){
    const nodes = await getCommitNodes();
    //recreateDirectory(nodes);
    const authors = await getAuthors();
    const jsonObj = {
        nodes,
        authors,
    };

    let jsonContent = JSON.stringify(jsonObj);
    fs.writeFile("output.json", jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
        
        console.log("JSON file has been saved.");
    });
}

run()