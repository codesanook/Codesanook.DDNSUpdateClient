//useful links
//https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html
//https://www.typescriptlang.org/docs/handbook/gulp.html
//https://jasmine.github.io/setup/nodejs.html
//https://www.npmjs.com/package/gulp-jasmine

const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const clean = require('gulp-clean');
const runSequence = require('run-sequence');
const process = require("child_process");

const q = require("q");

var paths = {
    src: 'src/**/*.ts',
    dest: 'dist',
};

gulp.task('clean', () => {
    return gulp.src(paths.dest, {
            read: false
        })
        .pipe(clean());
});

gulp.task('compile', () => {
    return gulp.src(paths.src)
        .pipe(tsProject())
        .pipe(gulp.dest(paths.dest));
});

//test task depends on clean and compile tasks 
gulp.task('run', callback => {
    //start with clean, compile and test respectively 
    runSequence('clean', 'compile', () => {
        // exec('node dist/index.js', (error, stdout, stderr) => {
        //     console.log(stdout);
        //     console.log(stderr);
        //     done();
        // });
        runMainScript()
            .then(() => {
                done();
            })
            .catch(error => {
                console.error(error);
            })
            .done(() => {
                console.log("finally");
               callback(); 
            });
    });
});

function runMainScript() {
    let deferred = q.defer();
    let arguments = ['./dist/index.js'];
    let child = process.spawn('node', arguments);

    child.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
    });

    child.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });

    child.on('exit', code => {
        console.log(`Child exited with code ${code}`);
        if (code === 0) {
            deferred.resolve(code);
        } else {
            deferred.reject(`exist with error code ${code}`);
        }
    });

    return deferred.promise;
}

gulp.task('watch', ['compile'], () => {
    gulp.watch(paths.src, ['compile']);
});