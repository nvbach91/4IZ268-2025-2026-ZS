cd /d "%~dp0"
call npx htmlhint --config .htmlhintrc --nocolor ./submissions/**/*.html > htmlhint-validation-errors.txt