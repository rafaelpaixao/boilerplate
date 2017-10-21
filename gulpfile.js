//////////IMPORTS

//O gulp é um automatizador de tarefas
var gulp = require('gulp');

//Permite recarregar a página sempre que houverem alterações no código
var browserSync = require('browser-sync');

//Plugin para SASS
var sass = require('gulp-sass');

//Plugin para CSS
var cssnano = require('gulp-cssnano');

//Plugins para Javascript
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');

//Plugin auxiliar para deletar a pasta public antes de gerar novos arquivos
var del = require('del');

//Plugin auxiliar para executar tarefas na sequência definida
var runSequence = require('run-sequence');


///////////////DESENVOLVIMENTO

//Tarefa que recarrega a página
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'source'
    },
  })
})

//Tarefa que compila o arquivo de estilo
gulp.task('sass', function(){
  return gulp.src('source/scss/[^_]*.scss')
    .pipe(sass().on('error', sass.logError)) //Exibe erros de compilação no terminal
    .pipe(gulp.dest('source/css'))
    .pipe(browserSync.reload({ //Força o recarregamento os arquivos de CSS ao recarregar a página
      stream: true
    }))
});

///////////////OTIMIZAÇÃO

//Converte as tags script dos arquivos html em uma tag só, unifica e minifica os arquivos
gulp.task('useref', function(){
  return gulp.src('source/*.html')
    .pipe(useref())
    //.pipe(gulpIf('*.js', uglify().on('error', function(e){console.log(e);})))//Minifica o arquivo de saída
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('public'))
});

//Deleta a pasta public
gulp.task('clean:public', function() {
  return del.sync('public');
})

//Sequencia as tarefas do watcher
gulp.task('default', function (callback) { //Com o nome default, basta executar gulp
  runSequence(['sass','browserSync', 'watch'], //Executa em paralelo
    callback
  )
})

//Sequencia as tarefas de build
gulp.task('build', function(callback) {
  runSequence('clean:public', //Executada primeiro
    'sass',
    'useref',
    callback
  );
});

//Watchers que executam as tarefas definidas acima sempre que os arquivos são alterados
gulp.task('watch',['browserSync', 'sass'], function(){
  gulp.watch('source/scss/**/*.scss', ['sass']);
  gulp.watch('source/*.html', browserSync.reload); //Recarrega a página se houverem alterações no html
  gulp.watch('source/js/**/*.js', browserSync.reload); //Recarrega a página se houverem alterações no script
})

//Tarefas que devem ser executadas para construir a versão de produção
gulp.task('build', [`clean:public`, `sass`, `useref`], function (){
  console.log('Construindo...');
})